import math
import random
from PIL import Image, ImageDraw, ImageFont

WIDTH, HEIGHT = 1024, 576

# Fonts
font_serif = "/usr/share/fonts/truetype/liberation/LiberationSerif-Bold.ttf"
font_sans = "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf"
font_sans_reg = "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf"

f_logo = ImageFont.truetype(font_sans, 44)
f_h1 = ImageFont.truetype(font_sans, 18)
f_h2 = ImageFont.truetype(font_sans, 14)
f_body = ImageFont.truetype(font_sans_reg, 12)
f_body_bold = ImageFont.truetype(font_sans, 12)
f_small = ImageFont.truetype(font_sans_reg, 10)
f_small_bold = ImageFont.truetype(font_sans, 10)
f_tiny = ImageFont.truetype(font_sans_reg, 9)
f_tiny_bold = ImageFont.truetype(font_sans, 9)
f_speedo = ImageFont.truetype(font_sans, 52)
f_cash = ImageFont.truetype(font_sans, 32)
f_star = ImageFont.truetype(font_sans, 22)

# ==========================================
# 3D MATHEMATICS & RENDERER ENGINE
# ==========================================
class Camera3D:
    def __init__(self, pos, target, fov=60, w=WIDTH, h=HEIGHT):
        self.pos = pos
        self.target = target
        self.w = w
        self.h = h
        self.fov_scale = (h / 2.0) / math.tan(math.radians(fov / 2.0))
        
        dx = target[0] - pos[0]
        dy = target[1] - pos[1]
        dz = target[2] - pos[2]
        dist = math.sqrt(dx*dx + dy*dy + dz*dz)
        self.fwd = (dx/dist, dy/dist, dz/dist)
        
        rx = self.fwd[2]
        ry = 0
        rz = -self.fwd[0]
        rdist = math.sqrt(rx*rx + rz*rz)
        if rdist < 0.0001:
            self.right = (1, 0, 0)
        else:
            self.right = (rx/rdist, 0, rz/rdist)
        
        self.up = (
            self.fwd[1]*self.right[2] - self.fwd[2]*self.right[1],
            self.fwd[2]*self.right[0] - self.fwd[0]*self.right[2],
            self.fwd[0]*self.right[1] - self.fwd[1]*self.right[0]
        )

    def project(self, p):
        tx = p[0] - self.pos[0]
        ty = p[1] - self.pos[1]
        tz = p[2] - self.pos[2]
        
        xc = tx * self.right[0] + ty * self.right[1] + tz * self.right[2]
        yc = tx * self.up[0] + ty * self.up[1] + tz * self.up[2]
        zc = tx * self.fwd[0] + ty * self.fwd[1] + tz * self.fwd[2]
        
        if zc <= 0.2:
            return None
            
        sx = int(self.w / 2 + (xc / zc) * self.fov_scale)
        sy = int(self.h / 2 - (yc / zc) * self.fov_scale)
        return (sx, sy, zc)

class Scene3D:
    def __init__(self, sun_dir=(0.4, 0.8, -0.5)):
        self.faces = []
        # Normalize sun direction
        d = math.sqrt(sum(x*x for x in sun_dir))
        self.sun_dir = (sun_dir[0]/d, sun_dir[1]/d, sun_dir[2]/d)

    def add_face(self, pts, base_color, outline=None, emissive=False):
        # Calculate normal
        v0, v1, v2 = pts[0], pts[1], pts[2]
        ax, ay, az = v1[0] - v0[0], v1[1] - v0[1], v1[2] - v0[2]
        bx, by, bz = v2[0] - v0[0], v2[1] - v0[1], v2[2] - v0[2]
        nx = ay * bz - az * by
        ny = az * bx - ax * bz
        nz = ax * by - ay * bx
        nl = math.sqrt(nx*nx + ny*ny + nz*nz)
        if nl > 0.0001:
            nx /= nl; ny /= nl; nz /= nl
        else:
            nx, ny, nz = 0, 1, 0

        # Shading
        if emissive:
            col = base_color
        else:
            dot = max(0.0, nx * self.sun_dir[0] + ny * self.sun_dir[1] + nz * self.sun_dir[2])
            intensity = 0.35 + 0.65 * dot
            col = (
                int(min(255, base_color[0] * intensity)),
                int(min(255, base_color[1] * intensity)),
                int(min(255, base_color[2] * intensity))
            )

        # Average centroid Z for depth sorting
        cz = sum(p[2] for p in pts) / len(pts)
        self.faces.append((cz, pts, col, outline))

    def add_box(self, cx, cy, cz, w, h, d, color, yaw=0, emissive=False):
        # 8 vertices local
        hw, hh, hd = w / 2, h / 2, d / 2
        cos_y, sin_y = math.cos(yaw), math.sin(yaw)
        
        def rot(x, y, z):
            rx = x * cos_y + z * sin_y
            rz = -x * sin_y + z * cos_y
            return (cx + rx, cy + y, cz + rz)

        v = [
            rot(-hw, -hh, -hd), rot(hw, -hh, -hd), rot(hw, hh, -hd), rot(-hw, hh, -hd), # 0, 1, 2, 3 (front/back)
            rot(-hw, -hh, hd), rot(hw, -hh, hd), rot(hw, hh, hd), rot(-hw, hh, hd)       # 4, 5, 6, 7
        ]

        # 6 faces: CCW winding
        self.add_face([v[0], v[1], v[2], v[3]], color, emissive=emissive) # front
        self.add_face([v[5], v[4], v[7], v[6]], color, emissive=emissive) # back
        self.add_face([v[3], v[2], v[6], v[7]], color, emissive=emissive) # top
        self.add_face([v[4], v[5], v[1], v[0]], color, emissive=emissive) # bottom
        self.add_face([v[4], v[0], v[3], v[7]], color, emissive=emissive) # left
        self.add_face([v[1], v[5], v[6], v[2]], color, emissive=emissive) # right

    def add_car(self, cx, cz, color, yaw=0, is_police=False):
        # 1. Lower chassis
        self.add_box(cx, 0.45, cz, 2.1, 0.5, 4.6, color, yaw)
        # 2. Slanted cabin
        cabin_col = (240, 240, 245) if is_police else (int(color[0]*0.8), int(color[1]*0.8), int(color[2]*0.8))
        self.add_box(cx, 0.95, cz - 0.2, 1.7, 0.45, 2.3, cabin_col, yaw)
        # 3. Windshield front & rear (glass)
        glass_col = (20, 35, 50)
        self.add_box(cx, 0.92, cz + 0.95, 1.55, 0.4, 0.1, glass_col, yaw)
        self.add_box(cx, 0.92, cz - 1.35, 1.55, 0.4, 0.1, glass_col, yaw)
        # 4. Wheels
        cos_y, sin_y = math.cos(yaw), math.sin(yaw)
        for wx_off, wz_off in [(-1.05, 1.4), (1.05, 1.4), (-1.05, -1.4), (1.05, -1.4)]:
            rx = wx_off * cos_y + wz_off * sin_y
            rz = -wx_off * sin_y + wz_off * cos_y
            self.add_box(cx + rx, 0.4, cz + rz, 0.35, 0.8, 0.8, (25, 25, 28), yaw)
        # 5. Spoiler / details
        if not is_police:
            self.add_box(cx, 1.05, cz - 2.1, 1.9, 0.08, 0.4, (20, 20, 25), yaw)
            # Glowing taillights
            self.add_box(cx - 0.65, 0.52, cz - 2.32, 0.5, 0.14, 0.08, (255, 20, 30), yaw)
            self.add_box(cx + 0.65, 0.52, cz - 2.32, 0.5, 0.14, 0.08, (255, 20, 30), yaw)
        else:
            # Police Roof Lightbar
            self.add_box(cx - 0.35, 1.35, cz - 0.2, 0.45, 0.14, 0.25, (255, 0, 30), yaw)
            self.add_box(cx + 0.35, 1.35, cz - 0.2, 0.45, 0.14, 0.25, (0, 100, 255), yaw)
            # Push bumper
            self.add_box(cx, 0.42, cz + 2.35, 1.9, 0.32, 0.2, (20, 20, 20), yaw)
            # Headlights
            self.add_box(cx - 0.7, 0.48, cz + 2.32, 0.35, 0.14, 0.08, (255, 240, 150), yaw)
            self.add_box(cx + 0.7, 0.48, cz + 2.32, 0.35, 0.14, 0.08, (255, 240, 150), yaw)

    def add_helicopter(self, cx, cy, cz, yaw=0):
        # Fuselage
        self.add_box(cx, cy, cz, 2.4, 2.2, 5.2, (25, 35, 50), yaw)
        # Cockpit nose
        self.add_box(cx, cy - 0.1, cz + 2.9, 2.0, 1.6, 1.8, (20, 45, 65), yaw)
        # Tail boom & fin
        self.add_box(cx, cy + 0.4, cz - 4.6, 0.5, 0.6, 5.5, (25, 35, 50), yaw)
        self.add_box(cx, cy + 1.2, cz - 7.2, 0.15, 1.8, 1.2, (240, 245, 250), yaw)
        # Skids
        self.add_box(cx - 1.2, cy - 1.3, cz, 0.12, 0.12, 5.5, (20, 20, 20), yaw)
        self.add_box(cx + 1.2, cy - 1.3, cz, 0.12, 0.12, 5.5, (20, 20, 20), yaw)
        # Rotor Hub & spinning blades
        self.add_box(cx, cy + 1.3, cz + 0.2, 0.35, 0.3, 0.35, (20, 20, 20), yaw)
        self.add_box(cx, cy + 1.45, cz + 0.2, 11.5, 0.05, 0.4, (50, 50, 55), yaw + 0.4)
        self.add_box(cx, cy + 1.45, cz + 0.2, 0.4, 0.05, 11.5, (50, 50, 55), yaw + 0.4)

    def add_palm_tree(self, cx, cz):
        # 5 curved trunk segments
        for i in range(5):
            self.add_box(cx + math.sin(i*0.2)*0.25, i*1.6 + 0.8, cz, 0.6 - i*0.06, 1.6, 0.6 - i*0.06, (95, 70, 45))
        # Fronds canopy
        top_y = 8.5
        for a in range(8):
            ang = a * math.pi / 4
            fx = cx + math.cos(ang) * 2.2
            fz = cz + math.sin(ang) * 2.2
            self.add_box(fx, top_y, fz, 1.4, 0.1, 1.4, (28, 125, 50))

    def render(self, cam, draw):
        # Sort faces by depth (Z distance from camera: farthest first)
        def face_dist(f):
            pts = f[1]
            return sum((p[0]-cam.pos[0])**2 + (p[1]-cam.pos[1])**2 + (p[2]-cam.pos[2])**2 for p in pts) / len(pts)

        sorted_faces = sorted(self.faces, key=face_dist, reverse=True)

        for cz, pts, col, outline in sorted_faces:
            proj = [cam.project(p) for p in pts]
            if all(p is not None for p in proj):
                poly_pts = [(p[0], p[1]) for p in proj]
                # Filter out crazy out-of-bounds or zero-area polygons
                xs = [p[0] for p in poly_pts]
                ys = [p[1] for p in poly_pts]
                if max(xs) - min(xs) > 1 and max(ys) - min(ys) > 1:
                    draw.polygon(poly_pts, fill=col, outline=outline)

# ==========================================
# 1. RENDER 3D COVER SHOT: THE COASTAL PURSUIT
# ==========================================
def render_3d_cover(out_path):
    im = Image.new("RGB", (WIDTH, HEIGHT), "#000000")
    draw = ImageDraw.Draw(im)

    # 1. Beautiful Skybox Gradient (Sunset over Solis Bay)
    for y in range(HEIGHT):
        t = y / HEIGHT
        if t < 0.42:
            r = int(45 + (235 - 45) * (t / 0.42))
            g = int(25 + (110 - 25) * (t / 0.42))
            b = int(95 + (50 - 95) * (t / 0.42))
        else:
            r = int(235 + (255 - 235) * ((t - 0.42) / 0.58))
            g = int(110 + (170 - 110) * ((t - 0.42) / 0.58))
            b = int(50 + (95 - 50) * ((t - 0.42) / 0.58))
        draw.line([(0, y), (WIDTH, y)], fill=(min(255, r), min(255, g), min(255, b)))

    # Sun glow on horizon
    draw.ellipse([512 - 90, 240 - 50, 512 + 90, 240 + 50], fill=(255, 235, 160))

    # 2. Camera Setup (Third-person follow behind supercar)
    cam = Camera3D(pos=(0, 4.4, -13.5), target=(0, 1.2, 5.0), fov=62)
    scene = Scene3D(sun_dir=(0.5, 0.75, -0.4))

    # 3. Ground / Road / Beach / Ocean 3D Planes (All strictly in front of camera z > -13.5)
    z_start = -11.0
    z_end = 260.0
    z_len = z_end - z_start
    z_mid = (z_start + z_end) / 2

    # Ocean Plane (Left)
    scene.add_box(-120, -0.4, z_mid, 180, 0.4, z_len, (14, 90, 140))
    # Sandy Beach
    scene.add_box(-22, -0.1, z_mid, 18, 0.2, z_len, (225, 185, 130))
    # Main Asphalt Boulevard
    scene.add_box(0, 0.02, z_mid, 24, 0.1, z_len, (35, 40, 48))
    # Yellow center line
    scene.add_box(0, 0.08, z_mid, 0.4, 0.04, z_len, (255, 204, 0), emissive=True)
    # White dashed lane lines
    scene.add_box(-5.5, 0.08, z_mid, 0.25, 0.04, z_len, (240, 240, 245), emissive=True)
    scene.add_box(5.5, 0.08, z_mid, 0.25, 0.04, z_len, (240, 240, 245), emissive=True)
    # Sidewalks
    scene.add_box(-13.5, 0.22, z_mid, 3.2, 0.35, z_len, (160, 168, 178))
    scene.add_box(13.5, 0.22, z_mid, 3.2, 0.35, z_len, (160, 168, 178))

    # Palm Trees along Left Promenade
    for pz in range(0, 220, 18):
        scene.add_palm_tree(-13.5, pz)

    # 3D City Buildings Grid on Right Side
    bldgs_data = [
        (22, 12, 10, 14, 24, 16, (225, 220, 210), (255, 0, 90)),
        (24, 18, 32, 16, 36, 18, (50, 70, 95), (0, 229, 255)),
        (23, 15, 58, 15, 30, 18, (195, 155, 115), (255, 170, 0)),
        (26, 24, 85, 18, 48, 20, (38, 50, 68), (120, 255, 0)),
        (25, 19, 115, 16, 38, 18, (210, 215, 225), (255, 0, 128)),
        (28, 28, 150, 18, 56, 22, (30, 40, 55), (0, 255, 200)),
        (26, 22, 190, 16, 44, 20, (180, 175, 165), (255, 100, 0)),
    ]
    for bx, by, bz, bw, bh, bd, col, neon in bldgs_data:
        scene.add_box(bx, by, bz, bw, bh, bd, col)
        # Windows strip decals on front
        for wy in range(4, int(bh) - 4, 6):
            scene.add_box(bx - bw/2 - 0.05, wy, bz, 0.1, 1.8, bd - 2, (255, 230, 140), emissive=True)
        # Rooftop neon sign
        scene.add_box(bx, bh + 1.2, bz, bw * 0.7, 2.2, 0.4, neon, emissive=True)

    # 4. POLICE HELICOPTER (CONDOR-1) Overhead
    scene.add_helicopter(0, 15.0, 32.0, yaw=0.05)

    # 5. POLICE CRUISERS in Pursuit (Behind / Flanking player)
    scene.add_car(-5.5, -4.5, (245, 245, 250), yaw=-0.08, is_police=True)
    scene.add_car(6.2, -3.0, (245, 245, 250), yaw=0.06, is_police=True)

    # 6. PLAYER SUPERCAR (Veloce GTS Turbo - Exotic Metallic Orange) - CENTER STAGE
    scene.add_car(0.0, 0.0, (245, 85, 10), yaw=0.0, is_police=False)

    # RENDER 3D GEOMETRY
    scene.render(cam, draw)

    # Spotlight Cone Overlay (from Helicopter to Road/Player)
    spot_poly = [(512, 120), (310, 480), (714, 480)]
    overlay = Image.new("RGBA", (WIDTH, HEIGHT), (0, 0, 0, 0))
    odraw = ImageDraw.Draw(overlay)
    odraw.polygon(spot_poly, fill=(255, 255, 210, 65))
    im.paste(Image.alpha_composite(im.convert("RGBA"), overlay).convert("RGB"))
    draw = ImageDraw.Draw(im)

    # ================= HUD OVERLAYS =================
    # Top-Left: Mission Box
    draw.rectangle([20, 20, 340, 115], fill="#0f172acc", outline="#f59e0b", width=1)
    draw.rectangle([20, 20, 25, 115], fill="#f59e0b")
    draw.text((34, 28), "ACT II · OPERATION OVERDRIVE", fill="#f59e0b", font=f_small_bold)
    draw.rectangle([34, 46, 105, 62], fill="#f59e0b")
    draw.text((38, 48), "STAGE 3/4", fill="#000000", font=f_tiny_bold)
    draw.text((114, 46), "WRECK THE REGENT", fill="#ffffff", font=f_h2)
    draw.text((34, 70), "Intercept Victor's convoy before it reaches\nthe Solis Marina Helipad.", fill="#cbd5e1", font=f_small)
    draw.text((34, 98), "NEXT: Vanish into Palm District", fill="#38bdf8", font=f_tiny_bold)

    # Left: CPD Tactical Dispatch Box
    draw.rectangle([20, 130, 290, 235], fill="#0f172acc", outline="#ef4444", width=1)
    draw.rectangle([20, 130, 24, 235], fill="#ef4444")
    draw.text((32, 136), "CPD TACTICAL DISPATCH", fill="#ef4444", font=f_tiny_bold)
    draw.text((235, 136), "6 UNITS", fill="#ffffff", font=f_tiny_bold)
    dispatch_items = [
        ("CONDOR-1 (AIR PATROL)", "SEARCHLIGHT", "#38bdf8"),
        ("PATROL-42 (INTERCEPTOR)", "RAMMING (14m)", "#ef4444"),
        ("PATROL-18 (PURSUIT)", "FLANKING (28m)", "#eab308"),
        ("ENFORCER-09 (ROADBLOCK)", "SPIKE STRIP AHEAD", "#ef4444")
    ]
    for idx, (call, act, act_col) in enumerate(dispatch_items):
        iy = 154 + idx * 19
        draw.text((34, iy), "● " + call, fill="#ffffff", font=f_tiny)
        draw.text((185, iy), act, fill=act_col, font=f_tiny_bold)

    # Bottom-Left: Radar Minimap
    rx, ry = 95, 475
    draw.ellipse([rx - 65, ry - 65, rx + 65, ry + 65], fill="#090d16", outline="#ffffff", width=2)
    draw.chord([rx - 63, ry - 63, rx + 63, ry + 63], 135, 270, fill="#0c4a6e") # Ocean
    draw.line([(rx - 55, ry + 15), (rx + 55, ry + 15)], fill="#334155", width=6)
    draw.line([(rx, ry - 55), (rx, ry + 55)], fill="#334155", width=4)
    # GPS Route
    draw.line([(rx, ry), (rx + 25, ry + 15), (rx + 25, ry - 30), (rx + 45, ry - 30)], fill="#a855f7", width=3)
    draw.ellipse([rx + 42, ry - 33, rx + 48, ry - 27], fill="#facc15") # Objective
    draw.ellipse([rx - 15, ry + 10, rx - 9, ry + 16], fill="#ef4444")
    draw.ellipse([rx + 15, ry + 18, rx + 21, ry + 24], fill="#ef4444")
    draw.polygon([(rx, ry - 6), (rx + 5, ry + 6), (rx, ry + 3), (rx - 5, ry + 6)], fill="#ffffff")

    # Vitals Bar (Under radar)
    draw.text((30, 548), "HEALTH 85", fill="#22c55e", font=f_tiny_bold)
    draw.rectangle([95, 550, 160, 557], fill="#1e293b")
    draw.rectangle([95, 550, 150, 557], fill="#22c55e")
    draw.text((30, 560), "ARMOUR 60", fill="#3b82f6", font=f_tiny_bold)
    draw.rectangle([95, 562, 160, 569], fill="#1e293b")
    draw.rectangle([95, 562, 134, 569], fill="#3b82f6")

    # Top-Right: Cash, Time, Wanted Stars
    draw.text((WIDTH - 110, 20), "17:45", fill="#cbd5e1", font=f_h2)
    draw.text((WIDTH - 165, 38), "$24,850", fill="#22c55e", font=f_cash)
    for s in range(5):
        scol = "#facc15" if s < 4 else "#475569"
        draw.text((WIDTH - 165 + s * 24, 76), "★", fill=scol, font=f_star)
    draw.rectangle([WIDTH - 230, 108, WIDTH - 45, 126], fill="#ef444433", outline="#ef4444", width=1)
    draw.text((WIDTH - 224, 112), "AIR UNIT & ROADBLOCKS", fill="#ef4444", font=f_tiny_bold)

    # Right: Weapon Strip
    weapons = [("1 FISTS", "∞"), ("2 .45 PISTOL", "12/48"), ("3 COMBAT SMG", "30/120"), ("4 12G SHOTGUN", "8/24")]
    for widx, (wname, wammo) in enumerate(weapons):
        wy = 145 + widx * 26
        is_act = (widx == 2)
        bg = "#f59e0b33" if is_act else "#0f172acc"
        bdr = "#f59e0b" if is_act else "#334155"
        draw.rectangle([WIDTH - 150, wy, WIDTH - 20, wy + 22], fill=bg, outline=bdr)
        draw.text((WIDTH - 142, wy + 5), wname, fill="#ffffff" if is_act else "#94a3b8", font=f_tiny_bold)
        draw.text((WIDTH - 55, wy + 5), wammo, fill="#38bdf8", font=f_tiny_bold)

    # Bottom-Center: Radio Comms Dialogue
    draw.rectangle([280, 508, 744, 562], fill="#0f172af0", outline="#38bdf8", width=1)
    draw.rectangle([280, 508, 284, 562], fill="#38bdf8")
    draw.ellipse([292, 514, 332, 554], fill="#0284c7")
    draw.text((306, 524), "L", fill="#ffffff", font=f_h2)
    draw.text((342, 516), "LUCIA · CREW OPERATIVE", fill="#38bdf8", font=f_tiny_bold)
    draw.text((342, 532), "\"Condor-1 is locking their searchlight on you! Cut through Marina alley!\"", fill="#f8fafc", font=f_small)

    # Bottom-Right: Speedometer & Vehicle Status
    draw.text((WIDTH - 145, 475), "124", fill="#ffffff", font=f_speedo)
    draw.text((WIDTH - 65, 515), "KM/H", fill="#94a3b8", font=f_small_bold)
    draw.text((WIDTH - 180, 534), "VELOCE GTS TURBO", fill="#ea580c", font=f_small_bold)
    draw.text((WIDTH - 205, 548), "♪ WAVE 104.2 — Miami Sunset Synth", fill="#38bdf8", font=f_tiny)

    im.save(out_path, "JPEG", quality=90, optimize=True)
    print(f"3D Cover screenshot saved at {out_path}! Size: {im.size}")

# ==========================================
# 2. RENDER 3D COMBAT SHOT: NIGHT MARKET SHOOTOUT
# ==========================================
def render_3d_combat(out_path):
    im = Image.new("RGB", (WIDTH, HEIGHT), "#060911")
    draw = ImageDraw.Draw(im)

    # Night Ambient Gradient
    for y in range(HEIGHT):
        t = y / HEIGHT
        r = int(8 + (35 - 8) * t)
        g = int(12 + (25 - 12) * t)
        b = int(28 + (60 - 28) * t)
        draw.line([(0, y), (WIDTH, y)], fill=(r, g, b))

    cam = Camera3D(pos=(0, 2.4, -6.5), target=(0, 1.2, 8.0), fov=65)
    scene = Scene3D(sun_dir=(-0.2, 0.9, 0.4))

    # Ground Pavement in front of camera (cam.z = -6.5)
    scene.add_box(0, -0.1, 18, 50, 0.2, 45, (60, 68, 80)) # concrete floor
    # Lane/dock yellow marking lines
    scene.add_box(-2.5, 0.02, 18, 0.3, 0.05, 45, (230, 180, 40), emissive=True)
    scene.add_box(2.5, 0.02, 18, 0.3, 0.05, 45, (230, 180, 40), emissive=True)

    # Shipping Containers & Market Stalls
    scene.add_box(-9.0, 1.8, 12.0, 3.2, 3.4, 8.0, (210, 45, 35)) # Red container
    scene.add_box(-8.5, 4.8, 14.0, 3.2, 3.0, 7.0, (35, 110, 215)) # Blue stacked container
    scene.add_box(9.5, 1.8, 15.0, 3.4, 3.4, 9.0, (30, 150, 65)) # Green container
    # Wooden crates for cover
    scene.add_box(-3.5, 0.7, 6.5, 1.4, 1.4, 1.4, (140, 105, 65))
    scene.add_box(4.0, 0.7, 9.0, 1.6, 1.4, 1.6, (130, 95, 55))

    # Hanging Japanese/Neon Lanterns
    for lz in [5.0, 11.0, 17.0, 23.0]:
        scene.add_box(-6.0, 4.5, lz, 0.6, 0.8, 0.6, (255, 60, 100), emissive=True)
        scene.add_box(6.0, 4.5, lz, 0.6, 0.8, 0.6, (255, 200, 50), emissive=True)

    # Syndicate Gunmen in Distance
    scene.add_box(4.2, 1.4, 11.5, 0.7, 1.8, 0.5, (40, 50, 65))
    scene.add_box(-1.8, 1.4, 18.0, 0.7, 1.8, 0.5, (40, 50, 65))
    # Downed enemy on floor
    scene.add_box(2.5, 0.2, 7.0, 1.6, 0.35, 0.8, (30, 40, 55))

    # Player Character (Foreground Back-View)
    scene.add_box(0.0, 1.1, 0.0, 0.75, 0.9, 0.45, (170, 25, 30)) # Crimson jacket
    scene.add_box(0.0, 1.8, 0.0, 0.4, 0.45, 0.4, (220, 165, 130)) # Head
    scene.add_box(0.0, 2.05, -0.02, 0.44, 0.22, 0.42, (30, 20, 15)) # Hair
    scene.add_box(-0.2, 0.4, 0.0, 0.28, 0.8, 0.3, (30, 40, 60)) # Leg L
    scene.add_box(0.2, 0.4, 0.0, 0.28, 0.8, 0.3, (30, 40, 60)) # Leg R
    # Gun in hands
    scene.add_box(0.4, 1.15, 0.45, 0.18, 0.25, 0.7, (20, 20, 25), emissive=True)

    # RENDER 3D COMBAT
    scene.render(cam, draw)

    # Dynamic Muzzle Flash & Tracer Fire
    px, py = 570, 390
    draw.ellipse([px - 14, py - 14, px + 14, py + 14], fill=(255, 245, 180))
    for a in range(8):
        ang = a * math.pi / 4
        draw.line([(px, py), (px + int(math.cos(ang)*22), py + int(math.sin(ang)*22))], fill="#f59e0b", width=3)
    # Tracer line streaking toward target
    draw.line([(px + 10, py - 4), (680, 290)], fill="#fbbf24", width=3)
    draw.line([(px + 12, py - 2), (690, 296)], fill="#f97316", width=2)
    # Enemy laser sight red line
    draw.line([(680, 290), (px - 60, py + 15)], fill="#ef4444", width=1)

    # Combat HUD
    draw.rectangle([20, 20, 340, 100], fill="#0f172acc", outline="#f59e0b")
    draw.text((32, 28), "ACT II · MISSION 3", fill="#f59e0b", font=f_tiny_bold)
    draw.text((32, 44), "STAGE 2/3 · CLEAR THE AISLES", fill="#ffffff", font=f_h2)
    draw.text((32, 68), "Eliminate Kerono syndicate guards: 4 / 6 cleared", fill="#cbd5e1", font=f_small)

    # Crosshair
    draw.ellipse([675 - 12, 290 - 12, 675 + 12, 290 + 12], outline="#ef4444", width=2)
    draw.point((675, 290), fill="#ef4444")

    # Bottom status
    draw.text((30, HEIGHT - 65), "HEALTH: 92   ARMOUR: 45", fill="#22c55e", font=f_h2)
    draw.text((WIDTH - 190, HEIGHT - 65), "COMBAT SMG", fill="#f59e0b", font=f_h2)
    draw.text((WIDTH - 190, HEIGHT - 42), "24 / 90 ROUNDS", fill="#38bdf8", font=f_small_bold)

    im.save(out_path, "JPEG", quality=90, optimize=True)
    print(f"3D Combat screenshot saved at {out_path}! Size: {im.size}")

# ==========================================
# 3. RENDER SCREENSHOT 3: PAUSE MENU & CITY MAP
# ==========================================
def render_3d_map(out_path):
    im = Image.new("RGB", (WIDTH, HEIGHT), "#0a0f18")
    draw = ImageDraw.Draw(im)

    # Top Menu Navigation Bar
    draw.rectangle([0, 0, WIDTH, 50], fill="#0f172a")
    draw.text((30, 14), "SOLIS CITY: CORAL COAST", fill="#f59e0b", font=f_h1)
    tabs = ["MAP & GPS", "MISSIONS", "CRIMINAL RECORD", "GARAGE", "SETTINGS"]
    for tidx, tname in enumerate(tabs):
        tx = 340 + tidx * 120
        is_act = (tidx == 0)
        draw.text((tx, 18), tname, fill="#ffffff" if is_act else "#64748b", font=f_small_bold)
        if is_act:
            draw.line([(tx, 42), (tx + 70, 42)], fill="#f59e0b", width=3)
    draw.text((WIDTH - 120, 14), "$24,850", fill="#22c55e", font=f_h1)

    # Left: Stylized District Map of Solis City
    map_x, map_y, map_w, map_h = 30, 70, 620, 480
    draw.rectangle([map_x, map_y, map_x + map_w, map_y + map_h], fill="#090d16", outline="#334155")
    draw.rectangle([map_x, map_y, map_x + 120, map_y + map_h], fill="#032541")
    draw.text((map_x + 25, map_y + 200), "CORAL SEA", fill="#0284c7", font=f_h2)

    # 6 Color-Coded Districts
    districts = [
        ("CORAL STRAND", map_x + 120, map_y + 40, 160, 180, "#1e3a8a", "FRIENDLY 85%"),
        ("MARINA DEL SUR", map_x + 120, map_y + 230, 160, 210, "#065f46", "FRIENDLY 78%"),
        ("DOWNTOWN SOLIS", map_x + 290, map_y + 40, 180, 220, "#7c2d12", "HOSTILE 24%"),
        ("PALM DISTRICT", map_x + 290, map_y + 270, 180, 170, "#14532d", "NEUTRAL 58%"),
        ("OLD PORT", map_x + 480, map_y + 40, 130, 190, "#831843", "HOSTILE 18%"),
        ("INDUSTRIAL DOCKS", map_x + 480, map_y + 240, 130, 200, "#334155", "NEUTRAL 50%"),
    ]
    for dname, dx, dy, dw, dh, dcol, dstatus in districts:
        draw.rectangle([dx, dy, dx + dw, dy + dh], fill=dcol + "66", outline="#ffffff44", width=1)
        draw.text((dx + 8, dy + 10), dname, fill="#ffffff", font=f_tiny_bold)
        draw.text((dx + 8, dy + 24), dstatus, fill="#facc15", font=f_tiny)

    for sx in range(map_x + 140, map_x + map_w - 20, 60):
        draw.line([(sx, map_y + 20), (sx, map_y + map_h - 20)], fill="#475569", width=2)
    for sy in range(map_y + 50, map_y + map_h - 20, 50):
        draw.line([(map_x + 120, sy), (map_x + map_w - 20, sy)], fill="#475569", width=2)

    # GPS Route
    draw.line([(map_x + 180, map_y + 120), (map_x + 360, map_y + 120), (map_x + 360, map_y + 320)], fill="#a855f7", width=4)
    draw.ellipse([map_x + 354, map_y + 314, map_x + 366, map_y + 326], fill="#eab308")

    icons = [
        ("S", map_x + 180, map_y + 120, "#22c55e", "Safehouse"),
        ("A", map_x + 320, map_y + 80, "#ef4444", "Ammu-Nation"),
        ("H", map_x + 420, map_y + 150, "#3b82f6", "Hospital"),
        ("R", map_x + 220, map_y + 360, "#f59e0b", "Street Race")
    ]
    for symb, ix, iy, icol, ilab in icons:
        draw.ellipse([ix - 10, iy - 10, ix + 10, iy + 10], fill=icol)
        draw.text((ix - 4, iy - 6), symb, fill="#ffffff", font=f_small_bold)

    # Right: Career & Progression Dashboard
    px, py = 670, 70
    draw.rectangle([px, py, WIDTH - 30, py + 220], fill="#0f172a", outline="#334155")
    draw.text((px + 20, py + 16), "68.4% COMPLETE", fill="#f59e0b", font=f_h1)
    stats_list = [
        "Story Missions Cleared: 6 / 8",
        "Street Races Won: 4 / 6",
        "Stunt Jumps Nailed: 7 / 10",
        "Safehouses Acquired: 3 / 4",
        "Police Pursuits Evaded: 22",
        "Top Speed Reached: 168 km/h"
    ]
    for sidx, stext in enumerate(stats_list):
        draw.text((px + 20, py + 52 + sidx * 26), "✓ " + stext, fill="#e2e8f0", font=f_small)

    # Save Slots Box
    draw.rectangle([px, py + 235, WIDTH - 30, map_y + map_h], fill="#0f172a", outline="#334155")
    draw.text((px + 20, py + 248), "SAVE GAME SLOTS", fill="#ffffff", font=f_h2)
    draw.text((px + 20, py + 276), "Slot 1: ACT II - WRECK THE REGENT (17:45)", fill="#38bdf8", font=f_small_bold)
    draw.text((px + 20, py + 296), "Slot 2: ACT I - NEON ALLEY RUN (09:20)", fill="#94a3b8", font=f_small)
    draw.text((px + 20, py + 316), "Slot 3: [ EMPTY ]", fill="#64748b", font=f_small)

    im.save(out_path, "JPEG", quality=90, optimize=True)
    print(f"3D Map screenshot saved at {out_path}! Size: {im.size}")

# ==========================================
# 4. RENDER 3D TITLE SCREEN: CINEMATIC PANORAMA
# ==========================================
def render_3d_title(out_path):
    im = Image.new("RGB", (WIDTH, HEIGHT), "#050811")
    draw = ImageDraw.Draw(im)

    # Aerial Sunset Sky
    for y in range(HEIGHT):
        t = y / HEIGHT
        r = int(28 + (235 - 28) * t)
        g = int(18 + (120 - 18) * t)
        b = int(55 + (60 - 55) * t)
        draw.line([(0, y), (WIDTH, y)], fill=(r, g, b))

    # High panoramic camera overlooking city
    cam = Camera3D(pos=(0, 45, -110), target=(0, 10, 40), fov=65)
    scene = Scene3D(sun_dir=(0.4, 0.8, -0.5))

    # Ground & Ocean
    scene.add_box(0, -0.5, 40, 260, 0.5, 200, (25, 30, 40))
    scene.add_box(-120, -0.6, 40, 100, 0.5, 200, (10, 60, 95)) # Ocean

    # Coastal ground, beach, ocean
    scene.add_box(15, -0.5, 30, 180, 0.5, 220, (38, 44, 56)) # city bedrock
    scene.add_box(-60, -0.4, 30, 24, 0.4, 220, (215, 180, 130)) # sandy beach
    scene.add_box(-120, -0.6, 30, 96, 0.4, 220, (15, 75, 120)) # coral sea

    # Coastal Boulevard (Asphalt)
    scene.add_box(-40, -0.3, 30, 16, 0.35, 220, (28, 32, 40))
    # Streetlights & Palm Trees along boulevard
    for pz in range(-80, 120, 18):
        scene.add_palm_tree(-49, pz)
        # Streetlamp post
        scene.add_box(-31, 5.0, pz, 0.4, 10.0, 0.4, (80, 85, 95))
        scene.add_box(-32, 10.0, pz, 1.8, 0.5, 1.0, (255, 230, 140), emissive=True)

    # 3D City Skyscrapers Skyline with illuminated windows
    for bx in range(-20, 80, 20):
        for bz in range(-60, 100, 26):
            bh = 25 + abs(math.sin(bx * 0.3 + bz * 0.2)) * 45
            bcol = (int(30 + (bx+20)*0.7), int(36 + (bz+60)*0.4), int(55 + (bx+20)*0.5))
            scene.add_box(bx, bh / 2, bz, 14, bh, 18, bcol)
            # Add lit window decals on front face
            if bh > 30:
                for wy in range(8, int(bh) - 4, 7):
                    for wx_off in [-4.5, 0.0, 4.5]:
                        wcol = (255, 220, 120) if (int(bx + bz + wy) % 3 == 0) else (140, 220, 255)
                        scene.add_box(bx + wx_off, wy, bz - 9.1, 2.5, 3.0, 0.2, wcol, emissive=True)
            # Rooftop neon signs and helipads
            if bh > 45:
                scene.add_box(bx, bh + 1.5, bz, 6, 2.2, 6, (255, 50, 120), emissive=True)
                scene.add_box(bx, bh + 3.0, bz, 2, 1.2, 2, (0, 229, 255), emissive=True)

    # RENDER 3D TITLE SCENE
    scene.render(cam, draw)

    # Big Neon Game Title
    draw.text((60, 80), "SOLIS CITY", fill="#ff5500", font=f_logo)
    draw.text((60, 138), "CORAL COAST", fill="#00e5ff", font=f_h1)

    # Main Menu Options
    menu_items = ["CONTINUE", "NEW GAME", "LOAD MISSION", "SETTINGS", "CREDITS"]
    for midx, mtext in enumerate(menu_items):
        my = 220 + midx * 38
        is_sel = (midx == 0)
        col = "#f59e0b" if is_sel else "#ffffff"
        draw.text((60, my), ("> " if is_sel else "  ") + mtext, fill=col, font=f_h2)

    # Save preview card on right
    draw.rectangle([WIDTH - 360, 160, WIDTH - 60, 360], fill="#0f172acc", outline="#f59e0b", width=2)
    draw.text((WIDTH - 340, 180), "ACTIVE PROFILE: MARCO", fill="#f59e0b", font=f_h2)
    draw.text((WIDTH - 340, 215), "Operation: Wreck The Regent", fill="#ffffff", font=f_small_bold)
    draw.text((WIDTH - 340, 240), "Location: Coral Strand Boulevard", fill="#94a3b8", font=f_small)
    draw.text((WIDTH - 340, 265), "Cash: $24,850 · Wanted: 4 Stars", fill="#22c55e", font=f_small_bold)
    draw.text((WIDTH - 340, 290), "Playtime: 14h 22m · 68.4% Done", fill="#cbd5e1", font=f_small)

    im.save(out_path, "JPEG", quality=90, optimize=True)
    print(f"3D Title screenshot saved at {out_path}! Size: {im.size}")

if __name__ == "__main__":
    import os
    shots_dir = "/root/my-agent-workspace/gta6-bot/screenshots"
    os.makedirs(shots_dir, exist_ok=True)
    render_3d_cover(os.path.join(shots_dir, "1-chase.jpg"))
    render_3d_combat(os.path.join(shots_dir, "2-combat.jpg"))
    render_3d_map(os.path.join(shots_dir, "3-map.jpg"))
    render_3d_title(os.path.join(shots_dir, "4-title.jpg"))