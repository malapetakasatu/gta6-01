import * as THREE from './three.module.js';

/**
 * Solis City: Coral Coast - Campaign Mission System
 * 8 narrative missions across Solis City with objective checkpoints and rewards.
 */

export const CAMPAIGN_MISSIONS = [
  {
    id: 1,
    title: 'Neon Horizon',
    objectiveText: 'Meet your fixer Jax at the Ocean Drive Marina slipway.',
    targetPosition: new THREE.Vector3(120, 0, 80),
    radius: 12,
    rewardCash: 5000,
    rewardXp: 250,
  },
  {
    id: 2,
    title: 'Veloce Heist',
    objectiveText: 'Infiltrate Veloce Exotic Motors and acquire the GTS Supercar.',
    targetPosition: new THREE.Vector3(-80, 0, 160),
    radius: 10,
    rewardCash: 15000,
    rewardXp: 600,
  },
  {
    id: 3,
    title: 'Ocean Drive Showdown',
    objectiveText: 'Eliminate the rival cartel ambush along the south strip.',
    targetPosition: new THREE.Vector3(150, 0, -120),
    radius: 14,
    rewardCash: 25000,
    rewardXp: 950,
  },
  {
    id: 4,
    title: 'CPD Evade',
    objectiveText: 'Lose the 4-star police interceptor squad and CONDOR-1 chopper.',
    targetPosition: new THREE.Vector3(-220, 0, -180),
    radius: 15,
    rewardCash: 35000,
    rewardXp: 1400,
  },
  {
    id: 5,
    title: 'Skyline Strikeforce',
    objectiveText: 'Escort arms shipment through the Solis Highrise district.',
    targetPosition: new THREE.Vector3(0, 0, -250),
    radius: 15,
    rewardCash: 45000,
    rewardXp: 1800,
  },
  {
    id: 6,
    title: 'Coral Syndicate Bust',
    objectiveText: 'Raid the contraband cargo depot in North Harbor Bay.',
    targetPosition: new THREE.Vector3(-160, 0, 180),
    radius: 16,
    rewardCash: 60000,
    rewardXp: 2400,
  },
  {
    id: 7,
    title: 'Harbor Infiltration',
    objectiveText: 'Recover the diamond telemetry case from the offshore yacht.',
    targetPosition: new THREE.Vector3(260, 0, 0),
    radius: 18,
    rewardCash: 80000,
    rewardXp: 3200,
  },
  {
    id: 8,
    title: 'Grand Finale: Solis Kingpin',
    objectiveText: 'Storm Solis Tower penthouse and claim dominion over Coral Coast.',
    targetPosition: new THREE.Vector3(0, 0, 0),
    radius: 20,
    rewardCash: 250000,
    rewardXp: 10000,
  },
];

export class MissionManager {
  constructor(scene, audioManager, hud) {
    this.scene = scene;
    this.audio = audioManager;
    this.hud = hud;

    this.currentIndex = 0;
    this.currentMission = CAMPAIGN_MISSIONS[0];
    this.totalCash = 0;
    this.totalXp = 0;

    // 3D Visual Mission Marker (Rotating luminous beacon)
    this.markerMesh = null;
    this.buildMissionMarker();
  }

  buildMissionMarker() {
    const markerGroup = new THREE.Group();

    // Cylindrical ground pillar
    const cylinderGeo = new THREE.CylinderGeometry(4.0, 4.0, 0.4, 32);
    const cylinderMat = new THREE.MeshBasicMaterial({
      color: 0xffaa00,
      transparent: true,
      opacity: 0.5,
      side: THREE.DoubleSide,
    });
    const cylinder = new THREE.Mesh(cylinderGeo, cylinderMat);
    markerGroup.add(cylinder);

    // Vertical floating diamond icon
    const diamondGeo = new THREE.OctahedronGeometry(1.4, 0);
    const diamondMat = new THREE.MeshStandardMaterial({
      color: 0xffcc00,
      emissive: 0xffaa00,
      emissiveIntensity: 1.5,
      roughness: 0.2,
      metalness: 0.8,
    });
    this.diamond = new THREE.Mesh(diamondGeo, diamondMat);
    this.diamond.position.y = 2.5;
    markerGroup.add(this.diamond);

    // Golden point light
    const light = new THREE.PointLight(0xffaa00, 3.0, 15);
    light.position.y = 2.5;
    markerGroup.add(light);

    this.markerMesh = markerGroup;
    this.scene.add(this.markerMesh);
    this.updateMarkerPosition();
  }

  updateMarkerPosition() {
    if (this.currentMission && this.markerMesh) {
      this.markerMesh.position.copy(this.currentMission.targetPosition);
    }
  }

  completeCurrentMission() {
    if (!this.currentMission) return;

    this.totalCash += this.currentMission.rewardCash;
    this.totalXp += this.currentMission.rewardXp;

    this.audio?.playMissionSting();
    this.hud?.showToast(`★ MISSION COMPLETE: ${this.currentMission.title} (+$${this.currentMission.rewardCash.toLocaleString()})`);

    // Advance to next mission
    this.currentIndex++;
    if (this.currentIndex < CAMPAIGN_MISSIONS.length) {
      this.currentMission = CAMPAIGN_MISSIONS[this.currentIndex];
      this.updateMarkerPosition();
    } else {
      this.currentMission = null;
      if (this.markerMesh) this.markerMesh.visible = false;
      this.hud?.showToast('★ SOLIS CITY CONQUERED - KINGPIN OF CORAL COAST ★', 6000);
    }
  }

  update(dt, playerPosition) {
    if (!this.currentMission || !playerPosition) return;

    // Animate mission marker diamond spin and hover bobbing
    const time = performance.now() * 0.002;
    if (this.diamond) {
      this.diamond.rotation.y += dt * 2.0;
      this.diamond.position.y = 2.5 + Math.sin(time) * 0.4;
    }

    // Check distance to objective
    const dist = playerPosition.distanceTo(this.currentMission.targetPosition);
    if (dist < this.currentMission.radius) {
      this.completeCurrentMission();
    }
  }
}
