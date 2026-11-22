// AAA Radar Minimap & Full HUD System for Solis City: Coral Coast
// Handles: Circular Canvas Radar, GPS Waypoint Route, Wanted Stars, Speedometer, Cash & Vitals.

function createHUD(radarCanvas) {
  const ctx = radarCanvas.getContext('2d');
  const radarW = radarCanvas.width;
  const radarH = radarCanvas.height;
  const radarRadius = radarW / 2;

  const hud = {
    radarCanvas: radarCanvas,
    ctx: ctx
  };

  // Render Minimap Radar Canvas
  hud.renderRadar = function (player, policeSystem, currentMission) {
    ctx.clearRect(0, 0, radarW, radarH);

    // 1. Circular Clip
    ctx.save();
    ctx.beginPath();
    ctx.arc(radarRadius, radarRadius, radarRadius - 4, 0, Math.PI * 2);
    ctx.clip();

    // Dark Background & Grid
    ctx.fillStyle = '#0a0d18';
    ctx.fillRect(0, 0, radarW, radarH);

    ctx.strokeStyle = 'rgba(0, 180, 255, 0.08)';
    ctx.lineWidth = 1;
    for (let x = 0; x < radarW; x += 20) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, radarH);
      ctx.stroke();
    }
    for (let y = 0; y < radarH; y += 20) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(radarW, y);
      ctx.stroke();
    }

    // Map World coordinate conversion to Radar Canvas
    // Center of radar is player position
    const scale = 0.45; // pixels per world unit
    const pX = player.position.x;
    const pZ = player.position.z;
    const heading = player.rotation; // Player facing angle

    ctx.save();
    ctx.translate(radarRadius, radarRadius);
    ctx.rotate(-heading); // Orient radar to player heading

    // 2. Draw Ocean on West side (x < -120)
    const oceanX = (-275 - pX) * scale;
    const oceanZ = (0 - pZ) * scale;
    ctx.fillStyle = '#07243d';
    ctx.fillRect(oceanX - (175 * scale), oceanZ - (300 * scale), 350 * scale, 600 * scale);

    // 3. Draw Road Grid
    const roads = [
      { x: -80, z: 0, w: 18, l: 560 },
      { x: 0, z: 0, w: 22, l: 560 },
      { x: 80, z: 0, w: 20, l: 560 },
      { x: 160, z: 0, w: 16, l: 560 },
      { x: 40, z: -200, w: 260, l: 16 },
      { x: 40, z: -100, w: 260, l: 16 },
      { x: 40, z: 0, w: 260, l: 18 },
      { x: 40, z: 100, w: 260, l: 16 },
      { x: 40, z: 200, w: 260, l: 16 }
    ];

    ctx.fillStyle = '#1c2230';
    roads.forEach(r => {
      const rx = (r.x - pX) * scale;
      const rz = (r.z - pZ) * scale;
      const rw = r.w * scale;
      const rl = r.l * scale;
      ctx.fillRect(rx - rw / 2, rz - rl / 2, rw, rl);
    });

    // 4. Draw GPS Line to Mission Objective
    if (currentMission && currentMission.targetPos) {
      const mx = (currentMission.targetPos.x - pX) * scale;
      const mz = (currentMission.targetPos.z - pZ) * scale;

      ctx.strokeStyle = '#ffaa00';
      ctx.lineWidth = 3;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(mx, mz);
      ctx.stroke();
      ctx.setLineDash([]);

      // Objective Diamond Marker
      ctx.fillStyle = '#ffcc00';
      ctx.beginPath();
      ctx.moveTo(mx, mz - 7);
      ctx.lineTo(mx + 6, mz);
      ctx.lineTo(mx, mz + 7);
      ctx.lineTo(mx - 6, mz);
      ctx.closePath();
      ctx.fill();
    }

    // 5. Draw Police Cruisers (Pulsing Red / Blue Blips)
    const isRedSiren = Math.sin(performance.now() / 80) > 0;
    policeSystem.activeCruisers.forEach(c => {
      const cx = (c.position.x - pX) * scale;
      const cz = (c.position.z - pZ) * scale;
      ctx.fillStyle = isRedSiren ? '#ff1133' : '#0066ff';
      ctx.beginPath();
      ctx.arc(cx, cz, 4.5, 0, Math.PI * 2);
      ctx.fill();
    });

    // 6. Draw Police Helicopter (Flashing Star Blip)
    if (policeSystem.helicopter) {
      const hx = (policeSystem.helicopter.position.x - pX) * scale;
      const hz = (policeSystem.helicopter.position.z - pZ) * scale;
      ctx.fillStyle = '#ff0055';
      ctx.beginPath();
      ctx.arc(hx, hz, 6.0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    ctx.restore(); // Restore radar rotation

    // 7. Draw Player Cursor in Center of Radar (Pointing Up)
    ctx.fillStyle = '#00e5ff';
    ctx.shadowColor = '#00e5ff';
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.moveTo(radarRadius, radarRadius - 8);
    ctx.lineTo(radarRadius + 6, radarRadius + 7);
    ctx.lineTo(radarRadius, radarRadius + 4);
    ctx.lineTo(radarRadius - 6, radarRadius + 7);
    ctx.closePath();
    ctx.fill();
    ctx.shadowBlur = 0;

    ctx.restore(); // Restore circular clip
  };

  // Update DOM Elements
  hud.updateDOM = function (player, policeSystem, combatSystem, currentMission) {
    // Wanted Stars
    const starEls = document.querySelectorAll('.wanted-star');
    starEls.forEach((star, idx) => {
      if (idx < policeSystem.wantedLevel) {
        star.classList.add('active');
      } else {
        star.classList.remove('active');
      }
    });

    // Cash Display
    const cashEl = document.getElementById('hud-cash');
    if (cashEl) {
      cashEl.innerText = '$' + player.cash.toLocaleString();
    }

    // Weapon & Ammo
    const wep = combatSystem.getCurrentWeapon();
    const wepNameEl = document.getElementById('hud-weapon-name');
    const ammoEl = document.getElementById('hud-ammo');
    if (wepNameEl) wepNameEl.innerText = wep.name;
    if (ammoEl) ammoEl.innerText = `${wep.ammo} / ${wep.maxAmmo}`;

    // Health & Armour Bars
    const healthFill = document.getElementById('health-fill');
    const armourFill = document.getElementById('armour-fill');
    if (healthFill) healthFill.style.width = `${Math.max(0, (player.health / player.maxHealth) * 100)}%`;
    if (armourFill) armourFill.style.width = `${Math.max(0, (player.armour / player.maxArmour) * 100)}%`;

    // Speedometer & Vehicle HUD
    const speedVal = document.getElementById('speed-value');
    const gearDisplay = document.getElementById('gear-display');
    const carNameEl = document.getElementById('car-name');
    if (player.inVehicle && player.vehicle) {
      const uData = player.vehicle.userData;
      const kmh = Math.round(Math.abs(uData.speed) * 3.6);
      if (speedVal) speedVal.innerText = kmh;
      if (gearDisplay) gearDisplay.innerText = `GEAR ${uData.gear}`;
      if (carNameEl) carNameEl.innerText = uData.name.toUpperCase();
    } else {
      if (speedVal) speedVal.innerText = '0';
      if (gearDisplay) gearDisplay.innerText = 'ON FOOT';
      if (carNameEl) carNameEl.innerText = 'PEDESTRIAN';
    }

    // Mission Tracker
    if (currentMission) {
      const tagEl = document.getElementById('mission-tag');
      const nameEl = document.getElementById('mission-name');
      const objEl = document.getElementById('mission-objective');
      if (tagEl) tagEl.innerText = currentMission.tag;
      if (nameEl) nameEl.innerText = currentMission.name;
      if (objEl) objEl.innerText = currentMission.objective;
    }
  };

  return hud;
}

window.createHUD = createHUD;
