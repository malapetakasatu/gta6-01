#!/usr/bin/env python3
"""
SOLIS CITY: CORAL COAST - 3D WebGL Headless Screenshot Generator
Captures 4 AAA 1280x720 JPEG screenshots using Headless Chrome with SwiftShader:
1-chase.jpg  : Ocean Blvd high-speed CPD pursuit, 4 wanted stars, supercar drift, roadblock & CONDOR-1 spotlight.
2-combat.jpg : Downtown Coral Bank Plaza tactical firefight, on-foot shootout, muzzle flash, glowing tracers & CPD alert.
3-street.jpg : Ocean Drive sunset cruise, palm promenade, luxury traffic, pedestrians & synthwave radio.
4-title.jpg  : Solis City skyline vista, twilight panorama of 44 skyscrapers, overlook supercar & AAA title presentation.
"""

import json
import os
import subprocess
import sys
import time
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
SHOTS_FILE = os.path.join(HERE, 'shots.json')
SCREENSHOTS_DIR = os.path.join(HERE, 'screenshots')
PORT = 8085

os.makedirs(SCREENSHOTS_DIR, exist_ok=True)

with open(SHOTS_FILE) as f:
    shots = json.load(f)

# Start local server on dev port
server = subprocess.Popen(
    ['node', 'serve.ts', '--port', str(PORT)],
    cwd=HERE,
    stdout=subprocess.PIPE,
    stderr=subprocess.PIPE
)
time.sleep(1.5)

print(f"[SOLIS] Capturing {len(shots)} 3D WebGL screenshots via Headless Chrome SwiftShader...")

try:
    for s in shots:
        name = s['name']
        query = s['query']
        out_path = os.path.join(SCREENSHOTS_DIR, name)
        chrome_cmd = [
            'google-chrome-stable',
            '--headless',
            '--no-sandbox',
            '--disable-gpu-sandbox',
            '--enable-unsafe-swiftshader',
            '--use-gl=angle',
            '--use-angle=swiftshader',
            '--window-size=1280,720',
            '--hide-scrollbars',
            '--virtual-time-budget=6000',
            f'--screenshot={out_path}',
            f'http://127.0.0.1:{PORT}/index.html{query}'
        ]
        res = subprocess.run(chrome_cmd, capture_output=True, text=True)
        if os.path.exists(out_path):
            size = os.path.getsize(out_path)
            img = Image.open(out_path)
            colors = len(img.getcolors(maxcolors=100000) or [])
            print(f"  [OK] {name}: {size} bytes ({size // 1024} KB), {colors} colors, dimensions {img.size}")
        else:
            print(f"  [ERROR] Failed to capture {name}! Stderr: {res.stderr[:200]}")
finally:
    server.terminate()

print("[SOLIS] All screenshots rendered successfully.")
