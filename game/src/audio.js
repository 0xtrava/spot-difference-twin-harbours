// audio.js — all sound is synthesized with WebAudio oscillators; no audio files.
// A tiny synth: short beeps and chimes for finds, mistakes, hints and wins.

let audioContext = null;
let muted = false;

function ensureAudioContext() {
  if (!audioContext) {
    const Ctor = window.AudioContext || window.webkitAudioContext;
    if (!Ctor) return null;
    audioContext = new Ctor();
  }
  if (audioContext.state === 'suspended') audioContext.resume().catch(() => {});
  return audioContext;
}

export function setMuted(value) {
  muted = value;
}

export function isMuted() {
  return muted;
}

/** Play one oscillator note: frequency in Hz, start delay, duration, wave shape. */
function playTone(freq, delay, duration, type, volume) {
  if (muted) return;
  const ctx = ensureAudioContext();
  if (!ctx) return;
  const when = ctx.currentTime + delay;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type || 'sine';
  osc.frequency.setValueAtTime(freq, when);
  gain.gain.setValueAtTime(0.0001, when);
  gain.gain.exponentialRampToValueAtTime(volume || 0.12, when + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, when + duration);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(when);
  osc.stop(when + duration + 0.05);
}

/** A bright two-note chime when a difference is found. */
export function playFindChime() {
  playTone(880, 0, 0.16, 'sine', 0.14);
  playTone(1318.5, 0.09, 0.24, 'sine', 0.14);
}

/** A low buzz when the player clicks the wrong spot. */
export function playWrongBuzz() {
  playTone(160, 0, 0.22, 'sawtooth', 0.08);
  playTone(110, 0.08, 0.22, 'sawtooth', 0.08);
}

/** A soft tick for ordinary button clicks. */
export function playClickTick() {
  playTone(660, 0, 0.07, 'triangle', 0.08);
}

/** A gentle shimmer when a hint is used. */
export function playHintShimmer() {
  playTone(1046.5, 0, 0.14, 'sine', 0.1);
  playTone(1568, 0.1, 0.2, 'sine', 0.08);
}

/** A rising fanfare when a level is completed. */
export function playLevelFanfare() {
  [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
    playTone(freq, i * 0.11, 0.22, 'triangle', 0.13);
  });
}

/** A short tick when the timer drops under ten seconds. */
export function playLowTimeTick() {
  playTone(1200, 0, 0.06, 'square', 0.05);
}
