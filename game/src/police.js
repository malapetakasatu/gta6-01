// police.js: Tactical Police Response & AI Pursuits
export function createPoliceSystem(scene, vehicleFactory) {
  const units = [];
  let wantedLevel = 4; // 4 Stars active for high octane action

  // Spawn police pursuit cruisers
  const cruiser1 = vehicleFactory.createPoliceCruiser(-8, -32);
  const cruiser2 = vehicleFactory.createPoliceCruiser(12, -26);
  units.push({ vehicle: cruiser1, callsign: 'PATROL-42', tactic: 'RAMMING', dist: 14 });
  units.push({ vehicle: cruiser2, callsign: 'PATROL-18', tactic: 'PURSUIT', dist: 28 });

  // Tactical Air Unit Helicopter (CONDOR-1)
  const heli = vehicleFactory.createPoliceHelicopter(0, 36, -55);
  units.push({ vehicle: heli, callsign: 'CONDOR-1', tactic: 'SEARCHLIGHT', dist: 36 });

  function update(delta, playerPos) {
    // Spin helicopter rotors & flicker searchlight
    if (heli.rotorBlade) {
      heli.rotorBlade.rotation.y += delta * 30;
    }
    if (heli.spotlightCone) {
      heli.spotlightCone.lookAt(playerPos.x, playerPos.y, playerPos.z);
    }

    // Flash lightbars
    const time = Date.now() * 0.008;
    [cruiser1, cruiser2].forEach((c, idx) => {
      if (c.lightbar) {
        const r = c.lightbar.children[1];
        const b = c.lightbar.children[2];
        const flash = Math.sin(time + idx * Math.PI) > 0;
        r.material.color.setHex(flash ? 0xff0022 : 0x220005);
        b.material.color.setHex(!flash ? 0x0066ff : 0x001133);
      }
    });
  }

  return {
    units,
    wantedLevel,
    cruisers: [cruiser1, cruiser2],
    heli,
    update
  };
}
