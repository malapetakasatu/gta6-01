// SOLIS CITY: CORAL COAST - 3D Vehicles & Physics Simulation
// High-performance supercar "Veloce GTS Turbo", CPD police pursuit cruisers
// with functional lightbars, and airborne CONDOR-1 tactical helicopter.

/* global THREE */

export class Supercar {
  constructor(scene) {
    this.scene = scene;
    this.mesh = new THREE.Group();

    // Physics parameters
    this.position = new THREE.Vector3(0, 0.45, 0);
    this.velocity = new THREE.Vector3();
    this.speed = 0; // units/sec
    this.maxSpeed = 72; // ~160 MPH
    this.reverseMaxSpeed = -18;
    this.acceleration = 36;
    this.brakeForce = 48;
    this.friction = 0.985;
    this.turnSpeed = 2.4;
    this.steerAngle = 0;
    this.heading = 0; // Yaw radians
    this.pitch = 0;
    this.roll = 0;

    // Nitro boost
    this.nitro = 100;
    this.nitroMax = 100;
    this.isNitroActive = false;

    // Health
    this.health = 100;
    this.maxHealth = 100;

    // Visual references
    this.wheels = [];
    this.frontWheels = [];
    this.taillights = [];
    this.headlights = [];
    this.exhaustFlames = [];

    this.buildModel();
    this.scene.add(this.mesh);
  }

  buildModel() {
    // Aerodynamic Chassis: Veloce GTS Turbo (Cyberpunk / Supercar style)
    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0xff1447, // Candy Coral Red
      metalness: 0.92,
      roughness: 0.18
    });

    const carbonMat = new THREE.MeshStandardMaterial({
      color: 0x11141c,
      metalness: 0.8,
      roughness: 0.4
    });

    const glassMat = new THREE.MeshStandardMaterial({
      color: 0x050a14,
      metalness: 0.95,
      roughness: 0.05,
      transparent: true,
      opacity: 0.85
    });

    // Lower Main Body
    const lowerBodyGeo = new THREE.BoxGeometry(2.1, 0.6, 4.8);
    const lowerBody = new THREE.Mesh(lowerBodyGeo, bodyMat);
    lowerBody.position.y = 0.55;
    lowerBody.castShadow = true;
    this.mesh.add(lowerBody);

    // Sleek Cockpit Canopy
    const cockpitGeo = new THREE.BoxGeometry(1.65, 0.5, 2.3);
    const cockpit = new THREE.Mesh(cockpitGeo, glassMat);
    cockpit.position.set(0, 0.98, -0.2);
    this.mesh.add(cockpit);

    // Front Hood Slope & Splitter
    const splitterGeo = new THREE.BoxGeometry(2.15, 0.12, 0.8);
    const splitter = new THREE.Mesh(splitterGeo, carbonMat);
    splitter.position.set(0, 0.32, 2.35);
    this.mesh.add(splitter);

    // Rear Aero Wing (Spoiler)
    const wingGeo = new THREE.BoxGeometry(2.0, 0.08, 0.5);
    const wing = new THREE.Mesh(wingGeo, carbonMat);
    wing.position.set(0, 1.25, -2.2);
    this.mesh.add(wing);

    const wingPillarGeo = new THREE.BoxGeometry(0.08, 0.4, 0.15);
    const pLeft = new THREE.Mesh(wingPillarGeo, carbonMat);
    pLeft.position.set(-0.7, 1.05, -2.2);
    this.mesh.add(pLeft);

    const pRight = new THREE.Mesh(wingPillarGeo, carbonMat);
    pRight.position.set(0.7, 1.05, -2.2);
    this.mesh.add(pRight);

    // LED Headlights
    const headMat = new THREE.MeshBasicMaterial({ color: 0x88ffff });
    const hlLeft = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.12, 0.1), headMat);
    hlLeft.position.set(-0.8, 0.62, 2.38);
    this.mesh.add(hlLeft);

    const hlRight = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.12, 0.1), headMat);
    hlRight.position.set(0.8, 0.62, 2.38);
    this.mesh.add(hlRight);

    // LED Taillights (Neon bar)
    const tailMat = new THREE.MeshBasicMaterial({ color: 0xff0044 });
    const tailBar = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.12, 0.1), tailMat);
    tailBar.position.set(0, 0.72, -2.38);
    this.mesh.add(tailBar);
    this.taillights.push(tailBar);

    // 4 Alloy Wheels
    const wheelGeo = new THREE.CylinderGeometry(0.38, 0.38, 0.32, 16);
    wheelGeo.rotateZ(Math.PI / 2);
    const tireMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.9 });
    const rimMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.9, roughness: 0.1 });

    const wheelOffsets = [
      { x: -1.05, y: 0.38, z: 1.45, isFront: true },
      { x: 1.05, y: 0.38, z: 1.45, isFront: true },
      { x: -1.05, y: 0.38, z: -1.45, isFront: false },
      { x: 1.05, y: 0.38, z: -1.45, isFront: false }
    ];

    wheelOffsets.forEach(pos => {
      const wheelGroup = new THREE.Group();
      const tire = new THREE.Mesh(wheelGeo, tireMat);
      wheelGroup.add(tire);

      // Hub rim
      const rim = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.33, 8), rimMat);
      rim.rotateZ(Math.PI / 2);
      wheelGroup.add(rim);

      wheelGroup.position.set(pos.x, pos.y, pos.z);
      this.mesh.add(wheelGroup);
      this.wheels.push(wheelGroup);
      if (pos.isFront) this.frontWheels.push(wheelGroup);
    });

    // Dual Exhaust with backfire sprites
    const flameMat = new THREE.MeshBasicMaterial({ color: 0x05d9e8, transparent: true, opacity: 0 });
    const flameGeo = new THREE.ConeGeometry(0.22, 0.8, 8);
    flameGeo.rotateX(-Math.PI / 2);

    const fLeft = new THREE.Mesh(flameGeo, flameMat);
    fLeft.position.set(-0.45, 0.35, -2.6);
    this.mesh.add(fLeft);
    this.exhaustFlames.push(fLeft);

    const fRight = new THREE.Mesh(flameGeo, flameMat);
    fRight.position.set(0.45, 0.35, -2.6);
    this.mesh.add(fRight);
    this.exhaustFlames.push(fRight);
  }

  update(dt, input, city) {
    // Steering
    let targetSteer = 0;
    if (input.left) targetSteer += 0.55;
    if (input.right) targetSteer -= 0.55;
    this.steerAngle += (targetSteer - this.steerAngle) * 10 * dt;

    // Apply steer to front wheels
    this.frontWheels.forEach(w => {
      w.rotation.y = this.steerAngle;
    });

    // Nitro Boost
    let boostMultiplier = 1.0;
    if (input.nitro && this.nitro > 0 && input.forward) {
      this.isNitroActive = true;
      this.nitro = Math.max(0, this.nitro - 25 * dt);
      boostMultiplier = 1.65;
      this.exhaustFlames.forEach(f => {
        f.material.opacity = 0.85 + Math.random() * 0.15;
        f.scale.set(1 + Math.random() * 0.3, 1 + Math.random() * 0.5, 1);
      });
    } else {
      this.isNitroActive = false;
      this.nitro = Math.min(this.nitroMax, this.nitro + 10 * dt);
      this.exhaustFlames.forEach(f => { f.material.opacity = 0; });
    }

    // Acceleration & Braking
    if (input.forward) {
      const top = this.maxSpeed * (this.isNitroActive ? 1.3 : 1.0);
      if (this.speed < top) {
        this.speed += this.acceleration * boostMultiplier * dt;
      }
    } else if (input.backward) {
      if (this.speed > 0.5) {
        this.speed -= this.brakeForce * dt; // Brake
      } else if (this.speed > this.reverseMaxSpeed) {
        this.speed -= this.acceleration * 0.6 * dt; // Reverse
      }
    } else {
      this.speed *= Math.pow(this.friction, dt * 60);
      if (Math.abs(this.speed) < 0.1) this.speed = 0;
    }

    // Handbrake Drifting
    if (input.handbrake) {
      this.speed *= Math.pow(0.92, dt * 60);
      this.heading += this.steerAngle * (this.speed / 18) * 1.8 * dt;
    } else {
      this.heading += this.steerAngle * (this.speed / 32) * dt;
    }

    // Compute Velocity
    const forwardX = Math.sin(this.heading);
    const forwardZ = Math.cos(this.heading);

    const nextX = this.position.x + forwardX * this.speed * dt;
    const nextZ = this.position.z + forwardZ * this.speed * dt;

    // Collision check against city architecture
    if (city) {
      const col = city.checkCollision(nextX, nextZ, 1.8);
      if (col.hit) {
        this.speed = -this.speed * 0.35; // Bounce back
        this.position.x += col.normalX * col.depth;
        this.position.z += col.normalZ * col.depth;
      } else {
        this.position.x = nextX;
        this.position.z = nextZ;
      }
    } else {
      this.position.x = nextX;
      this.position.z = nextZ;
    }

    // Wheel rotation animation
    const wheelRotSpeed = (this.speed / 0.38) * dt;
    this.wheels.forEach(w => {
      w.children[0].rotation.x += wheelRotSpeed;
      w.children[1].rotation.x += wheelRotSpeed;
    });

    // Update 3D Mesh Transform
    this.mesh.position.copy(this.position);
    this.mesh.rotation.y = this.heading;

    // Subtle chassis roll & suspension pitch
    const targetRoll = -this.steerAngle * (this.speed / 50) * 0.08;
    this.mesh.rotation.z += (targetRoll - this.mesh.rotation.z) * 6 * dt;
  }

  getSpeedMph() {
    return Math.round(Math.abs(this.speed) * 2.237);
  }

  getGear() {
    const mph = this.getSpeedMph();
    if (this.speed < -0.1) return 'R';
    if (mph < 1) return 'N';
    if (mph < 30) return '1';
    if (mph < 55) return '2';
    if (mph < 85) return '3';
    if (mph < 115) return '4';
    if (mph < 145) return '5';
    return '6';
  }
}

export class PoliceCruiser {
  constructor(scene, x, z, heading = 0) {
    this.scene = scene;
    this.mesh = new THREE.Group();
    this.position = new THREE.Vector3(x, 0.45, z);
    this.speed = 0;
    this.maxSpeed = 58; // ~130 MPH
    this.acceleration = 30;
    this.heading = heading;
    this.health = 100;
    this.isDead = false;

    // Lights
    this.lightbarL = null;
    this.lightbarR = null;
    this.pointLight = null;

    this.buildModel();
    this.mesh.position.copy(this.position);
    this.mesh.rotation.y = this.heading;
    this.scene.add(this.mesh);
  }

  buildModel() {
    // Police Interceptor Cruiser Body (Black & White CPD Livery)
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.7, roughness: 0.3 });
    const doorMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, metalness: 0.6, roughness: 0.4 });
    const pushbarMat = new THREE.MeshStandardMaterial({ color: 0x0a0a0a, metalness: 0.9, roughness: 0.2 });

    // Main Body
    const bodyGeo = new THREE.BoxGeometry(2.1, 0.75, 4.7);
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = 0.6;
    body.castShadow = true;
    this.mesh.add(body);

    // White door panel inserts
    const doorGeo = new THREE.BoxGeometry(2.14, 0.6, 2.0);
    const door = new THREE.Mesh(doorGeo, doorMat);
    door.position.set(0, 0.6, 0);
    this.mesh.add(door);

    // Front Pushbar (Bullbar)
    const barGeo = new THREE.BoxGeometry(1.8, 0.45, 0.15);
    const bar = new THREE.Mesh(barGeo, pushbarMat);
    bar.position.set(0, 0.5, 2.42);
    this.mesh.add(bar);

    // Rooftop LED Lightbar (Flashing Red & Blue)
    const barBaseGeo = new THREE.BoxGeometry(1.5, 0.1, 0.35);
    const barBase = new THREE.Mesh(barBaseGeo, pushbarMat);
    barBase.position.set(0, 1.32, 0.1);
    this.mesh.add(barBase);

    // Left Red Beacon
    const redMat = new THREE.MeshBasicMaterial({ color: 0xff0022 });
    this.lightbarL = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.14, 0.3), redMat);
    this.lightbarL.position.set(-0.38, 1.38, 0.1);
    this.mesh.add(this.lightbarL);

    // Right Blue Beacon
    const blueMat = new THREE.MeshBasicMaterial({ color: 0x0066ff });
    this.lightbarR = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.14, 0.3), blueMat);
    this.lightbarR.position.set(0.38, 1.38, 0.1);
    this.mesh.add(this.lightbarR);

    // Dynamic Police Flashing PointLight
    this.pointLight = new THREE.PointLight(0x0088ff, 2.0, 35);
    this.pointLight.position.set(0, 2.0, 0);
    this.mesh.add(this.pointLight);

    // Wheels
    const wGeo = new THREE.CylinderGeometry(0.38, 0.38, 0.3, 12);
    wGeo.rotateZ(Math.PI / 2);
    const wMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.9 });

    [
      { x: -1.05, y: 0.38, z: 1.4 },
      { x: 1.05, y: 0.38, z: 1.4 },
      { x: -1.05, y: 0.38, z: -1.4 },
      { x: 1.05, y: 0.38, z: -1.4 }
    ].forEach(p => {
      const w = new THREE.Mesh(wGeo, wMat);
      w.position.set(p.x, p.y, p.z);
      this.mesh.add(w);
    });
  }

  update(dt, targetPos, city, time) {
    if (this.isDead) return;

    // Siren Lightbar strobe animation
    const flashState = (Math.sin(time * 14) > 0);
    if (this.lightbarL && this.lightbarR) {
      this.lightbarL.visible = flashState;
      this.lightbarR.visible = !flashState;
      this.pointLight.color.setHex(flashState ? 0xff0022 : 0x0088ff);
    }

    // AI Pursuit Navigation towards target
    const dx = targetPos.x - this.position.x;
    const dz = targetPos.z - this.position.z;
    const distToTarget = Math.hypot(dx, dz);

    const targetHeading = Math.atan2(dx, dz);
    let angleDiff = targetHeading - this.heading;
    while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
    while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;

    // Steering toward player
    const steerLimit = 2.2 * dt;
    this.heading += Math.max(-steerLimit, Math.min(steerLimit, angleDiff));

    // Accelerate
    if (distToTarget > 6) {
      if (this.speed < this.maxSpeed) this.speed += this.acceleration * dt;
    } else {
      // Ramming / Pit maneuver
      this.speed = Math.min(this.speed, 35);
    }

    const nextX = this.position.x + Math.sin(this.heading) * this.speed * dt;
    const nextZ = this.position.z + Math.cos(this.heading) * this.speed * dt;

    if (city) {
      const col = city.checkCollision(nextX, nextZ, 1.8);
      if (col.hit) {
        this.speed = -this.speed * 0.2;
        this.position.x += col.normalX * col.depth;
        this.position.z += col.normalZ * col.depth;
        this.heading += (Math.random() - 0.5) * 0.8;
      } else {
        this.position.x = nextX;
        this.position.z = nextZ;
      }
    } else {
      this.position.x = nextX;
      this.position.z = nextZ;
    }

    this.mesh.position.copy(this.position);
    this.mesh.rotation.y = this.heading;
  }

  takeDamage(amount) {
    this.health -= amount;
    if (this.health <= 0) {
      this.isDead = true;
      this.pointLight.intensity = 0;
      this.lightbarL.visible = false;
      this.lightbarR.visible = false;
    }
  }

  destroy() {
    this.scene.remove(this.mesh);
  }
}

export class TacticalHelicopter {
  constructor(scene) {
    this.scene = scene;
    this.mesh = new THREE.Group();
    this.position = new THREE.Vector3(0, 36, 0);
    this.mainRotor = null;
    this.tailRotor = null;
    this.searchlight = null;
    this.spotLightTarget = new THREE.Object3D();
    this.scene.add(this.spotLightTarget);

    this.active = false;
    this.speed = 38;

    this.buildModel();
    this.scene.add(this.mesh);
  }

  buildModel() {
    const heliMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.8, roughness: 0.2 });
    const glassMat = new THREE.MeshStandardMaterial({ color: 0x00d2ff, metalness: 0.9, roughness: 0.1, transparent: true, opacity: 0.85 });

    // Fuselage
    const fuseGeo = new THREE.BoxGeometry(2.4, 2.2, 5.8);
    const fuse = new THREE.Mesh(fuseGeo, heliMat);
    fuse.position.y = 0;
    this.mesh.add(fuse);

    // Cockpit Bubble Glass
    const bubbleGeo = new THREE.BoxGeometry(2.2, 1.8, 2.0);
    const bubble = new THREE.Mesh(bubbleGeo, glassMat);
    bubble.position.set(0, 0.1, 2.2);
    this.mesh.add(bubble);

    // Tail Boom
    const tailGeo = new THREE.BoxGeometry(0.8, 0.8, 6.5);
    const tail = new THREE.Mesh(tailGeo, heliMat);
    tail.position.set(0, 0.6, -4.8);
    this.mesh.add(tail);

    // Main Rotor Blades
    const rotorGroup = new THREE.Group();
    const bladeGeo = new THREE.BoxGeometry(11.5, 0.08, 0.6);
    const bladeMat = new THREE.MeshBasicMaterial({ color: 0x222222 });
    const b1 = new THREE.Mesh(bladeGeo, bladeMat);
    const b2 = new THREE.Mesh(bladeGeo, bladeMat);
    b2.rotation.y = Math.PI / 2;
    rotorGroup.add(b1, b2);
    rotorGroup.position.set(0, 1.45, 0.4);
    this.mesh.add(rotorGroup);
    this.mainRotor = rotorGroup;

    // Tail Rotor
    const tailBladeGeo = new THREE.BoxGeometry(0.06, 2.2, 0.3);
    const tb = new THREE.Mesh(tailBladeGeo, bladeMat);
    tb.position.set(0.5, 1.2, -7.8);
    this.mesh.add(tb);
    this.tailRotor = tb;

    // Searchlight Cone & Spotlight (Tracks player vehicle)
    const coneGeo = new THREE.ConeGeometry(8, 38, 16, 1, true);
    coneGeo.rotateX(-Math.PI / 2);
    const coneMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.22,
      side: THREE.DoubleSide
    });
    this.searchlightCone = new THREE.Mesh(coneGeo, coneMat);
    this.searchlightCone.position.set(0, -18, 0);
    this.mesh.add(this.searchlightCone);

    // Tactical Spotlight
    this.spotLight = new THREE.SpotLight(0xffffff, 4.0, 90, Math.PI / 6, 0.5);
    this.spotLight.position.set(0, 0, 0);
    this.spotLight.target = this.spotLightTarget;
    this.mesh.add(this.spotLight);
  }

  update(dt, targetPos, time) {
    if (!this.active) {
      this.mesh.visible = false;
      return;
    }
    this.mesh.visible = true;

    // Spin rotors
    if (this.mainRotor) this.mainRotor.rotation.y += 32 * dt;
    if (this.tailRotor) this.tailRotor.rotation.x += 42 * dt;

    // Smooth aerial pursuit hovering ~35m above target
    const targetX = targetPos.x + Math.sin(time * 0.8) * 14;
    const targetZ = targetPos.z - 20 + Math.cos(time * 0.6) * 14;

    this.position.x += (targetX - this.position.x) * 1.5 * dt;
    this.position.z += (targetZ - this.position.z) * 1.5 * dt;
    this.position.y = 36 + Math.sin(time * 1.2) * 2;

    this.mesh.position.copy(this.position);

    // Look at target
    const dx = targetPos.x - this.position.x;
    const dz = targetPos.z - this.position.z;
    this.mesh.rotation.y = Math.atan2(dx, dz);

    // Dynamic bank angle when moving
    this.mesh.rotation.z = -Math.sin(time * 0.8) * 0.15;
    this.mesh.rotation.x = 0.15; // nose down forward tilt

    // Update tactical searchlight target to lock onto player
    this.spotLightTarget.position.copy(targetPos);
  }
}
