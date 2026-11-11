# Open Doors – Escola de Música

Site da Open Doors – Escola de Música (Av. Sapopemba, 7906 – Vila Fátima, São Paulo).
HTML, CSS e JavaScript puros, sem frameworks e sem etapa de build no deploy.

No ar: https://hctoliv.github.io/open-doors-escola-de-musica/

## O que tem

- **Home** com foto real do palco da escola, portas que se abrem na entrada (sem tela de carregamento).
- **Sala de ensaio**: sequenciador de 16 passos com bateria, cordas, teclas e sopro sintetizados no navegador (Web Audio, nenhum arquivo de áudio). Estilos Pop, Samba e Rock, BPM ajustável e link para compartilhar a batida. No celular a grade gira para caber na tela.
- **Quiz** "qual instrumento combina com você", que termina numa mensagem pronta para o WhatsApp.
- **Páginas por curso** (`cursos/*.html`) para buscas locais como "aula de bateria Vila Fátima".
- **Programa de palco** (Rising Stars, Stars, Super Stars) com os selos reais.
- **App do aluno**, depoimentos reais, perguntas frequentes e formulário que monta a mensagem do WhatsApp.
- **SEO**: dados estruturados `MusicSchool`, `FAQPage`, `Course` e `BreadcrumbList`, Open Graph com imagem 1200×630, `sitemap.xml`, `robots.txt`, 404 personalizada, manifest e ícones.

## Estrutura

```
index.html            home (gerada)
cursos/*.html         uma página por curso (geradas)
404.html              página de erro (gerada)
assets/css/site.css   estilos
assets/js/audio.js    motor de som (Web Audio)
assets/js/sequencer.js sala de ensaio
assets/js/site.js     topo, quiz, cópia de contatos, mensagem do WhatsApp
assets/img/           fotos e selos otimizados (WebP + JPG)
tools/build.py        gerador das páginas
```

## Editar textos

Os textos de cursos, níveis, depoimentos e perguntas ficam no topo de `tools/build.py`.
Depois de editar, gere as páginas de novo:

```bash
python3 tools/build.py
```

## Rodar localmente

```bash
python3 -m http.server 8000
```

Abra http://localhost:8000.

## Publicação

GitHub Pages a partir da branch `main`. A versão anterior (v1) está na tag `v1`.
