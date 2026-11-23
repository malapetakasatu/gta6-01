// SOLIS CITY: CORAL COAST (v2.1 AAA WebGL Engine) - 8-Mission Story Campaign Manager
// Narrative progression, checkpoints, district waypoints, objectives, rewards.

const THREE = window.THREE;

export class MissionManager {
  constructor(scene, hud, policeManager) {
    this.scene = scene;
    this.hud = hud;
    this.police = policeManager;

    this.currentMissionIndex = 0;
    this.missions = [
      {
        id: 1,
        title: "CORAL COAST AWAKENING",
        district: "CORAL MARINA",
        objective: "Mount the Veloce GTS Turbo and reach Downtown Core.",
        target: new THREE.Vector3(-50, 0, 0),
        reward: "$5,000",
        wantedReward: 0
      },
      {
        id: 2,
        title: "NEON SYNDICATE DROP",
        district: "OCEAN BOULEVARD",
        objective: "Intercept the contraband package at Ocean Blvd Pier.",
        target: new THREE.Vector3(100, 0, -150),
        reward: "$12,000",
        wantedReward: 1
      },
      {
        id: 3,
        title: "SKYLINE HEIST ESCAPE",
        district: "DOWNTOWN CORE",
        objective: "Break through CPD perimeter around Coral Bank Tower.",
        target: new THREE.Vector3(-150, 0, 100),
        reward: "$25,000",
        wantedReward: 2
      },
      {
        id: 4,
        title: "PORT SOLIS CONTRABAND",
        district: "PORT SOLIS",
        objective: "Infiltrate shipping depot and secure armored transport.",
        target: new THREE.Vector3(-250, 0, -100),
        reward: "$40,000",
        wantedReward: 2
      },
      {
        id: 5,
        title: "CONDOR DOWN",
        district: "HIGHWAY CORRIDOR",
        objective: "Shake off airborne CONDOR-1 tactical helicopter.",
        target: new THREE.Vector3(0, 0, 250),
        reward: "$55,000",
        wantedReward: 3
      },
      {
        id: 6,
        title: "HIGH STAKES INTERCEPT",
        district: "PALM HEIGHTS",
        objective: "Ram and neutralize rival courier coupe before safehouse.",
        target: new THREE.Vector3(-50, 0, 200),
        reward: "$75,000",
        wantedReward: 3
      },
      {
        id: 7,
        title: "ROADBLOCK RAMPAGE",
        district: "CENTRAL EXPRESSWAY",
        objective: "Smash through 3 tactical CPD roadblocks to deliver intel.",
        target: new THREE.Vector3(100, 0, 150),
        reward: "$100,000",
        wantedReward: 4
      },
      {
        id: 8,
        title: "KING OF SOLIS",
        district: "SOLIS METROPOLIS",
        objective: "Survive 4-star CPD onslaught and claim Apex Tower rooftop.",
        target: new THREE.Vector3(-50, 0, 100),
        reward: "$500,000 & SOLIS EMPIRE",
        wantedReward: 4
      }
    ];

    this.createWaypointMarker();
    this.loadMission(0);
  }

  createWaypointMarker() {
    // 3D Glowing Vertical Light Column at Mission Waypoint
    const beaconGeo = new THREE.CylinderGeometry(2.5, 2.5, 30, 16, 1, true);
    const beaconMat = new THREE.MeshBasicMaterial({
      color: 0xffcc00,
      transparent: true,
      opacity: 0.5,
      side: THREE.DoubleSide
    });
    this.beaconMesh = new THREE.Mesh(beaconGeo, beaconMat);
    this.beaconMesh.position.y = 15;
    this.scene.add(this.beaconMesh);
  }

  getActiveMission() {
    return this.missions[this.currentMissionIndex];
  }

  loadMission(index) {
    if (index >= this.missions.length) {
      index = 0; // Loop or complete
    }
    this.currentMissionIndex = index;
    const m = this.getActiveMission();

    // Position beacon at mission target
    this.beaconMesh.position.set(m.target.x, 15, m.target.z);

    // Apply wanted level for mission
    if (this.police && m.wantedReward > 0) {
      this.police.setWantedLevel(m.wantedReward);
    }

    // Update HUD Mission Tracker
    const titleEl = document.getElementById('mission-title');
    const objEl = document.getElementById('mission-objective');
    if (titleEl) titleEl.textContent = m.title;
    if (objEl) objEl.textContent = m.objective;

    // Trigger District Banner
    this.showDistrictBanner(m.district);
  }

  showDistrictBanner(name) {
    const banner = document.getElementById('district-banner');
    const title = document.getElementById('district-title');
    if (banner && title) {
      title.textContent = name;
      banner.classList.add('show');
      setTimeout(() => banner.classList.remove('show'), 3500);
    }
  }

  update(playerPos) {
    const m = this.getActiveMission();
    const dst = playerPos.distanceTo(m.target);

    // Update distance readout
    const distEl = document.getElementById('mission-distance');
    if (distEl) {
      distEl.textContent = `OBJECTIVE: ${Math.round(dst)}m`;
    }

    // Checkpoint Trigger
    if (dst < 12.0) {
      this.completeMission();
    }
  }

  completeMission() {
    const completed = this.getActiveMission();
    this.hud.showNotification(`MISSION ACCOMPLISHED: ${completed.title} (${completed.reward})`);
    this.loadMission(this.currentMissionIndex + 1);
  }
}
