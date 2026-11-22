// Procedural Web Audio API Sound Synthesizer for Solis City: Coral Coast
// Synthesizes supercar engine hum, CPD police wailing sirens, gunshots, explosions, and synthwave radio.

function createAudioEngine() {
  let ctx = null;
  let masterGain = null;
  let engineOsc = null;
  let engineGain = null;
  let engineFilter = null;
  let isSoundEnabled = true;

  function initContext() {
    if (!ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      ctx = new AudioCtx();
      masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0.4, ctx.currentTime);
      masterGain.connect(ctx.destination);

      // Supercar engine oscillator setup
      engineOsc = ctx.createOscillator();
      engineOsc.type = 'sawtooth';
      engineFilter = ctx.createBiquadFilter();
      engineFilter.type = 'lowpass';
      engineFilter.frequency.setValueAtTime(320, ctx.currentTime);

      engineGain = ctx.createGain();
      engineGain.gain.setValueAtTime(0.08, ctx.currentTime);

      engineOsc.connect(engineFilter);
      engineFilter.connect(engineGain);
      engineGain.connect(masterGain);
      engineOsc.start();
    }
    if (ctx.state === 'suspended') {
      ctx.resume();
    }
  }

  const audio = {
    init: initContext,

    toggleSound: function () {
      isSoundEnabled = !isSoundEnabled;
      if (masterGain && ctx) {
        masterGain.gain.setValueAtTime(isSoundEnabled ? 0.4 : 0.0, ctx.currentTime);
      }
      return isSoundEnabled;
    },

    // Modulate engine pitch & volume with car speed
    updateEngine: function (speed, inVehicle) {
      if (!ctx || !engineOsc || !isSoundEnabled) return;
      if (!inVehicle) {
        engineGain.gain.setValueAtTime(0.01, ctx.currentTime);
        return;
      }
      const absSpeed = Math.abs(speed);
      const targetFreq = 48 + absSpeed * 4.2;
      const targetCutoff = 280 + absSpeed * 22;

      engineOsc.frequency.setTargetAtTime(targetFreq, ctx.currentTime, 0.08);
      engineFilter.frequency.setTargetAtTime(targetCutoff, ctx.currentTime, 0.08);
      engineGain.gain.setTargetAtTime(0.12 + Math.min(0.2, absSpeed * 0.003), ctx.currentTime, 0.08);
    },

    // Synthesize Gunshots
    playGunshot: function (wepName) {
      if (!ctx || !isSoundEnabled) return;
      initContext();

      // White Noise Burst
      const bufferSize = ctx.sampleRate * 0.12;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.22));
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(wepName === 'HEAVY SNIPER' ? 600 : 1200, ctx.currentTime);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.5, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(masterGain);
      noise.start();

      // Punchy Sub Kick
      const subOsc = ctx.createOscillator();
      subOsc.type = 'sine';
      subOsc.frequency.setValueAtTime(140, ctx.currentTime);
      subOsc.frequency.exponentialRampToValueAtTime(35, ctx.currentTime + 0.08);

      const subGain = ctx.createGain();
      subGain.gain.setValueAtTime(0.6, ctx.currentTime);
      subGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);

      subOsc.connect(subGain);
      subGain.connect(masterGain);
      subOsc.start();
      subOsc.stop(ctx.currentTime + 0.09);
    },

    // Synthesize Collision / Crash
    playCrash: function () {
      if (!ctx || !isSoundEnabled) return;
      initContext();

      const bufferSize = ctx.sampleRate * 0.35;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(450, ctx.currentTime);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.7, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.005, ctx.currentTime + 0.35);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(masterGain);
      noise.start();
    },

    // Synthesize Heavy Explosion
    playExplosion: function () {
      if (!ctx || !isSoundEnabled) return;
      initContext();

      const bufferSize = ctx.sampleRate * 0.7;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.35));
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(300, ctx.currentTime);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.85, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.7);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(masterGain);
      noise.start();
    }
  };

  return audio;
}

window.soundFX = createAudioEngine();
