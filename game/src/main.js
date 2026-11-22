// Main Game Engine Orchestration for SOLIS CITY: CORAL COAST
// Coordinates Three.js render loop, physics simulation, player controller,
// CPD AI pursuit system, weapons combat, 8-mission campaign, HUD, and Web Audio.

import { City } from './city.js';
import { Vehicle } from './vehicles.js';
import { Player } from './player.js';
import { PoliceSystem } from './police.js';
import { CombatSystem } from './combat.js';
import { MissionSystem } from './missions.js';
import { HUD } from './hud.js';
import { AudioSystem } from './audio.js';

class Game {
  constructor() {
    this.container = document.getElementById('webgl-container');
    this.input = {
      forward: false,
      backward: false,
      left: false,
      right: false,
      sprint: false,
      handbrake: false,
      nitro: false
    };

    this.clock = new THREE.Clock();
    this.initScene();
    this.initEntities();
    this.initInputListeners();
    this.handleQueryParams();

    window.addEventListener('resize', () => this.onWindowResize());
    this.animate();
  }

  initScene() {
    // 1. Scene & Coastal Atmosphere Fog
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x111624);
    this.scene.fog = new THREE.FogExp2(0x14182b, 0.0022);

    // 2. Camera Setup
    const aspect = window.innerWidth / window.innerHeight;
    this.camera = new THREE.PerspectiveCamera(68, aspect, 0.2, 1200);
    this.camera.position.set(-280, 8, 25);

    // 3. WebGL Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    this.container.appendChild(this.renderer.domElement);

    // 4. Lighting Environment (Twilight Coral Sunset)
    const ambient = new THREE.AmbientLight(0x2a3048, 1.2);
    this.scene.add(ambient);

    const hemiLight = new THREE.HemisphereLight(0x00f0ff, 0xff2a85, 0.6);
    this.scene.add(hemiLight);

    const sun = new THREE.DirectionalLight(0xffaa55, 2.2);
    sun.position.set(-300, 150, -200);
    sun.castShadow = true;
    sun.shadow.mapSize.width = 2048;
    sun.shadow.mapSize.height = 2048;
    sun.shadow.camera.near = 10;
    sun.shadow.camera.far = 600;
    const d = 120;
    sun.shadow.camera.left = -d;
    sun.shadow.camera.right = d;
    sun.shadow.camera.top = d;
    sun.shadow.camera.bottom = -d;
    this.scene.add(sun);
  }

  initEntities() {
    // City Environment
    this.city = new City(this.scene);

    // Player Supercar (Veloce GTS Turbo)
    this.supercar = new Vehicle(this.scene, "supercar");
    this.supercar.position.set(-280, 0, 0);

    // Player Character & Camera
    this.player = new Player(this.scene, this.camera);
    this.player.enterVehicle(this.supercar);

    // Police Pursuit AI System
    this.police = new PoliceSystem(this.scene, this.city);

    // Arsenal & Ballistics Combat
    this.combat = new CombatSystem(this.scene, this.camera);

    // 8-Mission Story Campaign
    this.missions = new MissionSystem(this.scene);

    // HUD & Vector Minimap
    this.hud = new HUD();

    // Procedural Audio Engine
    this.audio = new AudioSystem();
  }

  initInputListeners() {
    window.addEventListener('keydown', (e) => {
      this.audio.init();

      switch (e.code) {
        case 'KeyW': case 'ArrowUp': this.input.forward = true; break;
        case 'KeyS': case 'ArrowDown': this.input.backward = true; break;
        case 'KeyA': case 'ArrowLeft': this.input.left = true; break;
        case 'KeyD': case 'ArrowRight': this.input.right = true; break;
        case 'ShiftLeft': case 'ShiftRight':
          this.input.sprint = true;
          this.input.nitro = true;
          if (this.player.inVehicle && this.supercar.speed > 5) this.audio.playNitro();
          break;
        case 'Space': this.input.handbrake = true; break;
        case 'KeyF':
          if (this.player.inVehicle) {
            this.player.exitVehicle();
          } else {
            const dx = this.player.position.x - this.supercar.position.x;
            const dz = this.player.position.z - this.supercar.position.z;
            if (Math.sqrt(dx * dx + dz * dz) < 6) {
              this.player.enterVehicle(this.supercar);
            }
          }
          break;
        case 'Digit1': this.combat.selectWeapon(0); break;
        case 'Digit2': this.combat.selectWeapon(1); break;
        case 'Digit3': this.combat.selectWeapon(2); break;
        case 'Digit4': this.combat.selectWeapon(3); break;
        case 'Digit5': this.combat.selectWeapon(4); break;
        case 'KeyR': this.combat.reload(); break;
      }
    });

    window.addEventListener('keyup', (e) => {
      switch (e.code) {
        case 'KeyW': case 'ArrowUp': this.input.forward = false; break;
        case 'KeyS': case 'ArrowDown': this.input.backward = false; break;
        case 'KeyA': case 'ArrowLeft': this.input.left = false; break;
        case 'KeyD': case 'ArrowRight': this.input.right = false; break;
        case 'ShiftLeft': case 'ShiftRight':
          this.input.sprint = false;
          this.input.nitro = false;
          break;
        case 'Space': this.input.handbrake = false; break;
      }
    });

    window.addEventListener('mousedown', (e) => {
      this.audio.init();
      if (e.button === 0) {
        const origin = this.player.inVehicle ? this.supercar.position.clone().add(new THREE.Vector3(0, 1.2, 0)) : this.player.position.clone().add(new THREE.Vector3(0, 1.4, 0));
        this.combat.shoot(origin, this.police, this.audio);
      }
    });

    window.addEventListener('mousemove', (e) => {
      if (!this.player.inVehicle) {
        this.player.camYaw -= e.movementX * 0.003;
      }
    });
  }

  handleQueryParams() {
    const params = new URLSearchParams(window.location.search);
    const shot = params.get('shot');

    if (shot === 'chase') {
      this.supercar.position.set(-280, 0, 40);
      this.supercar.speed = 52; // ~185 km/h
      this.police.wantedLevel = 3;
      this.police.cruisers[0].position.set(-280, 0, 15);
      this.police.cruisers[1].position.set(-275, 0, -5);
    } else if (shot === 'combat') {
      this.player.exitVehicle();
      this.player.position.set(120, 0, 80);
      this.combat.selectWeapon(2); // Carbine
      this.police.wantedLevel = 4;
    } else if (shot === 'map') {
      this.camera.position.set(0, 380, 10);
      this.camera.lookAt(0, 0, 0);
    }
  }

  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    const dt = Math.min(this.clock.getDelta(), 0.06);
    const time = this.clock.getElapsedTime();

    // 1. Vehicle & Player Simulation
    if (this.player.inVehicle) {
      this.supercar.updatePhysics(dt, this.input, this.city);
    }
    this.player.update(dt, this.input, this.city);

    // 2. City Procedural Animation
    this.city.update(time);

    // 3. Tactical CPD Police Pursuit AI
    const playerTargetPos = this.player.inVehicle ? this.supercar.position : this.player.position;
    this.police.update(dt, playerTargetPos, this.player.inVehicle ? this.supercar : null);

    // 4. Weapons & Particle Systems
    this.combat.update(dt);

    // 5. Mission Objectives Logic
    const speedKm = Math.abs(this.supercar.speed) * 3.6;
    if (this.missions.checkObjective(playerTargetPos, speedKm)) {
      const advanced = this.missions.advanceMission();
      const modal = document.getElementById('modal-overlay');
      if (modal) {
        modal.style.display = 'flex';
        document.getElementById('modal-desc').innerText = `You completed: ${this.missions.missions[this.missions.currentIndex - 1].title}! Reward deposited.`;
      }
    }
    this.missions.update(time);

    // 6. Audio Engine Parameter Updates
    const speedRatio = Math.abs(this.supercar.speed) / this.supercar.maxSpeed;
    this.audio.updateEngine(speedRatio, this.player.inVehicle);

    // 7. AAA HUD & Vector Minimap Render
    this.hud.update(this.player, this.supercar, this.combat, this.police, this.missions, this.city);

    // 8. Render Scene
    this.renderer.render(this.scene, this.camera);
  }
}

// Start Game Instance
window.addEventListener('DOMContentLoaded', () => {
  window.gameInstance = new Game();
});
