// Combat, Weapons Arsenal, Projectile Tracers & FX for Solis City: Coral Coast
// Includes: Pistol, Viper-9 SMG, Carbine-15 Assault Rifle, Heavy Sniper with raycasts, muzzle flashes & particle sparks.

function createCombatSystem(scene) {
  const combat = {
    weapons: [
      { name: 'P9-COMBAT', ammo: 15, maxAmmo: 60, rate: 0.28, damage: 22, range: 75, recoil: 0.1 },
      { name: 'VIPER-9 SMG', ammo: 32, maxAmmo: 180, rate: 0.11, damage: 18, range: 90, recoil: 0.14 },
      { name: 'CARBINE-15', ammo: 30, maxAmmo: 210, rate: 0.14, damage: 34, range: 140, recoil: 0.18 },
      { name: 'HEAVY SNIPER', ammo: 5, maxAmmo: 30, rate: 1.1, damage: 110, range: 240, recoil: 0.35 }
    ],
    currentWeaponIndex: 2, // Starts with Carbine-15
    lastFireTime: 0,
    tracers: [],
    sparks: [],
    muzzleFlashMesh: null
  };

  // Muzzle flash light
  const flashLight = new THREE.PointLight(0xffaa22, 0, 15);
  scene.add(flashLight);
  combat.flashLight = flashLight;

  combat.getCurrentWeapon = function () {
    return combat.weapons[combat.currentWeaponIndex];
  };

  combat.nextWeapon = function () {
    combat.currentWeaponIndex = (combat.currentWeaponIndex + 1) % combat.weapons.length;
    return combat.getCurrentWeapon();
  };

  combat.prevWeapon = function () {
    combat.currentWeaponIndex = (combat.currentWeaponIndex - 1 + combat.weapons.length) % combat.weapons.length;
    return combat.getCurrentWeapon();
  };

  // Fire current weapon
  combat.fire = function (player, camera, policeCruisers, policeHeli) {
    const now = performance.now() / 1000;
    const wep = combat.getCurrentWeapon();

    if (now - combat.lastFireTime < wep.rate) return;
    if (wep.ammo <= 0) return;

    combat.lastFireTime = now;
    wep.ammo--;

    // Play gunshot sound FX
    if (window.soundFX) {
      window.soundFX.playGunshot(wep.name);
    }

    // Determine fire origin & direction
    const origin = player.inVehicle && player.vehicle
      ? player.vehicle.position.clone().add(new THREE.Vector3(0, 1.4, 0))
      : player.position.clone().add(new THREE.Vector3(0, 1.6, 0));

    // Cast ray forward along camera aim direction
    const dir = new THREE.Vector3();
    camera.getWorldDirection(dir);
    // Add tiny spread
    dir.x += (Math.random() - 0.5) * wep.recoil * 0.15;
    dir.y += (Math.random() - 0.5) * wep.recoil * 0.15;
    dir.z += (Math.random() - 0.5) * wep.recoil * 0.15;
    dir.normalize();

    // Flash light at origin
    combat.flashLight.position.copy(origin);
    combat.flashLight.intensity = 4.0;
    setTimeout(() => { combat.flashLight.intensity = 0; }, 50);

    // Bullet Tracer Line
    const targetEnd = origin.clone().add(dir.clone().multiplyScalar(wep.range));
    const tracerGeo = new THREE.BufferGeometry().setFromPoints([origin, targetEnd]);
    const tracerMat = new THREE.LineBasicMaterial({
      color: 0xffea55,
      transparent: true,
      opacity: 0.95,
      linewidth: 2
    });
    const tracerLine = new THREE.Line(tracerGeo, tracerMat);
    scene.add(tracerLine);
    combat.tracers.push({ mesh: tracerLine, birth: now, life: 0.08 });

    // Hit Detection against Police Cruisers
    let hitSomething = false;
    policeCruisers.forEach(car => {
      const dist = car.position.distanceTo(origin);
      if (dist < wep.range) {
        const toCar = new THREE.Vector3().subVectors(car.position, origin).normalize();
        const angle = dir.angleTo(toCar);
        if (angle < 0.18) {
          // Hit cruiser!
          car.userData.health -= wep.damage;
          hitSomething = true;
          combat.spawnImpactSparks(car.position.clone().add(new THREE.Vector3(0, 1, 0)));
          if (car.userData.health <= 0) {
            // Explode cruiser
            combat.destroyVehicle(car, scene, policeCruisers);
          }
        }
      }
    });

    // Hit Detection against Condor-1 Helicopter
    if (policeHeli) {
      const toHeli = new THREE.Vector3().subVectors(policeHeli.position, origin).normalize();
      const angle = dir.angleTo(toHeli);
      if (angle < 0.22) {
        policeHeli.userData.health -= wep.damage;
        combat.spawnImpactSparks(policeHeli.position);
        if (policeHeli.userData.health <= 0) {
          combat.destroyHelicopter(policeHeli, scene);
        }
      }
    }
  };

  combat.spawnImpactSparks = function (pos) {
    for (let i = 0; i < 5; i++) {
      const sparkGeo = new THREE.BufferGeometry().setFromPoints([
        pos,
        pos.clone().add(new THREE.Vector3(
          (Math.random() - 0.5) * 1.5,
          Math.random() * 1.5,
          (Math.random() - 0.5) * 1.5
        ))
      ]);
      const sparkMat = new THREE.LineBasicMaterial({ color: 0xffaa00 });
      const spark = new THREE.Line(sparkGeo, sparkMat);
      scene.add(spark);
      combat.sparks.push({ mesh: spark, birth: performance.now() / 1000, life: 0.12 });
    }
  };

  combat.destroyVehicle = function (car, scn, list) {
    if (window.soundFX) window.soundFX.playExplosion();
    // Turn chassis black and char
    car.traverse(child => {
      if (child.isMesh && child.material) {
        child.material = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.95 });
      }
    });
    // Add smoke particle effect
    const idx = list.indexOf(car);
    if (idx !== -1) list.splice(idx, 1);
    setTimeout(() => scn.remove(car), 4000);
  };

  combat.destroyHelicopter = function (heli, scn) {
    if (window.soundFX) window.soundFX.playExplosion();
    scn.remove(heli);
  };

  combat.update = function (dt) {
    const now = performance.now() / 1000;
    // Fade out tracers
    for (let i = combat.tracers.length - 1; i >= 0; i--) {
      const tr = combat.tracers[i];
      if (now - tr.birth > tr.life) {
        scene.remove(tr.mesh);
        combat.tracers.splice(i, 1);
      }
    }
    // Fade out sparks
    for (let i = combat.sparks.length - 1; i >= 0; i--) {
      const sp = combat.sparks[i];
      if (now - sp.birth > sp.life) {
        scene.remove(sp.mesh);
        combat.sparks.splice(i, 1);
      }
    }
  };

  return combat;
}

window.createCombatSystem = createCombatSystem;
