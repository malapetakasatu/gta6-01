// SOLIS CITY: CORAL COAST (v2.0 AAA WebGL Engine) - 5-Tier Tactical Arsenal & Raycast Ballistics
// Solis .45, Coral-9 SMG, CAR-80 Carbine, Enforcer 12G, Titan RPG Rocket Launcher.

const THREE = window.THREE;

export class CombatSystem {
  constructor(scene, camera, audioManager) {
    this.scene = scene;
    this.camera = camera;
    this.audio = audioManager;

    this.weapons = [
      { id: 1, name: "SOLIS .45 PISTOL", icon: "🔫", ammo: 12, maxAmmo: 12, total: 60, damage: 28, fireRate: 0.28, sound: "pistol" },
      { id: 2, name: "CORAL-9 SMG", icon: "⚡", ammo: 30, maxAmmo: 30, total: 180, damage: 18, fireRate: 0.09, sound: "smg" },
      { id: 3, name: "CAR-80 CARBINE", icon: "🔥", ammo: 30, maxAmmo: 30, total: 150, damage: 36, fireRate: 0.13, sound: "rifle" },
      { id: 4, name: "ENFORCER 12G", icon: "💥", ammo: 8, maxAmmo: 8, total: 40, damage: 72, fireRate: 0.65, sound: "shotgun" },
      { id: 5, name: "TITAN RPG", icon: "🚀", ammo: 1, maxAmmo: 1, total: 6, damage: 250, fireRate: 1.6, sound: "rpg" }
    ];

    this.currentWeaponIndex = 2; // Default: CAR-80 Carbine
    this.lastFireTime = 0;
    this.tracers = [];
    this.projectiles = [];
    this.muzzleFlashLight = this.createMuzzleLight();

    this.raycaster = new THREE.Raycaster();
    this.updateHUD();
  }

  createMuzzleLight() {
    const light = new THREE.PointLight(0xffaa22, 0, 15);
    this.scene.add(light);
    return light;
  }

  getCurrentWeapon() {
    return this.weapons[this.currentWeaponIndex];
  }

  selectWeapon(index) {
    if (index >= 0 && index < this.weapons.length) {
      this.currentWeaponIndex = index;
      this.updateHUD();
    }
  }

  reload() {
    const w = this.getCurrentWeapon();
    if (w.total > 0 && w.ammo < w.maxAmmo) {
      const needed = w.maxAmmo - w.ammo;
      const reloadCount = Math.min(needed, w.total);
      w.ammo += reloadCount;
      w.total -= reloadCount;
      this.updateHUD();
    }
  }

  shoot(origin, direction, targets = []) {
    const now = performance.now() / 1000;
    const w = this.getCurrentWeapon();

    if (now - this.lastFireTime < w.fireRate) return;
    if (w.ammo <= 0) {
      this.reload();
      return;
    }

    w.ammo--;
    this.lastFireTime = now;
    this.updateHUD();

    // Sound synthesis trigger
    if (this.audio) {
      this.audio.playGunshot(w.sound);
    }

    // Dynamic Muzzle Flash
    this.muzzleFlashLight.position.copy(origin);
    this.muzzleFlashLight.intensity = 3.5;
    setTimeout(() => { this.muzzleFlashLight.intensity = 0; }, 40);

    if (w.id === 5) {
      // Titan RPG Rocket Projectile
      this.fireRocket(origin, direction, targets);
    } else {
      // Raycast Instant Ballistics
      this.raycaster.set(origin, direction);
      let hitPoint = origin.clone().add(direction.clone().multiplyScalar(150));

      // Create glowing tracer line
      this.createTracer(origin, hitPoint);

      // Check hit against targets
      targets.forEach(target => {
        if (target.mesh) {
          const dist = origin.distanceTo(target.pos);
          if (dist < 100) {
            target.health -= w.damage;
            this.showHitmarker();
          }
        }
      });
    }
  }

  fireRocket(origin, direction, targets) {
    const rocketGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.8, 8);
    const rocketMat = new THREE.MeshBasicMaterial({ color: 0xffaa00 });
    const rocket = new THREE.Mesh(rocketGeo, rocketMat);
    rocket.position.copy(origin);
    rocket.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction);
    this.scene.add(rocket);

    this.projectiles.push({
      mesh: rocket,
      velocity: direction.clone().multiplyScalar(1.8),
      life: 60,
      targets: targets
    });
  }

  createTracer(from, to) {
    const geo = new THREE.BufferGeometry().setFromPoints([from, to]);
    const mat = new THREE.LineBasicMaterial({
      color: 0xffee66,
      transparent: true,
      opacity: 0.9
    });
    const line = new THREE.Line(geo, mat);
    this.scene.add(line);
    this.tracers.push({ line: line, life: 3 });
  }

  showHitmarker() {
    const hm = document.getElementById('hitmarker');
    if (hm) {
      hm.classList.add('show');
      setTimeout(() => hm.classList.remove('show'), 120);
    }
  }

  updateHUD() {
    const w = this.getCurrentWeapon();
    const nameEl = document.getElementById('weapon-name');
    const clipEl = document.getElementById('ammo-clip');
    const totalEl = document.getElementById('ammo-total');
    const iconEl = document.getElementById('weapon-icon');

    if (nameEl) nameEl.textContent = w.name;
    if (clipEl) clipEl.textContent = w.ammo;
    if (totalEl) totalEl.textContent = w.total;
    if (iconEl) iconEl.textContent = w.icon;
  }

  update(delta) {
    // Fade bullet tracers
    for (let i = this.tracers.length - 1; i >= 0; i--) {
      const t = this.tracers[i];
      t.life--;
      if (t.life <= 0) {
        this.scene.remove(t.line);
        this.tracers.splice(i, 1);
      }
    }

    // Advance Rocket Projectiles
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const p = this.projectiles[i];
      p.mesh.position.add(p.velocity);
      p.life--;

      if (p.life <= 0) {
        if (this.audio) this.audio.playExplosion();
        this.scene.remove(p.mesh);
        this.projectiles.splice(i, 1);
      }
    }
  }
}
