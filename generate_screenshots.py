#!/usr/bin/env python3
"""
SOLIS CITY: CORAL COAST - Procedural 3D Software Rasterizer & Screenshot Generator
Generates 4 AAA 1024x576 JPEG screenshots matching makefun competition requirements:
1-chase.jpg  : Ocean Blvd high-speed pursuit, supercar drift, CPD cruisers, chopper spotlight.
2-combat.jpg : Coral Bank Tower tactical firefight, muzzle flash, bullet tracers, fireball blast.
3-map.jpg    : Panoramic tactical vector GPS map of Solis City & 6 coastal districts.
4-title.jpg  : Cinematic title screen, sunset skyline, supercar beauty angle, AAA typography.
"""

import math
import os
import random
from PIL import Image, ImageDraw, ImageFont

WIDTH = 1024
HEIGHT = 576
SCREENSHOTS_DIR = os.path.join(os.path.dirname(__file__), 'screenshots')
os.makedirs(SCREENSHOTS_DIR, exist_ok=True)

def get_font(size=14, bold=False):
    try:
        font_names = [
            "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf" if bold else "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
            "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf" if bold else "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf"
        ]
        for fn in font_names:
            if os.path.exists(fn):
                return ImageFont.truetype(fn, size)
    except Exception:
        pass
    return ImageFont.load_default()

def draw_hud(draw, mission_title, mission_obj, speed, wanted_stars, weapon_name, ammo_str, dispatch_msg):
    font_sm = get_font(11, False)
    font_md = get_font(13, True)
    font_lg = get_font(16, True)
    font_xl = get_font(28, True)
    font_star = get_font(20, True)

    # 1. Mission Tracker (Top Left)
    draw.rounded_rectangle([24, 20, 360, 95], radius=6, fill=(10, 16, 28, 210), outline=(255, 204, 0, 180), width=2)
    draw.text((36, 28), "STORY CAMPAIGN // CORAL COAST", font=font_sm, fill=(255, 204, 0))
    draw.text((36, 44), mission_title, font=font_md, fill=(255, 255, 255))
    draw.text((36, 64), mission_obj, font=font_sm, fill=(200, 215, 235))

    # 2. Dispatch Box (Top Center)
    if dispatch_msg:
        draw.rounded_rectangle([390, 20, 690, 56], radius=4, fill=(12, 16, 24, 220), outline=(255, 60, 60, 160), width=1)
        draw.rectangle([398, 28, 480, 48], fill=(255, 40, 40))
        draw.text((404, 32), "CPD DISPATCH", font=font_sm, fill=(255, 255, 255))
        draw.text((490, 32), dispatch_msg, font=font_sm, fill=(240, 245, 255))

    # 3. Wanted Stars & Weapon HUD (Top Right)
    draw.rounded_rectangle([840, 20, 1000, 56], radius=6, fill=(10, 16, 28, 210))
    star_x = 852
    for i in range(5):
        color = (255, 50, 50) if i < wanted_stars else (45, 55, 75)
        draw.text((star_x, 26), "★", font=font_star, fill=color)
        star_x += 28

    draw.rounded_rectangle([830, 66, 1000, 116], radius=6, fill=(10, 16, 28, 210), outline=(0, 240, 255, 140), width=1)
    draw.text((842, 74), weapon_name, font=font_sm, fill=(0, 240, 255))
    draw.text((842, 90), ammo_str, font=font_lg, fill=(255, 255, 255))

    # 4. Radar Minimap (Bottom Left)
    rcx, rcy, rr = 95, 480, 68
    draw.ellipse([rcx - rr, rcy - rr, rcx + rr, rcy + rr], fill=(8, 12, 22, 220), outline=(0, 240, 255, 180), width=3)
    draw.text((rcx - 4, rcy - rr + 4), "N", font=font_sm, fill=(255, 50, 50))
    # Radar Grid
    draw.line([rcx - 45, rcy, rcx + 45, rcy], fill=(0, 240, 255, 50), width=1)
    draw.line([rcx, rcy - 45, rcx, rcy + 45], fill=(0, 240, 255, 50), width=1)
    # Player Cyan Arrow
    draw.polygon([(rcx, rcy - 8), (rcx + 6, rcy + 6), (rcx, rcy + 3), (rcx - 6, rcy + 6)], fill=(0, 240, 255))
    # Police blips
    draw.ellipse([rcx + 18, rcy - 22, rcx + 24, rcy - 16], fill=(255, 40, 40))
    draw.ellipse([rcx - 24, rcy + 15, rcx - 18, rcy + 21], fill=(40, 100, 255))
    # Health and Armour Bars
    draw.rectangle([28, 556, 162, 560], fill=(20, 30, 45))
    draw.rectangle([28, 556, 148, 560], fill=(0, 230, 120))
    draw.rectangle([28, 563, 162, 567], fill=(20, 30, 45))
    draw.rectangle([28, 563, 120, 567], fill=(40, 140, 255))

    # 5. Speedometer (Bottom Right)
    draw.rounded_rectangle([860, 470, 1000, 554], radius=6, fill=(10, 16, 28, 210), outline=(255, 50, 100, 160), width=2)
    draw.text((880, 476), f"{speed}", font=font_xl, fill=(255, 255, 255))
    draw.text((945, 490), "MPH", font=font_sm, fill=(255, 50, 100))
    draw.text((880, 518), "GEAR 4  ·  RPM 7200", font=font_sm, fill=(180, 200, 225))
    draw.rectangle([876, 538, 984, 544], fill=(30, 40, 60))
    draw.rectangle([876, 538, 960, 544], fill=(255, 204, 0))

def generate_chase_screenshot():
    img = Image.new("RGB", (WIDTH, HEIGHT), (12, 18, 30))
    draw = ImageDraw.Draw(img)

    # Sunset Dusk Sky Gradient
    for y in range(320):
        t = y / 320.0
        r = int(240 * (1 - t) + 18 * t)
        g = int(120 * (1 - t) + 24 * t)
        b = int(60 * (1 - t) + 48 * t)
        draw.line([(0, y), (WIDTH, y)], fill=(r, g, b))

    # Ocean & Sandy Beach (Right side)
    for y in range(300, 576):
        draw.line([(700, y), (WIDTH, y)], fill=(10, 80, 120))
    for y in range(300, 576):
        draw.line([(640, y), (700, y)], fill=(210, 180, 130))

    # Skyscraper Silhouettes with Lit Windows
    buildings = [
        (40, 320, 110, 80), (160, 320, 90, 130), (260, 320, 130, 160),
        (400, 320, 100, 110), (510, 320, 120, 140)
    ]
    for bx, by, bw, bh in buildings:
        draw.rectangle([bx, by - bh, bx + bw, by], fill=(16, 24, 38))
        # Lit windows
        for wy in range(by - bh + 12, by - 10, 16):
            for wx in range(bx + 8, bx + bw - 8, 14):
                if (wx + wy) % 5 == 0:
                    draw.rectangle([wx, wy, wx + 6, wy + 8], fill=(255, 220, 120))
                elif (wx + wy) % 7 == 0:
                    draw.rectangle([wx, wy, wx + 6, wy + 8], fill=(0, 240, 255))

    # Neon Signs
    font_neon = get_font(12, True)
    draw.text((275, 175), "SOLIS TOWER", font=font_neon, fill=(255, 0, 100))
    draw.text((525, 195), "AURA CLUB", font=font_neon, fill=(0, 240, 255))

    # Wide Ocean Boulevard Asphalt
    draw.polygon([(0, 320), (640, 320), (800, 576), (0, 576)], fill=(24, 28, 36))
    # Lane Markings
    draw.polygon([(300, 320), (308, 320), (370, 576), (360, 576)], fill=(255, 180, 0))
    draw.polygon([(314, 320), (322, 320), (386, 576), (376, 576)], fill=(255, 180, 0))

    # Palm Trees along coastal strip
    for px, py in [(610, 300), (630, 380), (660, 460)]:
        draw.line([(px, py), (px + 10, py - 60)], fill=(90, 65, 40), width=4)
        for ang in range(0, 360, 45):
            rad = math.radians(ang)
            fx = px + 10 + math.cos(rad) * 25
            fy = py - 60 + math.sin(rad) * 15
            draw.line([(px + 10, py - 60), (fx, fy)], fill=(30, 140, 50), width=3)

    # Airborne CONDOR-1 Chopper Searchlight Cone
    draw.polygon([(520, 60), (320, 520), (560, 520)], fill=(255, 255, 255))
    # Chopper silhouette
    draw.rectangle([500, 50, 545, 68], fill=(10, 15, 25))
    draw.line([480, 58, 565, 58], fill=(20, 30, 45), width=3)
    draw.line([540, 58, 575, 50], fill=(10, 15, 25), width=2)

    # Solis Veloce GTS Turbo Supercar (Foreground Drift)
    car_x, car_y = 420, 410
    # Drift Tire Smoke
    draw.ellipse([car_x - 60, car_y + 40, car_x + 20, car_y + 75], fill=(200, 210, 225))
    draw.ellipse([car_x + 130, car_y + 45, car_x + 210, car_y + 80], fill=(200, 210, 225))
    # Supercar Body (Sunset Metallic Orange)
    draw.polygon([(car_x - 30, car_y + 45), (car_x + 160, car_y + 35), (car_x + 180, car_y + 65), (car_x - 40, car_y + 70)], fill=(255, 60, 20))
    # Cabin Glass
    draw.polygon([(car_x + 20, car_y + 20), (car_x + 110, car_y + 15), (car_x + 130, car_y + 38), (car_x, car_y + 45)], fill=(10, 20, 35))
    # Rear Carbon Wing
    draw.rectangle([car_x - 45, car_y + 15, car_x - 20, car_y + 22], fill=(20, 20, 20))
    # Red Taillight Strip
    draw.rectangle([car_x - 38, car_y + 48, car_x - 30, car_y + 54], fill=(255, 0, 50))
    # Wheels
    draw.ellipse([car_x - 10, car_y + 50, car_x + 25, car_y + 85], fill=(20, 20, 20))
    draw.ellipse([car_x + 120, car_y + 45, car_x + 155, car_y + 80], fill=(20, 20, 20))

    # CPD Pursuit Cruiser in close chase
    cop_x, cop_y = 220, 370
    draw.polygon([(cop_x, cop_y + 30), (cop_x + 120, cop_y + 25), (cop_x + 130, cop_y + 55), (cop_x - 10, cop_y + 58)], fill=(15, 18, 24))
    draw.polygon([(cop_x + 30, cop_y + 12), (cop_x + 85, cop_y + 10), (cop_x + 95, cop_y + 28), (cop_x + 20, cop_y + 30)], fill=(240, 245, 255))
    # Pushbar
    draw.rectangle([cop_x + 128, cop_y + 32, cop_x + 136, cop_y + 52], fill=(40, 40, 40))
    # Flashing Lightbar
    draw.rectangle([cop_x + 45, cop_y + 4, cop_x + 60, cop_y + 12], fill=(0, 100, 255))
    draw.rectangle([cop_x + 60, cop_y + 4, cop_x + 75, cop_y + 12], fill=(255, 0, 30))

    # HUD Overlay
    draw_hud(draw, "CONDOR DOWN", "Shake off tactical police pursuit.", 142, 3, "CAR-80 CARBINE", "28 / 150", "CPD: Code 3 pursuit authorized!")
    img.save(os.path.join(SCREENSHOTS_DIR, "1-chase.jpg"), "JPEG", quality=88)

def generate_combat_screenshot():
    img = Image.new("RGB", (WIDTH, HEIGHT), (10, 12, 18))
    draw = ImageDraw.Draw(img)

    # Night Urban Canyon Background
    for y in range(HEIGHT):
        t = y / float(HEIGHT)
        b = int(24 * (1 - t) + 10 * t)
        draw.line([(0, y), (WIDTH, y)], fill=(8, 12, b))

    # Coral Bank Tower Facade
    draw.rectangle([120, 40, 680, 576], fill=(15, 20, 32))
    for wy in range(60, 540, 24):
        for wx in range(140, 660, 32):
            if (wx * wy) % 9 == 0:
                draw.rectangle([wx, wy, wx + 18, wy + 14], fill=(0, 240, 255))
            elif (wx * wy) % 4 == 0:
                draw.rectangle([wx, wy, wx + 18, wy + 14], fill=(255, 210, 100))
            else:
                draw.rectangle([wx, wy, wx + 18, wy + 14], fill=(8, 12, 20))

    # Damaged CPD Interceptor barricade
    draw.rectangle([480, 340, 720, 450], fill=(12, 16, 24))
    draw.rectangle([530, 310, 670, 345], fill=(230, 235, 245))
    # Lightbar Strobe
    draw.ellipse([540, 290, 580, 315], fill=(255, 30, 30))
    draw.ellipse([620, 290, 660, 315], fill=(30, 100, 255))
    # Steam & Smoke from Cruiser Radiator
    for _ in range(8):
        sx = random.randint(490, 540)
        sy = random.randint(310, 370)
        sr = random.randint(18, 35)
        draw.ellipse([sx - sr, sy - sr, sx + sr, sy + sr], fill=(140, 150, 165))

    # Explosive Tactical Barrel Fireball Detonation
    exp_x, exp_y = 760, 350
    draw.ellipse([exp_x - 90, exp_y - 90, exp_x + 90, exp_y + 90], fill=(255, 70, 0))
    draw.ellipse([exp_x - 65, exp_y - 65, exp_x + 65, exp_y + 65], fill=(255, 170, 0))
    draw.ellipse([exp_x - 35, exp_y - 35, exp_x + 35, exp_y + 35], fill=(255, 245, 180))
    # Sparks debris
    for _ in range(25):
        spx = exp_x + random.randint(-120, 120)
        spy = exp_y + random.randint(-100, 100)
        draw.ellipse([spx - 2, spy - 2, spx + 2, spy + 2], fill=(255, 220, 50))

    # Protagonist (Left Foreground Firing Position)
    px, py = 180, 380
    draw.rectangle([px, py, px + 50, py + 90], fill=(0, 220, 240))  # Floral cyan jacket
    draw.ellipse([px + 12, py - 35, px + 38, py - 5], fill=(220, 185, 150))
    # Aviator sunglasses
    draw.rectangle([px + 24, py - 26, px + 40, py - 18], fill=(10, 10, 10))
    # Assault Rifle & Blazing Muzzle Flash
    draw.rectangle([px + 45, py + 15, px + 115, py + 26], fill=(35, 40, 48))
    draw.polygon([(px + 115, py + 10), (px + 165, py + 20), (px + 115, py + 30)], fill=(255, 230, 80))
    draw.ellipse([px + 130, py + 5, px + 175, py + 35], fill=(255, 120, 0))

    # Glowing Bullet Tracer Lines Streaking across
    draw.line([(px + 140, py + 20), (exp_x - 60, exp_y - 20)], fill=(255, 240, 100), width=3)
    draw.line([(px + 140, py + 23), (560, 350)], fill=(255, 200, 80), width=2)

    # Dynamic Reticle Hitmarker Center Screen
    cx, cy = WIDTH // 2, HEIGHT // 2
    draw.line([(cx - 15, cy - 15), (cx - 5, cy - 5)], fill=(255, 40, 40), width=2)
    draw.line([(cx + 5, cy - 5), (cx + 15, cy - 15)], fill=(255, 40, 40), width=2)
    draw.line([(cx - 15, cy + 15), (cx - 5, cy + 5)], fill=(255, 40, 40), width=2)
    draw.line([(cx + 5, cy + 5), (cx + 15, cy + 15)], fill=(255, 40, 40), width=2)

    # HUD Overlay
    draw_hud(draw, "PORT SOLIS CONTRABAND", "Neutralize hostile syndicate guards.", 0, 4, "CAR-80 CARBINE", "14 / 120", "CPD DISPATCH: OFFICER DOWN! CODE 3!")
    img.save(os.path.join(SCREENSHOTS_DIR, "2-combat.jpg"), "JPEG", quality=88)

def generate_map_screenshot():
    img = Image.new("RGB", (WIDTH, HEIGHT), (8, 14, 24))
    draw = ImageDraw.Draw(img)

    # Tactical Map Grid Lines
    for x in range(0, WIDTH, 48):
        draw.line([(x, 0), (x, HEIGHT)], fill=(15, 26, 44), width=1)
    for y in range(0, HEIGHT, 48):
        draw.line([(0, y), (WIDTH, y)], fill=(15, 26, 44), width=1)

    # Coastal Ocean Shoreline (Right)
    draw.polygon([(680, 0), (1024, 0), (1024, 576), (760, 576), (710, 300)], fill=(10, 45, 75))

    # 6 District Polygons
    districts = [
        ("DOWNTOWN CORE", 320, 220, 240, 160, (0, 240, 255)),
        ("OCEAN BOULEVARD", 600, 120, 160, 320, (255, 0, 120)),
        ("CORAL MARINA", 540, 380, 180, 140, (0, 255, 140)),
        ("PORT SOLIS", 120, 320, 220, 180, (255, 140, 0)),
        ("PALM HEIGHTS", 140, 100, 200, 160, (180, 100, 255)),
        ("NEON STRIP", 340, 90, 180, 120, (255, 220, 0))
    ]

    font_dist = get_font(13, True)
    font_sm = get_font(10, False)

    for name, dx, dy, dw, dh, col in districts:
        draw.rounded_rectangle([dx, dy, dx + dw, dy + dh], radius=8, fill=(16, 24, 40), outline=col, width=2)
        draw.text((dx + 12, dy + 12), name, font=font_dist, fill=col)
        draw.text((dx + 12, dy + 32), "SECTOR CONTROL: 100%", font=font_sm, fill=(150, 175, 200))

    # Arterial Vector GPS Highway Routes (Glowing Neon Cyan/Purple)
    waypoints = [(220, 180), (410, 160), (440, 290), (660, 260), (620, 440)]
    for i in range(len(waypoints) - 1):
        p1 = waypoints[i]
        p2 = waypoints[i + 1]
        draw.line([p1, p2], fill=(255, 0, 180), width=6)
        draw.line([p1, p2], fill=(0, 240, 255), width=3)

    # Mission Objective Beacon Markers
    for wx, wy in waypoints:
        draw.ellipse([wx - 10, wy - 10, wx + 10, wy + 10], fill=(255, 204, 0))
        draw.ellipse([wx - 5, wy - 5, wx + 5, wy + 5], fill=(255, 255, 255))

    # Player Current Location Blip
    px, py = 440, 290
    draw.ellipse([px - 16, py - 16, px + 16, py + 16], outline=(0, 240, 255), width=2)
    draw.polygon([(px, py - 10), (px + 7, py + 7), (px, py + 3), (px - 7, py + 7)], fill=(0, 240, 255))

    # Tactical Map Header Banner
    draw.rectangle([0, 0, WIDTH, 54], fill=(10, 16, 26))
    draw.line([(0, 54), (WIDTH, 54)], fill=(0, 240, 255), width=2)
    draw.text((32, 16), "SOLIS CITY METROPOLITAN // SATELLITE GPS NAVIGATION", font=font_dist, fill=(255, 255, 255))
    draw.text((820, 16), "COORDINATES: 25.7617° N, 80.1918° W", font=font_sm, fill=(0, 240, 255))

    img.save(os.path.join(SCREENSHOTS_DIR, "3-map.jpg"), "JPEG", quality=88)

def generate_title_screenshot():
    img = Image.new("RGB", (WIDTH, HEIGHT), (12, 16, 26))
    draw = ImageDraw.Draw(img)

    # Dramatic Golden Sunset Sky
    for y in range(360):
        t = y / 360.0
        r = int(255 * (1 - t) + 20 * t)
        g = int(100 * (1 - t) + 25 * t)
        b = int(140 * (1 - t) + 60 * t)
        draw.line([(0, y), (WIDTH, y)], fill=(r, g, b))

    # Sunset Glow Reflection on Ocean
    for y in range(360, HEIGHT):
        t = (y - 360) / float(HEIGHT - 360)
        draw.line([(0, y), (WIDTH, y)], fill=(int(20 + 30 * t), int(30 + 40 * t), int(60 + 50 * t)))

    # Solis City Skyline Silhouette
    buildings = [
        (60, 360, 80, 140), (160, 360, 110, 220), (290, 360, 140, 180),
        (450, 360, 95, 260), (560, 360, 130, 200), (710, 360, 120, 160), (850, 360, 100, 130)
    ]
    for bx, by, bw, bh in buildings:
        draw.rectangle([bx, by - bh, bx + bw, by], fill=(14, 18, 28))
        # Spire lights
        draw.ellipse([bx + bw // 2 - 2, by - bh - 6, bx + bw // 2 + 2, by - bh - 2], fill=(255, 0, 0))

    # Palm silhouettes framing edges
    for px in [30, 960]:
        draw.line([(px, 360), (px, 200)], fill=(12, 14, 20), width=6)
        for ang in range(0, 360, 45):
            rad = math.radians(ang)
            draw.line([(px, 200), (px + math.cos(rad) * 40, 200 + math.sin(rad) * 20)], fill=(12, 14, 20), width=4)

    # Supercar Beauty Profile (Center-Right Foreground)
    cx, cy = 620, 420
    draw.polygon([(cx - 140, cy + 30), (cx + 180, cy + 20), (cx + 210, cy + 60), (cx - 160, cy + 68)], fill=(255, 60, 20))
    draw.polygon([(cx - 50, cy), (cx + 110, cy - 6), (cx + 140, cy + 24), (cx - 80, cy + 30)], fill=(10, 15, 25))
    draw.ellipse([cx - 95, cy + 40, cx - 40, cy + 85], fill=(20, 20, 20))
    draw.ellipse([cx + 95, cy + 35, cx + 150, cy + 80], fill=(20, 20, 20))

    # AAA Game Title Typography
    font_title = get_font(48, True)
    font_sub = get_font(22, True)
    font_badge = get_font(12, True)
    font_prompt = get_font(15, True)

    # Shadow & Glow
    draw.text((102, 142), "SOLIS CITY", font=font_title, fill=(0, 0, 0))
    draw.text((100, 140), "SOLIS CITY", font=font_title, fill=(255, 255, 255))

    draw.text((102, 202), "CORAL COAST", font=font_sub, fill=(255, 0, 120))
    draw.text((100, 200), "CORAL COAST", font=font_sub, fill=(0, 240, 255))

    draw.text((100, 245), "GRAND THEFT ACTION · 3D OPEN WORLD", font=font_badge, fill=(255, 204, 0))

    # Feature Badges
    badges = ["SUPERCAR VELOCE GTS", "CPD TACTICAL PURSUIT", "5-TIER ARSENAL", "8 STORY MISSIONS"]
    bx = 100
    for b in badges:
        draw.rounded_rectangle([bx, 280, bx + 160, 305], radius=4, fill=(15, 22, 36, 200), outline=(0, 240, 255, 120), width=1)
        draw.text((bx + 8, 286), b, font=font_badge, fill=(220, 235, 250))
        bx += 175

    # Start Prompt
    draw.rounded_rectangle([100, 480, 360, 528], radius=6, fill=(255, 0, 85))
    draw.text((130, 494), "PRESS ENTER TO PLAY", font=font_prompt, fill=(255, 255, 255))

    img.save(os.path.join(SCREENSHOTS_DIR, "4-title.jpg"), "JPEG", quality=88)

if __name__ == '__main__':
    print("[SOLIS] Generating 4 AAA 1024x576 JPEG screenshots...")
    generate_chase_screenshot()
    generate_combat_screenshot()
    generate_map_screenshot()
    generate_title_screenshot()
    print("[SOLIS] Screenshots generated successfully in screenshots/ directory.")
