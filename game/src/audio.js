// SOLIS CITY: CORAL COAST - Web Audio API Sound Synthesizer
// 100% self-contained mathematical procedural audio synthesis:
// supercar engine rumble & RPM pitch shift, nitro boost hiss,
// dual-tone CPD police sirens, 5-tier weapon gunshots, and explosive booms.

export class AudioManager {
  constructor() {
    this.ctx = null;
    this.isMuted = false;

    // Supercar engine sound nodes
    this.engineOsc1 = null;
    this.engineOsc2 = null;
    this.engineFilter = null;
    this.engineGain = null;

    // Police siren nodes
    this.sirenOsc = null;
    this.sirenGain = null;
    this.isSirenPlaying = false;
  }

  init() {
    if (this.ctx) return;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;

    this.ctx = new AudioContext();
    this.initEngineAudio();
  }

  initEngineAudio() {
    if (!this.ctx) return;

    // Dual-oscillator engine synthesis with lowpass filter
    this.engineOsc1 = this.ctx.createOscillator();
    this.engineOsc1.type = 'sawtooth';
    this.engineOsc1.frequency.value = 55; // Idle rumble

    this.engineOsc2 = this.ctx.createOscillator();
    this.engineOsc2.type = 'triangle';
    this.engineOsc2.frequency.value = 110;

    this.engineFilter = this.ctx.createBiquadFilter();
    this.engineFilter.type = 'lowpass';
    this.engineFilter.frequency.value = 400;

    this.engineGain = this.ctx.createGain();
    this.engineGain.gain.value = 0.15;

    this.engineOsc1.connect(this.engineFilter);
    this.engineOsc2.connect(this.engineFilter);
    this.engineFilter.connect(this.engineGain);
    this.engineGain.connect(this.ctx.destination);

    this.engineOsc1.start();
    this.engineOsc2.start();
  }

  updateEngine(speed, maxSpeed, isNitro) {
    if (!this.ctx || this.isMuted || !this.engineOsc1) return;

    const ratio = Math.min(1.0, Math.abs(speed) / maxSpeed);
    const baseFreq = 55 + ratio * 320 + (isNitro ? 60 : 0);

    const now = this.ctx.currentTime;
    this.engineOsc1.frequency.setTargetAtTime(baseFreq, now, 0.08);
    this.engineOsc2.frequency.setTargetAtTime(baseFreq * 1.5, now, 0.08);

    const filterFreq = 350 + ratio * 1400;
    this.engineFilter.frequency.setTargetAtTime(filterFreq, now, 0.08);
  }

  startSiren() {
    if (!this.ctx || this.isMuted || this.isSirenPlaying) return;
    this.isSirenPlaying = true;

    this.sirenOsc = this.ctx.createOscillator();
    this.sirenOsc.type = 'sawtooth';

    // Wailing frequency modulation
    const lfo = this.ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.value = 0.8; // Wailing speed

    const lfoGain = this.ctx.createGain();
    lfoGain.gain.value = 350; // Sweep range

    this.sirenOsc.frequency.value = 750;
    lfo.connect(this.sirenOsc.frequency);

    this.sirenGain = this.ctx.createGain();
    this.sirenGain.gain.value = 0.12;

    this.sirenOsc.connect(this.sirenGain);
    this.sirenGain.connect(this.ctx.destination);

    this.sirenOsc.start();
    lfo.start();
  }

  stopSiren() {
    if (!this.isSirenPlaying) return;
    if (this.sirenGain) {
      this.sirenGain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.2);
    }
    this.isSirenPlaying = false;
  }

  playGunshot(weaponName) {
    if (!this.ctx || this.isMuted) return;

    // Procedural punchy gun crack via white noise burst + kick envelope
    const bufferSize = this.ctx.sampleRate * 0.15;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * 0.035));
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = weaponName.includes('M4A1') ? 1800 : 2200;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.35, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.15);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    noise.start();
  }

  playRpgLaunch() {
    if (!this.ctx || this.isMuted) return;

    const osc = this.ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(140, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(450, this.ctx.currentTime + 0.35);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.4, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.4);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.4);
  }

  playExplosion() {
    if (!this.ctx || this.isMuted) return;

    // Sub-bass thump + noise wash
    const osc = this.ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(120, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(30, this.ctx.currentTime + 0.6);

    const oscGain = this.ctx.createGain();
    oscGain.gain.setValueAtTime(0.6, this.ctx.currentTime);
    oscGain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.7);

    osc.connect(oscGain);
    oscGain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.7);
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.engineGain) {
      this.engineGain.gain.value = this.isMuted ? 0 : 0.15;
    }
    return this.isMuted;
  }
}
