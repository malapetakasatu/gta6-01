// AAA HUD, Radar Minimap & Vector GPS Route Renderer for SOLIS CITY: CORAL COAST
// Features: Dynamic 2D canvas radar, live GPS polyline, wanted stars glow,
// digital speedometer with RPM/nitro gauges, and tactical dispatch ticker.

export class HUD {
  constructor() {
    this.radarCanvas = document.getElementById('radar-canvas');
    this.radarCtx = this.radarCanvas ? this.radarCanvas.getContext('2d') : null;

    // Cache HUD DOM Elements
    this.speedValEl = document.getElementById('speedo-val');
    this.speedGearEl = document.getElementById('speedo-gear');
    this.rpmFillEl = document.getElementById('rpm-fill');
    this.nitroFillEl = document.getElementById('nitro-fill');
    this.weaponNameEl = document.getElementById('weapon-name');
    this.ammoCountEl = document.getElementById('ammo-count');
    this.hpFillEl = document.getElementById('hp-fill');
    this.armorFillEl = document.getElementById('armor-fill');
    this.specialFillEl = document.getElementById('special-fill');
    this.districtEl = document.getElementById('hud-district');
    this.radarTagEl = document.getElementById('radar-district-tag');
    this.missionTitleEl = document.getElementById('mission-title');
    this.missionObjEl = document.getElementById('mission-objective');
    this.missionDistEl = document.getElementById('mission-dist');
    this.stars = document.querySelectorAll('#wanted-stars .star');
  }

  update(player, vehicle, combat, police, missions, city) {
    // 1. Speedometer & Gauges Update
    let speedKm = 0;
    let rpm = 0;
    let gear = "N";
    let nitro = 100;

    if (player.inVehicle && vehicle) {
      speedKm = Math.round(Math.abs(vehicle.speed) * 3.6);
      nitro = vehicle.nitroFuel;
      rpm = (speedKm % 48) / 48;
      if (vehicle.speed < -0.1) gear = "R";
      else if (speedKm < 1) gear = "1";
      else if (speedKm < 45) gear = "2";
      else if (speedKm < 90) gear = "3";
      else if (speedKm < 145) gear = "4";
      else if (speedKm < 200) gear = "5";
      else gear = "6";
    }

    if (this.speedValEl) this.speedValEl.innerText = speedKm.toString().padStart(3, '0');
    if (this.speedGearEl) this.speedGearEl.innerText = gear;
    if (this.rpmFillEl) this.rpmFillEl.style.width = `${Math.min(100, rpm * 100)}%`;
    if (this.nitroFillEl) this.nitroFillEl.style.width = `${nitro}%`;

    // 2. Health & Status Bars
    if (this.hpFillEl) this.hpFillEl.style.width = `${player.health}%`;
    if (this.armorFillEl) this.armorFillEl.style.width = `${player.armor}%`;

    // 3. Weapon & Ammo
    const wp = combat.getCurrentWeapon();
    if (this.weaponNameEl) this.weaponNameEl.innerText = wp.name;
    if (this.ammoCountEl) this.ammoCountEl.innerText = `${combat.currentMag} / ${wp.reserve}`;

    // 4. Wanted Level Stars
    this.stars.forEach((star, idx) => {
      if (idx < police.wantedLevel) {
        star.classList.add('active');
      } else {
        star.classList.remove('active');
      }
    });

    // 5. District Telemetry
    const currentDistrict = city.getDistrict(player.position.x, player.position.z);
    if (this.districtEl) this.districtEl.innerText = currentDistrict;
    if (this.radarTagEl) this.radarTagEl.innerText = currentDistrict.toUpperCase();

    // 6. Mission Tracker
    const curMission = missions.getCurrentMission();
    if (curMission) {
      if (this.missionTitleEl) this.missionTitleEl.innerText = curMission.title;
      if (this.missionObjEl) this.missionObjEl.innerText = curMission.desc;
      const dx = player.position.x - curMission.waypoint.x;
      const dz = player.position.z - curMission.waypoint.z;
      const dist = Math.round(Math.sqrt(dx * dx + dz * dz));
      if (this.missionDistEl) this.missionDistEl.innerText = `TARGET: ${dist}m`;
    }

    // 7. Radar Minimap 2D Render
    this.renderRadar(player, police, curMission);
  }

  renderRadar(player, police, curMission) {
    if (!this.radarCtx) return;
    const ctx = this.radarCtx;
    const w = this.radarCanvas.width;
    const h = this.radarCanvas.height;
    const cx = w / 2;
    const cy = h / 2;
    const scale = 0.42; // Map scale factor

    ctx.clearRect(0, 0, w, h);

    // Save context for player rotation
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(-player.rotation);

    // Draw Ocean Coastline on the West
    const oceanScreenX = (-450 - player.position.x) * scale;
    ctx.fillStyle = 'rgba(0, 100, 200, 0.45)';
    ctx.fillRect(oceanScreenX - 500, -500, 500, 1000);

    // Draw Major City Road Grid
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.22)';
    ctx.lineWidth = 4;

    const nsRoads = [-300, -180, -60, 60, 180, 300];
    nsRoads.forEach(rx => {
      const sx = (rx - player.position.x) * scale;
      ctx.beginPath();
      ctx.moveTo(sx, -400);
      ctx.lineTo(sx, 400);
      ctx.stroke();
    });

    const ewRoads = [-320, -160, 0, 160, 320];
    ewRoads.forEach(rz => {
      const sz = (rz - player.position.z) * scale;
      ctx.beginPath();
      ctx.moveTo(-400, sz);
      ctx.lineTo(400, sz);
      ctx.stroke();
    });

    // Draw Vector GPS Route Polyline to Active Waypoint
    if (curMission && curMission.waypoint) {
      const wx = (curMission.waypoint.x - player.position.x) * scale;
      const wz = (curMission.waypoint.z - player.position.z) * scale;

      ctx.strokeStyle = '#ffd200';
      ctx.lineWidth = 3;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      // Route via nearest road grid turn
      ctx.lineTo(0, wz);
      ctx.lineTo(wx, wz);
      ctx.stroke();
      ctx.setLineDash([]);

      // Gold Waypoint Diamond
      ctx.fillStyle = '#ffd200';
      ctx.beginPath();
      ctx.moveTo(wx, wz - 6);
      ctx.lineTo(wx + 6, wz);
      ctx.lineTo(wx, wz + 6);
      ctx.lineTo(wx - 6, wz);
      ctx.closePath();
      ctx.fill();
    }

    // Draw Police Cruisers (Flashing Red / Blue Blips)
    police.cruisers.forEach((cruiser, idx) => {
      if (!cruiser.mesh.visible) return;
      const px = (cruiser.position.x - player.position.x) * scale;
      const pz = (cruiser.position.z - player.position.z) * scale;

      ctx.fillStyle = (Date.now() + idx * 200) % 400 > 200 ? '#ff0033' : '#0066ff';
      ctx.beginPath();
      ctx.arc(px, pz, 4, 0, Math.PI * 2);
      ctx.fill();
    });

    // Draw Police Helicopter (Red Chevron)
    if (police.helicopter && police.helicopter.mesh.visible) {
      const hx = (police.helicopter.position.x - player.position.x) * scale;
      const hz = (police.helicopter.position.z - player.position.z) * scale;
      ctx.fillStyle = '#ff0055';
      ctx.beginPath();
      ctx.moveTo(hx, hz - 5);
      ctx.lineTo(hx + 5, hz + 5);
      ctx.lineTo(hx, hz + 2);
      ctx.lineTo(hx - 5, hz + 5);
      ctx.closePath();
      ctx.fill();
    }

    ctx.restore();

    // Center Player Arrow (Cyan Triangle)
    ctx.fillStyle = '#00f0ff';
    ctx.shadowColor = '#00f0ff';
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.moveTo(cx, cy - 7);
    ctx.lineTo(cx + 6, cy + 6);
    ctx.lineTo(cx, cy + 3);
    ctx.lineTo(cx - 6, cy + 6);
    ctx.closePath();
    ctx.fill();
    ctx.shadowBlur = 0;
  }
}
