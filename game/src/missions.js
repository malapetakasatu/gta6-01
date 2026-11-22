// Mission Progression & Story Campaign System for Solis City: Coral Coast
// Includes: 8 Story Missions, 6 Coastal Districts Standing, Objective Markers, and Voice Dialogue.

function createMissionSystem(scene) {
  const missions = [
    {
      id: 1,
      district: 'Coral Beach',
      name: 'WELCOME TO SOLIS',
      tag: 'MISSION 1 / 8',
      objective: 'Drive south along Ocean Boulevard and meet Marco at Coral Pier.',
      targetPos: new THREE.Vector3(-80, 0, 180),
      wantedOnStart: 1,
      dialogue: {
        speaker: 'MARCO',
        text: 'Welcome to Solis, kid. Keep your eyes on the road and stay clear of CPD cruisers.'
      },
      reward: 25000
    },
    {
      id: 2,
      district: 'Neon Strip',
      name: 'NEON SHADOWS',
      tag: 'MISSION 2 / 8',
      objective: 'Infiltrate Vice Palms club at the Neon Strip and retrieve the encrypted briefcase.',
      targetPos: new THREE.Vector3(40, 0, 100),
      wantedOnStart: 2,
      dialogue: {
        speaker: 'VALERIA',
        text: 'The briefcase is guarded by the Mendoza syndicate. Hit fast and disappear in the traffic.'
      },
      reward: 45000
    },
    {
      id: 3,
      district: 'Palm Bay',
      name: 'HIGHWAY EXPRESS',
      tag: 'MISSION 3 / 8',
      objective: 'Deliver the high-grade prototype across Palm Avenue to the northern safehouse.',
      targetPos: new THREE.Vector3(0, 0, -200),
      wantedOnStart: 2,
      dialogue: {
        speaker: 'MARCO',
        text: 'Pedal to the metal! The buyer is waiting at the north terminal. Don’t total the ride!'
      },
      reward: 60000
    },
    {
      id: 4,
      district: 'Downtown',
      name: 'HEATWAVE',
      tag: 'MISSION 4 / 8',
      objective: 'Steal the CPD Tactical Cruiser parked outside the Downtown Precinct.',
      targetPos: new THREE.Vector3(80, 0, -50),
      wantedOnStart: 3,
      dialogue: {
        speaker: 'VALERIA',
        text: 'Every cop in Solis is going to hunt you down once you crack that siren. Get ready!'
      },
      reward: 85000
    },
    {
      id: 5,
      district: 'Marina Bay',
      name: 'CONDOR DOWN',
      tag: 'MISSION 5 / 8',
      objective: 'Survive the 4-star CPD manhunt and shoot down the CONDOR-1 surveillance helicopter.',
      targetPos: new THREE.Vector3(-40, 0, -150),
      wantedOnStart: 4,
      dialogue: {
        speaker: 'DISPATCH',
        text: 'AIR 1 TO COMMAND: WE HAVE VISUAL ON THE CORAL BOULEVARD SUSPECT! ENGAGING!'
      },
      reward: 120000
    },
    {
      id: 6,
      district: 'Port Horizon',
      name: 'CARTEL SHIPMENT',
      tag: 'MISSION 6 / 8',
      objective: 'Intercept and secure the contraband boat shipment docked at Port Horizon.',
      targetPos: new THREE.Vector3(160, 0, 200),
      wantedOnStart: 3,
      dialogue: {
        speaker: 'MARCO',
        text: 'Port security is bought and paid for, but the cartel won’t give up the cargo without a fight.'
      },
      reward: 150000
    },
    {
      id: 7,
      district: 'Downtown Core',
      name: 'TOWER HEIST',
      tag: 'MISSION 7 / 8',
      objective: 'Infiltrate Solis Financial Tower and breach the executive vault on the 40th floor.',
      targetPos: new THREE.Vector3(40, 0, -50),
      wantedOnStart: 4,
      dialogue: {
        speaker: 'VALERIA',
        text: 'This is the big one. Fifty million in bearer bonds. Alarms will trigger instantly!'
      },
      reward: 350000
    },
    {
      id: 8,
      district: 'Coral Coastline',
      name: 'KING OF THE COAST',
      tag: 'MISSION 8 / 8',
      objective: 'Outrun the CPD elite taskforce along the coastal freeway and take Solis City!',
      targetPos: new THREE.Vector3(-80, 0, -180),
      wantedOnStart: 4,
      dialogue: {
        speaker: 'MARCO',
        text: 'You own this city now! Light up the nitrous and leave the badges in the dust!'
      },
      reward: 1000000
    }
  ];

  // Waypoint Marker Mesh in 3D Scene
  const markerGroup = new THREE.Group();
  const markerGeo = new THREE.ConeGeometry(2.5, 5.0, 4);
  const markerMat = new THREE.MeshBasicMaterial({
    color: 0xffaa00,
    wireframe: true
  });
  const markerMesh = new THREE.Mesh(markerGeo, markerMat);
  markerMesh.rotation.x = Math.PI; // Pointing down
  markerMesh.position.y = 4.5;
  markerGroup.add(markerMesh);

  // Glowing ground ring
  const ringGeo = new THREE.RingGeometry(3.0, 3.8, 16);
  const ringMat = new THREE.MeshBasicMaterial({
    color: 0xffcc00,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.7
  });
  const ringMesh = new THREE.Mesh(ringGeo, ringMat);
  ringMesh.rotation.x = -Math.PI / 2;
  ringMesh.position.y = 0.55;
  markerGroup.add(ringMesh);

  scene.add(markerGroup);

  const missionState = {
    missions: missions,
    currentIndex: 0,
    marker: markerGroup,
    districts: [
      { name: 'Downtown', standing: 85 },
      { name: 'Coral Beach', standing: 92 },
      { name: 'Port Horizon', standing: 64 },
      { name: 'Neon Strip', standing: 78 },
      { name: 'Palm Bay', standing: 88 },
      { name: 'Marina Bay', standing: 70 }
    ]
  };

  missionState.getCurrentMission = function () {
    return missions[missionState.currentIndex];
  };

  missionState.startMission = function (index, policeSystem) {
    if (index >= 0 && index < missions.length) {
      missionState.currentIndex = index;
    }
    const current = missionState.getCurrentMission();
    markerGroup.position.copy(current.targetPos);

    if (policeSystem) {
      policeSystem.setWantedLevel(current.wantedOnStart);
    }

    // Trigger dialogue
    const dialogueBox = document.getElementById('dialogue-box');
    const dialogueSpeaker = document.getElementById('dialogue-speaker');
    const dialogueText = document.getElementById('dialogue-text');
    if (dialogueBox && dialogueSpeaker && dialogueText) {
      dialogueSpeaker.innerText = current.dialogue.speaker;
      dialogueText.innerText = current.dialogue.text;
      dialogueBox.classList.add('active');
      setTimeout(() => dialogueBox.classList.remove('active'), 5500);
    }
  };

  missionState.nextMission = function (policeSystem, player) {
    const current = missionState.getCurrentMission();
    player.cash += current.reward;

    missionState.currentIndex = (missionState.currentIndex + 1) % missions.length;
    missionState.startMission(missionState.currentIndex, policeSystem);
  };

  missionState.update = function (dt, player, policeSystem) {
    // Spin and bounce waypoint marker
    markerGroup.rotation.y += 1.8 * dt;
    markerGroup.position.y = Math.sin(performance.now() / 300) * 0.6;

    // Check distance to objective
    const current = missionState.getCurrentMission();
    const dist = player.position.distanceTo(current.targetPos);
    if (dist < 6.5) {
      // Completed current objective!
      missionState.nextMission(policeSystem, player);
    }
  };

  return missionState;
}

window.createMissionSystem = createMissionSystem;
