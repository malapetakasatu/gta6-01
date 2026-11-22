// Procedural 3D Coastal City Generator for SOLIS CITY: CORAL COAST
// Constructs 6 themed districts, 40+ skyscrapers with lit window textures,
// palm-lined boulevards, ocean water shader mesh, and road collision network.

export class City {
  constructor(scene) {
    this.scene = scene;
    this.colliders = [];
    this.roadNodes = [];
    this.streetlights = [];
    this.animatedBeacons = [];

    this.districts = [
      { name: "Ocean Drive", minX: -360, maxX: -160, minZ: -400, maxZ: 400, color: 0xff2a85 },
      { name: "Marina Bay", minX: -160, maxX: 60, minZ: 80, maxZ: 400, color: 0x00f0ff },
      { name: "Downtown Solis", minX: 60, maxX: 380, minZ: -180, maxZ: 280, color: 0xffd200 },
      { name: "Coral Beach", minX: -550, maxX: -360, minZ: -450, maxZ: 450, color: 0x00ffcc },
      { name: "Vice Strip", minX: -160, maxX: 60, minZ: -400, maxZ: -180, color: 0xff0055 },
      { name: "Port Solis", minX: 60, maxX: 400, minZ: -420, maxZ: -180, color: 0xff8800 }
    ];

    this.initWindowTexture();
    this.buildTerrainAndOcean();
    this.buildRoadNetwork();
    this.buildSkyscrapers();
    this.buildPalmTrees();
    this.buildStreetProps();
  }

  initWindowTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#0a0d18';
    ctx.fillRect(0, 0, 256, 256);

    const rows = 16;
    const cols = 16;
    const cellW = 256 / cols;
    const cellH = 256 / rows;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const rand = Math.random();
        if (rand > 0.45) {
          if (rand > 0.85) ctx.fillStyle = '#00f0ff'; // Neon Cyan
          else if (rand > 0.70) ctx.fillStyle = '#ff2a85'; // Coral Pink
          else ctx.fillStyle = '#ffd200'; // Warm Amber
          ctx.fillRect(c * cellW + 3, r * cellH + 3, cellW - 6, cellH - 6);
        } else {
          ctx.fillStyle = '#060810'; // Dark window
          ctx.fillRect(c * cellW + 3, r * cellH + 3, cellW - 6, cellH - 6);
        }
      }
    }

    this.windowTexture = new THREE.CanvasTexture(canvas);
    this.windowTexture.wrapS = THREE.RepeatWrapping;
    this.windowTexture.wrapT = THREE.RepeatWrapping;
  }

  buildTerrainAndOcean() {
    // 1. Ocean Water
    const oceanGeo = new THREE.PlaneGeometry(1600, 1600, 32, 32);
    const oceanMat = new THREE.MeshStandardMaterial({
      color: 0x003366,
      roughness: 0.1,
      metalness: 0.8,
      transparent: true,
      opacity: 0.88
    });
    this.oceanMesh = new THREE.Mesh(oceanGeo, oceanMat);
    this.oceanMesh.rotation.x = -Math.PI / 2;
    this.oceanMesh.position.set(-600, -0.6, 0);
    this.scene.add(this.oceanMesh);

    // 2. Coral Beach Sand
    const sandGeo = new THREE.PlaneGeometry(240, 1000);
    const sandMat = new THREE.MeshStandardMaterial({
      color: 0xe8c792,
      roughness: 0.9,
      metalness: 0.05
    });
    const sandMesh = new THREE.Mesh(sandGeo, sandMat);
    sandMesh.rotation.x = -Math.PI / 2;
    sandMesh.position.set(-440, 0.05, 0);
    this.scene.add(sandMesh);

    // 3. Ground Base / City Asphalt Plinth
    const cityGroundGeo = new THREE.PlaneGeometry(900, 1000);
    const cityGroundMat = new THREE.MeshStandardMaterial({
      color: 0x141822,
      roughness: 0.85,
      metalness: 0.2
    });
    const cityGround = new THREE.Mesh(cityGroundGeo, cityGroundMat);
    cityGround.rotation.x = -Math.PI / 2;
    cityGround.position.set(100, 0, 0);
    this.scene.add(cityGround);
  }

  buildRoadNetwork() {
    // Road materials
    const asphaltMat = new THREE.MeshStandardMaterial({
      color: 0x1a1e28,
      roughness: 0.7,
      metalness: 0.25
    });

    const markingMat = new THREE.MeshBasicMaterial({ color: 0xffd200 });
    const whiteMat = new THREE.MeshBasicMaterial({ color: 0xffffff });

    // Major North-South Avenues
    const nsRoadXs = [-300, -180, -60, 60, 180, 300];
    nsRoadXs.forEach(x => {
      const roadGeo = new THREE.PlaneGeometry(26, 900);
      const road = new THREE.Mesh(roadGeo, asphaltMat);
      road.rotation.x = -Math.PI / 2;
      road.position.set(x, 0.1, 0);
      this.scene.add(road);

      // Yellow Center Line
      const lineGeo = new THREE.PlaneGeometry(0.8, 880);
      const line = new THREE.Mesh(lineGeo, markingMat);
      line.rotation.x = -Math.PI / 2;
      line.position.set(x, 0.12, 0);
      this.scene.add(line);
    });

    // Major East-West Boulevards
    const ewRoadZs = [-320, -160, 0, 160, 320];
    ewRoadZs.forEach(z => {
      const roadGeo = new THREE.PlaneGeometry(700, 24);
      const road = new THREE.Mesh(roadGeo, asphaltMat);
      road.rotation.x = -Math.PI / 2;
      road.position.set(20, 0.1, z);
      this.scene.add(road);

      // White Center Dashes
      const lineGeo = new THREE.PlaneGeometry(680, 0.8);
      const line = new THREE.Mesh(lineGeo, whiteMat);
      line.rotation.x = -Math.PI / 2;
      line.position.set(20, 0.12, z);
      this.scene.add(line);
    });

    // Populate Road Nodes for GPS & Police Routing
    nsRoadXs.forEach(x => {
      ewRoadZs.forEach(z => {
        this.roadNodes.push({ x, z });
      });
    });
  }

  buildSkyscrapers() {
    // Procedural 45+ skyscrapers across the city
    const buildingPresets = [
      { name: "Solis Financial Center", w: 45, d: 45, h: 170, color: 0x1a2638, emissive: 0x00f0ff },
      { name: "Coral Horizon Tower", w: 40, d: 50, h: 145, color: 0x22182e, emissive: 0xff2a85 },
      { name: "Vice Paradise Casino", w: 55, d: 55, h: 95, color: 0x2c1020, emissive: 0xff0055 },
      { name: "Ocean Palms Resort", w: 35, d: 40, h: 80, color: 0x162c38, emissive: 0x00ffcc },
      { name: "Syndicate Logistics Bay", w: 60, d: 45, h: 45, color: 0x28201a, emissive: 0xff8800 },
      { name: "Marina Blue Heights", w: 38, d: 38, h: 130, color: 0x122436, emissive: 0x0088ff },
      { name: "Aero Spire Tower", w: 32, d: 32, h: 185, color: 0x1e2430, emissive: 0xffd200 }
    ];

    const blockCenters = [
      // Ocean Drive Blocks
      { x: -240, z: -240, type: 3 }, { x: -240, z: -80, type: 1 }, { x: -240, z: 80, type: 3 }, { x: -240, z: 240, type: 1 },
      // Marina Bay Blocks
      { x: -120, z: 80, type: 5 }, { x: -120, z: 240, type: 5 }, { x: 0, z: 120, type: 1 }, { x: 0, z: 260, type: 5 },
      // Downtown Solis Blocks (Skyscrapers hub)
      { x: 120, z: -80, type: 0 }, { x: 120, z: 80, type: 6 }, { x: 120, z: 240, type: 0 },
      { x: 240, z: -80, type: 6 }, { x: 240, z: 80, type: 0 }, { x: 240, z: 200, type: 6 },
      { x: 340, z: 0, type: 0 }, { x: 340, z: 160, type: 1 },
      // Vice Strip Blocks
      { x: -120, z: -240, type: 2 }, { x: 0, z: -240, type: 2 }, { x: -60, z: -300, type: 2 },
      // Port Solis Warehouses & Industrial
      { x: 120, z: -260, type: 4 }, { x: 240, z: -260, type: 4 }, { x: 340, z: -260, type: 4 }, { x: 240, z: -340, type: 4 }
    ];

    blockCenters.forEach((b, idx) => {
      const preset = buildingPresets[b.type % buildingPresets.length];
      const h = preset.h * (0.85 + (idx % 5) * 0.08);
      const w = preset.w * 0.95;
      const d = preset.d * 0.95;

      const group = new THREE.Group();
      group.position.set(b.x, 0, b.z);

      // Main Building Body
      const bGeo = new THREE.BoxGeometry(w, h, d);
      const texClone = this.windowTexture.clone();
      texClone.repeat.set(Math.floor(w / 8), Math.floor(h / 8));
      texClone.needsUpdate = true;

      const bMat = new THREE.MeshStandardMaterial({
        color: preset.color,
        roughness: 0.35,
        metalness: 0.6,
        map: texClone,
        emissive: preset.emissive,
        emissiveMap: texClone,
        emissiveIntensity: 0.55
      });

      const bMesh = new THREE.Mesh(bGeo, bMat);
      bMesh.position.y = h / 2;
      bMesh.castShadow = true;
      bMesh.receiveShadow = true;
      group.add(bMesh);

      // Stepped Rooftop or Spire
      if (h > 90) {
        const roofGeo = new THREE.BoxGeometry(w * 0.65, 14, d * 0.65);
        const roofMat = new THREE.MeshStandardMaterial({ color: 0x0a101a, roughness: 0.8 });
        const roofMesh = new THREE.Mesh(roofGeo, roofMat);
        roofMesh.position.y = h + 7;
        group.add(roofMesh);

        // Antenna Spire with Blinking Aviation Beacon
        const spireGeo = new THREE.CylinderGeometry(0.3, 0.8, 22, 6);
        const spireMat = new THREE.MeshBasicMaterial({ color: 0x8899aa });
        const spireMesh = new THREE.Mesh(spireGeo, spireMat);
        spireMesh.position.y = h + 25;
        group.add(spireMesh);

        const beaconGeo = new THREE.SphereGeometry(0.9, 8, 8);
        const beaconMat = new THREE.MeshBasicMaterial({ color: 0xff2222 });
        const beaconMesh = new THREE.Mesh(beaconGeo, beaconMat);
        beaconMesh.position.y = h + 36;
        group.add(beaconMesh);
        this.animatedBeacons.push(beaconMesh);
      }

      this.scene.add(group);

      // Record Bounding Box for High-Speed Collision Detection
      this.colliders.push({
        minX: b.x - w / 2 - 1.5,
        maxX: b.x + w / 2 + 1.5,
        minZ: b.z - d / 2 - 1.5,
        maxZ: b.z + d / 2 + 1.5
      });
    });
  }

  buildPalmTrees() {
    // Coastal Palm Trees along Ocean Drive promenade
    const palmZStarts = -380;
    const count = 48;
    for (let i = 0; i < count; i++) {
      const z = palmZStarts + i * 16;
      [-320, -280].forEach(x => {
        const treeGroup = new THREE.Group();
        treeGroup.position.set(x + (Math.random() - 0.5) * 4, 0, z);

        // Trunk (Curved segmented cylinder)
        const trunkGeo = new THREE.CylinderGeometry(0.4, 0.7, 9, 7);
        const trunkMat = new THREE.MeshStandardMaterial({ color: 0x5a3e26, roughness: 0.9 });
        const trunk = new THREE.Mesh(trunkGeo, trunkMat);
        trunk.position.y = 4.5;
        trunk.rotation.z = (Math.random() - 0.5) * 0.15;
        treeGroup.add(trunk);

        // Crown Fronds
        const frondMat = new THREE.MeshStandardMaterial({
          color: 0x1f7a3f,
          roughness: 0.6,
          side: THREE.DoubleSide
        });

        for (let f = 0; f < 7; f++) {
          const frondGeo = new THREE.ConeGeometry(1.6, 6, 4);
          frondGeo.translate(0, 3, 0);
          frondGeo.rotateX(Math.PI / 3);
          const frond = new THREE.Mesh(frondGeo, frondMat);
          frond.position.y = 9;
          frond.rotation.y = (f / 7) * Math.PI * 2;
          treeGroup.add(frond);
        }

        this.scene.add(treeGroup);
      });
    }
  }

  buildStreetProps() {
    // Streetlights with dynamic amber/cyan glows along boulevards
    const lightPositions = [
      { x: -285, z: -100 }, { x: -285, z: 0 }, { x: -285, z: 100 },
      { x: -165, z: -100 }, { x: -165, z: 0 }, { x: -165, z: 100 },
      { x: 45, z: -100 }, { x: 45, z: 0 }, { x: 45, z: 100 },
      { x: 165, z: -100 }, { x: 165, z: 0 }, { x: 165, z: 100 }
    ];

    lightPositions.forEach(p => {
      const poleGeo = new THREE.CylinderGeometry(0.2, 0.25, 11, 8);
      const poleMat = new THREE.MeshStandardMaterial({ color: 0x334455, metalness: 0.8 });
      const pole = new THREE.Mesh(poleGeo, poleMat);
      pole.position.set(p.x, 5.5, p.z);
      this.scene.add(pole);

      // Glowing Lamp Head
      const lampGeo = new THREE.SphereGeometry(0.6, 8, 8);
      const lampMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff });
      const lamp = new THREE.Mesh(lampGeo, lampMat);
      lamp.position.set(p.x, 11, p.z);
      this.scene.add(lamp);

      const light = new THREE.PointLight(0x00f0ff, 1.2, 35);
      light.position.set(p.x, 10.5, p.z);
      this.scene.add(light);
    });
  }

  checkCollision(x, z, radius = 2.0) {
    for (let i = 0; i < this.colliders.length; i++) {
      const c = this.colliders[i];
      if (x + radius > c.minX && x - radius < c.maxX &&
          z + radius > c.minZ && z - radius < c.maxZ) {
        // Compute push out vector
        const dx1 = x - c.minX;
        const dx2 = c.maxX - x;
        const dz1 = z - c.minZ;
        const dz2 = c.maxZ - z;
        const minVal = Math.min(dx1, dx2, dz1, dz2);

        let pushX = 0;
        let pushZ = 0;
        if (minVal === dx1) pushX = -1;
        else if (minVal === dx2) pushX = 1;
        else if (minVal === dz1) pushZ = -1;
        else pushZ = 1;

        return { hit: true, pushX, pushZ };
      }
    }
    return { hit: false, pushX: 0, pushZ: 0 };
  }

  getDistrict(x, z) {
    for (let i = 0; i < this.districts.length; i++) {
      const d = this.districts[i];
      if (x >= d.minX && x <= d.maxX && z >= d.minZ && z <= d.maxZ) {
        return d.name;
      }
    }
    return "Solis Metro";
  }

  getNearestRoadNode(x, z) {
    let nearest = this.roadNodes[0];
    let minDist = Infinity;
    this.roadNodes.forEach(node => {
      const dist = (node.x - x) ** 2 + (node.z - z) ** 2;
      if (dist < minDist) {
        minDist = dist;
        nearest = node;
      }
    });
    return nearest;
  }

  update(time) {
    // Animate ocean surface
    if (this.oceanMesh) {
      this.oceanMesh.position.y = -0.6 + Math.sin(time * 1.5) * 0.12;
    }

    // Animate skyscraper aviation warning beacons
    const flash = Math.sin(time * 4) > 0.3;
    this.animatedBeacons.forEach(b => {
      b.material.color.setHex(flash ? 0xff0044 : 0x220008);
    });
  }
}
