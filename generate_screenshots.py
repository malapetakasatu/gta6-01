#!/usr/bin/env python3
"""
Custom 3D Projection Engine & AAA Screenshot Generator for SOLIS CITY: CORAL COAST
Generates 4 realistic 1024x576 JPEG screenshots:
  1-chase.jpg: High-speed coastal pursuit at sunset with CPD cruisers, CONDOR-1 heli spotlight, full HUD.
  2-combat.jpg: Nighttime firefight in Neon Strip with muzzle flash, tracers, sparks, crosshair, combat HUD.
  3-map.jpg: Solis City tactical vector map with 6 districts, GPS route, waypoints, legend.
  4-title.jpg: Cinematic golden hour title screen with coastal skyline, Veloce GTS Turbo, AAA menu.
"""

import os
import math
import random
from PIL import Image, ImageDraw, ImageFont

WIDTH = 1024
HEIGHT = 576
SCREENSHOTS_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'screenshots')
os.makedirs(SCREENSHOTS_DIR, exist_ok=True)

def get_font(size):
    try:
        return ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', size)
    except Exception:
        try:
            return ImageFont.truetype('/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf', size)
        except Exception:
            return ImageFont.load_default()

def get_regular_font(size):
    try:
        return ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', size)
    except Exception:
        try:
            return ImageFont.truetype('/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf', size)
        except Exception:
            return ImageFont.load_default()

def get_mono_font(size):
    try:
        return ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSansMono-Bold.ttf', size)
    except Exception:
        try:
            return ImageFont.truetype('/usr/share/fonts/truetype/liberation/LiberationMono-Bold.ttf', size)
        except Exception:
            return ImageFont.load_default()

class Camera3D:
    def __init__(self, pos, target, fov=65.0, aspect=WIDTH/HEIGHT):
        self.pos = pos
        self.target = target
        self.fov = math.radians(fov)
        self.aspect = aspect
        # Compute forward, right, up
        dx = target[0] - pos[0]
        dy = target[1] - pos[1]
        dz = target[2] - pos[2]
        dist = math.sqrt(dx*dx + dy*dy + dz*dz) or 1.0
        self.fwd = (dx/dist, dy/dist, dz/dist)
        
        # Right = fwd x (0, 1, 0)
        rx = self.fwd[2]
        ry = 0.0
        rz = -self.fwd[0]
        rdist = math.sqrt(rx*rx + rz*rz) or 1.0
        self.right = (rx/rdist, 0.0, rz/rdist)
        
        # Up = right x fwd
        ux = self.right[1]*self.fwd[2] - self.right[2]*self.fwd[1]
        uy = self.right[2]*self.fwd[0] - self.right[0]*self.fwd[2]
        uz = self.right[0]*self.fwd[1] - self.right[1]*self.fwd[0]
        self.up = (ux, uy, uz)
        
        self.tan_half_fov = math.tan(self.fov / 2.0)

    def project(self, p):
        # Relative to camera
        rx = p[0] - self.pos[0]
        ry = p[1] - self.pos[1]
        rz = p[2] - self.pos[2]
        
        # Transform to camera space
        cam_x = rx*self.right[0] + ry*self.right[1] + rz*self.right[2]
        cam_y = rx*self.up[0] + ry*self.up[1] + rz*self.up[2]
        cam_z = rx*self.fwd[0] + ry*self.fwd[1] + rz*self.fwd[2]
        
        if cam_z <= 0.1:
            return None
            
        ndc_x = cam_x / (cam_z * self.tan_half_fov * self.aspect)
        ndc_y = cam_y / (cam_z * self.tan_half_fov)
        
        screen_x = int((ndc_x * 0.5 + 0.5) * WIDTH)
        screen_y = int((0.5 - ndc_y * 0.5) * HEIGHT)
        return (screen_x, screen_y, cam_z)

def draw_hud(draw, wanted_stars=3, speed_kmh=184, gear=5, car_name="VELOCE GTS TURBO",
             weapon_name="CARBINE-15", ammo="28 / 180", health=90, armour=85,
             cash=1450200, mission_tag="MISSION 1 / 8", mission_name="WELCOME TO SOLIS",
             mission_obj="Drive south along Ocean Boulevard and rendezvous at Coral Pier.",
             dispatch_text=None, dialogue_speaker="MARCO", dialogue_text=None):
    font_lg = get_font(28)
    font_md = get_font(18)
    font_sm = get_font(12)
    font_xs = get_font(10)
    font_mono = get_mono_font(22)
    font_mono_lg = get_mono_font(42)

    # 1. TOP-LEFT: WANTED STARS
    draw.text((32, 24), "SOLIS CPD PURSUIT SYSTEM", fill=(255, 60, 100), font=font_xs)
    star_x = 32
    star_y = 40
    for i in range(4):
        active = i < wanted_stars
        color = (255, 30, 60) if active else (80, 80, 90)
        # Draw 5-pointed star
        pts = []
        cx, cy, r_out, r_in = star_x + i * 26 + 10, star_y + 10, 10, 4.5
        for s in range(10):
            r = r_out if s % 2 == 0 else r_in
            ang = s * math.pi / 5 - math.pi / 2
            pts.append((cx + math.cos(ang) * r, cy + math.sin(ang) * r))
        draw.polygon(pts, fill=color)

    # 2. TOP-RIGHT: CASH & WEAPON
    cash_str = f"${cash:,}"
    draw.text((WIDTH - 32 - draw.textlength(cash_str, font=font_mono), 24), cash_str, fill=(85, 255, 150), font=font_mono)

    # Weapon card
    wep_card_w = 210
    wep_card_h = 42
    wx = WIDTH - 32 - wep_card_w
    wy = 58
    draw.rectangle([wx, wy, wx + wep_card_w, wy + wep_card_h], fill=(15, 18, 28, 200), outline=(50, 60, 80))
    draw.line([wx + wep_card_w - 4, wy, wx + wep_card_w - 4, wy + wep_card_h], fill=(255, 59, 105), width=4)
    draw.text((wx + 14, wy + 12), weapon_name, fill=(235, 240, 250), font=font_xs)
    draw.text((wx + 105, wy + 8), ammo, fill=(255, 204, 0), font=font_md)

    # 3. MISSION TRACKER
    m_box_w = 380
    m_box_h = 70
    mx = 32
    my = 76
    draw.rectangle([mx, my, mx + m_box_w, my + m_box_h], fill=(16, 20, 32, 220), outline=(30, 40, 60))
    draw.line([mx, my, mx, my + m_box_h], fill=(255, 170, 0), width=4)
    draw.text((mx + 16, my + 8), mission_tag, fill=(255, 170, 0), font=font_xs)
    draw.text((mx + 16, my + 22), mission_name, fill=(255, 255, 255), font=font_md)
    draw.text((mx + 16, my + 44), mission_obj, fill=(190, 205, 225), font=font_xs)

    # 4. DISPATCH BOX
    if dispatch_text:
        disp_w = 380
        disp_h = 32
        dx = 32
        dy = 158
        draw.rectangle([dx, dy, dx + disp_w, dy + disp_h], fill=(30, 12, 20, 210), outline=(70, 25, 40))
        draw.line([dx, dy, dx, dy + disp_h], fill=(255, 42, 75), width=3)
        draw.text((dx + 12, dy + 8), dispatch_text, fill=(255, 130, 150), font=font_xs)

    # 5. BOTTOM-LEFT: RADAR MINIMAP & VITALS
    rx = 32
    ry = HEIGHT - 180
    rw = 135
    rh = 135
    draw.ellipse([rx, ry, rx + rw, ry + rh], fill=(8, 12, 20), outline=(60, 80, 110), width=3)

    # Grid lines & roads in radar
    rcx = rx + rw // 2
    rcy = ry + rh // 2
    draw.line([rx + 10, rcy, rx + rw - 10, rcy], fill=(30, 45, 65), width=8)
    draw.line([rcx, ry + 10, rcx, ry + rh - 10], fill=(30, 45, 65), width=10)
    draw.line([rcx - 35, ry + 10, rcx - 35, ry + rh - 10], fill=(30, 45, 65), width=8)
    draw.line([rcx + 35, ry + 10, rcx + 35, ry + rh - 10], fill=(30, 45, 65), width=8)

    # GPS route to target
    draw.line([rcx, rcy, rcx + 28, rcy - 36], fill=(255, 170, 0), width=2)
    draw.polygon([(rcx + 28, rcy - 42), (rcx + 34, rcy - 36), (rcx + 28, rcy - 30), (rcx + 22, rcy - 36)], fill=(255, 204, 0))

    # Police blips
    draw.ellipse([rcx - 22, rcy + 18, rcx - 14, rcy + 26], fill=(255, 30, 50))
    draw.ellipse([rcx + 18, rcy + 24, rcx + 26, rcy + 32], fill=(0, 120, 255))
    draw.ellipse([rcx - 10, rcy - 30, rcx - 2, rcy - 22], fill=(255, 0, 80))

    # Player cursor (cyan arrow)
    draw.polygon([(rcx, rcy - 7), (rcx + 6, rcy + 6), (rcx, rcy + 3), (rcx - 6, rcy + 6)], fill=(0, 229, 255))

    # Compass N
    draw.text((rcx - 4, ry + 5), "N", fill=(0, 229, 255), font=font_xs)

    # Health & Armour
    vy = HEIGHT - 36
    draw.rectangle([rx, vy, rx + rw, vy + 6], fill=(40, 20, 25))
    draw.rectangle([rx, vy, rx + int(rw * (health/100)), vy + 6], fill=(255, 35, 65))

    draw.rectangle([rx, vy + 9, rx + rw, vy + 15], fill=(15, 30, 45))
    draw.rectangle([rx, vy + 9, rx + int(rw * (armour/100)), vy + 15], fill=(0, 190, 255))

    # 6. BOTTOM-RIGHT: SPEEDOMETER
    sp_w = 175
    sp_h = 75
    sp_x = WIDTH - 32 - sp_w
    sp_y = HEIGHT - 32 - sp_h
    draw.rectangle([sp_x, sp_y, sp_x + sp_w, sp_y + sp_h], fill=(12, 16, 26, 230), outline=(40, 55, 80))
    draw.text((sp_x + 14, sp_y + 8), car_name, fill=(0, 229, 255), font=font_xs)
    speed_txt = str(speed_kmh)
    draw.text((sp_x + 14, sp_y + 22), speed_txt, fill=(255, 255, 255), font=font_mono_lg)
    draw.text((sp_x + 115, sp_y + 36), "KM/H", fill=(140, 160, 185), font=font_sm)
    draw.text((sp_x + 14, sp_y + 60), f"GEAR {gear}", fill=(255, 170, 0), font=font_xs)

    # 7. DIALOGUE SUBTITLES
    if dialogue_text:
        dia_w = 540
        dia_h = 42
        d_x = (WIDTH - dia_w) // 2
        d_y = HEIGHT - 75
        draw.rectangle([d_x, d_y, d_x + dia_w, d_y + dia_h], fill=(10, 12, 18, 225), outline=(50, 60, 75))
        draw.text((d_x + 16, d_y + 6), dialogue_speaker, fill=(255, 59, 105), font=font_xs)
        draw.text((d_x + 16, d_y + 20), dialogue_text, fill=(230, 235, 245), font=font_sm)

def draw_3d_box(img, draw, cam, center, size, color_top, color_front, color_side):
    cx, cy, cz = center
    sx, sy, sz = size
    # 8 vertices
    x0, x1 = cx - sx/2, cx + sx/2
    y0, y1 = cy - sy/2, cy + sy/2
    z0, z1 = cz - sz/2, cz + sz/2
    
    verts = [
        (x0, y0, z0), (x1, y0, z0), (x1, y1, z0), (x0, y1, z0), # Front
        (x0, y0, z1), (x1, y0, z1), (x1, y1, z1), (x0, y1, z1)  # Back
    ]
    p = [cam.project(v) for v in verts]
    if any(pt is None for pt in p):
        return

    # Draw Faces (Side, Front, Top)
    # Front: 0, 1, 2, 3
    draw.polygon([(p[0][0], p[0][1]), (p[1][0], p[1][1]), (p[2][0], p[2][1]), (p[3][0], p[3][1])], fill=color_front)
    # Right: 1, 5, 6, 2
    draw.polygon([(p[1][0], p[1][1]), (p[5][0], p[5][1]), (p[6][0], p[6][1]), (p[2][0], p[2][1])], fill=color_side)
    # Top: 3, 2, 6, 7
    draw.polygon([(p[3][0], p[3][1]), (p[2][0], p[2][1]), (p[6][0], p[6][1]), (p[7][0], p[7][1])], fill=color_top)

def draw_palm_tree_3d(draw, cam, x, z):
    base = cam.project((x, 0, z))
    mid = cam.project((x + 0.4, 6, z))
    top = cam.project((x + 0.8, 12, z))
    if not (base and mid and top):
        return
    # Trunk
    draw.line([(base[0], base[1]), (mid[0], mid[1]), (top[0], top[1])], fill=(95, 65, 40), width=4)
    # Fronds
    tx, ty = top[0], top[1]
    for angle in [0, 45, 90, 135, 180, 225, 270, 315]:
        rad = math.radians(angle)
        fx = tx + math.cos(rad) * 26
        fy = ty + math.sin(rad) * 16 + 6
        draw.line([(tx, ty), (int(fx), int(fy))], fill=(25, 115, 35), width=3)

def generate_screenshot_1():
    """1-chase.jpg: High-speed coastal pursuit at sunset"""
    img = Image.new('RGB', (WIDTH, HEIGHT))
    draw = ImageDraw.Draw(img)

    # 1. Sunset Sky Gradient (Deep Indigo -> Coral Pink -> Golden Sun)
    for y in range(HEIGHT):
        t = y / HEIGHT
        if t < 0.4:
            # Indigo to Magenta
            r = int(25 + t * 400)
            g = int(18 + t * 120)
            b = int(55 + t * 250)
        elif t < 0.7:
            # Magenta to Coral Gold
            nt = (t - 0.4) / 0.3
            r = int(185 + nt * 70)
            g = int(66 + nt * 110)
            b = int(155 - nt * 100)
        else:
            # Gold to dark asphalt
            nt = (t - 0.7) / 0.3
            r = int(255 - nt * 220)
            g = int(176 - nt * 150)
            b = int(55 - nt * 30)
        draw.line([(0, y), (WIDTH, y)], fill=(r, g, b))

    # Giant setting sun
    sun_cx, sun_cy = 280, 210
    draw.ellipse([sun_cx - 70, sun_cy - 70, sun_cx + 70, sun_cy + 70], fill=(255, 245, 180))

    # 2. Camera Setup
    cam = Camera3D(pos=(-80, 3.8, -195), target=(-80, 1.8, -140), fov=62)

    # 3. Solis City Skyline Background
    buildings = [
        # x, z, width, depth, height
        (-25, -120, 24, 24, 85),
        (5, -110, 28, 28, 120),
        (40, -130, 35, 35, 155),  # Solis Financial Tower
        (85, -115, 26, 26, 95),
        (120, -135, 22, 22, 75),
        (-40, -80, 20, 20, 65),
        (25, -75, 25, 25, 110),
        (65, -80, 24, 24, 80)
    ]
    for b in buildings:
        bx, bz, bw, bd, bh = b
        draw_3d_box(img, draw, cam, (bx, bh/2, bz), (bw, bh, bd),
                    color_top=(35, 45, 60), color_front=(20, 25, 38), color_side=(15, 18, 28))
        # Window glow dots
        top_pt = cam.project((bx, bh, bz))
        base_pt = cam.project((bx, 0, bz))
        if top_pt and base_pt and (base_pt[1] - top_pt[1] > 20):
            for wy in range(top_pt[1] + 6, base_pt[1] - 6, 8):
                for wx in range(top_pt[0] - 12, top_pt[0] + 12, 6):
                    if random.random() > 0.45:
                        draw.point((wx, wy), fill=(255, 235, 160))

    # 4. Ocean & Coastal Highway
    # Road Asphalt
    road_p1 = cam.project((-90, 0, -220))
    road_p2 = cam.project((-70, 0, -220))
    road_p3 = cam.project((-70, 0, -50))
    road_p4 = cam.project((-90, 0, -50))
    if road_p1 and road_p2 and road_p3 and road_p4:
        draw.polygon([(road_p1[0], road_p1[1]), (road_p2[0], road_p2[1]),
                      (road_p3[0], road_p3[1]), (road_p4[0], road_p4[1])], fill=(28, 30, 38))

    # Road center divider dashes
    for z in range(-210, -50, 12):
        pt1 = cam.project((-80, 0.05, z))
        pt2 = cam.project((-80, 0.05, z + 6))
        if pt1 and pt2:
            draw.line([(pt1[0], pt1[1]), (pt2[0], pt2[1])], fill=(240, 195, 40), width=3)

    # Palm trees along boulevard
    for z in range(-210, -70, 22):
        draw_palm_tree_3d(draw, cam, -94, z)
        draw_palm_tree_3d(draw, cam, -66, z)

    # 5. VEHICLES
    # Player Veloce GTS Turbo in foreground
    # Chassis
    draw_3d_box(img, draw, cam, (-80, 0.7, -182), (2.4, 0.75, 4.8),
                color_top=(230, 25, 60), color_front=(210, 20, 50), color_side=(180, 15, 40))
    # Cabin Glass
    draw_3d_box(img, draw, cam, (-80, 1.3, -182.2), (1.9, 0.55, 2.3),
                color_top=(20, 30, 45), color_front=(15, 22, 35), color_side=(10, 18, 28))
    # Glowing Taillights
    tl_l = cam.project((-80.75, 0.75, -184.4))
    tl_r = cam.project((-79.25, 0.75, -184.4))
    if tl_l and tl_r:
        draw.rectangle([tl_l[0]-8, tl_l[1]-3, tl_l[0]+8, tl_l[1]+3], fill=(255, 0, 40))
        draw.rectangle([tl_r[0]-8, tl_r[1]-3, tl_r[0]+8, tl_r[1]+3], fill=(255, 0, 40))

    # Police Cruiser 1 in hot pursuit (behind/right)
    draw_3d_box(img, draw, cam, (-77.5, 0.8, -165), (2.3, 0.85, 5.0),
                color_top=(245, 245, 245), color_front=(18, 22, 30), color_side=(15, 18, 25))
    # Siren lightbar flashing
    lb_pt = cam.project((-77.5, 1.8, -165))
    if lb_pt:
        draw.rectangle([lb_pt[0]-14, lb_pt[1]-4, lb_pt[0]-2, lb_pt[1]+4], fill=(255, 20, 40))
        draw.rectangle([lb_pt[0]+2, lb_pt[1]-4, lb_pt[0]+14, lb_pt[1]+4], fill=(0, 110, 255))
        # Blue/Red lens flare glow
        draw.ellipse([lb_pt[0]-35, lb_pt[1]-15, lb_pt[0]+35, lb_pt[1]+15], outline=(255, 50, 80))

    # Police Cruiser 2 (flanking left)
    draw_3d_box(img, draw, cam, (-83.0, 0.8, -152), (2.3, 0.85, 5.0),
                color_top=(245, 245, 245), color_front=(18, 22, 30), color_side=(15, 18, 25))
    lb_pt2 = cam.project((-83.0, 1.8, -152))
    if lb_pt2:
        draw.rectangle([lb_pt2[0]-10, lb_pt2[1]-3, lb_pt2[0]+10, lb_pt2[1]+3], fill=(0, 140, 255))

    # 6. CPD CONDOR-1 Helicopter in the sky with Spotlight Cone
    h_pt = cam.project((-72, 38, -145))
    if h_pt:
        # Heli Fuselage
        hx, hy = h_pt[0], h_pt[1]
        draw.ellipse([hx - 22, hy - 12, hx + 22, hy + 12], fill=(22, 28, 38))
        # Main Rotor blade
        draw.line([(hx - 55, hy - 14), (hx + 55, hy - 14)], fill=(15, 18, 24), width=3)
        # Tail boom
        draw.line([(hx - 15, hy), (hx - 48, hy - 6)], fill=(22, 28, 38), width=5)
        draw.line([(hx - 48, hy - 16), (hx - 48, hy + 4)], fill=(15, 18, 24), width=2)
        # Volumetric Spotlight Cone beaming to player car
        cone_target = cam.project((-79.5, 0.5, -180))
        if cone_target:
            cx, cy = cone_target[0], cone_target[1]
            draw.polygon([(hx, hy + 8), (cx - 45, cy), (cx + 45, cy)], fill=(0, 229, 255, 45))
            draw.ellipse([cx - 45, cy - 14, cx + 45, cy + 14], fill=(0, 229, 255, 75))

    # 7. AAA GTA 6 HUD Overlay
    draw_hud(draw, wanted_stars=4, speed_kmh=184, gear=5, car_name="VELOCE GTS TURBO",
             weapon_name="CARBINE-15", ammo="28 / 180", health=88, armour=70, cash=1450200,
             mission_tag="MISSION 1 / 8", mission_name="WELCOME TO SOLIS",
             mission_obj="Drive south along Ocean Boulevard and rendezvous at Coral Pier.",
             dispatch_text="[CPD DISPATCH] ALL UNITS: HIGH SPEED 10-99 SIGHTED ON CORAL BLVD! ENGAGE!",
             dialogue_speaker="MARCO", dialogue_text="Floor it! Solis PD brought out the air support! Do not stop!")

    out_path = os.path.join(SCREENSHOTS_DIR, '1-chase.jpg')
    img.save(out_path, 'JPEG', quality=95)
    print(f"Generated {out_path}")

def generate_screenshot_2():
    """2-combat.jpg: Tactical night firefight in Neon Strip district"""
    img = Image.new('RGB', (WIDTH, HEIGHT))
    draw = ImageDraw.Draw(img)

    # 1. Dark Neon Night Sky Gradient
    for y in range(HEIGHT):
        t = y / HEIGHT
        r = int(8 + t * 24)
        g = int(10 + t * 22)
        b = int(22 + t * 45)
        draw.line([(0, y), (WIDTH, y)], fill=(r, g, b))

    # 2. Camera Setup for Street Firefight
    cam = Camera3D(pos=(40, 2.2, 92), target=(40, 1.8, 125), fov=68)

    # 3. Neon District Buildings with glowing signs
    buildings = [
        (18, 130, 22, 22, 65, "NEON OASIS", (0, 229, 255)),
        (62, 135, 26, 26, 80, "CORAL CLUB", (255, 40, 120)),
        (15, 105, 20, 20, 55, "VICE LOUNGE", (255, 204, 0)),
        (65, 108, 22, 22, 70, "SOLIS CASINO", (0, 255, 140))
    ]
    font_neon = get_font(14)

    for bx, bz, bw, bd, bh, label, neon_col in buildings:
        draw_3d_box(img, draw, cam, (bx, bh/2, bz), (bw, bh, bd),
                    color_top=(20, 25, 35), color_front=(14, 18, 26), color_side=(10, 14, 20))
        # Sign on facade
        sign_pt = cam.project((bx, bh * 0.45, bz - bd/2 - 0.5))
        if sign_pt:
            sx, sy = sign_pt[0], sign_pt[1]
            tw = draw.textlength(label, font=font_neon)
            draw.rectangle([sx - tw//2 - 6, sy - 10, sx + tw//2 + 6, sy + 10], fill=(10, 12, 18), outline=neon_col, width=2)
            draw.text((sx - tw//2, sy - 8), label, fill=neon_col, font=font_neon)

    # 4. Wet Asphalt Street with neon reflections
    p1 = cam.project((25, 0, 85))
    p2 = cam.project((55, 0, 85))
    p3 = cam.project((55, 0, 150))
    p4 = cam.project((25, 0, 150))
    if p1 and p2 and p3 and p4:
        draw.polygon([(p1[0], p1[1]), (p2[0], p2[1]), (p3[0], p3[1]), (p4[0], p4[1])], fill=(18, 20, 26))
        # Neon streak reflections on wet pavement
        draw.ellipse([p3[0]-60, p3[1]-15, p3[0]+60, p3[1]+15], fill=(255, 40, 120))
        draw.ellipse([p4[0]-50, p4[1]-12, p4[0]+50, p4[1]+12], fill=(0, 229, 255))

    # 5. Player in tactical cover beside Veloce GTS Turbo
    draw_3d_box(img, draw, cam, (37.2, 0.7, 98), (2.4, 0.75, 4.8),
                color_top=(210, 20, 50), color_front=(180, 15, 40), color_side=(150, 10, 30))

    # Player Torso & Weapon
    pl_pt = cam.project((39.2, 1.3, 98.5))
    if pl_pt:
        px, py = pl_pt[0], pl_pt[1]
        draw.rectangle([px - 8, py - 18, px + 8, py + 8], fill=(30, 42, 58)) # Jacket
        draw.ellipse([px - 5, py - 28, px + 5, py - 18], fill=(215, 175, 140)) # Head

        # Gun Barrel & Bright Muzzle Flash
        draw.line([(px + 6, py - 6), (px + 24, py - 8)], fill=(30, 30, 30), width=4)
        # Muzzle Flash Starburst
        fx, fy = px + 28, py - 8
        draw.ellipse([fx - 18, fy - 18, fx + 18, fy + 18], fill=(255, 230, 100))
        draw.line([(fx - 30, fy), (fx + 30, fy)], fill=(255, 255, 220), width=3)
        draw.line([(fx, fy - 30), (fx, fy + 30)], fill=(255, 255, 220), width=3)

        # Glowing bullet tracers streaking toward CPD cruiser
        t_end = cam.project((42.5, 1.2, 118))
        if t_end:
            draw.line([(fx, fy), (t_end[0], t_end[1])], fill=(255, 240, 120), width=3)
            # Second tracer
            draw.line([(fx + 2, fy + 4), (t_end[0] + 12, t_end[1] - 8)], fill=(255, 200, 60), width=2)
            # Ricochet sparks at target
            for sp in range(6):
                ang = random.uniform(0, math.pi * 2)
                dist = random.uniform(8, 25)
                draw.line([(t_end[0], t_end[1]), (int(t_end[0] + math.cos(ang)*dist), int(t_end[1] + math.sin(ang)*dist))],
                          fill=(255, 180, 40), width=2)

    # CPD Police Cruiser taking fire
    draw_3d_box(img, draw, cam, (43.0, 0.8, 120), (2.3, 0.85, 5.0),
                color_top=(240, 240, 240), color_front=(15, 18, 24), color_side=(12, 15, 20))
    cpd_lb = cam.project((43.0, 1.8, 120))
    if cpd_lb:
        draw.rectangle([cpd_lb[0]-12, cpd_lb[1]-3, cpd_lb[0]+12, cpd_lb[1]+3], fill=(255, 20, 50))

    # Crosshair in center screen
    cx, cy = WIDTH // 2, HEIGHT // 2
    draw.line([(cx - 16, cy), (cx - 5, cy)], fill=(255, 255, 255), width=2)
    draw.line([(cx + 5, cy), (cx + 16, cy)], fill=(255, 255, 255), width=2)
    draw.line([(cx, cy - 16), (cx, cy - 5)], fill=(255, 255, 255), width=2)
    draw.line([(cx, cy + 5), (cx, cy + 16)], fill=(255, 255, 255), width=2)
    # Hit marker red tick
    draw.line([(cx - 8, cy - 8), (cx - 3, cy - 3)], fill=(255, 40, 60), width=2)
    draw.line([(cx + 3, cy - 3), (cx + 8, cy - 8)], fill=(255, 40, 60), width=2)

    # 6. Combat HUD Overlay
    draw_hud(draw, wanted_stars=3, speed_kmh=0, gear=1, car_name="PEDESTRIAN",
             weapon_name="CARBINE-15", ammo="14 / 150", health=72, armour=45, cash=1450200,
             mission_tag="MISSION 2 / 8", mission_name="NEON SHADOWS",
             mission_obj="Eliminate syndicate guards at Vice Palms and retrieve the encrypted briefcase.",
             dispatch_text="[CPD DISPATCH] 10-99 SHOTS FIRED! OFFICERS UNDER HEAVY FIRE ON NEON STRIP!",
             dialogue_speaker="VALERIA", dialogue_text="Keep behind the engine block! Cover me while I crack the safe!")

    out_path = os.path.join(SCREENSHOTS_DIR, '2-combat.jpg')
    img.save(out_path, 'JPEG', quality=95)
    print(f"Generated {out_path}")

def generate_screenshot_3():
    """3-map.jpg: Full Solis City tactical vector map with 6 districts & GPS route"""
    img = Image.new('RGB', (WIDTH, HEIGHT))
    draw = ImageDraw.Draw(img)

    # 1. Dark Blueprint Background
    draw.rectangle([0, 0, WIDTH, HEIGHT], fill=(8, 12, 18))

    # Grid Pattern
    for x in range(0, WIDTH, 32):
        draw.line([(x, 0), (x, HEIGHT)], fill=(16, 24, 36), width=1)
    for y in range(0, HEIGHT, 32):
        draw.line([(0, y), (WIDTH, y)], fill=(16, 24, 36), width=1)

    # 2. Solis Coastline & Ocean Basin (West)
    ocean_pts = [(0, 0), (280, 0), (260, 120), (230, 260), (270, 390), (240, HEIGHT), (0, HEIGHT)]
    draw.polygon(ocean_pts, fill=(12, 35, 55))
    draw.line(ocean_pts[1:6], fill=(0, 200, 255), width=2) # Water line

    # Sandy Beach strip
    beach_pts = [(280, 0), (310, 0), (290, 120), (260, 260), (300, 390), (270, HEIGHT), (240, HEIGHT)]
    draw.polygon(beach_pts, fill=(35, 45, 50))

    # 3. Main Road Grid & Bridges
    roads = [
        # Ocean Blvd
        [(295, 0), (275, 120), (245, 260), (285, 390), (255, HEIGHT)],
        # Palm Ave
        [(420, 40), (420, HEIGHT - 40)],
        # Downtown Expressway
        [(580, 40), (580, HEIGHT - 40)],
        # Financial Strip
        [(740, 40), (740, HEIGHT - 40)],
        # East Arteries
        [(860, 80), (860, HEIGHT - 80)],

        # Cross streets
        [(270, 90), (900, 90)],
        [(255, 180), (900, 180)],
        [(240, 280), (900, 280)],
        [(275, 380), (900, 380)],
        [(260, 480), (900, 480)]
    ]
    for r in roads:
        draw.line(r, fill=(45, 60, 80), width=6)
        draw.line(r, fill=(75, 95, 120), width=2)

    # 4. Solis City 6 Marked Districts
    districts = [
        ("CORAL BEACH", 330, 130, (0, 229, 255), "Standing: 92% · Low Risk"),
        ("DOWNTOWN CORE", 630, 230, (255, 204, 0), "Standing: 85% · High Police Presence"),
        ("NEON STRIP", 500, 330, (255, 40, 120), "Standing: 78% · Nightlife / Syndicates"),
        ("PORT HORIZON", 800, 430, (0, 255, 140), "Standing: 64% · Contraband Docks"),
        ("PALM BAY", 480, 120, (180, 120, 255), "Standing: 88% · Residential Hills"),
        ("MARINA BAY", 340, 430, (255, 100, 50), "Standing: 70% · Yacht Basin")
    ]
    font_dist = get_font(15)
    font_sub = get_regular_font(11)

    for name, dx, dy, col, desc in districts:
        # Zone boundary circle
        draw.ellipse([dx - 55, dy - 35, dx + 55, dy + 35], outline=col, width=2)
        draw.text((dx - draw.textlength(name, font=font_dist)//2, dy - 10), name, fill=col, font=font_dist)
        draw.text((dx - draw.textlength(desc, font=font_sub)//2, dy + 10), desc, fill=(180, 190, 205), font=font_sub)

    # 5. GPS Navigation Route (Player -> Mission Target)
    route = [(280, 100), (280, 180), (420, 180), (580, 180), (580, 280), (630, 280)]
    draw.line(route, fill=(255, 170, 0), width=4)
    # Waypoint diamond
    wx, wy = 630, 280
    draw.polygon([(wx, wy - 10), (wx + 9, wy), (wx, wy + 10), (wx - 9, wy)], fill=(255, 210, 0))

    # Player position blip
    px, py = 280, 100
    draw.polygon([(px, py - 10), (px + 8, py + 8), (px, py + 4), (px - 8, py + 8)], fill=(0, 229, 255))

    # 6. Map UI Frames & Legend
    font_hdr = get_font(22)
    font_lbl = get_font(12)

    # Header Panel
    draw.rectangle([32, 24, 380, 68], fill=(12, 16, 26, 230), outline=(50, 70, 95))
    draw.text((46, 32), "SOLIS METROPOLITAN SATELLITE", fill=(255, 255, 255), font=font_hdr)
    draw.text((46, 56), "SECTOR: CORAL COAST · 6 DISTRICTS ACTIVE", fill=(0, 229, 255), font=font_lbl)

    # Legend Panel
    lx = WIDTH - 260
    ly = 24
    draw.rectangle([lx, ly, lx + 228, ly + 180], fill=(12, 16, 26, 230), outline=(50, 70, 95))
    draw.text((lx + 14, ly + 10), "MAP LEGEND", fill=(255, 255, 255), font=font_lbl)

    legends = [
        ((0, 229, 255), "Player Location"),
        ((255, 204, 0), "Active Objective"),
        ((255, 40, 60), "CPD Pursuit Unit"),
        ((0, 255, 140), "Safehouse / Garage"),
        ((180, 120, 255), "Weapons Depot")
    ]
    for i, (lcol, ltxt) in enumerate(legends):
        ey = ly + 36 + i * 26
        draw.ellipse([lx + 14, ey, lx + 26, ey + 12], fill=lcol)
        draw.text((lx + 36, ey - 2), ltxt, fill=(200, 215, 230), font=font_sub)

    out_path = os.path.join(SCREENSHOTS_DIR, '3-map.jpg')
    img.save(out_path, 'JPEG', quality=95)
    print(f"Generated {out_path}")

def generate_screenshot_4():
    """4-title.jpg: Cinematic Solis City vista at golden hour with AAA title logo & menu"""
    img = Image.new('RGB', (WIDTH, HEIGHT))
    draw = ImageDraw.Draw(img)

    # 1. Vibrant Sunset Sky Gradient
    for y in range(HEIGHT):
        t = y / HEIGHT
        if t < 0.45:
            # Deep purple to coral pink
            nt = t / 0.45
            r = int(45 + nt * 210)
            g = int(15 + nt * 75)
            b = int(75 + nt * 45)
        elif t < 0.72:
            # Coral pink to golden orange
            nt = (t - 0.45) / 0.27
            r = int(255)
            g = int(90 + nt * 105)
            b = int(120 - nt * 80)
        else:
            # Ocean water reflection
            nt = (t - 0.72) / 0.28
            r = int(18 + nt * 10)
            g = int(35 + nt * 15)
            b = int(60 + nt * 25)
        draw.line([(0, y), (WIDTH, y)], fill=(r, g, b))

    # Setting sun on water horizon
    draw.ellipse([430, 340, 590, 500], fill=(255, 240, 190))

    # Water wave shimmer lines
    for wy in range(415, HEIGHT, 6):
        w_alpha = int(180 * (1 - (wy - 415) / (HEIGHT - 415)))
        draw.line([(WIDTH//2 - 180, wy), (WIDTH//2 + 180, wy)], fill=(255, 200, 120), width=1)

    # 2. Silhouetted Skyscraper Skyline across the bay
    skyline = [
        (80, 180, 55, 235),
        (145, 140, 65, 275),
        (220, 110, 75, 305),
        (305, 160, 60, 255),
        (375, 210, 45, 205),
        (640, 190, 50, 225),
        (700, 130, 70, 285),
        (780, 95, 80, 320),  # Solis Central Spire
        (870, 150, 65, 265),
        (945, 200, 50, 215)
    ]
    for x, y, w, h in skyline:
        draw.rectangle([x, y, x + w, 415], fill=(18, 14, 28))
        # Spire antenna
        draw.line([(x + w//2, y - 25), (x + w//2, y)], fill=(18, 14, 28), width=2)
        # Random window lights
        for r in range(y + 10, 410, 10):
            for c in range(x + 6, x + w - 6, 8):
                if random.random() > 0.6:
                    draw.point((c, r), fill=(255, 225, 150))

    # Silhouetted Palm Trees on foreground coastal bluff
    for px in [40, 90, 890, 960]:
        base_y = HEIGHT - 20
        # Curved trunk
        draw.line([(px, base_y), (px + 10, base_y - 80), (px + 18, base_y - 150)], fill=(12, 10, 18), width=5)
        tx, ty = px + 18, base_y - 150
        for ang in range(0, 360, 40):
            rad = math.radians(ang)
            draw.line([(tx, ty), (int(tx + math.cos(rad) * 35), int(ty + math.sin(rad) * 20 + 8))], fill=(12, 10, 18), width=3)

    # 3. Supercar parked on coastal overlook (Veloce GTS Turbo silhouette with headlights)
    cx, cy = WIDTH // 2, HEIGHT - 55
    # Car Body
    draw.polygon([(cx - 75, cy + 15), (cx + 75, cy + 15), (cx + 65, cy - 8),
                  (cx + 25, cy - 25), (cx - 35, cy - 25), (cx - 70, cy - 5)], fill=(190, 15, 45))
    # Wheels
    draw.ellipse([cx - 55, cy + 4, cx - 35, cy + 24], fill=(10, 10, 15))
    draw.ellipse([cx + 35, cy + 4, cx + 55, cy + 24], fill=(10, 10, 15))
    # Headlight Beams
    draw.polygon([(cx + 68, cy - 4), (cx + 220, cy - 30), (cx + 220, cy + 20)], fill=(255, 255, 200, 60))

    # 4. AAA GTA 6 Style TITLE LOGO
    font_huge = get_font(58)
    font_title2 = get_font(26)
    font_stars = get_font(22)
    font_menu = get_font(15)

    title_y = 70
    t1 = "SOLIS CITY"
    t1_w = draw.textlength(t1, font=font_huge)
    # Glow drop shadow
    draw.text(((WIDTH - t1_w) // 2 + 3, title_y + 3), t1, fill=(255, 30, 80), font=font_huge)
    draw.text(((WIDTH - t1_w) // 2, title_y), t1, fill=(255, 255, 255), font=font_huge)

    t2 = "CORAL COAST"
    t2_w = draw.textlength(t2, font=font_title2)
    draw.text(((WIDTH - t2_w) // 2, title_y + 68), t2, fill=(0, 229, 255), font=font_title2)

    stars = "★  ★  ★  ★  ★"
    stars_w = draw.textlength(stars, font=font_stars)
    draw.text(((WIDTH - stars_w) // 2, title_y + 104), stars, fill=(255, 204, 0), font=font_stars)

    # 5. Interactive Menu Card
    menu_w = 280
    menu_h = 145
    mx = (WIDTH - menu_w) // 2
    my = 225
    draw.rectangle([mx, my, mx + menu_w, my + menu_h], fill=(10, 14, 22, 225), outline=(50, 70, 95))

    menu_items = [
        ("►  START GAME", (255, 59, 105), True),
        ("   STORY MISSIONS (8/8)", (220, 230, 245), False),
        ("   DISTRICT STANDINGS", (220, 230, 245), False),
        ("   CONTROLS & AUDIO", (220, 230, 245), False)
    ]
    for i, (item, col, is_sel) in enumerate(menu_items):
        iy = my + 14 + i * 32
        if is_sel:
            draw.rectangle([mx + 10, iy - 4, mx + menu_w - 10, iy + 22], fill=(255, 59, 105, 50))
        draw.text((mx + 20, iy), item, fill=col, font=font_menu)

    # Footer note
    footer = "MAKE.FUN BOUNTY gta6-01 · ORIGINAL 3D OPEN-WORLD ENGINE · ALL RIGHTS RESERVED"
    font_footer = get_regular_font(10)
    draw.text(((WIDTH - draw.textlength(footer, font=font_menu)) // 2, HEIGHT - 22), footer, fill=(130, 150, 175), font=font_footer)

    out_path = os.path.join(SCREENSHOTS_DIR, '4-title.jpg')
    img.save(out_path, 'JPEG', quality=95)
    print(f"Generated {out_path}")

if __name__ == '__main__':
    print("Generating Solis City: Coral Coast AAA Screenshots...")
    generate_screenshot_1()
    generate_screenshot_2()
    generate_screenshot_3()
    generate_screenshot_4()
    print("All 4 screenshots generated successfully!")
