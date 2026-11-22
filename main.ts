// SOLIS CITY: CORAL COAST Entrypoint - v1.0.0 (Production Release)
// Builds the dossier and bundles game assets for make.fun GTA 6 challenge (Coral Coast Edition).

import * as fs from 'fs';
import * as path from 'path';

const outputDir = process.env.MAKEFUN_OUTPUT_DIR || 'out';
const rootDir = process.cwd();

console.log(`[BUILD] Solis City: Coral Coast bundle initiated. Target output: ${outputDir}`);

// Ensure target output directory exists
fs.mkdirSync(outputDir, { recursive: true });

function copyRecursive(src: string, dest: string) {
  if (!fs.existsSync(src)) return;
  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    fs.mkdirSync(dest, { recursive: true });
    for (const item of fs.readdirSync(src)) {
      copyRecursive(path.join(src, item), path.join(dest, item));
    }
  } else {
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(src, dest);
  }
}

// 1. Copy game assets
console.log('[BUILD] Copying game assets to output directory...');
copyRecursive(path.join(rootDir, 'game'), path.join(outputDir, 'game'));

// 2. Copy screenshots
console.log('[BUILD] Copying screenshots to output directory...');
copyRecursive(path.join(rootDir, 'screenshots'), path.join(outputDir, 'screenshots'));

// 3. Copy README
if (fs.existsSync(path.join(rootDir, 'README.md'))) {
  fs.copyFileSync(path.join(rootDir, 'README.md'), path.join(outputDir, 'README.md'));
}

// 4. Generate comprehensive dossier.json
const dossier = {
  name: "SOLIS CITY: CORAL COAST",
  version: "1.0.0",
  engine: "Three.js r128 + WebGL + Web Audio API Procedural Synth",
  description: "An original 3D open-world crime action game inspired by GTA VI. Features a sprawling coastal metropolis with Ocean Boulevard, sandy beaches, 40+ textured skyscrapers with lit windows and neon accents, supercar vehicle physics (Veloce GTS Turbo), CPD pursuit AI with 4 wanted levels, CONDOR-1 police helicopter with searchlight cone, full story campaign with 8 missions, raycast combat arsenal, and an authentic AAA HUD with minimap radar.",
  entrypoint: "game/index.html",
  preview: "screenshots/1-chase.jpg",
  screenshots: [
    "screenshots/1-chase.jpg",
    "screenshots/2-combat.jpg",
    "screenshots/3-map.jpg",
    "screenshots/4-title.jpg"
  ],
  features: [
    "Sprawling 3D Coastal Metropolis: Ocean Boulevard, Palm Avenue, Downtown Expressway, sandy beaches, procedural palm trees, and 40+ skyscrapers.",
    "Supercar Vehicle Physics: Veloce GTS Turbo with realistic acceleration, gear shifting, drift friction, braking, wheel spin, and night driving spotlights.",
    "CPD Pursuit & Wanted AI: 1-4 Wanted Stars, cruiser interceptors, aggressive ramming, roadblocks, and CONDOR-1 air support with tracking spotlight.",
    "8 Story Missions: Spanning 6 distinct city districts from Coral Beach to Downtown Financial Core.",
    "Full Combat Arsenal: P9-Combat Pistol, Viper-9 SMG, Carbine-15 Assault Rifle, and Heavy Sniper with raycasts, muzzle flashes, and ricochet sparks.",
    "Procedural Web Audio API Sound System: Pure mathematical synthesis for supercar engine roar, police sirens, gunshots, and explosions with zero external audio files.",
    "AAA GTA 6 HUD: Radar minimap with player heading, police blips, GPS route lines, digital speedometer, wanted star animations, and dispatch ticker."
  ],
  controls: {
    "W, A, S, D": "Drive supercar or move pedestrian on foot",
    "Space": "Handbrake / Emergency brake",
    "Left Mouse Button": "Fire active weapon",
    "F": "Enter / Exit vehicle",
    "Q / E": "Switch previous / next weapon",
    "M": "Advance story mission",
    "Escape": "Toggle pause menu"
  },
  districts: [
    { name: "Coral Beach", standing: 92, risk: "Low" },
    { name: "Downtown Core", standing: 85, risk: "High" },
    { name: "Neon Strip", standing: 78, risk: "Medium" },
    { name: "Port Horizon", standing: 64, risk: "Medium" },
    { name: "Palm Bay", standing: 88, risk: "Low" },
    { name: "Marina Bay", standing: 70, risk: "Medium" }
  ],
  missions: [
    { id: 1, name: "WELCOME TO SOLIS", district: "Coral Beach", reward: 25000 },
    { id: 2, name: "NEON SHADOWS", district: "Neon Strip", reward: 45000 },
    { id: 3, name: "HIGHWAY EXPRESS", district: "Palm Bay", reward: 60000 },
    { id: 4, name: "HEATWAVE", district: "Downtown", reward: 85000 },
    { id: 5, name: "CONDOR DOWN", district: "Marina Bay", reward: 120000 },
    { id: 6, name: "CARTEL SHIPMENT", district: "Port Horizon", reward: 150000 },
    { id: 7, name: "TOWER HEIST", district: "Downtown Core", reward: 350000 },
    { id: 8, name: "KING OF THE COAST", district: "Coral Coastline", reward: 1000000 }
  ]
};

const dossierPath = path.join(outputDir, 'dossier.json');
fs.writeFileSync(dossierPath, JSON.stringify(dossier, null, 2), 'utf-8');
console.log(`[BUILD] dossier.json successfully written to ${dossierPath}`);
console.log('[BUILD] Solis City: Coral Coast build complete!');
