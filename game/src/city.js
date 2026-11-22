// SOLIS CITY: CORAL COAST - Procedural 3D Coastal City Architecture
// High-fidelity coastal metropolis with 40+ skyscrapers, Ocean Drive boulevard,
// procedural lit window textures, rooftop neon signs, palm trees, and road network.

/* global THREE */

export class City {
  constructor(scene) {
    this.scene = scene;
    this.buildings = [];
    this.colliders = [];
    this.roadSegments = [];
    this.waypoints = [];
    this.streetlights = [];
    this.neonSigns = [];
    this.palms = [];
    this.animatedWater = null;

    this.districts = [
      { name: 'OCEAN DRIVE', bounds: { minX: -160, maxX: -40, minZ: -300, maxZ: 300 } },
      { name: 'DOWNTOWN', bounds: { minX: -40, maxX: 120, minZ: -120, maxZ: 120 } },
      { name: 'CORAL MARINA', bounds: { minX: -160, maxX: -40, minZ: 120, maxZ: 320 } },
      { name: 'NEON PALMS', bounds: { minX: -40, maxX: 120, minZ: -320, maxZ: -120 } },
      { name: 'INDUSTRIAL HARBOR', bounds: { minX: 120, maxX: 280, minZ: 80, maxZ: 320 } },
      { name: 'SUNSET HEIGHTS', bounds: { minX: 120, maxX: 280, minZ: -320, maxZ: 80 } }
    ];

    this.init();
  }

  init() {
    this.createWindowTextures();
    this.buildOceanAndBeach();
    this.buildRoadNetwork();
    this.buildCityBlocks();
    this.buildPalmTrees();
    this.buildStreetLights();
    this.buildNeonLandmarks();
    this.buildProps();
  }

  createWindowTextures() {
    // Generate procedural window grid textures with office & residential lighting
    const createTexture = (baseHex, litRatio, tintHex) => {
      const canvas = document.createElement('canvas');
      canvas.width = 256;
      canvas.height = 512;
      const ctx = canvas.getContext('2d');

      ctx.fillStyle = baseHex;
      ctx.fillRect(0, 0, 256, 512);

      const cols = 8;
      const rows = 32;
      const padX = 6;
      const padY = 4;
      const w = (256 - padX * (cols + 1)) / cols;
      const h = (512 - padY * (rows + 1)) / rows;

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const x = padX + c * (w + padX);
          const y = padY + r * (h + padY);
          const isLit = Math.random() < litRatio;

          if (isLit) {
            const brightness = 0.6 + Math.random() * 0.4;
            const hue = Math.random() > 0.4 ? tintHex : '#ffffff';
            ctx.fillStyle = hue;
            ctx.globalAlpha = brightness;
            ctx.fillRect(x, y, w, h);
            ctx.globalAlpha = 1.0;
          } else {
            ctx.fillStyle = '#0a0d14';
            ctx.fillRect(x, y, w, h);
          }
        }
      }

      const texture = new THREE.CanvasTexture(canvas);
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
      return texture;
    };

    this.windowTexDowntown = createTexture('#1a202c', 0.65, '#ffeaa7'); // warm office
    this.windowTexAzure = createTexture('#0f172a', 0.55, '#74b9ff');    // tech blue
    this.windowTexNeon = createTexture('#181024', 0.70, '#fd79a8');     // coral pink
    this.windowTexResidential = createTexture('#1e293b', 0.40, '#fed330'); // golden
  }

  buildOceanAndBeach() {
    // Ocean Plane
    const oceanGeo = new THREE.PlaneGeometry(800, 1000, 32, 32);
    const oceanMat = new THREE.MeshStandardMaterial({
      color: 0x004466,
      roughness: 0.15,
      metalness: 0.85,
      emissive: 0x001122,
      emissiveIntensity: 0.4
    });
    const ocean = new THREE.Mesh(oceanGeo, oceanMat);
    ocean.rotation.x = -Math.PI / 2;
    ocean.position.set(-360, -0.4, 0);
    this.scene.add(ocean);
    this.animatedWater = ocean;

    // Sandy Beach Strip
    const beachGeo = new THREE.PlaneGeometry(80, 800);
    const beachMat = new THREE.MeshStandardMaterial({
      color: 0xd2b48c,
      roughness: 0.9,
      metalness: 0.05
    });
    const beach = new THREE.Mesh(beachGeo, beachMat);
    beach.rotation.x = -Math.PI / 2;
    beach.position.set(-160, -0.1, 0);
    this.scene.add(beach);

    // Boardwalk Promenade
    const walkGeo = new THREE.BoxGeometry(16, 0.4, 800);
    const walkMat = new THREE.MeshStandardMaterial({
      color: 0x94a3b8,
      roughness: 0.7
    });
    const walk = new THREE.Mesh(walkGeo, walkMat);
    walk.position.set(-112, 0.1, 0);
    this.scene.add(walk);
  }

  buildRoadNetwork() {
    // Road Grid Layout
    // Main North-South Avenues:
    // x = -90 (Ocean Drive - Coastal Boulevard)
    // x = 0 (Central Solis Avenue)
    // x = 90 (Metropolitan Boulevard)
    // x = 180 (Harbor & Industrial Expressway)
    // East-West Cross Streets:
    // z = -240, -160, -80, 0, 80, 160, 240

    const roadMat = new THREE.MeshStandardMaterial({
      color: 0x1e2430,
      roughness: 0.85,
      metalness: 0.15
    });

    const markingMat = new THREE.MeshBasicMaterial({ color: 0xf1c40f }); // yellow divider
    const whiteLineMat = new THREE.MeshBasicMaterial({ color: 0xffffff });

    const createRoad = (x, z, width, length, isHorizontal = false) => {
      const roadGeo = new THREE.PlaneGeometry(width, length);
      const road = new THREE.Mesh(roadGeo, roadMat);
      road.rotation.x = -Math.PI / 2;
      if (isHorizontal) road.rotation.z = Math.PI / 2;
      road.position.set(x, 0.02, z);
      this.scene.add(road);

      // Center divider markings
      const dividerLen = isHorizontal ? width : length;
      const dividerGeo = new THREE.PlaneGeometry(isHorizontal ? 0.35 : dividerLen, isHorizontal ? dividerLen : 0.35);
      const divider = new THREE.Mesh(dividerGeo, markingMat);
      divider.rotation.x = -Math.PI / 2;
      divider.position.set(x, 0.03, z);
      this.scene.add(divider);

      this.roadSegments.push({ x, z, width, length, isHorizontal });
    };

    // North-South Avenues
    createRoad(-90, 0, 18, 640, false); // Ocean Drive
    createRoad(0, 0, 20, 640, false);   // Solis Ave
    createRoad(90, 0, 20, 640, false);  // Metro Blvd
    createRoad(180, 0, 20, 640, false); // Harbor Expressway

    // East-West Streets
    const zStreets = [-240, -160, -80, 0, 80, 160, 240];
    zStreets.forEach(z => {
      createRoad(45, z, 300, 16, true);
    });

    // Build Waypoint Graph for AI vehicles and GPS
    const xNodes = [-90, 0, 90, 180];
    let wpId = 0;
    const nodeMap = new Map();

    xNodes.forEach(x => {
      zStreets.forEach(z => {
        const id = wpId++;
        const key = `${x},${z}`;
        const node = { id, x, z, district: this.getDistrictName(x, z), neighbors: [] };
        this.waypoints.push(node);
        nodeMap.set(key, node);
      });
    });

    // Link grid neighbors
    for (let xi = 0; xi < xNodes.length; xi++) {
      for (let zi = 0; zi < zStreets.length; zi++) {
        const current = nodeMap.get(`${xNodes[xi]},${zStreets[zi]}`);
        if (!current) continue;
        if (xi > 0) current.neighbors.push(nodeMap.get(`${xNodes[xi - 1]},${zStreets[zi]}`).id);
        if (xi < xNodes.length - 1) current.neighbors.push(nodeMap.get(`${xNodes[xi + 1]},${zStreets[zi]}`).id);
        if (zi > 0) current.neighbors.push(nodeMap.get(`${xNodes[xi]},${zStreets[zi - 1]}`).id);
        if (zi < zStreets.length - 1) current.neighbors.push(nodeMap.get(`${xNodes[xi]},${zStreets[zi + 1]}`).id);
      }
    }
  }

  buildCityBlocks() {
    // City Block Building Placement
    // Block centers between roads:
    // X columns:
    // col 1: x = -45 (between Ocean Dr & Solis Ave)
    // col 2: x = 45 (between Solis Ave & Metro Blvd)
    // col 3: x = 135 (between Metro Blvd & Harbor Exp)
    // col 4: x = 225 (East Suburbs / Harbor Docks)
    // Z rows: between z = -240, -160, -80, 0, 80, 160, 240

    const blockCols = [-45, 45, 135, 225];
    const blockRows = [-200, -120, -40, 40, 120, 200];

    const materials = [
      new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.3, metalness: 0.7, map: this.windowTexDowntown }),
      new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.25, metalness: 0.8, map: this.windowTexAzure }),
      new THREE.MeshStandardMaterial({ color: 0x241433, roughness: 0.35, metalness: 0.65, map: this.windowTexNeon }),
      new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.45, metalness: 0.5, map: this.windowTexResidential })
    ];

    let buildingCount = 0;

    blockCols.forEach((bx, cIdx) => {
      blockRows.forEach((bz, rIdx) => {
        // Generate 2 buildings per city block for rich urban density
        const subOffsets = [
          { dx: -14, dz: -16 },
          { dx: 14, dz: 16 }
        ];

        subOffsets.forEach(sub => {
          buildingCount++;
          const posX = bx + sub.dx;
          const posZ = bz + sub.dz;

          // Determine skyscraper height based on district
          let height = 30 + Math.random() * 45;
          let width = 20 + Math.random() * 8;
          let depth = 22 + Math.random() * 8;
          let matIdx = 0;

          // Downtown core (highest skyscrapers)
          if (bx === 45 && Math.abs(bz) < 100) {
            height = 85 + Math.random() * 55; // 85m - 140m Solis Towers
            matIdx = (buildingCount % 2 === 0) ? 0 : 1;
          } else if (bx === -45 && bz < -50) {
            // Neon Palms Strip
            height = 40 + Math.random() * 35;
            matIdx = 2; // Neon pink/purple
          } else if (bx === -45 && bz >= 50) {
            // Coral Marina Highrises
            height = 50 + Math.random() * 45;
            matIdx = 1; // Azure glass
          } else if (bx === 135 || bx === 225) {
            // East side & Harbor
            height = 25 + Math.random() * 30;
            matIdx = 3;
          }

          // Building Geometry
          const buildingGeo = new THREE.BoxGeometry(width, height, depth);
          const mat = materials[matIdx];
          const mesh = new THREE.Mesh(buildingGeo, mat);
          mesh.position.set(posX, height / 2, posZ);
          mesh.castShadow = true;
          mesh.receiveShadow = true;
          this.scene.add(mesh);

          // Rooftop details (Helipads, AC units, Antenna spires)
          if (height > 70) {
            // Rooftop spire antenna
            const spireGeo = new THREE.CylinderGeometry(0.3, 0.8, 18, 8);
            const spireMat = new THREE.MeshBasicMaterial({ color: 0xff0044 });
            const spire = new THREE.Mesh(spireGeo, spireMat);
            spire.position.set(posX, height + 9, posZ);
            this.scene.add(spire);

            // Blinking warning beacon
            const beaconLight = new THREE.PointLight(0xff0033, 1.5, 30);
            beaconLight.position.set(posX, height + 18, posZ);
            this.scene.add(beaconLight);
          } else if (height > 40) {
            // Rooftop HVAC boxes
            const hvacGeo = new THREE.BoxGeometry(6, 4, 6);
            const hvacMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.8 });
            const hvac = new THREE.Mesh(hvacGeo, hvacMat);
            hvac.position.set(posX - 4, height + 2, posZ - 3);
            this.scene.add(hvac);
          }

          // Register collision box
          const halfW = width / 2;
          const halfD = depth / 2;
          this.colliders.push({
            minX: posX - halfW,
            maxX: posX + halfW,
            minZ: posZ - halfD,
            maxZ: posZ + halfD,
            height: height
          });

          this.buildings.push({ mesh, posX, posZ, width, depth, height });
        });
      });
    });
  }

  buildNeonLandmarks() {
    // Rooftop & Facade Neon Signs for iconic Solis City vibe
    const landmarks = [
      { text: 'SOLIS TOWER', x: 45, y: 125, z: 0, color: 0x05d9e8, rotY: 0 },
      { text: 'VORTEX CORP', x: 45, y: 110, z: -80, color: 0xff2a6d, rotY: Math.PI / 2 },
      { text: 'HORIZON BANK', x: 45, y: 95, z: 80, color: 0xffb700, rotY: -Math.PI / 2 },
      { text: 'THE PALM CLUB', x: -45, y: 55, z: -200, color: 0xff007f, rotY: 0 },
      { text: 'PARADISE CASINO', x: -45, y: 65, z: -140, color: 0x00ffaa, rotY: Math.PI / 2 },
      { text: 'CORAL MARINA', x: -45, y: 60, z: 180, color: 0x00d2ff, rotY: 0 },
      { text: 'AZURE HOLDINGS', x: 135, y: 55, z: -40, color: 0x9b59b6, rotY: Math.PI }
    ];

    landmarks.forEach(lm => {
      const canvas = document.createElement('canvas');
      canvas.width = 512;
      canvas.height = 128;
      const ctx = canvas.getContext('2d');

      ctx.fillStyle = 'rgba(10, 14, 28, 0.9)';
      ctx.fillRect(0, 0, 512, 128);

      ctx.strokeStyle = `#${lm.color.toString(16).padStart(6, '0')}`;
      ctx.lineWidth = 6;
      ctx.strokeRect(6, 6, 500, 116);

      ctx.fillStyle = `#${lm.color.toString(16).padStart(6, '0')}`;
      ctx.font = 'bold 50px Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.shadowColor = ctx.fillStyle;
      ctx.shadowBlur = 24;
      ctx.fillText(lm.text, 256, 64);

      const signTex = new THREE.CanvasTexture(canvas);
      const signGeo = new THREE.PlaneGeometry(24, 6);
      const signMat = new THREE.MeshBasicMaterial({
        map: signTex,
        transparent: true,
        side: THREE.DoubleSide
      });

      const signMesh = new THREE.Mesh(signGeo, signMat);
      signMesh.position.set(lm.x, lm.y, lm.z);
      signMesh.rotation.y = lm.rotY;
      this.scene.add(signMesh);

      // Glowing point light casting neon ambience on nearby walls
      const neonLight = new THREE.PointLight(lm.color, 2.5, 45);
      neonLight.position.set(lm.x, lm.y + 2, lm.z);
      this.scene.add(neonLight);

      this.neonSigns.push({ mesh: signMesh, light: neonLight, baseIntensity: 2.5 });
    });
  }

  buildPalmTrees() {
    // Procedural Palm Trees along Ocean Drive and boulevard medians
    const trunkGeo = new THREE.CylinderGeometry(0.3, 0.5, 9, 7);
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x6e4e37, roughness: 0.9 });

    // Palm leaf frond geometry
    const leafGeo = new THREE.ConeGeometry(3.5, 7, 5);
    const leafMat = new THREE.MeshStandardMaterial({
      color: 0x1b7943,
      roughness: 0.6,
      side: THREE.DoubleSide
    });

    const createPalm = (x, z) => {
      const palmGroup = new THREE.Group();

      // Slanted curved trunk
      const trunk = new THREE.Mesh(trunkGeo, trunkMat);
      trunk.position.y = 4.5;
      trunk.rotation.z = (Math.random() - 0.5) * 0.18;
      trunk.rotation.x = (Math.random() - 0.5) * 0.18;
      palmGroup.add(trunk);

      // Crown of palm leaves
      const crown = new THREE.Mesh(leafGeo, leafMat);
      crown.rotation.x = Math.PI; // umbrella shape
      crown.position.y = 9.2;
      palmGroup.add(crown);

      palmGroup.position.set(x, 0, z);
      this.scene.add(palmGroup);
      this.palms.push(palmGroup);
    };

    // Plant palms along Ocean Drive coastal promenade
    for (let z = -300; z <= 300; z += 18) {
      createPalm(-104, z + (Math.random() - 0.5) * 4);
      createPalm(-78, z + (Math.random() - 0.5) * 4);
    }

    // Plant palms along central boulevard medians
    for (let z = -220; z <= 220; z += 35) {
      createPalm(45, z);
    }
  }

  buildStreetLights() {
    // Modern City Streetlights with warm emissive light & point lights
    const poleGeo = new THREE.CylinderGeometry(0.12, 0.18, 8, 8);
    const poleMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8 });
    const lampHeadGeo = new THREE.BoxGeometry(1.2, 0.3, 0.6);
    const lampHeadMat = new THREE.MeshBasicMaterial({ color: 0xffe6aa });

    const createLight = (x, z) => {
      const pole = new THREE.Mesh(poleGeo, poleMat);
      pole.position.set(x, 4, z);
      this.scene.add(pole);

      const lampHead = new THREE.Mesh(lampHeadGeo, lampHeadMat);
      lampHead.position.set(x, 8, z);
      this.scene.add(lampHead);

      const light = new THREE.PointLight(0xffecc4, 1.2, 35);
      light.position.set(x, 7.8, z);
      this.scene.add(light);
      this.streetlights.push(light);
    };

    // Place lights along Ocean Drive and Solis Avenue
    for (let z = -280; z <= 280; z += 40) {
      createLight(-80, z);
      createLight(10, z);
      createLight(80, z);
    }
  }

  buildProps() {
    // Harbor Cranes & Shipping Containers in Industrial District
    const containerMat1 = new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.5 }); // Red
    const containerMat2 = new THREE.MeshStandardMaterial({ color: 0x3b82f6, roughness: 0.5 }); // Blue
    const containerMat3 = new THREE.MeshStandardMaterial({ color: 0x10b981, roughness: 0.5 }); // Green
    const cMats = [containerMat1, containerMat2, containerMat3];

    for (let i = 0; i < 20; i++) {
      const cx = 190 + (i % 4) * 16;
      const cz = 120 + Math.floor(i / 4) * 22;
      const stack = 1 + (i % 3);

      for (let s = 0; s < stack; s++) {
        const cGeo = new THREE.BoxGeometry(12, 3.5, 5);
        const cMesh = new THREE.Mesh(cGeo, cMats[(i + s) % 3]);
        cMesh.position.set(cx, 1.75 + s * 3.6, cz);
        this.scene.add(cMesh);

        this.colliders.push({
          minX: cx - 6,
          maxX: cx + 6,
          minZ: cz - 2.5,
          maxZ: cz + 2.5,
          height: 3.5 * stack
        });
      }
    }
  }

  getDistrictName(x, z) {
    for (let d of this.districts) {
      if (x >= d.bounds.minX && x <= d.bounds.maxX && z >= d.bounds.minZ && z <= d.bounds.maxZ) {
        return d.name;
      }
    }
    return 'GREATER SOLIS';
  }

  checkCollision(x, z, radius = 1.8) {
    for (let col of this.colliders) {
      if (
        x + radius > col.minX &&
        x - radius < col.maxX &&
        z + radius > col.minZ &&
        z - radius < col.maxZ
      ) {
        // Calculate collision penetration and pushback normal
        const overlapL = (x + radius) - col.minX;
        const overlapR = col.maxX - (x - radius);
        const overlapT = (z + radius) - col.minZ;
        const overlapB = col.maxZ - (z - radius);

        const minOverlap = Math.min(overlapL, overlapR, overlapT, overlapB);
        let normalX = 0;
        let normalZ = 0;

        if (minOverlap === overlapL) normalX = -1;
        else if (minOverlap === overlapR) normalX = 1;
        else if (minOverlap === overlapT) normalZ = -1;
        else if (minOverlap === overlapB) normalZ = 1;

        return { hit: true, normalX, normalZ, depth: minOverlap };
      }
    }
    return { hit: false };
  }

  findNearestWaypoint(x, z) {
    let bestDist = Infinity;
    let bestNode = this.waypoints[0];
    for (let wp of this.waypoints) {
      const d = Math.hypot(wp.x - x, wp.z - z);
      if (d < bestDist) {
        bestDist = d;
        bestNode = wp;
      }
    }
    return bestNode;
  }

  findPath(startX, startZ, targetX, targetZ) {
    const startNode = this.findNearestWaypoint(startX, startZ);
    const targetNode = this.findNearestWaypoint(targetX, targetZ);

    if (startNode.id === targetNode.id) return [startNode];

    // Breadth-First / A* Pathfinding
    const queue = [[startNode]];
    const visited = new Set([startNode.id]);

    while (queue.length > 0) {
      const path = queue.shift();
      const current = path[path.length - 1];

      if (current.id === targetNode.id) {
        return path;
      }

      for (let neighborId of current.neighbors) {
        if (!visited.has(neighborId)) {
          visited.add(neighborId);
          const neighborNode = this.waypoints.find(w => w.id === neighborId);
          if (neighborNode) {
            queue.push([...path, neighborNode]);
          }
        }
      }
    }

    return [startNode, targetNode];
  }

  update(time) {
    // Gentle water shimmer
    if (this.animatedWater) {
      this.animatedWater.position.y = -0.4 + Math.sin(time * 1.5) * 0.08;
    }

    // Neon signs subtle pulse
    for (let sign of this.neonSigns) {
      const flicker = 0.9 + Math.sin(time * 4 + sign.mesh.position.x) * 0.1;
      sign.light.intensity = sign.baseIntensity * flicker;
    }
  }
}
