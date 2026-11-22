// 3D Vehicles System for SOLIS CITY: CORAL COAST
// Features: Veloce GTS Turbo supercar with active nitro exhausts,
// CPD Pursuit Cruiser with alternating LED lightbars, and
// CONDOR-1 Tactical Helicopter with ground searchlight cone.

export class Vehicle {
  constructor(scene, type = "supercar") {
    this.scene = scene;
    this.type = type;
    this.mesh = new THREE.Group();

    this.position = this.mesh.position;
    this.rotation = this.mesh.rotation;

    this.speed = 0;
    this.maxSpeed = type === "supercar" ? 68 : 55; // ~245 km/h
    this.acceleration = type === "supercar" ? 38 : 30;
    this.braking = 45;
    this.reverseSpeed = 16;
    this.steeringAngle = 0;
    this.turnSpeed = 2.4;
    this.handbrake = false;
    this.nitroActive = false;
    this.nitroFuel = 100;

    this.wheels = [];
    this.frontWheels = [];

    this.buildModel();
    this.scene.add(this.mesh);
  }

  buildModel() {
    if (this.type === "supercar") {
      this.buildSupercar();
    } else if (this.type === "police") {
      this.buildPoliceCruiser();
    } else if (this.type === "helicopter") {
      this.buildHelicopter();
    }
  }

  buildSupercar() {
    // Veloce GTS Turbo - Exotic Coral Pink / Deep Carbon Supercar
    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0xff1e6d,
      metalness: 0.85,
      roughness: 0.18,
      clearcoat: 0.9,
      clearcoatRoughness: 0.1
    });

    const carbonMat = new THREE.MeshStandardMaterial({
      color: 0x11141a,
      roughness: 0.4,
      metalness: 0.8
    });

    const glassMat = new THREE.MeshStandardMaterial({
      color: 0x050c18,
      roughness: 0.05,
      metalness: 0.9,
      transparent: true,
      opacity: 0.82
    });

    // Lower Wedge Chassis
    const chassisGeo = new THREE.BoxGeometry(2.3, 0.65, 4.8);
    const chassis = new THREE.Mesh(chassisGeo, bodyMat);
    chassis.position.y = 0.55;
    chassis.castShadow = true;
    this.mesh.add(chassis);

    // Aerodynamic Cockpit Greenhouse
    const cabinGeo = new THREE.BoxGeometry(1.8, 0.55, 2.4);
    const cabin = new THREE.Mesh(cabinGeo, glassMat);
    cabin.position.set(0, 1.05, -0.2);
    this.mesh.add(cabin);

    // Carbon Rear Wing
    const wingGeo = new THREE.BoxGeometry(2.4, 0.08, 0.5);
    const wing = new THREE.Mesh(wingGeo, carbonMat);
    wing.position.set(0, 1.15, 2.1);
    this.mesh.add(wing);

    // Dual Headlights
    const headMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff });
    [-0.8, 0.8].forEach(x => {
      const head = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.12, 0.1), headMat);
      head.position.set(x, 0.65, -2.4);
      this.mesh.add(head);
    });

    // Dual Taillights
    const tailMat = new THREE.MeshBasicMaterial({ color: 0xff0033 });
    const tailBar = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.08, 0.1), tailMat);
    tailBar.position.set(0, 0.68, 2.4);
    this.mesh.add(tailBar);

    // Wheels
    this.createWheels(2.2, 3.0, 0.42);

    // Nitro Flame Emitters
    this.nitroFlames = [];
    [-0.5, 0.5].forEach(x => {
      const flameGeo = new THREE.ConeGeometry(0.18, 0.8, 8);
      flameGeo.rotateX(-Math.PI / 2);
      const flameMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff, transparent: true, opacity: 0 });
      const flame = new THREE.Mesh(flameGeo, flameMat);
      flame.position.set(x, 0.4, 2.5);
      this.mesh.add(flame);
      this.nitroFlames.push(flame);
    });

    // Neon Underglow
    this.underglow = new THREE.PointLight(0x00f0ff, 1.5, 10);
    this.underglow.position.set(0, 0.2, 0);
    this.mesh.add(this.underglow);
  }

  buildPoliceCruiser() {
    // CPD Tactical Pursuit Cruiser
    const whiteMat = new THREE.MeshStandardMaterial({ color: 0xf5f7fb, metalness: 0.5, roughness: 0.3 });
    const blackMat = new THREE.MeshStandardMaterial({ color: 0x12151c, metalness: 0.6, roughness: 0.4 });
    const glassMat = new THREE.MeshStandardMaterial({ color: 0x08101e, roughness: 0.1, transparent: true, opacity: 0.85 });

    // Cruiser Body
    const bodyGeo = new THREE.BoxGeometry(2.2, 0.75, 4.6);
    const body = new THREE.Mesh(bodyGeo, blackMat);
    body.position.y = 0.65;
    body.castShadow = true;
    this.mesh.add(body);

    // White CPD Doors / Roof Section
    const roofGeo = new THREE.BoxGeometry(1.9, 0.65, 2.5);
    const roof = new THREE.Mesh(roofGeo, whiteMat);
    roof.position.set(0, 1.2, -0.1);
    this.mesh.add(roof);

    // Heavy Push Bumper
    const barGeo = new THREE.BoxGeometry(2.0, 0.4, 0.3);
    const bar = new THREE.Mesh(barGeo, blackMat);
    bar.position.set(0, 0.55, -2.4);
    this.mesh.add(bar);

    // Tactical Roof Lightbar (Alternating Red / Blue)
    const lightbarBase = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.1, 0.3), blackMat);
    lightbarBase.position.set(0, 1.6, -0.1);
    this.mesh.add(lightbarBase);

    this.redStrobe = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.12, 0.25), new THREE.MeshBasicMaterial({ color: 0xff0022 }));
    this.redStrobe.position.set(-0.4, 1.62, -0.1);
    this.mesh.add(this.redStrobe);

    this.blueStrobe = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.12, 0.25), new THREE.MeshBasicMaterial({ color: 0x0066ff }));
    this.blueStrobe.position.set(0.4, 1.62, -0.1);
    this.mesh.add(this.blueStrobe);

    this.sirenLightRed = new THREE.PointLight(0xff0022, 2.0, 20);
    this.sirenLightRed.position.set(-0.5, 1.8, -0.1);
    this.mesh.add(this.sirenLightRed);

    this.sirenLightBlue = new THREE.PointLight(0x0066ff, 2.0, 20);
    this.sirenLightBlue.position.set(0.5, 1.8, -0.1);
    this.mesh.add(this.sirenLightBlue);

    this.createWheels(2.1, 2.9, 0.44);
  }

  buildHelicopter() {
    // CONDOR-1 Tactical Helicopter
    const darkMat = new THREE.MeshStandardMaterial({ color: 0x161c24, metalness: 0.8, roughness: 0.3 });
    const blueMat = new THREE.MeshStandardMaterial({ color: 0x0055ff, metalness: 0.6, roughness: 0.3 });

    // Fuselage
    const fuseGeo = new THREE.BoxGeometry(2.4, 2.2, 5.5);
    const fuse = new THREE.Mesh(fuseGeo, darkMat);
    fuse.position.y = 1.5;
    this.mesh.add(fuse);

    // Tail Boom
    const tailGeo = new THREE.BoxGeometry(0.6, 0.6, 5.0);
    const tail = new THREE.Mesh(tailGeo, darkMat);
    tail.position.set(0, 2.0, 4.8);
    this.mesh.add(tail);

    // Main Rotor Blades
    this.mainRotor = new THREE.Group();
    const bladeGeo = new THREE.BoxGeometry(9.0, 0.06, 0.4);
    const bladeMat = new THREE.MeshBasicMaterial({ color: 0x222222 });
    const b1 = new THREE.Mesh(bladeGeo, bladeMat);
    const b2 = new THREE.Mesh(bladeGeo, bladeMat);
    b2.rotation.y = Math.PI / 2;
    this.mainRotor.add(b1, b2);
    this.mainRotor.position.set(0, 2.8, 0);
    this.mesh.add(this.mainRotor);

    // Searchlight Cone & Point Light
    const spotGeo = new THREE.ConeGeometry(8.0, 35, 16, 1, true);
    spotGeo.rotateX(Math.PI / 2);
    const spotMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.22,
      side: THREE.DoubleSide
    });
    this.searchlightCone = new THREE.Mesh(spotGeo, spotMat);
    this.searchlightCone.position.set(0, 0, -18);
    this.mesh.add(this.searchlightCone);

    this.spotLight = new THREE.SpotLight(0xffffff, 5.0, 80, Math.PI / 7, 0.4);
    this.spotLight.position.set(0, 0.5, 0);
    this.spotLight.target.position.set(0, -35, -5);
    this.mesh.add(this.spotLight);
    this.mesh.add(this.spotLight.target);
  }

  createWheels(width, length, radius) {
    const wheelGeo = new THREE.CylinderGeometry(radius, radius, 0.35, 16);
    wheelGeo.rotateZ(Math.PI / 2);
    const wheelMat = new THREE.MeshStandardMaterial({ color: 0x0a0c10, roughness: 0.9 });
    const rimMat = new THREE.MeshStandardMaterial({ color: 0x8899aa, metalness: 0.9 });

    const xOffsets = [-width / 2, width / 2];
    const zOffsets = [-length / 2, length / 2];

    zOffsets.forEach((z, zIdx) => {
      xOffsets.forEach(x => {
        const wheelPivot = new THREE.Group();
        wheelPivot.position.set(x, radius, z);

        const tire = new THREE.Mesh(wheelGeo, wheelMat);
        const rim = new THREE.Mesh(new THREE.CylinderGeometry(radius * 0.6, radius * 0.6, 0.36, 10), rimMat);
        rim.rotateZ(Math.PI / 2);

        wheelPivot.add(tire, rim);
        this.mesh.add(wheelPivot);
        this.wheels.push(wheelPivot);

        if (zIdx === 0) {
          this.frontWheels.push(wheelPivot);
        }
      });
    });
  }

  updatePhysics(dt, input, city) {
    if (this.type === "helicopter") return;

    // Driving Controls
    const throttle = input.forward ? 1 : (input.backward ? -0.6 : 0);
    const steer = input.left ? 1 : (input.right ? -1 : 0);
    this.handbrake = input.handbrake || false;

    // Nitro Boost
    if (input.nitro && this.nitroFuel > 5 && this.speed > 5) {
      this.nitroActive = true;
      this.nitroFuel = Math.max(0, this.nitroFuel - dt * 25);
    } else {
      this.nitroActive = false;
      this.nitroFuel = Math.min(100, this.nitroFuel + dt * 10);
    }

    const currentAccel = (this.nitroActive ? this.acceleration * 1.8 : this.acceleration);
    const currentMax = (this.nitroActive ? this.maxSpeed * 1.3 : this.maxSpeed);

    // Speed calculation
    if (throttle > 0) {
      this.speed = Math.min(currentMax, this.speed + currentAccel * dt);
    } else if (throttle < 0) {
      if (this.speed > 0.5) {
        this.speed = Math.max(0, this.speed - this.braking * dt * 1.4);
      } else {
        this.speed = Math.max(-this.reverseSpeed, this.speed - currentAccel * 0.6 * dt);
      }
    } else {
      // Natural rolling friction
      if (this.speed > 0) this.speed = Math.max(0, this.speed - 12 * dt);
      else if (this.speed < 0) this.speed = Math.min(0, this.speed + 12 * dt);
    }

    if (this.handbrake) {
      this.speed = Math.max(0, this.speed - 35 * dt);
    }

    // Steering
    const speedRatio = Math.abs(this.speed) / this.maxSpeed;
    const steerMultiplier = this.handbrake ? 1.6 : (1.0 - speedRatio * 0.45);
    if (Math.abs(this.speed) > 0.3) {
      const dir = this.speed >= 0 ? 1 : -1;
      this.rotation.y += steer * this.turnSpeed * steerMultiplier * dt * dir;
    }

    // Front wheels visual steer angle
    this.frontWheels.forEach(w => {
      w.rotation.y = steer * 0.45;
    });

    // Wheels rotation
    this.wheels.forEach(w => {
      w.rotation.x += (this.speed / 0.4) * dt;
    });

    // Calculate motion vector
    const forwardX = -Math.sin(this.rotation.y);
    const forwardZ = -Math.cos(this.rotation.y);

    const nextX = this.position.x + forwardX * this.speed * dt;
    const nextZ = this.position.z + forwardZ * this.speed * dt;

    // Check city building collisions
    const col = city.checkCollision(nextX, nextZ, 1.8);
    if (col.hit) {
      this.speed = -this.speed * 0.35;
      this.position.x += col.pushX * 1.5;
      this.position.z += col.pushZ * 1.5;
    } else {
      this.position.x = nextX;
      this.position.z = nextZ;
    }

    // Keep on ground
    this.position.y = 0;

    // Animate Nitro Flames
    if (this.nitroFlames) {
      this.nitroFlames.forEach(f => {
        f.material.opacity = this.nitroActive ? (0.7 + Math.random() * 0.3) : 0;
        f.scale.set(1, 1 + (this.nitroActive ? Math.random() * 0.8 : 0), 1);
      });
    }

    // Animate Police Strobes
    if (this.type === "police") {
      const strobe = Math.sin(Date.now() * 0.02) > 0;
      this.redStrobe.material.color.setHex(strobe ? 0xff0022 : 0x220005);
      this.blueStrobe.material.color.setHex(!strobe ? 0x0066ff : 0x000822);
      this.sirenLightRed.intensity = strobe ? 2.5 : 0.1;
      this.sirenLightBlue.intensity = !strobe ? 2.5 : 0.1;
    }
  }

  updateHelicopter(dt, targetPos) {
    if (this.type !== "helicopter") return;

    // Spin Rotor
    if (this.mainRotor) {
      this.mainRotor.rotation.y += dt * 32;
    }

    // Smooth aerial chase logic (maintains 35m altitude)
    const targetY = 32;
    this.position.y += (targetY - this.position.y) * 2.0 * dt;

    const dx = targetPos.x - this.position.x;
    const dz = targetPos.z - this.position.z;
    const dist = Math.sqrt(dx * dx + dz * dz);

    if (dist > 15) {
      const angle = Math.atan2(dx, dz);
      this.rotation.y += (angle - this.rotation.y) * 3.0 * dt;
      this.position.x += (dx / dist) * 24 * dt;
      this.position.z += (dz / dist) * 24 * dt;
      // Banking tilt
      this.rotation.z = Math.max(-0.25, Math.min(0.25, -dx * 0.01));
    }

    // Point Searchlight at target
    if (this.spotLight) {
      this.spotLight.target.position.set(targetPos.x, 0, targetPos.z);
    }
  }
}
