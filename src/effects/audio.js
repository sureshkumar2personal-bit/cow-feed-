let ctx = null;

function getCtx() {
  if (!ctx) {
    try {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
    } catch {}
  }
  if (ctx?.state === 'suspended') {
    ctx.resume();
  }
  return ctx;
}

export function playBell() {
  const c = getCtx();
  if (!c) return;
  try {
    const now = c.currentTime;
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(520, now);
    osc.frequency.exponentialRampToValueAtTime(180, now + 1.8);
    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 2.2);
    osc.connect(gain);
    gain.connect(c.destination);
    osc.start(now);
    osc.stop(now + 2.3);
  } catch {}
}

export function playConch() {
  const c = getCtx();
  if (!c) return;
  try {
    const now = c.currentTime;
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.linearRampToValueAtTime(320, now + 1.5);
    osc.frequency.linearRampToValueAtTime(250, now + 2.5);
    gain.gain.setValueAtTime(0.05, now);
    gain.gain.linearRampToValueAtTime(0.08, now + 0.3);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 3);
    const filt = c.createBiquadFilter();
    filt.type = 'lowpass';
    filt.frequency.setValueAtTime(800, now);
    osc.connect(filt);
    filt.connect(gain);
    gain.connect(c.destination);
    osc.start(now);
    osc.stop(now + 3.2);
  } catch {}
}

export function initAudio() {
  getCtx();
}
