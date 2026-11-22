// SOLIS CITY: CORAL COAST - Three.js WebGL Engine Core & Render Loop
// Orchestrates City, Vehicles, Player, Police AI, Combat Arsenal, Story Missions, and AAA HUD.

import { City } from './city.js';
import { VehicleManager } from './vehicles.js';
import { Player } from './player.js';
import { PoliceManager } from './police.js';
import { CombatSystem } from './combat.js';
import { MissionManager } from './missions.js';
import { HUD } from './hud.js';
import { AudioManager } from './audio.js';
import { stageScene } from './staging.js';

const THREE = window.THREE;

class SolisEngine {
  constructor() {
    this.canvas = document.getElementById('webgl-canvas');
    this.isPaused = false;
    this.clock = new THREE.Clock();

    this.input = {
      forward: false,
      backward: false,
      left: false,
      right: false,
      handbrake: false,
      mouseAim: new THREE.Vector2(),
      isShooting: false
    };

    this.initRenderer();
    this.initScene();
    this.initSubsystems();
    this.bindEvents();

    const params = new URLSearchParams(window.location.search);
    const shot = params.get('shot');
    if (shot) {
      this.isStaged = true;
      stageScene(this, shot);
    }

    this.startLoop();
  }

  initRenderer() {
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
  }

  initScene() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0e1726); // Twilight Coastal Blue
    this.scene.fog = new THREE.FogExp2(0x0e1726, 0.0035);

    this.camera = new THREE.PerspectiveCamera(62, window.innerWidth / window.innerHeight, 0.5, 1200);
    this.camera.position.set(100, 10, 20);

    // Dynamic Sunset Golden-Hour Sun
    this.sun = new THREE.DirectionalLight(0xffaa55, 2.2);
    this.sun.position.set(120, 140, 80);
    this.sun.castShadow = true;
    this.sun.shadow.mapSize.width = 2048;
    this.sun.shadow.mapSize.height = 2048;
    this.sun.shadow.camera.near = 10;
    this.sun.shadow.camera.far = 400;
    this.sun.shadow.camera.left = -160;
    this.sun.shadow.camera.right = 160;
    this.sun.shadow.camera.top = 160;
    this.sun.shadow.camera.bottom = -160;
    this.scene.add(this.sun);

    // Coastal Hemisphere Ambient
    const hemiLight = new THREE.HemisphereLight(0xffcc88, 0x112244, 0.9);
    this.scene.add(hemiLight);
  }

  initSubsystems() {
    this.audio = new AudioManager();
    this.city = new City(this.scene);
    this.vehicleManager = new VehicleManager(this.scene, this.city);
    this.player = new Player(this.scene, this.camera, this.vehicleManager);
    this.police = new PoliceManager(this.scene, this.city, this.vehicleManager);
    this.combat = new CombatSystem(this.scene, this.camera, this.audio);
    this.hud = new HUD();
    this.missions = new MissionManager(this.scene, this.hud, this.police);
  }

  bindEvents() {
    window.addEventListener('resize', () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    });

    window.addEventListener('keydown', (e) => {
      if (this.audio) this.audio.resume();

      switch (e.code) {
        case 'KeyW': case 'ArrowUp': this.input.forward = true; break;
        case 'KeyS': case 'ArrowDown': this.input.backward = true; break;
        case 'KeyA': case 'ArrowLeft': this.input.left = true; break;
        case 'KeyD': case 'ArrowRight': this.input.right = true; break;
        case 'Space': this.input.handbrake = true; break;
        case 'KeyE': this.player.toggleVehicle(); break;
        case 'KeyR': this.combat.reload(); break;
        case 'Digit1': this.combat.selectWeapon(0); break;
        case 'Digit2': this.combat.selectWeapon(1); break;
        case 'Digit3': this.combat.selectWeapon(2); break;
        case 'Digit4': this.combat.selectWeapon(3); break;
        case 'Digit5': this.combat.selectWeapon(4); break;
        case 'Escape': this.togglePause(); break;
      }
    });

    window.addEventListener('keyup', (e) => {
      switch (e.code) {
        case 'KeyW': case 'ArrowUp': this.input.forward = false; break;
        case 'KeyS': case 'ArrowDown': this.input.backward = false; break;
        case 'KeyA': case 'ArrowLeft': this.input.left = false; break;
        case 'KeyD': case 'ArrowRight': this.input.right = false; break;
        case 'Space': this.input.handbrake = false; break;
      }
    });

    window.addEventListener('mousedown', (e) => {
      if (e.button === 0 && !this.isPaused) {
        if (this.audio) this.audio.resume();
        const origin = this.player.pos.clone().add(new THREE.Vector3(0, 1.4, 0));
        const forward = new THREE.Vector3(
          Math.sin(this.player.rotY),
          0,
          Math.cos(this.player.rotY)
        );
        this.combat.shoot(origin, forward, this.police.cruisers);
      }
    });

    const resumeBtn = document.getElementById('resume-btn');
    if (resumeBtn) {
      resumeBtn.addEventListener('click', () => this.togglePause());
    }
  }

  togglePause() {
    this.isPaused = !this.isPaused;
    const modal = document.getElementById('pause-menu');
    if (modal) {
      if (this.isPaused) {
        modal.classList.add('active');
      } else {
        modal.classList.remove('active');
      }
    }
  }

  startLoop() {
    const loop = () => {
      requestAnimationFrame(loop);
      if (!this.isPaused) {
        const delta = Math.min(this.clock.getDelta(), 0.1);
        const time = this.clock.getElapsedTime();

        // Subsystems Tick
        this.city.update(delta, time);
        this.vehicleManager.update(delta, time, this.input);
        this.player.update(this.input, delta);
        this.police.update(delta, time, this.player.pos);
        this.combat.update(delta);
        this.missions.update(this.player.pos);

        // Update Radar & HUD
        const activeMission = this.missions.getActiveMission();
        this.hud.updateRadar(
          this.player.pos,
          this.player.rotY,
          activeMission ? activeMission.target : null,
          this.police.cruisers
        );
        this.hud.updateStats(this.vehicleManager.supercar, this.player);

        // Render Scene
        this.renderer.render(this.scene, this.camera);
      } else if (this.isStaged) {
        this.renderer.render(this.scene, this.camera);
      }
    };
    loop();
  }
}

window.addEventListener('DOMContentLoaded', () => {
  new SolisEngine();
});
