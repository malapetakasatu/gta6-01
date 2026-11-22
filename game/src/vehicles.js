// 3D Vehicle Models & Physics for Solis City: Coral Coast
// Includes: Supercar (Veloce GTS Turbo), Police Interceptor Cruisers with lightbars, and CPD CONDOR-1 Helicopter with spotlight.

function createSupercar() {
  const car = new THREE.Group();

  // 1. Sleek Aerodynamic Body
  const bodyGeo = new THREE.BoxGeometry(2.3, 0.75, 5.0);
  const bodyMat = new THREE.MeshStandardMaterial({
    color: 0xdc143c, // Crimson Red Metallic
    roughness: 0.2,
    metalness: 0.85
  });
  const body = new THREE.Mesh(bodyGeo, bodyMat);
  body.position.y = 0.65;
  body.castShadow = true;
  body.receiveShadow = true;
  car.add(body);

  // 2. Cockpit / Tinted Glass Canopy
  const cabinGeo = new THREE.BoxGeometry(1.9, 0.6, 2.4);
  const glassMat = new THREE.MeshStandardMaterial({
    color: 0x0a101d,
    roughness: 0.1,
    metalness: 0.95,
    transparent: true,
    opacity: 0.85
  });
  const cabin = new THREE.Mesh(cabinGeo, glassMat);
  cabin.position.set(0, 1.25, -0.2);
  cabin.castShadow = true;
  car.add(cabin);

  // 3. Carbon Fiber Hood Scoop & Splitter
  const splitterGeo = new THREE.BoxGeometry(2.35, 0.1, 1.2);
  const carbonMat = new THREE.MeshStandardMaterial({
    color: 0x151515,
    roughness: 0.5,
    metalness: 0.4
  });
  const splitter = new THREE.Mesh(splitterGeo, carbonMat);
  splitter.position.set(0, 0.35, 2.2);
  car.add(splitter);

  // 4. GT Rear Wing / Spoiler
  const wingGeo = new THREE.BoxGeometry(2.2, 0.08, 0.6);
  const wing = new THREE.Mesh(wingGeo, carbonMat);
  wing.position.set(0, 1.45, -2.2);
  car.add(wing);

  const mountL = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.35, 0.3), carbonMat);
  mountL.position.set(-0.7, 1.25, -2.2);
  car.add(mountL);
  const mountR = mountL.clone();
  mountR.position.x = 0.7;
  car.add(mountR);

  // 5. LED Headlights & Taillights
  const headLightMat = new THREE.MeshBasicMaterial({ color: 0xccf5ff });
  const headL = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.15, 0.2), headLightMat);
  headL.position.set(-0.85, 0.7, 2.5);
  car.add(headL);
  const headR = headL.clone();
  headR.position.x = 0.85;
  car.add(headR);

  // Spotlights for night driving
  const spotL = new THREE.SpotLight(0xffffff, 2.0, 60, Math.PI / 6, 0.4);
  spotL.position.set(-0.85, 0.7, 2.5);
  spotL.target.position.set(-0.85, 0, 20);
  car.add(spotL);
  car.add(spotL.target);

  const spotR = new THREE.SpotLight(0xffffff, 2.0, 60, Math.PI / 6, 0.4);
  spotR.position.set(0.85, 0.7, 2.5);
  spotR.target.position.set(0.85, 0, 20);
  car.add(spotR);
  car.add(spotR.target);

  const tailLightMat = new THREE.MeshBasicMaterial({ color: 0xff0033 });
  const tailL = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.12, 0.1), tailLightMat);
  tailL.position.set(-0.7, 0.75, -2.51);
  car.add(tailL);
  const tailR = tailL.clone();
  tailR.position.x = 0.7;
  car.add(tailR);

  // 6. Wheels (4 alloy wheels with rubber tires)
  const wheels = [];
  const wheelGeo = new THREE.CylinderGeometry(0.44, 0.44, 0.36, 16);
  const tireMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.9 });
  const rimMat = new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.9, roughness: 0.2 }); // Gold BBS rims

  const wheelPositions = [
    { x: -1.15, y: 0.44, z: 1.5, name: 'FL' },
    { x: 1.15, y: 0.44, z: 1.5, name: 'FR' },
    { x: -1.15, y: 0.44, z: -1.5, name: 'RL' },
    { x: 1.15, y: 0.44, z: -1.5, name: 'RR' }
  ];

  wheelPositions.forEach(pos => {
    const wheelGroup = new THREE.Group();
    const tire = new THREE.Mesh(wheelGeo, tireMat);
    tire.rotation.z = Math.PI / 2;
    tire.castShadow = true;
    wheelGroup.add(tire);

    const rim = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.37, 8), rimMat);
    rim.rotation.z = Math.PI / 2;
    wheelGroup.add(rim);

    wheelGroup.position.set(pos.x, pos.y, pos.z);
    car.add(wheelGroup);
    wheels.push(wheelGroup);
  });

  car.userData = {
    type: 'supercar',
    name: 'Veloce GTS Turbo',
    speed: 0,
    maxSpeed: 82, // ~295 km/h in HUD
    acceleration: 38,
    braking: 50,
    reverseSpeed: 22,
    handling: 2.4,
    driftFactor: 0.96,
    gear: 1,
    wheels: wheels,
    health: 300,
    maxHealth: 300
  };

  return car;
}

function createPoliceCar() {
  const car = new THREE.Group();

  // 1. Cruiser Chassis (Black & White CPD Livery)
  const bodyGeo = new THREE.BoxGeometry(2.3, 0.85, 5.2);
  const bodyMat = new THREE.MeshStandardMaterial({
    color: 0x0d1117,
    roughness: 0.3,
    metalness: 0.4
  });
  const body = new THREE.Mesh(bodyGeo, bodyMat);
  body.position.y = 0.7;
  body.castShadow = true;
  car.add(body);

  // White Doors & Roof
  const doorGeo = new THREE.BoxGeometry(2.32, 0.6, 2.2);
  const whiteMat = new THREE.MeshStandardMaterial({ color: 0xf5f5f5, roughness: 0.4 });
  const doorPanel = new THREE.Mesh(doorGeo, whiteMat);
  doorPanel.position.set(0, 0.72, 0);
  car.add(doorPanel);

  // Pushbar on front bumper
  const barMat = new THREE.MeshStandardMaterial({ color: 0x111111, metalness: 0.8 });
  const pushBar = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.5, 0.3), barMat);
  pushBar.position.set(0, 0.55, 2.7);
  car.add(pushBar);

  // Cabin
  const cabin = new THREE.Mesh(
    new THREE.BoxGeometry(1.9, 0.65, 2.3),
    new THREE.MeshStandardMaterial({ color: 0x1a2230, metalness: 0.8, roughness: 0.2 })
  );
  cabin.position.set(0, 1.35, -0.2);
  car.add(cabin);

  // 2. POLICE LIGHTBAR (Red & Blue flashing beacons)
  const barFrame = new THREE.Mesh(
    new THREE.BoxGeometry(1.6, 0.12, 0.35),
    new THREE.MeshStandardMaterial({ color: 0x222222, metalness: 0.9 })
  );
  barFrame.position.set(0, 1.74, -0.2);
  car.add(barFrame);

  const redLightMat = new THREE.MeshBasicMaterial({ color: 0xff0022 });
  const blueLightMat = new THREE.MeshBasicMaterial({ color: 0x0066ff });

  const redBeacon = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.16, 0.3), redLightMat);
  redBeacon.position.set(-0.4, 1.78, -0.2);
  car.add(redBeacon);

  const blueBeacon = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.16, 0.3), blueLightMat);
  blueBeacon.position.set(0.4, 1.78, -0.2);
  car.add(blueBeacon);

  // Point lights for flashing sirens
  const redPoint = new THREE.PointLight(0xff0022, 0, 30);
  redPoint.position.set(-0.6, 2.1, -0.2);
  car.add(redPoint);

  const bluePoint = new THREE.PointLight(0x0066ff, 0, 30);
  bluePoint.position.set(0.6, 2.1, -0.2);
  car.add(bluePoint);

  // Wheels
  const wheels = [];
  const wheelGeo = new THREE.CylinderGeometry(0.45, 0.45, 0.35, 16);
  const tireMat = new THREE.MeshStandardMaterial({ color: 0x151515, roughness: 0.9 });
  const steelMat = new THREE.MeshStandardMaterial({ color: 0x555555, metalness: 0.7 });

  [
    { x: -1.15, y: 0.45, z: 1.55 },
    { x: 1.15, y: 0.45, z: 1.55 },
    { x: -1.15, y: 0.45, z: -1.55 },
    { x: 1.15, y: 0.45, z: -1.55 }
  ].forEach(pos => {
    const wGroup = new THREE.Group();
    const tire = new THREE.Mesh(wheelGeo, tireMat);
    tire.rotation.z = Math.PI / 2;
    wGroup.add(tire);
    const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.36, 8), steelMat);
    hub.rotation.z = Math.PI / 2;
    wGroup.add(hub);
    wGroup.position.set(pos.x, pos.y, pos.z);
    car.add(wGroup);
    wheels.push(wGroup);
  });

  car.userData = {
    type: 'police',
    name: 'CPD Interceptor',
    speed: 0,
    maxSpeed: 68,
    acceleration: 28,
    braking: 45,
    handling: 2.1,
    wheels: wheels,
    redBeacon: redBeacon,
    blueBeacon: blueBeacon,
    redPoint: redPoint,
    bluePoint: bluePoint,
    sirenTimer: 0,
    sirenPhase: 0,
    health: 260,
    maxHealth: 260
  };

  return car;
}

function createPoliceHelicopter() {
  const heli = new THREE.Group();

  // 1. Fuselage
  const fuseGeo = new THREE.BoxGeometry(2.4, 2.2, 5.8);
  const fuseMat = new THREE.MeshStandardMaterial({
    color: 0x111622,
    roughness: 0.3,
    metalness: 0.7
  });
  const fuselage = new THREE.Mesh(fuseGeo, fuseMat);
  fuselage.position.y = 2.0;
  fuselage.castShadow = true;
  heli.add(fuselage);

  // Cockpit Glass Canopy
  const glassGeo = new THREE.SphereGeometry(1.3, 12, 12);
  const glassMat = new THREE.MeshStandardMaterial({
    color: 0x0a1525,
    roughness: 0.1,
    metalness: 0.9,
    transparent: true,
    opacity: 0.8
  });
  const canopy = new THREE.Mesh(glassGeo, glassMat);
  canopy.position.set(0, 2.1, 2.2);
  canopy.scale.set(0.9, 0.8, 1.3);
  heli.add(canopy);

  // Tail Boom
  const tailGeo = new THREE.CylinderGeometry(0.25, 0.45, 6.5, 8);
  const tail = new THREE.Mesh(tailGeo, fuseMat);
  tail.rotation.x = Math.PI / 2;
  tail.position.set(0, 2.2, -5.2);
  heli.add(tail);

  // Tail Fin & Small Rotor
  const finGeo = new THREE.BoxGeometry(0.12, 1.6, 1.2);
  const fin = new THREE.Mesh(finGeo, fuseMat);
  fin.position.set(0, 2.8, -8.2);
  heli.add(fin);

  const tailRotorGeo = new THREE.BoxGeometry(0.08, 1.8, 0.2);
  const rotorMat = new THREE.MeshBasicMaterial({ color: 0x222222 });
  const tailRotor = new THREE.Mesh(tailRotorGeo, rotorMat);
  tailRotor.position.set(0.2, 2.9, -8.2);
  heli.add(tailRotor);

  // Main Rotor Blades
  const rotorHubGeo = new THREE.CylinderGeometry(0.3, 0.3, 0.5, 8);
  const rotorHub = new THREE.Mesh(rotorHubGeo, fuseMat);
  rotorHub.position.set(0, 3.3, 0);
  heli.add(rotorHub);

  const mainRotor = new THREE.Group();
  const bladeGeo = new THREE.BoxGeometry(11.0, 0.06, 0.5);
  const blade1 = new THREE.Mesh(bladeGeo, rotorMat);
  mainRotor.add(blade1);
  const blade2 = blade1.clone();
  blade2.rotation.y = Math.PI / 2;
  mainRotor.add(blade2);
  mainRotor.position.set(0, 3.6, 0);
  heli.add(mainRotor);

  // Searchlight & Volumetric Cone
  const spotlight = new THREE.SpotLight(0xaae5ff, 5.0, 140, Math.PI / 5, 0.35);
  spotlight.position.set(0, 0.8, 1.5);
  spotlight.target.position.set(0, -60, 10);
  heli.add(spotlight);
  heli.add(spotlight.target);

  // Searchlight Cone visual Mesh
  const coneGeo = new THREE.ConeGeometry(18, 55, 16, 1, true);
  const coneMat = new THREE.MeshBasicMaterial({
    color: 0x00e5ff,
    transparent: true,
    opacity: 0.15,
    side: THREE.DoubleSide,
    depthWrite: false
  });
  const lightCone = new THREE.Mesh(coneGeo, coneMat);
  lightCone.position.set(0, -26, 0);
  lightCone.rotation.x = Math.PI;
  heli.add(lightCone);

  heli.userData = {
    type: 'helicopter',
    name: 'CPD CONDOR-1',
    mainRotor: mainRotor,
    tailRotor: tailRotor,
    spotlight: spotlight,
    lightCone: lightCone,
    speed: 0,
    targetY: 45,
    health: 450,
    maxHealth: 450
  };

  return heli;
}

window.createSupercar = createSupercar;
window.createPoliceCar = createPoliceCar;
window.createPoliceHelicopter = createPoliceHelicopter;
