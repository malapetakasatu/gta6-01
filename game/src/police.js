// SOLIS CITY: CORAL COAST - CPD Tactical Pursuit Police AI
// Manages Coral Police Department wanted system (1-4 stars), pursuit cruiser AI,
// tactical roadblocks across avenues, and CONDOR-1 tactical helicopter dispatch.

/* global THREE */

import { PoliceCruiser } from './vehicles.js';

export class PoliceManager {
  constructor(scene, city, helicopter) {
    this.scene = scene;
    this.city = city;
    this.helicopter = helicopter;

    this.cruisers = [];
    this.roadblocks = [];
    this.wantedLevel = 3; // 1 to 4 stars
    this.maxCruisers = 4;

    this.spawnTimer = 0;
    this.dispatchCooldown = 0;
    this.evadeTimer = 0;
    this.isEvading = false;

    // Tactical Roadblock points
    this.roadblockLocations = [
      { x: -90, z: 80, rot: Math.PI / 2 },
      { x: 0, z: -80, rot: 0 },
      { x: 90, z: 160, rot: Math.PI / 2 }
    ];

    this.initRoadblocks();
  }

  initRoadblocks() {
    // Build tactical barricades across key intersections
    const barMat = new THREE.MeshStandardMaterial({ color: 0xffaa00, roughness: 0.4 });
    const stripeMat = new THREE.MeshBasicMaterial({ color: 0x111111 });

    this.roadblockLocations.forEach(loc => {
      const group = new THREE.Group();

      // Police barrier stand
      const post1 = new THREE.Mesh(new THREE.BoxGeometry(0.3, 1.2, 0.3), stripeMat);
      post1.position.set(-3.5, 0.6, 0);
      group.add(post1);

      const post2 = new THREE.Mesh(new THREE.BoxGeometry(0.3, 1.2, 0.3), stripeMat);
      post2.position.set(3.5, 0.6, 0);
      group.add(post2);

      const crossbar = new THREE.Mesh(new THREE.BoxGeometry(7.2, 0.4, 0.15), barMat);
      crossbar.position.set(0, 0.9, 0);
      group.add(crossbar);

      // Flashing amber caution light
      const amberLight = new THREE.PointLight(0xffaa00, 1.5, 20);
      amberLight.position.set(0, 1.3, 0);
      group.add(amberLight);

      group.position.set(loc.x, 0, loc.z);
      group.rotation.y = loc.rot;
      this.scene.add(group);
      this.roadblocks.push({ group, light: amberLight, x: loc.x, z: loc.z });

      // Spawn a parked barrier cruiser next to the barricade
      const barrierCruiser = new PoliceCruiser(this.scene, loc.x + 5, loc.z, loc.rot + Math.PI / 2);
      this.cruisers.push(barrierCruiser);
    });
  }

  setWantedLevel(level) {
    this.wantedLevel = Math.max(0, Math.min(4, level));

    if (this.wantedLevel >= 4) {
      if (this.helicopter) this.helicopter.active = true;
      this.maxCruisers = 5;
    } else if (this.wantedLevel >= 3) {
      if (this.helicopter) this.helicopter.active = true;
      this.maxCruisers = 4;
    } else if (this.wantedLevel >= 2) {
      if (this.helicopter) this.helicopter.active = false;
      this.maxCruisers = 3;
    } else if (this.wantedLevel >= 1) {
      if (this.helicopter) this.helicopter.active = false;
      this.maxCruisers = 1;
    } else {
      if (this.helicopter) this.helicopter.active = false;
      this.maxCruisers = 0;
      this.clearAll();
    }
  }

  spawnCruiserNear(targetPos) {
    if (this.cruisers.length >= this.maxCruisers) return;

    // Spawn ahead or behind player on nearest road
    const angle = Math.random() * Math.PI * 2;
    const dist = 65 + Math.random() * 35;
    const spawnX = targetPos.x + Math.sin(angle) * dist;
    const spawnZ = targetPos.z + Math.cos(angle) * dist;

    const wp = this.city.findNearestWaypoint(spawnX, spawnZ);
    const cruiser = new PoliceCruiser(this.scene, wp.x, wp.z, angle + Math.PI);
    this.cruisers.push(cruiser);
  }

  update(dt, targetPos, time) {
    if (this.wantedLevel === 0) return;

    // Spawn replenishment
    this.spawnTimer += dt;
    if (this.spawnTimer > 4.5 && this.cruisers.length < this.maxCruisers) {
      this.spawnTimer = 0;
      this.spawnCruiserNear(targetPos);
    }

    // Update active cruisers
    for (let i = this.cruisers.length - 1; i >= 0; i--) {
      const c = this.cruisers[i];
      if (c.isDead) {
        c.destroy();
        this.cruisers.splice(i, 1);
        continue;
      }

      c.update(dt, targetPos, this.city, time);

      // Check ramming collision with player
      const d = c.position.distanceTo(targetPos);
      if (d < 3.2) {
        // Impact force
        c.speed = -c.speed * 0.4;
      }
    }

    // Helicopter update
    if (this.helicopter && this.helicopter.active) {
      this.helicopter.update(dt, targetPos, time);
    }

    // Animate roadblock amber lights
    this.roadblocks.forEach(rb => {
      rb.light.intensity = 1.0 + Math.sin(time * 8 + rb.x) * 0.8;
    });

    // Check evasion status
    let nearestDist = Infinity;
    for (let c of this.cruisers) {
      const d = c.position.distanceTo(targetPos);
      if (d < nearestDist) nearestDist = d;
    }

    if (nearestDist > 90) {
      this.isEvading = true;
      this.evadeTimer += dt;
      if (this.evadeTimer > 12) {
        // Successfully evaded!
        this.setWantedLevel(Math.max(0, this.wantedLevel - 1));
        this.evadeTimer = 0;
        this.isEvading = false;
      }
    } else {
      this.isEvading = false;
      this.evadeTimer = 0;
    }
  }

  clearAll() {
    this.cruisers.forEach(c => c.destroy());
    this.cruisers = [];
  }
}
