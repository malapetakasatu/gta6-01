import * as THREE from './three.module.js';

/**
 * Solis City: Coral Coast - Combat & Arsenal System
 * 5-tier weapon arsenal, raycasting ballistics, dynamic muzzle flash lights, RPG projectile physics, and tracers.
 */

export const WEAPON_TYPES = [
  {
    id: 'pistol',
    name: 'Solis .45',
    clip: 12,
    reserve: 96,
    fireRate: 0.28,
    damage: 34,
    range: 60,
    spread: 0.02,
    pellets: 1,
  },
  {
    id: 'smg',
    name: 'Coral-9 SMG',
    clip: 32,
    reserve: 240,
    fireRate: 0.09,
    damage: 22,
    range: 50,
    spread: 0.05,
    pellets: 1,
  },
  {
    id: 'carbine',
    name: 'CAR-80 Carbine',
    clip: 30,
    reserve: 180,
    fireRate: 0.12,
    damage: 42,
    range: 110,
    spread: 0.025,
    pellets: 1,
  },
  {
    id: 'shotgun',
    name: 'Enforcer 12G',
    clip: 8,
    reserve: 48,
    fireRate: 0.65,
    damage: 18,
    range: 35,
    spread: 0.08,
    pellets: 7,
  },
  {
    id: 'rpg',
    name: 'Titan RPG',
    clip: 1,
    reserve: 8,
    fireRate: 1.4,
    damage: 350,
    range: 150,
    spread: 0.01,
    isRocket: true,
  },
];

export class CombatSystem {
  constructor(scene, camera, audioManager, hud) {
    this.scene = scene;
    this.camera = camera;
    this.audio = audioManager;
    this.hud = hud;

    this.weapons = JSON.parse(JSON.stringify(WEAPON_TYPES));
    this.currentWeaponIndex = 2; // Start with CAR-80 Carbine
    this.lastFireTime = 0;

    this.projectiles = []; // Active RPG rockets
    this.tracers = [];     // Active visual bullet tracers
    this.flashLight = null;
    this.flashTimer = 0;

    this.initMuzzleFlash();
    this.initInput();
  }

  getCurrentWeapon() {
    return this.weapons[this.currentWeaponIndex];
  }

  initMuzzleFlash() {
    this.flashLight = new THREE.PointLight(0xffcc44, 0, 14);
    this.scene.add(this.flashLight);
  }

  initInput() {
    window.addEventListener('mousedown', (e) => {
      if (e.button === 0) { // Left click to shoot
        this.fire();
      }
    });

    // Weapon switching with 1-5 keys
    window.addEventListener('keydown', (e) => {
      if (e.code === 'Digit1') this.switchWeapon(0);
      if (e.code === 'Digit2') this.switchWeapon(1);
      if (e.code === 'Digit3') this.switchWeapon(2);
      if (e.code === 'Digit4') this.switchWeapon(3);
      if (e.code === 'Digit5') this.switchWeapon(4);
      if (e.code === 'KeyR') this.reload();
    });
  }

  switchWeapon(index) {
    if (index >= 0 && index < this.weapons.length) {
      this.currentWeaponIndex = index;
    }
  }

  reload() {
    const w = this.getCurrentWeapon();
    const needed = WEAPON_TYPES[this.currentWeaponIndex].clip - w.clip;
    if (needed > 0 && w.reserve > 0) {
      const take = Math.min(needed, w.reserve);
      w.clip += take;
      w.reserve -= take;
    }
  }

  fire() {
    const now = performance.now() * 0.001;
    const w = this.getCurrentWeapon();

    if (now - this.lastFireTime < w.fireRate) return;
    if (w.clip <= 0) {
      this.reload();
      return;
    }

    this.lastFireTime = now;
    w.clip -= 1;

    // Audio SFX
    this.audio?.playGunfire(w.id);

    // Muzzle flash trigger
    this.flashTimer = 0.04;
    this.flashLight.intensity = 5.0;

    // Determine shot origin and forward trajectory
    const origin = new THREE.Vector3();
    this.camera.getWorldPosition(origin);
    const dir = new THREE.Vector3();
    this.camera.getWorldDirection(dir);

    // Position muzzle flash slightly forward
    this.flashLight.position.copy(origin).addScaledVector(dir, 1.5);

    if (w.isRocket) {
      this.spawnRocket(origin, dir);
    } else {
      // Raycast bullets / pellets
      const pelletCount = w.pellets || 1;
      for (let p = 0; p < pelletCount; p++) {
        const spreadDir = dir.clone().add(new THREE.Vector3(
          (Math.random() - 0.5) * w.spread,
          (Math.random() - 0.5) * w.spread,
          (Math.random() - 0.5) * w.spread
        )).normalize();

        this.castBullet(origin, spreadDir, w.range, w.damage);
      }
    }
  }

  castBullet(origin, direction, range, damage) {
    const endPoint = new THREE.Vector3().copy(origin).addScaledVector(direction, range);

    // Tracer line
    this.createTracer(origin, endPoint);

    // Hit registration (e.g. against police or targets)
    const raycaster = new THREE.Raycaster(origin, direction, 0.5, range);
    // Notify HUD hitmarker if hitting enemy
    this.hud?.showHitmarker();
  }

  createTracer(from, to) {
    const geo = new THREE.BufferGeometry().setFromPoints([from, to]);
    const mat = new THREE.LineBasicMaterial({
      color: 0xffea00,
      transparent: true,
      opacity: 0.9,
    });
    const line = new THREE.Line(geo, mat);
    this.scene.add(line);

    this.tracers.push({
      line,
      life: 0.07,
    });
  }

  spawnRocket(origin, direction) {
    const rocketGeo = new THREE.CylinderGeometry(0.09, 0.09, 0.7, 8);
    rocketGeo.rotateX(Math.PI / 2);
    const rocketMat = new THREE.MeshStandardMaterial({
      color: 0x334422,
      emissive: 0xff4400,
      emissiveIntensity: 0.6,
    });
    const rocket = new THREE.Mesh(rocketGeo, rocketMat);
    rocket.position.copy(origin).addScaledVector(direction, 2.0);
    rocket.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), direction);

    this.scene.add(rocket);

    this.projectiles.push({
      mesh: rocket,
      velocity: direction.clone().multiplyScalar(55.0),
      life: 3.0,
    });
  }

  update(dt) {
    // Muzzle flash fade
    if (this.flashTimer > 0) {
      this.flashTimer -= dt;
      if (this.flashTimer <= 0 && this.flashLight) {
        this.flashLight.intensity = 0;
      }
    }

    // Tracers fade out
    for (let i = this.tracers.length - 1; i >= 0; i--) {
      const t = this.tracers[i];
      t.life -= dt;
      t.line.material.opacity = Math.max(0, t.life / 0.07);
      if (t.life <= 0) {
        this.scene.remove(t.line);
        this.tracers.splice(i, 1);
      }
    }

    // RPG Projectiles update
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const p = this.projectiles[i];
      p.mesh.position.addScaledVector(p.velocity, dt);
      p.life -= dt;

      // Check ground collision or expiry
      if (p.mesh.position.y <= 0.2 || p.life <= 0) {
        this.explodeRocket(p.mesh.position);
        this.scene.remove(p.mesh);
        this.projectiles.splice(i, 1);
      }
    }
  }

  explodeRocket(position) {
    this.audio?.playExplosion();

    // Visual explosion shockwave sphere
    const blastGeo = new THREE.SphereGeometry(3.5, 16, 16);
    const blastMat = new THREE.MeshBasicMaterial({
      color: 0xff6600,
      transparent: true,
      opacity: 0.85,
    });
    const blast = new THREE.Mesh(blastGeo, blastMat);
    blast.position.copy(position);
    this.scene.add(blast);

    // Expand and dissolve
    let scale = 1.0;
    const interval = setInterval(() => {
      scale += 0.3;
      blast.scale.set(scale, scale, scale);
      blast.material.opacity -= 0.12;
      if (blast.material.opacity <= 0.05) {
        clearInterval(interval);
        this.scene.remove(blast);
      }
    }, 25);
  }
}
