// SOLIS CITY: CORAL COAST - High-Fidelity 3D Vehicles & Flight Systems
// Supercar Veloce GTS Turbo, CPD Police Pursuit Cruisers, Tactical CONDOR-1 Helicopter.

const THREE = window.THREE;

export class VehicleManager {
  constructor(scene, city) {
    this.scene = scene;
    this.city = city;
    this.vehicles = [];

    // Player Veloce GTS Supercar
    this.supercar = this.createSupercar(new THREE.Vector3(100, 0, 40));
    this.vehicles.push(this.supercar);

    // CPD Tactical Helicopter
    this.helicopter = this.createHelicopter(new THREE.Vector3(100, 45, 0));
  }

  createSupercar(pos) {
    const group = new THREE.Group();

    // Aerodynamic Chassis Base (Metallic Sunset Orange)
    const bodyGeo = new THREE.BoxGeometry(2.3, 0.7, 5.0);
    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0xff3b14,
      metalness: 0.85,
      roughness: 0.18,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1
    });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = 0.65;
    body.castShadow = true;
    group.add(body);

    // Sleek Cockpit Canopy (Tinted Glass)
    const cabinGeo = new THREE.BoxGeometry(1.8, 0.6, 2.4);
    const cabinMat = new THREE.MeshStandardMaterial({
      color: 0x050a14,
      metalness: 0.95,
      roughness: 0.05
    });
    const cabin = new THREE.Mesh(cabinGeo, cabinMat);
    cabin.position.set(0, 1.15, -0.2);
    cabin.castShadow = true;
    group.add(cabin);

    // Front Splitter / Carbon Fiber Diffuser
    const splitterGeo = new THREE.BoxGeometry(2.4, 0.15, 0.8);
    const carbonMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.6 });
    const splitter = new THREE.Mesh(splitterGeo, carbonMat);
    splitter.position.set(0, 0.35, 2.5);
    group.add(splitter);

    // High-Downforce Rear Wing
    const wingBladeGeo = new THREE.BoxGeometry(2.2, 0.1, 0.6);
    const wingBlade = new THREE.Mesh(wingBladeGeo, carbonMat);
    wingBlade.position.set(0, 1.45, -2.4);
    group.add(wingBlade);

    const wingPillarGeo = new THREE.BoxGeometry(0.12, 0.45, 0.3);
    const pillarL = new THREE.Mesh(wingPillarGeo, carbonMat);
    pillarL.position.set(-0.7, 1.2, -2.4);
    group.add(pillarL);
    const pillarR = new THREE.Mesh(wingPillarGeo, carbonMat);
    pillarR.position.set(0.7, 1.2, -2.4);
    group.add(pillarR);

    // Xenon Headlights (Bright White LEDs)
    const hlGeo = new THREE.BoxGeometry(0.5, 0.18, 0.2);
    const hlMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff });
    const hlL = new THREE.Mesh(hlGeo, hlMat);
    hlL.position.set(-0.8, 0.7, 2.5);
    group.add(hlL);
    const hlR = new THREE.Mesh(hlGeo, hlMat);
    hlR.position.set(0.8, 0.7, 2.5);
    group.add(hlR);

    // Continuous Neon Red Taillight Bar
    const tlGeo = new THREE.BoxGeometry(2.1, 0.12, 0.15);
    const tlMat = new THREE.MeshBasicMaterial({ color: 0xff0044 });
    const tl = new THREE.Mesh(tlGeo, tlMat);
    tl.position.set(0, 0.75, -2.52);
    group.add(tl);

    // Quad Chrome Exhaust Tips
    const exhGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.4, 8);
    const exhMat = new THREE.MeshStandardMaterial({ color: 0xdddddd, metalness: 0.9 });
    for (let e = -0.45; e <= 0.45; e += 0.3) {
      const tip = new THREE.Mesh(exhGeo, exhMat);
      tip.rotation.x = Math.PI / 2;
      tip.position.set(e, 0.38, -2.55);
      group.add(tip);
    }

    // 4 Performance Alloy Sports Wheels
    const wheels = [];
    const wheelPositions = [
      { x: -1.15, y: 0.45, z: 1.5 },
      { x: 1.15, y: 0.45, z: 1.5 },
      { x: -1.15, y: 0.45, z: -1.5 },
      { x: 1.15, y: 0.45, z: -1.5 }
    ];

    const wheelGeo = new THREE.CylinderGeometry(0.45, 0.45, 0.4, 16);
    const wheelMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.8 });
    wheelPositions.forEach(wp => {
      const wheelMesh = new THREE.Mesh(wheelGeo, wheelMat);
      wheelMesh.rotation.z = Math.PI / 2;
      wheelMesh.position.set(wp.x, wp.y, wp.z);
      wheelMesh.castShadow = true;
      group.add(wheelMesh);
      wheels.push(wheelMesh);
    });

    group.position.copy(pos);
    this.scene.add(group);

    return {
      type: 'supercar',
      mesh: group,
      wheels: wheels,
      pos: group.position,
      rotY: 0,
      velocity: new THREE.Vector3(),
      speed: 0,
      maxSpeed: 2.8,        // 160+ MPH dynamic peak
      acceleration: 0.038,
      brakeDecel: 0.048,
      turnSpeed: 0.042,
      gear: 1,
      rpm: 0.2,
      isDrifting: false,
      skidTimer: 0,
      health: 100,
      radius: 2.2
    };
  }

  createPoliceCruiser(pos) {
    const group = new THREE.Group();

    // CPD Interceptor Body (Black and White Police Livery)
    const bodyGeo = new THREE.BoxGeometry(2.3, 0.8, 5.2);
    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0x08080a,
      metalness: 0.6,
      roughness: 0.3
    });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = 0.7;
    body.castShadow = true;
    group.add(body);

    // White Police Doors & Roof
    const roofGeo = new THREE.BoxGeometry(1.9, 0.7, 2.6);
    const roofMat = new THREE.MeshStandardMaterial({ color: 0xf5f5f5, roughness: 0.4 });
    const roof = new THREE.Mesh(roofGeo, roofMat);
    roof.position.set(0, 1.25, -0.2);
    group.add(roof);

    // Reinforced Steel Ramming Push-Bar
    const pushbarGeo = new THREE.BoxGeometry(2.2, 0.6, 0.4);
    const pushbarMat = new THREE.MeshStandardMaterial({ color: 0x222222, metalness: 0.9 });
    const pushbar = new THREE.Mesh(pushbarGeo, pushbarMat);
    pushbar.position.set(0, 0.6, 2.7);
    group.add(pushbar);

    // Roof Police Lightbar (Flashing Red and Blue)
    const barBaseGeo = new THREE.BoxGeometry(1.4, 0.15, 0.4);
    const barBase = new THREE.Mesh(barBaseGeo, pushbarMat);
    barBase.position.set(0, 1.68, -0.2);
    group.add(barBase);

    const blueLightGeo = new THREE.BoxGeometry(0.5, 0.2, 0.35);
    const blueMat = new THREE.MeshBasicMaterial({ color: 0x0066ff });
    const blueLight = new THREE.Mesh(blueLightGeo, blueMat);
    blueLight.position.set(-0.4, 1.76, -0.2);
    group.add(blueLight);

    const redLightGeo = new THREE.BoxGeometry(0.5, 0.2, 0.35);
    const redMat = new THREE.MeshBasicMaterial({ color: 0xff0022 });
    const redLight = new THREE.Mesh(redLightGeo, redMat);
    redLight.position.set(0.4, 1.76, -0.2);
    group.add(redLight);

    // Cruiser Wheels
    const wheels = [];
    const wheelPositions = [
      { x: -1.15, y: 0.45, z: 1.6 },
      { x: 1.15, y: 0.45, z: 1.6 },
      { x: -1.15, y: 0.45, z: -1.6 },
      { x: 1.15, y: 0.45, z: -1.6 }
    ];
    const wheelGeo = new THREE.CylinderGeometry(0.45, 0.45, 0.4, 16);
    const wheelMat = new THREE.MeshStandardMaterial({ color: 0x151515, roughness: 0.9 });
    wheelPositions.forEach(wp => {
      const wheelMesh = new THREE.Mesh(wheelGeo, wheelMat);
      wheelMesh.rotation.z = Math.PI / 2;
      wheelMesh.position.set(wp.x, wp.y, wp.z);
      group.add(wheelMesh);
      wheels.push(wheelMesh);
    });

    group.position.copy(pos);
    this.scene.add(group);

    return {
      type: 'police',
      mesh: group,
      pos: group.position,
      rotY: 0,
      velocity: new THREE.Vector3(),
      speed: 0,
      maxSpeed: 2.1,
      blueLight: blueLight,
      redLight: redLight,
      health: 80,
      radius: 2.3,
      aiState: 'patrol',
      targetPos: new THREE.Vector3()
    };
  }

  createHelicopter(pos) {
    const group = new THREE.Group();

    // Tactical Fuselage (Matte CPD Navy Blue)
    const bodyGeo = new THREE.BoxGeometry(2.4, 2.2, 7.0);
    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0x0c1426,
      metalness: 0.8,
      roughness: 0.3
    });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.castShadow = true;
    group.add(body);

    // Cockpit Glass Nose
    const noseGeo = new THREE.ConeGeometry(1.6, 2.6, 8);
    const noseMat = new THREE.MeshStandardMaterial({ color: 0x050a14, roughness: 0.1 });
    const nose = new THREE.Mesh(noseGeo, noseMat);
    nose.rotation.x = Math.PI / 2;
    nose.position.set(0, -0.1, 4.2);
    group.add(nose);

    // Tail Boom & Fin
    const tailGeo = new THREE.BoxGeometry(0.8, 0.8, 6.0);
    const tail = new THREE.Mesh(tailGeo, bodyMat);
    tail.position.set(0, 0.6, -5.5);
    group.add(tail);

    const finGeo = new THREE.BoxGeometry(0.2, 2.0, 1.4);
    const fin = new THREE.Mesh(finGeo, bodyMat);
    fin.position.set(0, 1.4, -8.2);
    group.add(fin);

    // Main Overhead Rotor
    const rotorShaftGeo = new THREE.CylinderGeometry(0.15, 0.15, 1.0, 8);
    const shaft = new THREE.Mesh(rotorShaftGeo, bodyMat);
    shaft.position.set(0, 1.6, 0.5);
    group.add(shaft);

    const rotorBladeGeo = new THREE.BoxGeometry(11.0, 0.08, 0.7);
    const rotorMat = new THREE.MeshBasicMaterial({ color: 0x111111 });
    const mainRotor = new THREE.Mesh(rotorBladeGeo, rotorMat);
    mainRotor.position.set(0, 2.1, 0.5);
    group.add(mainRotor);

    // Tail Rotor
    const tailRotorBladeGeo = new THREE.BoxGeometry(0.08, 2.4, 0.3);
    const tailRotor = new THREE.Mesh(tailRotorBladeGeo, rotorMat);
    tailRotor.position.set(0.45, 1.4, -8.2);
    group.add(tailRotor);

    // Landing Skids
    const skidGeo = new THREE.CylinderGeometry(0.08, 0.08, 5.5, 8);
    const skidMat = new THREE.MeshStandardMaterial({ color: 0x333333, metalness: 0.9 });
    const skidL = new THREE.Mesh(skidGeo, skidMat);
    skidL.rotation.x = Math.PI / 2;
    skidL.position.set(-1.4, -1.4, 0);
    group.add(skidL);
    const skidR = new THREE.Mesh(skidGeo, skidMat);
    skidR.rotation.x = Math.PI / 2;
    skidR.position.set(1.4, -1.4, 0);
    group.add(skidR);

    // Tactical Airborne Searchlight Cone
    const coneGeo = new THREE.ConeGeometry(12, 45, 16, 1, true);
    const coneMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.28,
      side: THREE.DoubleSide
    });
    const searchCone = new THREE.Mesh(coneGeo, coneMat);
    searchCone.position.set(0, -22, 2);
    group.add(searchCone);

    group.position.copy(pos);
    this.scene.add(group);

    return {
      mesh: group,
      mainRotor: mainRotor,
      tailRotor: tailRotor,
      searchCone: searchCone,
      pos: group.position,
      altitude: 45,
      targetPos: new THREE.Vector3(100, 0, 40)
    };
  }

  updateSupercarPhysics(input, delta) {
    const car = this.supercar;

    // Acceleration & Braking
    if (input.forward) {
      car.speed = Math.min(car.maxSpeed, car.speed + car.acceleration);
    } else if (input.backward) {
      car.speed = Math.max(-car.maxSpeed * 0.45, car.speed - car.brakeDecel);
    } else {
      // Natural rolling resistance
      car.speed *= 0.985;
      if (Math.abs(car.speed) < 0.005) car.speed = 0;
    }

    // Handbrake Drifting
    car.isDrifting = input.handbrake && Math.abs(car.speed) > 0.4;
    const steerFactor = car.isDrifting ? 1.6 : 1.0;

    // Steering
    if (Math.abs(car.speed) > 0.01) {
      const dir = car.speed > 0 ? 1 : -1;
      if (input.left) {
        car.rotY += car.turnSpeed * steerFactor * dir;
      }
      if (input.right) {
        car.rotY -= car.turnSpeed * steerFactor * dir;
      }
    }

    // Vehicle Heading & Velocity
    car.velocity.set(
      Math.sin(car.rotY) * car.speed,
      0,
      Math.cos(car.rotY) * car.speed
    );

    // Apply translation
    const nextPos = car.pos.clone().add(car.velocity);

    // Building Collision Detection & Rebound
    const col = this.city.checkCollision(nextPos, car.radius);
    if (!col) {
      car.pos.copy(nextPos);
    } else {
      // Impact rebound & speed dampening
      car.speed *= -0.4;
      car.pos.add(new THREE.Vector3(
        (car.pos.x - col.center.x) * 0.05,
        0,
        (car.pos.z - col.center.z) * 0.05
      ));
    }

    // Mesh alignment & wheel spinning
    car.mesh.position.copy(car.pos);
    car.mesh.rotation.y = car.rotY;

    // Dynamic Gear & RPM Calculation
    const speedMPH = Math.abs(car.speed) * 60;
    if (speedMPH < 25) {
      car.gear = 1;
      car.rpm = speedMPH / 25;
    } else if (speedMPH < 55) {
      car.gear = 2;
      car.rpm = (speedMPH - 25) / 30;
    } else if (speedMPH < 90) {
      car.gear = 3;
      car.rpm = (speedMPH - 55) / 35;
    } else if (speedMPH < 125) {
      car.gear = 4;
      car.rpm = (speedMPH - 90) / 35;
    } else {
      car.gear = 5;
      car.rpm = Math.min(1.0, (speedMPH - 125) / 40);
    }

    // Spin wheels
    car.wheels.forEach(w => {
      w.rotation.x += car.speed * 0.8;
    });
  }

  update(delta, time, input) {
    this.updateSupercarPhysics(input, delta);

    // Helicopter Rotor Animation & Tracking
    if (this.helicopter) {
      this.helicopter.mainRotor.rotation.y += 0.45;
      this.helicopter.tailRotor.rotation.x += 0.55;

      // Track target with smooth searchlight hover
      const target = this.helicopter.targetPos;
      const hpos = this.helicopter.pos;
      hpos.x += (target.x - hpos.x) * 0.015;
      hpos.z += (target.z - hpos.z) * 0.015;
      hpos.y = this.helicopter.altitude + Math.sin(time * 2) * 1.5;

      // Searchlight points towards target
      this.helicopter.mesh.lookAt(target.x, hpos.y, target.z);
    }
  }
}
