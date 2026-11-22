// 8 Story Missions Campaign across 6 City Districts
// Missions: Speed Trap Sprint, Marina Heist, Downtown Velocity, Vice Strip Showdown,
// Contraband Hijack, Roadblock Breaker, Condor Down, Solis Syndicate Finale.

export class MissionSystem {
  constructor(scene) {
    this.scene = scene;
    this.currentIndex = 0;
    this.completed = false;

    this.missions = [
      {
        id: 1,
        title: "Coral Coast Arrival",
        district: "Ocean Drive",
        desc: "Sprint the Veloce GTS Turbo through the coastal speed trap at 180+ km/h.",
        waypoint: { x: -300, z: 280 },
        speedTarget: 180,
        reward: "$2,500"
      },
      {
        id: 2,
        title: "Marina Bay Heist",
        district: "Marina Bay",
        desc: "Infiltrate the luxury marina dock and retrieve the encrypted Syndicate lockbox.",
        waypoint: { x: -60, z: 240 },
        reward: "$15,000 + Carbine Mk-II"
      },
      {
        id: 3,
        title: "Downtown Velocity",
        district: "Downtown Solis",
        desc: "Race through the financial skyscraper canyon checkpoints in under 60 seconds.",
        waypoint: { x: 180, z: 80 },
        reward: "$20,000 + Turbo Tune"
      },
      {
        id: 4,
        title: "Vice Strip Showdown",
        district: "Vice Strip",
        desc: "Neutralize rival cartel enforcers outside the Neon Palms Casino.",
        waypoint: { x: -60, z: -280 },
        reward: "$35,000 + Titan RPG"
      },
      {
        id: 5,
        title: "Port Solis Contraband",
        district: "Port Solis",
        desc: "Locate and hijack the military weapons container truck from Crane Depot 4.",
        waypoint: { x: 260, z: -300 },
        reward: "$45,000 + SWAT Armor"
      },
      {
        id: 6,
        title: "Roadblock Breaker",
        district: "Highway I-95",
        desc: "Blast through CPD tactical roadblocks using full nitro boost.",
        waypoint: { x: 60, z: -160 },
        reward: "$60,000 + Interceptor Pass"
      },
      {
        id: 7,
        title: "Condor Down",
        district: "Solis Skyline",
        desc: "Evade the tactical searchlight and disable the CONDOR-1 police helicopter.",
        waypoint: { x: 240, z: 120 },
        reward: "$80,000 + Cruiser Unlocked"
      },
      {
        id: 8,
        title: "The Solis Syndicate Finale",
        district: "Coral Beach Airstrip",
        desc: "Eliminate the Syndicate Boss convoy across 6 districts and escape to the airstrip!",
        waypoint: { x: -460, z: 320 },
        reward: "$250,000 + Coral Coast Trophy"
      }
    ];

    this.initWaypointMarker();
  }

  initWaypointMarker() {
    this.markerGroup = new THREE.Group();

    // Glowing 3D Rotating Beacon Column
    const colGeo = new THREE.CylinderGeometry(1.8, 1.8, 45, 16, 1, true);
    const colMat = new THREE.MeshBasicMaterial({
      color: 0x00f0ff,
      transparent: true,
      opacity: 0.35,
      side: THREE.DoubleSide
    });
    this.markerColumn = new THREE.Mesh(colGeo, colMat);
    this.markerColumn.position.y = 22.5;
    this.markerGroup.add(this.markerColumn);

    // Ground Pulse Ring
    const ringGeo = new THREE.RingGeometry(3.5, 4.5, 32);
    ringGeo.rotateX(-Math.PI / 2);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xffd200,
      side: THREE.DoubleSide
    });
    this.pulseRing = new THREE.Mesh(ringGeo, ringMat);
    this.pulseRing.position.y = 0.2;
    this.markerGroup.add(this.pulseRing);

    this.scene.add(this.markerGroup);
    this.updateMarkerPosition();
  }

  getCurrentMission() {
    return this.missions[this.currentIndex];
  }

  updateMarkerPosition() {
    const m = this.getCurrentMission();
    if (m && m.waypoint) {
      this.markerGroup.position.set(m.waypoint.x, 0, m.waypoint.z);
      this.markerGroup.visible = true;
    } else {
      this.markerGroup.visible = false;
    }
  }

  checkObjective(playerPos, playerSpeedKm) {
    const m = this.getCurrentMission();
    if (!m) return false;

    const dx = playerPos.x - m.waypoint.x;
    const dz = playerPos.z - m.waypoint.z;
    const dist = Math.sqrt(dx * dx + dz * dz);

    if (dist < 18) {
      if (m.speedTarget && playerSpeedKm < m.speedTarget) {
        return false; // Must reach speed threshold
      }
      return true; // Checkpoint reached
    }
    return false;
  }

  advanceMission() {
    if (this.currentIndex < this.missions.length - 1) {
      this.currentIndex++;
      this.updateMarkerPosition();
      return true;
    } else {
      this.completed = true;
      return false;
    }
  }

  update(time) {
    if (this.markerGroup.visible) {
      this.markerColumn.rotation.y = time * 1.5;
      const s = 1.0 + Math.sin(time * 3.5) * 0.25;
      this.pulseRing.scale.set(s, 1, s);
    }
  }
}
