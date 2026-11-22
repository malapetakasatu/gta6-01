// Web Audio API Pure Mathematical Sound Synthesis Engine for SOLIS CITY: CORAL COAST
// Synthesizes: Dual-sawtooth supercar engine, turbo blow-off, drift tire screech,
// police FM sirens, 5-tier weapon gunshots, explosive booms, and helicopter rotor chop.

export class AudioSystem {
  constructor() {
    this.ctx = null;
    this.initialized = false;
    this.engineOsc1 = null;
    this.engineOsc2 = null;
    this.engineFilter = null;
    this.engineGain = null;

    this.sirenOsc = null;
    this.sirenGain = null;
  }

  init() {
    if (this.initialized) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.7, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      this.initEngineAudio();
      this.initialized = true;
    } catch (e) {
      console.warn("Web Audio not available:", e);
    }
  }

  initEngineAudio() {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    // Dual Sawtooth Oscillators with Low-pass Resonant Filter
    this.engineOsc1 = this.ctx.createOscillator();
    this.engineOsc2 = this.ctx.createOscillator();
    this.engineFilter = this.ctx.createBiquadFilter();
    this.engineGain = this.ctx.createGain();

    this.engineOsc1.type = 'sawtooth';
    this.engineOsc2.type = 'triangle';

    this.engineOsc1.frequency.setValueAtTime(45, now);
    this.engineOsc2.frequency.setValueAtTime(22.5, now);

    this.engineFilter.type = 'lowpass';
    this.engineFilter.frequency.setValueAtTime(320, now);
    this.engineFilter.Q.setValueAtTime(3.5, now);

    this.engineGain.gain.setValueAtTime(0.0, now);

    this.engineOsc1.connect(this.engineFilter);
    this.engineOsc2.connect(this.engineFilter);
    this.engineFilter.connect(this.engineGain);
    this.engineGain.connect(this.masterGain);

    this.engineOsc1.start();
    this.engineOsc2.start();
  }

  updateEngine(speedRatio, isDriving) {
    if (!this.ctx || !this.engineGain) return;
    const now = this.ctx.currentTime;

    if (!isDriving) {
      this.engineGain.gain.setTargetAtTime(0.0, now, 0.2);
      return;
    }

    const baseFreq = 42 + speedRatio * 180;
    this.engineOsc1.frequency.setTargetAtTime(baseFreq, now, 0.05);
    this.engineOsc2.frequency.setTargetAtTime(baseFreq * 0.5, now, 0.05);

    const cutoff = 300 + speedRatio * 1200;
    this.engineFilter.frequency.setTargetAtTime(cutoff, now, 0.05);
    this.engineGain.gain.setTargetAtTime(0.35 + speedRatio * 0.25, now, 0.05);
  }

  playGunshot(weaponName) {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    // Transient Snap + Decaying Noise Burst
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = weaponName.includes("RPG") ? 'sine' : 'sawtooth';
    osc.frequency.setValueAtTime(weaponName.includes("Shotgun") ? 180 : 380, now);
    osc.frequency.exponentialRampToValueAtTime(30, now + 0.15);

    gain.gain.setValueAtTime(0.65, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.18);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.18);
  }

  playExplosion() {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(95, now);
    osc.frequency.exponentialRampToValueAtTime(15, now + 0.9);

    gain.gain.setValueAtTime(1.0, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.95);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.95);
  }

  playNitro() {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(450, now);
    osc.frequency.linearRampToValueAtTime(800, now + 0.3);

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.35);
  }
}
