/**
 * Solis City: Coral Coast - Procedural Web Audio Engine
 * High-fidelity synthetic sound synthesis without external audio file dependencies.
 */

export class AudioManager {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.engineOsc = null;
    this.engineGain = null;
    this.engineFilter = null;
    this.sirenOsc = null;
    this.sirenGain = null;
    this.sirenLfo = null;
    this.sirenLfoGain = null;
    this.initialized = false;
    this.sirenActive = false;
    this.engineRunning = false;
  }

  init() {
    if (this.initialized) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = 0.75;
      this.masterGain.connect(this.ctx.destination);
      this.initialized = true;
    } catch (e) {
      console.warn('AudioContext initialization deferred:', e);
    }
  }

  resume() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // --- Engine Sound Synthesis ---
  startEngine() {
    if (!this.initialized || this.engineRunning) return;
    try {
      const now = this.ctx.currentTime;
      this.engineOsc = this.ctx.createOscillator();
      this.engineOsc.type = 'sawtooth';
      this.engineOsc.frequency.setValueAtTime(55, now);

      this.engineFilter = this.ctx.createBiquadFilter();
      this.engineFilter.type = 'lowpass';
      this.engineFilter.frequency.setValueAtTime(420, now);
      this.engineFilter.Q.setValueAtTime(3.0, now);

      this.engineGain = this.ctx.createGain();
      this.engineGain.gain.setValueAtTime(0.01, now);
      this.engineGain.gain.linearRampToValueAtTime(0.22, now + 0.3);

      this.engineOsc.connect(this.engineFilter);
      this.engineFilter.connect(this.engineGain);
      this.engineGain.connect(this.masterGain);

      this.engineOsc.start(now);
      this.engineRunning = true;
    } catch (err) {
      console.warn('startEngine error', err);
    }
  }

  updateEngine(speedRatio = 0, rpm = 0.2) {
    if (!this.engineRunning || !this.engineOsc) return;
    try {
      const now = this.ctx.currentTime;
      const baseFreq = 52;
      const targetFreq = baseFreq + speedRatio * 180 + rpm * 120;
      this.engineOsc.frequency.setTargetAtTime(targetFreq, now, 0.05);

      const filterFreq = 380 + speedRatio * 900 + rpm * 450;
      this.engineFilter.frequency.setTargetAtTime(filterFreq, now, 0.05);
    } catch (e) {}
  }

  stopEngine() {
    if (!this.engineRunning || !this.engineGain) return;
    try {
      const now = this.ctx.currentTime;
      this.engineGain.gain.linearRampToValueAtTime(0.001, now + 0.2);
      setTimeout(() => {
        if (this.engineOsc) {
          try { this.engineOsc.stop(); } catch (e) {}
          this.engineOsc.disconnect();
          this.engineOsc = null;
        }
        this.engineRunning = false;
      }, 220);
    } catch (e) {}
  }

  // --- Gunfire Synthesis ---
  playGunfire(type = 'carbine') {
    if (!this.initialized) return;
    try {
      this.resume();
      const now = this.ctx.currentTime;

      // Noise burst for mechanical snap & muzzle blast
      const bufferSize = Math.floor(this.ctx.sampleRate * 0.12);
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      const whiteNoise = this.ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;

      const noiseFilter = this.ctx.createBiquadFilter();
      noiseFilter.type = 'bandpass';
      noiseFilter.frequency.setValueAtTime(type === 'shotgun' ? 700 : 1800, now);
      noiseFilter.Q.setValueAtTime(1.8, now);

      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(0.45, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + (type === 'shotgun' ? 0.18 : 0.09));

      whiteNoise.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(this.masterGain);

      // Low frequency body kick
      const kickOsc = this.ctx.createOscillator();
      kickOsc.type = 'sine';
      kickOsc.frequency.setValueAtTime(type === 'shotgun' ? 140 : 190, now);
      kickOsc.frequency.exponentialRampToValueAtTime(45, now + 0.08);

      const kickGain = this.ctx.createGain();
      kickGain.gain.setValueAtTime(0.5, now);
      kickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

      kickOsc.connect(kickGain);
      kickGain.connect(this.masterGain);

      whiteNoise.start(now);
      kickOsc.start(now);
      whiteNoise.stop(now + 0.2);
      kickOsc.stop(now + 0.1);
    } catch (e) {}
  }

  // --- Police Siren Oscillation with LFO ---
  startSiren() {
    if (!this.initialized || this.sirenActive) return;
    try {
      this.resume();
      const now = this.ctx.currentTime;
      this.sirenOsc = this.ctx.createOscillator();
      this.sirenOsc.type = 'sawtooth';
      this.sirenOsc.frequency.setValueAtTime(750, now);

      this.sirenLfo = this.ctx.createOscillator();
      this.sirenLfo.type = 'sine';
      this.sirenLfo.frequency.setValueAtTime(1.4, now); // ~1.4 Hz wail cycle

      this.sirenLfoGain = this.ctx.createGain();
      this.sirenLfoGain.gain.setValueAtTime(220, now); // swing between 530Hz and 970Hz

      this.sirenLfo.connect(this.sirenOsc.frequency);

      this.sirenGain = this.ctx.createGain();
      this.sirenGain.gain.setValueAtTime(0.01, now);
      this.sirenGain.gain.linearRampToValueAtTime(0.18, now + 0.4);

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(2200, now);

      this.sirenOsc.connect(filter);
      filter.connect(this.sirenGain);
      this.sirenGain.connect(this.masterGain);

      this.sirenLfo.start(now);
      this.sirenOsc.start(now);
      this.sirenActive = true;
    } catch (e) {}
  }

  stopSiren() {
    if (!this.sirenActive || !this.sirenGain) return;
    try {
      const now = this.ctx.currentTime;
      this.sirenGain.gain.linearRampToValueAtTime(0.001, now + 0.3);
      setTimeout(() => {
        if (this.sirenOsc) {
          try { this.sirenOsc.stop(); } catch (e) {}
          this.sirenOsc.disconnect();
          this.sirenOsc = null;
        }
        if (this.sirenLfo) {
          try { this.sirenLfo.stop(); } catch (e) {}
          this.sirenLfo.disconnect();
          this.sirenLfo = null;
        }
        this.sirenActive = false;
      }, 320);
    } catch (e) {}
  }

  // --- Bass Explosion Boom ---
  playExplosion() {
    if (!this.initialized) return;
    try {
      this.resume();
      const now = this.ctx.currentTime;

      // Low frequency sub-bass boom
      const boom = this.ctx.createOscillator();
      boom.type = 'sine';
      boom.frequency.setValueAtTime(130, now);
      boom.frequency.exponentialRampToValueAtTime(25, now + 0.9);

      const boomGain = this.ctx.createGain();
      boomGain.gain.setValueAtTime(0.8, now);
      boomGain.gain.exponentialRampToValueAtTime(0.001, now + 1.1);

      boom.connect(boomGain);
      boomGain.connect(this.masterGain);
      boom.start(now);
      boom.stop(now + 1.2);

      // Distorted rumble noise
      const bufferSize = Math.floor(this.ctx.sampleRate * 0.9);
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * 0.3));
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = noiseBuffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(450, now);
      filter.frequency.linearRampToValueAtTime(80, now + 0.8);

      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(0.65, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.9);

      noise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(this.masterGain);
      noise.start(now);
      noise.stop(now + 1.0);
    } catch (e) {}
  }

  // --- Mission Completion Stinger Chime ---
  playMissionSting() {
    if (!this.initialized) return;
    try {
      this.resume();
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      const now = this.ctx.currentTime;

      notes.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const noteStart = now + idx * 0.09;

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, noteStart);

        gain.gain.setValueAtTime(0.001, noteStart);
        gain.gain.linearRampToValueAtTime(0.25, noteStart + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, noteStart + 0.6);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start(noteStart);
        osc.stop(noteStart + 0.65);
      });
    } catch (e) {}
  }

  playHitmarker() {
    if (!this.initialized) return;
    try {
      this.resume();
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(1250, now);
      osc.frequency.exponentialRampToValueAtTime(900, now + 0.04);

      gain.gain.setValueAtTime(0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.05);
    } catch (e) {}
  }
}
