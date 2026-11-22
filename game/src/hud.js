// SOLIS CITY: CORAL COAST - Dynamic HUD & Radar GPS Canvas
// High-fidelity vector radar minimap, GPS navigation route overlay,
// wanted stars animator, speedometer gauge, and vitals status renderer.

export class HUD {
  constructor(game) {
    this.game = game;

    // Radar Canvas
    this.canvas = document.getElementById('radar-canvas');
    this.ctx = this.canvas ? this.canvas.getContext('2d') : null;

    // DOM Elements Cache
    this.elMissionTitle = document.getElementById('hud-mission-title');
    this.elObjectiveText = document.getElementById('hud-objective-text');
    this.elDispatch = document.getElementById('hud-dispatch');
    this.elDispatchText = document.getElementById('hud-dispatch-text');
    this.elStarsContainer = document.getElementById('hud-stars');
    this.elWeaponName = document.getElementById('hud-weapon-name');
    this.elAmmoClip = document.getElementById('hud-ammo-clip');
    this.elAmmoReserve = document.getElementById('hud-ammo-reserve');
    this.elHealthBar = document.getElementById('hud-health-bar');
    this.elArmourBar = document.getElementById('hud-armour-bar');
    this.elSpeed = document.getElementById('hud-speed');
    this.elGear = document.getElementById('hud-gear');
    this.elNitroBar = document.getElementById('hud-nitro-bar');
    this.elDistrict = document.getElementById('hud-district');
  }

  update(dt, time) {
    this.updateVitals();
    this.updateWeapon();
    this.updateVehicle();
    this.updateMissions();
    this.updatePolice();
    this.renderRadar();
  }

  updateVitals() {
    if (!this.game.player) return;
    const p = this.game.player;

    if (this.elHealthBar) {
      const hpPercent = Math.max(0, Math.min(100, (p.health / p.maxHealth) * 100));
      this.elHealthBar.style.width = `${hpPercent}%`;
    }
    if (this.elArmourBar) {
      const armPercent = Math.max(0, Math.min(100, (p.armour / p.maxArmour) * 100));
      this.elArmourBar.style.width = `${armPercent}%`;
    }
  }

  updateWeapon() {
    if (!this.game.combat) return;
    const w = this.game.combat.getCurrentWeapon();

    if (this.elWeaponName) this.elWeaponName.textContent = w.name;
    if (this.elAmmoClip) this.elAmmoClip.textContent = w.mag === 1 ? '—' : w.currentMag;
    if (this.elAmmoReserve) this.elAmmoReserve.textContent = w.reserveAmmo;
  }

  updateVehicle() {
    if (!this.game.supercar) return;
    const car = this.game.supercar;

    if (this.elSpeed) this.elSpeed.textContent = car.getSpeedMph();
    if (this.elGear) this.elGear.textContent = `GEAR ${car.getGear()}`;
    if (this.elNitroBar) {
      const nitroPercent = (car.nitro / car.nitroMax) * 100;
      this.elNitroBar.style.width = `${nitroPercent}%`;
    }
  }

  updateMissions() {
    if (!this.game.missions) return;
    const m = this.game.missions.getCurrentMission();

    if (this.elMissionTitle && m) this.elMissionTitle.textContent = m.title;
    if (this.elObjectiveText && m) this.elObjectiveText.textContent = m.objective;
    if (this.elDistrict && m) this.elDistrict.textContent = m.district;
  }

  updatePolice() {
    if (!this.game.police) return;
    const wanted = this.game.police.wantedLevel;

    // Update wanted stars
    if (this.elStarsContainer) {
      const stars = this.elStarsContainer.children;
      for (let i = 0; i < stars.length; i++) {
        if (i < wanted) {
          stars[i].classList.add('active');
        } else {
          stars[i].classList.remove('active');
        }
      }
    }

    // Update police dispatch banner
    if (this.elDispatch) {
      if (wanted >= 2) {
        this.elDispatch.classList.add('active');
        if (this.elDispatchText) {
          if (wanted === 4) {
            this.elDispatchText.textContent = 'CPD TAC-COMM: CONDOR-1 AUTHORIZED FOR DEADLY FORCE';
          } else if (wanted === 3) {
            this.elDispatchText.textContent = 'CPD DISPATCH: TACTICAL ROADBLOCKS DEPLOYED ON EXPWY';
          } else {
            this.elDispatchText.textContent = 'CPD PATROL: 10-99 IN PURSUIT - SUSPECT SPEEDING';
          }
        }
      } else {
        this.elDispatch.classList.remove('active');
      }
    }
  }

  renderRadar() {
    if (!this.ctx || !this.game.player) return;

    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;
    const cx = w / 2;
    const cy = h / 2;
    const scale = 0.55; // World units to radar pixels

    const pPos = this.game.player.position;
    const pHeading = this.game.player.heading;

    // Clear background
    ctx.fillStyle = '#060a14';
    ctx.fillRect(0, 0, w, h);

    // Save context for player-centric rotation
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(pHeading); // Orient radar forward

    // Draw ocean boundary
    ctx.fillStyle = '#0a2540';
    ctx.fillRect((-160 - pPos.x) * scale, (-500 - pPos.z) * scale, -200 * scale, 1000 * scale);

    // Draw Road Network Grid
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 9;

    // Main Avenues
    [-90, 0, 90, 180].forEach(rx => {
      ctx.beginPath();
      ctx.moveTo((rx - pPos.x) * scale, (-320 - pPos.z) * scale);
      ctx.lineTo((rx - pPos.x) * scale, (320 - pPos.z) * scale);
      ctx.stroke();
    });

    // Cross Streets
    [-240, -160, -80, 0, 80, 160, 240].forEach(rz => {
      ctx.beginPath();
      ctx.moveTo((-100 - pPos.x) * scale, (rz - pPos.z) * scale);
      ctx.lineTo((240 - pPos.x) * scale, (rz - pPos.z) * scale);
      ctx.stroke();
    });

    // Draw Vector GPS Route Line to current mission waypoint
    if (this.game.missions) {
      const targetWp = this.game.missions.getCurrentMission().waypoint;
      ctx.strokeStyle = '#ff2a6d';
      ctx.lineWidth = 3.5;
      ctx.setLineDash([6, 4]);

      ctx.beginPath();
      ctx.moveTo(0, 0); // from player center
      // Simple corner waypoint routing
      const midX = (targetWp.x - pPos.x) * scale;
      const midZ = 0;
      ctx.lineTo(midX, midZ);
      ctx.lineTo((targetWp.x - pPos.x) * scale, (targetWp.z - pPos.z) * scale);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Draw Mission Objective Blip
    if (this.game.missions) {
      const target = this.game.missions.getCurrentMission().waypoint;
      const mx = (target.x - pPos.x) * scale;
      const mz = (target.z - pPos.z) * scale;

      ctx.fillStyle = '#ffb700';
      ctx.shadowColor = '#ffb700';
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(mx, mz, 5.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    // Draw Police Cruisers (Flashing Red/Blue Blips)
    if (this.game.police && this.game.police.cruisers) {
      this.game.police.cruisers.forEach((c, idx) => {
        const px = (c.position.x - pPos.x) * scale;
        const pz = (c.position.z - pPos.z) * scale;

        ctx.fillStyle = (idx % 2 === 0) ? '#ff0033' : '#0088ff';
        ctx.beginPath();
        ctx.arc(px, pz, 4, 0, Math.PI * 2);
        ctx.fill();
      });
    }

    // Draw Police Helicopter
    if (this.game.police && this.game.police.helicopter && this.game.police.helicopter.active) {
      const hPos = this.game.police.helicopter.position;
      const hx = (hPos.x - pPos.x) * scale;
      const hz = (hPos.z - pPos.z) * scale;

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(hx, hz, 6, 0, Math.PI * 2);
      ctx.fill();

      // Rotor blade line on radar
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(hx - 8, hz);
      ctx.lineTo(hx + 8, hz);
      ctx.stroke();
    }

    ctx.restore();

    // Draw Player Arrow at Center (Fixed forward)
    ctx.fillStyle = '#05d9e8';
    ctx.shadowColor = '#05d9e8';
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.moveTo(cx, cy - 7);
    ctx.lineTo(cx + 5, cy + 6);
    ctx.lineTo(cx, cy + 3);
    ctx.lineTo(cx - 5, cy + 6);
    ctx.closePath();
    ctx.fill();
    ctx.shadowBlur = 0;

    // Radar Reticle / Range Ring
    ctx.strokeStyle = 'rgba(5, 217, 232, 0.2)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(cx, cy, 68, 0, Math.PI * 2);
    ctx.stroke();

    // North Compass Tick
    const northAngle = pHeading;
    const nx = cx + Math.sin(northAngle) * 72;
    const ny = cy - Math.cos(northAngle) * 72;
    ctx.fillStyle = '#ff2a6d';
    ctx.font = 'bold 9px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('N', nx, ny);
  }
}
