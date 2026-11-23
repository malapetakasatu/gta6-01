// SOLIS CITY: CORAL COAST (v2.0 AAA WebGL Engine) - Tactical CPD Pursuit AI & Wanted Star Manager
// 4 Wanted Stars, aggressive ramming interceptors, tactical roadblocks, dispatch alerts.

const THREE = window.THREE;

export class PoliceManager {
  constructor(scene, city, vehicleManager) {
    this.scene = scene;
    this.city = city;
    this.vm = vehicleManager;

    this.wantedLevel = 0; // 0 to 4 stars
    this.cruisers = [];
    this.maxCruisers = 4;
    this.pursuitCooldown = 0;
    this.roadblocks = [];

    this.dispatchMessages = [
      "All units, suspect spotted in Coral Marina. Code 3 authorized.",
      "Suspect driving orange Veloce GTS Turbo at reckless speed!",
      "CPD Interceptors deploy tactical pit-maneuver!",
      "Airborne CONDOR-1 in pursuit! Roadblock established on Ocean Blvd!"
    ];
  }

  setWantedLevel(stars) {
    stars = Math.max(0, Math.min(4, stars));
    if (this.wantedLevel !== stars) {
      this.wantedLevel = stars;
      this.onWantedChanged();
    }
  }

  addWantedStar() {
    this.setWantedLevel(this.wantedLevel + 1);
  }

  onWantedChanged() {
    // Update Stars UI
    for (let i = 1; i <= 5; i++) {
      const el = document.getElementById(`star-${i}`);
      if (el) {
        if (i <= this.wantedLevel) {
          el.classList.add('active');
        } else {
          el.classList.remove('active');
        }
      }
    }

    // Trigger dispatch notification
    if (this.wantedLevel > 0) {
      this.showDispatch(this.dispatchMessages[this.wantedLevel - 1]);
      this.spawnCruisersForWanted();
    }
  }

  showDispatch(text) {
    const box = document.getElementById('dispatch-box');
    const msg = document.getElementById('dispatch-text');
    if (box && msg) {
      msg.textContent = text;
      box.classList.add('active');
      setTimeout(() => box.classList.remove('active'), 4500);
    }
  }

  spawnCruisersForWanted() {
    while (this.cruisers.length < this.wantedLevel + 1 && this.cruisers.length < this.maxCruisers) {
      const playerPos = this.vm.supercar.pos;
      const spawnOffset = new THREE.Vector3(
        (Math.random() - 0.5) * 120,
        0,
        (Math.random() - 0.5) * 120
      );
      const spawnPos = playerPos.clone().add(spawnOffset);
      const cruiser = this.vm.createPoliceCruiser(spawnPos);
      this.cruisers.push(cruiser);
    }
  }

  createRoadblock(aheadPos) {
    // 2 police cruisers parked in V-formation blocking road
    const cruiserA = this.vm.createPoliceCruiser(aheadPos.clone().add(new THREE.Vector3(-4, 0, 0)));
    cruiserA.rotY = 0.4;
    cruiserA.mesh.rotation.y = 0.4;

    const cruiserB = this.vm.createPoliceCruiser(aheadPos.clone().add(new THREE.Vector3(4, 0, 0)));
    cruiserB.rotY = -0.4;
    cruiserB.mesh.rotation.y = -0.4;

    this.roadblocks.push(cruiserA, cruiserB);
  }

  update(delta, time, playerPos) {
    // Update Helicopter Spotlight Tracking
    if (this.vm.helicopter) {
      this.vm.helicopter.targetPos.copy(playerPos);
    }

    // Update Cruisers AI
    this.cruisers.forEach((cruiser, idx) => {
      // Flashing Lightbars
      const flash = Math.sin(time * 14 + idx) > 0;
      cruiser.blueLight.material.color.setHex(flash ? 0x0088ff : 0x001144);
      cruiser.redLight.material.color.setHex(!flash ? 0xff0033 : 0x440008);

      if (this.wantedLevel === 0) return;

      // Pursue Player
      const toPlayer = playerPos.clone().sub(cruiser.pos);
      const dist = toPlayer.length();

      if (dist > 3.0) {
        // Calculate desired heading angle
        const targetAngle = Math.atan2(toPlayer.x, toPlayer.z);
        // Smoothly steer towards player
        let angleDiff = targetAngle - cruiser.rotY;
        while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
        while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;

        cruiser.rotY += Math.sign(angleDiff) * Math.min(Math.abs(angleDiff), 0.045);

        // Accelerate
        cruiser.speed = Math.min(cruiser.maxSpeed, cruiser.speed + 0.03);
      } else {
        // Aggressive Ramming Impact!
        cruiser.speed *= 0.5;
        this.vm.supercar.speed *= 0.7;
      }

      cruiser.velocity.set(
        Math.sin(cruiser.rotY) * cruiser.speed,
        0,
        Math.cos(cruiser.rotY) * cruiser.speed
      );

      const nextPos = cruiser.pos.clone().add(cruiser.velocity);
      if (!this.city.checkCollision(nextPos, cruiser.radius)) {
        cruiser.pos.copy(nextPos);
      } else {
        cruiser.rotY += 0.8; // Dodge obstacle
      }

      cruiser.mesh.position.copy(cruiser.pos);
      cruiser.mesh.rotation.y = cruiser.rotY;
    });
  }
}
