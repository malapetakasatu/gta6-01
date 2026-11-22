// 5-Tier Arsenal & Ballistics Combat System for SOLIS CITY: CORAL COAST
// Weapons: P9 Viper, Vector-9 SMG, Carbine Mk-II, Havoc 12G Shotgun, Titan RPG.
// Features: Raycast targeting, muzzle flash dynamic lights, bullet tracers, and explosive AOE.

export class CombatSystem {
  constructor(scene, camera) {
    this.scene = scene;
    this.camera = camera;

    this.weapons = [
      { name: "P9 Viper", damage: 28, rate: 0.28, mag: 15, reserve: 60, spread: 0.015, fullAuto: false },
      { name: "Vector-9 SMG", damage: 18, rate: 0.08, mag: 32, reserve: 160, spread: 0.05, fullAuto: true },
      { name: "Carbine Mk-II", damage: 36, rate: 0.12, mag: 30, reserve: 120, spread: 0.03, fullAuto: true },
      { name: "Havoc 12G", damage: 16, rate: 0.65, mag: 8, reserve: 40, spread: 0.11, pellets: 6, fullAuto: false },
      { name: "Titan RPG", damage: 220, rate: 1.5, mag: 1, reserve: 6, spread: 0.01, explosive: true, fullAuto: false }
    ];

    this.currentIdx = 2; // Carbine Mk-II default
    this.lastShotTime = 0;
    this.currentMag = this.weapons[this.currentIdx].mag;

    this.tracers = [];
    this.explosions = [];
    this.raycaster = new THREE.Raycaster();

    this.initMuzzleFlash();
  }

  getCurrentWeapon() {
    return this.weapons[this.currentIdx];
  }

  selectWeapon(idx) {
    if (idx >= 0 && idx < this.weapons.length) {
      this.currentIdx = idx;
      this.currentMag = this.weapons[this.currentIdx].mag;
    }
  }

  initMuzzleFlash() {
    this.flashLight = new THREE.PointLight(0xffaa22, 0, 15);
    this.scene.add(this.flashLight);

    const flashGeo = new THREE.SphereGeometry(0.35, 6, 6);
    const flashMat = new THREE.MeshBasicMaterial({ color: 0xffe066 });
    this.flashMesh = new THREE.Mesh(flashGeo, flashMat);
    this.flashMesh.visible = false;
    this.scene.add(this.flashMesh);
  }

  triggerMuzzleFlash(pos) {
    this.flashLight.position.copy(pos);
    this.flashLight.intensity = 4.5;
    this.flashMesh.position.copy(pos);
    this.flashMesh.visible = true;

    setTimeout(() => {
      this.flashLight.intensity = 0;
      this.flashMesh.visible = false;
    }, 45);
  }

  shoot(origin, policeSystem, audioSystem) {
    const now = performance.now() * 0.001;
    const wp = this.getCurrentWeapon();

    if (now - this.lastShotTime < wp.rate) return false;
    if (this.currentMag <= 0) {
      this.reload();
      return false;
    }

    this.lastShotTime = now;
    this.currentMag--;

    // Audio Trigger
    if (audioSystem) {
      audioSystem.playGunshot(wp.name);
    }

    // Camera recoil kick
    this.camera.rotation.x += (Math.random() * 0.02 + 0.015);

    // Muzzle Flash
    this.triggerMuzzleFlash(origin);

    // Ballistics Raycast from Camera Center
    this.raycaster.setFromCamera(new THREE.Vector2(0, 0), this.camera);

    const rayDir = this.raycaster.ray.direction.clone();
    rayDir.x += (Math.random() - 0.5) * wp.spread;
    rayDir.y += (Math.random() - 0.5) * wp.spread;
    rayDir.z += (Math.random() - 0.5) * wp.spread;
    rayDir.normalize();

    const targetPoint = origin.clone().add(rayDir.clone().multiplyScalar(150));

    // Spawn Bullet Tracer Line
    this.spawnTracer(origin, targetPoint);

    // Check Police Cruisers Hit
    policeSystem.cruisers.forEach(cruiser => {
      const dx = cruiser.position.x - targetPoint.x;
      const dz = cruiser.position.z - targetPoint.z;
      if (Math.sqrt(dx * dx + dz * dz) < 8) {
        policeSystem.addHeat(15);
      }
    });

    // Explosive Titan RPG effect
    if (wp.explosive) {
      this.spawnExplosion(targetPoint);
      if (audioSystem) audioSystem.playExplosion();
      policeSystem.addHeat(30);
    }

    return true;
  }

  reload() {
    const wp = this.getCurrentWeapon();
    if (wp.reserve > 0) {
      const needed = wp.mag - this.currentMag;
      const take = Math.min(needed, wp.reserve);
      this.currentMag += take;
      wp.reserve -= take;
    }
  }

  spawnTracer(from, to) {
    const lineGeo = new THREE.BufferGeometry().setFromPoints([from, to]);
    const lineMat = new THREE.LineBasicMaterial({
      color: 0xffd200,
      linewidth: 2,
      transparent: true,
      opacity: 0.95
    });
    const line = new THREE.Line(lineGeo, lineMat);
    this.scene.add(line);

    this.tracers.push({ mesh: line, time: 0 });
  }

  spawnExplosion(pos) {
    const sphereGeo = new THREE.SphereGeometry(4.5, 12, 12);
    const sphereMat = new THREE.MeshBasicMaterial({
      color: 0xff4400,
      transparent: true,
      opacity: 0.9
    });
    const exp = new THREE.Mesh(sphereGeo, sphereMat);
    exp.position.copy(pos);
    this.scene.add(exp);

    this.explosions.push({ mesh: exp, scale: 1.0, opacity: 1.0 });
  }

  update(dt) {
    // Animate tracers fade out
    for (let i = this.tracers.length - 1; i >= 0; i--) {
      const t = this.tracers[i];
      t.time += dt;
      t.mesh.material.opacity -= dt * 9.0;
      if (t.mesh.material.opacity <= 0 || t.time > 0.12) {
        this.scene.remove(t.mesh);
        this.tracers.splice(i, 1);
      }
    }

    // Animate explosive fireballs
    for (let i = this.explosions.length - 1; i >= 0; i--) {
      const exp = this.explosions[i];
      exp.scale += dt * 14.0;
      exp.opacity -= dt * 2.2;
      exp.mesh.scale.set(exp.scale, exp.scale, exp.scale);
      exp.mesh.material.opacity = Math.max(0, exp.opacity);
      if (exp.opacity <= 0) {
        this.scene.remove(exp.mesh);
        this.explosions.splice(i, 1);
      }
    }
  }
}
