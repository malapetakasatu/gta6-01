// SOLIS CITY: CORAL COAST - Player Controller & Chase Camera
// Handles player states, driving & on-foot physics, 3rd-person chase camera,
// dynamic FOV, health/armour vitals, and input bindings.

/* global THREE */

export class Player {
  constructor(scene, camera, supercar) {
    this.scene = scene;
    this.camera = camera;
    this.supercar = supercar;

    // State: 'driving' or 'onfoot'
    this.state = 'driving';

    // Vitals
    this.health = 100;
    this.maxHealth = 100;
    this.armour = 100;
    this.maxArmour = 100;
    this.stamina = 100;
    this.cash = 84500;
    this.wantedLevel = 3; // Start in intense 3-star pursuit

    // On-foot character avatar
    this.position = new THREE.Vector3(0, 0, 0);
    this.heading = 0;
    this.characterMesh = null;
    this.buildCharacterMesh();

    // Camera chase settings
    this.cameraOffset = new THREE.Vector3(0, 3.2, -6.8);
    this.cameraTarget = new THREE.Vector3();
    this.baseFov = 65;
    this.currentFov = 65;

    // Mouse look offset
    this.mouseYaw = 0;
    this.mousePitch = 0.2;
  }

  buildCharacterMesh() {
    // Stylized modern protagonist character
    this.characterMesh = new THREE.Group();

    const skinMat = new THREE.MeshStandardMaterial({ color: 0xd4a373, roughness: 0.8 });
    const jacketMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.5 }); // Dark Tactical Jacket
    const pantsMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.7 });

    // Torso
    const torsoGeo = new THREE.BoxGeometry(0.7, 0.9, 0.4);
    const torso = new THREE.Mesh(torsoGeo, jacketMat);
    torso.position.y = 1.35;
    torso.castShadow = true;
    this.characterMesh.add(torso);

    // Head
    const headGeo = new THREE.SphereGeometry(0.24, 12, 12);
    const head = new THREE.Mesh(headGeo, skinMat);
    head.position.y = 2.05;
    this.characterMesh.add(head);

    // Legs
    const legGeo = new THREE.BoxGeometry(0.28, 0.9, 0.3);
    const legL = new THREE.Mesh(legGeo, pantsMat);
    legL.position.set(-0.2, 0.45, 0);
    this.characterMesh.add(legL);

    const legR = new THREE.Mesh(legGeo, pantsMat);
    legR.position.set(0.2, 0.45, 0);
    this.characterMesh.add(legR);

    this.characterMesh.visible = (this.state === 'onfoot');
    this.scene.add(this.characterMesh);
  }

  update(dt, input, city) {
    if (this.state === 'driving') {
      // Vehicle driving mode
      this.supercar.update(dt, input, city);
      this.position.copy(this.supercar.position);
      this.heading = this.supercar.heading;

      // Update chase camera behind vehicle
      const speedRatio = Math.abs(this.supercar.speed) / this.supercar.maxSpeed;

      // Dynamic FOV expands with speed & nitro
      const targetFov = this.baseFov + speedRatio * 18 + (this.supercar.isNitroActive ? 12 : 0);
      this.currentFov += (targetFov - this.currentFov) * 5 * dt;
      this.camera.fov = this.currentFov;
      this.camera.updateProjectionMatrix();

      // Camera position calculations
      const chaseDist = 7.2 + speedRatio * 2.2;
      const chaseHeight = 3.2 + speedRatio * 0.5;

      const camX = this.supercar.position.x - Math.sin(this.heading) * chaseDist;
      const camZ = this.supercar.position.z - Math.cos(this.heading) * chaseDist;
      const camY = this.supercar.position.y + chaseHeight;

      const targetCamPos = new THREE.Vector3(camX, camY, camZ);
      this.camera.position.lerp(targetCamPos, dt * 10);

      // Look slightly ahead of car
      const lookLead = 4.0;
      this.cameraTarget.set(
        this.supercar.position.x + Math.sin(this.heading) * lookLead,
        this.supercar.position.y + 1.2,
        this.supercar.position.z + Math.cos(this.heading) * lookLead
      );
      this.camera.lookAt(this.cameraTarget);

    } else {
      // On-foot mode
      let moveX = 0;
      let moveZ = 0;
      const speed = input.nitro ? 8.5 : 4.5; // Sprint or jog

      if (input.forward) { moveX += Math.sin(this.heading); moveZ += Math.cos(this.heading); }
      if (input.backward) { moveX -= Math.sin(this.heading); moveZ -= Math.cos(this.heading); }
      if (input.left) { this.heading += 3.0 * dt; }
      if (input.right) { this.heading -= 3.0 * dt; }

      const nextX = this.position.x + moveX * speed * dt;
      const nextZ = this.position.z + moveZ * speed * dt;

      if (city) {
        const col = city.checkCollision(nextX, nextZ, 0.6);
        if (!col.hit) {
          this.position.x = nextX;
          this.position.z = nextZ;
        }
      } else {
        this.position.x = nextX;
        this.position.z = nextZ;
      }

      this.characterMesh.position.copy(this.position);
      this.characterMesh.rotation.y = this.heading;

      // On-foot camera
      const camX = this.position.x - Math.sin(this.heading) * 4.0;
      const camZ = this.position.z - Math.cos(this.heading) * 4.0;
      const camY = this.position.y + 2.4;

      this.camera.position.lerp(new THREE.Vector3(camX, camY, camZ), dt * 10);
      this.camera.lookAt(this.position.x, this.position.y + 1.6, this.position.z);
    }
  }

  toggleVehicle() {
    if (this.state === 'driving') {
      // Exit vehicle to the left
      this.state = 'onfoot';
      this.position.set(
        this.supercar.position.x - Math.cos(this.supercar.heading) * 2.2,
        0,
        this.supercar.position.z + Math.sin(this.supercar.heading) * 2.2
      );
      this.characterMesh.position.copy(this.position);
      this.characterMesh.visible = true;
    } else {
      // Enter vehicle if close enough
      const d = this.position.distanceTo(this.supercar.position);
      if (d < 4.5) {
        this.state = 'driving';
        this.characterMesh.visible = false;
      }
    }
  }

  takeDamage(amount) {
    if (this.armour > 0) {
      const absorbed = Math.min(this.armour, amount);
      this.armour -= absorbed;
      amount -= absorbed;
    }
    if (amount > 0) {
      this.health = Math.max(0, this.health - amount);
    }

    // Trigger visual screen damage flash
    const flashElem = document.getElementById('damage-flash');
    if (flashElem) {
      flashElem.style.opacity = '1';
      setTimeout(() => { flashElem.style.opacity = '0'; }, 160);
    }
  }
}
