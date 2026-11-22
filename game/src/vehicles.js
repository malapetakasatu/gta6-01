// vehicles.js: 3D Vehicle Models & Driving Physics
export function createVehicles(scene) {
  const vehicles = [];

  // Reusable materials
  const tireMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.9 });
  const rimMat = new THREE.MeshStandardMaterial({ color: 0xcccccc, metalness: 0.8, roughness: 0.2 });
  const glassMat = new THREE.MeshStandardMaterial({ color: 0x111c24, metalness: 0.9, roughness: 0.1 });
  const lightHeadMat = new THREE.MeshBasicMaterial({ color: 0xfff0aa });
  const lightTailMat = new THREE.MeshBasicMaterial({ color: 0xff1122 });

  function createWheel() {
    const wheelGroup = new THREE.Group();
    const tire = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.32, 16), tireMat);
    tire.rotation.z = Math.PI / 2;
    tire.castShadow = true;
    wheelGroup.add(tire);
    const rim = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 0.34, 8), rimMat);
    rim.rotation.z = Math.PI / 2;
    wheelGroup.add(rim);
    return wheelGroup;
  }

  // 1. Supercar (Veloce GTS Turbo)
  function createSupercar(x, z, color = 0xff5500) {
    const car = new THREE.Group();
    const bodyMat = new THREE.MeshStandardMaterial({ color, metalness: 0.7, roughness: 0.25 });

    // Lower Chassis
    const lower = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.45, 4.6), bodyMat);
    lower.position.y = 0.42;
    lower.castShadow = true;
    car.add(lower);

    // Cabin / Roof
    const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.65, 0.42, 2.2), bodyMat);
    cabin.position.set(0, 0.82, -0.2);
    cabin.castShadow = true;
    car.add(cabin);

    // Windshield & Windows
    const winFront = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 0.5), glassMat);
    winFront.position.set(0, 0.82, 0.92);
    winFront.rotation.x = -Math.PI / 4;
    car.add(winFront);

    const winRear = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 0.45), glassMat);
    winRear.position.set(0, 0.82, -1.32);
    winRear.rotation.x = Math.PI / 4;
    winRear.rotation.y = Math.PI;
    car.add(winRear);

    // Spoiler
    const spoiler = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.08, 0.4), bodyMat);
    spoiler.position.set(0, 0.95, -2.1);
    car.add(spoiler);
    const postL = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.35, 0.15), bodyMat);
    postL.position.set(-0.75, 0.78, -2.1);
    car.add(postL);
    const postR = postL.clone();
    postR.position.x = 0.75;
    car.add(postR);

    // Lights
    const hlL = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.12, 0.1), lightHeadMat);
    hlL.position.set(-0.75, 0.45, 2.3);
    car.add(hlL);
    const hlR = hlL.clone();
    hlR.position.x = 0.75;
    car.add(hlR);

    const tlL = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.1, 0.1), lightTailMat);
    tlL.position.set(-0.75, 0.48, -2.31);
    car.add(tlL);
    const tlR = tlL.clone();
    tlR.position.x = 0.75;
    car.add(tlR);

    // Wheels
    const wFL = createWheel(); wFL.position.set(-1.05, 0.42, 1.4); car.add(wFL);
    const wFR = createWheel(); wFR.position.set(1.05, 0.42, 1.4); car.add(wFR);
    const wRL = createWheel(); wRL.position.set(-1.05, 0.42, -1.4); car.add(wRL);
    const wRR = createWheel(); wRR.position.set(1.05, 0.42, -1.4); car.add(wRR);

    car.position.set(x, 0, z);
    scene.add(car);

    const vehicleObj = {
      mesh: car,
      type: 'supercar',
      speed: 0,
      maxSpeed: 42,
      accel: 24,
      steering: 0,
      wheels: [wFL, wFR, wRL, wRR],
      isPlayer: false
    };
    vehicles.push(vehicleObj);
    return vehicleObj;
  }

  // 2. Police Cruiser
  function createPoliceCruiser(x, z) {
    const car = new THREE.Group();
    const whiteMat = new THREE.MeshStandardMaterial({ color: 0xf5f5f5, roughness: 0.3 });
    const blueMat = new THREE.MeshStandardMaterial({ color: 0x1a365d, roughness: 0.3 });

    // Chassis
    const lower = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.55, 4.5), whiteMat);
    lower.position.y = 0.48;
    lower.castShadow = true;
    car.add(lower);

    // Navy blue side doors
    const sideDoorL = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.48, 2.1), blueMat);
    sideDoorL.position.set(-1.01, 0.48, 0);
    car.add(sideDoorL);
    const sideDoorR = sideDoorL.clone();
    sideDoorR.position.x = 1.01;
    car.add(sideDoorR);

    // Cabin
    const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.5, 2.2), whiteMat);
    cabin.position.set(0, 0.95, -0.2);
    cabin.castShadow = true;
    car.add(cabin);

    // Roof Lightbar
    const lightbar = new THREE.Group();
    const barBase = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.08, 0.25), new THREE.MeshStandardMaterial({ color: 0x222222 }));
    lightbar.add(barBase);
    const redLight = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.12, 0.2), new THREE.MeshBasicMaterial({ color: 0xff0022 }));
    redLight.position.x = -0.3;
    lightbar.add(redLight);
    const blueLight = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.12, 0.2), new THREE.MeshBasicMaterial({ color: 0x0066ff }));
    blueLight.position.x = 0.3;
    lightbar.add(blueLight);
    lightbar.position.set(0, 1.25, -0.2);
    car.add(lightbar);

    // Push bumper
    const bumper = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.3, 0.25), new THREE.MeshStandardMaterial({ color: 0x111111 }));
    bumper.position.set(0, 0.4, 2.35);
    car.add(bumper);

    // Wheels
    const wFL = createWheel(); wFL.position.set(-1.0, 0.42, 1.3); car.add(wFL);
    const wFR = createWheel(); wFR.position.set(1.0, 0.42, 1.3); car.add(wFR);
    const wRL = createWheel(); wRL.position.set(-1.0, 0.42, -1.3); car.add(wRL);
    const wRR = createWheel(); wRR.position.set(1.0, 0.42, -1.3); car.add(wRR);

    car.position.set(x, 0, z);
    scene.add(car);

    const vehicleObj = {
      mesh: car,
      type: 'police',
      lightbar,
      speed: 0,
      maxSpeed: 38,
      accel: 20,
      steering: 0,
      wheels: [wFL, wFR, wRL, wRR],
      isPlayer: false
    };
    vehicles.push(vehicleObj);
    return vehicleObj;
  }

  // 3. Tactical Police Helicopter (CONDOR-1)
  function createPoliceHelicopter(x, y, z) {
    const heli = new THREE.Group();
    const heliMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.6, roughness: 0.3 });
    const whiteMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc });

    // Fuselage
    const body = new THREE.Mesh(new THREE.BoxGeometry(2.2, 2.2, 5.0), heliMat);
    body.castShadow = true;
    heli.add(body);

    // Cockpit Nose & Glass
    const nose = new THREE.Mesh(new THREE.BoxGeometry(1.9, 1.6, 1.8), glassMat);
    nose.position.set(0, -0.1, 2.8);
    heli.add(nose);

    // Tail Boom
    const tail = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.6, 5.5), heliMat);
    tail.position.set(0, 0.4, -4.5);
    heli.add(tail);

    const tailFin = new THREE.Mesh(new THREE.BoxGeometry(0.15, 1.8, 1.2), whiteMat);
    tailFin.position.set(0, 1.0, -7.0);
    heli.add(tailFin);

    // Landing Skids
    const skidMat = new THREE.MeshStandardMaterial({ color: 0x111111, metalness: 0.8 });
    const skidL = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 6.0), skidMat);
    skidL.rotation.x = Math.PI / 2;
    skidL.position.set(-1.2, -1.4, 0);
    heli.add(skidL);
    const skidR = skidL.clone();
    skidR.position.x = 1.2;
    heli.add(skidR);

    // Rotor Blades
    const rotorHub = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.4), skidMat);
    rotorHub.position.set(0, 1.3, 0.2);
    heli.add(rotorHub);

    const rotorBlade = new THREE.Mesh(new THREE.BoxGeometry(10.5, 0.05, 0.4), skidMat);
    rotorBlade.position.set(0, 1.5, 0.2);
    heli.add(rotorBlade);

    // Spotlight Cone
    const spotGeo = new THREE.ConeGeometry(8, 22, 16, 1, true);
    const spotMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.35,
      side: THREE.DoubleSide
    });
    const spotlightCone = new THREE.Mesh(spotGeo, spotMat);
    spotlightCone.position.set(0, -11, 2);
    spotlightCone.rotation.x = Math.PI;
    heli.add(spotlightCone);

    heli.position.set(x, y, z);
    scene.add(heli);

    const heliObj = {
      mesh: heli,
      rotorBlade,
      spotlightCone,
      type: 'helicopter'
    };
    vehicles.push(heliObj);
    return heliObj;
  }

  return {
    vehicles,
    createSupercar,
    createPoliceCruiser,
    createPoliceHelicopter
  };
}
