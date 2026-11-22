// SOLIS CITY: CORAL COAST - 5-Tier Combat & Ballistics Arsenal
// Raycast weapon firing, luminous bullet tracers, muzzle flash bursts,
// explosive RPG-7 projectiles, shockwaves, and particle spark physics.

/* global THREE */

export const WEAPON_TYPES = [
  { id: 0, name: 'MELEE / BAT', damage: 30, fireRate: 0.4, mag: 1, maxAmmo: 1, range: 3.5, explosive: false },
  { id: 1, name: 'CPD-9 PISTOL', damage: 35, fireRate: 0.22, mag: 15, maxAmmo: 90, range: 75, explosive: false },
  { id: 2, name: 'AP-9 SUBMACHINE', damage: 28, fireRate: 0.09, mag: 30, maxAmmo: 180, range: 90, explosive: false },
  { id: 3, name: 'M4A1 CARBINE', damage: 45, fireRate: 0.12, mag: 30, maxAmmo: 210, range: 140, explosive: false },
  { id: 4, name: 'RPG-7 LAUNCHER', damage: 280, fireRate: 1.4, mag: 1, maxAmmo: 8, range: 180, explosive: true }
];

export class CombatSystem {
  constructor(scene, camera) {
    this.scene = scene;
    this.camera = camera;

    // Arsenal state
    this.weapons = WEAPON_TYPES.map(w => ({
      ...w,
      currentMag: w.mag,
      reserveAmmo: w.maxAmmo
    }));
    this.currentWeaponIndex = 3; // Default to M4A1 CARBINE

    this.lastFireTime = 0;
    this.tracers = [];
    this.explosions = [];
    this.rockets = [];
    this.muzzleFlash = null;

    this.buildMuzzleFlash();
  }

  buildMuzzleFlash() {
    const flashGeo = new THREE.SphereGeometry(0.35, 8, 8);
    const flashMat = new THREE.MeshBasicMaterial({ color: 0xffaa00, transparent: true, opacity: 0 });
    this.muzzleFlash = new THREE.Mesh(flashGeo, flashMat);

    this.flashLight = new THREE.PointLight(0xffbb33, 0, 15);
    this.muzzleFlash.add(this.flashLight);

    this.scene.add(this.muzzleFlash);
  }

  getCurrentWeapon() {
    return this.weapons[this.currentWeaponIndex];
  }

  selectWeapon(index) {
    if (index >= 0 && index < this.weapons.length) {
      this.currentWeaponIndex = index;
    }
  }

  fire(origin, direction, targets, audioManager) {
    const now = performance.now() / 1000;
    const weapon = this.getCurrentWeapon();

    if (now - this.lastFireTime < weapon.fireRate) return false;
    if (weapon.currentMag <= 0) {
      this.reload();
      return false;
    }

    this.lastFireTime = now;
    weapon.currentMag--;

    // Audio SFX trigger
    if (audioManager) {
      if (weapon.explosive) audioManager.playRpgLaunch();
      else audioManager.playGunshot(weapon.name);
    }

    // Trigger Muzzle Flash
    const muzzlePos = origin.clone().add(direction.clone().multiplyScalar(1.2));
    this.muzzleFlash.position.copy(muzzlePos);
    this.muzzleFlash.material.opacity = 1.0;
    this.flashLight.intensity = 3.5;
    setTimeout(() => {
      if (this.muzzleFlash) {
        this.muzzleFlash.material.opacity = 0;
        this.flashLight.intensity = 0;
      }
    }, 50);

    if (weapon.explosive) {
      // Spawn flying RPG rocket
      this.spawnRocket(origin, direction, targets);
    } else {
      // Instant Raycast Hitscan
      this.fireBullet(origin, direction, weapon, targets);
    }

    return true;
  }

  fireBullet(origin, direction, weapon, targets) {
    // Add subtle bullet spread
    const spread = (Math.random() - 0.5) * 0.02;
    const shotDir = direction.clone();
    shotDir.x += spread;
    shotDir.y += (Math.random() - 0.5) * 0.015;
    shotDir.normalize();

    const raycaster = new THREE.Raycaster(origin, shotDir, 0.5, weapon.range);
    let hitPoint = origin.clone().add(shotDir.clone().multiplyScalar(weapon.range));

    // Target intersection check
    if (targets && targets.length > 0) {
      const meshes = targets.map(t => t.mesh).filter(Boolean);
      const hits = raycaster.intersectObjects(meshes, true);

      if (hits.length > 0) {
        hitPoint = hits[0].point;
        // Find which target was hit
        for (let target of targets) {
          if (target.mesh && (hits[0].object === target.mesh || target.mesh.children.includes(hits[0].object))) {
            target.takeDamage(weapon.damage);
            break;
          }
        }
      }
    }

    // Visual Luminous Tracer Line
    this.createTracer(origin, hitPoint);
  }

  createTracer(start, end) {
    const dir = new THREE.Vector3().subVectors(end, start);
    const len = dir.length();
    const tracerGeo = new THREE.CylinderGeometry(0.04, 0.04, Math.min(len, 6), 6);
    tracerGeo.rotateX(Math.PI / 2);

    const tracerMat = new THREE.MeshBasicMaterial({ color: 0x05d9e8, transparent: true, opacity: 0.95 });
    const tracer = new THREE.Mesh(tracerGeo, tracerMat);

    tracer.position.copy(start);
    tracer.lookAt(end);
    this.scene.add(tracer);

    this.tracers.push({
      mesh: tracer,
      start: start.clone(),
      end: end.clone(),
      progress: 0,
      speed: 180
    });
  }

  spawnRocket(origin, direction, targets) {
    const rocketGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.8, 8);
    rocketGeo.rotateX(Math.PI / 2);
    const rocketMat = new THREE.MeshStandardMaterial({ color: 0x2d3748, metalness: 0.9 });
    const rocketMesh = new THREE.Mesh(rocketGeo, rocketMat);
    rocketMesh.position.copy(origin);
    rocketMesh.lookAt(origin.clone().add(direction));
    this.scene.add(rocketMesh);

    this.rockets.push({
      mesh: rocketMesh,
      velocity: direction.clone().multiplyScalar(55),
      life: 0,
      targets: targets
    });
  }

  spawnExplosion(position, radius = 12, damage = 220, targets = []) {
    // Fiery expanding explosion sphere
    const expGeo = new THREE.SphereGeometry(1, 16, 16);
    const expMat = new THREE.MeshBasicMaterial({
      color: 0xff3300,
      transparent: true,
      opacity: 0.95
    });
    const expMesh = new THREE.Mesh(expGeo, expMat);
    expMesh.position.copy(position);
    this.scene.add(expMesh);

    // Dynamic explosion flash light
    const expLight = new THREE.PointLight(0xff5500, 6.0, 45);
    expLight.position.copy(position);
    this.scene.add(expLight);

    this.explosions.push({
      mesh: expMesh,
      light: expLight,
      scale: 1,
      maxScale: radius,
      opacity: 0.95
    });

    // Damage & shockwave impulse on targets
    targets.forEach(t => {
      const d = t.position.distanceTo(position);
      if (d < radius) {
        const falloff = 1 - (d / radius);
        t.takeDamage(damage * falloff);
        if (t.speed !== undefined) {
          t.speed += (Math.random() - 0.5) * 20;
        }
      }
    });
  }

  reload() {
    const weapon = this.getCurrentWeapon();
    const needed = weapon.mag - weapon.currentMag;
    if (needed > 0 && weapon.reserveAmmo > 0) {
      const taken = Math.min(needed, weapon.reserveAmmo);
      weapon.currentMag += taken;
      weapon.reserveAmmo -= taken;
    }
  }

  update(dt, targets) {
    // Update bullet tracers
    for (let i = this.tracers.length - 1; i >= 0; i--) {
      const t = this.tracers[i];
      t.progress += t.speed * dt;
      const totalDist = t.start.distanceTo(t.end);

      if (t.progress >= totalDist) {
        this.scene.remove(t.mesh);
        this.tracers.splice(i, 1);
      } else {
        const factor = t.progress / totalDist;
        t.mesh.position.lerpVectors(t.start, t.end, factor);
      }
    }

    // Update flying rockets
    for (let i = this.rockets.length - 1; i >= 0; i--) {
      const r = this.rockets[i];
      r.life += dt;
      r.mesh.position.addScaledVector(r.velocity, dt);

      // Check impact with ground or targets
      let impacted = false;
      if (r.mesh.position.y <= 0.3 || r.life > 3.0) {
        impacted = true;
      } else if (targets) {
        for (let target of targets) {
          if (target.position.distanceTo(r.mesh.position) < 3.0) {
            impacted = true;
            break;
          }
        }
      }

      if (impacted) {
        this.spawnExplosion(r.mesh.position, 14, 250, targets);
        this.scene.remove(r.mesh);
        this.rockets.splice(i, 1);
      }
    }

    // Update explosions
    for (let i = this.explosions.length - 1; i >= 0; i--) {
      const exp = this.explosions[i];
      exp.scale += (exp.maxScale - exp.scale) * 12 * dt;
      exp.opacity -= 1.8 * dt;

      exp.mesh.scale.setScalar(exp.scale);
      exp.mesh.material.opacity = Math.max(0, exp.opacity);
      exp.light.intensity = Math.max(0, exp.opacity * 6.0);

      if (exp.opacity <= 0) {
        this.scene.remove(exp.mesh);
        this.scene.remove(exp.light);
        this.explosions.splice(i, 1);
      }
    }
  }
}
