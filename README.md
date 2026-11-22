# SOLIS CITY: CORAL COAST

[![make.fun · gta6-01](https://make.fun/badge/gta6-01.svg)](https://make.fun/bounty/gta6-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-01)
[![rank](https://make.fun/badge/gta6-01/malapetakasatu/gta6-01/rank.svg)](https://make.fun/bounty/gta6-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-01)
[![reward](https://make.fun/badge/gta6-01/malapetakasatu/gta6-01/reward.svg)](https://make.fun/bounty/gta6-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-01)

An original, high-fidelity 3D open-world crime action game built with procedural city generation, realistic Three.js WebGL rendering, high-speed supercar physics, tactical CPD pursuit AI, raycast combat ballistics, an 8-mission narrative campaign, and a full AAA HUD overlay.

---

## Key Features

### 1. 3D Procedural Metropolis & Coral Coastline
- **44 Unique Skyscrapers & Towers:** Procedural architectural facades with illuminated window grids (cyan, warm gold, cool white), rooftop spires, and blinking red aviation beacons.
- **6 Integrated Districts:** Downtown Core, Coral Marina, Ocean Boulevard, Palm Heights, Industrial Beltway, and Port Solis.
- **Coastal Environments:** Sandy beaches, palm tree promenade, and dynamic ocean waters with specular sunset reflections.
- **Atmospheric Lighting:** Twilight golden-hour lighting with ACES Filmic tone mapping, PCF soft shadows, and streetlamps with dynamic point lights.

### 2. High-Speed Supercar Physics & Traffic
- **Veloce GTS Turbo:** Aerodynamic chassis in metallic sunset orange, carbon fiber front splitter & diffuser, high-downforce rear wing, xenon headlights, and continuous red neon taillight bar.
- **Dynamic Driving Dynamics:** Progressive acceleration, gear shifting, handbrake power drifting with tire smoke and skid marks, and speed-based FOV expansion (60° to 76°).
- **Living World Traffic:** Civilian luxury sedans and coupes navigating the arterial grid, plus pedestrians walking along coastal sidewalks.

### 3. Tactical CPD Police Pursuit AI
- **4-Star Escalation System:** Dynamic police dispatch alerts and escalating enforcement.
- **CPD Interceptor Cruisers:** Black-and-white pursuit livery, reinforced ramming push-bars, and flashing blue/red LED lightbars.
- **Tactical Roadblocks:** Cruisers deployed in V-formation to barricade key arterial boulevards.
- **Airborne CONDOR-1 Tactical Helicopter:** Overhead pursuit helicopter with rotating rotors and a volumetric searchlight beam tracking the suspect vehicle.

### 4. 5-Tier Combat Arsenal & Raycast Ballistics
- **Solis .45 Pistol:** Semi-automatic sidearm for close-quarters self-defense.
- **Coral-9 SMG:** High fire-rate compact submachine gun with rapid spray.
- **CAR-80 Carbine:** Military-grade assault rifle with high muzzle velocity and penetrating tracers.
- **Enforcer 12G Shotgun:** Devastating close-range pump-action scattershot.
- **Titan RPG Rocket Launcher:** Heavy explosive ordnance.
- **Ballistics FX:** Dynamic muzzle flash illumination, glowing projectile tracers, and reactive hitmarkers.

### 5. 8-Mission Story Campaign
1. **Coral Coast Awakening:** Mount the Veloce GTS Turbo and reach Downtown Core.
2. **Neon Syndicate Drop:** Intercept the contraband drop at Ocean Boulevard Pier.
3. **Skyline Heist Escape:** Break through CPD perimeter around Coral Bank Tower.
4. **Port Solis Contraband:** Infiltrate shipping depot and secure armored transport.
5. **Condor Down:** Evade airborne CONDOR-1 tactical helicopter searchlights.
6. **High Stakes Intercept:** Ram and neutralize rival courier coupe before safehouse.
7. **Roadblock Rampage:** Smash through 3 tactical CPD roadblocks to deliver intel.
8. **King of Solis:** Survive 4-star CPD onslaught and claim Apex Tower rooftop.

### 6. AAA HUD & Vector GPS Navigation
- **Rotating Radar Minimap:** Circular radar frame with compass heading, range rings, player blip, police blips, and vector GPS dashed route to active objectives.
- **Cockpit Telemetry:** Digital speedometer (MPH), active gear indicator, and gradient RPM tachometer bar.
- **Health & Armour Status:** Dual segmented status bars with screen-space hit vignette damage feedback.
- **CPD Radio Dispatch:** Animated top-center alert ticker for police dispatch radio traffic.

---

## Controls

| Action | Key / Input |
|---|---|
| **Accelerate / Move** | `W` or `↑` |
| **Brake / Reverse** | `S` or `↓` |
| **Steering / Aim** | `A` / `D` or `←` / `→` |
| **Handbrake Drift** | `SPACE` |
| **Enter / Exit Vehicle** | `E` |
| **Fire Weapon** | `Left Click` |
| **Select Arsenal (1-5)** | `1`, `2`, `3`, `4`, `5` |
| **Reload Weapon** | `R` |
| **Pause / Controls Menu** | `ESC` |

---

## Running Locally

Serve the game locally with Node.js standard library (no dependencies):

```bash
node serve.ts
```

Open `http://localhost:8080` in any modern WebGL-compatible browser.

To view specific cinematic screenshot staging passes:
- `http://localhost:8080/index.html?shot=chase`
- `http://localhost:8080/index.html?shot=combat`
- `http://localhost:8080/index.html?shot=street`
- `http://localhost:8080/index.html?shot=title`

---

## Building the make.fun Dossier

```bash
node main.ts
```

Validates output limits and bundles `game/` and `screenshots/` into `/output/dossier.json`.
