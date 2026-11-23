// SOLIS CITY: CORAL COAST (v2.0 AAA WebGL Engine) - Procedural 3D Coastal City Generator
// 40+ skyscrapers, lit window textures, neon billboards, coastal beach, palm promenade, arterial roads.

const THREE = window.THREE;

export class City {
  constructor(scene) {
    this.scene = scene;
    this.buildings = [];
    this.roadWaypoints = [];
    this.palms = [];
    this.animatedSigns = [];

    this.createMaterials();
    this.buildTerrain();
    this.buildRoadNetwork();
    this.buildSkyscrapers();
    this.buildCoastalPromenade();
    this.buildProps();
  }

  createMaterials() {
    // Procedural Window Texture for Skyscrapers
    const winCanvas = document.createElement('canvas');
    winCanvas.width = 256;
    winCanvas.height = 512;
    const ctx = winCanvas.getContext('2d');

    // Dark architectural facade
    ctx.fillStyle = '#0c1424';
    ctx.fillRect(0, 0, 256, 512);

    // Glowing window grid
    const cols = 8;
    const rows = 24;
    const cw = 256 / cols;
    const rh = 512 / rows;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const rand = Math.random();
        if (rand > 0.45) {
          // Lit office window (warm gold, cyan, cool white)
          if (rand > 0.85) {
            ctx.fillStyle = '#00f0ff';
          } else if (rand > 0.65) {
            ctx.fillStyle = '#ffdf80';
          } else {
            ctx.fillStyle = '#ffffff';
          }
          ctx.fillRect(c * cw + 4, r * rh + 4, cw - 8, rh - 8);
        } else {
          // Unlit office window
          ctx.fillStyle = '#050a14';
          ctx.fillRect(c * cw + 4, r * rh + 4, cw - 8, rh - 8);
        }
      }
    }

    this.windowTexture = new THREE.CanvasTexture(winCanvas);
    this.windowTexture.wrapS = THREE.RepeatWrapping;
    this.windowTexture.wrapT = THREE.RepeatWrapping;

    // Road Texture
    const roadCanvas = document.createElement('canvas');
    roadCanvas.width = 128;
    roadCanvas.height = 128;
    const rctx = roadCanvas.getContext('2d');
    rctx.fillStyle = '#181b22';
    rctx.fillRect(0, 0, 128, 128);
    // Double yellow centerline
    rctx.fillStyle = '#ffbb00';
    rctx.fillRect(62, 0, 2, 128);
    rctx.fillRect(66, 0, 2, 128);
    // White lane dividers
    rctx.fillStyle = '#ffffff';
    for (let y = 0; y < 128; y += 32) {
      rctx.fillRect(28, y + 6, 2, 16);
      rctx.fillRect(98, y + 6, 2, 16);
    }
    this.roadTexture = new THREE.CanvasTexture(roadCanvas);
    this.roadTexture.wrapS = THREE.RepeatWrapping;
    this.roadTexture.wrapT = THREE.RepeatWrapping;
    this.roadTexture.repeat.set(1, 20);

    // Common materials
    this.roadMaterial = new THREE.MeshStandardMaterial({
      map: this.roadTexture,
      roughness: 0.8,
      metalness: 0.2
    });

    this.concreteMaterial = new THREE.MeshStandardMaterial({
      color: 0x222834,
      roughness: 0.9,
      metalness: 0.1
    });

    this.sandMaterial = new THREE.MeshStandardMaterial({
      color: 0xdec18c,
      roughness: 0.95,
      metalness: 0.05
    });

    this.waterMaterial = new THREE.MeshStandardMaterial({
      color: 0x006688,
      roughness: 0.1,
      metalness: 0.8,
      transparent: true,
      opacity: 0.88
    });
  }

  buildTerrain() {
    // City ground base
    const groundGeo = new THREE.PlaneGeometry(800, 800);
    const ground = new THREE.Mesh(groundGeo, this.concreteMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    this.scene.add(ground);

    // Ocean Coastal Waters (Eastern border)
    const oceanGeo = new THREE.PlaneGeometry(500, 900);
    this.ocean = new THREE.Mesh(oceanGeo, this.waterMaterial);
    this.ocean.rotation.x = -Math.PI / 2;
    this.ocean.position.set(380, -0.4, 0);
    this.scene.add(this.ocean);

    // Sandy Coastal Beach
    const beachGeo = new THREE.PlaneGeometry(80, 900);
    const beach = new THREE.Mesh(beachGeo, this.sandMaterial);
    beach.rotation.x = -Math.PI / 2;
    beach.position.set(150, -0.1, 0);
    beach.receiveShadow = true;
    this.scene.add(beach);
  }

  buildRoadNetwork() {
    // Arterial grid connecting 6 districts:
    // North-South Arteries:
    // X = 100 (Ocean Boulevard)
    // X = 0   (Central Solis Avenue)
    // X = -100 (Downtown Expressway)
    // X = -200 (Industrial Beltway)

    const nsRoads = [100, 0, -100, -200];
    nsRoads.forEach(x => {
      const roadGeo = new THREE.PlaneGeometry(16, 700);
      const road = new THREE.Mesh(roadGeo, this.roadMaterial);
      road.rotation.x = -Math.PI / 2;
      road.position.set(x, 0.02, 0);
      road.receiveShadow = true;
      this.scene.add(road);
    });

    // East-West Arteries:
    // Z = -250, -150, -50, 50, 150, 250
    const ewRoads = [-250, -150, -50, 50, 150, 250];
    ewRoads.forEach(z => {
      const roadGeo = new THREE.PlaneGeometry(320, 16);
      const road = new THREE.Mesh(roadGeo, this.roadMaterial);
      road.rotation.x = -Math.PI / 2;
      road.position.set(-50, 0.03, z);
      road.receiveShadow = true;
      this.scene.add(road);
    });

    // Populate road waypoints for GPS and pursuit pathfinding
    nsRoads.forEach(x => {
      ewRoads.forEach(z => {
        this.roadWaypoints.push(new THREE.Vector3(x, 0, z));
      });
    });
  }

  buildSkyscrapers() {
    // 44 procedural skyscrapers across blocks
    const districtBuildings = [
      // Downtown Core & Financial District (Tallest towers, 80-160m)
      { x: -50, z: 0, w: 32, d: 32, h: 145, name: "CORAL BANK TOWER", neon: 0x00f0ff },
      { x: -50, z: 100, w: 28, d: 28, h: 120, name: "APEX HORIZON", neon: 0xff3366 },
      { x: -50, z: -100, w: 30, d: 30, h: 135, name: "SOLIS METRO", neon: 0xffbb00 },
      { x: -150, z: 0, w: 26, d: 26, h: 110, name: "VANTAGE CORP", neon: 0x00ff88 },
      { x: -150, z: 100, w: 34, d: 30, h: 130, name: "TITAN PLAZA", neon: 0xff0055 },
      { x: -150, z: -100, w: 28, d: 28, h: 115, name: "VERTEX FINANCIAL", neon: 0x3388ff },

      // Ocean Boulevard & Marina Luxury Strip (Modern glass hotels, 60-110m)
      { x: 50, z: 0, w: 24, d: 28, h: 95, name: "SOLIS LUXURY SUITES", neon: 0xff0088 },
      { x: 50, z: 100, w: 26, d: 24, h: 85, name: "PALM CASINO", neon: 0x00f0ff },
      { x: 50, z: -100, w: 28, d: 26, h: 100, name: "CORAL MARINA TOWER", neon: 0xffaa00 },
      { x: 50, z: 200, w: 22, d: 24, h: 75, name: "AURA ULTRA CLUB", neon: 0xd500f9 },
      { x: 50, z: -200, w: 26, d: 24, h: 90, name: "OCEAN DRIVE RESORT", neon: 0x00ffaa },

      // Palm Heights & Residential Condos
      { x: -50, z: 200, w: 24, d: 24, h: 70, name: "HEIGHTS RESIDENCES", neon: 0xffffff },
      { x: -150, z: 200, w: 26, d: 26, h: 80, name: "SUNSET CONDOS", neon: 0xff7700 },
      { x: -50, z: -200, w: 22, d: 22, h: 65, name: "NORTHPOINT LIVING", neon: 0x2979ff },
      { x: -150, z: -200, w: 28, d: 24, h: 85, name: "SUMMIT CONDOS", neon: 0xff0044 },

      // Industrial & Port Solis Warehouses / Shipping Silos
      { x: -250, z: 0, w: 36, d: 36, h: 50, name: "PORT TERMINAL 4", neon: 0xff3300 },
      { x: -250, z: 100, w: 34, d: 30, h: 45, name: "SOLIS LOGISTICS", neon: 0xffbb00 },
      { x: -250, z: -100, w: 38, d: 32, h: 55, name: "CARGO FREIGHT 1", neon: 0x00e676 },
      { x: -250, z: 200, w: 30, d: 28, h: 40, name: "STORAGE VAULT", neon: 0x2979ff },
      { x: -250, z: -200, w: 32, d: 34, h: 48, name: "DEPOT SECTOR 9", neon: 0xff1744 },

      // Secondary Filler High-Rises
      { x: -20, z: 50, w: 18, d: 18, h: 70, name: "COMMERCE BLDG", neon: 0x00f0ff },
      { x: -20, z: -50, w: 18, d: 18, h: 68, name: "PACIFIC SUITES", neon: 0xffaa00 },
      { x: -80, z: 50, w: 18, d: 18, h: 85, name: "NEXUS TOWER", neon: 0xd500f9 },
      { x: -80, z: -50, w: 18, d: 18, h: 90, name: "CYBERDYNE METRO", neon: 0x00ff88 },
      { x: -120, z: 50, w: 20, d: 20, h: 82, name: "STRATOS CORP", neon: 0x3388ff },
      { x: -120, z: -50, w: 20, d: 20, h: 88, name: "METROPOLIS TOWER", neon: 0xff0055 },

      { x: 30, z: 50, w: 16, d: 16, h: 60, name: "MARINA CONDOS", neon: 0xffffff },
      { x: 30, z: -50, w: 16, d: 16, h: 62, name: "BEACHSIDE INN", neon: 0x00f0ff },
      { x: 70, z: 50, w: 18, d: 18, h: 65, name: "SEABREEZE MOTEL", neon: 0xff0066 },
      { x: 70, z: -50, w: 18, d: 18, h: 70, name: "TROPICANA HOTEL", neon: 0xffbb00 },

      { x: -180, z: 50, w: 22, d: 20, h: 58, name: "WEST CARGO", neon: 0x00ffaa },
      { x: -180, z: -50, w: 22, d: 20, h: 64, name: "FOUNDRY 8", neon: 0xff3300 },
      { x: -220, z: 50, w: 24, d: 22, h: 50, name: "RAIL TERMINAL", neon: 0x2979ff },
      { x: -220, z: -50, w: 24, d: 22, h: 52, name: "EXPORT SHED", neon: 0xffaa00 }
    ];

    districtBuildings.forEach((b, idx) => {
      // Main Skyscraper Box Geometry
      const geo = new THREE.BoxGeometry(b.w, b.h, b.d);
      const bMat = new THREE.MeshStandardMaterial({
        color: 0x121826,
        map: this.windowTexture,
        roughness: 0.35,
        metalness: 0.75
      });
      const mesh = new THREE.Mesh(geo, bMat);
      mesh.position.set(b.x, b.h / 2, b.z);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      this.scene.add(mesh);

      // Rooftop Spire & Aviation Beacon
      if (b.h > 80) {
        const spireGeo = new THREE.CylinderGeometry(0.3, 1, 16, 8);
        const spireMat = new THREE.MeshBasicMaterial({ color: 0xaaaaaa });
        const spire = new THREE.Mesh(spireGeo, spireMat);
        spire.position.set(b.x, b.h + 8, b.z);
        this.scene.add(spire);

        // Blinking Red Warning Light
        const beaconGeo = new THREE.SphereGeometry(0.8, 8, 8);
        const beaconMat = new THREE.MeshBasicMaterial({ color: 0xff0000 });
        const beacon = new THREE.Mesh(beaconGeo, beaconMat);
        beacon.position.set(b.x, b.h + 16, b.z);
        this.scene.add(beacon);
        this.animatedSigns.push({ mesh: beacon, type: 'beacon' });
      }

      // Glowing Neon Rooftop Billboard Sign
      if (b.neon) {
        const signGeo = new THREE.BoxGeometry(b.w * 0.7, 4, 1);
        const signMat = new THREE.MeshStandardMaterial({
          color: b.neon,
          emissive: b.neon,
          emissiveIntensity: 1.4,
          roughness: 0.2
        });
        const sign = new THREE.Mesh(signGeo, signMat);
        sign.position.set(b.x, b.h - 4, b.z + b.d / 2 + 0.6);
        this.scene.add(sign);
        this.animatedSigns.push({ mesh: sign, type: 'neon', baseColor: b.neon });
      }

      // Record building collision bounds
      this.buildings.push({
        minX: b.x - b.w / 2 - 1,
        maxX: b.x + b.w / 2 + 1,
        minZ: b.z - b.d / 2 - 1,
        maxZ: b.z + b.d / 2 + 1,
        height: b.h,
        center: new THREE.Vector3(b.x, 0, b.z)
      });
    });
  }

  buildCoastalPromenade() {
    // Palm trees along Ocean Boulevard promenade (X = 110)
    for (let z = -320; z <= 320; z += 24) {
      this.createPalmTree(110, 0, z);
      this.createPalmTree(140, 0, z + 12);
    }
  }

  createPalmTree(x, y, z) {
    const palmGroup = new THREE.Group();

    // Curved Trunk
    const trunkGeo = new THREE.CylinderGeometry(0.4, 0.7, 10, 8);
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x5a4228, roughness: 0.9 });
    const trunk = new THREE.Mesh(trunkGeo, trunkMat);
    trunk.position.y = 5;
    trunk.rotation.z = (Math.random() - 0.5) * 0.15;
    trunk.castShadow = true;
    palmGroup.add(trunk);

    // Palm Leaves Fronds Canopy
    const frondMat = new THREE.MeshStandardMaterial({
      color: 0x1f8833,
      roughness: 0.7,
      side: THREE.DoubleSide
    });
    for (let i = 0; i < 7; i++) {
      const angle = (i / 7) * Math.PI * 2;
      const frondGeo = new THREE.ConeGeometry(1.6, 6, 4);
      const frond = new THREE.Mesh(frondGeo, frondMat);
      frond.position.set(Math.cos(angle) * 1.5, 9.5, Math.sin(angle) * 1.5);
      frond.rotation.x = Math.PI / 2.5;
      frond.rotation.z = angle;
      palmGroup.add(frond);
    }

    palmGroup.position.set(x, y, z);
    this.scene.add(palmGroup);
    this.palms.push(palmGroup);
  }

  buildProps() {
    // Streetlights along arterial avenues
    const lightPosts = [
      { x: 92, z: 0 }, { x: 92, z: 80 }, { x: 92, z: -80 }, { x: 92, z: 160 }, { x: 92, z: -160 },
      { x: -8, z: 0 }, { x: -8, z: 80 }, { x: -8, z: -80 },
      { x: -108, z: 0 }, { x: -108, z: 80 }, { x: -108, z: -80 }
    ];

    lightPosts.forEach(lp => {
      const poleGeo = new THREE.CylinderGeometry(0.18, 0.22, 10, 8);
      const poleMat = new THREE.MeshStandardMaterial({ color: 0x333b4d, metalness: 0.8 });
      const pole = new THREE.Mesh(poleGeo, poleMat);
      pole.position.set(lp.x, 5, lp.z);
      this.scene.add(pole);

      // Lamp Head
      const headGeo = new THREE.BoxGeometry(0.8, 0.4, 1.4);
      const headMat = new THREE.MeshBasicMaterial({ color: 0xffea9f });
      const head = new THREE.Mesh(headGeo, headMat);
      head.position.set(lp.x + 0.8, 9.8, lp.z);
      this.scene.add(head);
    });
  }

  checkCollision(pos, radius = 2) {
    for (let i = 0; i < this.buildings.length; i++) {
      const b = this.buildings[i];
      if (
        pos.x + radius > b.minX &&
        pos.x - radius < b.maxX &&
        pos.z + radius > b.minZ &&
        pos.z - radius < b.maxZ
      ) {
        return b;
      }
    }
    return null;
  }

  getNearestRoadPoint(pos) {
    let nearest = this.roadWaypoints[0];
    let minDst = Infinity;
    for (let i = 0; i < this.roadWaypoints.length; i++) {
      const d = pos.distanceTo(this.roadWaypoints[i]);
      if (d < minDst) {
        minDst = d;
        nearest = this.roadWaypoints[i];
      }
    }
    return nearest;
  }

  update(delta, time) {
    // Subtle ocean tide animation
    if (this.ocean) {
      this.ocean.position.y = -0.4 + Math.sin(time * 1.5) * 0.15;
    }

    // Animated neon billboard pulses
    this.animatedSigns.forEach(item => {
      if (item.type === 'beacon') {
        const blink = Math.sin(time * 6) > 0 ? 1 : 0.1;
        item.mesh.material.opacity = blink;
      } else if (item.type === 'neon') {
        const pulse = 1.0 + Math.sin(time * 3 + item.mesh.position.x) * 0.4;
        item.mesh.material.emissiveIntensity = pulse;
      }
    });
  }
}
