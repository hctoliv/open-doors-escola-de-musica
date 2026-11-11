/* Open Doors · motor de áudio (Web Audio, sem arquivos de som).
   Expõe window.ODA com vozes agendáveis no tempo (para o sequenciador)
   e demos curtas de cada curso. */
(function () {
  'use strict';
  let ctx = null, out = null, analyser = null, noiseBuf = null;
  const hz = (m) => 440 * Math.pow(2, (m - 69) / 12);

  function init() {
    if (ctx) { if (ctx.state === 'suspended') ctx.resume(); return ctx; }
    const C = window.AudioContext || window.webkitAudioContext;
    if (!C) return null;
    ctx = new C();
    out = ctx.createGain(); out.gain.value = 0.8;
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -14; comp.ratio.value = 4;
    analyser = ctx.createAnalyser(); analyser.fftSize = 1024;
    out.connect(comp); comp.connect(analyser); analyser.connect(ctx.destination);
    noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 1, ctx.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    return ctx;
  }
  function env(g, t, a, peak, dec) {
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(peak, t + a);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dec);
  }
  function noise(t, dur) {
    const s = ctx.createBufferSource(); s.buffer = noiseBuf;
    s.start(t, Math.random() * 0.5); s.stop(t + dur); return s;
  }

  const V = {
    kick(t, v = 1) {
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.frequency.setValueAtTime(140, t); o.frequency.exponentialRampToValueAtTime(42, t + 0.14);
      o.connect(g); g.connect(out); env(g, t, 0.002, 1.1 * v, 0.38); o.start(t); o.stop(t + 0.42);
    },
    snare(t, v = 1) {
      const n = noise(t, 0.22), f = ctx.createBiquadFilter(), g = ctx.createGain();
      f.type = 'highpass'; f.frequency.value = 1300; n.connect(f); f.connect(g); g.connect(out); env(g, t, 0.002, 0.65 * v, 0.2);
      const o = ctx.createOscillator(), g2 = ctx.createGain(); o.frequency.value = 185;
      o.connect(g2); g2.connect(out); env(g2, t, 0.002, 0.35 * v, 0.09); o.start(t); o.stop(t + 0.12);
    },
    hat(t, v = 1) {
      const n = noise(t, 0.06), f = ctx.createBiquadFilter(), g = ctx.createGain();
      f.type = 'highpass'; f.frequency.value = 7500; n.connect(f); f.connect(g); g.connect(out); env(g, t, 0.001, 0.22 * v, 0.045);
    },
    pluck(m, t, v = 0.4, dur = 1.6) { // Karplus-Strong com buffer pré-calculado
      const sr = ctx.sampleRate, len = Math.max(2, Math.round(sr / hz(m))), b = ctx.createBuffer(1, Math.round(sr * dur), sr), d = b.getChannelData(0);
      const ring = new Float32Array(len); for (let i = 0; i < len; i++) ring[i] = Math.random() * 2 - 1;
      let p = 0; for (let i = 0; i < d.length; i++) { const nx = (p + 1) % len; d[i] = ring[p]; ring[p] = (ring[p] + ring[nx]) * 0.4985; p = nx; }
      const s = ctx.createBufferSource(), g = ctx.createGain(); s.buffer = b; g.gain.value = v; s.connect(g); g.connect(out); s.start(t);
    },
    bass(m, t, len = 0.25, v = 0.5) {
      const o = ctx.createOscillator(), f = ctx.createBiquadFilter(), g = ctx.createGain();
      o.type = 'sawtooth'; o.frequency.value = hz(m); f.type = 'lowpass'; f.Q.value = 6;
      f.frequency.setValueAtTime(900, t); f.frequency.exponentialRampToValueAtTime(160, t + len);
      o.connect(f); f.connect(g); g.connect(out); env(g, t, 0.005, v, len + 0.08); o.start(t); o.stop(t + len + 0.1);
    },
    keys(notes, t, len = 0.6, v = 0.12) {
      notes.forEach((m) => [1, 2].forEach((mul, k) => {
        const o = ctx.createOscillator(), g = ctx.createGain();
        o.type = k ? 'sine' : 'triangle'; o.frequency.value = hz(m) * mul;
        o.connect(g); g.connect(out); env(g, t, 0.006, k ? v * 0.35 : v, len); o.start(t); o.stop(t + len + 0.05);
      }));
    },
    horn(m, t, len = 0.3, v = 0.32) {
      const o = ctx.createOscillator(), f = ctx.createBiquadFilter(), g = ctx.createGain();
      const vib = ctx.createOscillator(), vg = ctx.createGain();
      o.type = 'sawtooth'; o.frequency.value = hz(m); vib.frequency.value = 5.2; vg.gain.value = 3;
      vib.connect(vg); vg.connect(o.frequency);
      f.type = 'lowpass'; f.Q.value = 3; f.frequency.setValueAtTime(500, t); f.frequency.exponentialRampToValueAtTime(2400, t + 0.05); f.frequency.exponentialRampToValueAtTime(1100, t + len);
      o.connect(f); f.connect(g); g.connect(out);
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(v, t + 0.04); g.gain.setValueAtTime(v, t + len * 0.8); g.gain.exponentialRampToValueAtTime(0.0001, t + len + 0.08);
      o.start(t); vib.start(t); o.stop(t + len + 0.1); vib.stop(t + len + 0.1);
    },
    voice(m, t, len = 0.5, v = 0.8) {
      const o = ctx.createOscillator(), vib = ctx.createOscillator(), vg = ctx.createGain(), g = ctx.createGain();
      o.type = 'sawtooth'; o.frequency.value = hz(m); vib.frequency.value = 5.5; vg.gain.value = hz(m) * 0.012; vib.connect(vg); vg.connect(o.frequency);
      [[800, 1], [1150, 0.6], [2900, 0.25]].forEach(([fq, a]) => {
        const f = ctx.createBiquadFilter(), fg = ctx.createGain(); f.type = 'bandpass'; f.frequency.value = fq; f.Q.value = 7; fg.gain.value = a;
        o.connect(f); f.connect(fg); fg.connect(g);
      });
      g.connect(out);
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(v, t + 0.08); g.gain.setValueAtTime(v, t + len - 0.06); g.gain.exponentialRampToValueAtTime(0.0001, t + len + 0.15);
      o.start(t); vib.start(t); o.stop(t + len + 0.2); vib.stop(t + len + 0.2);
    },
    clap(t, v = 0.3) {
      const n = noise(t, 0.04), f = ctx.createBiquadFilter(), g = ctx.createGain();
      f.type = 'bandpass'; f.frequency.value = 900 + Math.random() * 1800; f.Q.value = 1.2;
      n.connect(f); f.connect(g); g.connect(out); env(g, t, 0.001, v, 0.035);
    }
  };

  // Demos de cada curso: devolvem a duração em segundos.
  const demos = {
    cordas() { const t = ctx.currentTime; [43, 47, 50, 55, 59, 67].forEach((m, i) => V.pluck(m, t + i * 0.045, 0.3, 2.2)); [55, 59, 62].forEach((m, i) => V.pluck(m + 12, t + 0.9 + i * 0.18, 0.26, 1.6)); return 2.4; },
    canto() { let t = ctx.currentTime; const t0 = t; [[64, 0.45], [67, 0.45], [72, 1.1]].forEach(([m, d]) => { V.voice(m, t, d); t += d; }); return t - t0 + 0.3; },
    bateria() { const t = ctx.currentTime, s = 0.11; 'K.h.S.h.K.KhS.hh'.split('').forEach((c, i) => { const tt = t + i * s; if (c === 'K') V.kick(tt); if (c === 'S') V.snare(tt); if (c === 'h') V.hat(tt); }); return 16 * s + 0.4; },
    sopro() { let t = ctx.currentTime; const t0 = t; [[62, 0.18], [65, 0.18], [67, 0.18], [68, 0.12], [67, 0.5], [65, 0.2], [62, 0.7]].forEach(([m, d]) => { V.horn(m - 12, t, d * 0.95); t += d; }); return t - t0 + 0.2; },
    teclas() { const t = ctx.currentTime; [[60, 64, 67, 71], [57, 60, 64, 67], [53, 57, 60, 64], [55, 59, 62, 65]].forEach((ch, i) => V.keys(ch, t + i * 0.55, 1.3, 0.14)); return 2.2 + 1; },
    teatro() { const t = ctx.currentTime; for (let i = 0; i < 150; i++) { const tt = t + Math.random() * 2.2 * Math.pow(Math.random(), 0.3); const fade = 1 - Math.max(0, (tt - t - 1.3) / 1.1); V.clap(tt, 0.32 * Math.max(0.05, fade)); } return 2.5; }
  };

  window.ODA = {
    init, hz, V,
    get ctx() { return ctx; },
    get analyser() { return analyser; },
    demo(name) { if (!init()) return 0; return demos[name] ? demos[name]() : 0; }
  };
})();
