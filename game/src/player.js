// player.js: Character Controller, Third-Person Camera & State
export function createPlayer(scene, camera) {
  const playerGroup = new THREE.Group();

  // Character Mesh (Low-poly stylized GTA protagonist)
  const skinMat = new THREE.MeshStandardMaterial({ color: 0xdfa07e, roughness: 0.6 });
  const hairMat = new THREE.MeshStandardMaterial({ color: 0x221814, roughness: 0.9 });
  const jacketMat = new THREE.MeshStandardMaterial({ color: 0xb71c1c, roughness: 0.5 }); // Crimson jacket
  const shirtMat = new THREE.MeshStandardMaterial({ color: 0xf5f5f5, roughness: 0.7 });
  const pantsMat = new THREE.MeshStandardMaterial({ color: 0x1a243b, roughness: 0.7 }); // Navy jeans
  const shoesMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3 });

  // Head
  const head = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.42, 0.38), skinMat);
  head.position.y = 1.62;
  head.castShadow = true;
  playerGroup.add(head);

  // Hair
  const hair = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.22, 0.42), hairMat);
  hair.position.set(0, 1.82, -0.02);
  playerGroup.add(hair);

  // Torso / Jacket
  const torso = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.75, 0.36), jacketMat);
  torso.position.y = 1.08;
  torso.castShadow = true;
  playerGroup.add(torso);

  const innerShirt = new THREE.Mesh(new THREE.PlaneGeometry(0.25, 0.5), shirtMat);
  innerShirt.position.set(0, 1.15, 0.19);
  playerGroup.add(innerShirt);

  // Arms
  const armL = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.65, 0.18), jacketMat);
  armL.position.set(-0.42, 1.05, 0);
  armL.castShadow = true;
  playerGroup.add(armL);

  const armR = armL.clone();
  armR.position.x = 0.42;
  playerGroup.add(armR);

  // Legs
  const legL = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.72, 0.24), pantsMat);
  legL.position.set(-0.16, 0.38, 0);
  legL.castShadow = true;
  playerGroup.add(legL);

  const legR = legL.clone();
  legR.position.x = 0.16;
  playerGroup.add(legR);

  // Shoes
  const shoeL = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.14, 0.38), shoesMat);
  shoeL.position.set(-0.16, 0.07, 0.05);
  playerGroup.add(shoeL);

  const shoeR = shoeL.clone();
  shoeR.position.x = 0.16;
  playerGroup.add(shoeR);

  playerGroup.position.set(0, 0, -45);
  scene.add(playerGroup);

  const player = {
    mesh: playerGroup,
    inVehicle: false,
    currentVehicle: null,
    health: 85,
    maxHealth: 100,
    armour: 60,
    maxArmour: 100,
    cash: 24850,
    wantedLevel: 4,
    speed: 0,
    walkSpeed: 7,
    runSpeed: 13,
    keys: { w: false, a: false, s: false, d: false, shift: false, space: false, e: false },
    activeWeaponIndex: 2 // SMG
  };

  // Input Listeners
  window.addEventListener('keydown', (e) => {
    const k = e.key.toLowerCase();
    if (k === 'w' || k === 'arrowup') player.keys.w = true;
    if (k === 's' || k === 'arrowdown') player.keys.s = true;
    if (k === 'a' || k === 'arrowleft') player.keys.a = true;
    if (k === 'd' || k === 'arrowright') player.keys.d = true;
    if (k === 'shift') player.keys.shift = true;
    if (k === ' ') player.keys.space = true;
    if (k === 'e' || k === 'f') player.keys.e = true;
  });

  window.addEventListener('keyup', (e) => {
    const k = e.key.toLowerCase();
    if (k === 'w' || k === 'arrowup') player.keys.w = false;
    if (k === 's' || k === 'arrowdown') player.keys.s = false;
    if (k === 'a' || k === 'arrowleft') player.keys.a = false;
    if (k === 'd' || k === 'arrowright') player.keys.d = false;
    if (k === 'shift') player.keys.shift = false;
    if (k === ' ') player.keys.space = false;
    if (k === 'e' || k === 'f') player.keys.e = false;
  });

  // Camera Follow Update
  player.updateCamera = function() {
    if (player.inVehicle && player.currentVehicle) {
      const v = player.currentVehicle.mesh;
      const camOffset = new THREE.Vector3(0, 4.2, -10.5);
      camOffset.applyQuaternion(v.quaternion);
      camera.position.lerp(v.position.clone().add(camOffset), 0.12);
      camera.lookAt(v.position.clone().add(new THREE.Vector3(0, 1.2, 0)));
    } else {
      const p = playerGroup.position;
      const camOffset = new THREE.Vector3(0, 3.2, -6.5);
      camera.position.lerp(p.clone().add(camOffset), 0.1);
      camera.lookAt(p.clone().add(new THREE.Vector3(0, 1.4, 0)));
    }
  };

  return player;
}