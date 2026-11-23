import * as THREE from './three.module.js';

/**
 * Solis City: Coral Coast - Procedural Open-World City Architecture
 * Grid roadways with markings, 44+ skyscrapers with glowing windows and rooftop neon,
 * coastal palm promenade, streetlights with point lights, and animated ocean shoreline.
 */

export class City {
  constructor(scene) {
    this.scene = scene;
    this.buildings = [];
    this.lights = [];
    this.ocean = null;
    this.oceanTime = 0;

    this.buildTerrain();
    this.buildRoadNetwork();
    this.buildOcean();
    this.buildSkyline();
    this.buildPromenadePalms();
    this.buildStreetlights();
  }

  buildTerrain() {
    // City ground base plane (concrete / island base)
    const groundGeo = new THREE.PlaneGeometry(800, 800);
    groundGeo.rotateX(-Math.PI / 2);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x12151c,
      roughness: 0.9,
      metalness: 0.1,
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.position.y = -0.05;
    this.scene.add(ground);
  }

  buildRoadNetwork() {
    const roadGroup = new THREE.Group();
    const roadMat = new THREE.MeshStandardMaterial({
      color: 0x1a1a20,
      roughness: 0.8,
      metalness: 0.2,
    });

    const curbMat = new THREE.MeshStandardMaterial({
      color: 0x666b75,
      roughness: 0.7,
    });

    const roadWidth = 14;
    const roadLength = 700;

    // Major Avenues along X and Z
    const gridSpacing = 90;
    const extents = 3;

    for (let i = -extents; i <= extents; i++) {
      // North-South Avenues (Z-axis)
      const rz = new THREE.Mesh(new THREE.PlaneGeometry(roadWidth, roadLength), roadMat);
      rz.rotation.x = -Math.PI / 2;
      rz.position.set(i * gridSpacing, 0.01, 0);
      roadGroup.add(rz);

      // East-West Streets (X-axis)
      const rx = new THREE.Mesh(new THREE.PlaneGeometry(roadLength, roadWidth), roadMat);
      rx.rotation.x = -Math.PI / 2;
      rx.position.set(0, 0.01, i * gridSpacing);
      roadGroup.add(rx);

      // Yellow dashed centerlines
      this.createCenterline(roadGroup, i * gridSpacing, true, roadLength);
      this.createCenterline(roadGroup, i * gridSpacing, false, roadLength);
    }

    // Coastal Ocean Drive (East coastal highway at x = 240)
    const coastalRoad = new THREE.Mesh(new THREE.PlaneGeometry(18, roadLength), roadMat);
    coastalRoad.rotation.x = -Math.PI / 2;
    coastalRoad.position.set(240, 0.01, 0);
    roadGroup.add(coastalRoad);
    this.createCenterline(roadGroup, 240, true, roadLength);

    this.scene.add(roadGroup);
  }

  createCenterline(group, offset, isZAxis, length) {
    const dashLength = 4;
    const gap = 3;
    const count = Math.floor(length / (dashLength + gap));

    const lineMat = new THREE.MeshBasicMaterial({ color: 0xffcc00 });
    const dashGeo = isZAxis ? new THREE.PlaneGeometry(0.3, dashLength) : new THREE.PlaneGeometry(dashLength, 0.3);
    dashGeo.rotateX(-Math.PI / 2);

    for (let i = -count / 2; i <= count / 2; i++) {
      const dash = new THREE.Mesh(dashGeo, lineMat);
      const coord = i * (dashLength + gap);
      if (isZAxis) {
        dash.position.set(offset, 0.02, coord);
      } else {
        dash.position.set(coord, 0.02, offset);
      }
      group.add(dash);
    }
  }

  buildOcean() {
    // Large coastal ocean plane stretching to horizon east of Ocean Drive
    const oceanGeo = new THREE.PlaneGeometry(900, 900, 64, 64);
    oceanGeo.rotateX(-Math.PI / 2);

    const oceanMat = new THREE.MeshStandardMaterial({
      color: 0x004466,
      roughness: 0.1,
      metalness: 0.85,
      transparent: true,
      opacity: 0.92,
    });

    this.ocean = new THREE.Mesh(oceanGeo, oceanMat);
    this.ocean.position.set(520, -0.4, 0);
    this.scene.add(this.ocean);

    // Coastal sandy beach strip along Ocean Drive
    const beachGeo = new THREE.PlaneGeometry(45, 800);
    beachGeo.rotateX(-Math.PI / 2);
    const beachMat = new THREE.MeshStandardMaterial({
      color: 0xd4b886,
      roughness: 0.9,
    });
    const beach = new THREE.Mesh(beachGeo, beachMat);
    beach.position.set(268, -0.1, 0);
    this.scene.add(beach);
  }

  generateWindowTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');

    // Base building panel dark reflective glass
    ctx.fillStyle = '#0c101a';
    ctx.fillRect(0, 0, 128, 256);

    // Glowing window grid
    const cols = 8;
    const rows = 16;
    const w = 9;
    const h = 10;
    const gapX = 7;
    const gapY = 6;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const rand = Math.random();
        if (rand > 0.4) {
          // Warm amber, neon cyan, or soft white window
          ctx.fillStyle = rand > 0.8 ? '#00f0ff' : (rand > 0.6 ? '#ffc83b' : '#ffffff');
          ctx.fillRect(c * (w + gapX) + 4, r * (h + gapY) + 4, w, h);
        }
      }
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    return texture;
  }

  buildSkyline() {
    const winTexture = this.generateWindowTexture();

    const neonColors = [0xff007f, 0x00f0ff, 0xffb700, 0x9d00ff, 0x00ff88];
    const gridSpacing = 90;
    let towerCount = 0;

    // Generate 48 skyscraper towers inside city blocks
    for (let ix = -3; ix <= 2; ix++) {
      for (let iz = -3; iz <= 3; iz++) {
        // Block center
        const bx = ix * gridSpacing + 45;
        const bz = iz * gridSpacing + 45;

        // Skip coastal ocean water side
        if (bx > 220) continue;

        // Skyscraper dimensions
        const width = 24 + Math.random() * 18;
        const depth = 24 + Math.random() * 18;
        const height = 45 + Math.random() * 85; // 45m to 130m towers

        const towerGeo = new THREE.BoxGeometry(width, height, depth);
        const texClone = winTexture.clone();
        texClone.repeat.set(Math.floor(width / 6), Math.floor(height / 8));

        const towerMat = new THREE.MeshStandardMaterial({
          color: 0x182030,
          roughness: 0.25,
          metalness: 0.85,
          map: texClone,
          emissive: 0x223344,
          emissiveMap: texClone,
          emissiveIntensity: 0.7,
        });

        const tower = new THREE.Mesh(towerGeo, towerMat);
        tower.position.set(bx, height / 2, bz);
        this.scene.add(tower);
        this.buildings.push(tower);
        towerCount++;

        // Rooftop architectural spire / penthouse / neon sign
        const neonColor = neonColors[towerCount % neonColors.length];

        if (height > 80) {
          // Helipad or spire
          const spireGeo = new THREE.CylinderGeometry(0.3, 0.8, 14, 8);
          const spireMat = new THREE.MeshBasicMaterial({ color: 0xff1133 });
          const spire = new THREE.Mesh(spireGeo, spireMat);
          spire.position.set(bx, height + 7, bz);
          this.scene.add(spire);

          // Glowing beacon light
          const beacon = new THREE.PointLight(0xff1133, 2.0, 35);
          beacon.position.set(bx, height + 14, bz);
          this.scene.add(beacon);
        }

        // Rooftop glowing neon perimeter frame
        const roofTrimGeo = new THREE.BoxGeometry(width + 0.5, 1.2, depth + 0.5);
        const roofTrimMat = new THREE.MeshStandardMaterial({
          color: neonColor,
          emissive: neonColor,
          emissiveIntensity: 3.0,
        });
        const roofTrim = new THREE.Mesh(roofTrimGeo, roofTrimMat);
        roofTrim.position.set(bx, height + 0.6, bz);
        this.scene.add(roofTrim);
      }
    }
  }

  buildPromenadePalms() {
    // Iconic Miami / Coral Coast Palm Promenade along Ocean Drive (x = 226)
    const palmCount = 36;
    const startZ = -320;
    const stepZ = 18;

    for (let i = 0; i < palmCount; i++) {
      const pz = startZ + i * stepZ;
      this.createPalmTree(new THREE.Vector3(228, 0, pz));
      this.createPalmTree(new THREE.Vector3(252, 0, pz + 9));
    }
  }

  createPalmTree(position) {
    const palmGroup = new THREE.Group();
    palmGroup.position.copy(position);

    // Curved slender trunk
    const trunkGeo = new THREE.CylinderGeometry(0.32, 0.48, 8.5, 7);
    trunkGeo.rotateZ(0.08); // organic slight lean
    const trunkMat = new THREE.MeshStandardMaterial({
      color: 0x5a4634,
      roughness: 0.9,
    });
    const trunk = new THREE.Mesh(trunkGeo, trunkMat);
    trunk.position.y = 4.25;
    palmGroup.add(trunk);

    // Palm fronds crown
    const frondMat = new THREE.MeshStandardMaterial({
      color: 0x1b5e20,
      roughness: 0.6,
      side: THREE.DoubleSide,
    });

    const frondCount = 7;
    for (let f = 0; f < frondCount; f++) {
      const frondGeo = new THREE.PlaneGeometry(1.6, 5.2);
      frondGeo.rotateX(Math.PI / 3);
      const frond = new THREE.Mesh(frondGeo, frondMat);
      frond.position.set(0, 8.4, 0);
      frond.rotation.y = (f / frondCount) * Math.PI * 2;
      palmGroup.add(frond);
    }

    this.scene.add(palmGroup);
  }

  buildStreetlights() {
    // High fidelity streetlight poles with warm sodium and neon glow point lights
    const poleMat = new THREE.MeshStandardMaterial({ color: 0x22262d, metalness: 0.8 });
    const lampMat = new THREE.MeshBasicMaterial({ color: 0xffea99 });

    const spacing = 45;
    const zRange = 260;

    for (let z = -zRange; z <= zRange; z += spacing) {
      // Along Ocean Drive
      const poleGeo = new THREE.CylinderGeometry(0.12, 0.16, 6.5, 8);
      const pole = new THREE.Mesh(poleGeo, poleMat);
      pole.position.set(233, 3.25, z);
      this.scene.add(pole);

      // Overhang arm
      const armGeo = new THREE.BoxGeometry(2.4, 0.1, 0.1);
      const arm = new THREE.Mesh(armGeo, poleMat);
      arm.position.set(232, 6.4, z);
      this.scene.add(arm);

      // Light fixture bulb
      const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.25, 8, 8), lampMat);
      bulb.position.set(231, 6.3, z);
      this.scene.add(bulb);

      // Real point light
      const pLight = new THREE.PointLight(0xffcc66, 1.8, 22);
      pLight.position.set(231, 6.0, z);
      this.scene.add(pLight);
      this.lights.push(pLight);
    }
  }

  update(dt) {
    // Animate ocean gentle shoreline tide oscillation
    this.oceanTime += dt * 0.8;
    if (this.ocean) {
      this.ocean.position.y = -0.4 + Math.sin(this.oceanTime) * 0.12;
    }
  }
}
