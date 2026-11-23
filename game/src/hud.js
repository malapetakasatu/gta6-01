/**
 * Solis City: Coral Coast - Heads Up Display & Radar System
 * Cyberpunk Miami neon aesthetic with 2D radar, speedometer, wanted stars, and weapon status.
 */

export class HUD {
  constructor() {
    this.canvas = document.getElementById('minimap-canvas');
    this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
    this.speedValueEl = document.getElementById('speed-value');
    this.gearValueEl = document.getElementById('gear-value');
    this.starsContainer = document.getElementById('wanted-stars');
    this.weaponNameEl = document.getElementById('weapon-name');
    this.ammoEl = document.getElementById('weapon-ammo');
    this.objectiveTitleEl = document.getElementById('obj-title');
    this.objectiveDescEl = document.getElementById('obj-desc');
    this.objectiveDistEl = document.getElementById('obj-dist');
    this.hitmarkerEl = document.getElementById('hitmarker');
    this.healthBar = document.getElementById('health-bar');
    this.armorBar = document.getElementById('armor-bar');
    this.notificationToast = document.getElementById('hud-toast');

    this.radarSize = this.canvas ? this.canvas.width : 180;
    this.radarRadius = this.radarSize / 2;
    this.radarScale = 0.65; // world units to minimap pixels
    this.hitmarkerTimer = 0;
    this.strobeTick = 0;
  }

  showHitmarker() {
    if (this.hitmarkerEl) {
      this.hitmarkerEl.style.opacity = '1';
      this.hitmarkerTimer = 0.15;
    }
  }

  showToast(message, duration = 3000) {
    if (!this.notificationToast) return;
    this.notificationToast.textContent = message;
    this.notificationToast.style.opacity = '1';
    this.notificationToast.style.transform = 'translate(-50%, 0)';
    setTimeout(() => {
      if (this.notificationToast) {
        this.notificationToast.style.opacity = '0';
        this.notificationToast.style.transform = 'translate(-50%, -10px)';
      }
    }, duration);
  }

  update(dt, player, vehicle, policeManager, missionManager, combatSystem) {
    this.strobeTick += dt * 8;

    // Update Hitmarker timer
    if (this.hitmarkerTimer > 0) {
      this.hitmarkerTimer -= dt;
      if (this.hitmarkerTimer <= 0 && this.hitmarkerEl) {
        this.hitmarkerEl.style.opacity = '0';
      }
    }

    // Health and Armor
    if (this.healthBar && player) {
      this.healthBar.style.width = `${Math.max(0, Math.min(100, player.health))}%`;
    }
    if (this.armorBar && player) {
      this.armorBar.style.width = `${Math.max(0, Math.min(100, player.armor))}%`;
    }

    // Speedometer
    if (this.speedValueEl) {
      const speed = vehicle && vehicle.active ? Math.round(vehicle.speed * 2.237) : (player && player.isSprinting ? 18 : 10);
      this.speedValueEl.textContent = `${speed} MPH`;
      if (this.gearValueEl) {
        const gear = speed === 0 ? 'N' : (speed < 30 ? '1' : speed < 65 ? '2' : speed < 95 ? '3' : speed < 130 ? '4' : '5');
        this.gearValueEl.textContent = `GEAR ${gear}`;
      }
    }

    // Wanted Level Stars
    if (this.starsContainer && policeManager) {
      const stars = policeManager.wantedLevel;
      const starElements = this.starsContainer.children;
      const isPulsing = stars > 0 && Math.sin(this.strobeTick) > 0;
      for (let i = 0; i < starElements.length; i++) {
        if (i < stars) {
          starElements[i].className = isPulsing ? 'star active strobe' : 'star active';
        } else {
          starElements[i].className = 'star';
        }
      }
    }

    // Weapon & Ammo Info
    if (combatSystem) {
      const current = combatSystem.getCurrentWeapon();
      if (this.weaponNameEl && current) {
        this.weaponNameEl.textContent = current.name.toUpperCase();
      }
      if (this.ammoEl && current) {
        this.ammoEl.textContent = `${current.clip} / ${current.reserve}`;
      }
    }

    // Mission Objectives
    if (missionManager && missionManager.currentMission) {
      const m = missionManager.currentMission;
      if (this.objectiveTitleEl) this.objectiveTitleEl.textContent = m.title;
      if (this.objectiveDescEl) this.objectiveDescEl.textContent = m.objectiveText;
      if (this.objectiveDistEl && player) {
        const pPos = player.getPosition();
        const dist = Math.round(pPos.distanceTo(m.targetPosition));
        this.objectiveDistEl.textContent = `${dist}m to target`;
      }
    }

    // Draw Radar Minimap
    this.drawMinimap(player, vehicle, policeManager, missionManager);
  }

  drawMinimap(player, vehicle, policeManager, missionManager) {
    if (!this.ctx || !player) return;
    const ctx = this.ctx;
    const r = this.radarRadius;

    ctx.clearRect(0, 0, this.radarSize, this.radarSize);

    // Circular background with border
    ctx.save();
    ctx.beginPath();
    ctx.arc(r, r, r - 3, 0, Math.PI * 2);
    ctx.clip();

    ctx.fillStyle = 'rgba(8, 14, 28, 0.88)';
    ctx.fill();

    // Radar grid lines
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.15)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(r, r, r * 0.35, 0, Math.PI * 2);
    ctx.arc(r, r, r * 0.7, 0, Math.PI * 2);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(r, 0);
    ctx.lineTo(r, this.radarSize);
    ctx.moveTo(0, r);
    ctx.lineTo(this.radarSize, r);
    ctx.stroke();

    const pPos = player.getPosition();
    const pHeading = player.getHeading();

    // Transform world to minimap coords centered on player
    const toRadar = (worldX, worldZ) => {
      const dx = (worldX - pPos.x) * this.radarScale;
      const dz = (worldZ - pPos.z) * this.radarScale;
      // Rotate by player heading so forward is up
      const cos = Math.cos(-pHeading);
      const sin = Math.sin(-pHeading);
      const rx = dx * cos - dz * sin;
      const ry = dx * sin + dz * cos;
      return { x: r + rx, y: r + ry };
    };

    // Draw Mission Objective Blip
    if (missionManager && missionManager.currentMission) {
      const mPos = missionManager.currentMission.targetPosition;
      const pt = toRadar(mPos.x, mPos.z);
      ctx.fillStyle = '#ffb700';
      ctx.shadowColor = '#ffb700';
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    // Draw Police Blips
    if (policeManager && policeManager.units) {
      policeManager.units.forEach(unit => {
        if (!unit.active) return;
        const pt = toRadar(unit.mesh.position.x, unit.mesh.position.z);
        // Distance check from radar center
        const dist = Math.hypot(pt.x - r, pt.y - r);
        if (dist < r - 5) {
          ctx.fillStyle = Math.sin(this.strobeTick * 1.5) > 0 ? '#ff1144' : '#0088ff';
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, 4, 0, Math.PI * 2);
          ctx.fill();
        }
      });
    }

    // Player Arrow at center
    ctx.save();
    ctx.translate(r, r);
    ctx.fillStyle = '#00f0ff';
    ctx.shadowColor = '#00f0ff';
    ctx.shadowBlur = 6;
    ctx.beginPath();
    ctx.moveTo(0, -7);
    ctx.lineTo(5, 5);
    ctx.lineTo(0, 3);
    ctx.lineTo(-5, 5);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    ctx.restore(); // end clip

    // Radar circular neon outer ring
    ctx.strokeStyle = '#00f0ff';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(r, r, r - 2, 0, Math.PI * 2);
    ctx.stroke();
  }
}
