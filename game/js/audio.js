// Dapur Kilat — tiny synthesized sound effects (WebAudio, no audio files).
// The context is created on the first user gesture; until then sfx() is silent.

let ctx = null;
let muted = false;

export function initAudio() {
  if (ctx) return;
  try {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (AC) ctx = new AC();
  } catch {
    ctx = null;
  }
}

export function toggleMute() {
  muted = !muted;
  return muted;
}

function tone(freq, dur, type = 'sine', vol = 0.12, when = 0) {
  if (!ctx || muted) return;
  const t0 = ctx.currentTime + when;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  gain.gain.setValueAtTime(vol, t0);
  gain.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(t0);
  osc.stop(t0 + dur + 0.02);
}

export function sfx(name) {
  if (!ctx || muted) return;
  if (ctx.state === 'suspended') void ctx.resume();
  if (name === 'grab') tone(520, 0.07, 'triangle', 0.1);
  else if (name === 'chop') {
    tone(180, 0.05, 'square', 0.08);
    tone(150, 0.05, 'square', 0.08, 0.09);
    tone(190, 0.06, 'square', 0.08, 0.18);
  } else if (name === 'sizzle') {
    tone(1200, 0.12, 'sawtooth', 0.03);
    tone(900, 0.15, 'sawtooth', 0.03, 0.08);
  } else if (name === 'plate') tone(660, 0.09, 'sine', 0.12);
  else if (name === 'serve') {
    tone(523, 0.1, 'sine', 0.12);
    tone(659, 0.1, 'sine', 0.12, 0.1);
    tone(784, 0.16, 'sine', 0.12, 0.2);
  } else if (name === 'error') tone(140, 0.15, 'square', 0.07);
  else if (name === 'trash') tone(300, 0.08, 'triangle', 0.08);
  else if (name === 'start') {
    tone(392, 0.1, 'sine', 0.12);
    tone(523, 0.14, 'sine', 0.12, 0.1);
  }
}
