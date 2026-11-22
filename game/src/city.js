// Procedural 3D Coastal City: Solis City - Coral Coast
// Features: Sprawling road grid, ocean, sandy beach, palm trees, 40+ textured skyscrapers with lit windows and neon rooftop accents.

function createCity(scene) {
  const city = {
    buildings: [],
    waypoints: [],
    waterMesh: null,
    palms: [],
    lamps: []
  };

  // 1. TERRAIN & GROUND
  // Main ground plane (Asphalt / Concrete base)
  const groundGeo = new THREE.PlaneGeometry(600, 600);
  const groundMat = new THREE.MeshStandardMaterial({
    color: 0x181a1f,
    roughness: 0.85,
    metalness: 0.1
  });
  const ground = new THREE.Mesh(groundGeo, groundMat);
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);

  // 2. OCEAN & BEACH (West side: x < -120)
  const oceanGeo = new THREE.PlaneGeometry(350, 600, 32, 32);
  const oceanMat = new THREE.MeshStandardMaterial({
    color: 0x0a4066,
    roughness: 0.15,
    metalness: 0.8,
    transparent: true,
    opacity: 0.88
  });
  const ocean = new THREE.Mesh(oceanGeo, oceanMat);
  ocean.rotation.x = -Math.PI / 2;
  ocean.position.set(-275, 0.4, 0);
  scene.add(ocean);
  city.waterMesh = ocean;

  // Sandy Beach Strip between ocean and Ocean Boulevard
  const beachGeo = new THREE.PlaneGeometry(50, 600);
  const beachMat = new THREE.MeshStandardMaterial({
    color: 0xd9b777,
    roughness: 0.95,
    metalness: 0.05
  });
  const beach = new THREE.Mesh(beachGeo, beachMat);
  beach.rotation.x = -Math.PI / 2;
  beach.position.set(-115, 0.45, 0);
  scene.add(beach);

  // 3. ROAD NETWORK (Grid with Ocean Blvd, Palm Ave, Downtown Expressway)
  const roads = [
    // North-South Arteries
    { x: -80, z: 0, w: 18, l: 560, name: 'Ocean Boulevard' },
    { x: 0, z: 0, w: 22, l: 560, name: 'Palm Avenue' },
    { x: 80, z: 0, w: 20, l: 560, name: 'Downtown Expressway' },
    { x: 160, z: 0, w: 16, l: 560, name: 'Financial Strip' },

    // East-West Cross Streets
    { x: 40, z: -200, w: 260, l: 16, name: 'Marina Way' },
    { x: 40, z: -100, w: 260, l: 16, name: 'Sunset Boulevard' },
    { x: 40, z: 0, w: 260, l: 18, name: 'Coral Central Avenue' },
    { x: 40, z: 100, w: 260, l: 16, name: 'Vice Promenade' },
    { x: 40, z: 200, w: 260, l: 16, name: 'Port Access Road' }
  ];

  const roadMat = new THREE.MeshStandardMaterial({
    color: 0x22242a,
    roughness: 0.7,
    metalness: 0.2
  });

  const roadMarkingMat = new THREE.MeshBasicMaterial({ color: 0xf0c030 });
  const whiteMarkingMat = new THREE.MeshBasicMaterial({ color: 0xe0e0e0 });

  roads.forEach(r => {
    const rGeo = new THREE.PlaneGeometry(r.w, r.l);
    const rMesh = new THREE.Mesh(rGeo, roadMat);
    rMesh.rotation.x = -Math.PI / 2;
    rMesh.position.set(r.x, 0.5, r.z);
    rMesh.receiveShadow = true;
    scene.add(rMesh);

    // Center dash line
    if (r.l > r.w) {
      // NS road
      const dashGeo = new THREE.PlaneGeometry(0.5, r.l - 10);
      const dashMesh = new THREE.Mesh(dashGeo, roadMarkingMat);
      dashMesh.rotation.x = -Math.PI / 2;
      dashMesh.position.set(r.x, 0.52, r.z);
      scene.add(dashMesh);
    } else {
      // EW road
      const dashGeo = new THREE.PlaneGeometry(r.w - 10, 0.5);
      const dashMesh = new THREE.Mesh(dashGeo, roadMarkingMat);
      dashMesh.rotation.x = -Math.PI / 2;
      dashMesh.position.set(r.x, 0.52, r.z);
      scene.add(dashMesh);
    }
  });

  // Waypoints for navigation / AI patrol
  const waypoints = [
    new THREE.Vector3(-80, 1, -200),
    new THREE.Vector3(-80, 1, -100),
    new THREE.Vector3(-80, 1, 0),
    new THREE.Vector3(-80, 1, 100),
    new THREE.Vector3(-80, 1, 200),

    new THREE.Vector3(0, 1, -200),
    new THREE.Vector3(0, 1, -100),
    new THREE.Vector3(0, 1, 0),
    new THREE.Vector3(0, 1, 100),
    new THREE.Vector3(0, 1, 200),

    new THREE.Vector3(80, 1, -200),
    new THREE.Vector3(80, 1, -100),
    new THREE.Vector3(80, 1, 0),
    new THREE.Vector3(80, 1, 100),
    new THREE.Vector3(80, 1, 200),

    new THREE.Vector3(160, 1, -200),
    new THREE.Vector3(160, 1, -100),
    new THREE.Vector3(160, 1, 0),
    new THREE.Vector3(160, 1, 100),
    new THREE.Vector3(160, 1, 200)
  ];
  city.waypoints = waypoints;

  // 4. PROCEDURAL PALM TREES along Ocean Boulevard & Beach
  function createPalmTree(x, z) {
    const palm = new THREE.Group();
    // Curved trunk
    const trunkHeight = 11 + Math.random() * 4;
    const trunkGeo = new THREE.CylinderGeometry(0.35, 0.55, trunkHeight, 6);
    const trunkMat = new THREE.MeshStandardMaterial({
      color: 0x5a4128,
      roughness: 0.9
    });
    const trunk = new THREE.Mesh(trunkGeo, trunkMat);
    trunk.position.y = trunkHeight / 2;
    trunk.rotation.z = (Math.random() - 0.5) * 0.15;
    trunk.castShadow = true;
    palm.add(trunk);

    // Palm leaves / fronds
    const frondMat = new THREE.MeshStandardMaterial({
      color: 0x1b7024,
      roughness: 0.6,
      side: THREE.DoubleSide
    });
    for (let i = 0; i < 7; i++) {
      const angle = (i / 7) * Math.PI * 2;
      const frondGeo = new THREE.ConeGeometry(1.6, 6, 4);
      const frond = new THREE.Mesh(frondGeo, frondMat);
      frond.position.set(
        Math.cos(angle) * 1.5,
        trunkHeight - 0.5,
        Math.sin(angle) * 1.5
      );
      frond.rotation.y = angle;
      frond.rotation.z = Math.PI / 2.6;
      frond.castShadow = true;
      palm.add(frond);
    }
    palm.position.set(x, 0, z);
    scene.add(palm);
    city.palms.push(palm);
  }

  for (let z = -260; z <= 260; z += 24) {
    createPalmTree(-94, z + (Math.random() * 6 - 3));
    createPalmTree(-68, z + (Math.random() * 6 - 3));
    if (Math.random() > 0.4) {
      createPalmTree(-118, z + (Math.random() * 8 - 4));
    }
  }

  // 5. PROCEDURAL 40+ SKYSCRAPERS & BUILDINGS
  // Create window canvas texture generator
  function createBuildingTexture(neonColorHex, litRatio) {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');

    // Dark facade
    ctx.fillStyle = '#11141c';
    ctx.fillRect(0, 0, 128, 256);

    // Window grid
    const cols = 8;
    const rows = 24;
    const cellW = 128 / cols;
    const cellH = 256 / rows;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const isLit = Math.random() < litRatio;
        if (isLit) {
          const warmOrCool = Math.random() > 0.4;
          ctx.fillStyle = warmOrCool ? '#ffe49e' : (neonColorHex || '#aae5ff');
        } else {
          ctx.fillStyle = '#0a0c12';
        }
        ctx.fillRect(c * cellW + 3, r * cellH + 3, cellW - 6, cellH - 6);
      }
    }
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    return texture;
  }

  const neonColors = ['#00e5ff', '#ff3b69', '#ffcc00', '#00ff88', '#9d4edd', '#ff0055'];

  // Building blocks grid layout (in quadrants between streets)
  const blocks = [
    // Coastal Block A (x: -42, z: -150)
    { cx: -40, cz: -150, rows: 3, cols: 2, maxH: 65, minH: 30 },
    // Coastal Block B (x: -40, z: -50)
    { cx: -40, cz: -50, rows: 3, cols: 2, maxH: 80, minH: 35 },
    // Coastal Block C (x: -40, z: 50)
    { cx: -40, cz: 50, rows: 3, cols: 2, maxH: 70, minH: 30 },
    // Coastal Block D (x: -40, z: 150)
    { cx: -40, cz: 150, rows: 3, cols: 2, maxH: 60, minH: 25 },

    // Central Downtown Block A (x: 40, z: -150)
    { cx: 40, cz: -150, rows: 3, cols: 3, maxH: 110, minH: 50 },
    // Central Downtown Block B (x: 40, z: -50) - Solis Financial Tower Core
    { cx: 40, cz: -50, rows: 3, cols: 3, maxH: 140, minH: 65 },
    // Central Downtown Block C (x: 40, z: 50)
    { cx: 40, cz: 50, rows: 3, cols: 3, maxH: 120, minH: 55 },
    // Central Downtown Block D (x: 40, z: 150)
    { cx: 40, cz: 150, rows: 3, cols: 3, maxH: 95, minH: 45 },

    // East District Block A (x: 120, z: -150)
    { cx: 120, cz: -150, rows: 3, cols: 2, maxH: 85, minH: 40 },
    // East District Block B (x: 120, z: -50)
    { cx: 120, cz: -50, rows: 3, cols: 2, maxH: 95, minH: 45 },
    // East District Block C (x: 120, z: 50)
    { cx: 120, cz: 50, rows: 3, cols: 2, maxH: 80, minH: 35 },
    // East District Block D (x: 120, z: 150)
    { cx: 120, cz: 150, rows: 3, cols: 2, maxH: 75, minH: 30 },

    // Outer East Block (x: 200)
    { cx: 200, cz: -100, rows: 3, cols: 2, maxH: 55, minH: 25 },
    { cx: 200, cz: 0, rows: 3, cols: 2, maxH: 60, minH: 30 },
    { cx: 200, cz: 100, rows: 3, cols: 2, maxH: 50, minH: 20 }
  ];

  let buildingId = 1;

  blocks.forEach(blk => {
    const spacingX = 22;
    const spacingZ = 24;
    const startX = blk.cx - ((blk.cols - 1) * spacingX) / 2;
    const startZ = blk.cz - ((blk.rows - 1) * spacingZ) / 2;

    for (let r = 0; r < blk.rows; r++) {
      for (let c = 0; c < blk.cols; c++) {
        const bx = startX + c * spacingX + (Math.random() * 4 - 2);
        const bz = startZ + r * spacingZ + (Math.random() * 4 - 2);
        const bw = 14 + Math.random() * 6;
        const bd = 14 + Math.random() * 6;
        const bh = blk.minH + Math.random() * (blk.maxH - blk.minH);

        const neonColor = neonColors[buildingId % neonColors.length];
        const tex = createBuildingTexture(neonColor, 0.45);
        tex.repeat.set(1, Math.round(bh / 20));

        const bMat = new THREE.MeshStandardMaterial({
          map: tex,
          roughness: 0.4,
          metalness: 0.5
        });

        const bGeo = new THREE.BoxGeometry(bw, bh, bd);
        const building = new THREE.Mesh(bGeo, bMat);
        building.position.set(bx, bh / 2, bz);
        building.castShadow = true;
        building.receiveShadow = true;
        scene.add(building);

        // Rooftop structure / Helipad / Spire
        if (bh > 60) {
          const roofGeo = new THREE.BoxGeometry(bw * 0.7, 4, bd * 0.7);
          const roofMat = new THREE.MeshStandardMaterial({ color: 0x222630 });
          const roof = new THREE.Mesh(roofGeo, roofMat);
          roof.position.set(bx, bh + 2, bz);
          scene.add(roof);

          // Neon edge accent on top
          const edgeGeo = new THREE.BoxGeometry(bw * 0.72, 0.6, bd * 0.72);
          const edgeMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(neonColor) });
          const edge = new THREE.Mesh(edgeGeo, edgeMat);
          edge.position.set(bx, bh + 4.2, bz);
          scene.add(edge);

          // Antenna spire with blinking red beacon
          const spireGeo = new THREE.CylinderGeometry(0.15, 0.3, 12, 6);
          const spireMat = new THREE.MeshBasicMaterial({ color: 0x999999 });
          const spire = new THREE.Mesh(spireGeo, spireMat);
          spire.position.set(bx, bh + 10, bz);
          scene.add(spire);

          const beaconGeo = new THREE.SphereGeometry(0.5, 8, 8);
          const beaconMat = new THREE.MeshBasicMaterial({ color: 0xff1122 });
          const beacon = new THREE.Mesh(beaconGeo, beaconMat);
          beacon.position.set(bx, bh + 16, bz);
          scene.add(beacon);
        }

        // Bounding box for collisions
        city.buildings.push({
          id: buildingId++,
          x: bx,
          z: bz,
          width: bw,
          depth: bd,
          height: bh,
          minX: bx - bw / 2,
          maxX: bx + bw / 2,
          minZ: bz - bd / 2,
          maxZ: bz + bd / 2
        });
      }
    }
  });

  // 6. STREET LIGHTS along sidewalks
  for (let z = -250; z <= 250; z += 40) {
    [-71, -9, 9, 71, 89, 151, 169].forEach(lx => {
      const poleGeo = new THREE.CylinderGeometry(0.18, 0.22, 7, 6);
      const poleMat = new THREE.MeshStandardMaterial({ color: 0x333742, metalness: 0.8 });
      const pole = new THREE.Mesh(poleGeo, poleMat);
      pole.position.set(lx, 3.5, z);
      scene.add(pole);

      const lampHeadGeo = new THREE.SphereGeometry(0.4, 8, 8);
      const lampHeadMat = new THREE.MeshBasicMaterial({ color: 0xffea9f });
      const lampHead = new THREE.Mesh(lampHeadGeo, lampHeadMat);
      lampHead.position.set(lx, 7.1, z);
      scene.add(lampHead);
      city.lamps.push(lampHead);
    });
  }

  return city;
}

window.createCity = createCity;
