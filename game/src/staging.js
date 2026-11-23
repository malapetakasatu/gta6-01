import * as THREE from './three.module.js';

/**
 * Solis City: Coral Coast - Cinematic Staging Engine
 * Deterministic scene composition for automated screenshot capture and cinematics:
 * - 'chase': 4-star Ocean Blvd pursuit with drifting supercar, CPD cruisers with strobes, roadblock, CONDOR-1 searchlight.
 * - 'combat': Downtown Coral Bank firefight with aiming CAR-80, glowing muzzle flash, bullet tracers, alert status.
 * - 'street': Sunset cruise on Ocean Drive with golden hour lighting, palm trees, skyscraper skyline, luxury traffic.
 * - 'title': Solis City twilight panorama overlooking 44 skyscrapers and ocean bay.
 */

export function stageScene(engine, shotName) {
  const { scene, camera, player, vehicles, police, combat, city, hud } = engine;
  console.log(`[Staging] Composing deterministic scene for shot: ${shotName}`);

  // Base adjustments
  if (engine.sunLight) {
    scene.remove(engine.sunLight);
  }
  if (engine.ambientLight) {
    scene.remove(engine.ambientLight);
  }

  const titleCard = document.getElementById('title-card');
  if (titleCard) {
    titleCard.style.display = shotName === 'title' ? 'block' : 'none';
  }

  switch (shotName) {
    case 'chase': {
      // 4-star high-speed pursuit along Ocean Blvd
      police.setWantedLevel(4);

      // Sky & Lighting: Night twilight with cool blue & electric magenta ambience
      scene.background = new THREE.Color(0x0a0f1d);
      scene.fog = new THREE.FogExp2(0x0a0f1d, 0.005);

      const amb = new THREE.AmbientLight(0x28385e, 1.4);
      scene.add(amb);
      const moon = new THREE.DirectionalLight(0x6a89cc, 1.8);
      moon.position.set(60, 100, 40);
      scene.add(moon);

      // Player in Veloce GTS supercar drifting along Ocean Blvd
      const car = vehicles.playerVehicle;
      car.mesh.position.set(240, 0, 0);
      car.mesh.rotation.y = -0.22; // counter-steer drift yaw
      car.steerAngle = 0.38;
      car.speed = 40;
      player.enterVehicle(car);

      // Two CPD Pursuit Cruisers trailing closely behind with active strobes
      police.spawnCruiser(new THREE.Vector3(236, 0, -22), -0.15);
      police.spawnCruiser(new THREE.Vector3(244, 0, -36), 0.12);

      // Roadblock ahead on the road
      police.spawnRoadblock(new THREE.Vector3(240, 0, 75));

      // CONDOR-1 Helicopter overhead with spotlight cone
      if (!police.helicopter) {
        police.spawnHelicopter();
      }
      police.helicopter.mesh.position.set(240, 32, -10);
      police.helicopter.spotlight.position.set(240, 32, -10);
      police.helicopter.spotlight.target.position.set(240, 0, 4);
      police.helicopter.spotlight.target.updateMatrixWorld();
      police.helicopter.spotlight.intensity = 8.0;

      // Ensure strobe lights on cruisers are intensely lit
      police.units.forEach((unit, idx) => {
        unit.parts.redMat.emissiveIntensity = idx % 2 === 0 ? 5.0 : 0.5;
        unit.parts.redPoint.intensity = idx % 2 === 0 ? 4.0 : 0.5;
        unit.parts.blueMat.emissiveIntensity = idx % 2 !== 0 ? 5.0 : 0.5;
        unit.parts.bluePoint.intensity = idx % 2 !== 0 ? 4.0 : 0.5;
      });

      // Dramatic low-angle dynamic chase camera
      camera.position.set(248, 2.6, -14);
      camera.lookAt(239, 1.2, 10);
      break;
    }

    case 'combat': {
      // Downtown Coral Bank firefight
      police.setWantedLevel(3);

      scene.background = new THREE.Color(0x0e1322);
      scene.fog = new THREE.FogExp2(0x0e1322, 0.007);

      const amb = new THREE.AmbientLight(0x3a4b6e, 1.2);
      scene.add(amb);
      const streetGlow = new THREE.DirectionalLight(0x5599ff, 1.5);
      streetGlow.position.set(-30, 80, -20);
      scene.add(streetGlow);

      // Position player on foot outside highrise bank
      player.mesh.position.set(45, 0, 45);
      player.mesh.rotation.y = Math.PI * 0.85;
      player.mesh.visible = true;

      // Raise aiming arm
      if (player.rightArm) {
        player.rightArm.rotation.x = -Math.PI / 2.2;
      }

      // Police unit arriving at corner with sirens
      police.spawnCruiser(new THREE.Vector3(42, 0, 72), Math.PI);
      police.units.forEach(u => {
        u.parts.redMat.emissiveIntensity = 5.0;
        u.parts.blueMat.emissiveIntensity = 5.0;
        u.parts.redPoint.intensity = 3.5;
        u.parts.bluePoint.intensity = 3.5;
      });

      // Active muzzle flash and dynamic yellow tracer lines
      combat.flashLight.position.set(45.4, 1.4, 46.2);
      combat.flashLight.intensity = 6.0;

      // Fire multiple tracers through the plaza
      combat.createTracer(new THREE.Vector3(45.4, 1.4, 46.2), new THREE.Vector3(42.5, 1.0, 70));
      combat.createTracer(new THREE.Vector3(45.4, 1.35, 46.2), new THREE.Vector3(41.0, 1.2, 72));

      // Over-the-shoulder intense combat camera
      camera.position.set(43.8, 1.85, 42.6);
      camera.lookAt(45.2, 1.4, 65.0);
      break;
    }

    case 'street': {
      // Sunset golden hour cruise along Ocean Drive palm promenade
      police.setWantedLevel(0);

      // Warm Miami golden hour lighting & pink haze
      scene.background = new THREE.Color(0x3d203a);
      scene.fog = new THREE.FogExp2(0x3d203a, 0.0035);

      const amb = new THREE.AmbientLight(0xff9977, 1.6);
      scene.add(amb);

      const sun = new THREE.DirectionalLight(0xffb366, 3.2);
      sun.position.set(200, 40, -120);
      scene.add(sun);

      // Player in electric cyan supercar cruising Ocean Drive
      const car = vehicles.playerVehicle;
      car.mesh.position.set(240, 0, -30);
      car.mesh.rotation.y = 0;
      car.speed = 26;
      player.enterVehicle(car);

      // Civilian sports car in adjacent lane
      const civilian = vehicles.vehicles.find(v => v !== car);
      if (civilian) {
        civilian.mesh.position.set(234, 0, 22);
        civilian.mesh.rotation.y = 0;
      }

      // Elegant side tracking camera showcasing supercar, palms, and skyline
      camera.position.set(256, 3.2, -22);
      camera.lookAt(238, 1.1, -26);
      break;
    }

    case 'title':
    default: {
      // Solis City twilight panorama overlooking skyscrapers and ocean bay
      police.setWantedLevel(0);

      scene.background = new THREE.Color(0x0c1124);
      scene.fog = new THREE.FogExp2(0x0c1124, 0.003);

      const amb = new THREE.AmbientLight(0x405580, 1.5);
      scene.add(amb);

      const duskLight = new THREE.DirectionalLight(0x00f0ff, 1.6);
      duskLight.position.set(120, 180, 100);
      scene.add(duskLight);

      // Helicopter with searchlight hovering over bay in midground
      if (!police.helicopter) {
        police.spawnHelicopter();
      }
      police.helicopter.mesh.position.set(120, 55, -80);
      police.helicopter.spotlight.position.set(120, 55, -80);
      police.helicopter.spotlight.target.position.set(90, 0, -40);
      police.helicopter.spotlight.target.updateMatrixWorld();

      // Elevated breathtaking skyline & bay camera
      camera.position.set(210, 95, -190);
      camera.lookAt(30, 25, 20);
      break;
    }
  }

  // Update HUD state for the shot
  hud.update(0.016, player, vehicles.playerVehicle, police, null, combat);
}
