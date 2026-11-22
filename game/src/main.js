// Main Game Engine Loop & Orchestrator for Solis City: Coral Coast
// Initializes Three.js WebGL scene, lighting, controls, simulation updates, and HUD.

window.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('canvas-container');
  const radarCanvas = document.getElementById('radar-canvas');
  const menuOverlay = document.getElementById('menu-overlay');
  const btnStart = document.getElementById('btn-start');
  const btnRestart = document.getElementById('btn-restart');
  const btnAudio = document.getElementById('btn-audio');

  // 1. THREE.JS INITIALIZATION
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x06080e);
  scene.fog = new THREE.FogExp2(0x0e1422, 0.0035);

  const camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(-80, 5, -195);

  const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;
  container.appendChild(renderer.domElement);

  // 2. LIGHTING & SUNSET SKY
  const ambientLight = new THREE.AmbientLight(0x283244, 0.85);
  scene.add(ambientLight);

  const hemiLight = new THREE.HemisphereLight(0xff6b8b, 0x0a192f, 0.75); // Coral sunset to ocean blue
  scene.add(hemiLight);

  const sunLight = new THREE.DirectionalLight(0xffaa77, 1.4); // Golden hour sun
  sunLight.position.set(120, 80, -100);
  sunLight.castShadow = true;
  sunLight.shadow.mapSize.width = 2048;
  sunLight.shadow.mapSize.height = 2048;
  sunLight.shadow.camera.near = 10;
  sunLight.shadow.camera.far = 400;
  sunLight.shadow.camera.left = -150;
  sunLight.shadow.camera.right = 150;
  sunLight.shadow.camera.top = 150;
  sunLight.shadow.camera.bottom = -150;
  scene.add(sunLight);

  // 3. BUILD GAME SYSTEMS
  const city = window.createCity(scene);
  const player = window.createPlayer(scene);
  const police = window.createPoliceSystem(scene);
  const combat = window.createCombatSystem(scene);
  const missions = window.createMissionSystem(scene);
  const hud = window.createHUD(radarCanvas);

  missions.startMission(0, police);

  // 4. INPUT MANAGEMENT
  const keys = {};
  window.addEventListener('keydown', (e) => {
    keys[e.code] = true;

    if (e.code === 'KeyF') {
      player.toggleVehicle();
    } else if (e.code === 'KeyQ') {
      combat.prevWeapon();
    } else if (e.code === 'KeyE') {
      combat.nextWeapon();
    } else if (e.code === 'KeyM') {
      missions.nextMission(police, player);
    } else if (e.code === 'Escape') {
      menuOverlay.classList.toggle('hidden');
    }
  });

  window.addEventListener('keyup', (e) => {
    keys[e.code] = false;
  });

  window.addEventListener('mousedown', (e) => {
    if (e.button === 0 && menuOverlay.classList.contains('hidden')) {
      // Fire active weapon
      combat.fire(player, camera, police.activeCruisers, police.helicopter);
    }
  });

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  // UI BUTTONS
  btnStart.addEventListener('click', () => {
    menuOverlay.classList.add('hidden');
    if (window.soundFX) window.soundFX.init();
  });

  btnRestart.addEventListener('click', () => {
    menuOverlay.classList.add('hidden');
    player.position.set(-80, 0.5, -180);
    if (player.vehicle) {
      player.vehicle.position.set(-80, 0, -180);
      player.vehicle.rotation.y = 0;
      player.vehicle.userData.speed = 0;
    }
    missions.startMission(0, police);
  });

  btnAudio.addEventListener('click', () => {
    if (window.soundFX) {
      const state = window.soundFX.toggleSound();
      btnAudio.innerText = state ? 'SOUND: ON' : 'SOUND: OFF';
    }
  });

  // 5. ANIMATION & SIMULATION LOOP
  let lastTime = performance.now();

  function animate() {
    requestAnimationFrame(animate);

    const now = performance.now();
    const dt = Math.min((now - lastTime) / 1000, 0.1);
    lastTime = now;

    // Simulate game only when not paused
    if (menuOverlay.classList.contains('hidden')) {
      // Update Player & Supercar
      player.update(dt, keys, camera, city.buildings);

      // Update Police Pursuit AI
      police.update(dt, player, city.buildings);

      // Update Combat FX & Projectiles
      combat.update(dt);

      // Update Mission Progression
      missions.update(dt, player, police);

      // Modulate Engine Sound FX
      if (window.soundFX && player.vehicle) {
        window.soundFX.updateEngine(player.vehicle.userData.speed, player.inVehicle);
      }

      // Update Radar & AAA HUD DOM
      hud.renderRadar(player, police, missions.getCurrentMission());
      hud.updateDOM(player, police, combat, missions.getCurrentMission());
    }

    renderer.render(scene, camera);
  }

  animate();
});
