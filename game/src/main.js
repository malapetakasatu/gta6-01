// SOLIS CITY: CORAL COAST - Main Game Application & Render Loop
// Orchestrates Three.js rendering, physics simulation, police AI,
// combat ballistics, dynamic HUD updates, and preset camera shots.

/* global THREE */

import { City } from './city.js';
import { Supercar, TacticalHelicopter } from './vehicles.js';
import { Player } from './player.js';
import { PoliceManager } from './police.js';
import { CombatSystem } from './combat.js';
import { MissionManager } from './missions.js';
import { HUD } from './hud.js';
import { AudioManager } from './audio.js';

class Game {
  constructor() {
    this.canvas = document.getElementById('webgl-canvas');
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.clock = null;

    // Subsystems
    this.city = null;
    this.supercar = null;
    this.helicopter = null;
    this.police = null;
    this.player = null;
    this.combat = null;
    this.missions = null;
    this.hud = null;
    this.audio = null;

    // Input state
    this.input = {
      forward: false,
      backward: false,
      left: false,
      right: false,
      nitro: false,
      handbrake: false,
      isAiming: false,
      isShooting: false
    };

    this.isPaused = false;
    this.init();
  }

  init() {
    // 1. Three.js Scene Setup
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0a0f1d);
    // Atmospheric sunset coral haze fog
    this.scene.fog = new THREE.FogExp2(0x1a1228, 0.0035);

    // 2. Camera Setup
    const aspect = window.innerWidth / window.innerHeight;
    this.camera = new THREE.PerspectiveCamera(65, aspect, 0.1, 1000);
    this.camera.position.set(0, 4, -10);

    // 3. WebGL Renderer
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    if (THREE.ACESFilmicToneMapping) {
      this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
      this.renderer.toneMappingExposure = 1.15;
    }

    this.clock = new THREE.Clock();

    // 4. Lighting Rig
    this.setupLighting();

    // 5. Initialize Game Systems
    this.city = new City(this.scene);
    this.supercar = new Supercar(this.scene);
    this.supercar.position.set(-90, 0.45, 0); // Start on Ocean Drive
    this.supercar.heading = Math.PI;

    this.helicopter = new TacticalHelicopter(this.scene);
    this.police = new PoliceManager(this.scene, this.city, this.helicopter);
    this.player = new Player(this.scene, this.camera, this.supercar);
    this.combat = new CombatSystem(this.scene, this.camera);
    this.missions = new MissionManager(this);
    this.hud = new HUD(this);
    this.audio = new AudioManager();

    // 6. Bind Event Listeners
    this.bindInputs();
    this.bindUI();

    // 7. Check for preset shot query params
    this.handlePresetShots();

    // 8. Start Render Loop
    window.addEventListener('resize', () => this.onResize());
    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);
  }

  setupLighting() {
    // Directional Sunset Sun
    const sun = new THREE.DirectionalLight(0xffaa77, 2.2);
    sun.position.set(-150, 120, -100);
    sun.castShadow = true;
    sun.shadow.mapSize.width = 2048;
    sun.shadow.mapSize.height = 2048;
    sun.shadow.camera.near = 10;
    sun.shadow.camera.far = 450;
    sun.shadow.camera.left = -120;
    sun.shadow.camera.right = 120;
    sun.shadow.camera.top = 120;
    sun.shadow.camera.bottom = -120;
    this.scene.add(sun);

    // Hemispheric Ambient Light (Sky / Ground gradient)
    const hemiLight = new THREE.HemisphereLight(0x5c7cfa, 0xff6b81, 1.1);
    this.scene.add(hemiLight);
  }

  bindInputs() {
    window.addEventListener('keydown', (e) => {
      this.audio.init();

      switch (e.code) {
        case 'KeyW': case 'ArrowUp': this.input.forward = true; break;
        case 'KeyS': case 'ArrowDown': this.input.backward = true; break;
        case 'KeyA': case 'ArrowLeft': this.input.left = true; break;
        case 'KeyD': case 'ArrowRight': this.input.right = true; break;
        case 'ShiftLeft': case 'ShiftRight': this.input.nitro = true; break;
        case 'Space': this.input.handbrake = true; break;
        case 'KeyF': case 'KeyE': this.player.toggleVehicle(); break;
        case 'KeyR': this.combat.reload(); break;
        case 'Digit1': this.combat.selectWeapon(0); break;
        case 'Digit2': this.combat.selectWeapon(1); break;
        case 'Digit3': this.combat.selectWeapon(2); break;
        case 'Digit4': this.combat.selectWeapon(3); break;
        case 'Digit5': this.combat.selectWeapon(4); break;
        case 'KeyP': case 'Escape': this.togglePause(); break;
      }
    });

    window.addEventListener('keyup', (e) => {
      switch (e.code) {
        case 'KeyW': case 'ArrowUp': this.input.forward = false; break;
        case 'KeyS': case 'ArrowDown': this.input.backward = false; break;
        case 'KeyA': case 'ArrowLeft': this.input.left = false; break;
        case 'KeyD': case 'ArrowRight': this.input.right = false; break;
        case 'ShiftLeft': case 'ShiftRight': this.input.nitro = false; break;
        case 'Space': this.input.handbrake = false; break;
      }
    });

    // Mouse Combat Shooting
    window.addEventListener('mousedown', (e) => {
      this.audio.init();
      if (e.button === 0) {
        this.input.isShooting = true;
        this.shootWeapon();
      } else if (e.button === 2) {
        this.input.isAiming = true;
        const crosshair = document.getElementById('crosshair');
        if (crosshair) crosshair.style.display = 'block';
      }
    });

    window.addEventListener('mouseup', (e) => {
      if (e.button === 0) this.input.isShooting = false;
      if (e.button === 2) {
        this.input.isAiming = false;
        const crosshair = document.getElementById('crosshair');
        if (crosshair) crosshair.style.display = 'none';
      }
    });

    window.addEventListener('contextmenu', (e) => e.preventDefault());
  }

  bindUI() {
    const resumeBtn = document.getElementById('btn-resume');
    if (resumeBtn) resumeBtn.addEventListener('click', () => this.togglePause());

    const muteBtn = document.getElementById('btn-mute');
    if (muteBtn) {
      muteBtn.addEventListener('click', () => {
        const isMuted = this.audio.toggleMute();
        muteBtn.textContent = isMuted ? 'UNMUTE AUDIO' : 'MUTE AUDIO';
      });
    }
  }

  togglePause() {
    this.isPaused = !this.isPaused;
    const menu = document.getElementById('pause-menu');
    if (menu) menu.style.display = this.isPaused ? 'flex' : 'none';
  }

  shootWeapon() {
    if (!this.combat || !this.camera) return;

    // Raycast direction forward from camera
    const origin = this.camera.position.clone();
    const dir = new THREE.Vector3();
    this.camera.getWorldDirection(dir);

    const targets = [...this.police.cruisers];
    this.combat.fire(origin, dir, targets, this.audio);
  }

  handlePresetShots() {
    const urlParams = new URLSearchParams(window.location.search);
    const shot = urlParams.get('shot');

    if (shot === 'chase') {
      // 1-chase preset: High-speed pursuit on Ocean Drive
      this.supercar.position.set(-90, 0.45, -40);
      this.supercar.speed = 64; // ~142 MPH
      this.supercar.heading = Math.PI;
      this.police.setWantedLevel(3);
      this.missions.startMission(4); // Skyline Heist
    } else if (shot === 'combat') {
      // 2-combat preset: Shootout & explosion
      this.supercar.position.set(0, 0.45, 20);
      this.police.setWantedLevel(4);
      this.combat.selectWeapon(3); // M4A1
      this.combat.spawnExplosion(new THREE.Vector3(8, 1, 35), 14, 250);
    } else if (shot === 'map') {
      // 3-map preset: Scenic skyline overview
      this.supercar.position.set(45, 0.45, 0);
      this.police.setWantedLevel(2);
    } else if (shot === 'title') {
      // 4-title preset: Front hero shot of Veloce GTS Turbo
      this.supercar.position.set(-90, 0.45, 0);
      this.camera.position.set(-90, 1.8, 6.5);
      this.camera.lookAt(-90, 0.8, 0);
    }
  }

  onResize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
  }

  animate() {
    requestAnimationFrame(this.animate);
    if (this.isPaused) return;

    const dt = Math.min(this.clock.getDelta(), 0.1);
    const time = this.clock.getElapsedTime();

    // 1. Update Player & Supercar
    this.player.update(dt, this.input, this.city);

    // 2. Continuous shooting if holding left click
    if (this.input.isShooting) {
      this.shootWeapon();
    }

    // 3. Update CPD Police AI & Roadblocks
    this.police.update(dt, this.player.position, time);

    // 4. Update Combat & Ballistics
    this.combat.update(dt, this.police.cruisers);

    // 5. Update Story Missions
    this.missions.update(dt, this.player.position);

    // 6. Update Procedural City Animation (water, neon)
    this.city.update(time);

    // 7. Update Web Audio Synthesizer
    if (this.audio) {
      this.audio.updateEngine(this.supercar.speed, this.supercar.maxSpeed, this.supercar.isNitroActive);
      if (this.police.wantedLevel > 0) this.audio.startSiren();
      else this.audio.stopSiren();
    }

    // 8. Update AAA HUD
    this.hud.update(dt, time);

    // 9. Render Three.js Scene
    this.renderer.render(this.scene, this.camera);
  }
}

// Launch Game on Load
window.addEventListener('DOMContentLoaded', () => {
  window.gameInstance = new Game();
});
