/* Open Doors · Sala de ensaio: sequenciador de 16 passos com agendamento preciso (lookahead). */
(function () {
  'use strict';
  const root = document.getElementById('seq');
  if (!root || !window.ODA) return;
  const A = window.ODA;

  const TRACKS = [
    { id: 'bumbo', name: 'Bumbo', course: 'Bateria', c: '#d4a94e' },
    { id: 'caixa', name: 'Caixa', course: 'Bateria', c: '#c99a3c' },
    { id: 'chimbal', name: 'Chimbal', course: 'Bateria', c: '#b88a35' },
    { id: 'cordas', name: 'Cordas', course: 'Cordas', c: '#e8892f' },
    { id: 'teclas', name: 'Teclas', course: 'Teclas', c: '#f5efe3' },
    { id: 'sopro', name: 'Sopro', course: 'Sopro', c: '#f3d68c' }
  ];
  const PRESETS = {
    pop: { bpm: 96, chords: [[48, 52, 55, 60], [43, 50, 55, 59], [45, 52, 57, 60], [41, 48, 53, 57]],
      p: ['x.....x...x.....', '....x.......x...', 'x.x.x.x.x.x.x.x.', 'x..x..x...x..x..', '..x...x...x...x.', 'x.......x.x.....'] },
    samba: { bpm: 104, chords: [[50, 53, 57, 60], [43, 53, 55, 59], [48, 52, 55, 59], [45, 52, 55, 61]],
      p: ['x..x..x.x..x..x.', '..x..x.x..x..x.x', 'xxxxxxxxxxxxxxxx', 'x.xx.x.xx.xx.x.x', '..x...x...x...x.', '....x.x.......x.'] },
    rock: { bpm: 122, chords: [[40, 47, 52, 56], [38, 45, 50, 54], [45, 52, 57, 61], [40, 47, 52, 56]],
      p: ['x.......x.x.....', '....x.......x...', 'x.x.x.x.x.x.x.x.', 'x.x.x.x.x.x.x.x.', 'x.......x.......', '................'] }
  };

  let grid = TRACKS.map(() => new Array(16).fill(false));
  let muted = TRACKS.map(() => false);
  let preset = 'pop', bpm = 96, playing = false, step = 0, bar = 0, nextTime = 0, timer = null;
  const queue = [];

  // ---- monta a grade ----
  const frag = document.createDocumentFragment();
  const ruler = document.createElement('div'); ruler.className = 'steps-ruler'; ruler.setAttribute('aria-hidden', 'true');
  const corner = document.createElement('span'); corner.style.setProperty('--s', -1); ruler.appendChild(corner);
  for (let s = 0; s < 16; s++) { const sp = document.createElement('span'); sp.style.setProperty('--s', s); sp.textContent = s % 4 === 0 ? s / 4 + 1 : '·'; ruler.appendChild(sp); }
  frag.appendChild(ruler);
  const cells = [];
  TRACKS.forEach((t, r) => {
    const name = document.createElement('button');
    name.type = 'button'; name.className = 'row-name'; name.style.setProperty('--c', t.c); name.style.setProperty('--r', r);
    name.setAttribute('aria-pressed', 'true'); name.title = 'Ligar ou silenciar ' + t.name;
    name.innerHTML = '<i></i>' + t.name;
    name.addEventListener('click', () => { muted[r] = !muted[r]; name.setAttribute('aria-pressed', String(!muted[r])); cells[r].forEach((c) => c.classList.toggle('off', muted[r])); summary(); });
    frag.appendChild(name);
    cells[r] = [];
    for (let s = 0; s < 16; s++) {
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'cell' + (s % 4 === 0 ? ' beat' : '');
      b.style.setProperty('--c', t.c); b.style.setProperty('--r', r); b.style.setProperty('--s', s);
      b.setAttribute('aria-label', `${t.name}, passo ${s + 1}`);
      b.setAttribute('aria-pressed', 'false');
      b.addEventListener('click', () => {
        grid[r][s] = !grid[r][s]; b.setAttribute('aria-pressed', String(grid[r][s]));
        if (grid[r][s] && !playing && A.init()) trigger(r, s, A.ctx.currentTime + 0.01);
        summary();
      });
      cells[r][s] = b; frag.appendChild(b);
    }
  });
  root.appendChild(frag);

  function paint() { grid.forEach((row, r) => row.forEach((on, s) => cells[r][s].setAttribute('aria-pressed', String(on)))); }

  // ---- som de cada passo ----
  function trigger(r, s, t) {
    const P = PRESETS[preset], ch = P.chords[bar % P.chords.length], beat = 60 / bpm / 4;
    switch (TRACKS[r].id) {
      case 'bumbo': A.V.kick(t); break;
      case 'caixa': A.V.snare(t); break;
      case 'chimbal': A.V.hat(t, s % 2 ? 0.6 : 1); break;
      case 'cordas': preset === 'rock' ? A.V.bass(ch[0] - 12 + [0, 0, 12, 0][(s >> 1) % 4], t, beat * 1.6) : A.V.pluck(ch[0] - 12 + [0, 7, 12, 7][(s >> 1) % 4], t, 0.42, 1.2); break;
      case 'teclas': A.V.keys(ch.map((m) => m + 12), t, beat * 3.2, 0.1); break;
      case 'sopro': A.V.horn(ch[(s >> 1) % ch.length] + 12, t, beat * 1.7, 0.26); break;
    }
  }

  function scheduler() {
    const ctx = A.ctx;
    while (nextTime < ctx.currentTime + 0.12) {
      grid.forEach((row, r) => { if (row[step] && !muted[r]) trigger(r, step, nextTime); });
      queue.push({ step, t: nextTime });
      const swing = preset === 'samba' && step % 2 ? 0.012 : 0;
      nextTime += 60 / bpm / 4 + swing;
      step = (step + 1) % 16; if (step === 0) bar++;
    }
  }
  let lastDrawn = -1;
  function draw() {
    if (!playing) return;
    const now = A.ctx.currentTime;
    while (queue.length && queue[0].t <= now) {
      const q = queue.shift();
      if (lastDrawn >= 0) cells.forEach((row) => row[lastDrawn].classList.remove('now'));
      cells.forEach((row) => row[q.step].classList.add('now'));
      lastDrawn = q.step;
    }
    requestAnimationFrame(draw);
  }

  const playBtn = document.getElementById('seqPlay');
  function start() {
    if (!A.init()) { document.getElementById('seqMsg').textContent = 'Seu navegador não liberou o áudio. Tente outro navegador.'; return; }
    playing = true; step = 0; bar = 0; nextTime = A.ctx.currentTime + 0.06; queue.length = 0;
    timer = setInterval(scheduler, 25); scheduler(); requestAnimationFrame(draw);
    playBtn.setAttribute('aria-pressed', 'true'); playBtn.setAttribute('aria-label', 'Parar');
    document.dispatchEvent(new CustomEvent('od:playing', { detail: true }));
  }
  function stop() {
    playing = false; clearInterval(timer);
    if (lastDrawn >= 0) cells.forEach((row) => row[lastDrawn].classList.remove('now'));
    lastDrawn = -1;
    playBtn.setAttribute('aria-pressed', 'false'); playBtn.setAttribute('aria-label', 'Tocar');
    document.dispatchEvent(new CustomEvent('od:playing', { detail: false }));
  }
  playBtn.addEventListener('click', () => (playing ? stop() : start()));
  document.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && e.target === document.body && root.getBoundingClientRect().top < innerHeight && root.getBoundingClientRect().bottom > 0) { e.preventDefault(); playing ? stop() : start(); }
  });

  // ---- presets e tempo ----
  const bpmIn = document.getElementById('bpm'), bpmOut = document.getElementById('bpmOut');
  const chips = [...document.querySelectorAll('[data-preset]')];
  function load(name) {
    preset = name; const P = PRESETS[name];
    grid = P.p.map((row) => [...row].map((c) => c === 'x'));
    bpm = P.bpm; bpmIn.value = bpm; bpmOut.textContent = bpm;
    chips.forEach((c) => c.setAttribute('aria-pressed', String(c.dataset.preset === name)));
    paint(); summary();
  }
  chips.forEach((c) => c.addEventListener('click', () => {
    if (c.dataset.preset === 'limpar') { grid = TRACKS.map(() => new Array(16).fill(false)); paint(); summary(); chips.forEach((x) => x.setAttribute('aria-pressed', 'false')); return; }
    load(c.dataset.preset);
  }));
  bpmIn.addEventListener('input', () => { bpm = +bpmIn.value; bpmOut.textContent = bpm; });

  // ---- resumo da banda ----
  const msg = document.getElementById('seqMsg');
  function summary() {
    const courses = [...new Set(TRACKS.filter((t, r) => !muted[r] && grid[r].some(Boolean)).map((t) => t.course))];
    if (!courses.length) { msg.innerHTML = 'Grade vazia. Clique nos quadrados para criar sua batida.'; return; }
    const list = courses.length > 1 ? courses.slice(0, -1).join(', ') + ' e ' + courses.slice(-1) : courses[0];
    msg.innerHTML = `Sua banda agora: <b>${list}</b>. Na Open Doors você aprende a tocar ${courses.length > 1 ? 'cada um deles' : 'esse instrumento'} de verdade.`;
  }

  // ---- compartilhar a batida pelo link ----
  const share = document.getElementById('seqShare');
  function encode() { return 'batida-' + preset + '-' + bpm + '-' + grid.map((row) => parseInt(row.map((b) => (b ? 1 : 0)).join(''), 2).toString(16).padStart(4, '0')).join(''); }
  function decode(h) {
    const m = /^#batida-(pop|samba|rock)-(\d{2,3})-([0-9a-f]{24})$/.exec(h); if (!m) return false;
    load(m[1]); bpm = Math.min(150, Math.max(60, +m[2])); bpmIn.value = bpm; bpmOut.textContent = bpm;
    grid = TRACKS.map((_, r) => parseInt(m[3].substr(r * 4, 4), 16).toString(2).padStart(16, '0').split('').map((c) => c === '1'));
    paint(); summary(); return true;
  }
  share.addEventListener('click', () => {
    const url = location.origin + location.pathname + '#' + encode();
    history.replaceState(null, '', '#' + encode());
    const done = () => { const o = share.textContent; share.textContent = 'Link copiado'; setTimeout(() => (share.textContent = o), 1800); };
    if (navigator.clipboard) navigator.clipboard.writeText(url).then(done, done); else done();
  });

  // ---- medidor ----
  const cv = document.getElementById('meter'), cx = cv.getContext('2d');
  let buf = null, raf = 0;
  function fit() { const d = Math.min(devicePixelRatio || 1, 2); cv.width = cv.clientWidth * d; cv.height = cv.clientHeight * d; cx.setTransform(d, 0, 0, d, 0, 0); }
  fit(); addEventListener('resize', fit);
  function meter() {
    const W = cv.clientWidth, H = cv.clientHeight, an = A.analyser;
    cx.clearRect(0, 0, W, H);
    if (an) { buf = buf || new Uint8Array(an.frequencyBinCount); an.getByteFrequencyData(buf); }
    const n = 40, bw = W / n;
    for (let i = 0; i < n; i++) {
      const v = buf ? buf[Math.floor(Math.pow(i / n, 1.6) * buf.length * 0.6)] / 255 : 0;
      const h = Math.max(2, v * H);
      cx.fillStyle = `rgba(212,169,78,${0.25 + v * 0.75})`;
      cx.fillRect(i * bw + 1, H - h, bw - 2, h);
    }
    raf = requestAnimationFrame(meter);
  }
  meter();

  if (!decode(location.hash)) load('pop');
  window.ODSeq = { stop };
})();
