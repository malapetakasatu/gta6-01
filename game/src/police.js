// Tactical Coral Police Department (CPD) Pursuit AI System
// Features: 5 wanted stars escalation, dynamic interceptor cruisers,
// roadblock deployments with spike strips, and CONDOR-1 tactical helicopter tracking.

import { Vehicle } from './vehicles.js';

export class PoliceSystem {
  constructor(scene, city) {
    this.scene = scene;
    this.city = city;

    this.wantedLevel = 1;
    this.heat = 20;
    this.cruisers = [];
    this.helicopter = null;
    this.roadblocks = [];

    this.evasionTimer = 0;
    this.maxCruisers = 4;

    this.dispatchMessages = [
      "10-4, suspect confirmed driving coral supercar on Ocean Drive.",
      "All units in Coral Coast, code 3 pursuit initiated. Interceptors dispatched.",
      "Air support CONDOR-1 is airborne, searchlight tracking active.",
      "Suspect evading through Downtown canyons. Requesting tactical roadblocks.",
      "Warning: Suspect is heavily armed and dangerous. Authorization for PIT maneuvers granted."
    ];

    this.initCruisers();
    this.initHelicopter();
  }

  initCruisers() {
    for (let i = 0; i < 3; i++) {
      const cruiser = new Vehicle(this.scene, "police");
      cruiser.position.set(-240 + i * 40, 0, -80 + i * 50);
      this.cruisers.push(cruiser);
    }
  }

  initHelicopter() {
    this.helicopter = new Vehicle(this.scene, "helicopter");
    this.helicopter.position.set(-200, 35, 0);
  }

  addHeat(amount) {
    this.heat = Math.min(100, this.heat + amount);
    if (this.heat > 85) this.wantedLevel = 5;
    else if (this.heat > 65) this.wantedLevel = 4;
    else if (this.heat > 45) this.wantedLevel = 3;
    else if (this.heat > 25) this.wantedLevel = 2;
    else if (this.heat > 10) this.wantedLevel = 1;
    else this.wantedLevel = 0;

    this.triggerDispatchAudio();
  }

  triggerDispatchAudio() {
    const dispatchEl = document.getElementById('dispatch-text');
    if (dispatchEl) {
      const msg = this.dispatchMessages[Math.min(this.wantedLevel - 1, this.dispatchMessages.length - 1)] || "10-99 All units code 3.";
      dispatchEl.innerText = msg;
    }
  }

  deployRoadblock(playerPos) {
    // Deploy tactical roadblock ahead on nearest road intersection
    const targetNode = this.city.getNearestRoadNode(playerPos.x, playerPos.z - 120);

    const barrierMat = new THREE.MeshStandardMaterial({ color: 0xff8800, roughness: 0.5 });
    const barrierGeo = new THREE.BoxGeometry(18, 1.2, 0.8);
    const barrier = new THREE.Mesh(barrierGeo, barrierMat);
    barrier.position.set(targetNode.x, 0.6, targetNode.z);
    this.scene.add(barrier);

    this.roadblocks.push({
      mesh: barrier,
      x: targetNode.x,
      z: targetNode.z
    });
  }

  update(dt, playerPos, playerVehicle) {
    // 1. Helicopter Pursuit Logic
    if (this.helicopter && this.wantedLevel >= 3) {
      this.helicopter.mesh.visible = true;
      this.helicopter.updateHelicopter(dt, playerPos);
    } else if (this.helicopter) {
      this.helicopter.mesh.visible = false;
    }

    // 2. Cruisers Tactical AI
    this.cruisers.forEach((cruiser, idx) => {
      if (this.wantedLevel === 0) {
        cruiser.mesh.visible = false;
        return;
      }
      cruiser.mesh.visible = true;

      const dx = playerPos.x - cruiser.position.x;
      const dz = playerPos.z - cruiser.position.z;
      const dist = Math.sqrt(dx * dx + dz * dz);

      // Target angle towards player
      const targetAngle = Math.atan2(dx, dz);
      let angleDiff = targetAngle - cruiser.rotation.y;
      while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
      while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;

      // Simulated cruiser steering & throttle
      const simInput = {
        forward: dist > 8,
        backward: dist < 4,
        left: angleDiff > 0.1,
        right: angleDiff < -0.1,
        handbrake: dist < 15 && Math.abs(angleDiff) > 1.2,
        nitro: this.wantedLevel >= 4 && dist > 30
      };

      cruiser.updatePhysics(dt, simInput, this.city);

      // Ramming / PIT maneuver logic
      if (dist < 4.5 && playerVehicle) {
        playerVehicle.speed *= 0.88;
        cruiser.speed *= 0.7;
      }
    });

    // 3. Evasion countdown
    const nearestCruiserDist = Math.min(...this.cruisers.map(c => {
      const dx = c.position.x - playerPos.x;
      const dz = c.position.z - playerPos.z;
      return Math.sqrt(dx * dx + dz * dz);
    }));

    if (nearestCruiserDist > 140) {
      this.evasionTimer += dt;
      if (this.evasionTimer > 12) {
        this.wantedLevel = Math.max(0, this.wantedLevel - 1);
        this.heat = Math.max(0, this.heat - 25);
        this.evasionTimer = 0;
      }
    } else {
      this.evasionTimer = 0;
    }
  }
}
