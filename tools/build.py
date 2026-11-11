#!/usr/bin/env python3
"""Gera as páginas estáticas do site da Open Doors.

Uso:  python3 tools/build.py
Edite os dados abaixo (cursos, FAQ, depoimentos) e rode de novo. O resultado são
arquivos HTML comuns, prontos para o GitHub Pages; não há etapa de build no deploy.
"""
import json, os
from datetime import date
from html import escape

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BASE = "https://hctoliv.github.io/open-doors-escola-de-musica/"
WA = "5511985592748"
PHONE = "(11) 98559-2748"
EMAIL = "contato@escolademusicaopendoors.com.br"
ADDR = "Av. Sapopemba, 7906 – Vila Fátima, São Paulo – SP, 03255-000"
MAPS = "https://www.google.com/maps/search/?api=1&query=Open+Doors+Escola+de+M%C3%BAsica+Av.+Sapopemba+7906+S%C3%A3o+Paulo"
SOCIAL = [("Instagram", "https://www.instagram.com/opendoors_oficial/"),
          ("TikTok", "https://www.tiktok.com/@open.doors.escola"),
          ("Facebook", "https://www.facebook.com/profile.php?id=100089439295352")]
FONTS = "https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,400&display=swap"
VER = "3"

ICONS = {
    "cordas": '<path d="M30 6l8 8M34 10L20 24"/><path d="M20 24c-6-4-14-1-14 7 0 7 6 11 11 11 8 0 11-8 7-14"/><circle cx="17" cy="31" r="3"/><path d="M12 36l4-4"/>',
    "canto": '<rect x="18" y="4" width="12" height="22" rx="6"/><path d="M12 22a12 12 0 0 0 24 0M24 34v8M17 42h14"/>',
    "bateria": '<ellipse cx="24" cy="26" rx="16" ry="5"/><path d="M8 26v10c0 3 7 5 16 5s16-2 16-5V26"/><path d="M12 6l9 15M36 6l-9 15"/>',
    "sopro": '<path d="M30 4l6 6-14 14v8c0 6-4 10-9 10s-7-4-7-7 3-5 6-5h4V18z"/><path d="M26 14l2 2M23 17l2 2M20 20l2 2"/>',
    "teclas": '<rect x="4" y="12" width="40" height="24" rx="3"/><path d="M12 12v24M20 12v24M28 12v24M36 12v24"/><path d="M10 12v12h4V12M18 12v12h4V12M34 12v12h4V12"/>',
    "teatro": '<path d="M6 8h20v12c0 7-4 12-10 12S6 27 6 20z"/><path d="M11 16h2M19 16h2M12 24c2 2 6 2 8 0"/><path d="M28 16h14v10c0 7-4 12-10 12-3 0-5-1-7-3"/><path d="M32 23h2M38 23h2M33 31c2-2 6-2 8 0"/>',
}

COURSES = [
    dict(slug="cordas", name="Cordas", short="Violão, guitarra e outros instrumentos de corda, da primeira posição de acorde ao solo.",
         lead="Do primeiro acorde à primeira música inteira. Nas aulas de cordas você aprende a tocar acompanhando, solando e, logo, se apresentando nos saraus da escola.",
         learn=[("Acordes e ritmos", "As posições básicas e as batidas que aparecem nas músicas que você já gosta."),
                ("Mão direita", "Dedilhado e palheta para tocar com firmeza e sem travar."),
                ("Cifras e tablaturas", "Ler o que está na internet e transformar em música no instrumento."),
                ("Repertório", "Músicas escolhidas com o professor para o seu nível e o seu gosto.")]),
    dict(slug="canto", name="Canto", short="Técnica vocal, respiração e repertório para cantar com segurança.",
         lead="A voz é o instrumento que você já carrega. As aulas de canto trabalham técnica, respiração e afinação para você cantar com segurança, sozinho ou com a banda.",
         learn=[("Respiração e apoio", "Controlar o ar para sustentar as notas sem cansar a voz."),
                ("Afinação", "Treinar o ouvido para cantar no tom certo."),
                ("Extensão e timbre", "Explorar sua voz com segurança, sem forçar."),
                ("Interpretação", "Cantar com intenção e presença, do ensaio ao palco.")]),
    dict(slug="bateria", name="Bateria", short="Coordenação, levadas e groove, do rock ao samba.",
         lead="Quem segura o ritmo segura a banda. Nas aulas de bateria você desenvolve coordenação, pulso firme e as levadas dos estilos que mais gosta.",
         learn=[("Coordenação", "Mãos e pés independentes, com exercícios progressivos."),
                ("Levadas", "Rock, pop, samba e outros ritmos para tocar de verdade."),
                ("Leitura rítmica", "Entender e escrever os ritmos que você toca."),
                ("Tocar com a banda", "Viradas, dinâmica e pulso para acompanhar outros músicos.")]),
    dict(slug="sopro", name="Sopro", short="Saxofone e outros instrumentos de sopro, com leitura e improviso.",
         lead="Poucos sons chamam tanta atenção quanto um sopro bem tocado. As aulas trabalham embocadura, respiração e repertório para você fazer a melodia aparecer.",
         learn=[("Embocadura e respiração", "A base para tirar um som bonito e estável."),
                ("Escalas e articulação", "Agilidade para tocar frases limpas."),
                ("Leitura de partitura", "Ler melodias e tocar com outros músicos."),
                ("Improviso", "Os primeiros passos para criar suas próprias frases.")]),
    dict(slug="teclas", name="Teclas", short="Teclado com leitura de partitura e cifra.",
         lead="No teclado você toca melodia e harmonia ao mesmo tempo. As aulas levam você das primeiras notas às músicas completas, com cifra e partitura.",
         learn=[("Postura e dedilhado", "Mãos posicionadas para tocar com conforto e precisão."),
                ("Acordes e cifras", "Acompanhar músicas e cantar junto."),
                ("Leitura de partitura", "Ler as duas claves e tocar com as duas mãos."),
                ("Repertório", "Músicas do seu gosto, adaptadas ao seu nível.")]),
    dict(slug="teatro", name="Teatro", short="Expressão, voz e presença de palco para atuar sem medo.",
         lead="O teatro trabalha voz, corpo e imaginação. É para quem quer atuar e também para quem quer perder o medo de falar em público.",
         learn=[("Expressão corporal", "Usar o corpo para contar a história."),
                ("Voz e dicção", "Ser ouvido e entendido do fundo da plateia."),
                ("Improvisação", "Criar cenas na hora, com segurança e bom humor."),
                ("Montagem", "Ensaiar e apresentar uma cena para o público.")]),
]

LEVELS = [
    dict(img="rising-stars", tier="Nível 1 · Iniciantes", name="Rising Stars",
         intro="Para quem acabou de começar a jornada musical na Open Doors.",
         crit=["Alunos iniciantes."],
         where="Saraus na escola e pequenas apresentações dentro ou em frente à Open Doors."),
    dict(img="stars", tier="Nível 2 · Conhecimento básico", name="Stars",
         intro="Para quem já tem um breve conhecimento musical.",
         crit=["Matrícula há 2 meses ou mais.", "No máximo 2 faltas sem justificativa.", "Habilidades mínimas para se apresentar.", "Ter participado da apresentação de formação Rising Stars."],
         where="Lojas parceiras, teatros e outras apresentações de médio porte."),
    dict(img="super-stars", tier="Nível 3 · Médio a alto", name="Super Stars",
         intro="Para quem já tem conhecimento musical médio ou alto.",
         crit=["Matrícula há 2 meses ou mais.", "No máximo 2 faltas sem justificativa.", "Habilidades mínimas para se apresentar.", "Ter participado da apresentação de formação Rising Stars."],
         where="Lojas parceiras, teatros e outras apresentações de médio porte."),
]

QUOTES = [
    ("Ótima escola para iniciantes, minha filha está amando as aulas de teclado. Professores e funcionários atenciosos, boa comunicação no grupo de recados e reposição de aulas quando cai no feriado.", "Michelle Palaria", "Mãe de aluna", "michelle"),
    ("Melhor impossível, pessoal super atencioso, lugar onde nos fazem sentir bem. Super recomendo! Eu, minha esposa e meu filho já fizemos aula lá, minha cunhada faz aula de canto. Muito bom.", "Paulo Roberto Dos Santos Castanheira", "Aluno", "paulo"),
    ("Só tenho experiências boas com a escola, desde a recepção aos professores! Super atenciosos, prestativos e qualificados. Além dos eventos que eles promovem para os alunos.", "Patrícia Américo", "Aluna", "patricia"),
]

FAQ = [
    ("Preciso saber tocar para começar?", "Não. O nível Rising Stars é feito para quem acabou de começar. Você entra do zero e já participa dos saraus da escola."),
    ("Os alunos se apresentam de verdade?", "Sim. Todo aluno começa no Rising Stars, com saraus e pequenas apresentações. Conforme evolui, passa para Stars e Super Stars e se apresenta em lojas parceiras, teatros e eventos de médio porte."),
    ("E se a aula cair em um feriado?", "A aula é reposta. Você acompanha as reposições no app, na área Aulas a repor."),
    ("Como acompanho aulas, pagamentos e faltas?", "Pelo app da Open Doors. Lá estão a agenda das aulas, as faturas, a justificativa de faltas, o check-in por QR code, a reserva de salas para estudar e o contato com professores e secretaria."),
    ("Quanto custa?", "Os valores dependem do curso e do formato da aula. Mande uma mensagem no WhatsApp e a secretaria passa os valores e horários disponíveis."),
    ("Onde fica a escola?", f"Na {ADDR}. Atendimento pelo WhatsApp {PHONE}."),
]

WA_SVG = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.7.8-.8 1-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.3-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6a2.7 2.7 0 0 0 1.8-1.2 2.2 2.2 0 0 0 .1-1.3c0-.1-.2-.2-.5-.3z"/></svg>'


def icon(slug, cls="", w=48):
    return f'<svg class="{cls}" viewBox="0 0 48 48" width="{w}" height="{w}" aria-hidden="true">{ICONS[slug]}</svg>'


def head(title, desc, path, pre, extra_ld=None):
    url = BASE + path
    ld = [{
        "@context": "https://schema.org", "@type": "MusicSchool", "@id": BASE + "#escola",
        "name": "Open Doors – Escola de Música", "url": BASE, "logo": BASE + "icon-512.png", "image": BASE + "og.jpg",
        "description": "Escola de música na Vila Fátima, São Paulo, com cursos de cordas, canto, bateria, sopro, teclas e teatro.",
        "telephone": "+55 11 98559-2748", "email": EMAIL,
        "address": {"@type": "PostalAddress", "streetAddress": "Av. Sapopemba, 7906", "addressLocality": "São Paulo", "addressRegion": "SP", "postalCode": "03255-000", "addressCountry": "BR"},
        "areaServed": "Zona Leste de São Paulo",
        "sameAs": [u for _, u in SOCIAL],
    }]
    if extra_ld:
        ld += extra_ld
    lds = "\n".join(f'<script type="application/ld+json">{json.dumps(x, ensure_ascii=False)}</script>' for x in ld)
    return f'''<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>{escape(title)}</title>
<meta name="description" content="{escape(desc)}">
<link rel="canonical" href="{url}">
<meta name="theme-color" content="#0b0a08">
<meta property="og:type" content="website">
<meta property="og:locale" content="pt_BR">
<meta property="og:site_name" content="Open Doors – Escola de Música">
<meta property="og:title" content="{escape(title)}">
<meta property="og:description" content="{escape(desc)}">
<meta property="og:url" content="{url}">
<meta property="og:image" content="{BASE}og.jpg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="{pre}favicon-32.png" sizes="32x32">
<link rel="apple-touch-icon" href="{pre}apple-touch-icon.png">
<link rel="manifest" href="{pre}site.webmanifest">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="{FONTS}">
<link rel="stylesheet" href="{pre}assets/css/site.css?v={VER}">
{lds}
</head>
<body>
<a class="skip" href="#conteudo">Pular para o conteúdo</a>
'''


def topbar(pre, page=False):
    home = pre or "./"
    links = [("Sala de ensaio", "ensaio"), ("Cursos", "cursos"), ("Palco", "palco"), ("App", "app"), ("Dúvidas", "duvidas"), ("Contato", "contato")]
    nav = "".join(f'<a href="{home if page else ""}#{h}">{n}</a>' for n, h in links)
    return f'''<header class="top{' page' if page else ''}">
  <div class="wrap">
    <a class="brand" href="{home}" aria-label="Open Doors, página inicial">
      <img src="{pre}assets/img/logo.webp" width="40" height="37" alt="Open Doors">
      <b>Escola<br>de Música</b>
    </a>
    <nav class="nav" aria-label="Principal">{nav}</nav>
    <a class="btn btn-gold btn-sm" href="{home if page else ''}#contato">Agendar visita</a>
  </div>
</header>
'''


def composer(selected=None):
    opts = "".join(f'<option value="{c["name"]}"{" selected" if c["slug"] == selected else ""}>{c["name"]}</option>' for c in COURSES)
    return f'''<form class="composer" id="composer" novalidate>
      <h3>Monte sua mensagem</h3>
      <label for="c-nome">Seu nome<input id="c-nome" name="nome" autocomplete="given-name" placeholder="Como podemos te chamar?"></label>
      <div class="two">
        <label for="c-curso">Curso<select id="c-curso" name="curso">{opts}<option value="indefinido"{"" if selected else " selected"}>Ainda não sei</option></select></label>
        <label for="c-quem">Para quem<select id="c-quem" name="quem"><option value="mim">Para mim</option><option value="filho">Para meu filho(a)</option><option value="outra">Para outra pessoa</option></select></label>
      </div>
      <label for="c-periodo">Melhor período<select id="c-periodo" name="periodo"><option value="manhã">Manhã</option><option value="tarde">Tarde</option><option value="noite" selected>Noite</option><option value="sabado">Sábado</option></select></label>
      <p class="preview" id="composerPreview" aria-live="polite"></p>
      <a class="btn btn-gold" id="composerGo" href="https://wa.me/{WA}" target="_blank" rel="noopener">{WA_SVG}Enviar pelo WhatsApp</a>
    </form>'''


def contact(selected=None):
    socials = "".join(f'<a class="btn btn-line btn-sm" href="{u}" target="_blank" rel="noopener">{n}</a>' for n, u in SOCIAL)
    return f'''<section class="sec visit" id="contato" aria-labelledby="t-contato">
  <div class="wrap visit-grid">
    <div>
      <div class="sec-head">
        <span class="label">Visite a escola</span>
        <h2 id="t-contato">A porta está aberta.</h2>
        <p>Venha conhecer as salas, conversar com a equipe e sentir o clima da escola. Um ambiente acolhedor, onde você faz amigos e se expressa pela arte.</p>
      </div>
      <div class="info">
        <div><span class="k">Endereço</span><span class="v">{ADDR}</span><a class="mini" href="{MAPS}" target="_blank" rel="noopener">Ver no mapa</a></div>
        <div><span class="k">WhatsApp</span><span class="v">{PHONE}</span><button class="mini" type="button" data-copy="{PHONE}">Copiar</button></div>
        <div><span class="k">E-mail</span><span class="v">{EMAIL}</span><button class="mini" type="button" data-copy="{EMAIL}">Copiar</button></div>
      </div>
      <div class="socials">{socials}</div>
    </div>
    {composer(selected)}
  </div>
</section>
'''


def footer(pre, page=False):
    home = pre or "./"
    cl = "".join(f'<li><a href="{pre}cursos/{c["slug"]}.html">{c["name"]}</a></li>' for c in COURSES)
    so = "".join(f'<li><a href="{u}" target="_blank" rel="noopener">{n}</a></li>' for n, u in SOCIAL)
    return f'''<footer class="foot">
  <div class="wrap">
    <div class="foot-grid">
      <div>
        <img src="{pre}assets/img/logo.webp" width="64" height="59" alt="Open Doors" loading="lazy">
        <p style="margin-top:16px;color:var(--muted);max-width:36ch">Portas abertas para fazer do seu sonho musical uma realidade.</p>
        <p style="margin-top:14px;color:var(--muted);font-size:.92rem">{ADDR}<br>{PHONE} · {EMAIL}</p>
      </div>
      <div><h4>Cursos</h4><ul>{cl}</ul></div>
      <div><h4>Redes</h4><ul>{so}<li><a href="https://wa.me/{WA}" target="_blank" rel="noopener">WhatsApp</a></li></ul></div>
    </div>
    <div class="base"><span>© <span data-year>{date.today().year}</span> Open Doors – Escola de Música</span><a href="#topo">Voltar ao topo ↑</a></div>
  </div>
</footer>
<a class="fab" href="https://wa.me/{WA}" target="_blank" rel="noopener" aria-label="Falar no WhatsApp">{WA_SVG}</a>
<script src="{pre}assets/js/audio.js?v={VER}" defer></script>
<script src="{pre}assets/js/site.js?v={VER}" defer></script>
'''


IG = "https://www.instagram.com/"
# Mural de reels do hero: vídeos reais do @opendoors_oficial, cortados sem legendas.
REELS = [
    [("ensaio", "Ensaio do espetáculo Além da Porta", "reel/DcPQnjtK3Hr/", "tall", None)],
    [("guitarra", "Professor e aluna na guitarra", "reel/DLs74Asy3Ay/", "", None),
     ("festival", "Festival junino", "reel/C88RlbHtEw-/", "wide", "Vídeo: @michel.e.araujo")],
    [("violino", "Exercício de violino", "reel/DTLlbuTESdK/", "", None),
     ("teatro", "Teatro no palco", "reel/DOeaw6wCvjU/", "", None)],
]


def reel_wall():
    cols = []
    for i, col in enumerate(REELS):
        tiles = "".join(f'''<a class="reel {shape}" href="{IG}{path}" target="_blank" rel="noopener" aria-label="{alt} (abre no Instagram)">
          <video src="assets/video/{n}.mp4" poster="assets/video/{n}.jpg" muted loop playsinline preload="{'auto' if n == 'ensaio' else 'none'}"></video>
          <span class="reel-tag">{alt}</span>{f'<small class="credit">{cr}</small>' if cr else ''}
        </a>''' for n, alt, path, shape, cr in col)
        cols.append(f'<div class="wall-col c{i + 1}">{tiles}</div>')
    return f'''<div class="wall rise d3" aria-label="Vídeos do Instagram da Open Doors">
      {"".join(cols)}
      <a class="wall-follow" href="{IG}opendoors_oficial/" target="_blank" rel="noopener"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor"/></svg>@opendoors_oficial</a>
    </div>'''


def index():
    courses = "".join(f'''
      <article class="course">
        {icon(c["slug"])}
        <h3><a href="cursos/{c["slug"]}.html">{c["name"]}</a></h3>
        <p>{c["short"]}</p>
        <div class="acts"><button class="listen" type="button" data-demo="{c["slug"]}"><i></i>{"Aplausos" if c["slug"] == "teatro" else "Ouvir"}</button><span class="arrow" aria-hidden="true">→</span></div>
      </article>''' for c in COURSES)
    levels = "".join(f'''
      <article class="level">
        <img src="assets/img/nivel-{l["img"]}.webp" width="148" height="148" alt="Selo {l["name"]}" loading="lazy">
        <span class="tier">{l["tier"]}</span>
        <h3>{l["name"]}</h3>
        <p style="color:var(--muted);font-size:.95rem;text-align:center">{l["intro"]}</p>
        <ul>{"".join(f"<li>{c}</li>" for c in l["crit"])}</ul>
        <p class="where"><b>Onde se apresenta</b>{l["where"]}</p>
      </article>''' for l in LEVELS)
    quotes = "".join(f'''
      <figure class="quote" style="margin:0">
        <blockquote style="margin:0"><p>“{q}”</p></blockquote>
        <figcaption class="who"><img src="assets/img/dep-{img}.webp" width="48" height="48" alt="" loading="lazy"><div><b>{n}</b><small>{r}</small></div></figcaption>
      </figure>''' for q, n, r, img in QUOTES)
    faq = "".join(f'<details><summary>{q}</summary><p>{a}</p></details>' for q, a in FAQ)
    faq_ld = {"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": a}} for q, a in FAQ]}
    ticker = "".join(f"<span>{w}</span>" for w in ["Cordas", "Canto", "Bateria", "Sopro", "Teclas", "Teatro", "Saraus", "Rising Stars", "Stars", "Super Stars"] * 2)
    app_items = [("Agenda das aulas", '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>'),
                 ("Faturas e boletos", '<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 8h8M8 12h8M8 16h5"/>'),
                 ("Justificativa de faltas", '<path d="M4 4h16v12H8l-4 4z"/><path d="M9 9h6"/>'),
                 ("Presença por QR code", '<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><path d="M14 14h3v3h-3zM20 14v7h-6"/>'),
                 ("Reserva de salas", '<path d="M3 21V8l9-5 9 5v13"/><path d="M9 21v-7h6v7"/>'),
                 ("Material de estudo", '<path d="M4 4h7a3 3 0 0 1 3 3v14a2 2 0 0 0-2-2H4zM20 4h-5a3 3 0 0 0-3 3"/>'),
                 ("Conversa com o professor", '<path d="M21 12a8 8 0 0 1-11.6 7.1L4 21l1.9-5.4A8 8 0 1 1 21 12z"/>'),
                 ("Metrônomo e gravador", '<path d="M8 21h8l-3-18h-2zM12 14l5-7"/>')]
    feats = "".join(f'<li><svg viewBox="0 0 24 24" aria-hidden="true">{p}</svg>{n}</li>' for n, p in app_items)
    phone_menu = [("Agenda", '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18"/>'), ("Aulas a repor", '<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/>'),
                  ("Declaração de matrícula", '<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 8h8M8 12h8"/>')]
    phone_menu2 = [("Marcar presença por QR code", '<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>'),
                   ("Calendário escolar", '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M8 3v4M16 3v4"/>'), ("Reserva de salas", '<path d="M3 21V8l9-5 9 5v13"/>'),
                   ("Metrônomo e gravador", '<path d="M8 21h8l-3-18h-2zM12 14l5-7"/>')]
    pm = lambda L: "".join(f'<li><svg viewBox="0 0 24 24" aria-hidden="true">{p}</svg>{n}</li>' for n, p in L)

    html = head("Open Doors – Escola de Música | Vila Fátima, São Paulo",
                "Escola de música na Av. Sapopemba, Vila Fátima (SP). Aulas de cordas, canto, bateria, sopro, teclas e teatro, com apresentações em saraus, lojas parceiras e teatros.",
                "", "", [faq_ld]) + topbar("") + f'''
<main id="conteudo">
<section class="hero" id="topo" aria-labelledby="t-hero">
  <div class="hero-bg" aria-hidden="true">
    <video class="bg-video" src="assets/video/ensaio.mp4" poster="assets/video/ensaio.jpg" muted loop playsinline autoplay preload="auto"></video>
  </div>
  <div class="shade"></div><div class="spot"></div>
  <div class="doors" aria-hidden="true"><div class="door l"></div><div class="door r"></div></div>
  <div class="wrap hero-grid">
    <div class="hero-copy">
      <span class="label rise d1">Escola de música · Vila Fátima, SP</span>
      <h1 id="t-hero" class="rise d2">Portas <span class="gold">abertas</span> para o seu sonho musical.</h1>
      <p class="lead rise d3">Mais que um curso: um caminho de vivência e experiência musical. Professores especializados, um ambiente acolhedor e palco de verdade desde o começo.</p>
      <div class="ctas rise d4">
        <a class="btn btn-gold" href="#contato">{WA_SVG}Quero conhecer a escola</a>
        <a class="btn btn-line" href="#ensaio">Tocar na sala de ensaio</a>
      </div>
      <div class="facts rise d5">
        <div><b>6</b><span>cursos de música e teatro</span></div>
        <div><b>3</b><span>níveis de palco</span></div>
        <div><b>1</b><span>app para acompanhar tudo</span></div>
      </div>
    </div>
    {reel_wall()}
  </div>
</section>

<div class="ticker" aria-hidden="true"><div>{ticker}</div></div>

<section class="sec studio" id="ensaio" aria-labelledby="t-ensaio">
  <div class="wrap">
    <div class="sec-head split-head">
      <div>
        <span class="label">Sala de ensaio</span>
        <h2 id="t-ensaio">Monte sua banda antes de entrar.</h2>
        <p>Aperte o play e clique nos quadrados para criar uma batida. Cada linha é um instrumento que você pode aprender na Open Doors.</p>
      </div>
    </div>
    <div class="rack">
      <div class="rack-top">
        <button class="play" id="seqPlay" type="button" aria-pressed="false" aria-label="Tocar">
          <svg class="i-play" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M7 4l13 8-13 8z"/></svg>
          <svg class="i-stop" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="6" y="6" width="12" height="12" rx="2"/></svg>
        </button>
        <div class="presets" role="group" aria-label="Estilos">
          <button class="chip" type="button" data-preset="pop" aria-pressed="true">Pop</button>
          <button class="chip" type="button" data-preset="samba" aria-pressed="false">Samba</button>
          <button class="chip" type="button" data-preset="rock" aria-pressed="false">Rock</button>
          <button class="chip" type="button" data-preset="limpar" aria-pressed="false">Limpar</button>
        </div>
        <label class="tempo" for="bpm">BPM <input type="range" id="bpm" min="60" max="150" value="96"><output id="bpmOut" for="bpm">96</output></label>
      </div>
      <div class="grid-scroll"><div class="seq" id="seq" role="group" aria-label="Grade de 16 passos"></div></div>
      <div class="rack-foot">
        <p id="seqMsg" aria-live="polite">Carregando a sala de ensaio.</p>
        <canvas class="meter" id="meter" aria-hidden="true"></canvas>
        <div style="display:flex;gap:10px;flex-wrap:wrap">
          <button class="btn btn-line btn-sm" type="button" id="seqShare">Copiar link da batida</button>
          <a class="btn btn-gold btn-sm" href="#quiz">Qual é o meu instrumento?</a>
        </div>
      </div>
    </div>
  </div>
</section>

<section class="sec" id="cursos" aria-labelledby="t-cursos">
  <div class="wrap">
    <div class="sec-head">
      <span class="label">Cursos</span>
      <h2 id="t-cursos">Seis caminhos para o palco.</h2>
      <p>Clique em “Ouvir” para escutar cada instrumento, ou abra o curso para ver o que você vai aprender.</p>
    </div>
    <div class="courses">{courses}
    </div>
  </div>
</section>

<section class="sec" id="quiz" aria-labelledby="t-quiz" style="padding-top:0">
  <div class="wrap">
    <div class="quiz">
      <div class="progress" aria-hidden="true"><i></i><i></i><i></i><i></i></div>
      <h2 id="t-quiz" class="sr">Qual instrumento combina com você?</h2>
      <div class="q-body" aria-live="polite"></div>
    </div>
  </div>
</section>

<section class="sec levels" id="palco" aria-labelledby="t-palco">
  <div class="wrap">
    <div class="sec-head">
      <span class="label">Programa de palco</span>
      <h2 id="t-palco">Do primeiro sarau ao teatro.</h2>
      <p>Na Open Doors todo aluno se apresenta. Conforme evolui, sobe de nível e ganha palcos maiores, dentro e fora da escola.</p>
    </div>
    <div class="stairs-wrap"><div class="stairs">{levels}
    </div></div>
  </div>
</section>

<section class="sec" id="app" aria-labelledby="t-app">
  <div class="wrap app">
    <div>
      <div class="sec-head">
        <span class="label">App do aluno</span>
        <h2 id="t-app">Seu curso na palma da mão.</h2>
        <p>Alunos e responsáveis acompanham tudo pelo aplicativo da Open Doors: aulas, pagamentos, faltas e a conversa com a escola.</p>
      </div>
      <ul class="feat">{feats}</ul>
    </div>
    <div>
      <div class="phone" role="img" aria-label="Ilustração do menu do app da Open Doors">
        <div class="screen">
          <div class="bar"><span class="ava">A</span><div><b>Aluno Open Doors</b><small>Escola de Música – Open Doors</small></div></div>
          <ul>{pm(phone_menu)}</ul>
          <p class="grp">Escola</p>
          <ul>{pm(phone_menu2)}</ul>
          <div class="tabs"><b>Menu</b><span>Tela inicial</span><span>Notificações</span></div>
        </div>
      </div>
      <p class="note">Ilustração baseada no menu real do app. O nome do aluno é fictício.</p>
    </div>
  </div>
</section>

<section class="sec levels" id="depoimentos" aria-labelledby="t-dep">
  <div class="wrap">
    <div class="sec-head">
      <span class="label">Depoimentos</span>
      <h2 id="t-dep">Quem passou pela porta.</h2>
    </div>
    <div class="quotes">{quotes}
    </div>
  </div>
</section>

<section class="sec" id="duvidas" aria-labelledby="t-faq">
  <div class="wrap faq">
    <div class="sec-head" style="margin:0">
      <span class="label">Dúvidas</span>
      <h2 id="t-faq">Antes de abrir a porta.</h2>
      <p>Não encontrou o que procurava? Chame no WhatsApp, a secretaria responde.</p>
    </div>
    <div>{faq}</div>
  </div>
</section>
''' + contact() + "</main>\n" + footer("") + f'<script src="assets/js/sequencer.js?v={VER}" defer></script>\n</body>\n</html>\n'
    return html


def course_page(c):
    pre = "../"
    others = "".join(f'<a class="btn btn-line btn-sm" href="{o["slug"]}.html">{o["name"]}</a>' for o in COURSES if o["slug"] != c["slug"])
    learn = "".join(f'<li><b>{t}</b><span>{d}</span></li>' for t, d in c["learn"])
    crumbs_ld = {"@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": [
        {"@type": "ListItem", "position": 1, "name": "Início", "item": BASE},
        {"@type": "ListItem", "position": 2, "name": c["name"], "item": BASE + f"cursos/{c['slug']}.html"}]}
    course_ld = {"@context": "https://schema.org", "@type": "Course", "name": f"Curso de {c['name']}", "description": c["lead"],
                 "provider": {"@id": BASE + "#escola"}, "inLanguage": "pt-BR",
                 "hasCourseInstance": {"@type": "CourseInstance", "courseMode": "onsite", "location": {"@type": "Place", "name": "Open Doors – Escola de Música", "address": ADDR}}}
    title = f"Aulas de {c['name']} na Vila Fátima, SP | Open Doors – Escola de Música"
    desc = f"Aulas de {c['name'].lower()} na Open Doors, Av. Sapopemba 7906, Vila Fátima (São Paulo). {c['short']}"
    levels = "".join(f'<li><b>{l["name"]}</b><span>{l["where"]}</span></li>' for l in LEVELS)
    return head(title, desc, f"cursos/{c['slug']}.html", pre, [crumbs_ld, course_ld]) + topbar(pre, page=True) + f'''
<main id="conteudo">
<section class="c-hero" id="topo" aria-labelledby="t-curso">
  <div class="wrap">
    <div>
      <nav class="crumbs" aria-label="Você está em"><a href="../">Início</a><span aria-hidden="true">/</span><a href="../#cursos">Cursos</a><span aria-hidden="true">/</span><span aria-current="page">{c["name"]}</span></nav>
      <span class="label">Curso</span>
      <h1 id="t-curso">{c["name"]}</h1>
      <p class="lead">{c["lead"]}</p>
      <div class="ctas">
        <a class="btn btn-gold" href="#contato">{WA_SVG}Quero aulas de {c["name"].lower()}</a>
        <button class="btn btn-line listen" type="button" data-demo="{c["slug"]}"><i></i>{"Ouvir aplausos" if c["slug"] == "teatro" else "Ouvir o som"}</button>
      </div>
    </div>
    {icon(c["slug"], "c-icon", 200)}
  </div>
</section>

<section class="sec" aria-labelledby="t-aprende">
  <div class="wrap">
    <div class="sec-head"><span class="label">Nas aulas</span><h2 id="t-aprende">O que você vai trabalhar.</h2>
      <p>O conteúdo se ajusta ao seu nível e ao seu objetivo. Converse com a escola para montar o seu caminho.</p></div>
    <ul class="learn">{learn}</ul>
  </div>
</section>

<section class="sec levels" aria-labelledby="t-palco2">
  <div class="wrap">
    <div class="sec-head"><span class="label">Programa de palco</span><h2 id="t-palco2">Você vai se apresentar.</h2>
      <p>Todo aluno de {c["name"].lower()} entra no programa de palco da Open Doors e sobe de nível conforme evolui.</p></div>
    <ul class="learn">{levels}</ul>
    <p style="margin-top:28px"><a class="btn btn-line btn-sm" href="../#palco">Ver critérios de cada nível</a></p>
  </div>
</section>
''' + contact(c["slug"]) + f'''
<section class="sec" style="padding-top:0" aria-label="Outros cursos">
  <div class="wrap" style="display:grid;gap:18px;padding-top:56px">
    <span class="label">Outros cursos</span>
    <div class="others">{others}</div>
  </div>
</section>
</main>
''' + footer(pre, page=True) + "</body>\n</html>\n"


def notfound():
    pre = "/open-doors-escola-de-musica/"
    return head("Página não encontrada | Open Doors – Escola de Música", "Essa página não existe.", "404.html", pre) + topbar(pre, page=True) + f'''
<main id="conteudo">
<section class="c-hero" id="topo" style="min-height:70svh;display:grid;align-items:center">
  <div class="wrap" style="grid-template-columns:1fr">
    <div>
      <span class="label">Erro 404</span>
      <h1>Essa porta está fechada.</h1>
      <p class="lead">A página que você procurou não existe ou mudou de endereço. As outras portas continuam abertas.</p>
      <div class="ctas"><a class="btn btn-gold" href="{pre}">Voltar ao início</a><a class="btn btn-line" href="{pre}#cursos">Ver os cursos</a></div>
    </div>
  </div>
</section>
</main>
''' + footer(pre, page=True) + "</body>\n</html>\n"


def write(rel, text):
    p = os.path.join(ROOT, rel)
    os.makedirs(os.path.dirname(p), exist_ok=True)
    with open(p, "w", encoding="utf-8") as f:
        f.write(text)
    print("ok", rel)


if __name__ == "__main__":
    write("index.html", index())
    for c in COURSES:
        write(f"cursos/{c['slug']}.html", course_page(c))
    write("404.html", notfound())
    today = date.today().isoformat()
    urls = [""] + [f"cursos/{c['slug']}.html" for c in COURSES]
    write("sitemap.xml", '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
          "".join(f"  <url><loc>{BASE}{u}</loc><lastmod>{today}</lastmod></url>\n" for u in urls) + "</urlset>\n")
    write("robots.txt", f"User-agent: *\nAllow: /\nSitemap: {BASE}sitemap.xml\n")
    write("site.webmanifest", json.dumps({"name": "Open Doors – Escola de Música", "short_name": "Open Doors", "start_url": "./", "display": "standalone",
                                          "background_color": "#0b0a08", "theme_color": "#0b0a08",
                                          "icons": [{"src": "icon-192.png", "sizes": "192x192", "type": "image/png"}, {"src": "icon-512.png", "sizes": "512x512", "type": "image/png"}]}, ensure_ascii=False, indent=1))
