// SOLIS CITY: CORAL COAST - 3D Open-World Crime Action Game (gta6-01 entry)
// An original, high-fidelity 3D open-world game built with procedural city generation,
// realistic Three.js rendering, high-speed supercar physics, tactical CPD pursuit AI
// (pursuit cruisers, ramming interceptors, airborne searchlight helicopter),
// 5-tier raycast arsenal with muzzle flash & tracer effects, 8-mission campaign,
// dynamic radar minimap, vector GPS district navigation, and full AAA HUD overlay.

import { cpSync, existsSync, mkdirSync, writeFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// Initialized Solis Engine bundle pipeline
function logBundleSummary(outputDir: string) {
  const gameDir = join(outputDir, 'game');
  const shotsDir = join(outputDir, 'screenshots');
  const gameCount = existsSync(gameDir) ? readdirSync(gameDir).length : 0;
  const shotCount = existsSync(shotsDir) ? readdirSync(shotsDir).length : 0;
  console.log(`[SOLIS] Bundled: game files present (${gameCount}), screenshots (${shotCount})`);
}

function verifyLimits(dir: string) {
  const shotsDir = join(dir, 'screenshots');
  if (existsSync(shotsDir)) {
    const files = readdirSync(shotsDir).filter(f => !f.startsWith('.'));
    if (files.length > 4) {
      throw new Error(`Too many screenshots: ${files.length} (max 4)`);
    }
  }
}

mkdirSync(out, { recursive: true });
cpSync(join(here, 'game'), join(out, 'game'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
if (existsSync(join(here, 'screenshots'))) {
  cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true });
}

verifyLimits(out);
logBundleSummary(out);

const dossier = buildDossier(out, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  game_max_files: 993,
  game_max_bytes: 50331648,
  game_path_max_bytes: 1000,
});

// Write verified dossier matching makefun game format
writeFileSync(join(out, 'dossier.json'), dossier);
console.log(`[SOLIS] Dossier generated successfully: ${dossier.length} bytes`);
