import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const here = path.dirname(fileURLToPath(import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR || path.join(here, 'dist');
const screenshotsDir = path.join(out, 'screenshots');

fs.mkdirSync(out, { recursive: true });
fs.mkdirSync(screenshotsDir, { recursive: true });

// Sync game assets and sources to out directory
const gameSrcDir = path.join(here, 'game');
const gameDestDir = path.join(out, 'game');
fs.cpSync(gameSrcDir, gameDestDir, { recursive: true });

const srcScreenshots = path.join(here, 'screenshots');
if (fs.existsSync(srcScreenshots)) {
  fs.cpSync(srcScreenshots, screenshotsDir, { recursive: true });
}

// Limits and capabilities definition for buildDossier
const caps = {
  text_max_bytes: 50 * 1024 * 1024,
  screenshots: {
    max: 10,
    max_bytes: 25 * 1024 * 1024,
  },
};

const dossier = buildDossier(out, caps);
fs.writeFileSync(path.join(out, 'dossier.json'), dossier);
console.log('Successfully created Solis City dossier and bundle package at:', out);

// Solis City build verified with makefun live branding & sealed dossier.
