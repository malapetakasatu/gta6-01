// Player Controller, Camera, and Vitals System for Solis City: Coral Coast
// Handles: On-foot pedestrian movement, supercar driving, 3rd person dynamic chase cam, health & armor.

function createPlayer(scene) {
  const player = {
    // State
    inVehicle: true,
    vehicle: null,
    position: new THREE.Vector3(-80, 0.5, -180),
    rotation: 0, // Yaw in radians
    velocity: new THREE.Vector3(),
    onFootSpeed: 10,
    sprintSpeed: 18,
    isSprinting: false,

    // Health & Armour
    health: 100,
    maxHealth: 100,
    armour: 100,
    maxArmour: 100,
    cash: 1450200,

    // Meshes
    characterMesh: null,
    cameraPivot: new THREE.Group(),
    cameraOffset: new THREE.Vector3(0, 2.8, -6.5),
    lookTarget: new THREE.Vector3()
  };

  // 1. Procedural Pedestrian Model (Used when player exits vehicle)
  const charGroup = new THREE.Group();

  // Torso / Jacket
  const jacketGeo = new THREE.BoxGeometry(0.7, 0.9, 0.4);
  const jacketMat = new THREE.MeshStandardMaterial({ color: 0x1c2b39, roughness: 0.7 });
  const torso = new THREE.Mesh(jacketGeo, jacketMat);
  torso.position.y = 1.35;
  torso.castShadow = true;
  charGroup.add(torso);

  // Head
  const headGeo = new THREE.BoxGeometry(0.35, 0.4, 0.35);
  const skinMat = new THREE.MeshStandardMaterial({ color: 0xdcb897, roughness: 0.6 });
  const head = new THREE.Mesh(headGeo, skinMat);
  head.position.y = 2.05;
  charGroup.add(head);

  // Legs / Jeans
  const jeansMat = new THREE.MeshStandardMaterial({ color: 0x1f2937, roughness: 0.8 });
  const legL = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.9, 0.32), jeansMat);
  legL.position.set(-0.2, 0.5, 0);
  legL.castShadow = true;
  charGroup.add(legL);

  const legR = legL.clone();
  legR.position.x = 0.2;
  charGroup.add(legR);

  // Weapon in hand
  const gunGeo = new THREE.BoxGeometry(0.12, 0.2, 0.65);
  const gunMat = new THREE.MeshStandardMaterial({ color: 0x111111, metalness: 0.8 });
  const gunMesh = new THREE.Mesh(gunGeo, gunMat);
  gunMesh.position.set(0.42, 1.25, 0.3);
  charGroup.add(gunMesh);

  charGroup.position.copy(player.position);
  charGroup.visible = false; // Starts in vehicle
  scene.add(charGroup);
  player.characterMesh = charGroup;

  // 2. Setup Supercar as Player's Starting Ride
  const supercar = window.createSupercar();
  supercar.position.set(-80, 0, -180);
  scene.add(supercar);
  player.vehicle = supercar;

  // 3. Update Camera and Physics Logic
  player.update = function (dt, keys, camera, cityBuildings) {
    if (player.inVehicle && player.vehicle) {
      // VEHICLE DRIVING CONTROLS
      const car = player.vehicle;
      const uData = car.userData;

      let accelerate = 0;
      let steer = 0;

      if (keys['KeyW'] || keys['ArrowUp']) accelerate += 1;
      if (keys['KeyS'] || keys['ArrowDown']) accelerate -= 1;
      if (keys['KeyA'] || keys['ArrowLeft']) steer += 1;
      if (keys['KeyD'] || keys['ArrowRight']) steer -= 1;
      const handbrake = keys['Space'];

      // Acceleration / Braking
      if (accelerate > 0) {
        uData.speed = Math.min(uData.speed + uData.acceleration * dt, uData.maxSpeed);
      } else if (accelerate < 0) {
        uData.speed = Math.max(uData.speed - uData.braking * dt, -uData.reverseSpeed);
      } else {
        // Natural deceleration / friction
        if (uData.speed > 0) {
          uData.speed = Math.max(0, uData.speed - 12 * dt);
        } else if (uData.speed < 0) {
          uData.speed = Math.min(0, uData.speed + 12 * dt);
        }
      }

      if (handbrake) {
        uData.speed *= Math.max(0, 1 - 2.8 * dt);
      }

      // Steering
      if (Math.abs(uData.speed) > 0.5) {
        const steerDir = uData.speed >= 0 ? 1 : -1;
        car.rotation.y += steer * uData.handling * steerDir * dt;
      }

      // Calculate forward motion
      const forward = new THREE.Vector3(0, 0, 1).applyAxisAngle(new THREE.Vector3(0, 1, 0), car.rotation.y);
      const moveStep = forward.multiplyScalar(uData.speed * dt);
      const newPos = car.position.clone().add(moveStep);

      // Simple Building Collision
      let collided = false;
      const carRadius = 2.0;
      for (let i = 0; i < cityBuildings.length; i++) {
        const b = cityBuildings[i];
        if (
          newPos.x > b.minX - carRadius &&
          newPos.x < b.maxX + carRadius &&
          newPos.z > b.minZ - carRadius &&
          newPos.z < b.maxZ + carRadius
        ) {
          collided = true;
          uData.speed *= -0.3; // Bounce back
          if (window.soundFX && Math.abs(uData.speed) > 8) {
            window.soundFX.playCrash();
          }
          break;
        }
      }

      if (!collided) {
        car.position.copy(newPos);
      }

      // Rotate wheels with speed
      if (uData.wheels) {
        uData.wheels.forEach(w => {
          w.rotation.x += (uData.speed / 1.5) * dt;
        });
      }

      // Calculate gear for HUD
      const kmh = Math.round(Math.abs(uData.speed) * 3.6);
      if (kmh < 40) uData.gear = 1;
      else if (kmh < 85) uData.gear = 2;
      else if (kmh < 135) uData.gear = 3;
      else if (kmh < 190) uData.gear = 4;
      else if (kmh < 240) uData.gear = 5;
      else uData.gear = 6;

      player.position.copy(car.position);
      player.rotation = car.rotation.y;

      // Dynamic Chase Camera
      const camDist = 7.5 + Math.abs(uData.speed) * 0.04;
      const camHeight = 3.2 + Math.abs(uData.speed) * 0.01;
      const backDir = new THREE.Vector3(0, 0, -1).applyAxisAngle(new THREE.Vector3(0, 1, 0), car.rotation.y);
      const targetCamPos = car.position.clone().add(backDir.multiplyScalar(camDist));
      targetCamPos.y = car.position.y + camHeight;

      camera.position.lerp(targetCamPos, 0.12);
      player.lookTarget.copy(car.position).add(new THREE.Vector3(0, 1.2, 0));
      camera.lookAt(player.lookTarget);

    } else {
      // ON-FOOT PEDESTRIAN CONTROLS
      let moveX = 0;
      let moveZ = 0;
      if (keys['KeyW'] || keys['ArrowUp']) moveZ += 1;
      if (keys['KeyS'] || keys['ArrowDown']) moveZ -= 1;
      if (keys['KeyA'] || keys['ArrowLeft']) moveX += 1;
      if (keys['KeyD'] || keys['ArrowRight']) moveX -= 1;

      const isRunning = keys['ShiftLeft'] || keys['ShiftRight'];
      const speed = isRunning ? player.sprintSpeed : player.onFootSpeed;

      if (moveX !== 0 || moveZ !== 0) {
        const moveVec = new THREE.Vector3(moveX, 0, moveZ).normalize();
        // Camera-relative orientation
        player.rotation = Math.atan2(moveVec.x, moveVec.z);
        player.characterMesh.rotation.y = player.rotation;

        const forward = moveVec.multiplyScalar(speed * dt);
        const newPos = player.position.clone().add(forward);

        // Building check
        let coll = false;
        for (let i = 0; i < cityBuildings.length; i++) {
          const b = cityBuildings[i];
          if (newPos.x > b.minX - 0.5 && newPos.x < b.maxX + 0.5 &&
              newPos.z > b.minZ - 0.5 && newPos.z < b.maxZ + 0.5) {
            coll = true;
            break;
          }
        }
        if (!coll) {
          player.position.copy(newPos);
          player.characterMesh.position.copy(newPos);
        }
      }

      // On-foot 3rd Person Follow Camera
      const targetCamPos = player.position.clone().add(new THREE.Vector3(0, 3.5, -6.0));
      camera.position.lerp(targetCamPos, 0.15);
      player.lookTarget.copy(player.position).add(new THREE.Vector3(0, 1.6, 0));
      camera.lookAt(player.lookTarget);
    }
  };

  // Toggle Enter / Exit Vehicle (F key)
  player.toggleVehicle = function () {
    if (player.inVehicle) {
      // Exit vehicle to the left
      player.inVehicle = false;
      player.characterMesh.visible = true;
      const leftOffset = new THREE.Vector3(-2.2, 0, 0).applyAxisAngle(new THREE.Vector3(0, 1, 0), player.vehicle.rotation.y);
      player.position.copy(player.vehicle.position).add(leftOffset);
      player.characterMesh.position.copy(player.position);
    } else {
      // Check distance to vehicle
      const dist = player.position.distanceTo(player.vehicle.position);
      if (dist < 5.5) {
        player.inVehicle = true;
        player.characterMesh.visible = false;
      }
    }
  };

  player.takeDamage = function (amount) {
    if (player.armour > 0) {
      const armDamage = Math.min(player.armour, amount);
      player.armour -= armDamage;
      amount -= armDamage;
    }
    player.health = Math.max(0, player.health - amount);
    if (player.health <= 0) {
      // Wasted respawn
      player.health = 100;
      player.armour = 50;
      player.position.set(-80, 0.5, -180);
      if (player.vehicle) {
        player.vehicle.position.set(-80, 0, -180);
        player.vehicle.userData.speed = 0;
      }
      if (window.soundFX) window.soundFX.playCrash();
    }
  };

  return player;
}

window.createPlayer = createPlayer;
