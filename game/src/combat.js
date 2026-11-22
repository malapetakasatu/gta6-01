// combat.js: Weapon Arsenal, Projectiles & Particle Effects
export function createCombatSystem(scene) {
  const weapons = [
    { name: 'Fists', ammo: Infinity, maxAmmo: Infinity, damage: 15, fireRate: 0.5 },
    { name: '.45 Heavy Pistol', ammo: 12, maxAmmo: 48, damage: 32, fireRate: 0.35 },
    { name: 'Combat SMG', ammo: 30, maxAmmo: 120, damage: 22, fireRate: 0.1 },
    { name: '12G Trench Shotgun', ammo: 8, maxAmmo: 24, damage: 85, fireRate: 0.8 },
    { name: 'AR-9 Tactical Carbine', ammo: 30, maxAmmo: 90, damage: 38, fireRate: 0.14 }
  ];

  let currentWeaponIndex = 2; // SMG selected
  const bullets = [];
  const muzzleFlashes = [];

  // Muzzle flash sprite factory
  const flashGeo = new THREE.SphereGeometry(0.35, 8, 8);
  const flashMat = new THREE.MeshBasicMaterial({ color: 0xffdd44 });

  function shoot(origin, direction) {
    const w = weapons[currentWeaponIndex];
    if (w.ammo <= 0 && w.ammo !== Infinity) return;
    if (w.ammo !== Infinity) w.ammo--;

    // Create flash
    const flash = new THREE.Mesh(flashGeo, flashMat);
    flash.position.copy(origin).add(direction.clone().multiplyScalar(0.8));
    scene.add(flash);
    muzzleFlashes.push({ mesh: flash, life: 0.05 });

    // Tracer line
    const bulletGeo = new THREE.CylinderGeometry(0.04, 0.04, 1.2, 4);
    const bulletMat = new THREE.MeshBasicMaterial({ color: 0xffaa00 });
    const bullet = new THREE.Mesh(bulletGeo, bulletMat);
    bullet.position.copy(origin);
    bullet.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.clone().normalize());
    scene.add(bullet);

    bullets.push({
      mesh: bullet,
      dir: direction.clone().normalize(),
      speed: 120,
      life: 1.5
    });
  }

  function update(delta) {
    // Update bullets
    for (let i = bullets.length - 1; i >= 0; i--) {
      const b = bullets[i];
      b.mesh.position.add(b.dir.clone().multiplyScalar(b.speed * delta));
      b.life -= delta;
      if (b.life <= 0) {
        scene.remove(b.mesh);
        bullets.splice(i, 1);
      }
    }

    // Update flashes
    for (let i = muzzleFlashes.length - 1; i >= 0; i--) {
      const f = muzzleFlashes[i];
      f.life -= delta;
      if (f.life <= 0) {
        scene.remove(f.mesh);
        muzzleFlashes.splice(i, 1);
      }
    }
  }

  return {
    weapons,
    getCurrentWeapon: () => weapons[currentWeaponIndex],
    setWeapon: (idx) => { if (idx >= 0 && idx < weapons.length) currentWeaponIndex = idx; },
    shoot,
    update
  };
}