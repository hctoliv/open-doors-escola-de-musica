/* Open Doors · interações gerais */
(function () {
  'use strict';
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const WA = '5511985592748';

  /* topo sólido ao rolar + botão flutuante */
  const top = $('.top'), fab = $('.fab'), hero = $('.hero, .c-hero');
  function onScroll() {
    const y = scrollY;
    if (top && !top.classList.contains('page')) top.classList.toggle('solid', y > 40);
    if (fab) fab.classList.toggle('show', y > (hero ? hero.offsetHeight * 0.7 : 400));
  }
  addEventListener('scroll', onScroll, { passive: true }); onScroll();

  /* refletor que segue o cursor no hero */
  const h = $('.hero');
  if (h && !reduce) {
    let raf = 0;
    h.addEventListener('pointermove', (e) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const r = h.getBoundingClientRect();
        h.style.setProperty('--sx', ((e.clientX - r.left) / r.width) * 100 + '%');
        h.style.setProperty('--sy', ((e.clientY - r.top) / r.height) * 100 + '%');
      });
    });
  }

  /* vídeos do hero: tocam só quando aparecem na tela; com movimento reduzido, ficam na capa */
  const vids = $$('.hero video');
  if (reduce) {
    vids.forEach((v) => { v.removeAttribute('autoplay'); v.pause(); });
  } else if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => entries.forEach((e) => {
      const v = e.target;
      if (e.isIntersecting && getComputedStyle(v.closest('.reel, .hero-bg')).display !== 'none') {
        if (v.preload === 'none') v.preload = 'auto';
        const p = v.play(); if (p && p.catch) p.catch(() => {});
      } else v.pause();
    }), { threshold: 0.15 });
    vids.forEach((v) => io.observe(v));
  }

  /* ouvir o som de cada curso */
  $$('[data-demo]').forEach((b) => b.addEventListener('click', (e) => {
    e.preventDefault(); e.stopPropagation();
    if (window.ODSeq) window.ODSeq.stop();
    const d = window.ODA ? window.ODA.demo(b.dataset.demo) : 0;
    if (!d) return;
    b.classList.add('on'); clearTimeout(b._t); b._t = setTimeout(() => b.classList.remove('on'), d * 1000);
  }));

  /* copiar telefone / e-mail */
  $$('[data-copy]').forEach((b) => b.addEventListener('click', () => {
    const done = () => { const o = b.textContent; b.textContent = 'Copiado'; setTimeout(() => (b.textContent = o), 1600); };
    const fallback = () => { const r = document.createRange(); r.selectNodeContents(b.previousElementSibling); const s = getSelection(); s.removeAllRanges(); s.addRange(r); };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(b.dataset.copy).then(done, fallback); else fallback();
  }));

  /* mensagem pronta para o WhatsApp */
  const f = $('#composer');
  function compose() {
    if (!f) return;
    const nome = f.nome.value.trim(), curso = f.curso.value, quem = f.quem.value, per = f.periodo.value;
    const alvo = { mim: 'para mim', filho: 'para meu filho ou filha', outra: 'para outra pessoa' }[quem];
    const c = curso === 'indefinido' ? 'em aulas de música, mas ainda não sei qual instrumento' : 'no curso de ' + curso.toLowerCase();
    const p = per === 'sabado' ? 'aos sábados' : 'no período da ' + per;
    const msg = `Olá, Open Doors! ${nome ? 'Meu nome é ' + nome + '. ' : ''}Tenho interesse ${c}, ${alvo}. Prefiro aulas ${p}. Pode me passar valores e horários disponíveis?`;
    $('#composerPreview').textContent = msg;
    $('#composerGo').href = `https://wa.me/${WA}?text=${encodeURIComponent(msg)}`;
  }
  if (f) {
    f.addEventListener('input', compose); f.addEventListener('change', compose);
    f.addEventListener('submit', (e) => { e.preventDefault(); window.open($('#composerGo').href, '_blank', 'noopener'); });
    compose();
  }
  window.ODCompose = (curso) => { if (!f) return; f.curso.value = curso; compose(); $('#contato').scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' }); setTimeout(() => f.nome.focus({ preventScroll: true }), 600); };

  /* quiz: qual instrumento combina com você */
  const quiz = $('#quiz');
  if (quiz) {
    const COURSES = {
      cordas: { n: 'Cordas', t: 'Você gosta de estar no centro da roda. Violão, guitarra e baixo são o seu caminho.' },
      canto: { n: 'Canto', t: 'Sua voz já é o seu instrumento. Falta a técnica para ela ir mais longe.' },
      bateria: { n: 'Bateria', t: 'Você sente o ritmo no corpo. A banda inteira vai depender de você.' },
      sopro: { n: 'Sopro', t: 'Você gosta de melodia com personalidade. Sax e flauta foram feitos para isso.' },
      teclas: { n: 'Teclas', t: 'Você enxerga a música inteira, harmonia e melodia juntas. Teclado e piano são a sua cara.' },
      teatro: { n: 'Teatro', t: 'Você gosta de contar histórias e prender a atenção de quem assiste. O palco te espera.' }
    };
    const Q = [
      { q: 'Numa festa, onde você está?', o: [['Perto da banda, batendo o pé no ritmo', { bateria: 2 }], ['Cantando junto todas as músicas', { canto: 2 }], ['Na roda de violão', { cordas: 2 }], ['Contando histórias para a turma', { teatro: 2 }]] },
      { q: 'Qual som te arrepia?', o: [['Um solo de guitarra', { cordas: 2 }], ['Um piano tocando sozinho', { teclas: 2 }], ['Um sax no fim da noite', { sopro: 2 }], ['Uma voz forte e afinada', { canto: 2 }]] },
      { q: 'No palco, qual é o seu papel?', o: [['Segurar o ritmo da banda', { bateria: 2, cordas: 1 }], ['Ficar na frente, olhando o público', { canto: 1, teatro: 2 }], ['Criar a harmonia', { teclas: 2, cordas: 1 }], ['Fazer a melodia brilhar', { sopro: 2, teclas: 1 }]] }
    ];
    let i = 0, score = {};
    const body = $('.q-body', quiz), bars = $$('.progress i', quiz);
    function render() {
      bars.forEach((b, k) => b.classList.toggle('on', k <= i));
      if (i >= Q.length) return result();
      body.innerHTML = `<div class="q-step"><span class="label">Pergunta ${i + 1} de ${Q.length}</span><h3>${Q[i].q}</h3><div class="opts">${Q[i].o.map((o, k) => `<button type="button" class="opt" data-k="${k}">${o[0]}</button>`).join('')}</div></div>`;
      $$('.opt', body).forEach((b) => b.addEventListener('click', () => {
        const pts = Q[i].o[+b.dataset.k][1];
        Object.entries(pts).forEach(([k, v]) => (score[k] = (score[k] || 0) + v));
        i++; render(); const first = $('.opt', body); if (first) first.focus({ preventScroll: true });
      }));
    }
    function result() {
      const best = Object.entries(score).sort((a, b) => b[1] - a[1])[0][0], c = COURSES[best];
      body.innerHTML = `<div class="result"><span class="label">Seu instrumento</span><p class="big">${c.n}</p><p>${c.t}</p>
        <div class="acts"><button type="button" class="btn btn-gold" data-go>Quero aprender ${c.n.toLowerCase()}</button>
        <button type="button" class="btn btn-line" data-demo="${best}">Ouvir</button>
        <a class="btn btn-line" href="cursos/${best}.html">Ver o curso</a>
        <button type="button" class="btn btn-line" data-again>Refazer</button></div></div>`;
      $('[data-go]', body).addEventListener('click', () => window.ODCompose(c.n));
      $('[data-again]', body).addEventListener('click', () => { i = 0; score = {}; render(); });
      $('[data-demo]', body).addEventListener('click', (e) => { if (window.ODSeq) window.ODSeq.stop(); window.ODA && window.ODA.demo(best); });
    }
    render();
  }

  /* ano no rodapé */
  $$('[data-year]').forEach((el) => (el.textContent = new Date().getFullYear()));
})();
