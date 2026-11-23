import * as THREE from './three.module.js';

/**
 * Solis City: Coral Coast - Procedural Open-World City Architecture (v6.2 Top 3 Finalist Polish)
 */

export class City {
  constructor(scene) {
    this.scene = scene;
    this.buildings = [];
    this.lights = [];
    this.ocean = null;
    this.oceanTime = 0;
    this.props = [];

    this.buildTerrain();
    this.buildRoadNetwork();
    this.buildOcean();
    this.buildBeachPromenade();
    this.buildArtDecoHotels();
    this.buildDowntownPlaza();
    this.buildSkyline();
    this.buildPromenadePalms();
    this.buildPedestrians();
    this.buildStreetlights();
  }

  buildTerrain() {
    const groundGeo = new THREE.PlaneGeometry(800, 800);
    groundGeo.rotateX(-Math.PI / 2);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x1e2430,
      roughness: 0.85,
      metalness: 0.1,
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.position.y = -0.05;
    this.scene.add(ground);
  }

  buildRoadNetwork() {
    const roadGroup = new THREE.Group();
    const roadMat = new THREE.MeshStandardMaterial({
      color: 0x272c38,
      roughness: 0.8,
      metalness: 0.15,
    });

    const roadWidth = 14;
    const roadLength = 700;
    const gridSpacing = 90;
    const extents = 3;

    for (let i = -extents; i <= extents; i++) {
      const rz = new THREE.Mesh(new THREE.PlaneGeometry(roadWidth, roadLength), roadMat);
      rz.rotation.x = -Math.PI / 2;
      rz.position.set(i * gridSpacing, 0.01, 0);
      roadGroup.add(rz);

      const rx = new THREE.Mesh(new THREE.PlaneGeometry(roadLength, roadWidth), roadMat);
      rx.rotation.x = -Math.PI / 2;
      rx.position.set(0, 0.01, i * gridSpacing);
      roadGroup.add(rx);

      this.createCenterline(roadGroup, i * gridSpacing, true, roadLength);
      this.createCenterline(roadGroup, i * gridSpacing, false, roadLength);
    }

    const coastalRoad = new THREE.Mesh(new THREE.PlaneGeometry(18, roadLength), roadMat);
    coastalRoad.rotation.x = -Math.PI / 2;
    coastalRoad.position.set(240, 0.01, 0);
    roadGroup.add(coastalRoad);
    this.createCenterline(roadGroup, 240, true, roadLength);

    this.createWhiteDashes(roadGroup, 236, roadLength);
    this.createWhiteDashes(roadGroup, 244, roadLength);

    this.scene.add(roadGroup);
  }

  createCenterline(group, offset, isZAxis, length) {
    const dashLength = 4.5;
    const gap = 3;
    const count = Math.floor(length / (dashLength + gap));

    const lineMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b });
    const dashGeo = isZAxis ? new THREE.PlaneGeometry(0.22, dashLength) : new THREE.PlaneGeometry(dashLength, 0.22);
    dashGeo.rotateX(-Math.PI / 2);

    for (let i = -count / 2; i <= count / 2; i++) {
      const coord = i * (dashLength + gap);
      const dash1 = new THREE.Mesh(dashGeo, lineMat);
      const dash2 = new THREE.Mesh(dashGeo, lineMat);
      if (isZAxis) {
        dash1.position.set(offset - 0.2, 0.02, coord);
        dash2.position.set(offset + 0.2, 0.02, coord);
      } else {
        dash1.position.set(coord, 0.02, offset - 0.2);
        dash2.position.set(coord, 0.02, offset + 0.2);
      }
      group.add(dash1, dash2);
    }
  }

  createWhiteDashes(group, xOffset, length) {
    const dashLength = 3;
    const gap = 5;
    const count = Math.floor(length / (dashLength + gap));
    const lineMat = new THREE.MeshBasicMaterial({ color: 0xcfd8e3 });
    const dashGeo = new THREE.PlaneGeometry(0.2, dashLength);
    dashGeo.rotateX(-Math.PI / 2);

    for (let i = -count / 2; i <= count / 2; i++) {
      const dash = new THREE.Mesh(dashGeo, lineMat);
      dash.position.set(xOffset, 0.02, i * (dashLength + gap));
      group.add(dash);
    }
  }

  buildOcean() {
    const oceanGeo = new THREE.PlaneGeometry(900, 900, 32, 32);
    oceanGeo.rotateX(-Math.PI / 2);

    const oceanMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      roughness: 0.15,
      metalness: 0.8,
      transparent: true,
      opacity: 0.94,
    });

    this.ocean = new THREE.Mesh(oceanGeo, oceanMat);
    this.ocean.position.set(530, -0.3, 0);
    this.scene.add(this.ocean);

    const beachGeo = new THREE.PlaneGeometry(55, 800);
    beachGeo.rotateX(-Math.PI / 2);
    const beachMat = new THREE.MeshStandardMaterial({
      color: 0xd97706,
      roughness: 0.95,
      metalness: 0.05,
    });
    const beach = new THREE.Mesh(beachGeo, beachMat);
    beach.position.set(276, -0.05, 0);
    this.scene.add(beach);
  }

  buildBeachPromenade() {
    const promGroup = new THREE.Group();

    const walkGeo = new THREE.PlaneGeometry(5, 800);
    walkGeo.rotateX(-Math.PI / 2);
    const walkMat = new THREE.MeshStandardMaterial({
      color: 0x94a3b8,
      roughness: 0.6,
    });
    const walk = new THREE.Mesh(walkGeo, walkMat);
    walk.position.set(250, 0.05, 0);
    promGroup.add(walk);

    const curbGeo = new THREE.BoxGeometry(0.4, 0.2, 800);
    const curbMat = new THREE.MeshStandardMaterial({ color: 0x64748b });
    const curb = new THREE.Mesh(curbGeo, curbMat);
    curb.position.set(247.5, 0.1, 0);
    promGroup.add(curb);

    const umbrellaColors = [0xdb2777, 0x0284c7, 0xeab308, 0xe11d48, 0x7c3aed, 0x059669];
    const poleMat = new THREE.MeshStandardMaterial({ color: 0xa1a1aa });
    const poleGeo = new THREE.CylinderGeometry(0.06, 0.06, 2.8, 8);

    for (let z = -200; z <= 200; z += 15) {
      const uGroup = new THREE.Group();
      const uColor = umbrellaColors[Math.abs(Math.floor(z / 15)) % umbrellaColors.length];
      const ux = 258 + (Math.abs(z * 7) % 15);

      const pole = new THREE.Mesh(poleGeo, poleMat);
      pole.position.set(0, 1.4, 0);
      uGroup.add(pole);

      const coneGeo = new THREE.ConeGeometry(1.6, 0.6, 12);
      const coneMat = new THREE.MeshStandardMaterial({
        color: uColor,
        roughness: 0.5,
        side: THREE.DoubleSide,
      });
      const cone = new THREE.Mesh(coneGeo, coneMat);
      cone.position.set(0, 2.7, 0);
      uGroup.add(cone);

      const chairGeo = new THREE.BoxGeometry(0.7, 0.3, 1.6);
      const chairMat = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.4 });
      const chair = new THREE.Mesh(chairGeo, chairMat);
      chair.position.set(0.9, 0.15, 0.3);
      uGroup.add(chair);

      uGroup.position.set(ux, 0, z);
      promGroup.add(uGroup);
    }

    this.scene.add(promGroup);
  }

  buildArtDecoHotels() {
    const hotelGroup = new THREE.Group();
    const hotelThemes = [
      { color: 0xf472b6, trim: 0x06b6d4, name: 'HOTEL DELANO', signColor: 0x00f0ff },
      { color: 0x34d399, trim: 0xf43f5e, name: 'OCEAN ROYALE', signColor: 0xff007f },
      { color: 0xfde047, trim: 0x3b82f6, name: 'CORAL CLUB', signColor: 0xffaa00 },
      { color: 0x38bdf8, trim: 0xf97316, name: 'CAFE TROPICO', signColor: 0x00ff88 },
      { color: 0xfb7185, trim: 0x8b5cf6, name: 'VICE LOUNGE', signColor: 0xff00ea },
    ];

    const hotelLength = 30;
    const startZ = -220;
    const count = 14;

    for (let i = 0; i < count; i++) {
      const theme = hotelThemes[i % hotelThemes.length];
      const hz = startZ + i * (hotelLength + 6);
      const hGroup = new THREE.Group();

      const height = 18 + (i % 3) * 6;
      const width = 14;
      const depth = hotelLength;

      const facadeGeo = new THREE.BoxGeometry(width, height, depth);
      const facadeMat = new THREE.MeshStandardMaterial({
        color: theme.color,
        roughness: 0.65,
      });
      const facade = new THREE.Mesh(facadeGeo, facadeMat);
      facade.position.set(0, height / 2, 0);
      hGroup.add(facade);

      const crownGeo = new THREE.BoxGeometry(width - 2, 3.0, depth - 4);
      const crownMat = new THREE.MeshStandardMaterial({ color: theme.trim, roughness: 0.4 });
      const crown = new THREE.Mesh(crownGeo, crownMat);
      crown.position.set(0, height + 1.5, 0);
      hGroup.add(crown);

      const awningGeo = new THREE.BoxGeometry(3.0, 0.35, depth - 2);
      awningGeo.rotateZ(0.2);
      const awningMat = new THREE.MeshStandardMaterial({ color: theme.trim, roughness: 0.5 });
      const awning = new THREE.Mesh(awningGeo, awningMat);
      awning.position.set(width / 2 + 1.2, 4.0, 0);
      hGroup.add(awning);

      const signGeo = new THREE.BoxGeometry(0.2, 1.8, 12);
      const signMat = new THREE.MeshStandardMaterial({
        color: theme.signColor,
        emissive: theme.signColor,
        emissiveIntensity: 2.8,
      });
      const sign = new THREE.Mesh(signGeo, signMat);
      sign.position.set(width / 2 + 0.15, height - 3, 0);
      hGroup.add(sign);

      const entranceLight = new THREE.PointLight(theme.signColor, 1.6, 16);
      entranceLight.position.set(width / 2 + 2, 4.2, 0);
      hGroup.add(entranceLight);

      hGroup.position.set(220, 0, hz);
      hotelGroup.add(hGroup);
      this.buildings.push(facade);
    }

    this.scene.add(hotelGroup);
  }

  buildDowntownPlaza() {
    const plazaGroup = new THREE.Group();

    const tileGeo = new THREE.PlaneGeometry(60, 60);
    tileGeo.rotateX(-Math.PI / 2);
    const tileMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.8,
      metalness: 0.1,
    });
    const tileMesh = new THREE.Mesh(tileGeo, tileMat);
    tileMesh.position.set(45, 0.02, 45);
    plazaGroup.add(tileMesh);

    const bankWallGeo = new THREE.BoxGeometry(40, 22, 4);
    const bankWallMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.4 });
    const bankWall = new THREE.Mesh(bankWallGeo, bankWallMat);
    bankWall.position.set(45, 11, 68);
    plazaGroup.add(bankWall);

    const signGeo = new THREE.BoxGeometry(24, 2.2, 0.3);
    const signMat = new THREE.MeshStandardMaterial({
      color: 0x00f0ff,
      emissive: 0x00f0ff,
      emissiveIntensity: 3.5,
    });
    const sign = new THREE.Mesh(signGeo, signMat);
    sign.position.set(45, 18, 65.8);
    plazaGroup.add(sign);

    const planterGeo = new THREE.BoxGeometry(4, 0.8, 12);
    const planterMat = new THREE.MeshStandardMaterial({ color: 0x475569 });
    const planter1 = new THREE.Mesh(planterGeo, planterMat);
    planter1.position.set(36, 0.4, 48);
    const planter2 = new THREE.Mesh(planterGeo, planterMat);
    planter2.position.set(54, 0.4, 48);
    plazaGroup.add(planter1, planter2);

    const shrubGeo = new THREE.BoxGeometry(3.6, 1.2, 11.6);
    const shrubMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.8 });
    const shrub1 = new THREE.Mesh(shrubGeo, shrubMat);
    shrub1.position.set(36, 1.2, 48);
    const shrub2 = new THREE.Mesh(shrubGeo, shrubMat);
    shrub2.position.set(54, 1.2, 48);
    plazaGroup.add(shrub1, shrub2);

    this.scene.add(plazaGroup);
  }

  buildSkyline() {
    const winTexture = this.generateWindowTexture();
    const neonColors = [0xff007f, 0x00f0ff, 0xffb700, 0x9d00ff, 0x00ff88];
    const gridSpacing = 90;
    let towerCount = 0;

    for (let ix = -3; ix <= 2; ix++) {
      for (let iz = -3; iz <= 3; iz++) {
        const bx = ix * gridSpacing + 45;
        const bz = iz * gridSpacing + 45;

        if (bx > 200) continue;

        const width = 24 + Math.random() * 18;
        const depth = 24 + Math.random() * 18;
        const height = 45 + Math.random() * 85;

        const towerGeo = new THREE.BoxGeometry(width, height, depth);
        const texClone = winTexture.clone();
        texClone.repeat.set(Math.floor(width / 6), Math.floor(height / 8));

        const towerMat = new THREE.MeshStandardMaterial({
          color: 0x1e293b,
          roughness: 0.3,
          metalness: 0.8,
          map: texClone,
          emissive: 0x334155,
          emissiveMap: texClone,
          emissiveIntensity: 1.2,
        });

        const tower = new THREE.Mesh(towerGeo, towerMat);
        tower.position.set(bx, height / 2, bz);
        this.scene.add(tower);
        this.buildings.push(tower);
        towerCount++;

        const neonColor = neonColors[towerCount % neonColors.length];

        if (height > 80) {
          const spireGeo = new THREE.CylinderGeometry(0.3, 0.8, 14, 8);
          const spireMat = new THREE.MeshBasicMaterial({ color: 0xff1133 });
          const spire = new THREE.Mesh(spireGeo, spireMat);
          spire.position.set(bx, height + 7, bz);
          this.scene.add(spire);

          const beacon = new THREE.PointLight(0xff1133, 1.8, 30);
          beacon.position.set(bx, height + 14, bz);
          this.scene.add(beacon);
        }

        const roofTrimGeo = new THREE.BoxGeometry(width + 0.5, 1.2, depth + 0.5);
        const roofTrimMat = new THREE.MeshStandardMaterial({
          color: neonColor,
          emissive: neonColor,
          emissiveIntensity: 3.5,
        });
        const roofTrim = new THREE.Mesh(roofTrimGeo, roofTrimMat);
        roofTrim.position.set(bx, height + 0.6, bz);
        this.scene.add(roofTrim);
      }
    }
  }

  generateWindowTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, 128, 256);

    const cols = 8;
    const rows = 16;
    const w = 9;
    const h = 10;
    const gapX = 7;
    const gapY = 6;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const rand = Math.random();
        if (rand > 0.3) {
          ctx.fillStyle = rand > 0.8 ? '#00f0ff' : (rand > 0.5 ? '#fcd34d' : '#fef08a');
          ctx.fillRect(c * (w + gapX) + 4, r * (h + gapY) + 4, w, h);
        }
      }
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    return texture;
  }

  buildPromenadePalms() {
    const palmCount = 38;
    const startZ = -320;
    const stepZ = 17;

    for (let i = 0; i < palmCount; i++) {
      const pz = startZ + i * stepZ;
      this.createPalmTree(new THREE.Vector3(230, 0, pz));
      this.createPalmTree(new THREE.Vector3(249, 0, pz + 8.5));
    }
  }

  createPalmTree(position) {
    const palmGroup = new THREE.Group();
    palmGroup.position.copy(position);

    const trunkGeo = new THREE.CylinderGeometry(0.32, 0.48, 8.5, 8);
    trunkGeo.rotateZ(0.08);
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x5a3e2b, roughness: 0.9 });
    const trunk = new THREE.Mesh(trunkGeo, trunkMat);
    trunk.position.y = 4.25;
    palmGroup.add(trunk);

    const frondMat = new THREE.MeshStandardMaterial({
      color: 0x16a34a,
      roughness: 0.5,
      side: THREE.DoubleSide,
    });

    const frondCount = 8;
    for (let f = 0; f < frondCount; f++) {
      const frondGeo = new THREE.PlaneGeometry(1.4, 4.8);
      frondGeo.rotateX(Math.PI / 3.4);
      const frond = new THREE.Mesh(frondGeo, frondMat);
      frond.position.set(0, 8.2, 0);
      frond.rotation.y = (f / frondCount) * Math.PI * 2;
      palmGroup.add(frond);
    }

    this.scene.add(palmGroup);
  }

  buildPedestrians() {
    const pedGroup = new THREE.Group();
    const shirtColors = [0xef4444, 0x3b82f6, 0x10b981, 0xf59e0b, 0xec4899, 0xffffff, 0x8b5cf6];
    const skinMat = new THREE.MeshStandardMaterial({ color: 0xe0a986, roughness: 0.7 });

    for (let i = -12; i <= 12; i++) {
      const p = new THREE.Group();
      const sColor = shirtColors[Math.abs(i * 3) % shirtColors.length];
      const torsoMat = new THREE.MeshStandardMaterial({ color: sColor, roughness: 0.6 });
      const pantsMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.7 });

      const torso = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.7, 0.3), torsoMat);
      torso.position.y = 1.15;
      p.add(torso);

      const head = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.35, 0.3), skinMat);
      head.position.y = 1.7;
      p.add(head);

      const legL = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.7, 0.22), pantsMat);
      legL.position.set(-0.13, 0.4, 0);
      const legR = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.7, 0.22), pantsMat);
      legR.position.set(0.13, 0.4, 0);
      p.add(legL, legR);

      const isBeach = i % 2 === 0;
      const px = isBeach ? (260 + (i % 4) * 2.5) : 250.2;
      const pz = i * 16 + (Math.sin(i) * 5);
      p.position.set(px, isBeach ? 0.05 : 0.1, pz);
      p.rotation.y = Math.sin(i) * Math.PI;

      pedGroup.add(p);
    }

    this.scene.add(pedGroup);
  }

  buildStreetlights() {
    const poleMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8 });
    const lampMat = new THREE.MeshBasicMaterial({ color: 0xfef08a });
    const spacing = 45;
    const zRange = 260;

    for (let z = -zRange; z <= zRange; z += spacing) {
      const poleGeo = new THREE.CylinderGeometry(0.12, 0.16, 6.5, 8);
      const pole = new THREE.Mesh(poleGeo, poleMat);
      pole.position.set(232, 3.25, z);
      this.scene.add(pole);

      const armGeo = new THREE.BoxGeometry(2.4, 0.1, 0.1);
      const arm = new THREE.Mesh(armGeo, poleMat);
      arm.position.set(233, 6.4, z);
      this.scene.add(arm);

      const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.25, 8, 8), lampMat);
      bulb.position.set(234.2, 6.3, z);
      this.scene.add(bulb);

      const pLight = new THREE.PointLight(0xffea99, 1.4, 20);
      pLight.position.set(234.2, 6.0, z);
      this.scene.add(pLight);
      this.lights.push(pLight);
    }
  }

  createFireEffect(position) {
    const fireGroup = new THREE.Group();
    fireGroup.position.copy(position);

    const coreMat = new THREE.MeshBasicMaterial({ color: 0xffbb00 });
    const core = new THREE.Mesh(new THREE.SphereGeometry(0.9, 10, 10), coreMat);
    core.position.set(0, 1.1, 0);
    fireGroup.add(core);

    const flameMat = new THREE.MeshStandardMaterial({
      color: 0xea580c,
      emissive: 0xd97706,
      emissiveIntensity: 2.2,
      transparent: true,
      opacity: 0.9,
    });

    for (let i = 0; i < 5; i++) {
      const f = new THREE.Mesh(new THREE.SphereGeometry(0.8 + i * 0.22, 8, 8), flameMat);
      f.position.set(
        Math.sin(i * 1.5) * 0.6,
        1.0 + i * 0.55,
        Math.cos(i * 1.5) * 0.6
      );
      fireGroup.add(f);
    }

    const smokeMat = new THREE.MeshStandardMaterial({
      color: 0x18181b,
      roughness: 0.9,
      transparent: true,
      opacity: 0.85,
    });

    for (let j = 0; j < 6; j++) {
      const sm = new THREE.Mesh(new THREE.SphereGeometry(1.1 + j * 0.35, 8, 8), smokeMat);
      sm.position.set(
        Math.sin(j * 2.1) * 0.8,
        3.2 + j * 1.1,
        Math.cos(j * 2.1) * 0.8
      );
      fireGroup.add(sm);
    }

    const fireLight = new THREE.PointLight(0xf97316, 3.2, 22);
    fireLight.position.set(0, 2.4, 0);
    fireGroup.add(fireLight);

    this.scene.add(fireGroup);
    return fireGroup;
  }

  update(dt) {
    this.oceanTime += dt * 0.8;
    if (this.ocean) {
      this.ocean.position.y = -0.3 + Math.sin(this.oceanTime) * 0.12;
    }
  }
}
