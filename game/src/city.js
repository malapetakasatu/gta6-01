// city.js: Procedural 3D Coastal Metropolis - Solis City
export function createCity(scene) {
  const city = {
    buildings: [],
    props: [],
    palmTrees: [],
    roads: [],
    colliders: []
  };

  // 1. Lighting Setup (Warm Golden Hour Sunset)
  const ambientLight = new THREE.AmbientLight(0xffeedd, 0.45);
  scene.add(ambientLight);

  const sunLight = new THREE.DirectionalLight(0xff9944, 1.2);
  sunLight.position.set(120, 80, -100);
  sunLight.castShadow = true;
  sunLight.shadow.mapSize.width = 2048;
  sunLight.shadow.mapSize.height = 2048;
  sunLight.shadow.camera.near = 10;
  sunLight.shadow.camera.far = 400;
  const d = 150;
  sunLight.shadow.camera.left = -d;
  sunLight.shadow.camera.right = d;
  sunLight.shadow.camera.top = d;
  sunLight.shadow.camera.bottom = -d;
  scene.add(sunLight);

  const hemiLight = new THREE.HemisphereLight(0xffa07a, 0x1a2b4c, 0.5);
  scene.add(hemiLight);

  // 2. Terrain & Ocean
  // Ocean plane
  const oceanGeo = new THREE.PlaneGeometry(1000, 1000);
  const oceanMat = new THREE.MeshStandardMaterial({
    color: 0x0a4d68,
    roughness: 0.15,
    metalness: 0.8
  });
  const ocean = new THREE.Mesh(oceanGeo, oceanMat);
  ocean.rotation.x = -Math.PI / 2;
  ocean.position.set(0, -0.5, -350);
  scene.add(ocean);

  // Beach sand
  const sandGeo = new THREE.PlaneGeometry(800, 80);
  const sandMat = new THREE.MeshStandardMaterial({
    color: 0xdec697,
    roughness: 0.9,
    metalness: 0.05
  });
  const sand = new THREE.Mesh(sandGeo, sandMat);
  sand.rotation.x = -Math.PI / 2;
  sand.position.set(0, 0, -110);
  sand.receiveShadow = true;
  scene.add(sand);

  // Main Boulevard Asphalt
  const roadGeo = new THREE.PlaneGeometry(800, 40);
  const roadMat = new THREE.MeshStandardMaterial({
    color: 0x222429,
    roughness: 0.7,
    metalness: 0.1
  });
  const mainRoad = new THREE.Mesh(roadGeo, roadMat);
  mainRoad.rotation.x = -Math.PI / 2;
  mainRoad.position.set(0, 0.05, -50);
  mainRoad.receiveShadow = true;
  scene.add(mainRoad);

  // Yellow double center lines
  const lineMat = new THREE.MeshBasicMaterial({ color: 0xffcc00 });
  for (let x = -380; x < 380; x += 15) {
    const dash = new THREE.Mesh(new THREE.PlaneGeometry(10, 0.35), lineMat);
    dash.rotation.x = -Math.PI / 2;
    dash.position.set(x, 0.08, -50);
    scene.add(dash);
  }

  // Cross streets
  const crossGeo = new THREE.PlaneGeometry(24, 250);
  for (let cx = -300; cx <= 300; cx += 100) {
    const cross = new THREE.Mesh(crossGeo, roadMat);
    cross.rotation.x = -Math.PI / 2;
    cross.position.set(cx, 0.04, 50);
    cross.receiveShadow = true;
    scene.add(cross);
  }

  // Sidewalks
  const walkGeo = new THREE.BoxGeometry(800, 0.25, 8);
  const walkMat = new THREE.MeshStandardMaterial({ color: 0x8a939e, roughness: 0.8 });
  const walkSouth = new THREE.Mesh(walkGeo, walkMat);
  walkSouth.position.set(0, 0.12, -74);
  scene.add(walkSouth);
  const walkNorth = new THREE.Mesh(walkGeo, walkMat);
  walkNorth.position.set(0, 0.12, -26);
  scene.add(walkNorth);

  // 3. Palm Trees along Boulevard
  function makePalmTree(x, z) {
    const group = new THREE.Group();
    // Trunk
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x6e5238, roughness: 0.9 });
    for (let i = 0; i < 5; i++) {
      const seg = new THREE.Mesh(new THREE.CylinderGeometry(0.35 - i * 0.04, 0.45 - i * 0.04, 1.8, 7), trunkMat);
      seg.position.set(Math.sin(i * 0.2) * 0.3, i * 1.6 + 0.9, 0);
      seg.rotation.z = -0.05 * i;
      seg.castShadow = true;
      group.add(seg);
    }
    // Fronds
    const frondMat = new THREE.MeshStandardMaterial({ color: 0x2e7d32, roughness: 0.6, side: THREE.DoubleSide });
    for (let a = 0; a < 8; a++) {
      const angle = (a / 8) * Math.PI * 2;
      const frond = new THREE.Mesh(new THREE.ConeGeometry(1.2, 4.5, 4), frondMat);
      frond.position.set(Math.sin(angle) * 1.8 + 0.8, 8.5, Math.cos(angle) * 1.8);
      frond.rotation.set(Math.cos(angle) * 0.9, 0, Math.sin(angle) * 0.9);
      frond.castShadow = true;
      group.add(frond);
    }
    group.position.set(x, 0, z);
    scene.add(group);
    city.palmTrees.push(group);
  }

  for (let px = -360; px <= 360; px += 24) {
    makePalmTree(px, -74);
  }

  // 4. City Buildings Grid (North of Boulevard)
  const bldgColors = [0xeae6df, 0xd4cdc3, 0xf0ece1, 0x3d4a5d, 0x2b3848, 0x8d9cae, 0xcd7f32];
  const neonColors = [0xff0055, 0x00e5ff, 0xffaa00, 0x76ff03, 0xd500f9];

  let bldgIndex = 0;
  for (let bz = 0; bz <= 160; bz += 48) {
    for (let bx = -340; bx <= 340; bx += 40) {
      if (Math.abs(bx % 100) < 18) continue; // Leave cross-street intersections clear

      const bw = 24 + (Math.sin(bx * 0.1) + 1) * 4;
      const bd = 28;
      const bh = 18 + (Math.cos(bx * 0.05 + bz * 0.03) + 1) * 22 + (bz > 80 ? 30 : 0);

      const bColor = bldgColors[bldgIndex % bldgColors.length];
      const bMat = new THREE.MeshStandardMaterial({
        color: bColor,
        roughness: 0.5,
        metalness: 0.2
      });

      const bldg = new THREE.Mesh(new THREE.BoxGeometry(bw, bh, bd), bMat);
      bldg.position.set(bx, bh / 2, bz);
      bldg.castShadow = true;
      bldg.receiveShadow = true;
      scene.add(bldg);

      // Windows Grid Texture/Decals
      const winMat = new THREE.MeshBasicMaterial({
        color: (bx + bz) % 3 === 0 ? 0xffea88 : 0x111c2a
      });
      for (let wy = 3; wy < bh - 4; wy += 4.5) {
        const winBand = new THREE.Mesh(new THREE.PlaneGeometry(bw - 2, 1.8), winMat);
        winBand.position.set(bx, wy, bz - bd / 2 - 0.05);
        winBand.rotation.y = Math.PI;
        scene.add(winBand);
      }

      // Rooftop props (AC units, water tower)
      if (bh > 28) {
        const ac = new THREE.Mesh(new THREE.BoxGeometry(3, 2, 4), new THREE.MeshStandardMaterial({ color: 0x555555 }));
        ac.position.set(bx + 4, bh + 1, bz);
        scene.add(ac);
      }

      // Neon sign on front facade
      if (bz === 0 && (bldgIndex % 2 === 0)) {
        const signColor = neonColors[bldgIndex % neonColors.length];
        const signMat = new THREE.MeshBasicMaterial({ color: signColor });
        const sign = new THREE.Mesh(new THREE.BoxGeometry(bw * 0.6, 2.5, 0.4), signMat);
        sign.position.set(bx, 10, bz - bd / 2 - 0.3);
        scene.add(sign);
      }

      city.buildings.push(bldg);
      city.colliders.push({
        minX: bx - bw / 2, maxX: bx + bw / 2,
        minZ: bz - bd / 2, maxZ: bz + bd / 2
      });

      bldgIndex++;
    }
  }

  return city;
}
