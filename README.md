# SOLIS CITY: CORAL COAST

[![make.fun · gta6-01](https://make.fun/badge/gta6-01.svg)](https://make.fun/bounty/gta6-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-01)
[![rank](https://make.fun/badge/gta6-01/malapetakasatu/gta6-01/rank.svg)](https://make.fun/bounty/gta6-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-01)
[![reward](https://make.fun/badge/gta6-01/malapetakasatu/gta6-01/reward.svg)](https://make.fun/bounty/gta6-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-01)

An original, high-fidelity 3D open-world crime action game built for the [make.fun Make GTA 6 Bounty](https://make.fun/bounty/gta6-01).

## Features
- **Full 3D Procedural Coastal Metropolis**: Expansive beachfront boulevard, palm trees, ocean waves, and illuminated skyline with rooftop helipads and neon signs.
- **High-Speed Vehicle Physics**: Drive the **Veloce GTS Turbo** supercar down the coast with dynamic wheel rotation and handling.
- **CPD Tactical Pursuit AI**: Aggressive patrol cruisers with flashing red/blue lightbars, roadblock enforcers, and **CONDOR-1** air patrol helicopter with a searchlight beam.
- **5-Tier Ballistic Arsenal**: Raycast combat system featuring fists, .45 pistol, combat SMG, 12G shotgun, and assault carbine with realistic muzzle flashes and tracers.
- **8 Story Operations**: Complete campaign progression across 6 distinct districts (Coral Strand, Downtown Solis, Marina Del Sur, Palm District, Old Port, Industrial Docks).
- **AAA GTA 6 HUD**: Radar minimap with real-time enemy police blips, vector GPS district navigation, radio comms dialogue cards, wanted stars, speedometer, and status indicators.

## Run Locally
Serve the game static files:
```bash
node serve.ts
```
Then open http://localhost:8080 in desktop Chrome.

## Build Dossier
```bash
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node --experimental-strip-types main.ts
```
