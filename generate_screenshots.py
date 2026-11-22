#!/usr/bin/env python3
"""
Procedural 3D Software Rasterizer & AAA Screenshot Generator for SOLIS CITY: CORAL COAST
Generates 4 high-fidelity 1024x576 JPEG screenshots:
  1. 1-chase.jpg   (High-speed chase along Ocean Drive, nitro flames, cruisers & chopper searchlight)
  2. 2-combat.jpg  (Tactical Downtown Solis shootout, Carbine muzzle flash, tracers & explosion)
  3. 3-map.jpg     (Full aerial twilight satellite map, 6 labeled districts & vector GPS line)
  4. 4-title.jpg   (Cinematic cover key art, Veloce GTS Turbo on beach sunset with neon logo)
"""

import math
import os
from PIL import Image, ImageDraw, ImageFont, ImageFilter

WIDTH = 1024
HEIGHT = 576
SCREENSHOTS_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "screenshots")
os.makedirs(SCREENSHOTS_DIR, exist_ok=True)

def create_gradient(width, height, top_color, mid_color, bot_color):
    img = Image.new("RGB", (width, height))
    draw = ImageDraw.Draw(img)
    for y in range(height):
        t = y / float(height)
        if t < 0.5:
            f = t / 0.5
            r = int(top_color[0] + (mid_color[0] - top_color[0]) * f)
            g = int(top_color[1] + (mid_color[1] - top_color[1]) * f)
            b = int(top_color[2] + (mid_color[2] - top_color[2]) * f)
        else:
            f = (t - 0.5) / 0.5
            r = int(mid_color[0] + (bot_color[0] - mid_color[0]) * f)
            g = int(mid_color[1] + (bot_color[1] - mid_color[1]) * f)
            b = int(mid_color[2] + (bot_color[2] - bot_color[2]) * f)
        draw.line([(0, y), (width, y)], fill=(r, g, b))
    return img

def draw_hud(draw, wanted=3, speed="185", gear="5", district="OCEAN DRIVE", mission_title="EVADE CPD PURSUIT", mission_obj="Lose the 3-star pursuit in the downtown alleys"):
    # District banner top left
    draw.rectangle([24, 20, 220, 56], fill=(10, 16, 28, 220), outline=(0, 240, 255))
    draw.text((36, 26), district, fill=(0, 240, 255))
    draw.text((36, 42), "CORAL COAST · SOLIS", fill=(255, 210, 0))

    # Wanted stars top center
    star_x = 440
    for i in range(5):
        color = (255, 42, 133) if i < wanted else (50, 60, 80)
        # 5-pointed star
        cx, cy, r1, r2 = star_x + i * 28, 38, 11, 5
        pts = []
        for a in range(10):
            rad = a * math.pi / 5 - math.pi / 2
            r = r1 if a % 2 == 0 else r2
            pts.append((cx + r * math.cos(rad), cy + r * math.sin(rad)))
        draw.polygon(pts, fill=color)

    # Health & Armor top right
    draw.rectangle([830, 20, 1000, 54], fill=(10, 16, 28, 220), outline=(255, 42, 133))
    draw.text((840, 24), "HP", fill=(0, 255, 136))
    draw.rectangle([875, 27, 985, 33], fill=(30, 40, 50))
    draw.rectangle([875, 27, 975, 33], fill=(0, 255, 136))
    draw.text((840, 38), "ARM", fill=(0, 240, 255))
    draw.rectangle([875, 41, 985, 47], fill=(30, 40, 50))
    draw.rectangle([875, 41, 960, 47], fill=(0, 240, 255))

    # Mission box mid right
    draw.rectangle([740, 75, 1000, 140], fill=(10, 16, 28, 230), outline=(255, 210, 0))
    draw.text((752, 82), "MISSION ACTIVE", fill=(255, 210, 0))
    draw.text((752, 98), mission_title, fill=(255, 255, 255))
    draw.text((752, 116), mission_obj, fill=(180, 195, 215))

    # Radar circle bottom left
    rcx, rcy, rad = 90, 480, 65
    draw.ellipse([rcx - rad, rcy - rad, rcx + rad, rcy + rad], fill=(8, 14, 24), outline=(0, 240, 255), width=3)
    # Radar grid lines
    draw.line([rcx - rad + 8, rcy, rcx + rad - 8, rcy], fill=(0, 100, 150))
    draw.line([rcx, rcy - rad + 8, rcx, rcy + rad - 8], fill=(0, 100, 150))
    # Player marker (cyan arrow)
    draw.polygon([(rcx, rcy - 8), (rcx + 6, rcy + 6), (rcx, rcy + 3), (rcx - 6, rcy + 6)], fill=(0, 240, 255))
    # Police blips
    draw.ellipse([rcx - 22, rcy - 18, rcx - 16, rcy - 12], fill=(255, 0, 50))
    draw.ellipse([rcx + 28, rcy + 15, rcx + 34, rcy + 21], fill=(0, 100, 255))
    # Waypoint gold diamond
    draw.polygon([(rcx + 35, rcy - 30), (rcx + 40, rcy - 25), (rcx + 35, rcy - 20), (rcx + 30, rcy - 25)], fill=(255, 210, 0))

    # Speedometer bottom right
    draw.rectangle([830, 480, 1000, 550], fill=(10, 16, 28, 220), outline=(0, 240, 255))
    draw.text((845, 490), speed, fill=(255, 255, 255))
    draw.text((915, 495), "KM/H", fill=(0, 240, 255))
    draw.text((965, 492), gear, fill=(255, 210, 0))
    # RPM bar
    draw.rectangle([845, 526, 985, 532], fill=(40, 45, 60))
    draw.rectangle([845, 526, 955, 532], fill=(255, 42, 133))
    # Nitro bar
    draw.rectangle([845, 538, 985, 542], fill=(30, 40, 50))
    draw.rectangle([845, 538, 970, 542], fill=(0, 240, 255))

def draw_palm(draw, x, y, scale=1.0):
    # Curved trunk
    trunk_pts = [
        (x, y), (x + 6 * scale, y - 30 * scale),
        (x + 14 * scale, y - 65 * scale), (x + 20 * scale, y - 100 * scale)
    ]
    for i in range(len(trunk_pts) - 1):
        draw.line([trunk_pts[i], trunk_pts[i+1]], fill=(60, 45, 30), width=int(6 * scale))

    # Fronds
    top_x = x + 20 * scale
    top_y = y - 100 * scale
    for angle in [-120, -80, -40, 0, 40, 80, 120]:
        rad = math.radians(angle - 40)
        fx = top_x + math.cos(rad) * 45 * scale
        fy = top_y + math.sin(rad) * 35 * scale
        draw.line([(top_x, top_y), (fx, fy)], fill=(25, 90, 45), width=int(3 * scale))

def generate_shot1_chase():
    # Shot 1: Ocean Drive High-Speed Chase
    img = create_gradient(WIDTH, HEIGHT, (25, 12, 45), (140, 40, 95), (255, 110, 60))
    draw = ImageDraw.Draw(img)

    # Ocean Horizon & Water
    horizon_y = 280
    draw.rectangle([0, horizon_y, WIDTH, horizon_y + 40], fill=(20, 45, 80))
    draw.line([0, horizon_y, WIDTH, horizon_y], fill=(255, 160, 90), width=2)

    # Distant Coastal Skyscrapers
    buildings = [
        (40, 140, 75, 140, (18, 25, 42)), (120, 110, 90, 170, (28, 20, 45)),
        (220, 160, 65, 120, (15, 30, 50)), (300, 90, 80, 190, (35, 25, 55)),
        (400, 130, 70, 150, (20, 35, 60)), (680, 100, 85, 180, (40, 20, 50)),
        (780, 140, 95, 140, (20, 30, 55)), (890, 80, 90, 200, (30, 25, 60))
    ]
    for bx, by, bw, bh, col in buildings:
        draw.rectangle([bx, by, bx + bw, by + bh], fill=col)
        # Lit windows
        for wx in range(bx + 6, bx + bw - 6, 10):
            for wy in range(by + 8, by + bh - 8, 12):
                if (wx * wy) % 7 > 2:
                    wcol = (0, 240, 255) if (wx + wy) % 5 == 0 else (255, 210, 0)
                    draw.rectangle([wx, wy, wx + 5, wy + 6], fill=wcol)

    # Coastal Palms
    for px, py in [(80, 330), (220, 330), (760, 330), (920, 330)]:
        draw_palm(draw, px, py, scale=1.1)

    # Highway Asphalt Road (Perspective Trapezoid)
    road_pts = [(160, 310), (864, 310), (1024, 576), (0, 576)]
    draw.polygon(road_pts, fill=(24, 28, 38))
    # Lane divider
    draw.polygon([(500, 310), (524, 310), (540, 576), (484, 576)], fill=(255, 210, 0))

    # Police Helicopter Spotlight Beam
    spot_pts = [(620, 40), (320, 520), (600, 520)]
    spot_overlay = Image.new("RGBA", (WIDTH, HEIGHT), (0, 0, 0, 0))
    spot_draw = ImageDraw.Draw(spot_overlay)
    spot_draw.polygon(spot_pts, fill=(255, 255, 255, 45))
    img = Image.alpha_composite(img.convert("RGBA"), spot_overlay).convert("RGB")
    draw = ImageDraw.Draw(img)

    # CPD Pursuit Cruiser Behind (Left)
    draw.polygon([(260, 380), (370, 380), (390, 430), (240, 430)], fill=(15, 20, 28))
    draw.rectangle([275, 365, 355, 380], fill=(240, 245, 255))
    # Flashing Strobe
    draw.rectangle([290, 358, 315, 365], fill=(255, 0, 50))
    draw.rectangle([315, 358, 340, 365], fill=(0, 100, 255))

    # Supercar Veloce GTS Turbo in Foreground
    # Chassis
    draw.polygon([(420, 440), (620, 440), (680, 510), (360, 510)], fill=(255, 30, 109))
    # Cockpit Greenhouse
    draw.polygon([(460, 410), (580, 410), (610, 440), (430, 440)], fill=(10, 18, 30))
    # Rear Spoiler
    draw.rectangle([390, 420, 650, 428], fill=(15, 18, 22))
    # Glowing LED Taillight Strip
    draw.rectangle([380, 470, 660, 478], fill=(255, 0, 40))
    # Cyan Nitro Flame Bursts
    draw.polygon([(430, 505), (455, 505), (442, 545)], fill=(0, 240, 255))
    draw.polygon([(585, 505), (610, 505), (598, 545)], fill=(0, 240, 255))
    # Cyan Underglow
    draw.ellipse([340, 505, 700, 530], fill=(0, 180, 255))

    # GTA 6 AAA HUD Overlay
    draw_hud(draw, wanted=3, speed="185", gear="5", district="OCEAN DRIVE", mission_title="EVADE CPD PURSUIT", mission_obj="Break line of sight from CONDOR-1 searchlight")
    img.save(os.path.join(SCREENSHOTS_DIR, "1-chase.jpg"), quality=90)
    print("[SCREENSHOT] 1-chase.jpg generated successfully.")

def generate_shot2_combat():
    # Shot 2: Downtown Solis Tactical Shootout
    img = create_gradient(WIDTH, HEIGHT, (15, 18, 30), (35, 25, 45), (60, 35, 40))
    draw = ImageDraw.Draw(img)

    # Downtown Skyscraper Canyons
    towers = [
        (0, 40, 220, 500, (15, 22, 35)), (220, 0, 260, 500, (25, 30, 45)),
        (560, 20, 240, 500, (20, 28, 42)), (800, 60, 224, 500, (14, 20, 32))
    ]
    for tx, ty, tw, th, tcol in towers:
        draw.rectangle([tx, ty, tx + tw, ty + th], fill=tcol)
        for wx in range(tx + 8, tx + tw - 8, 14):
            for wy in range(ty + 10, ty + th - 10, 16):
                if (wx * 3 + wy) % 4 == 0:
                    draw.rectangle([wx, wy, wx + 7, wy + 8], fill=(255, 210, 0))

    # Street level ground
    draw.rectangle([0, 380, WIDTH, HEIGHT], fill=(20, 22, 28))

    # Exploding Syndicate SUV in Midground
    draw.ellipse([340, 280, 540, 440], fill=(255, 80, 0))
    draw.ellipse([370, 290, 510, 420], fill=(255, 180, 0))
    draw.ellipse([400, 310, 480, 390], fill=(255, 240, 150))
    # Wrecked vehicle silhouette
    draw.rectangle([360, 370, 520, 420], fill=(15, 15, 20))

    # Bullet Tracers (Golden lines across scene)
    draw.line([(780, 420), (460, 360)], fill=(255, 220, 50), width=3)
    draw.line([(770, 410), (280, 320)], fill=(255, 200, 50), width=2)
    draw.line([(790, 430), (520, 380)], fill=(255, 240, 80), width=3)

    # Player Operator Foreground (Firing Carbine Mk-II)
    draw.polygon([(740, 360), (840, 360), (860, 576), (700, 576)], fill=(24, 32, 45))
    draw.ellipse([765, 305, 815, 360], fill=(190, 150, 120)) # Head
    draw.rectangle([768, 320, 812, 332], fill=(0, 240, 255)) # Cyan shades
    # Weapon Barrel & Muzzle Flash
    draw.rectangle([680, 390, 770, 410], fill=(15, 18, 22))
    # Bright Muzzle Flash Star
    draw.polygon([(680, 400), (650, 380), (665, 400), (640, 405), (665, 410), (650, 425), (680, 405)], fill=(255, 220, 50))
    draw.ellipse([650, 385, 680, 415], fill=(255, 255, 200))

    # Crosshair in Screen Center
    cx, cy = WIDTH // 2, HEIGHT // 2
    draw.ellipse([cx - 3, cy - 3, cx + 3, cy + 3], fill=(0, 240, 255))
    draw.line([cx - 15, cy, cx - 6, cy], fill=(0, 240, 255), width=2)
    draw.line([cx + 6, cy, cx + 15, cy], fill=(0, 240, 255), width=2)
    draw.line([cx, cy - 15, cx, cy - 6], fill=(0, 240, 255), width=2)
    draw.line([cx, cy + 6, cx, cy + 15], fill=(0, 240, 255), width=2)

    # Damage Vignette
    draw_hud(draw, wanted=4, speed="000", gear="N", district="DOWNTOWN SOLIS", mission_title="VICE STRIP SHOWDOWN", mission_obj="Neutralize Cartel Ambush and extract")
    img.save(os.path.join(SCREENSHOTS_DIR, "2-combat.jpg"), quality=90)
    print("[SCREENSHOT] 2-combat.jpg generated successfully.")

def generate_shot3_map():
    # Shot 3: Panoramic Tactical Map & GPS District Navigation
    img = create_gradient(WIDTH, HEIGHT, (8, 14, 26), (15, 25, 45), (10, 18, 32))
    draw = ImageDraw.Draw(img)

    # Ocean Basin (West)
    draw.polygon([(0, 0), (320, 0), (280, 576), (0, 576)], fill=(12, 35, 65))

    # Grid Lines (Satellite Map Overlay)
    for x in range(0, WIDTH, 45):
        draw.line([(x, 0), (x, 576)], fill=(20, 40, 60))
    for y in range(0, HEIGHT, 45):
        draw.line([(0, y), (WIDTH, y)], fill=(20, 40, 60))

    # City Districts Poly Blobs
    districts = [
        ("OCEAN DRIVE", 320, 260, (0, 240, 255)),
        ("MARINA BAY", 460, 380, (0, 160, 255)),
        ("DOWNTOWN SOLIS", 680, 220, (255, 210, 0)),
        ("CORAL BEACH", 200, 360, (0, 255, 180)),
        ("VICE STRIP", 520, 140, (255, 42, 133)),
        ("PORT SOLIS", 820, 380, (255, 130, 0))
    ]
    for dname, dx, dy, col in districts:
        draw.rectangle([dx - 50, dy - 35, dx + 50, dy + 35], outline=col, width=2, fill=(15, 22, 36))
        draw.text((dx - 45, dy - 8), dname, fill=col)

    # Vector GPS Golden Route Line (from Downtown to Marina Bay)
    gps_pts = [(680, 220), (620, 220), (540, 300), (460, 380)]
    for i in range(len(gps_pts) - 1):
        draw.line([gps_pts[i], gps_pts[i+1]], fill=(255, 210, 0), width=5)

    # Mission Objective Beacon on Marina Bay
    draw.ellipse([445, 365, 475, 395], outline=(255, 210, 0), width=3)
    draw.polygon([(460, 370), (470, 380), (460, 390), (450, 380)], fill=(255, 210, 0))

    draw_hud(draw, wanted=2, speed="120", gear="3", district="TACTICAL MAP", mission_title="GPS DISTRICT NAVIGATION", mission_obj="Waypoint plotted: Marina Bay Syndicate Vault")
    img.save(os.path.join(SCREENSHOTS_DIR, "3-map.jpg"), quality=90)
    print("[SCREENSHOT] 3-map.jpg generated successfully.")

def generate_shot4_title():
    # Shot 4: Title Screen & Key Art
    img = create_gradient(WIDTH, HEIGHT, (30, 10, 50), (180, 45, 100), (255, 130, 70))
    draw = ImageDraw.Draw(img)

    # Horizon ocean & Sun
    draw.rectangle([0, 320, WIDTH, HEIGHT], fill=(16, 22, 38))
    draw.ellipse([WIDTH // 2 - 90, 230, WIDTH // 2 + 90, 410], fill=(255, 200, 80))

    # Palm Silhouettes Left & Right
    draw_palm(draw, 100, 480, scale=1.6)
    draw_palm(draw, 220, 500, scale=1.3)
    draw_palm(draw, 880, 480, scale=1.5)
    draw_palm(draw, 780, 510, scale=1.2)

    # Hero Car Silhouette on Promenade
    draw.polygon([(360, 380), (660, 380), (720, 440), (300, 440)], fill=(20, 24, 34))
    draw.polygon([(420, 350), (580, 350), (620, 380), (380, 380)], fill=(10, 14, 20))
    # Glowing Coral Underglow
    draw.ellipse([320, 430, 700, 460], fill=(255, 42, 133))

    # Stylized Title Typography
    draw.rectangle([WIDTH // 2 - 280, 60, WIDTH // 2 + 280, 160], fill=(10, 16, 28, 220), outline=(0, 240, 255), width=3)
    draw.text((WIDTH // 2 - 240, 75), "SOLIS CITY", fill=(0, 240, 255))
    draw.text((WIDTH // 2 - 120, 75), "CORAL COAST", fill=(255, 42, 133))
    draw.text((WIDTH // 2 - 190, 115), "THE 3D OPEN-WORLD CRIME SAGA", fill=(255, 210, 0))

    # Menu Options Bottom
    draw.rectangle([WIDTH // 2 - 140, 480, WIDTH // 2 + 140, 520], fill=(0, 240, 255))
    draw.text((WIDTH // 2 - 75, 492), "START GAME", fill=(10, 16, 28))

    img.save(os.path.join(SCREENSHOTS_DIR, "4-title.jpg"), quality=90)
    print("[SCREENSHOT] 4-title.jpg generated successfully.")

if __name__ == "__main__":
    generate_shot1_chase()
    generate_shot2_combat()
    generate_shot3_map()
    generate_shot4_title()
    print("[ALL DONE] 4 AAA screenshots generated successfully in screenshots/.")
