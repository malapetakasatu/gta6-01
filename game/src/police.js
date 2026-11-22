// CPD Pursuit AI & Wanted System for Solis City: Coral Coast
// Handles: Wanted Level (1-4 Stars), Police Cruiser AI tactics, Roadblocks, and CONDOR-1 Air Support.

function createPoliceSystem(scene) {
  const police = {
    wantedLevel: 1, // 0 to 4 stars
    activeCruisers: [],
    helicopter: null,
    sirenTimer: 0,
    evasionTimer: 0,
    evasionRequired: 12.0, // Seconds out of sight to lose wanted level
    maxCruisers: 4,
    spawnTimer: 0,
    roadblocks: []
  };

  // Spawn a police cruiser near a waypoint
  police.spawnCruiser = function (targetPos) {
    if (police.activeCruisers.length >= police.maxCruisers) return;

    const cruiser = window.createPoliceCar();
    // Spawn ahead or behind on the road
    const angle = Math.random() * Math.PI * 2;
    const spawnDist = 60 + Math.random() * 40;
    cruiser.position.set(
      targetPos.x + Math.cos(angle) * spawnDist,
      0,
      targetPos.z + Math.sin(angle) * spawnDist
    );
    cruiser.rotation.y = angle + Math.PI;
    scene.add(cruiser);
    police.activeCruisers.push(cruiser);
  };

  // Spawn Condor-1 Helicopter for Wanted Level >= 3
  police.spawnHelicopter = function (targetPos) {
    if (police.helicopter) return;
    const heli = window.createPoliceHelicopter();
    heli.position.set(targetPos.x + 20, 48, targetPos.z - 40);
    scene.add(heli);
    police.helicopter = heli;
  };

  police.setWantedLevel = function (stars) {
    police.wantedLevel = Math.max(0, Math.min(4, stars));
    const dispatchBox = document.getElementById('dispatch-box');

    if (police.wantedLevel === 0) {
      if (dispatchBox) {
        dispatchBox.innerText = '[CPD DISPATCH] CODE 4: SUSPECT LOST. RESUME STANDARD PATROL.';
        dispatchBox.classList.add('active');
        setTimeout(() => dispatchBox.classList.remove('active'), 4000);
      }
    } else if (police.wantedLevel === 1) {
      if (dispatchBox) {
        dispatchBox.innerText = '[CPD DISPATCH] ATTENTION UNITS: SUSPECT OBSERVED SPEEDING. CODE 2 PATROL.';
        dispatchBox.classList.add('active');
      }
    } else if (police.wantedLevel === 2) {
      if (dispatchBox) {
        dispatchBox.innerText = '[CPD DISPATCH] 10-99 VEHICLE PURSUIT IN PROGRESS. UNITS ENGAGE AND INTERCEPT!';
        dispatchBox.classList.add('active');
      }
    } else if (police.wantedLevel === 3) {
      if (dispatchBox) {
        dispatchBox.innerText = '[CPD DISPATCH] ALL UNITS MOVE TO GRIDLOCK. CONDOR-1 AIR SUPPORT AUTHORIZED!';
        dispatchBox.classList.add('active');
      }
    } else if (police.wantedLevel >= 4) {
      if (dispatchBox) {
        dispatchBox.innerText = '[CPD DISPATCH] LEVEL 4 TACTICAL PURSUIT: LETHAL FORCE AUTHORIZED! CORAL COAST UNDER LOCKDOWN!';
        dispatchBox.classList.add('active');
      }
    }
  };

  police.update = function (dt, player, cityBuildings) {
    // 1. Maintain cruiser numbers based on wanted level
    police.spawnTimer += dt;
    const targetCruisers = police.wantedLevel >= 3 ? 3 : (police.wantedLevel >= 1 ? 2 : 0);

    if (police.wantedLevel >= 3 && !police.helicopter) {
      police.spawnHelicopter(player.position);
    } else if (police.wantedLevel < 3 && police.helicopter) {
      scene.remove(police.helicopter);
      police.helicopter = null;
    }

    if (police.spawnTimer > 3.0 && police.activeCruisers.length < targetCruisers) {
      police.spawnTimer = 0;
      police.spawnCruiser(player.position);
    }

    // 2. Lightbar Flashing & Siren Logic
    police.sirenTimer += dt * 9;
    const redOn = Math.sin(police.sirenTimer) > 0;
    const blueOn = !redOn;

    // 3. Update Police Cruisers AI Pursuit
    for (let i = police.activeCruisers.length - 1; i >= 0; i--) {
      const car = police.activeCruisers[i];
      const uData = car.userData;

      // Toggle flashing beacon lights
      uData.redPoint.intensity = redOn ? 2.5 : 0;
      uData.bluePoint.intensity = blueOn ? 2.5 : 0;
      uData.redBeacon.material.color.setHex(redOn ? 0xff0022 : 0x440000);
      uData.blueBeacon.material.color.setHex(blueOn ? 0x0066ff : 0x001144);

      if (police.wantedLevel === 0) {
        // Despawn if far
        if (car.position.distanceTo(player.position) > 120) {
          scene.remove(car);
          police.activeCruisers.splice(i, 1);
          continue;
        }
      }

      // Pursuit Vector
      const toPlayer = new THREE.Vector3().subVectors(player.position, car.position);
      const dist = toPlayer.length();

      // Despawn if too far away during pursuit and respawn closer
      if (dist > 180) {
        scene.remove(car);
        police.activeCruisers.splice(i, 1);
        continue;
      }

      // Steering towards player
      const targetAngle = Math.atan2(toPlayer.x, toPlayer.z);
      let diffAngle = targetAngle - car.rotation.y;
      while (diffAngle > Math.PI) diffAngle -= Math.PI * 2;
      while (diffAngle < -Math.PI) diffAngle += Math.PI * 2;

      car.rotation.y += Math.sign(diffAngle) * Math.min(Math.abs(diffAngle), uData.handling * dt);

      // Speed control: Ram or follow
      const desireSpeed = police.wantedLevel >= 3 ? uData.maxSpeed : uData.maxSpeed * 0.8;
      uData.speed = Math.min(uData.speed + uData.acceleration * dt, desireSpeed);

      // Move cruiser forward
      const forward = new THREE.Vector3(0, 0, 1).applyAxisAngle(new THREE.Vector3(0, 1, 0), car.rotation.y);
      const move = forward.multiplyScalar(uData.speed * dt);
      const nextPos = car.position.clone().add(move);

      // Building collision check
      let coll = false;
      for (let bIdx = 0; bIdx < cityBuildings.length; bIdx++) {
        const b = cityBuildings[bIdx];
        if (
          nextPos.x > b.minX - 1.8 &&
          nextPos.x < b.maxX + 1.8 &&
          nextPos.z > b.minZ - 1.8 &&
          nextPos.z < b.maxZ + 1.8
        ) {
          coll = true;
          uData.speed *= -0.2;
          car.rotation.y += 0.8; // turn away
          break;
        }
      }

      if (!coll) {
        car.position.copy(nextPos);
      }

      // Wheel rotation
      if (uData.wheels) {
        uData.wheels.forEach(w => {
          w.rotation.x += (uData.speed / 1.5) * dt;
        });
      }

      // Ramming damage to player
      if (dist < 3.2) {
        player.takeDamage(15 * dt);
        if (window.soundFX) window.soundFX.playCrash();
      }
    }

    // 4. Update CONDOR-1 Helicopter Air Support
    if (police.helicopter) {
      const heli = police.helicopter;
      const hData = heli.userData;

      // Spin main and tail rotors
      hData.mainRotor.rotation.y += 32 * dt;
      hData.tailRotor.rotation.x += 32 * dt;

      // Hover and track player from above
      const heliTarget = player.position.clone().add(new THREE.Vector3(12, 42, -18));
      heli.position.lerp(heliTarget, 0.04);

      // Aim searchlight directly at player vehicle
      hData.spotlight.target.position.copy(player.position);
      hData.spotlight.target.updateMatrixWorld();

      // Orient helicopter body towards movement
      heli.lookAt(player.position.x, heli.position.y, player.position.z);
    }

    // 5. Evasion / Cooldown System
    let anyInSight = false;
    for (let c of police.activeCruisers) {
      if (c.position.distanceTo(player.position) < 70) {
        anyInSight = true;
        break;
      }
    }
    if (police.helicopter && police.helicopter.position.distanceTo(player.position) < 85) {
      anyInSight = true;
    }

    if (!anyInSight && police.wantedLevel > 0) {
      police.evasionTimer += dt;
      if (police.evasionTimer >= police.evasionRequired) {
        police.setWantedLevel(police.wantedLevel - 1);
        police.evasionTimer = 0;
      }
    } else {
      police.evasionTimer = 0;
    }
  };

  return police;
}

window.createPoliceSystem = createPoliceSystem;
