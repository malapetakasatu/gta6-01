// main.js: Game Orchestrator & Animation Loop
import { createCity } from './city.js';
import { createVehicles } from './vehicles.js';
import { createPlayer } from './player.js';
import { createPoliceSystem } from './police.js';
import { createCombatSystem } from './combat.js';
import { createMissionManager } from './missions.js';
import { createHUD } from './hud.js';
import { createAudioSystem } from './audio.js';

// Setup Three.js Scene, Camera, Renderer
const container = document.getElementById('canvas-container');
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xef8844); // Sunset orange horizon
scene.fog = new THREE.FogExp2(0xef8844, 0.0035);

const camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 0.5, 600);
camera.position.set(0, 4.5, -58);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
container.appendChild(renderer.domElement);

// Initialize Subsystems
const city = createCity(scene);
const vehicleFactory = createVehicles(scene);
const player = createPlayer(scene, camera);
const police = createPoliceSystem(scene, vehicleFactory);
const combat = createCombatSystem(scene);
const missions = createMissionManager();
const hud = createHUD();
const audio = createAudioSystem();

// Spawn Player's Veloce GTS Supercar
const playerCar = vehicleFactory.createSupercar(0, -50, 0xff5500);
playerCar.isPlayer = true;
player.currentVehicle = playerCar;
player.inVehicle = true; // Start in high-speed pursuit!
player.mesh.visible = false; // Inside vehicle

// Resize Handler
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Click to initialize audio & shoot
window.addEventListener('pointerdown', () => {
  audio.init();
  if (!player.inVehicle) {
    const origin = player.mesh.position.clone().add(new THREE.Vector3(0, 1.2, 0));
    const forward = new THREE.Vector3(0, 0, 1).applyQuaternion(player.mesh.quaternion);
    combat.shoot(origin, forward);
    audio.playGunshot();
  }
});

// Main Loop
let lastTime = performance.now();
function animate(now) {
  requestAnimationFrame(animate);
  const delta = Math.min((now - lastTime) / 1000, 0.1);
  lastTime = now;

  // Update Player Driving & Physics
  if (player.inVehicle && playerCar) {
    // High-speed cruise/chase down boulevard
    playerCar.speed = 34.5; // ~124 km/h
    playerCar.mesh.position.x += Math.sin(now * 0.001) * 0.05; // slight weave
    
    // Rotate wheels
    playerCar.wheels.forEach(w => {
      w.children[0].rotation.x += delta * 25;
    });
  }

  // Update Police Units
  const pPos = playerCar ? playerCar.mesh.position : player.mesh.position;
  police.update(delta, pPos);

  // Update Combat & Bullets
  combat.update(delta);

  // Update Camera
  player.updateCamera();

  // Render Scene
  renderer.render(scene, camera);
}

requestAnimationFrame(animate);
console.log('SOLIS CITY: CORAL COAST initialized successfully!');