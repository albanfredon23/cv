// Tiny synthesized soundscape (no audio files): keyboard clicks, a CRT power-on blip and a soft room hum.
const KEY = 'alban-cv-sound';

export function createAudio() {
  let ctx = null, master = null, hum = null, noiseBuf = null;
  let enabled = (() => { try { return localStorage.getItem(KEY) !== 'off'; } catch (e) { return true; } })();
  let lastKey = 0;

  function init() {
    if (ctx) return;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    ctx = new AC();
    master = ctx.createGain(); master.gain.value = enabled ? 1 : 0; master.connect(ctx.destination);
    noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 0.25, ctx.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;

    // room tone: a filtered noise bed, barely audible
    const src = ctx.createBufferSource(); src.buffer = noiseBuf; src.loop = true;
    const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 380;
    hum = ctx.createGain(); hum.gain.value = 0.018;
    src.connect(lp).connect(hum).connect(master); src.start();
  }

  // a mechanical key: short band-passed noise burst with a little pitch variation
  function key(volume = 1) {
    if (!ctx || !enabled) return;
    const now = ctx.currentTime;
    if (now - lastKey < 0.03) return;
    lastKey = now;
    const src = ctx.createBufferSource(); src.buffer = noiseBuf;
    src.playbackRate.value = 0.8 + Math.random() * 0.5;
    const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 2200 + Math.random() * 1600; bp.Q.value = 1.4;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, now);
    g.gain.exponentialRampToValueAtTime(0.16 * volume, now + 0.003);
    g.gain.exponentialRampToValueAtTime(0.0001, now + 0.05);
    src.connect(bp).connect(g).connect(master);
    src.start(now, Math.random() * 0.2, 0.06);
  }

  // CRT power-on: a falling sine "thunk" plus a faint high whine
  function powerOn() {
    if (!ctx || !enabled) return;
    const now = ctx.currentTime;
    const o = ctx.createOscillator(); o.type = 'sine';
    o.frequency.setValueAtTime(140, now); o.frequency.exponentialRampToValueAtTime(45, now + 0.35);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, now); g.gain.exponentialRampToValueAtTime(0.25, now + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, now + 0.4);
    o.connect(g).connect(master); o.start(now); o.stop(now + 0.45);
    const w = ctx.createOscillator(); w.type = 'sine'; w.frequency.value = 15600;
    const wg = ctx.createGain();
    wg.gain.setValueAtTime(0.0001, now); wg.gain.exponentialRampToValueAtTime(0.012, now + 0.05); wg.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);
    w.connect(wg).connect(master); w.start(now); w.stop(now + 1.3);
  }

  function setEnabled(on) {
    enabled = on;
    try { localStorage.setItem(KEY, on ? 'on' : 'off'); } catch (e) {}
    if (ctx) master.gain.setTargetAtTime(on ? 1 : 0, ctx.currentTime, 0.05);
  }

  return {
    // must be called from a user gesture (browsers block audio until then)
    unlock() { init(); ctx?.resume?.(); },
    key, powerOn, setEnabled,
    isEnabled: () => enabled,
  };
}
