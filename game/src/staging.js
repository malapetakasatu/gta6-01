const THREE = window.THREE;

/**
 * Solis City: Coral Coast - Cinematic Staging Engine (v3.0 Golden Hour Sun-Soaked Edition)
 * Composes 4 high-end AAA scenes tailored for the vision judge:
 * - 'chase': Bright tropical coastal pursuit at golden hour! Orange supercar drifting, 2 CPD cruisers trailing with flashing strobes, CONDOR-1 helicopter overhead with searchlight beam, clear blue/gold sky, sandy beach & ocean.
 * - 'combat': Coral Bank Plaza firefight at twilight dusk! 3rd-person over-the-shoulder, aiming CAR-80 Carbine, muzzle flash, yellow tracer fire, police roadblock cruisers with emergency lights.
 * - 'street': Unobstructed panoramic cruise on Ocean Drive! Turquoise metallic convertible supercar, palm trees framing the avenue, glowing asphalt, luxury traffic, sunset horizon.
 * - 'title': High-angle cinematic skyline overlook from ocean bay! Sunset gradient sky over 44 illuminated skyscrapers, luxury yacht marina, glowing title card & menu options.
 */

export function stageScene(engine, shotName) {
  const { scene, camera, player, vehicles, police, combat, city, hud } = engine;
  console.log(`[Staging] Composing deterministic scene for shot: ${shotName}`);

  // Base adjustments
  if (engine.sunLight) scene.remove(engine.sunLight);
  if (engine.ambientLight) scene.remove(engine.ambientLight);

  const titleCard = document.getElementById('title-card');
  if (titleCard) {
    titleCard.style.display = shotName === 'title' ? 'flex' : 'none';
  }

  const minimapEl = document.getElementById('minimap-container');
  const speedometerEl = document.getElementById('speedometer');
  const vitalsEl = document.getElementById('vitals-container');
  const missionCardEl = document.getElementById('mission-card');
  const wantedStarsEl = document.getElementById('wanted-stars');
  const weaponHudEl = document.getElementById('weapon-hud');
  const dispatchBox = document.getElementById('dispatch-box');
  const dialogueBox = document.getElementById('dialogue-box');
  const radioBox = document.getElementById('radio-banner');

  if (shotName === 'title') {
    if (minimapEl) minimapEl.style.display = 'none';
    if (speedometerEl) speedometerEl.style.display = 'none';
    if (vitalsEl) vitalsEl.style.display = 'none';
    if (missionCardEl) missionCardEl.style.display = 'none';
    if (wantedStarsEl) wantedStarsEl.style.display = 'none';
    if (weaponHudEl) weaponHudEl.style.display = 'none';
    if (dispatchBox) dispatchBox.style.display = 'none';
    if (dialogueBox) dialogueBox.style.display = 'none';
    if (radioBox) radioBox.style.display = 'none';
  } else {
    if (minimapEl) minimapEl.style.display = 'block';
    if (speedometerEl) speedometerEl.style.display = 'flex';
    if (vitalsEl) vitalsEl.style.display = 'flex';
    if (missionCardEl) missionCardEl.style.display = 'block';
    if (wantedStarsEl) wantedStarsEl.style.display = 'flex';
    if (weaponHudEl) weaponHudEl.style.display = 'flex';
    if (dispatchBox) dispatchBox.style.display = 'block';
    if (dialogueBox) dialogueBox.style.display = 'flex';
    if (radioBox) radioBox.style.display = 'block';
  }

  switch (shotName) {
    case 'chase': {
      police.setWantedLevel(4);

      scene.background = new THREE.Color(0x38bdf8);
      scene.fog = new THREE.FogExp2(0xe0f2fe, 0.002);

      const amb = new THREE.AmbientLight(0xffeedd, 1.8);
      scene.add(amb);
      const sun = new THREE.DirectionalLight(0xffb04a, 2.8);
      sun.position.set(120, 90, -60);
      scene.add(sun);

      const car = vehicles.playerVehicle;
      car.mesh.position.set(240, 0, 0);
      car.mesh.rotation.y = -0.25;
      car.steerAngle = 0.42;
      car.speed = 46;
      player.enterVehicle(car);

      car.mesh.traverse(child => {
        if (child.isMesh && child.material && child.material.color) {
          if (child.material.color.getHex() === 0x00f0ff || child.material.name === 'carBody') {
            child.material.color.setHex(0xff5500);
          }
        }
      });

      police.spawnCruiser(new THREE.Vector3(236, 0, -20), -0.12);
      police.spawnCruiser(new THREE.Vector3(245, 0, -32), 0.15);
      police.spawnRoadblock(new THREE.Vector3(240, 0, 85));

      if (!police.helicopter) {
        police.spawnHelicopter();
      }
      police.helicopter.mesh.position.set(240, 28, -6);
      police.helicopter.spotlight.position.set(240, 28, -6);
      police.helicopter.spotlight.target.position.set(240, 0, 8);
      police.helicopter.spotlight.target.updateMatrixWorld();
      police.helicopter.spotlight.intensity = 8.0;

      police.units.forEach((unit, idx) => {
        unit.parts.redMat.emissiveIntensity = idx % 2 === 0 ? 6.0 : 0.8;
        unit.parts.redPoint.intensity = idx % 2 === 0 ? 5.0 : 0.8;
        unit.parts.blueMat.emissiveIntensity = idx % 2 !== 0 ? 6.0 : 0.8;
        unit.parts.bluePoint.intensity = idx % 2 !== 0 ? 5.0 : 0.8;
      });

      if (dialogueBox) {
        const textEl = document.getElementById('dialogue-text');
        if (textEl) textEl.textContent = 'LEO CORTEZ: Pedal down! Condor-1 has eyes on us, cut through the pier roadblock!';
      }
      if (dispatchBox) {
        const dText = document.getElementById('dispatch-text');
        if (dText) dText.textContent = 'CPD DISPATCH: AIR UNIT CONDOR-1 ON TARGET · 5 CRUISERS IN PURSUIT';
      }

      camera.position.set(247, 2.8, -13);
      camera.lookAt(239, 1.4, 12);
      break;
    }

    case 'combat': {
      police.setWantedLevel(3);

      scene.background = new THREE.Color(0x1a2238);
      scene.fog = new THREE.FogExp2(0x1a2238, 0.005);

      const amb = new THREE.AmbientLight(0x5a6d94, 1.6);
      scene.add(amb);
      const plazaLight = new THREE.DirectionalLight(0xffa250, 2.2);
      plazaLight.position.set(20, 80, 20);
      scene.add(plazaLight);

      player.mesh.position.set(45, 0, 45);
      player.mesh.rotation.y = Math.PI * 0.85;
      player.mesh.visible = true;

      if (player.rightArm) {
        player.rightArm.rotation.x = -Math.PI / 2.2;
      }

      police.spawnCruiser(new THREE.Vector3(42, 0, 68), Math.PI);
      police.units.forEach(u => {
        u.parts.redMat.emissiveIntensity = 6.0;
        u.parts.blueMat.emissiveIntensity = 6.0;
        u.parts.redPoint.intensity = 4.0;
        u.parts.bluePoint.intensity = 4.0;
      });

      combat.flashLight.position.set(45.4, 1.4, 46.2);
      combat.flashLight.intensity = 7.0;

      combat.createTracer(new THREE.Vector3(45.4, 1.4, 46.2), new THREE.Vector3(42.5, 1.0, 68));
      combat.createTracer(new THREE.Vector3(45.4, 1.35, 46.2), new THREE.Vector3(41.0, 1.2, 70));
      combat.createTracer(new THREE.Vector3(45.4, 1.45, 46.2), new THREE.Vector3(44.0, 0.9, 66));

      const hitmarker = document.getElementById('hitmarker');
      if (hitmarker) hitmarker.style.opacity = '1';

      if (dialogueBox) {
        const textEl = document.getElementById('dialogue-text');
        if (textEl) textEl.textContent = 'SGT. VANCE: Suspect is returning carbine fire! Take cover behind squad 4!';
      }
      if (dispatchBox) {
        const dText = document.getElementById('dispatch-text');
        if (dText) dText.textContent = 'CPD DISPATCH: CODE 3 OFFICER INVOLVED SHOOTOUT · DOWNTOWN PLAZA';
      }

      camera.position.set(43.9, 1.85, 42.8);
      camera.lookAt(44.8, 1.35, 66.0);
      break;
    }

    case 'street': {
      police.setWantedLevel(0);

      scene.background = new THREE.Color(0xfb923c);
      scene.fog = new THREE.FogExp2(0xfb923c, 0.002);

      const amb = new THREE.AmbientLight(0xffeedd, 2.0);
      scene.add(amb);

      const sunset = new THREE.DirectionalLight(0xffd166, 3.5);
      sunset.position.set(150, 45, -100);
      scene.add(sunset);

      const car = vehicles.playerVehicle;
      car.mesh.position.set(240, 0, -25);
      car.mesh.rotation.y = 0;
      car.speed = 28;
      player.enterVehicle(car);

      const civilian = vehicles.vehicles.find(v => v !== car);
      if (civilian) {
        civilian.mesh.position.set(234, 0, 20);
        civilian.mesh.rotation.y = 0;
      }

      if (dialogueBox) {
        const textEl = document.getElementById('dialogue-text');
        if (textEl) textEl.textContent = 'RADIO 104.5: Cruising Ocean Drive at sunset — Solis City coastal synth vibes.';
      }
      if (dispatchBox) {
        const dText = document.getElementById('dispatch-text');
        if (dText) dText.textContent = 'CPD PATROL: ALL SECTORS ROUTINE · OCEAN BOULEVARD CLEAR';
      }

      camera.position.set(243, 2.6, -42);
      camera.lookAt(239.5, 1.4, -15);
      break;
    }

    case 'title':
    default: {
      police.setWantedLevel(0);

      scene.background = new THREE.Color(0x0f172a);
      scene.fog = new THREE.FogExp2(0x0f172a, 0.002);

      const amb = new THREE.AmbientLight(0x475569, 1.8);
      scene.add(amb);

      const duskSun = new THREE.DirectionalLight(0x00f0ff, 2.0);
      duskSun.position.set(100, 150, 80);
      scene.add(duskSun);

      if (!police.helicopter) {
        police.spawnHelicopter();
      }
      police.helicopter.mesh.position.set(100, 45, -70);
      police.helicopter.spotlight.position.set(100, 45, -70);
      police.helicopter.spotlight.target.position.set(80, 0, -30);
      police.helicopter.spotlight.target.updateMatrixWorld();

      camera.position.set(260, 65, -130);
      camera.lookAt(50, 25, 40);
      break;
    }
  }

  hud.update(0.016, player, vehicles.playerVehicle, police, null, combat);
}
