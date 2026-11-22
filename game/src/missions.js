// missions.js: Story Campaign & District Standing
export function createMissionManager() {
  const missions = [
    {
      id: 1,
      act: "ACT I · THE LANDING",
      title: "COASTAL PICKUP",
      desc: "Meet Lucia at Coral Pier and recover the Veloce GTS from the impound.",
      reward: 4500,
      completed: true
    },
    {
      id: 2,
      act: "ACT I · THE LANDING",
      title: "NEON ALLEY RUN",
      desc: "Smuggle contraband through downtown back-alleys without raising 2 stars.",
      reward: 6000,
      completed: true
    },
    {
      id: 3,
      act: "ACT II · OPERATION OVERDRIVE",
      title: "MARKET SQUEEZE",
      desc: "Raid the waterfront warehouse and eliminate the Kerono syndicate guards.",
      reward: 8500,
      completed: true
    },
    {
      id: 4,
      act: "ACT II · OPERATION OVERDRIVE",
      title: "WRECK THE REGENT",
      desc: "Intercept Victor's armored convoy before it reaches the Solis Marina Helipad.",
      reward: 12000,
      completed: false,
      current: true,
      stage: "3/4"
    },
    {
      id: 5,
      act: "ACT III · EMPIRE OF DUSK",
      title: "BANK DEPOSIT HEIST",
      desc: "Infiltrate Solis Central Vault, crack the safe, and escape into the storm drains.",
      reward: 25000,
      completed: false
    },
    {
      id: 6,
      act: "ACT III · EMPIRE OF DUSK",
      title: "KING OF THE CORAL COAST",
      desc: "Final takedown of the cartel boss aboard his mega-yacht offshore.",
      reward: 50000,
      completed: false
    }
  ];

  const districts = [
    { name: "Coral Strand", standing: "NEUTRAL", score: 58 },
    { name: "Downtown Solis", standing: "HOSTILE", score: 24 },
    { name: "Marina Del Sur", standing: "FRIENDLY", score: 85 },
    { name: "Palm District", standing: "FRIENDLY", score: 76 },
    { name: "Old Port", standing: "HOSTILE", score: 18 }
  ];

  return {
    missions,
    districts,
    getCurrentMission: () => missions.find(m => m.current) || missions[3]
  };
}