// 3D Player Controller & Camera System for SOLIS CITY: CORAL COAST
// Features: Dynamic on-foot & driving transitions, stylized 3D character mesh,
// health/armor status, and smooth cinematic 3rd-person chase camera.

export class Player {
  constructor(scene, camera) {
    this.scene = scene;
    this.camera = camera;

    this.position = new THREE.Vector3(-280, 0, -20);
    this.velocity = new THREE.Vector3();
    this.rotation = 0;

    this.health = 100;
    this.maxHealth = 100;
    this.armor = 100;
    this.maxArmor = 100;
    this.stamina = 100;

    this.inVehicle = false;
    this.vehicle = null;

    this.camDistance = 7.5;
    this.camHeight = 3.2;
    this.camYaw = 0;
    this.camPitch = 0.2;

    this.buildCharacterModel();
  }

  buildCharacterModel() {
    this.mesh = new THREE.Group();

    // Stylized protagonist (Marcus 'Vice' Vance)
    const jacketMat = new THREE.MeshStandardMaterial({ color: 0x182436, roughness: 0.6 });
    const pantsMat = new THREE.MeshStandardMaterial({ color: 0x12141a, roughness: 0.8 });
    const skinMat = new THREE.MeshStandardMaterial({ color: 0xcca080, roughness: 0.7 });
    const hairMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.9 });

    // Torso / Jacket
    const torso = new THREE.Mesh(new THREE.BoxGeometry(0.8, 1.0, 0.45), jacketMat);
    torso.position.y = 1.3;
    torso.castShadow = true;
    this.mesh.add(torso);

    // Head
    const head = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.48, 0.45), skinMat);
    head.position.y = 2.05;
    this.mesh.add(head);

    // Hair / Sunglasses
    const hair = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.18, 0.48), hairMat);
    hair.position.y = 2.25;
    this.mesh.add(hair);

    const shades = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.1, 0.1), new THREE.MeshBasicMaterial({ color: 0x00f0ff }));
    shades.position.set(0, 2.08, -0.22);
    this.mesh.add(shades);

    // Legs
    [-0.22, 0.22].forEach(x => {
      const leg = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.95, 0.35), pantsMat);
      leg.position.set(x, 0.5, 0);
      this.mesh.add(leg);
    });

    // Weapon In Hand (Pistol / Carbine holstered)
    this.weaponMesh = new THREE.Mesh(
      new THREE.BoxGeometry(0.12, 0.22, 0.6),
      new THREE.MeshStandardMaterial({ color: 0x1f242d, metalness: 0.9 })
    );
    this.weaponMesh.position.set(0.45, 1.25, -0.3);
    this.mesh.add(this.weaponMesh);

    this.mesh.position.copy(this.position);
    this.scene.add(this.mesh);
  }

  enterVehicle(vehicle) {
    this.inVehicle = true;
    this.vehicle = vehicle;
    this.mesh.visible = false;
  }

  exitVehicle() {
    if (!this.inVehicle) return;
    this.inVehicle = false;
    this.position.set(
      this.vehicle.position.x + 2.5,
      0,
      this.vehicle.position.z
    );
    this.mesh.position.copy(this.position);
    this.mesh.visible = true;
    this.vehicle = null;
  }

  takeDamage(amount) {
    if (this.armor > 0) {
      const absorb = Math.min(this.armor, amount * 0.7);
      this.armor -= absorb;
      amount -= absorb;
    }
    this.health = Math.max(0, this.health - amount);

    // Flash Damage Vignette
    const vig = document.getElementById('damage-vignette');
    if (vig) {
      vig.classList.add('active');
      setTimeout(() => vig.classList.remove('active'), 180);
    }
  }

  update(dt, input, city) {
    if (this.inVehicle && this.vehicle) {
      // Sync player coordinates with vehicle
      this.position.copy(this.vehicle.position);
      this.rotation = this.vehicle.rotation.y;

      // Dynamic Chase Camera behind vehicle
      const speedKm = Math.abs(this.vehicle.speed) * 3.6;
      const targetDist = this.camDistance + (speedKm / 240) * 4.5;
      const targetHeight = this.camHeight + (speedKm / 240) * 1.5;

      const angle = this.vehicle.rotation.y;
      const backX = Math.sin(angle);
      const backZ = Math.cos(angle);

      const targetCamX = this.vehicle.position.x + backX * targetDist;
      const targetCamZ = this.vehicle.position.z + backZ * targetDist;
      const targetCamY = this.vehicle.position.y + targetHeight;

      this.camera.position.x += (targetCamX - this.camera.position.x) * 8.0 * dt;
      this.camera.position.y += (targetCamY - this.camera.position.y) * 8.0 * dt;
      this.camera.position.z += (targetCamZ - this.camera.position.z) * 8.0 * dt;

      const lookTarget = new THREE.Vector3(
        this.vehicle.position.x - backX * 4.0,
        this.vehicle.position.y + 1.2,
        this.vehicle.position.z - backZ * 4.0
      );
      this.camera.lookAt(lookTarget);

      // FOV Expansion on Nitro
      if (this.vehicle.nitroActive) {
        this.camera.fov = THREE.MathUtils.lerp(this.camera.fov, 82, dt * 6);
      } else {
        this.camera.fov = THREE.MathUtils.lerp(this.camera.fov, 68, dt * 4);
      }
      this.camera.updateProjectionMatrix();

    } else {
      // On Foot Controller
      const speed = input.sprint ? 9.5 : 4.8;
      let moveX = 0;
      let moveZ = 0;

      if (input.forward) moveZ -= 1;
      if (input.backward) moveZ += 1;
      if (input.left) moveX -= 1;
      if (input.right) moveX += 1;

      if (moveX !== 0 || moveZ !== 0) {
        const len = Math.sqrt(moveX * moveX + moveZ * moveZ);
        moveX /= len;
        moveZ /= len;

        // Orient movement relative to camera yaw
        const sinYaw = Math.sin(this.camYaw);
        const cosYaw = Math.cos(this.camYaw);

        const worldX = moveX * cosYaw + moveZ * sinYaw;
        const worldZ = -moveX * sinYaw + moveZ * cosYaw;

        const nextX = this.position.x + worldX * speed * dt;
        const nextZ = this.position.z + worldZ * speed * dt;

        const col = city.checkCollision(nextX, nextZ, 0.6);
        if (!col.hit) {
          this.position.x = nextX;
          this.position.z = nextZ;
        }

        this.rotation = Math.atan2(worldX, worldZ) + Math.PI;
      }

      this.mesh.position.copy(this.position);
      this.mesh.rotation.y = this.rotation;

      // 3rd Person Follow Camera
      const targetCamX = this.position.x + Math.sin(this.camYaw) * 4.8;
      const targetCamZ = this.position.z + Math.cos(this.camYaw) * 4.8;
      const targetCamY = this.position.y + 2.4;

      this.camera.position.x += (targetCamX - this.camera.position.x) * 10 * dt;
      this.camera.position.y += (targetCamY - this.camera.position.y) * 10 * dt;
      this.camera.position.z += (targetCamZ - this.camera.position.z) * 10 * dt;

      this.camera.lookAt(this.position.x, this.position.y + 1.4, this.position.z);
    }
  }
}
