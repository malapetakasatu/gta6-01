// hud.js: Radar Canvas, Vector GPS Map & Interface Renderer
export function createHUD() {
  const radarCanvas = document.getElementById('radar-canvas');
  const radarCtx = radarCanvas ? radarCanvas.getContext('2d') : null;

  function drawRadar(playerPos, playerAngle, enemies = []) {
    if (!radarCtx) return;
    const w = 170, h = 170;
    const cx = w / 2, cy = h / 2;

    radarCtx.clearRect(0, 0, w, h);

    // Dark Map Background
    radarCtx.fillStyle = '#0a101a';
    radarCtx.fillRect(0, 0, w, h);

    // Ocean zone (top/left)
    radarCtx.fillStyle = '#062033';
    radarCtx.beginPath();
    radarCtx.arc(cx, cy, 82, 0, Math.PI * 2);
    radarCtx.fill();

    // Road grid network
    radarCtx.strokeStyle = '#22384d';
    radarCtx.lineWidth = 6;
    radarCtx.beginPath();
    // Boulevard
    radarCtx.moveTo(0, cy + 12);
    radarCtx.lineTo(w, cy + 12);
    // Cross streets
    radarCtx.moveTo(cx - 35, 0);
    radarCtx.lineTo(cx - 35, h);
    radarCtx.moveTo(cx + 40, 0);
    radarCtx.lineTo(cx + 40, h);
    radarCtx.stroke();

    // Purple GPS Mission Route
    radarCtx.strokeStyle = '#aa00ff';
    radarCtx.lineWidth = 3.5;
    radarCtx.beginPath();
    radarCtx.moveTo(cx, cy);
    radarCtx.lineTo(cx + 40, cy + 12);
    radarCtx.lineTo(cx + 40, cy - 45);
    radarCtx.lineTo(cx + 65, cy - 45);
    radarCtx.stroke();

    // Mission Objective Waypoint (Yellow Diamond)
    radarCtx.fillStyle = '#ffea00';
    radarCtx.beginPath();
    radarCtx.arc(cx + 65, cy - 45, 4.5, 0, Math.PI * 2);
    radarCtx.fill();

    // Enemy Police Blips (Red flashing dots)
    radarCtx.fillStyle = '#ff1744';
    enemies.forEach(e => {
      radarCtx.beginPath();
      radarCtx.arc(cx + e.x, cy + e.y, 4, 0, Math.PI * 2);
      radarCtx.fill();
    });

    // Player Heading Indicator (White / Cyan Arrow)
    radarCtx.save();
    radarCtx.translate(cx, cy);
    radarCtx.rotate(-playerAngle);
    radarCtx.fillStyle = '#ffffff';
    radarCtx.beginPath();
    radarCtx.moveTo(0, -7);
    radarCtx.lineTo(5, 6);
    radarCtx.lineTo(0, 3);
    radarCtx.lineTo(-5, 6);
    radarCtx.closePath();
    radarCtx.fill();
    radarCtx.restore();

    // Compass Border Ring
    radarCtx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    radarCtx.lineWidth = 2;
    radarCtx.beginPath();
    radarCtx.arc(cx, cy, 83, 0, Math.PI * 2);
    radarCtx.stroke();

    // North marker
    radarCtx.fillStyle = '#00e5ff';
    radarCtx.font = 'bold 9px sans-serif';
    radarCtx.fillText('N', cx - 3, 14);
  }

  // Draw initial radar
  drawRadar({ x: 0, z: 0 }, 0, [{ x: -22, y: 15 }, { x: 18, y: 28 }, { x: 5, y: -35 }]);

  return {
    drawRadar
  };
}