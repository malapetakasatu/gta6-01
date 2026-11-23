import * as THREE from './three.module.js';

/**
 * Solis City: Coral Coast - Third Person Player Character Controller
 * Stylized criminal protagonist mesh, 3rd person camera lag, sprint, and vehicle entry/exit.
 */

export class Player {
  constructor(scene, camera, audioManager) {
    this.scene = scene;
    this.camera = camera;
    this.audio = audioManager;

    this.position = new THREE.Vector3(0, 0, 0);
    this.rotation = new THREE.Euler(0, 0, 0, 'YXZ');
    this.heading = 0;

    this.speed = 0;
    this.walkSpeed = 5.5;
    this.sprintSpeed = 10.5;
    this.isSprinting = false;

    this.health = 100;
    this.armor = 100;

    this.inVehicle = false;
    this.currentVehicle = null;

    this.cameraDistance = 5.2;
    this.cameraHeight = 2.4;
    this.cameraLookLag = new THREE.Vector3();

    this.keys = {};
    this.initInput();
    this.buildCharacterMesh();
  }

  initInput() {
    window.addEventListener('keydown', (e) => {
      this.keys[e.code] = true;
      if (e.code === 'KeyF' || e.code === 'KeyE') {
        this.toggleVehicleInteraction();
      }
    });
    window.addEventListener('keyup', (e) => {
      this.keys[e.code] = false;
    });
  }

  buildCharacterMesh() {
    this.mesh = new THREE.Group();

    // Stylized Vice City / Solis criminal: Hawaiian floral bomber jacket & sunglasses
    // Torso / Jacket
    const torsoGeo = new THREE.BoxGeometry(0.72, 0.95, 0.42);
    const torsoMat = new THREE.MeshStandardMaterial({
      color: 0x1f7a8c, // vibrant turquoise bomber
      roughness: 0.6,
      metalness: 0.1,
    });
    const torso = new THREE.Mesh(torsoGeo, torsoMat);
    torso.position.y = 1.35;
    this.mesh.add(torso);

    // Inner tee
    const teeGeo = new THREE.BoxGeometry(0.4, 0.7, 0.44);
    const teeMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.8 });
    const tee = new THREE.Mesh(teeGeo, teeMat);
    tee.position.set(0, 1.35, 0.02);
    this.mesh.add(tee);

    // Head
    const headGeo = new THREE.BoxGeometry(0.4, 0.45, 0.4);
    const skinMat = new THREE.MeshStandardMaterial({ color: 0xe0a986, roughness: 0.7 });
    const head = new THREE.Mesh(headGeo, skinMat);
    head.position.y = 2.05;
    this.mesh.add(head);

    // Hair / Slick cut
    const hairGeo = new THREE.BoxGeometry(0.42, 0.18, 0.42);
    const hairMat = new THREE.MeshStandardMaterial({ color: 0x1e1510, roughness: 0.9 });
    const hair = new THREE.Mesh(hairGeo, hairMat);
    hair.position.set(0, 2.25, -0.02);
    this.mesh.add(hair);

    // Aviator Sunglasses
    const glassesGeo = new THREE.BoxGeometry(0.44, 0.12, 0.12);
    const glassesMat = new THREE.MeshStandardMaterial({ color: 0x0a0a0a, metalness: 0.95, roughness: 0.1 });
    const glasses = new THREE.Mesh(glassesGeo, glassesMat);
    glasses.position.set(0, 2.08, 0.18);
    this.mesh.add(glasses);

    // Limbs: Legs
    const legGeo = new THREE.BoxGeometry(0.28, 0.9, 0.32);
    const pantsMat = new THREE.MeshStandardMaterial({ color: 0x1a2130, roughness: 0.7 });

    this.leftLeg = new THREE.Mesh(legGeo, pantsMat);
    this.leftLeg.position.set(-0.2, 0.5, 0);
    this.mesh.add(this.leftLeg);

    this.rightLeg = new THREE.Mesh(legGeo, pantsMat);
    this.rightLeg.position.set(0.2, 0.5, 0);
    this.mesh.add(this.rightLeg);

    // Arms
    const armGeo = new THREE.BoxGeometry(0.22, 0.85, 0.24);
    this.leftArm = new THREE.Mesh(armGeo, torsoMat);
    this.leftArm.position.set(-0.5, 1.35, 0);
    this.mesh.add(this.leftArm);

    this.rightArm = new THREE.Mesh(armGeo, torsoMat);
    this.rightArm.position.set(0.5, 1.35, 0);
    this.mesh.add(this.rightArm);

    // Holster on hip
    const holsterGeo = new THREE.BoxGeometry(0.12, 0.25, 0.18);
    const holsterMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.8 });
    const holster = new THREE.Mesh(holsterGeo, holsterMat);
    holster.position.set(0.38, 0.95, 0);
    this.mesh.add(holster);

    this.scene.add(this.mesh);
    this.walkCycle = 0;
  }

  getPosition() {
    if (this.inVehicle && this.currentVehicle) {
      return this.currentVehicle.mesh.position;
    }
    return this.mesh.position;
  }

  getHeading() {
    if (this.inVehicle && this.currentVehicle) {
      return this.currentVehicle.mesh.rotation.y;
    }
    return this.heading;
  }

  enterVehicle(vehicle) {
    if (!vehicle) return;
    this.inVehicle = true;
    this.currentVehicle = vehicle;
    vehicle.active = true;
    this.mesh.visible = false;
    this.audio?.startEngine();
  }

  exitVehicle() {
    if (!this.inVehicle || !this.currentVehicle) return;
    this.inVehicle = false;
    this.audio?.stopEngine();

    // Position player next to vehicle driver side
    const vPos = this.currentVehicle.mesh.position;
    const vRot = this.currentVehicle.mesh.rotation.y;
    const sideOffset = new THREE.Vector3(-2.2, 0, 0).applyAxisAngle(new THREE.Vector3(0, 1, 0), vRot);

    this.mesh.position.copy(vPos).add(sideOffset);
    this.mesh.position.y = 0;
    this.heading = vRot;
    this.mesh.rotation.y = this.heading;
    this.mesh.visible = true;

    this.currentVehicle.speed = 0;
    this.currentVehicle = null;
  }

  toggleVehicleInteraction() {
    if (this.inVehicle) {
      this.exitVehicle();
    } else {
      // Find closest vehicle in scene
      window.gameEngine?.tryEnterClosestVehicle();
    }
  }

  takeDamage(amount) {
    if (this.armor > 0) {
      const absorbed = Math.min(this.armor, amount);
      this.armor -= absorbed;
      amount -= absorbed;
    }
    if (amount > 0) {
      this.health = Math.max(0, this.health - amount);
    }
  }

  update(dt) {
    if (this.inVehicle && this.currentVehicle) {
      // Vehicle driving mode
      this.updateInVehicle(dt);
    } else {
      // On-foot movement mode
      this.updateOnFoot(dt);
    }

    this.updateCamera(dt);
  }

  updateOnFoot(dt) {
    this.isSprinting = !!(this.keys['ShiftLeft'] || this.keys['ShiftRight']);
    const targetSpeed = this.isSprinting ? this.sprintSpeed : this.walkSpeed;

    const moveVector = new THREE.Vector3(0, 0, 0);

    if (this.keys['KeyW'] || this.keys['ArrowUp']) moveVector.z += 1;
    if (this.keys['KeyS'] || this.keys['ArrowDown']) moveVector.z -= 1;
    if (this.keys['KeyA'] || this.keys['ArrowLeft']) moveVector.x += 1;
    if (this.keys['KeyD'] || this.keys['ArrowRight']) moveVector.x -= 1;

    const isMoving = moveVector.lengthSq() > 0.001;

    if (isMoving) {
      moveVector.normalize();
      // Calculate intended direction based on input
      const moveAngle = Math.atan2(moveVector.x, moveVector.z);
      this.heading = moveAngle;
      this.mesh.rotation.y = this.heading;

      // Move player position forward along heading
      const forward = new THREE.Vector3(0, 0, 1).applyAxisAngle(new THREE.Vector3(0, 1, 0), this.heading);
      this.mesh.position.addScaledVector(forward, targetSpeed * dt);

      // Animate limb walk cycle
      this.walkCycle += dt * (this.isSprinting ? 14 : 9);
      const legAngle = Math.sin(this.walkCycle) * (this.isSprinting ? 0.7 : 0.4);
      this.leftLeg.rotation.x = legAngle;
      this.rightLeg.rotation.x = -legAngle;
      this.leftArm.rotation.x = -legAngle * 0.8;
      this.rightArm.rotation.x = legAngle * 0.8;
    } else {
      // Idle pose reset
      this.leftLeg.rotation.x *= 0.85;
      this.rightLeg.rotation.x *= 0.85;
      this.leftArm.rotation.x *= 0.85;
      this.rightArm.rotation.x *= 0.85;
    }
  }

  updateInVehicle(dt) {
    const v = this.currentVehicle;
    if (!v) return;

    const throttle = (this.keys['KeyW'] || this.keys['ArrowUp']) ? 1 : 0;
    const brake = (this.keys['KeyS'] || this.keys['ArrowDown']) ? 1 : 0;
    const steerLeft = (this.keys['KeyA'] || this.keys['ArrowLeft']) ? 1 : 0;
    const steerRight = (this.keys['KeyD'] || this.keys['ArrowRight']) ? 1 : 0;
    const handbrake = !!this.keys['Space'];

    v.updatePhysics(dt, throttle, brake, steerLeft - steerRight, handbrake);

    // Update audio engine RPM
    const speedRatio = Math.abs(v.speed) / v.maxSpeed;
    this.audio?.updateEngine(speedRatio, Math.min(1.0, speedRatio * 1.2 + 0.1));
  }

  updateCamera(dt) {
    const targetPos = this.getPosition();
    const heading = this.getHeading();

    const dist = this.inVehicle ? 7.8 : this.cameraDistance;
    const height = this.inVehicle ? 3.2 : this.cameraHeight;

    // Calculate desired camera location behind target based on heading
    const camOffset = new THREE.Vector3(0, height, -dist).applyAxisAngle(new THREE.Vector3(0, 1, 0), heading);
    const desiredCamPos = new THREE.Vector3().copy(targetPos).add(camOffset);

    // Smooth camera lag
    const lerpFactor = this.inVehicle ? 6.0 * dt : 9.0 * dt;
    this.camera.position.lerp(desiredCamPos, Math.min(1.0, lerpFactor));

    // Look at player / vehicle center with smooth damping
    const lookTarget = new THREE.Vector3(targetPos.x, targetPos.y + 1.2, targetPos.z);
    this.cameraLookLag.lerp(lookTarget, Math.min(1.0, 12.0 * dt));
    this.camera.lookAt(this.cameraLookLag);
  }
}
