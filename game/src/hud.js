// SOLIS CITY: CORAL COAST (v2.1 AAA WebGL Engine) - Dynamic Radar Minimap & Vector GPS Route HUD
// Circular radar frame, rotating compass, player blip, police blips, vector navigation path.

export class HUD {
  constructor() {
    this.radarCanvas = document.getElementById('radar-canvas');
    if (this.radarCanvas) {
      this.ctx = this.radarCanvas.getContext('2d');
    }

    this.speedEl = document.getElementById('speed-number');
    this.gearEl = document.getElementById('gear-indicator');
    this.rpmBar = document.getElementById('rpm-bar');
    this.healthBar = document.getElementById('health-bar');
    this.armourBar = document.getElementById('armour-bar');
  }

  showNotification(text) {
    const box = document.getElementById('dispatch-box');
    const msg = document.getElementById('dispatch-text');
    if (box && msg) {
      msg.textContent = text;
      box.classList.add('active');
      setTimeout(() => box.classList.remove('active'), 4000);
    }
  }

  updateRadar(playerPos, playerRotY, targetPos, policeUnits = []) {
    if (!this.ctx) return;
    const ctx = this.ctx;
    const w = this.radarCanvas.width;
    const h = this.radarCanvas.height;
    const cx = w / 2;
    const cy = h / 2;
    const scale = 0.55; // World to radar zoom scale

    ctx.clearRect(0, 0, w, h);

    // Radar Base Background
    ctx.fillStyle = '#080d1a';
    ctx.beginPath();
    ctx.arc(cx, cy, cx - 2, 0, Math.PI * 2);
    ctx.fill();

    // Concentric Range Rings
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.15)';
    ctx.lineWidth = 1;
    [30, 60, 90].forEach(r => {
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.stroke();
    });

    // Vector GPS Path to Mission Target
    if (targetPos) {
      const tx = cx + (targetPos.x - playerPos.x) * scale;
      const ty = cy + (targetPos.z - playerPos.z) * scale;

      ctx.strokeStyle = '#00f0ff';
      ctx.lineWidth = 3;
      ctx.setLineDash([6, 4]);
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(tx, ty);
      ctx.stroke();
      ctx.setLineDash([]);

      // Pulsing Gold Mission Target Blip
      ctx.fillStyle = '#ffcc00';
      ctx.beginPath();
      ctx.arc(tx, ty, 5, 0, Math.PI * 2);
      ctx.fill();
    }

    // CPD Police Unit Blips (Flashing Red/Blue)
    policeUnits.forEach(cop => {
      const px = cx + (cop.pos.x - playerPos.x) * scale;
      const py = cy + (cop.pos.z - playerPos.z) * scale;
      if (Math.hypot(px - cx, py - cy) < cx - 6) {
        ctx.fillStyle = Math.random() > 0.5 ? '#ff2222' : '#0066ff';
        ctx.beginPath();
        ctx.arc(px, py, 4, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    // Player Blip (Neon Cyan Arrow)
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(-playerRotY + Math.PI);
    ctx.fillStyle = '#00f0ff';
    ctx.beginPath();
    ctx.moveTo(0, -7);
    ctx.lineTo(5, 6);
    ctx.lineTo(0, 3);
    ctx.lineTo(-5, 6);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  updateStats(car, player) {
    if (car) {
      const speedMPH = Math.round(Math.abs(car.speed) * 60);
      if (this.speedEl) this.speedEl.textContent = speedMPH;
      if (this.gearEl) this.gearEl.textContent = `GEAR ${car.gear}`;
      if (this.rpmBar) this.rpmBar.style.width = `${car.rpm * 100}%`;
    }

    if (player) {
      if (this.healthBar) this.healthBar.style.width = `${(player.health / player.maxHealth) * 100}%`;
      if (this.armourBar) this.armourBar.style.width = `${(player.armour / player.maxArmour) * 100}%`;
    }
  }
}
