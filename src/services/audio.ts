import { getSettings } from './storage';

class SoundManager {
  private ctx: AudioContext | null = null;
  private musicGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private isMusicPlaying = false;
  private musicTimer: number | null = null;

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.sfxGain = this.ctx.createGain();
        this.musicGain = this.ctx.createGain();

        this.sfxGain.connect(this.ctx.destination);
        this.musicGain.connect(this.ctx.destination);

        this.updateVolumes();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public updateVolumes() {
    const settings = getSettings();
    const masterVol = settings.volume / 100;

    if (this.sfxGain && this.ctx) {
      const sfxVol = settings.soundFx ? masterVol : 0;
      this.sfxGain.gain.setValueAtTime(sfxVol, this.ctx.currentTime);
    }

    if (this.musicGain && this.ctx) {
      const musicVol = settings.music ? masterVol * 0.25 : 0;
      this.musicGain.gain.setValueAtTime(musicVol, this.ctx.currentTime);
    }
  }

  // BUTTON TAP
  public playButton() {
    this.initContext();
    const settings = getSettings();
    if (!settings.soundFx || !this.ctx || !this.sfxGain) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(880, this.ctx.currentTime + 0.06);

    gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.07);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.08);
  }

  // BOTTLE PICKUP
  public playPickup() {
    this.initContext();
    const settings = getSettings();
    if (!settings.soundFx || !this.ctx || !this.sfxGain) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(260, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(380, this.ctx.currentTime + 0.08);

    gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.1);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.1);
  }

  // SWIPE / WHOOSH
  public playWhoosh(speedMultiplier = 1) {
    this.initContext();
    const settings = getSettings();
    if (!settings.soundFx || !this.ctx || !this.sfxGain) return;

    // White noise filtered whoosh
    const bufferSize = this.ctx.sampleRate * 0.2;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(200, this.ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(800 * speedMultiplier, this.ctx.currentTime + 0.1);
    filter.frequency.exponentialRampToValueAtTime(300, this.ctx.currentTime + 0.2);
    filter.Q.setValueAtTime(3, this.ctx.currentTime);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.01, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.35, this.ctx.currentTime + 0.08);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.2);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    noise.start();
    noise.stop(this.ctx.currentTime + 0.22);
  }

  // THROW RELEASE
  public playRelease() {
    this.initContext();
    const settings = getSettings();
    if (!settings.soundFx || !this.ctx || !this.sfxGain) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(350, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(650, this.ctx.currentTime + 0.12);

    gain.gain.setValueAtTime(0.25, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.14);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.15);
  }

  // TABLE IMPACT (Wooden resonant thud)
  public playTableImpact(intensity = 1) {
    this.initContext();
    const settings = getSettings();
    if (!settings.soundFx || !this.ctx || !this.sfxGain) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    // Plastic/glass bottle hitting wood: low punch with resonant wooden body
    osc.frequency.setValueAtTime(140 * intensity, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(50, this.ctx.currentTime + 0.12);

    const vol = Math.min(0.6, 0.3 * intensity);
    gain.gain.setValueAtTime(vol, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.15);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.16);
  }

  // BOUNCE / CLATTER
  public playBounce() {
    this.initContext();
    const settings = getSettings();
    if (!settings.soundFx || !this.ctx || !this.sfxGain) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(220, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(160, this.ctx.currentTime + 0.08);

    gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.09);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.1);
  }

  // WOBBLE (Tension squeak)
  public playWobble() {
    this.initContext();
    const settings = getSettings();
    if (!settings.soundFx || !this.ctx || !this.sfxGain) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(180, this.ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(240, this.ctx.currentTime + 0.05);
    osc.frequency.linearRampToValueAtTime(170, this.ctx.currentTime + 0.12);

    gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.15);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.16);
  }

  // PERFECT LANDING (Bright layered chime + sparkle)
  public playPerfect() {
    this.initContext();
    const settings = getSettings();
    if (!settings.soundFx || !this.ctx || !this.sfxGain) return;

    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6 arpeggio
    notes.forEach((freq, idx) => {
      if (!this.ctx || !this.sfxGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const startTime = this.ctx.currentTime + idx * 0.07;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.25, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.4);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(startTime);
      osc.stop(startTime + 0.45);
    });
  }

  // GOOD LANDING (Crisp positive chime)
  public playLandSuccess() {
    this.initContext();
    const settings = getSettings();
    if (!settings.soundFx || !this.ctx || !this.sfxGain) return;

    const notes = [440, 554.37, 659.25]; // A4, C#5, E5
    notes.forEach((freq, idx) => {
      if (!this.ctx || !this.sfxGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const startTime = this.ctx.currentTime + idx * 0.06;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.25, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.35);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(startTime);
      osc.stop(startTime + 0.38);
    });
  }

  // FAIL (Dull low thud)
  public playFail() {
    this.initContext();
    const settings = getSettings();
    if (!settings.soundFx || !this.ctx || !this.sfxGain) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(120, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(45, this.ctx.currentTime + 0.25);

    gain.gain.setValueAtTime(0.25, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.28);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.3);
  }

  // COIN COLLECT
  public playCoin() {
    this.initContext();
    const settings = getSettings();
    if (!settings.soundFx || !this.ctx || !this.sfxGain) return;

    const notes = [987.77, 1318.51]; // B5, E6
    notes.forEach((freq, idx) => {
      if (!this.ctx || !this.sfxGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const startTime = this.ctx.currentTime + idx * 0.08;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.2, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.25);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(startTime);
      osc.stop(startTime + 0.28);
    });
  }

  // SCORE TICK
  public playScoreTick() {
    this.initContext();
    const settings = getSettings();
    if (!settings.soundFx || !this.ctx || !this.sfxGain) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, this.ctx.currentTime);

    gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.05);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.06);
  }

  // COUNTDOWN TICK (Time challenge)
  public playCountdownTick(isFinal = false) {
    this.initContext();
    const settings = getSettings();
    if (!settings.soundFx || !this.ctx || !this.sfxGain) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(isFinal ? 880 : 440, this.ctx.currentTime);

    gain.gain.setValueAtTime(0.25, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + (isFinal ? 0.3 : 0.08));

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start();
    osc.stop(this.ctx.currentTime + (isFinal ? 0.35 : 0.1));
  }

  // WIN FANFARE
  public playWinFanfare() {
    this.initContext();
    const settings = getSettings();
    if (!settings.soundFx || !this.ctx || !this.sfxGain) return;

    // Victory fanfare notes: C4, G4, C5, E5, G5
    const melody = [
      { f: 523.25, d: 0.12 },
      { f: 523.25, d: 0.12 },
      { f: 523.25, d: 0.12 },
      { f: 659.25, d: 0.25 },
      { f: 783.99, d: 0.4 },
    ];

    let t = this.ctx.currentTime;
    melody.forEach((note) => {
      if (!this.ctx || !this.sfxGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(note.f, t);

      gain.gain.setValueAtTime(0.3, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + note.d);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(t);
      osc.stop(t + note.d + 0.05);

      t += note.d + 0.04;
    });
  }

  // AMBIENT BACKGROUND MELODY (Gentle playful chord progression loop)
  public startMusic() {
    if (this.isMusicPlaying) return;
    this.isMusicPlaying = true;
    this.scheduleNextChords();
  }

  public stopMusic() {
    this.isMusicPlaying = false;
    if (this.musicTimer) {
      window.clearTimeout(this.musicTimer);
      this.musicTimer = null;
    }
  }

  private scheduleNextChords() {
    if (!this.isMusicPlaying) return;
    this.initContext();
    const settings = getSettings();

    if (settings.music && this.ctx && this.musicGain) {
      const chords = [
        [261.63, 329.63, 392.0], // C
        [220.0, 261.63, 329.63], // Am
        [174.61, 220.0, 261.63], // F
        [196.0, 246.94, 293.66], // G
      ];

      const chordIdx = Math.floor(Math.random() * chords.length);
      const chord = chords[chordIdx];

      chord.forEach((freq) => {
        if (!this.ctx || !this.musicGain) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

        gain.gain.setValueAtTime(0.01, this.ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.05, this.ctx.currentTime + 0.5);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 2.8);

        osc.connect(gain);
        gain.connect(this.musicGain);

        osc.start();
        osc.stop(this.ctx.currentTime + 3.0);
      });
    }

    this.musicTimer = window.setTimeout(() => {
      this.scheduleNextChords();
    }, 3200);
  }
}

export const audio = new SoundManager();
