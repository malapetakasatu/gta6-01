// SOLIS CITY: CORAL COAST (v2.1 AAA WebGL Engine) - Cinematic Screenshot Staging Engine
// Provides deterministic AAA scene composition for competition render passes:
// ?shot=chase  -> 4-Star Ocean Blvd Pursuit: Supercar drift, flanking CPD cruisers, roadblock, CONDOR-1 spotlight
// ?shot=combat -> Downtown Coral Bank Firefight: On-foot shootout, muzzle flash, glowing tracers, syndicate ambush
// ?shot=street -> Golden Hour Sunset Promenade: Coastal cruise, palm promenade, traffic, pedestrians, synthwave radio
// ?shot=title  -> Metropolis Skyline Vista: Twilight panorama of 44 skyscrapers, overlook supercar, AAA title UI

const THREE = window.THREE;

export function stageScene(engine, shotName) {
  const { scene, camera, city, vehicleManager, player, police, combat, missions, hud } = engine;
  engine.isPaused = true; // Freeze physics for clean deterministic capture

  // Staging Helper: Street Lamp with Warm Bulb and Dynamic Point Light
  const stageStreetLamp = (x, z) => {
    const poleMat = new THREE.MeshStandardMaterial({ color: 0x444d5c, metalness: 0.8, roughness: 0.3 });
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.16, 7.0, 8), poleMat);
    pole.position.set(x, 3.5, z);
    scene.add(pole);

    const arm = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.12, 0.12), poleMat);
    arm.position.set(x + 0.7, 6.9, z);
    scene.add(arm);

    const bulb = new THREE.Mesh(
      new THREE.SphereGeometry(0.35, 12, 8),
      new THREE.MeshBasicMaterial({ color: 0xffe89e })
    );
    bulb.position.set(x + 1.4, 6.7, z);
    scene.add(bulb);

    const lampLight = new THREE.PointLight(0xffdf88, 45, 24);
    lampLight.position.set(x + 1.4, 6.4, z);
    scene.add(lampLight);
  };

  // Staging Helper: Glowing Bullet Tracers & Beams
  const createBeam = (from, to, radius, color, opacity = 0.95) => {
    const dir = to.clone().sub(from);
    const len = dir.length();
    const geo = new THREE.CylinderGeometry(radius, radius, len, 8, 1, true);
    const mat = new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity,
      depthWrite: false
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.copy(from).addScaledVector(dir, 0.5);
    mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize());
    scene.add(mesh);
    return mesh;
  };

  // Staging Helper: Muzzle Flash
  const createMuzzleFlash = (pos, scale = 1.0, color = 0xffbf00) => {
    const group = new THREE.Group();
    const coreGeo = new THREE.SphereGeometry(0.25 * scale, 8, 8);
    const coreMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    group.add(new THREE.Mesh(coreGeo, coreMat));

    const outerGeo = new THREE.SphereGeometry(0.55 * scale, 8, 8);
    const outerMat = new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity: 0.88,
      depthWrite: false
    });
    group.add(new THREE.Mesh(outerGeo, outerMat));

    const pLight = new THREE.PointLight(color, 35 * scale, 18 * scale);
    pLight.position.copy(pos);
    scene.add(pLight);

    group.position.copy(pos);
    scene.add(group);
    return group;
  };

  // Staging Helper: Headlight Volumetric Projection
  const createHeadlightBeams = (carPos, heading, length = 22, beamColor = 0xddeeff) => {
    const cosH = Math.cos(heading);
    const sinH = Math.sin(heading);
    [-0.8, 0.8].forEach(offsetX => {
      const start = carPos.clone().add(new THREE.Vector3(
        cosH * offsetX + sinH * 2.5,
        0.7,
        -sinH * offsetX + cosH * 2.5
      ));
      const end = start.clone().add(new THREE.Vector3(sinH * length, -0.4, cosH * length));
      const dir = end.clone().sub(start);
      const len = dir.length();

      const coneGeo = new THREE.CylinderGeometry(0.2, 2.4, len, 12, 1, true);
      const coneMat = new THREE.MeshBasicMaterial({
        color: beamColor,
        transparent: true,
        opacity: 0.16,
        depthWrite: false,
        side: THREE.DoubleSide
      });
      const cone = new THREE.Mesh(coneGeo, coneMat);
      cone.position.copy(start).addScaledVector(dir, 0.5);
      cone.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize());
      scene.add(cone);
    });
  };

  // Staging Helper: Tire Skid Marks
  const createSkidMark = (x, z, length = 12, rotY = 0) => {
    const geo = new THREE.PlaneGeometry(0.4, length);
    const mat = new THREE.MeshBasicMaterial({
      color: 0x050505,
      transparent: true,
      opacity: 0.78,
      depthWrite: false
    });
    const markL = new THREE.Mesh(geo, mat);
    markL.rotation.x = -Math.PI / 2;
    markL.rotation.z = -rotY;
    markL.position.set(x - 0.85, 0.04, z);
    scene.add(markL);

    const markR = new THREE.Mesh(geo, mat);
    markR.rotation.x = -Math.PI / 2;
    markR.rotation.z = -rotY;
    markR.position.set(x + 0.85, 0.04, z);
    scene.add(markR);
  };

  // Staging Helper: Civilian Cars
  const createCivilianCar = (x, z, rotY, bodyColor = 0x2266cc) => {
    const carGroup = new THREE.Group();
    const bodyGeo = new THREE.BoxGeometry(2.1, 0.75, 4.6);
    const bodyMat = new THREE.MeshStandardMaterial({
      color: bodyColor,
      metalness: 0.75,
      roughness: 0.22,
      clearcoat: 0.8
    });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = 0.65;
    carGroup.add(body);

    const cabinGeo = new THREE.BoxGeometry(1.7, 0.55, 2.3);
    const cabinMat = new THREE.MeshStandardMaterial({ color: 0x0a101d, roughness: 0.08 });
    const cabin = new THREE.Mesh(cabinGeo, cabinMat);
    cabin.position.set(0, 1.15, -0.2);
    carGroup.add(cabin);

    // Wheels
    const wGeo = new THREE.CylinderGeometry(0.42, 0.42, 0.35, 16);
    const wMat = new THREE.MeshStandardMaterial({ color: 0x151515, roughness: 0.9 });
    [[-1.0, 1.4], [1.0, 1.4], [-1.0, -1.4], [1.0, -1.4]].forEach(([wx, wz]) => {
      const w = new THREE.Mesh(wGeo, wMat);
      w.rotation.z = Math.PI / 2;
      w.position.set(wx, 0.42, wz);
      carGroup.add(w);
    });

    carGroup.position.set(x, 0, z);
    carGroup.rotation.y = rotY;
    scene.add(carGroup);
    return carGroup;
  };

  // Staging Helper: Pedestrians
  const createPedestrian = (x, z, rotY, shirtColor = 0xff3366) => {
    const ped = new THREE.Group();
    const torso = new THREE.Mesh(
      new THREE.BoxGeometry(0.65, 0.9, 0.35),
      new THREE.MeshStandardMaterial({ color: shirtColor, roughness: 0.7 })
    );
    torso.position.y = 1.25;
    ped.add(torso);

    const head = new THREE.Mesh(
      new THREE.BoxGeometry(0.35, 0.35, 0.35),
      new THREE.MeshStandardMaterial({ color: 0xdfbe98, roughness: 0.8 })
    );
    head.position.y = 1.95;
    ped.add(head);

    const legs = new THREE.Mesh(
      new THREE.BoxGeometry(0.5, 0.8, 0.3),
      new THREE.MeshStandardMaterial({ color: 0x1a2233, roughness: 0.9 })
    );
    legs.position.y = 0.45;
    ped.add(legs);

    ped.position.set(x, 0, z);
    ped.rotation.y = rotY;
    scene.add(ped);
    return ped;
  };

  // Staging Helper: Tactical Armed Enforcers
  const createEnforcer = (x, z, rotY) => {
    const enforcer = new THREE.Group();
    const torso = new THREE.Mesh(
      new THREE.BoxGeometry(0.75, 0.95, 0.45),
      new THREE.MeshStandardMaterial({ color: 0x111822, roughness: 0.5 })
    );
    torso.position.y = 1.3;
    enforcer.add(torso);

    const head = new THREE.Mesh(
      new THREE.BoxGeometry(0.4, 0.4, 0.4),
      new THREE.MeshStandardMaterial({ color: 0x181e28, roughness: 0.6 })
    );
    head.position.y = 2.05;
    enforcer.add(head);

    const rifle = new THREE.Mesh(
      new THREE.BoxGeometry(0.12, 0.18, 1.2),
      new THREE.MeshStandardMaterial({ color: 0x111111, metalness: 0.8, roughness: 0.3 })
    );
    rifle.position.set(0.35, 1.45, 0.5);
    enforcer.add(rifle);

    const legs = new THREE.Mesh(
      new THREE.BoxGeometry(0.6, 0.85, 0.38),
      new THREE.MeshStandardMaterial({ color: 0x0c1018, roughness: 0.8 })
    );
    legs.position.y = 0.45;
    enforcer.add(legs);

    enforcer.position.set(x, 0, z);
    enforcer.rotation.y = rotY;
    scene.add(enforcer);
    return { group: enforcer, riflePos: new THREE.Vector3(x + 0.35, 1.45, z + 0.5) };
  };

  // Concrete Roadblock / Planter Barrier
  const createBarrier = (x, z, rotY) => {
    const geo = new THREE.BoxGeometry(3.6, 1.1, 0.6);
    const mat = new THREE.MeshStandardMaterial({ color: 0x333b4d, roughness: 0.8 });
    const barrier = new THREE.Mesh(geo, mat);
    barrier.position.set(x, 0.55, z);
    barrier.rotation.y = rotY;
    scene.add(barrier);
    return barrier;
  };

  // -------------------------------------------------------------
  // SHOT 1: CHASE (Ocean Boulevard 4-Star High-Speed Pursuit)
  // -------------------------------------------------------------
  if (shotName === 'chase' || shotName === 'cover') {
    missions.loadMission(6); // Roadblock Rampage
    police.setWantedLevel(4);

    // Warm Golden-Hour Sunset Sky & Lighting
    engine.sun.position.set(160, 90, -40);
    engine.sun.intensity = 2.6;

    // Street Lamps along Boulevard
    [-65, -40, -15, 10, 35].forEach(z => {
      stageStreetLamp(91.8, z);
    });

    // Position player's Veloce GTS Turbo in high-speed counter-steer drift
    const car = vehicleManager.supercar;
    car.pos.set(100.5, 0, -32);
    car.rotY = -0.16;
    car.mesh.rotation.y = -0.16;
    car.speed = 2.45; // 147 MPH
    car.gear = 5;
    car.rpm = 0.88;
    player.inVehicle = true;
    player.charGroup.visible = false;

    // Steer front wheels
    car.wheels[0].rotation.y = 0.32;
    car.wheels[1].rotation.y = 0.32;

    // Skid marks behind rear wheels
    createSkidMark(99.6, -42, 14, -0.16);

    // Headlight volumetric projections
    createHeadlightBeams(car.pos, car.rotY, 26, 0x00f0ff);

    // Flanking Pursuit Cruisers
    const cop1 = vehicleManager.createPoliceCruiser(new THREE.Vector3(95.2, 0, -48));
    cop1.rotY = -0.06;
    cop1.mesh.rotation.y = -0.06;
    cop1.blueLight.material.color.setHex(0x00aaff);
    cop1.redLight.material.color.setHex(0xff0022);
    police.cruisers.push(cop1);

    const cop1Flash = new THREE.PointLight(0x0088ff, 60, 16);
    cop1Flash.position.set(95.2, 2.4, -48);
    scene.add(cop1Flash);

    const cop2 = vehicleManager.createPoliceCruiser(new THREE.Vector3(104.8, 0, -43));
    cop2.rotY = -0.22;
    cop2.mesh.rotation.y = -0.22;
    cop2.blueLight.material.color.setHex(0x0088ff);
    cop2.redLight.material.color.setHex(0xff0044);
    police.cruisers.push(cop2);

    const cop2Flash = new THREE.PointLight(0xff0033, 60, 16);
    cop2Flash.position.set(104.8, 2.4, -43);
    scene.add(cop2Flash);

    // Roadblock Ahead (at z = 40)
    const block1 = vehicleManager.createPoliceCruiser(new THREE.Vector3(97.0, 0, 42));
    block1.rotY = 0.45;
    block1.mesh.rotation.y = 0.45;
    const block2 = vehicleManager.createPoliceCruiser(new THREE.Vector3(104.0, 0, 42));
    block2.rotY = -0.45;
    block2.mesh.rotation.y = -0.45;
    police.cruisers.push(block1, block2);

    // Helicopter CONDOR-1 Overhead with Spotlight
    const heli = vehicleManager.helicopter;
    if (heli) {
      heli.pos.set(106, 17.5, -22);
      heli.mesh.rotation.set(0.25, 0.1, -0.05); // Dynamic forward attack tilt
      heli.mainRotor.rotation.y = 0.8;

      // Spotlight Beam straight down onto supercar
      const from = heli.pos.clone().add(new THREE.Vector3(0, -1.2, 2.0));
      const to = new THREE.Vector3(100.5, 0.4, -32);
      const axis = from.clone().sub(to);
      const len = axis.length();

      const beamMat = new THREE.MeshBasicMaterial({
        color: 0xfff4c0,
        transparent: true,
        opacity: 0.26,
        depthWrite: false,
        side: THREE.DoubleSide
      });
      const beamGeo = new THREE.CylinderGeometry(0.8, 7.5, len, 16, 1, true);
      const beam = new THREE.Mesh(beamGeo, beamMat);
      beam.position.copy(to).addScaledVector(axis, 0.5);
      beam.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), axis.normalize());
      scene.add(beam);

      // Spotlight Pool on Tarmac
      const poolGeo = new THREE.CircleGeometry(7.2, 24);
      const poolMat = new THREE.MeshBasicMaterial({
        color: 0xfffae0,
        transparent: true,
        opacity: 0.32,
        depthWrite: false
      });
      const pool = new THREE.Mesh(poolGeo, poolMat);
      pool.rotation.x = -Math.PI / 2;
      pool.position.set(100.5, 0.05, -32);
      scene.add(pool);

      const spotLight = new THREE.PointLight(0xfffae0, 95, 45);
      spotLight.position.set(100.5, 2.0, -32);
      scene.add(spotLight);
    }

    // Camera Framing: Low dynamic chase angle behind the drifting supercar
    camera.position.set(96.2, 2.7, -49.5);
    camera.lookAt(100.2, 1.3, -22.0);
    camera.fov = 64;
    camera.updateProjectionMatrix();

    // HUD Configuration
    document.getElementById('mission-category').textContent = 'STORY CAMPAIGN // ACT III';
    document.getElementById('mission-title').textContent = 'ROADBLOCK RAMPAGE';
    document.getElementById('mission-objective').textContent = 'Smash through CPD pursuit perimeter to deliver Coral syndicate intel.';
    document.getElementById('mission-distance').textContent = 'ROADBLOCK: 75M AHEAD';

    const dispatchBox = document.getElementById('dispatch-box');
    dispatchBox.classList.add('active');
    document.getElementById('dispatch-tag').textContent = 'CPD AIRBORNE DISPATCH';
    document.getElementById('dispatch-text').textContent = 'CONDOR-1 SEARCHLIGHT LOCKED // PIT MANEUVER AUTHORIZED';

    for (let i = 1; i <= 5; i++) {
      const el = document.getElementById(`star-${i}`);
      if (el) el.classList.toggle('active', i <= 4);
    }

    document.getElementById('weapon-name').textContent = 'CAR-80 CARBINE';
    document.getElementById('ammo-clip').textContent = '30';
    document.getElementById('ammo-total').textContent = '150';

    document.getElementById('speed-number').textContent = '144';
    document.getElementById('speed-unit').textContent = 'MPH';
    document.getElementById('gear-indicator').textContent = 'GEAR 5';
    document.getElementById('rpm-bar').style.width = '88%';

    hud.updateRadar(car.pos, car.rotY, new THREE.Vector3(100, 0, 50), police.cruisers);
  }

  // -------------------------------------------------------------
  // SHOT 2: COMBAT (Downtown Coral Bank Plaza Tactical Firefight)
  // -------------------------------------------------------------
  else if (shotName === 'combat') {
    missions.loadMission(2); // Skyline Heist Escape
    police.setWantedLevel(3);

    // Warm Plaza Lighting
    stageStreetLamp(-56.0, -6.0);
    stageStreetLamp(-44.0, 10.0);

    // Player on-foot aiming carbine
    player.inVehicle = false;
    player.pos.set(-50.5, 0, -8.0);
    player.rotY = 0;
    player.charGroup.position.copy(player.pos);
    player.charGroup.rotation.y = 0;
    player.charGroup.visible = true;
    player.health = 78;
    player.armour = 52;

    // Parked Getaway Sedan
    createCivilianCar(-54.5, 2.5, 0.45, 0x881122);

    // Concrete plaza barriers
    createBarrier(-52.5, -4.5, 0.1);
    createBarrier(-47.0, 4.0, -0.3);

    // Syndicate Enforcers Returning Fire
    const e1 = createEnforcer(-48.5, 8.5, Math.PI - 0.2);
    const e2 = createEnforcer(-53.2, 11.0, Math.PI + 0.15);
    const e3 = createEnforcer(-45.0, 14.5, Math.PI - 0.4);

    // Player Muzzle Flash & Laser Tracer
    const pMuzzle = new THREE.Vector3(-50.2, 1.45, -7.2);
    createMuzzleFlash(pMuzzle, 1.4, 0xffbb00);
    createBeam(pMuzzle, new THREE.Vector3(-48.5, 1.3, 8.5), 0.085, 0xffe600, 0.95);

    // Enemy Return Fire Tracers
    createMuzzleFlash(e2.riflePos, 1.5, 0xff4422);
    createBeam(e2.riflePos, new THREE.Vector3(-51.5, 1.2, -6.0), 0.075, 0xff5533, 0.9);

    createMuzzleFlash(e1.riflePos, 1.2, 0xff7700);
    createBeam(e1.riflePos, new THREE.Vector3(-49.5, 1.1, -4.5), 0.07, 0xff8822, 0.85);

    // Camera Framing: Over-the-shoulder 3rd person action combat
    camera.position.set(-52.0, 2.1, -12.2);
    camera.lookAt(-49.8, 1.55, 6.5);
    camera.fov = 60;
    camera.updateProjectionMatrix();

    // HUD Configuration
    document.getElementById('mission-category').textContent = 'STORY CAMPAIGN // DOWNTOWN';
    document.getElementById('mission-title').textContent = 'SKYLINE HEIST ESCAPE';
    document.getElementById('mission-objective').textContent = 'Neutralize Coral syndicate ambush and extract bearer bonds.';
    document.getElementById('mission-distance').textContent = 'ENEMIES: 3 REMAINING';

    const dispatchBox = document.getElementById('dispatch-box');
    dispatchBox.classList.add('active');
    document.getElementById('dispatch-tag').textContent = 'CPD DISPATCH';
    document.getElementById('dispatch-text').textContent = 'CODE 3: OFFICER INVOLVED SHOTS FIRED AT CORAL BANK PLAZA';

    for (let i = 1; i <= 5; i++) {
      const el = document.getElementById(`star-${i}`);
      if (el) el.classList.toggle('active', i <= 3);
    }

    document.getElementById('weapon-name').textContent = 'CAR-80 CARBINE';
    document.getElementById('ammo-clip').textContent = '18';
    document.getElementById('ammo-total').textContent = '120';

    document.getElementById('health-bar').style.width = '78%';
    document.getElementById('armour-bar').style.width = '52%';

    document.getElementById('hitmarker').classList.add('active');
    document.getElementById('speedo-hud').style.display = 'none';

    hud.updateRadar(player.pos, player.rotY, new THREE.Vector3(-48.5, 0, 8.5), [
      { pos: new THREE.Vector3(-48.5, 0, 8.5) },
      { pos: new THREE.Vector3(-53.2, 0, 11.0) },
      { pos: new THREE.Vector3(-45.0, 0, 14.5) }
    ]);
  }

  // -------------------------------------------------------------
  // SHOT 3: STREET (Ocean Drive Golden Hour Sunset Promenade)
  // -------------------------------------------------------------
  else if (shotName === 'street' || shotName === 'map') {
    police.setWantedLevel(0);

    // Warm Sun & Sky Lighting
    engine.sun.position.set(160, 60, -90);
    engine.sun.intensity = 3.2;

    const hemi = new THREE.HemisphereLight(0xffddaa, 0x224466, 1.4);
    scene.add(hemi);

    // Street Lamps along coastal sidewalk
    [-110, -135, -160].forEach(z => {
      stageStreetLamp(91.8, z);
    });

    // Player Supercar cruising along Ocean Blvd at sunset
    const car = vehicleManager.supercar;
    car.pos.set(100.0, 0, -135);
    car.rotY = 0;
    car.mesh.rotation.y = 0;
    car.speed = 1.0; // 60 MPH Cruise
    car.gear = 3;
    car.rpm = 0.45;
    player.inVehicle = true;
    player.charGroup.visible = false;

    // Headlight volumetric projections
    createHeadlightBeams(car.pos, 0, 24, 0x00f0ff);

    // Traffic Cars
    createCivilianCar(104.2, -105, 0, 0x1b4499); // Blue luxury sedan
    createCivilianCar(96.0, -165, 0, 0xdddddd);  // Pearl white coupe

    // Pedestrians on coastal sidewalk
    createPedestrian(91.5, -125, Math.PI, 0x00f0ff);
    createPedestrian(92.0, -129, Math.PI, 0xff7700);
    createPedestrian(91.8, -145, 0, 0xff3366);
    createPedestrian(92.2, -150, 0, 0x33cc66);

    // Camera Framing: Front 3/4 beauty tracking angle showcasing supercar & coastal skyline
    camera.position.set(107.5, 2.3, -122);
    camera.lookAt(99.0, 1.15, -140);
    camera.fov = 56;
    camera.updateProjectionMatrix();

    // HUD Configuration
    const banner = document.getElementById('district-banner');
    if (banner) {
      document.getElementById('district-title').textContent = 'OCEAN BOULEVARD';
      document.getElementById('district-sub').textContent = 'CORAL COAST DISTRICT // SUNSET PROMENADE';
      banner.classList.add('show');
    }

    document.getElementById('mission-category').textContent = 'OPEN WORLD // CORAL COAST';
    document.getElementById('mission-title').textContent = 'FREE ROAM EXPLORATION';
    document.getElementById('mission-objective').textContent = 'Discover 6 coastal districts, street race circuits & syndicate contacts.';
    document.getElementById('mission-distance').textContent = 'MARINA DISTRICT: 320M';

    const dispatchBox = document.getElementById('dispatch-box');
    dispatchBox.classList.add('active');
    document.getElementById('dispatch-tag').textContent = 'SOLIS RADIO 98.5 FM';
    document.getElementById('dispatch-text').textContent = 'NOW PLAYING: VELA CRUZ — SYNTHWAVE BOULEVARD';

    for (let i = 1; i <= 5; i++) {
      const el = document.getElementById(`star-${i}`);
      if (el) el.classList.remove('active');
    }

    document.getElementById('speed-number').textContent = '58';
    document.getElementById('speed-unit').textContent = 'MPH';
    document.getElementById('gear-indicator').textContent = 'GEAR 3';
    document.getElementById('rpm-bar').style.width = '48%';

    hud.updateRadar(car.pos, car.rotY, new THREE.Vector3(100, 0, -250), []);
  }

  // -------------------------------------------------------------
  // SHOT 4: TITLE (Solis City Skyline Vista & AAA Title Card)
  // -------------------------------------------------------------
  else if (shotName === 'title') {
    police.setWantedLevel(0);

    // Warm Ambient Dusk Lighting Boost for Skyline Vista
    const ambientBoost = new THREE.HemisphereLight(0xffaacc, 0x112244, 2.2);
    scene.add(ambientBoost);

    const sunBoost = new THREE.DirectionalLight(0xff8844, 2.8);
    sunBoost.position.set(100, 80, -20);
    scene.add(sunBoost);

    // Overlook Terrace Lamps
    stageStreetLamp(-14.0, -172.0);
    stageStreetLamp(-6.0, -172.0);

    // Parked supercar at scenic overlook viewpoint
    const car = vehicleManager.supercar;
    car.pos.set(-10, 0.05, -180);
    car.rotY = -0.4;
    car.mesh.rotation.y = -0.4;
    car.speed = 0;
    player.inVehicle = false;

    // Headlight volumetric projections casting forward into the vista
    createHeadlightBeams(car.pos, car.rotY, 28, 0x00f0ff);

    // Player standing beside driver door looking over city
    player.pos.set(-7.5, 0, -179);
    player.rotY = -2.0;
    player.charGroup.position.copy(player.pos);
    player.charGroup.rotation.y = player.rotY;
    player.charGroup.visible = true;

    // Distant Patrolling Helicopter between towers
    const heli = vehicleManager.helicopter;
    if (heli) {
      heli.pos.set(-80, 55, -80);
      heli.mesh.rotation.set(0.1, 1.4, 0);
      heli.mainRotor.rotation.y = 1.2;
    }

    // Camera Framing: Majestic elevated panoramic vista of the metropolis
    camera.position.set(-15.5, 4.8, -194.0);
    camera.lookAt(-45.0, 26.0, -80.0);
    camera.fov = 66;
    camera.updateProjectionMatrix();

    // Toggle Title Screen UI Overlay
    const titleScreen = document.getElementById('title-screen');
    if (titleScreen) {
      titleScreen.classList.remove('hidden');
    }
    const hudEl = document.getElementById('hud');
    if (hudEl) {
      hudEl.style.display = 'none';
    }
  }

  // Force multiple synchronous render passes so WebGL buffers settle cleanly
  for (let i = 0; i < 5; i++) {
    engine.renderer.render(engine.scene, engine.camera);
  }
}
