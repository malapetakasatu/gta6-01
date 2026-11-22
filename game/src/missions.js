// SOLIS CITY: CORAL COAST - 8 Story Missions Across 6 Districts
// Manages mission progression, objectives, waypoints, radio transmissions,
// and district narrative milestones.

export const STORY_MISSIONS = [
  {
    id: 1,
    title: 'CORAL WELCOME',
    act: 'ACT I · OPERATION CORAL',
    district: 'CORAL MARINA',
    objective: 'Meet contact Esteban at Marina Pier 4 and evade local patrol',
    waypoint: { x: -90, z: 200 },
    wantedOnStart: 1,
    dialogue: {
      speaker: 'ESTEBAN (RADIO)',
      text: '"Welcome to Solis City, kid. Grab the wheels at Pier 4 before the local precinct gets curious."'
    }
  },
  {
    id: 2,
    title: 'NEON HIGHWAY',
    act: 'ACT I · OPERATION CORAL',
    district: 'OCEAN DRIVE',
    objective: 'Sprint down the coastal expressway to the Palm Club under 90s',
    waypoint: { x: -90, z: -200 },
    wantedOnStart: 1,
    dialogue: {
      speaker: 'ESTEBAN (RADIO)',
      text: '"Floor it down Ocean Drive! Keep it above 120 MPH and shake any tail on the promenade."'
    }
  },
  {
    id: 3,
    title: 'ASSET SEIZURE',
    act: 'ACT II · THE UNDERBELLY',
    district: 'DOWNTOWN',
    objective: 'Infiltrate Horizon Bank plaza and secure the encrypted drive',
    waypoint: { x: 45, z: 80 },
    wantedOnStart: 2,
    dialogue: {
      speaker: 'VALERIA (DISPATCH)',
      text: '"Horizon Bank security is alerted. Grab the drive from the courtyard vault and punch your way out!"'
    }
  },
  {
    id: 4,
    title: 'HARBOR AMBUSH',
    act: 'ACT II · THE UNDERBELLY',
    district: 'INDUSTRIAL HARBOR',
    objective: 'Survive syndicate ambush at the cargo container shipyard',
    waypoint: { x: 210, z: 180 },
    wantedOnStart: 2,
    dialogue: {
      speaker: 'VALERIA (DISPATCH)',
      text: '"It is a setup at the docks! Syndicate enforcers are boxing you in with shipping containers!"'
    }
  },
  {
    id: 5,
    title: 'SKYLINE HEIST',
    act: 'ACT III · HIGH STAKES',
    district: 'DOWNTOWN',
    objective: 'Steal prototype Veloce GTS Turbo from penthouse garage',
    waypoint: { x: 45, z: 0 },
    wantedOnStart: 3,
    dialogue: {
      speaker: 'ESTEBAN (RADIO)',
      text: '"The Veloce GTS Turbo is the fastest machine in Coral Coast. Once you grab it, CPD tactical is on code red!"'
    }
  },
  {
    id: 6,
    title: 'CONDOR DOWN',
    act: 'ACT III · HIGH STAKES',
    district: 'NEON PALMS',
    objective: 'Survive 4-star manhunt and evade CONDOR-1 tactical helicopter',
    waypoint: { x: 0, z: -200 },
    wantedOnStart: 4,
    dialogue: {
      speaker: 'CPD DISPATCH',
      text: '"AIR-1 CONDOR HAS EYES ON SUSPECT! ALL GROUND UNITS ENGAGE WITH MAXIMUM FORCE!"'
    }
  },
  {
    id: 7,
    title: 'COASTLINE DELIVERY',
    act: 'ACT IV · ENDGAME',
    district: 'SUNSET HEIGHTS',
    objective: 'Break through tactical CPD roadblocks across the Metro bridge',
    waypoint: { x: 180, z: -80 },
    wantedOnStart: 3,
    dialogue: {
      speaker: 'VALERIA (RADIO)',
      text: '"They have locked down the bridge with cruisers and spike strips! Ram through or find an alleyway!"'
    }
  },
  {
    id: 8,
    title: 'APEX PREDATOR',
    act: 'ACT IV · ENDGAME',
    district: 'OCEAN DRIVE',
    objective: 'Final showdown at Sunset Pier - eliminate syndicate boss and escape',
    waypoint: { x: -90, z: -280 },
    wantedOnStart: 4,
    dialogue: {
      speaker: 'ESTEBAN (RADIO)',
      text: '"This is the finish line. Take down the syndicate convoy at Sunset Pier and Solis City is ours!"'
    }
  }
];

export class MissionManager {
  constructor(game) {
    this.game = game;
    this.currentMissionIndex = 4; // Start at iconic Mission 5: SKYLINE HEIST
    this.state = 'active'; // 'active', 'completed', 'failed'
    this.missionTimer = 0;
    this.dialogueTimer = 0;
    this.isDialogueActive = false;
  }

  getCurrentMission() {
    return STORY_MISSIONS[this.currentMissionIndex];
  }

  startMission(index) {
    if (index >= 0 && index < STORY_MISSIONS.length) {
      this.currentMissionIndex = index;
      this.state = 'active';
      this.missionTimer = 0;

      const m = this.getCurrentMission();
      this.showDialogue(m.dialogue.speaker, m.dialogue.text);

      if (this.game && this.game.police) {
        this.game.police.setWantedLevel(m.wantedOnStart);
      }
    }
  }

  showDialogue(speaker, text, duration = 6.0) {
    this.isDialogueActive = true;
    this.dialogueTimer = duration;

    const banner = document.getElementById('hud-dialogue');
    const spkEl = document.getElementById('hud-speaker');
    const txtEl = document.getElementById('hud-dialogue-text');

    if (banner && spkEl && txtEl) {
      spkEl.textContent = speaker;
      txtEl.textContent = text;
      banner.classList.add('active');
    }
  }

  update(dt, playerPos) {
    if (this.state !== 'active') return;

    this.missionTimer += dt;

    // Subtitle dialogue timer
    if (this.isDialogueActive) {
      this.dialogueTimer -= dt;
      if (this.dialogueTimer <= 0) {
        this.isDialogueActive = false;
        const banner = document.getElementById('hud-dialogue');
        if (banner) banner.classList.remove('active');
      }
    }

    // Check waypoint arrival
    const m = this.getCurrentMission();
    const distToWaypoint = Math.hypot(playerPos.x - m.waypoint.x, playerPos.z - m.waypoint.z);

    if (distToWaypoint < 12.0) {
      this.completeMission();
    }
  }

  completeMission() {
    this.state = 'completed';
    const m = this.getCurrentMission();
    this.showDialogue('SYSTEM', `★ MISSION PASSED: ${m.title}! +$25,000 REWARD`);

    if (this.game && this.game.player) {
      this.game.player.cash += 25000;
    }

    // Advance to next mission after delay
    setTimeout(() => {
      const nextIdx = (this.currentMissionIndex + 1) % STORY_MISSIONS.length;
      this.startMission(nextIdx);
    }, 4500);
  }
}
