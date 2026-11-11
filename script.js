(function(){
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- hero: linhas de pauta que vibram com o cursor ---------- */
const cv = document.getElementById('stage'), cx = cv.getContext('2d');
let W=0,H=0,dpr=1,mx=.5,my=.4,t=0;
function size(){dpr=Math.min(devicePixelRatio||1,2);W=cv.clientWidth;H=cv.clientHeight;cv.width=W*dpr;cv.height=H*dpr;cx.setTransform(dpr,0,0,dpr,0,0)}
size(); addEventListener('resize',size);
cv.parentElement.addEventListener('pointermove',e=>{const r=cv.getBoundingClientRect();mx=(e.clientX-r.left)/r.width;my=(e.clientY-r.top)/r.height});
const notes = Array.from({length:22},()=>({x:Math.random(),y:Math.random(),s:.4+Math.random()*.8,v:.0004+Math.random()*.0008,g:['♪','♫','♩','♬'][Math.random()*4|0]}));
function drawHero(){
  cx.clearRect(0,0,W,H);
  const lines=5, gap=Math.max(14,H*.028), base=H*.5-gap*2;
  for(let i=0;i<lines;i++){
    cx.beginPath();
    for(let x=0;x<=W;x+=6){
      const d=Math.exp(-Math.pow((x/W-mx)*3.2,2));
      const y=base+i*gap+Math.sin(x*.012+t*1.6+i*.7)*d*26*(1-Math.abs(my-.5))+Math.sin(x*.004+t*.4)*6;
      x?cx.lineTo(x,y):cx.moveTo(x,y);
    }
    cx.strokeStyle=`rgba(212,169,78,${.10+.05*i})`;cx.lineWidth=1;cx.stroke();
  }
  cx.font='22px serif';cx.textAlign='center';
  for(const n of notes){
    n.y-=n.v; if(n.y<-.05){n.y=1.05;n.x=Math.random()}
    cx.fillStyle=`rgba(242,213,143,${.08+.18*n.s})`;
    cx.save();cx.translate(n.x*W+Math.sin(t+n.y*8)*10,n.y*H);cx.scale(n.s,n.s);cx.fillText(n.g,0,0);cx.restore();
  }
}
function loop(){t+=.016;drawHero();drawScope();requestAnimationFrame(loop)}

/* ---------- osciloscópio ---------- */
const sc=document.getElementById('scope'), sx=sc.getContext('2d');
let SW=0,SH=0;
function sizeScope(){const d=Math.min(devicePixelRatio||1,2);SW=sc.clientWidth;SH=sc.clientHeight;sc.width=SW*d;sc.height=SH*d;sx.setTransform(d,0,0,d,0,0)}
sizeScope(); addEventListener('resize',sizeScope);
let actx=null, an=null, buf=null, master=null;
function drawScope(){
  sx.clearRect(0,0,SW,SH);
  sx.beginPath();
  if(an){an.getFloatTimeDomainData(buf)}
  const n=buf?buf.length:256;
  for(let i=0;i<n;i++){
    const x=i/(n-1)*SW;
    const v=buf?buf[i]:0;
    const y=SH/2+(v*SH*.9)+Math.sin(i*.08+t*2)*1.2;
    i?sx.lineTo(x,y):sx.moveTo(x,y);
  }
  sx.strokeStyle='#d4a94e';sx.lineWidth=1.6;sx.stroke();
}
if(reduce){drawHero();drawScope()} else loop();

/* ---------- síntese dos instrumentos ---------- */
function ac(){
  if(!actx){
    const C=window.AudioContext||window.webkitAudioContext; if(!C) return null;
    actx=new C(); master=actx.createGain(); master.gain.value=.7;
    const comp=actx.createDynamicsCompressor(); master.connect(comp);
    an=actx.createAnalyser(); an.fftSize=1024; buf=new Float32Array(an.fftSize);
    comp.connect(an); an.connect(actx.destination);
  }
  if(actx.state==='suspended') actx.resume();
  return actx;
}
const hz=m=>440*Math.pow(2,(m-69)/12);
function env(g,t0,a,peak,dec,end){g.gain.setValueAtTime(0.0001,t0);g.gain.exponentialRampToValueAtTime(peak,t0+a);g.gain.exponentialRampToValueAtTime(0.0001,t0+dec);return t0+(end||dec)}
function noise(sec){const b=actx.createBuffer(1,actx.sampleRate*sec,actx.sampleRate),d=b.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;const s=actx.createBufferSource();s.buffer=b;return s}

function pluck(m,t0,vol=.5){ // Karplus-Strong
  const sr=actx.sampleRate,len=Math.round(sr/hz(m)),dur=2.2,b=actx.createBuffer(1,sr*dur,sr),d=b.getChannelData(0);
  const ring=new Float32Array(len);for(let i=0;i<len;i++)ring[i]=Math.random()*2-1;
  let p=0;for(let i=0;i<d.length;i++){const nx=(p+1)%len;const v=(ring[p]+ring[nx])*.497;d[i]=ring[p];ring[p]=v;p=nx}
  const s=actx.createBufferSource();s.buffer=b;const g=actx.createGain();g.gain.value=vol;s.connect(g);g.connect(master);s.start(t0);
}
const sounds={
  cordas(){const t0=actx.currentTime;[43,47,50,55,59,67].forEach((m,i)=>pluck(m,t0+i*.045,.32));[55,59,62].forEach((m,i)=>pluck(m+12,t0+.9+i*.18,.28));return 2.4},
  canto(){
    const t0=actx.currentTime, seq=[[64,.5],[67,.5],[72,1.1]];let tt=t0;
    seq.forEach(([m,d])=>{
      const o=actx.createOscillator();o.type='sawtooth';o.frequency.value=hz(m);
      const vib=actx.createOscillator(),vg=actx.createGain();vib.frequency.value=5.4;vg.gain.value=hz(m)*.012;vib.connect(vg);vg.connect(o.frequency);
      const f1=actx.createBiquadFilter(),f2=actx.createBiquadFilter();f1.type=f2.type='bandpass';f1.frequency.value=780;f2.frequency.value=1150;f1.Q.value=f2.Q.value=6;
      const g=actx.createGain();o.connect(f1);o.connect(f2);f1.connect(g);f2.connect(g);g.connect(master);
      g.gain.setValueAtTime(0.0001,tt);g.gain.exponentialRampToValueAtTime(.9,tt+.08);g.gain.setValueAtTime(.9,tt+d-.08);g.gain.exponentialRampToValueAtTime(0.0001,tt+d+.15);
      o.start(tt);vib.start(tt);o.stop(tt+d+.2);vib.stop(tt+d+.2);tt+=d;
    });return tt-t0+.2},
  bateria(){
    const t0=actx.currentTime,step=.15,pat='K.h.S.h.K.KhS.hh';
    [...pat].forEach((c,i)=>{const tt=t0+i*step/1.4;
      if(c==='K'){const o=actx.createOscillator(),g=actx.createGain();o.frequency.setValueAtTime(150,tt);o.frequency.exponentialRampToValueAtTime(40,tt+.15);o.connect(g);g.connect(master);env(g,tt,.003,1,.35);o.start(tt);o.stop(tt+.4)}
      if(c==='S'){const n=noise(.25),f=actx.createBiquadFilter(),g=actx.createGain();f.type='highpass';f.frequency.value=1200;n.connect(f);f.connect(g);g.connect(master);env(g,tt,.002,.7,.2);n.start(tt);
        const o=actx.createOscillator(),g2=actx.createGain();o.frequency.value=190;o.connect(g2);g2.connect(master);env(g2,tt,.002,.4,.1);o.start(tt);o.stop(tt+.12)}
      if(c==='h'){const n=noise(.06),f=actx.createBiquadFilter(),g=actx.createGain();f.type='highpass';f.frequency.value=7000;n.connect(f);f.connect(g);g.connect(master);env(g,tt,.001,.3,.05);n.start(tt)}
    });return pat.length*step/1.4+.4},
  sopro(){
    const t0=actx.currentTime,seq=[[62,.18],[65,.18],[67,.18],[68,.12],[67,.5],[65,.2],[62,.7]];let tt=t0;
    const o=actx.createOscillator();o.type='sawtooth';const lp=actx.createBiquadFilter();lp.type='lowpass';lp.Q.value=4;const g=actx.createGain();
    const vib=actx.createOscillator(),vg=actx.createGain();vib.frequency.value=5;vg.gain.value=4;vib.connect(vg);vg.connect(o.frequency);
    o.connect(lp);lp.connect(g);g.connect(master);g.gain.setValueAtTime(0.0001,tt);g.gain.exponentialRampToValueAtTime(.5,tt+.05);
    seq.forEach(([m,d])=>{o.frequency.setValueAtTime(hz(m-12),tt);lp.frequency.setValueAtTime(600,tt);lp.frequency.exponentialRampToValueAtTime(2600,tt+.06);lp.frequency.exponentialRampToValueAtTime(1100,tt+d);tt+=d});
    g.gain.setValueAtTime(.5,tt-.1);g.gain.exponentialRampToValueAtTime(0.0001,tt+.2);o.start(t0);vib.start(t0);o.stop(tt+.25);vib.stop(tt+.25);return tt-t0+.25},
  teclas(){
    const t0=actx.currentTime,chords=[[60,64,67,71],[57,60,64,67],[53,57,60,64],[55,59,62,65]];
    chords.forEach((ch,ci)=>ch.forEach((m,i)=>{const tt=t0+ci*.55+i*.03;[1,2].forEach((mul,k)=>{const o=actx.createOscillator(),g=actx.createGain();o.type=k?'sine':'triangle';o.frequency.value=hz(m)*mul;o.connect(g);g.connect(master);env(g,tt,.005,k?.05:.16,1.4);o.start(tt);o.stop(tt+1.5)})}));
    return chords.length*.55+1.2},
  teatro(){
    const t0=actx.currentTime,dur=2.4;
    for(let i=0;i<140;i++){const tt=t0+Math.random()*dur*Math.random()**.3;const n=noise(.04),f=actx.createBiquadFilter(),g=actx.createGain();f.type='bandpass';f.frequency.value=900+Math.random()*1800;f.Q.value=1.2;n.connect(f);f.connect(g);g.connect(master);const fade=1-Math.max(0,(tt-t0-1.4)/1);env(g,tt,.001,.35*Math.max(.05,fade),.035);n.start(tt)}
    return dur+.2}
};
let busy=null;
document.querySelectorAll('.inst').forEach(b=>{
  b.addEventListener('pointermove',e=>{const r=b.getBoundingClientRect();b.style.setProperty('--x',((e.clientX-r.left)/r.width*100+20)/1.4+'%');b.style.setProperty('--y',((e.clientY-r.top)/r.height*100+20)/1.4+'%')});
  b.addEventListener('click',()=>{
    if(!ac()){document.getElementById('hint').textContent='Seu navegador não liberou o áudio.';return}
    const d=sounds[b.dataset.s]();
    b.classList.add('on');clearTimeout(b._t);b._t=setTimeout(()=>b.classList.remove('on'),d*1000);
    if(reduce){const tick=()=>{drawScope();if(b.classList.contains('on'))requestAnimationFrame(tick)};tick()}
  });
});

/* ---------- QR decorativo ---------- */
(function(){const q=document.getElementById('qr').getContext('2d');q.fillStyle='#140c14';
  const fin=(x,y)=>{q.fillRect(x,y,7,7);q.clearRect(x+1,y+1,5,5);q.fillRect(x+2,y+2,3,3)};
  let s=7;const r=()=>(s=(s*16807)%2147483647)/2147483647;
  for(let y=0;y<21;y++)for(let x=0;x<21;x++){if((x<8&&y<8)||(x>12&&y<8)||(x<8&&y>12))continue;if(r()>.52)q.fillRect(x,y,1,1)}
  fin(0,0);fin(14,0);fin(0,14);})();

/* ---------- copiar ---------- */
document.querySelectorAll('[data-copy]').forEach(b=>b.addEventListener('click',()=>{
  const done=()=>{const o=b.textContent;b.textContent='Copiado';setTimeout(()=>b.textContent=o,1600)};
  const sel=()=>{const v=b.previousElementSibling;const r=document.createRange();r.selectNodeContents(v);const s=getSelection();s.removeAllRanges();s.addRange(r)};
  if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(b.dataset.copy).then(done,sel)}else sel();
}));

/* ---------- mensagem de WhatsApp ---------- */
const f=document.getElementById('waForm'),link=document.getElementById('waLink');
function compose(){
  const nome=f.nome.value.trim(),curso=f.curso.value,quem=f.quem.value,per=f.periodo.value;
  const alvo={ 'Para mim':'para mim','Para meu filho(a)':'para meu filho(a)','Para outra pessoa':'para outra pessoa'}[quem];
  const msg=`Olá, Open Doors! ${nome?`Meu nome é ${nome}. `:''}Tenho interesse no curso de ${curso==='Ainda não sei'?'música, mas ainda não sei qual instrumento':curso.toLowerCase()} ${alvo}. Prefiro o período da ${per==='Sábado'?'manhã de sábado':per.toLowerCase()}. Pode me passar mais informações?`;
  link.href='https://wa.me/5511985592748?text='+encodeURIComponent(msg);
}
f.addEventListener('input',compose);f.addEventListener('change',compose);f.addEventListener('submit',e=>e.preventDefault());compose();
})();
