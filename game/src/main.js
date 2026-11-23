import * as THREE from './three.module.js';
import { AudioManager } from './audio.js';
import { HUD } from './hud.js';
import { City } from './city.js';
import { VehicleManager } from './vehicles.js';
import { PoliceManager } from './police.js';
import { Player } from './player.js';
import { CombatSystem } from './combat.js';
import { MissionManager } from './missions.js';
import { stageScene } from './staging.js';

/**
 * Solis City: Coral Coast - Main Game Engine
 * 3D WebGL Open-World Architecture orchestrating all subsystems.
 */

export class SolisEngine {
  constructor() {
    this.canvas = document.getElementById('webgl-canvas');
    this.clock = new THREE.Clock();
    this.isPaused = false;
    this.stagedShot = null;

    this.initThree();
    this.initSubsystems();
    this.initEvents();
    this.checkStagedShot();

    // Start render loop
    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);
  }

  initThree() {
    // Scene & Viewport
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0b1020);
    this.scene.fog = new THREE.FogExp2(0x0b1020, 0.004);

    const aspect = window.innerWidth / window.innerHeight;
    this.camera = new THREE.PerspectiveCamera(62, aspect, 0.1, 1200);
    this.camera.position.set(240, 4, -12);

    // High performance WebGLRenderer
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      powerPreference: 'high-performance',
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Default Atmospheric Lighting
    this.ambientLight = new THREE.AmbientLight(0x3a4b6b, 1.4);
    this.scene.add(this.ambientLight);

    this.sunLight = new THREE.DirectionalLight(0xffcc88, 2.2);
    this.sunLight.position.set(120, 160, 80);
    this.scene.add(this.sunLight);
  }

  initSubsystems() {
    this.audio = new AudioManager();
    this.hud = new HUD();
    this.city = new City(this.scene);
    this.vehicles = new VehicleManager(this.scene);
    this.police = new PoliceManager(this.scene, this.audio);
    this.player = new Player(this.scene, this.camera, this.audio);
    this.combat = new CombatSystem(this.scene, this.camera, this.audio, this.hud);
    this.missions = new MissionManager(this.scene, this.audio, this.hud);

    window.gameEngine = this;
  }

  initEvents() {
    window.addEventListener('resize', () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    });

    // Audio init on first user click
    window.addEventListener('click', () => {
      this.audio.init();
      this.audio.resume();
    }, { once: true });
  }

  checkStagedShot() {
    const params = new URLSearchParams(window.location.search);
    const shot = params.get('shot');
    if (shot) {
      this.stagedShot = shot;
      stageScene(this, shot);
    }
  }

  tryEnterClosestVehicle() {
    const pPos = this.player.getPosition();
    let closestCar = null;
    let minDist = 7.0;

    this.vehicles.vehicles.forEach(v => {
      const dist = pPos.distanceTo(v.mesh.position);
      if (dist < minDist) {
        minDist = dist;
        closestCar = v;
      }
    });

    if (closestCar) {
      this.player.enterVehicle(closestCar);
    }
  }

  animate() {
    requestAnimationFrame(this.animate);

    const dt = Math.min(this.clock.getDelta(), 0.1);

    // If static shot query is loaded, allow minimal ambient motion (water, rotor)
    if (this.stagedShot) {
      this.city.update(dt);
      if (this.police.helicopter) {
        this.police.helicopter.rotor.rotation.y += dt * 25;
      }
      this.renderer.render(this.scene, this.camera);
      return;
    }

    // Full real-time game simulation
    const pPos = this.player.getPosition();

    this.city.update(dt);
    this.vehicles.update(dt);
    this.player.update(dt);
    this.police.update(dt, pPos);
    this.combat.update(dt);
    this.missions.update(dt, pPos);
    this.hud.update(dt, this.player, this.player.currentVehicle, this.police, this.missions, this.combat);

    this.renderer.render(this.scene, this.camera);
  }
}

// Bootstrap Engine on DOM Load
window.addEventListener('DOMContentLoaded', () => {
  new SolisEngine();
});
