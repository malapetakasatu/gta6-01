#!/usr/bin/env python3
"""
SOLIS CITY: CORAL COAST - AAA 3D Procedural Screenshot Generator
Renders 4 high-fidelity 1024x576 open-world screenshots:
1-chase.jpg  : High-speed Ocean Drive pursuit with CPD cruisers & CONDOR-1 helicopter
2-combat.jpg : Explosive downtown shootout with RPG fireball, muzzle flashes & tracers
3-map.jpg    : Panoramic skyline overview with neon landmarks & GPS route
4-title.jpg  : Hero showcase of the Veloce GTS Turbo supercar with Solis skyline
"""

import os
import math
import random
from PIL import Image, ImageDraw, ImageFont, ImageFilter

WIDTH = 1024
HEIGHT = 576
SCREENSHOTS_DIR = os.path.join(os.path.dirname(__file__), 'screenshots')
os.makedirs(SCREENSHOTS_DIR, exist_ok=True)

def get_font(size, bold=False):
    # Try system fonts, fallback to default
    font_names = [
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf" if bold else "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
        "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf" if bold else "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf",
        "/usr/share/fonts/truetype/freefont/FreeSansBold.ttf" if bold else "/usr/share/fonts/truetype/freefont/FreeSans.ttf"
    ]
    for fn in font_names:
        if os.path.exists(fn):
            try:
                return ImageFont.truetype(fn, size)
            except Exception:
                pass
    return ImageFont.load_default()

def draw_sky_gradient(draw, top_color, mid_color, bot_color, horizon_y):
    for y in range(horizon_y):
        t = y / horizon_y
        if t < 0.6:
            st = t / 0.6
            r = int(top_color[0] + (mid_color[0] - top_color[0]) * st)
            g = int(top_color[1] + (mid_color[1] - top_color[1]) * st)
            b = int(top_color[2] + (mid_color[2] - top_color[2]) * st)
        else:
            st = (t - 0.6) / 0.4
            r = int(mid_color[0] + (bot_color[0] - mid_color[0]) * st)
            g = int(mid_color[1] + (bot_color[1] - mid_color[1]) * st)
            b = int(mid_color[2] + (bot_color[2] - mid_color[2]) * st)
        draw.line([(0, y), (WIDTH, y)], fill=(r, g, b))

def draw_sun(img, draw, cx, cy, radius, color):
    # Radiant glow
    for r in range(radius * 4, radius, -4):
        alpha = int(255 * (1.0 - (r - radius) / (radius * 3)) * 0.25)
        overlay = Image.new("RGBA", (WIDTH, HEIGHT), (0, 0, 0, 0))
        odraw = ImageDraw.Draw(overlay)
        odraw.ellipse([cx - r, cy - r, cx + r, cy + r], fill=(color[0], color[1], color[2], alpha))
        img.paste(Image.alpha_composite(img.convert("RGBA"), overlay).convert("RGB"))
    draw.ellipse([cx - radius, cy - radius, cx + radius, cy + radius], fill=(255, 255, 240))

def draw_clouds(draw, horizon_y):
    random.seed(42)
    for _ in range(8):
        cx = random.randint(50, WIDTH - 50)
        cy = random.randint(int(horizon_y * 0.3), int(horizon_y * 0.85))
        rw = random.randint(80, 220)
        rh = random.randint(14, 30)
        draw.ellipse([cx - rw, cy - rh, cx + rw, cy + rh], fill=(240, 140, 160, 120))

def draw_perspective_road(draw, horizon_y, vp_x, road_w_bot, road_w_top, road_color=(28, 34, 48)):
    # Road polygon
    pts = [
        (vp_x - road_w_top // 2, horizon_y),
        (vp_x + road_w_top // 2, horizon_y),
        (vp_x + road_w_bot // 2, HEIGHT),
        (vp_x - road_w_bot // 2, HEIGHT)
    ]
    draw.polygon(pts, fill=road_color)

    # Side curbs
    draw.line([(vp_x - road_w_top // 2, horizon_y), (vp_x - road_w_bot // 2, HEIGHT)], fill=(120, 130, 145), width=3)
    draw.line([(vp_x + road_w_top // 2, horizon_y), (vp_x + road_w_bot // 2, HEIGHT)], fill=(120, 130, 145), width=3)

    # Double yellow center divider
    for offset in [-3, 3]:
        draw.line([
            (vp_x + offset, horizon_y),
            (vp_x + int(offset * (road_w_bot / max(1, road_w_top))), HEIGHT)
        ], fill=(241, 196, 15), width=2)

    # Dashed lane dividers
    num_dashes = 18
    for i in range(num_dashes):
        t1 = (i / num_dashes) ** 1.8
        t2 = ((i + 0.5) / num_dashes) ** 1.8
        y1 = int(horizon_y + (HEIGHT - horizon_y) * t1)
        y2 = int(horizon_y + (HEIGHT - horizon_y) * t2)

        w1 = road_w_top + (road_w_bot - road_w_top) * t1
        w2 = road_w_top + (road_w_bot - road_w_top) * t2

        # Left lane dash
        lx1 = int(vp_x - w1 * 0.25)
        lx2 = int(vp_x - w2 * 0.25)
        draw.line([(lx1, y1), (lx2, y2)], fill=(255, 255, 255), width=int(1 + t1 * 3))

        # Right lane dash
        rx1 = int(vp_x + w1 * 0.25)
        rx2 = int(vp_x + w2 * 0.25)
        draw.line([(rx1, y1), (rx2, y2)], fill=(255, 255, 255), width=int(1 + t1 * 3))

def draw_ocean(draw, horizon_y, coast_x_bot, coast_x_top):
    # Ocean polygon on left
    pts = [
        (0, horizon_y),
        (coast_x_top, horizon_y),
        (coast_x_bot, HEIGHT),
        (0, HEIGHT)
    ]
    draw.polygon(pts, fill=(8, 48, 88))

    # Water shimmer lines
    random.seed(101)
    for y in range(horizon_y, HEIGHT, 6):
        t = (y - horizon_y) / (HEIGHT - horizon_y)
        w_max = int(coast_x_top + (coast_x_bot - coast_x_top) * t)
        for _ in range(4):
            x1 = random.randint(0, max(10, w_max - 20))
            x2 = x1 + random.randint(15, 60)
            draw.line([(x1, y), (x2, y)], fill=(20, 110, 160), width=int(1 + t * 2))

    # Beach sand strip
    sand_w = 40
    sand_pts = [
        (coast_x_top, horizon_y),
        (coast_x_top + 18, horizon_y),
        (coast_x_bot + sand_w, HEIGHT),
        (coast_x_bot, HEIGHT)
    ]
    draw.polygon(sand_pts, fill=(210, 180, 140))

def draw_skyscraper(draw, x, base_y, width, height, lit_color=(255, 230, 150), is_front=True):
    # Skyscraper building body
    body_color = (20, 26, 40) if is_front else (14, 18, 30)
    top_y = base_y - height
    draw.rectangle([x, top_y, x + width, base_y], fill=body_color, outline=(40, 50, 70))

    # Window grid
    cols = max(3, width // 10)
    rows = max(6, height // 12)
    col_w = width / cols
    row_h = height / rows

    random.seed(x * 37 + height)
    for r in range(rows):
        for c in range(cols):
            if random.random() < 0.65:
                wx = int(x + c * col_w + 2)
                wy = int(top_y + r * row_h + 2)
                ww = max(2, int(col_w - 4))
                wh = max(2, int(row_h - 4))
                c_pick = lit_color if random.random() > 0.35 else (180, 220, 255)
                draw.rectangle([wx, wy, wx + ww, wy + wh], fill=c_pick)

    # Rooftop antenna
    if height > 160:
        draw.line([(x + width // 2, top_y), (x + width // 2, top_y - 25)], fill=(200, 200, 200), width=2)
        draw.ellipse([x + width // 2 - 3, top_y - 28, x + width // 2 + 3, top_y - 22], fill=(255, 30, 60))

def draw_palm_tree(draw, base_x, base_y, scale=1.0):
    trunk_h = int(60 * scale)
    trunk_w = max(2, int(4 * scale))
    draw.line([(base_x, base_y), (base_x - int(8 * scale), base_y - trunk_h)], fill=(90, 60, 40), width=trunk_w)

    crown_x = base_x - int(8 * scale)
    crown_y = base_y - trunk_h

    # Palm leaves
    leaf_color = (25, 110, 55)
    angles = [-80, -50, -20, 0, 20, 50, 80, 110, 140, 170]
    for ang in angles:
        rad = math.radians(ang)
        lx = crown_x + int(math.cos(rad) * 26 * scale)
        ly = crown_y - int(math.sin(rad) * 16 * scale)
        draw.line([(crown_x, crown_y), (lx, ly)], fill=leaf_color, width=max(1, int(2.5 * scale)))

def draw_supercar_chase(draw, cx, cy, scale=1.0):
    # Candy Coral Red Veloce GTS Turbo (rear/side 3/4 view)
    w = int(210 * scale)
    h = int(75 * scale)

    # Shadow
    draw.ellipse([cx - w // 2 - 10, cy + h // 2 - 5, cx + w // 2 + 10, cy + h // 2 + 15], fill=(8, 10, 16))

    # Main Body
    body_pts = [
        (cx - int(w * 0.45), cy + int(h * 0.35)),
        (cx - int(w * 0.48), cy + int(h * 0.05)),
        (cx - int(w * 0.35), cy - int(h * 0.2)),
        (cx - int(w * 0.15), cy - int(h * 0.45)),
        (cx + int(w * 0.15), cy - int(h * 0.45)),
        (cx + int(w * 0.38), cy - int(h * 0.1)),
        (cx + int(w * 0.48), cy + int(h * 0.15)),
        (cx + int(w * 0.45), cy + int(h * 0.35)),
        (cx - int(w * 0.45), cy + int(h * 0.35))
    ]
    draw.polygon(body_pts, fill=(255, 20, 71), outline=(180, 10, 45))

    # Dark tinted cockpit canopy
    canopy_pts = [
        (cx - int(w * 0.28), cy - int(h * 0.18)),
        (cx - int(w * 0.12), cy - int(h * 0.42)),
        (cx + int(w * 0.14), cy - int(h * 0.42)),
        (cx + int(w * 0.26), cy - int(h * 0.18)),
        (cx - int(w * 0.28), cy - int(h * 0.18))
    ]
    draw.polygon(canopy_pts, fill=(10, 18, 30), outline=(50, 70, 90))

    # Rear Aero Spoiler Wing
    wing_pts = [
        (cx - int(w * 0.42), cy - int(h * 0.35)),
        (cx + int(w * 0.42), cy - int(h * 0.35)),
        (cx + int(w * 0.44), cy - int(h * 0.42)),
        (cx - int(w * 0.44), cy - int(h * 0.42))
    ]
    draw.polygon(wing_pts, fill=(18, 22, 30))
    # Wing pillars
    draw.line([(cx - int(w * 0.25), cy - int(h * 0.15)), (cx - int(w * 0.25), cy - int(h * 0.35))], fill=(18, 22, 30), width=3)
    draw.line([(cx + int(w * 0.25), cy - int(h * 0.15)), (cx + int(w * 0.25), cy - int(h * 0.35))], fill=(18, 22, 30), width=3)

    # LED Neon Taillight Bar
    draw.line([(cx - int(w * 0.42), cy + int(h * 0.05)), (cx + int(w * 0.42), cy + int(h * 0.05))], fill=(255, 0, 70), width=4)

    # Wheels & Alloy Rims
    for wx in [cx - int(w * 0.32), cx + int(w * 0.32)]:
        wy = cy + int(h * 0.32)
        rw = int(22 * scale)
        rh = int(28 * scale)
        draw.ellipse([wx - rw, wy - rh, wx + rw, wy + rh], fill=(20, 20, 20), outline=(40, 40, 40))
        draw.ellipse([wx - int(rw * 0.6), wy - int(rh * 0.6), wx + int(rw * 0.6), wy + int(rh * 0.6)], fill=(210, 225, 240))

    # Dual Cyan Nitro Exhaust Flames
    for fx in [cx - int(w * 0.16), cx + int(w * 0.16)]:
        fy = cy + int(h * 0.25)
        flame_pts = [
            (fx - 6, fy),
            (fx + 6, fy),
            (fx, fy + int(45 * scale))
        ]
        draw.polygon(flame_pts, fill=(5, 217, 232))
        draw.polygon([(fx - 3, fy), (fx + 3, fy), (fx, fy + int(24 * scale))], fill=(255, 255, 255))

def draw_police_cruiser(draw, cx, cy, scale=0.75):
    # CPD Police Cruiser in pursuit
    w = int(200 * scale)
    h = int(80 * scale)

    # Shadow
    draw.ellipse([cx - w // 2, cy + h // 2 - 4, cx + w // 2, cy + h // 2 + 12], fill=(8, 10, 16))

    # Black & White Body
    draw.rectangle([cx - w // 2, cy - h // 4, cx + w // 2, cy + h // 3], fill=(24, 30, 42), outline=(10, 12, 18))
    # White door panel insert
    draw.rectangle([cx - int(w * 0.2), cy - h // 4, cx + int(w * 0.2), cy + h // 3], fill=(240, 245, 250))

    # Pushbar
    draw.rectangle([cx - int(w * 0.38), cy + int(h * 0.2), cx + int(w * 0.38), cy + int(h * 0.32)], fill=(10, 10, 10))

    # Rooftop Police Lightbar (Flashing Red / Blue with halo)
    bar_y = cy - int(h * 0.38)
    # Red beacon
    draw.rectangle([cx - int(w * 0.22), bar_y - 6, cx - 4, bar_y + 4], fill=(255, 0, 34))
    draw.ellipse([cx - int(w * 0.15) - 18, bar_y - 18, cx - int(w * 0.15) + 18, bar_y + 18], fill=(255, 0, 34, 140))
    # Blue beacon
    draw.rectangle([cx + 4, bar_y - 6, cx + int(w * 0.22), bar_y + 4], fill=(0, 136, 255))
    draw.ellipse([cx + int(w * 0.15) - 18, bar_y - 18, cx + int(w * 0.15) + 18, bar_y + 18], fill=(0, 136, 255, 140))

    # Wheels
    for wx in [cx - int(w * 0.3), cx + int(w * 0.3)]:
        wy = cy + int(h * 0.32)
        rw = int(18 * scale)
        rh = int(24 * scale)
        draw.ellipse([wx - rw, wy - rh, wx + rw, wy + rh], fill=(15, 15, 15))

def draw_helicopter(draw, cx, cy, scale=0.8):
    # CONDOR-1 Tactical CPD Police Helicopter
    w = int(180 * scale)
    h = int(70 * scale)

    # Fuselage
    fuse_pts = [
        (cx - int(w * 0.35), cy),
        (cx - int(w * 0.1), cy - int(h * 0.4)),
        (cx + int(w * 0.25), cy - int(h * 0.4)),
        (cx + int(w * 0.4), cy),
        (cx + int(w * 0.25), cy + int(h * 0.4)),
        (cx - int(w * 0.2), cy + int(h * 0.35))
    ]
    draw.polygon(fuse_pts, fill=(15, 23, 42), outline=(60, 80, 110))

    # Cockpit Blue Glass
    draw.polygon([
        (cx + int(w * 0.12), cy - int(h * 0.32)),
        (cx + int(w * 0.38), cy),
        (cx + int(w * 0.24), cy + int(h * 0.32)),
        (cx + int(w * 0.12), cy)
    ], fill=(0, 210, 255))

    # Tail Boom
    draw.rectangle([cx - int(w * 0.8), cy - 4, cx - int(w * 0.3), cy + 4], fill=(15, 23, 42))
    # Tail fin
    draw.polygon([(cx - int(w * 0.8), cy - 18), (cx - int(w * 0.72), cy), (cx - int(w * 0.8), cy + 10)], fill=(15, 23, 42))

    # Spinning Main Rotor (Blurred disc)
    rotor_y = cy - int(h * 0.52)
    draw.line([(cx - int(w * 0.9), rotor_y), (cx + int(w * 0.9), rotor_y)], fill=(200, 200, 200), width=3)
    draw.ellipse([cx - int(w * 0.85), rotor_y - 6, cx + int(w * 0.85), rotor_y + 6], fill=(220, 220, 220, 60))

    # Searchlight Cone (Bright volumetric cone illuminating target)
    light_pts = [
        (cx + int(w * 0.1), cy + int(h * 0.3)),
        (cx + int(w * 0.25), cy + int(h * 0.3)),
        (cx + 80, HEIGHT - 80),
        (cx - 120, HEIGHT - 80)
    ]
    draw.polygon(light_pts, fill=(255, 255, 255, 45))

def draw_hud_overlay(img, draw, mission_title, objective_text, wanted_stars, speed_mph, gear_str, weapon_name, ammo_str, district_name, dialogue_speaker=None, dialogue_text=None):
    font_lg = get_font(28, bold=True)
    font_md = get_font(18, bold=True)
    font_sm = get_font(13, bold=True)
    font_xs = get_font(11, bold=True)

    # 1. TOP-LEFT: MISSION TRACKER
    mx, my, mw, mh = 28, 24, 320, 84
    overlay = Image.new("RGBA", (WIDTH, HEIGHT), (0, 0, 0, 0))
    odraw = ImageDraw.Draw(overlay)
    odraw.rectangle([mx, my, mx + mw, my + mh], fill=(8, 12, 24, 215), outline=(5, 217, 232, 70))
    # Accent coral left strip
    odraw.rectangle([mx, my, mx + 5, my + mh], fill=(255, 42, 109, 255))
    img.paste(Image.alpha_composite(img.convert("RGBA"), overlay).convert("RGB"))

    draw.text((mx + 16, my + 10), "ACT III · OPERATION CORAL", font=font_xs, fill=(255, 42, 109))
    draw.text((mx + 16, my + 26), mission_title, font=font_md, fill=(255, 255, 255))
    # Objective with yellow diamond
    draw.polygon([(mx + 16, my + 58), (mx + 22, my + 52), (mx + 28, my + 58), (mx + 22, my + 64)], fill=(255, 183, 0))
    draw.text((mx + 34, my + 51), objective_text[:36] + ("..." if len(objective_text) > 36 else ""), font=font_xs, fill=(5, 217, 232))

    # 2. TOP-CENTER: CPD POLICE DISPATCH
    dx, dy, dw, dh = WIDTH // 2 - 200, 20, 400, 36
    overlay = Image.new("RGBA", (WIDTH, HEIGHT), (0, 0, 0, 0))
    odraw = ImageDraw.Draw(overlay)
    odraw.rounded_rectangle([dx, dy, dx + dw, dy + dh], radius=18, fill=(10, 14, 28, 220), outline=(255, 68, 68, 120))
    odraw.ellipse([dx + 16, dy + 11, dx + 30, dy + 25], fill=(255, 42, 42, 255))
    img.paste(Image.alpha_composite(img.convert("RGBA"), overlay).convert("RGB"))
    draw.text((dx + 38, dy + 10), "CPD TAC-COMM: ALL UNITS 10-99 IN PURSUIT", font=font_xs, fill=(255, 204, 204))

    # 3. TOP-RIGHT: WANTED STARS & WEAPON HUD
    sx = WIDTH - 28 - 140
    sy = 24
    overlay = Image.new("RGBA", (WIDTH, HEIGHT), (0, 0, 0, 0))
    odraw = ImageDraw.Draw(overlay)
    odraw.rounded_rectangle([sx, sy, sx + 140, sy + 38], radius=8, fill=(10, 14, 26, 180), outline=(255, 255, 255, 30))
    img.paste(Image.alpha_composite(img.convert("RGBA"), overlay).convert("RGB"))

    # Draw 5 stars
    for i in range(5):
        star_x = sx + 14 + i * 24
        star_y = sy + 18
        color = (255, 183, 0) if i < wanted_stars else (60, 70, 90)
        draw.text((star_x - 6, star_y - 8), "★", font=font_md, fill=color)

    # Weapon HUD
    wx, wy, ww, wh = WIDTH - 28 - 200, sy + 50, 200, 56
    overlay = Image.new("RGBA", (WIDTH, HEIGHT), (0, 0, 0, 0))
    odraw = ImageDraw.Draw(overlay)
    odraw.rounded_rectangle([wx, wy, wx + ww, wy + wh], radius=8, fill=(8, 12, 24, 215), outline=(5, 217, 232, 80))
    odraw.rectangle([wx + ww - 4, wy, wx + ww, wy + wh], fill=(5, 217, 232, 255))
    img.paste(Image.alpha_composite(img.convert("RGBA"), overlay).convert("RGB"))

    draw.text((wx + 16, wy + 8), weapon_name, font=font_sm, fill=(255, 255, 255))
    draw.text((wx + 16, wy + 26), ammo_str, font=font_md, fill=(5, 217, 232))

    # 4. BOTTOM-LEFT: RADAR MINIMAP & VITALS
    rx, ry, rw, rh = 28, HEIGHT - 28 - 160, 160, 160
    # Health & Armour bars
    bar_y = ry - 22
    draw.rectangle([rx, bar_y, rx + rw, bar_y + 6], fill=(40, 50, 70))
    draw.rectangle([rx, bar_y, rx + int(rw * 0.9), bar_y + 6], fill=(16, 185, 129)) # Green Health
    draw.rectangle([rx, bar_y + 8, rx + rw, bar_y + 14], fill=(40, 50, 70))
    draw.rectangle([rx, bar_y + 8, rx + int(rw * 0.75), bar_y + 14], fill=(56, 189, 248)) # Cyan Armour

    # Radar squircle frame
    overlay = Image.new("RGBA", (WIDTH, HEIGHT), (0, 0, 0, 0))
    odraw = ImageDraw.Draw(overlay)
    odraw.rounded_rectangle([rx, ry, rx + rw, ry + rh], radius=16, fill=(8, 14, 28, 230), outline=(5, 217, 232, 120))
    # Radar road network
    odraw.line([(rx + 30, ry + 10), (rx + 30, ry + rh - 10)], fill=(40, 55, 80), width=6)
    odraw.line([(rx + 75, ry + 10), (rx + 75, ry + rh - 10)], fill=(40, 55, 80), width=7)
    odraw.line([(rx + 120, ry + 10), (rx + 120, ry + rh - 10)], fill=(40, 55, 80), width=6)
    odraw.line([(rx + 10, ry + 50), (rx + rw - 10, ry + 50)], fill=(40, 55, 80), width=6)
    odraw.line([(rx + 10, ry + 105), (rx + rw - 10, ry + 105)], fill=(40, 55, 80), width=6)

    # GPS Neon Pink Vector Route
    odraw.line([(rx + 75, ry + 80), (rx + 75, ry + 50), (rx + 120, ry + 50)], fill=(255, 42, 109), width=3)
    # Objective Blip
    odraw.ellipse([rx + 116, ry + 46, rx + 124, ry + 54], fill=(255, 183, 0))

    # Police Blips
    odraw.ellipse([rx + 72, ry + 110, rx + 78, ry + 116], fill=(255, 30, 30))
    odraw.ellipse([rx + 32, ry + 65, rx + 38, ry + 71], fill=(0, 136, 255))

    # Player Arrow in center
    cx, cy = rx + rw // 2, ry + rh // 2
    odraw.polygon([(cx, cy - 8), (cx + 6, cy + 7), (cx, cy + 3), (cx - 6, cy + 7)], fill=(5, 217, 232))
    img.paste(Image.alpha_composite(img.convert("RGBA"), overlay).convert("RGB"))

    # District label
    draw.text((rx + 24, ry + rh - 18), district_name, font=font_xs, fill=(5, 217, 232))

    # 5. BOTTOM-RIGHT: SPEEDOMETER
    spx, spy, spw, sph = WIDTH - 28 - 180, HEIGHT - 28 - 90, 180, 90
    overlay = Image.new("RGBA", (WIDTH, HEIGHT), (0, 0, 0, 0))
    odraw = ImageDraw.Draw(overlay)
    odraw.rounded_rectangle([spx, spy, spx + spw, spy + sph], radius=14, fill=(10, 16, 32, 225), outline=(255, 42, 109, 90))
    # Nitro fill
    odraw.rectangle([spx + 18, spy + sph - 14, spx + spw - 18, spy + sph - 8], fill=(40, 50, 70))
    odraw.rectangle([spx + 18, spy + sph - 14, spx + int((spw - 36) * 0.85) + 18, spy + sph - 8], fill=(255, 42, 109))
    img.paste(Image.alpha_composite(img.convert("RGBA"), overlay).convert("RGB"))

    draw.text((spx + 16, spy + 8), str(speed_mph), font=get_font(44, bold=True), fill=(255, 255, 255))
    draw.text((spx + 110, spy + 14), "MPH", font=font_sm, fill=(255, 42, 109))
    draw.text((spx + 110, spy + 32), gear_str, font=font_xs, fill=(5, 217, 232))
    draw.text((spx + 16, spy + sph - 28), "VELOCE GTS TURBO", font=font_xs, fill=(140, 160, 190))

    # 6. BOTTOM-CENTER: DIALOGUE BANNER
    if dialogue_speaker and dialogue_text:
        bgx, bgy, bgw, bgh = WIDTH // 2 - 270, HEIGHT - 70, 540, 48
        overlay = Image.new("RGBA", (WIDTH, HEIGHT), (0, 0, 0, 0))
        odraw = ImageDraw.Draw(overlay)
        odraw.rounded_rectangle([bgx, bgy, bgx + bgw, bgy + bgh], radius=8, fill=(8, 12, 22, 235), outline=(255, 183, 0, 100))
        img.paste(Image.alpha_composite(img.convert("RGBA"), overlay).convert("RGB"))
        draw.text((bgx + 18, bgy + 6), dialogue_speaker, font=font_xs, fill=(255, 183, 0))
        draw.text((bgx + 18, bgy + 24), dialogue_text, font=font_sm, fill=(230, 235, 245))

def generate_shot_1_chase():
    img = Image.new("RGB", (WIDTH, HEIGHT), (10, 15, 25))
    draw = ImageDraw.Draw(img)

    horizon_y = int(HEIGHT * 0.52)
    vp_x = int(WIDTH * 0.52)

    # Sunset Sky
    draw_sky_gradient(draw, (20, 10, 40), (180, 50, 90), (255, 140, 70), horizon_y)
    draw_sun(img, draw, int(WIDTH * 0.28), horizon_y - 20, 32, (255, 180, 60))
    draw_clouds(draw, horizon_y)

    # Ocean on Left
    draw_ocean(draw, horizon_y, int(WIDTH * 0.25), int(WIDTH * 0.38))

    # Skyscraper Skyline in Distance & Right Side
    # Distant layers
    for bx in range(int(WIDTH * 0.42), WIDTH, 45):
        h = 100 + (bx * 13) % 180
        draw_skyscraper(draw, bx, horizon_y, 40, h, (255, 210, 120), is_front=False)

    # Foreground skyscrapers on right
    for bx in range(int(WIDTH * 0.65), WIDTH + 40, 75):
        h = 180 + (bx * 29) % 220
        draw_skyscraper(draw, bx, horizon_y + 10, 68, h, (5, 217, 232), is_front=True)

    # Ocean Drive Boulevard
    draw_perspective_road(draw, horizon_y, vp_x, int(WIDTH * 0.85), 60)

    # Palm trees along promenade
    for i in range(12):
        t = (i / 12) ** 1.6
        px = int(WIDTH * 0.28 + (WIDTH * 0.12 - WIDTH * 0.28) * t)
        py = int(horizon_y + (HEIGHT - horizon_y) * t)
        draw_palm_tree(draw, px, py, scale=0.4 + t * 1.4)

    # CONDOR-1 Tactical Helicopter in sky
    draw_helicopter(draw, int(WIDTH * 0.55), 130, scale=0.9)

    # CPD Police Cruiser in pursuit
    draw_police_cruiser(draw, int(WIDTH * 0.48), int(HEIGHT * 0.65), scale=0.65)

    # Veloce GTS Turbo in foreground
    draw_supercar_chase(draw, int(WIDTH * 0.54), int(HEIGHT * 0.78), scale=1.1)

    # GTA 6 AAA HUD
    draw_hud_overlay(
        img, draw,
        mission_title="SKYLINE HEIST",
        objective_text="Evade CPD tactical pursuit unit on Ocean Drive",
        wanted_stars=3,
        speed_mph=142,
        gear_str="GEAR 5",
        weapon_name="M4A1 CARBINE",
        ammo_str="30 / 180",
        district_name="OCEAN DRIVE",
        dialogue_speaker="ESTEBAN (RADIO)",
        dialogue_text='"Air unit CONDOR-1 is locked on! Cut through the Marina alleyways!"'
    )

    out_path = os.path.join(SCREENSHOTS_DIR, "1-chase.jpg")
    img.save(out_path, "JPEG", quality=88)
    print(f"Saved {out_path} ({os.path.getsize(out_path)} bytes)")

def generate_shot_2_combat():
    img = Image.new("RGB", (WIDTH, HEIGHT), (8, 10, 18))
    draw = ImageDraw.Draw(img)

    horizon_y = int(HEIGHT * 0.48)
    vp_x = int(WIDTH * 0.45)

    # Night / Twilight Sky
    draw_sky_gradient(draw, (8, 10, 20), (35, 20, 50), (90, 35, 70), horizon_y)

    # Downtown Skyscrapers with lit neon signs
    for bx in range(20, WIDTH, 65):
        h = 160 + (bx * 31) % 240
        draw_skyscraper(draw, bx, horizon_y + 15, 60, h, (255, 230, 150), is_front=True)

    # Road intersection
    draw_perspective_road(draw, horizon_y, vp_x, int(WIDTH * 0.95), 80, road_color=(22, 26, 36))

    # Fiery RPG Explosion Fireball (Center Right)
    exp_x, exp_y = int(WIDTH * 0.68), int(HEIGHT * 0.62)
    for r in range(110, 15, -6):
        alpha = int(255 * (1.0 - r / 110) * 0.8)
        color = (255, 60, 0) if r > 65 else ((255, 170, 0) if r > 35 else (255, 255, 220))
        draw.ellipse([exp_x - r, exp_y - r, exp_x + r, exp_y + r], fill=color)

    # Flying debris and sparks
    random.seed(99)
    for _ in range(35):
        sx = exp_x + random.randint(-130, 130)
        sy = exp_y + random.randint(-120, 60)
        draw.ellipse([sx - 2, sy - 2, sx + 2, sy + 2], fill=(255, 230, 100))

    # Blasted Police Cruiser tilted by shockwave
    draw_police_cruiser(draw, int(WIDTH * 0.72), int(HEIGHT * 0.68), scale=0.8)

    # Supercar in tactical stance
    draw_supercar_chase(draw, int(WIDTH * 0.35), int(HEIGHT * 0.76), scale=1.0)

    # Luminous Cyan Bullet Tracers cutting across scene
    draw.line([(int(WIDTH * 0.38), int(HEIGHT * 0.68)), (exp_x - 30, exp_y + 10)], fill=(5, 217, 232), width=3)
    draw.line([(int(WIDTH * 0.39), int(HEIGHT * 0.67)), (int(WIDTH * 0.7), int(HEIGHT * 0.58))], fill=(5, 217, 232), width=2)
    # Muzzle flash burst
    draw.ellipse([int(WIDTH * 0.38) - 14, int(HEIGHT * 0.68) - 14, int(WIDTH * 0.38) + 14, int(HEIGHT * 0.68) + 14], fill=(255, 220, 100))

    # Crosshair in Center
    ch_x, ch_y = WIDTH // 2, HEIGHT // 2
    draw.line([(ch_x - 14, ch_y), (ch_x - 4, ch_y)], fill=(255, 255, 255), width=2)
    draw.line([(ch_x + 4, ch_y), (ch_x + 14, ch_y)], fill=(255, 255, 255), width=2)
    draw.line([(ch_x, ch_y - 14), (ch_x, ch_y - 4)], fill=(255, 255, 255), width=2)
    draw.line([(ch_x, ch_y + 4), (ch_x, ch_y + 14)], fill=(255, 255, 255), width=2)
    draw.ellipse([ch_x - 2, ch_y - 2, ch_x + 2, ch_y + 2], fill=(255, 42, 109))

    # GTA 6 AAA HUD
    draw_hud_overlay(
        img, draw,
        mission_title="HARBOR AMBUSH",
        objective_text="Survive syndicate assault and eliminate enforcers",
        wanted_stars=4,
        speed_mph=48,
        gear_str="GEAR 2",
        weapon_name="RPG-7 LAUNCHER",
        ammo_str="1 / 6",
        district_name="INDUSTRIAL HARBOR",
        dialogue_speaker="VALERIA (DISPATCH)",
        dialogue_text='"Multiple hostile units down! Break through the south gate!"'
    )

    out_path = os.path.join(SCREENSHOTS_DIR, "2-combat.jpg")
    img.save(out_path, "JPEG", quality=88)
    print(f"Saved {out_path} ({os.path.getsize(out_path)} bytes)")

def generate_shot_3_map():
    img = Image.new("RGB", (WIDTH, HEIGHT), (12, 16, 28))
    draw = ImageDraw.Draw(img)

    horizon_y = int(HEIGHT * 0.38)

    # Twilight Sky
    draw_sky_gradient(draw, (14, 18, 36), (60, 40, 85), (200, 90, 110), horizon_y)
    draw_sun(img, draw, int(WIDTH * 0.8), horizon_y - 10, 24, (255, 200, 120))

    # Bay Ocean on Left
    draw_ocean(draw, horizon_y, int(WIDTH * 0.22), int(WIDTH * 0.35))

    # High Altitude City Skyline Panorama (Downtown, Coral Marina, Solis Tower)
    for bx in range(int(WIDTH * 0.28), WIDTH, 36):
        h = 120 + (bx * 23) % 240
        if bx % 72 == 0:
            h += 70 # Towering spire
        draw_skyscraper(draw, bx, horizon_y + 120, 32, h, (255, 240, 160), is_front=False)

    # Foreground district highrises
    for bx in range(int(WIDTH * 0.38), WIDTH, 54):
        h = 100 + (bx * 19) % 180
        draw_skyscraper(draw, bx, HEIGHT - 40, 48, h, (5, 217, 232), is_front=True)

    # Highway light trails
    for y in range(horizon_y + 140, HEIGHT - 50, 28):
        draw.line([(int(WIDTH * 0.3), y), (WIDTH, y + 20)], fill=(255, 60, 80), width=3)
        draw.line([(int(WIDTH * 0.3), y + 4), (WIDTH, y + 24)], fill=(255, 240, 120), width=3)

    # CONDOR-1 in distance patrol
    draw_helicopter(draw, int(WIDTH * 0.36), 110, scale=0.6)

    # GTA 6 AAA HUD
    draw_hud_overlay(
        img, draw,
        mission_title="COASTLINE DELIVERY",
        objective_text="Transport hot contraband across Greater Solis",
        wanted_stars=2,
        speed_mph=88,
        gear_str="GEAR 4",
        weapon_name="AP-9 SUBMACHINE",
        ammo_str="30 / 150",
        district_name="DOWNTOWN SOLIS",
        dialogue_speaker="ESTEBAN (RADIO)",
        dialogue_text='"Solis City is wide open tonight. Keep an eye on the radar."'
    )

    out_path = os.path.join(SCREENSHOTS_DIR, "3-map.jpg")
    img.save(out_path, "JPEG", quality=88)
    print(f"Saved {out_path} ({os.path.getsize(out_path)} bytes)")

def generate_shot_4_title():
    img = Image.new("RGB", (WIDTH, HEIGHT), (6, 8, 16))
    draw = ImageDraw.Draw(img)

    horizon_y = int(HEIGHT * 0.44)

    # Deep Cyberpunk Twilight Sky
    draw_sky_gradient(draw, (8, 10, 24), (45, 18, 55), (140, 40, 85), horizon_y)

    # Solis City Downtown Skyline in background
    for bx in range(40, WIDTH, 55):
        h = 140 + (bx * 17) % 210
        draw_skyscraper(draw, bx, horizon_y + 10, 50, h, (5, 217, 232), is_front=True)

    # Wet reflective asphalt road
    pts = [(0, horizon_y), (WIDTH, horizon_y), (WIDTH, HEIGHT), (0, HEIGHT)]
    draw.polygon(pts, fill=(18, 22, 32))

    # Road wet reflections of city neon
    for _ in range(25):
        rx = random.randint(100, WIDTH - 100)
        ry = random.randint(horizon_y + 10, HEIGHT - 10)
        draw.line([(rx, ry), (rx + random.randint(20, 80), ry)], fill=(40, 70, 100), width=2)

    # Hero Supercar Front 3/4 Low-Angle Showcase
    cx, cy = WIDTH // 2, int(HEIGHT * 0.72)
    draw_supercar_chase(draw, cx, cy, scale=1.35)

    # Glowing Headlight Light Cones toward camera
    for hx in [cx - 60, cx + 60]:
        cone_pts = [(hx, cy - 10), (hx - 90, HEIGHT), (hx + 90, HEIGHT)]
        draw.polygon(cone_pts, fill=(180, 240, 255, 35))

    # AAA Game Title Logo: SOLIS CITY: CORAL COAST
    font_title = get_font(52, bold=True)
    font_sub = get_font(18, bold=True)

    title_text = "SOLIS CITY: CORAL COAST"
    sub_text = "AN ORIGINAL 3D OPEN-WORLD CRIME ACTION GAME · MAKE.FUN GTA 6"

    # Logo Shadow & Glow
    draw.text((WIDTH // 2 - 2, 70), title_text, font=font_title, fill=(255, 42, 109), anchor="mm")
    draw.text((WIDTH // 2, 68), title_text, font=font_title, fill=(5, 217, 232), anchor="mm")
    draw.text((WIDTH // 2, 66), title_text, font=font_title, fill=(255, 255, 255), anchor="mm")

    draw.text((WIDTH // 2, 110), sub_text, font=font_sub, fill=(255, 183, 0), anchor="mm")

    # Clean bottom watermark
    draw.text((WIDTH // 2, HEIGHT - 30), "PRESS ANY KEY OR CLICK TO ENTER SOLIS CITY", font=get_font(13, bold=True), fill=(160, 180, 210), anchor="mm")

    out_path = os.path.join(SCREENSHOTS_DIR, "4-title.jpg")
    img.save(out_path, "JPEG", quality=88)
    print(f"Saved {out_path} ({os.path.getsize(out_path)} bytes)")

def main():
    print("Generating 4 AAA Solis City screenshots...")
    generate_shot_1_chase()
    generate_shot_2_combat()
    generate_shot_3_map()
    generate_shot_4_title()
    print("All screenshots generated successfully.")

if __name__ == "__main__":
    main()
