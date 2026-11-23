// SOLIS CITY: CORAL COAST - 3rd Person Player Controller & Chase Camera
// Character mesh, health/armour stats, vehicle mounting, dynamic camera lag & FOV.

const THREE = window.THREE;

export class Player {
  constructor(scene, camera, vehicleManager) {
    this.scene = scene;
    this.camera = camera;
    this.vm = vehicleManager;

    this.inVehicle = true; // Start ready in supercar
    this.health = 100;
    this.maxHealth = 100;
    this.armour = 100;
    this.maxArmour = 100;

    this.pos = new THREE.Vector3(100, 0, 40);
    this.rotY = 0;
    this.moveSpeed = 0.28;

    // Dynamic Camera Configuration
    this.cameraOffset = new THREE.Vector3(0, 3.8, -7.5);
    this.cameraTarget = new THREE.Vector3();
    this.baseFOV = 62;
    this.targetFOV = 62;

    this.createCharacterMesh();
  }

  createCharacterMesh() {
    this.charGroup = new THREE.Group();

    // Stylized protagonist (Coral Coast Vice floral shirt & sunglasses)
    const torsoGeo = new THREE.BoxGeometry(0.8, 1.1, 0.45);
    const shirtMat = new THREE.MeshStandardMaterial({
      color: 0x00f0ff,
      roughness: 0.6
    });
    const torso = new THREE.Mesh(torsoGeo, shirtMat);
    torso.position.y = 1.35;
    torso.castShadow = true;
    this.charGroup.add(torso);

    // Head & Aviator Shades
    const headGeo = new THREE.BoxGeometry(0.45, 0.45, 0.45);
    const skinMat = new THREE.MeshStandardMaterial({ color: 0xdec19b, roughness: 0.8 });
    const head = new THREE.Mesh(headGeo, skinMat);
    head.position.y = 2.15;
    this.charGroup.add(head);

    const shadesGeo = new THREE.BoxGeometry(0.48, 0.14, 0.2);
    const shadesMat = new THREE.MeshBasicMaterial({ color: 0x111111 });
    const shades = new THREE.Mesh(shadesGeo, shadesMat);
    shades.position.set(0, 2.18, 0.22);
    this.charGroup.add(shades);

    // Legs / Pants
    const legGeo = new THREE.BoxGeometry(0.32, 0.9, 0.35);
    const pantsMat = new THREE.MeshStandardMaterial({ color: 0x1a2233 });
    const legL = new THREE.Mesh(legGeo, pantsMat);
    legL.position.set(-0.22, 0.55, 0);
    this.charGroup.add(legL);
    const legR = new THREE.Mesh(legGeo, pantsMat);
    legR.position.set(0.22, 0.55, 0);
    this.charGroup.add(legR);

    this.charGroup.position.copy(this.pos);
    this.scene.add(this.charGroup);
    this.charGroup.visible = !this.inVehicle;
  }

  toggleVehicle() {
    const car = this.vm.supercar;
    if (this.inVehicle) {
      // Exit vehicle to the left
      this.inVehicle = false;
      this.pos.copy(car.pos).add(new THREE.Vector3(-2.8, 0, 0));
      this.charGroup.position.copy(this.pos);
      this.charGroup.visible = true;
    } else {
      // Enter vehicle if near
      if (this.pos.distanceTo(car.pos) < 6.0) {
        this.inVehicle = true;
        this.charGroup.visible = false;
      }
    }
  }

  takeDamage(amount) {
    if (this.armour > 0) {
      const absorbed = Math.min(this.armour, amount * 0.7);
      this.armour -= absorbed;
      amount -= absorbed;
    }
    this.health = Math.max(0, this.health - amount);

    // Screen hit feedback
    const vig = document.getElementById('damage-vignette');
    if (vig) {
      vig.classList.add('hit');
      setTimeout(() => vig.classList.remove('hit'), 180);
    }
  }

  update(input, delta) {
    if (this.inVehicle) {
      const car = this.vm.supercar;
      this.pos.copy(car.pos);
      this.rotY = car.rotY;

      // Dynamic Chase Camera behind Supercar
      const desiredCamPos = car.pos.clone().add(
        new THREE.Vector3(
          -Math.sin(car.rotY) * 8.2,
          3.4,
          -Math.cos(car.rotY) * 8.2
        )
      );

      this.camera.position.lerp(desiredCamPos, 0.12);
      this.cameraTarget.copy(car.pos).add(new THREE.Vector3(0, 1.4, 0));
      this.camera.lookAt(this.cameraTarget);

      // Speed-based dynamic FOV widening (60° to 76°)
      const speedNorm = Math.min(1.0, Math.abs(car.speed) / car.maxSpeed);
      this.targetFOV = this.baseFOV + speedNorm * 14;
      this.camera.fov = THREE.MathUtils.lerp(this.camera.fov, this.targetFOV, 0.1);
      this.camera.updateProjectionMatrix();

    } else {
      // On-foot controls
      let moveX = 0;
      let moveZ = 0;
      if (input.forward) moveZ += 1;
      if (input.backward) moveZ -= 1;
      if (input.left) moveX -= 1;
      if (input.right) moveX += 1;

      if (moveX !== 0 || moveZ !== 0) {
        const moveVec = new THREE.Vector3(moveX, 0, moveZ).normalize().multiplyScalar(this.moveSpeed);
        this.pos.add(moveVec);
        this.rotY = Math.atan2(moveX, moveZ);
      }

      this.charGroup.position.copy(this.pos);
      this.charGroup.rotation.y = this.rotY;

      // On-foot 3rd person chase camera
      const desiredCamPos = this.pos.clone().add(new THREE.Vector3(0, 4.0, -6.5));
      this.camera.position.lerp(desiredCamPos, 0.1);
      this.camera.lookAt(this.pos.x, this.pos.y + 1.6, this.pos.z);
    }
  }
}
