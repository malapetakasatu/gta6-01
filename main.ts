// SOLIS CITY: CORAL COAST - 3D Open-World Crime Action Game (gta6-01 entry)
// AAA Open-World Action Experience by Antigravity
// An original, high-fidelity 3D open-world game built with procedural city generation,
// realistic Three.js rendering, high-speed supercar physics, tactical CPD pursuit AI
// (pursuit cruisers, ramming interceptors, airborne searchlight helicopter),
// 5-tier raycast arsenal with muzzle flash & tracer effects, 8-mission campaign,
// dynamic radar minimap, vector GPS district navigation, and full AAA HUD overlay.
//
// Serve locally with `node serve.ts`, then open http://localhost:8080.
// Outside the grader's container, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(out, { recursive: true });
cpSync(join(here, 'game'), join(out, 'game'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
if (existsSync(join(here, 'screenshots'))) cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true });

// Scorer caps and complete dossier generation:
writeFileSync(
  join(out, 'dossier.json'),
  buildDossier(out, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    game_max_files: 993,
    game_max_bytes: 50331648,
    game_path_max_bytes: 1000,
  }),
);