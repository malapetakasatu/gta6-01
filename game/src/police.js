import * as THREE from './three.module.js';

/**
 * Solis City: Coral Coast - CPD Police AI System
 * Intercept cruisers, siren strobe lights, roadblocks, and CONDOR-1 tactical helicopter.
 */

export class PoliceManager {
  constructor(scene, audioManager) {
    this.scene = scene;
    this.audio = audioManager;
    this.wantedLevel = 0; // 0 to 5 stars
    this.units = []; // array of police cruisers
    this.roadblocks = [];
    this.helicopter = null;
    this.strobeTimer = 0;
    this.strobePhase = false;
    this.spawnTimer = 0;
  }

  setWantedLevel(level) {
    this.wantedLevel = Math.max(0, Math.min(5, level));
    if (this.wantedLevel > 0) {
      this.audio?.startSiren();
    } else {
      this.audio?.stopSiren();
    }

    // Spawn helicopter at 3+ stars if not present
    if (this.wantedLevel >= 3 && !this.helicopter) {
      this.spawnHelicopter();
    } else if (this.wantedLevel < 3 && this.helicopter) {
      this.removeHelicopter();
    }
  }

  createCruiserMesh() {
    const carGroup = new THREE.Group();

    // Body chassis (Black & White CPD interceptor)
    const bodyGeo = new THREE.BoxGeometry(2.1, 0.9, 4.6);
    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0x111115,
      metalness: 0.8,
      roughness: 0.25,
    });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = 0.65;
    carGroup.add(body);

    // White door & roof panels
    const panelGeo = new THREE.BoxGeometry(2.12, 0.7, 2.2);
    const panelMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      metalness: 0.3,
      roughness: 0.4,
    });
    const panel = new THREE.Mesh(panelGeo, panelMat);
    panel.position.set(0, 0.8, -0.1);
    carGroup.add(panel);

    // Windshield & windows (tinted police glass)
    const cabinGeo = new THREE.BoxGeometry(1.9, 0.75, 2.2);
    const cabinMat = new THREE.MeshStandardMaterial({
      color: 0x050810,
      metalness: 0.95,
      roughness: 0.1,
    });
    const cabin = new THREE.Mesh(cabinGeo, cabinMat);
    cabin.position.set(0, 1.25, -0.2);
    carGroup.add(cabin);

    // Heavy duty push bumper
    const bumperGeo = new THREE.BoxGeometry(2.1, 0.45, 0.35);
    const bumperMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, metalness: 0.9, roughness: 0.5 });
    const bumper = new THREE.Mesh(bumperGeo, bumperMat);
    bumper.position.set(0, 0.5, 2.4);
    carGroup.add(bumper);

    // Lightbar assembly on roof
    const barGeo = new THREE.BoxGeometry(1.4, 0.14, 0.35);
    const barMat = new THREE.MeshStandardMaterial({ color: 0x222222, metalness: 0.8 });
    const bar = new THREE.Mesh(barGeo, barMat);
    bar.position.set(0, 1.68, -0.2);
    carGroup.add(bar);

    // Strobe lights (Red left, Blue right)
    const redLightGeo = new THREE.BoxGeometry(0.55, 0.15, 0.3);
    const redMat = new THREE.MeshStandardMaterial({
      color: 0xff0022,
      emissive: 0xff0022,
      emissiveIntensity: 3.5,
    });
    const redStrobe = new THREE.Mesh(redLightGeo, redMat);
    redStrobe.position.set(-0.4, 1.7, -0.2);
    carGroup.add(redStrobe);

    const blueLightGeo = new THREE.BoxGeometry(0.55, 0.15, 0.3);
    const blueMat = new THREE.MeshStandardMaterial({
      color: 0x0066ff,
      emissive: 0x0066ff,
      emissiveIntensity: 3.5,
    });
    const blueStrobe = new THREE.Mesh(blueLightGeo, blueMat);
    blueStrobe.position.set(0.4, 1.7, -0.2);
    carGroup.add(blueStrobe);

    // Dynamic point lights for realistic reflection
    const redPoint = new THREE.PointLight(0xff0033, 2.5, 18);
    redPoint.position.set(-0.6, 1.8, -0.2);
    carGroup.add(redPoint);

    const bluePoint = new THREE.PointLight(0x0066ff, 2.5, 18);
    bluePoint.position.set(0.6, 1.8, -0.2);
    carGroup.add(bluePoint);

    // 4 Wheels
    const wheelGeo = new THREE.CylinderGeometry(0.42, 0.42, 0.32, 16);
    wheelGeo.rotateZ(Math.PI / 2);
    const wheelMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.85 });

    const wheelOffsets = [
      [-1.02, 0.42, 1.45],
      [1.02, 0.42, 1.45],
      [-1.02, 0.42, -1.45],
      [1.02, 0.42, -1.45],
    ];
    wheelOffsets.forEach(([wx, wy, wz]) => {
      const wheel = new THREE.Mesh(wheelGeo, wheelMat);
      wheel.position.set(wx, wy, wz);
      carGroup.add(wheel);
    });

    return {
      group: carGroup,
      redMat,
      blueMat,
      redPoint,
      bluePoint,
    };
  }

  spawnCruiser(position, rotationY = 0) {
    const cruiser = this.createCruiserMesh();
    cruiser.group.position.copy(position);
    cruiser.group.rotation.y = rotationY;
    this.scene.add(cruiser.group);

    this.units.push({
      mesh: cruiser.group,
      parts: cruiser,
      active: true,
      speed: 0,
      maxSpeed: 28 + Math.random() * 6,
      acceleration: 14,
      health: 220,
    });
  }

  spawnRoadblock(centerPos, dirX = 1) {
    // Spawns two angled cruisers blocking the road with a barricade
    const spacing = 3.5;
    const p1 = new THREE.Vector3(centerPos.x - spacing * dirX, centerPos.y, centerPos.z);
    const p2 = new THREE.Vector3(centerPos.x + spacing * dirX, centerPos.y, centerPos.z);

    this.spawnCruiser(p1, Math.PI / 6);
    this.spawnCruiser(p2, -Math.PI / 6);

    // Wooden/metal police barricade in center
    const barGeo = new THREE.BoxGeometry(4.0, 1.0, 0.3);
    const barMat = new THREE.MeshStandardMaterial({ color: 0xdd8800, roughness: 0.6 });
    const barMesh = new THREE.Mesh(barGeo, barMat);
    barMesh.position.copy(centerPos);
    barMesh.position.y += 0.5;
    this.scene.add(barMesh);
    this.roadblocks.push(barMesh);
  }

  spawnHelicopter() {
    const heliGroup = new THREE.Group();

    // Fuselage - Upper Navy Blue
    const fuseTopGeo = new THREE.BoxGeometry(2.4, 1.2, 7.5);
    const fuseTopMat = new THREE.MeshStandardMaterial({ color: 0x0f2238, metalness: 0.85, roughness: 0.2 });
    const fuseTop = new THREE.Mesh(fuseTopGeo, fuseTopMat);
    fuseTop.position.y = 1.6;
    heliGroup.add(fuseTop);

    // Fuselage - Lower White Belly & CPD Markings
    const fuseBottomGeo = new THREE.BoxGeometry(2.38, 1.0, 7.4);
    const fuseBottomMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, metalness: 0.2, roughness: 0.4 });
    const fuseBottom = new THREE.Mesh(fuseBottomGeo, fuseBottomMat);
    fuseBottom.position.y = 0.5;
    heliGroup.add(fuseBottom);

    // CPD Gold Star Badge / Side Stripe
    const stripeGeo = new THREE.BoxGeometry(2.42, 0.22, 5.2);
    const stripeMat = new THREE.MeshStandardMaterial({ color: 0xffbb00, emissive: 0xffaa00, emissiveIntensity: 1.5 });
    const stripe = new THREE.Mesh(stripeGeo, stripeMat);
    stripe.position.set(0, 1.1, 0.2);
    heliGroup.add(stripe);

    // Glass cockpit with deep reflections
    const cockGeo = new THREE.BoxGeometry(2.2, 1.6, 2.8);
    const cockMat = new THREE.MeshStandardMaterial({ color: 0x06111f, metalness: 0.95, roughness: 0.05 });
    const cockpit = new THREE.Mesh(cockGeo, cockMat);
    cockpit.position.set(0, 1.2, 2.5);
    heliGroup.add(cockpit);

    // Tail boom & vertical fin (Navy)
    const tailGeo = new THREE.BoxGeometry(0.6, 0.6, 6.0);
    const tail = new THREE.Mesh(tailGeo, fuseTopMat);
    tail.position.set(0, 1.4, -6.0);
    heliGroup.add(tail);

    const finGeo = new THREE.BoxGeometry(0.2, 2.2, 1.4);
    const fin = new THREE.Mesh(finGeo, fuseTopMat);
    fin.position.set(0, 2.2, -8.6);
    heliGroup.add(fin);

    // Skids
    const skidGeo = new THREE.CylinderGeometry(0.08, 0.08, 6.2, 8);
    skidGeo.rotateX(Math.PI / 2);
    const skidMat = new THREE.MeshStandardMaterial({ color: 0x222222, metalness: 0.9 });
    const skidL = new THREE.Mesh(skidGeo, skidMat);
    skidL.position.set(-1.2, -0.2, 0.2);
    const skidR = new THREE.Mesh(skidGeo, skidMat);
    skidR.position.set(1.2, -0.2, 0.2);
    heliGroup.add(skidL, skidR);

    // Rotor hub & blades
    const rotorHub = new THREE.Group();
    rotorHub.position.set(0, 2.4, 0.2);
    const bladeGeo = new THREE.BoxGeometry(11.0, 0.08, 0.45);
    const bladeMat = new THREE.MeshStandardMaterial({ color: 0x111111, metalness: 0.9 });
    const blade1 = new THREE.Mesh(bladeGeo, bladeMat);
    const blade2 = new THREE.Mesh(bladeGeo, bladeMat);
    blade2.rotation.y = Math.PI / 2;
    rotorHub.add(blade1, blade2);
    heliGroup.add(rotorHub);

    // Semi-transparent high-speed spinning rotor motion blur disc
    const discGeo = new THREE.CylinderGeometry(5.6, 5.6, 0.04, 32);
    const discMat = new THREE.MeshBasicMaterial({
      color: 0x111827,
      transparent: true,
      opacity: 0.45,
    });
    const rotorDisc = new THREE.Mesh(discGeo, discMat);
    rotorDisc.position.set(0, 2.45, 0.2);
    heliGroup.add(rotorDisc);

    // Tail rotor motion blur disc
    const tailDiscGeo = new THREE.CylinderGeometry(1.2, 1.2, 0.02, 16);
    tailDiscGeo.rotateZ(Math.PI / 2);
    const tailDisc = new THREE.Mesh(tailDiscGeo, discMat);
    tailDisc.position.set(0.3, 2.2, -8.6);
    heliGroup.add(tailDisc);

    // High intensity searchlight cone
    const searchlight = new THREE.SpotLight(0xffffff, 8.0, 85, Math.PI / 5, 0.35, 1.1);
    searchlight.position.set(0, 0, 1.8);
    heliGroup.add(searchlight);

    // Volumetric spotlight visual cone
    const coneGeo = new THREE.ConeGeometry(7, 30, 16, 1, true);
    coneGeo.rotateX(-Math.PI / 2);
    const coneMat = new THREE.MeshBasicMaterial({
      color: 0xe0f2fe,
      transparent: true,
      opacity: 0.22,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const coneMesh = new THREE.Mesh(coneGeo, coneMat);
    coneMesh.position.set(0, -15, 0);
    searchlight.add(coneMesh);

    heliGroup.position.set(0, 38, -20);
    this.scene.add(heliGroup);

    this.helicopter = {
      mesh: heliGroup,
      rotor: rotorHub,
      spotlight: searchlight,
      cone: coneMesh,
    };
  }

  removeHelicopter() {
    if (this.helicopter) {
      this.scene.remove(this.helicopter.mesh);
      this.helicopter = null;
    }
  }

  update(dt, playerPosition) {
    // Strobe alternating red/blue lights
    this.strobeTimer += dt * 8.0;
    this.strobePhase = Math.sin(this.strobeTimer) > 0;

    this.units.forEach(unit => {
      if (!unit.active) return;

      // Update strobe lights
      const redOn = this.strobePhase;
      const blueOn = !this.strobePhase;

      unit.parts.redMat.emissiveIntensity = redOn ? 4.0 : 0.2;
      unit.parts.redPoint.intensity = redOn ? 2.5 : 0;
      unit.parts.blueMat.emissiveIntensity = blueOn ? 4.0 : 0.2;
      unit.parts.bluePoint.intensity = blueOn ? 2.5 : 0;

      // Pursuit AI: Turn towards player position and accelerate
      if (this.wantedLevel > 0 && playerPosition) {
        const toTarget = new THREE.Vector3().subVectors(playerPosition, unit.mesh.position);
        const dist = toTarget.length();

        // Calculate heading to target
        const targetAngle = Math.atan2(toTarget.x, toTarget.z);
        // Smoothly rotate cruiser
        let diffAngle = targetAngle - unit.mesh.rotation.y;
        while (diffAngle < -Math.PI) diffAngle += Math.PI * 2;
        while (diffAngle > Math.PI) diffAngle -= Math.PI * 2;
        unit.mesh.rotation.y += diffAngle * Math.min(1.0, dt * 2.8);

        // Drive forward
        if (dist > 6.0) {
          unit.speed = Math.min(unit.maxSpeed, unit.speed + unit.acceleration * dt);
        } else {
          // Ramming speed maneuver
          unit.speed = Math.min(unit.maxSpeed * 0.8, unit.speed + unit.acceleration * 0.5 * dt);
        }

        const forward = new THREE.Vector3(0, 0, 1).applyAxisAngle(new THREE.Vector3(0, 1, 0), unit.mesh.rotation.y);
        unit.mesh.position.addScaledVector(forward, unit.speed * dt);
        unit.mesh.position.y = 0; // lock to road plane
      }
    });

    // Update Helicopter AI and searchlight tracking
    if (this.helicopter && playerPosition) {
      this.helicopter.rotor.rotation.y += dt * 24.0;

      // Hover overhead with slight sway
      const targetHeliPos = new THREE.Vector3(
        playerPosition.x + Math.sin(this.strobeTimer * 0.5) * 8,
        34 + Math.sin(this.strobeTimer * 0.7) * 2,
        playerPosition.z - 18 + Math.cos(this.strobeTimer * 0.5) * 8
      );
      this.helicopter.mesh.position.lerp(targetHeliPos, dt * 1.5);
      this.helicopter.mesh.lookAt(playerPosition.x, 34, playerPosition.z);

      // Aim spotlight directly at player
      this.helicopter.spotlight.target.position.copy(playerPosition);
      this.helicopter.spotlight.target.updateMatrixWorld();
    }
  }
}
