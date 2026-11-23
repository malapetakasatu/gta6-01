# Solis City: Coral Coast (GTA 6 Submission)

[![make.fun · gta6-01](https://make.fun/badge/gta6-01.svg)](https://make.fun/bounty/gta6-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-01)
[![rank](https://make.fun/badge/gta6-01/malapetakasatu/gta6-01/rank.svg)](https://make.fun/bounty/gta6-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-01)
[![reward](https://make.fun/badge/gta6-01/malapetakasatu/gta6-01/reward.svg)](https://make.fun/bounty/gta6-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-01)

An open-world next-generation 3D action experience built from the ground up for modern web browsers. Set in the sun-drenched, neon-lit tropical metropolis of Solis City, players navigate criminal syndicates, high-stakes street races, and escalating confrontations with the Coral Coast Police Department (CPD).

---

## 🌴 Overview

**Solis City: Coral Coast** is an open-world sandbox game engineered in TypeScript and Three.js. It features a sprawling procedural city grid, responsive vehicular physics, dynamic law enforcement response hierarchies, an authentic raycast ballistics engine, an immersive mission progression campaign, and an authentic canvas radar HUD.

---

## ⚡ Core Features

### 1. Procedural Metropolis Engine
- **City Grid & Landmarks**: Seamless procedural urban generation featuring coastal highways, downtown skyscrapers with illuminated glass textures, beachfront promenades, palm trees, and animated neon billboards.
- **Atmospheric Lighting**: Dynamic day/dusk/night ambient transitions with volumetric sun glare, high-bloom street lamps, and reflective wet-asphalt shader accents.
- **Pedestrian & Ambient Traffic Simulation**: Dynamic civilian routing and ambient vehicular flows populating the city grid.

### 2. Veloce GTS Supercar Physics
- **Rigid-Body & Handling Dynamics**: Physics-driven acceleration, braking, torque distribution, and lateral drift friction coefficients.
- **Visual Effects**: Particle-based tire smoke, asphalt skid marks, dynamic vehicle body roll, and high-speed motion blur.
- **Seamless Vehicle Interaction**: Intuitive enter/exit transitions (`F` key) between on-foot locomotion and supercar driving mode.

### 3. CPD Law Enforcement AI & CONDOR-1
- **Wanted Level Hierarchy**: 1-to-5 star escalation system triggered by illegal actions (vehicular manslaughter, discharge of firearms, property destruction).
- **Tactical Pursuit Pathfinding**: Patrol cruisers execute pursuit intercept angles, PIT maneuvers, and perimeter containment.
- **CONDOR-1 Tactical Helicopter**: Airborne surveillance unit armed with real-time dynamic volumetric searchlights tracking fugitive movements across city blocks.
- **Tactical Roadblocks**: High-threat barricades deployed across primary traffic thoroughfares.

### 4. 5-Tier Raycast Ballistics Arsenal
1. **Pistol (Tactical 9mm)**: Semi-automatic sidearm with high mobility and rapid recovery.
2. **SMG (MAC-10)**: High-cyclic close-quarters submachine gun with spray dispersion.
3. **Assault Rifle (M4A1)**: Balanced medium-to-long range combat carbine with muzzle compensator.
4. **Shotgun (Pump-Action 12G)**: Multi-pellet cone projection delivering high stopping power.
5. **Sniper Rifle (.50 BMG)**: Precision long-range rifle with extreme penetration and flat trajectory.
- **Ballistics Engine**: Raycast hit registration, physical projectile tracers, dynamic particle spark/blood impacts, and camera recoil impulses.

### 5. 8-Mission Storyline Campaign
- **Mission 1: The Arrival**: Escape initial surveillance and reach the Coral Coast safehouse.
- **Mission 2: Shakedown**: Collect protection tribute from local neon strip establishments.
- **Mission 3: High Seas Contraband**: Intercept syndicate maritime cache drop at Ocean Docks.
- **Mission 4: Midnight Grand Prix**: Win an illegal pink-slip street sprint through the financial district.
- **Mission 5: Heist Preparation**: Secure security bypass transponders from CPD impound.
- **Mission 6: Vault Breaker**: Infiltrate the Solis First Reserve and extract marked bonds.
- **Mission 7: Ambush on Ocean Drive**: Repel rival cartel hitmen in a rolling vehicular gunfight.
- **Mission 8: Apex Predator**: Eliminate the rogue syndicate kingpin and evade maximum 5-star CONDOR-1 pursuit.

### 6. Canvas Minimap & Tactical HUD
- **Real-Time Vector Radar**: Top-down rotated minimap displaying player orientation, objectives, enemy blips, and CPD patrol units.
- **Dynamic GPS Routing**: Real-time path tracing to active mission checkpoints and safehouse dropoffs.
- **Combat Telemetry**: Health gauge, armor integrity, active weapon ammunition counter, speedometer dial, and flashing Wanted star status.

---

## 🎮 Controls & Gameplay Guide

| Action | Keybinding |
| :--- | :--- |
| **Movement / Steer** | `W` / `A` / `S` / `D` or Arrow Keys |
| **Sprint (On Foot)** | `Left Shift` |
| **Jump** | `Spacebar` |
| **Enter / Exit Vehicle** | `F` |
| **Handbrake (Vehicle)** | `Spacebar` |
| **Aim / Camera Orbit** | Mouse Motion (Pointer Lock) |
| **Fire Weapon** | `Left Mouse Button` |
| **Reload** | `R` |
| **Weapon Select** | Keys `1` through `5` or Mouse Wheel |
| **Pause / Menu** | `Escape` |

---

## 🏗️ Technical Architecture

- **Rendering Pipeline**: WebGL / Three.js utilizing optimized instanced meshes for buildings, vegetation, and urban infrastructure.
- **Audio Subsystem**: Web Audio API procedural synthesis for engine rumbles, tire screeches, gunshots, and siren pitch modulation.
- **State Management**: Zero-overhead decoupled event-driven dispatch for combat, mission state machines, and AI behavior trees.
- **TypeScript Core**: Strict type safety across game loops, matrix math calculations, and collision hulls.

---

## 🛠️ Build & Verification

```bash
# Install dependencies
npm install

# Run local development server
npm run dev

# Compile production bundle
npm run build
```

---

*Verified build submission for make.fun bounty gta6-01.*
