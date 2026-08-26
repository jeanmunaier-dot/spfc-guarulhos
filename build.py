# -*- coding: utf-8 -*-
"""
Gerador das páginas internas do site.
O index.html é a fonte da verdade do header/footer/escudo.
Rode:  python build.py
"""
import re, io, os

BASE = os.path.dirname(os.path.abspath(__file__))
src = io.open(os.path.join(BASE, "index.html"), encoding="utf-8").read()

def bloco(inicio, fim):
    i = src.index(inicio)
    j = src.index(fim, i)
    return src[i:j]

SYMBOL = bloco("<!-- Escudo SPFC", "<header class=\"header\">")
HEADER = bloco("<header class=\"header\">", "<!-- ================= HERO")
FOOTER = bloco("<!-- ================= FOOTER", "<a class=\"wa-float\"")

HEAD = u"""<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{title}</title>
<meta name="description" content="{desc}">
<link rel="canonical" href="https://spfcguarulhos.com.br/{slug}">
<meta name="robots" content="{robots}">
<meta name="theme-color" content="#FE0000">
<meta property="og:type" content="website">
<meta property="og:locale" content="pt_BR">
<meta property="og:site_name" content="Escola de Futebol SPFC — Guarulhos">
<meta property="og:title" content="{title}">
<meta property="og:description" content="{desc}">
<meta property="og:url" content="https://spfcguarulhos.com.br/{slug}">
<meta property="og:image" content="https://spfcguarulhos.com.br/assets/img/og.png">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="assets/img/escudo.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700;800&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="assets/css/style.css">
</head>
<body>
"""

SCRIPTS = u"""<script src="assets/js/config.js"></script>
<script src="assets/js/main.js"></script>
{extra}</body>
</html>
"""

WAFLOAT = u"""<a class="wa-float" data-wa="Olá! Vim pelo site e quero agendar a aula experimental gratuita." target="_blank" rel="noopener" aria-label="Falar no WhatsApp">
  <svg viewBox="0 0 24 24"><path d="M12 2a10 10 0 0 0-8.6 15L2 22l5.2-1.4A10 10 0 1 0 12 2zm5.4 14.1c-.2.6-1.3 1.2-1.8 1.2s-1.1.3-3.6-.8-4-3.6-4.2-3.8-1.2-1.6-1.2-3 .8-2.1 1-2.4.5-.3.7-.3h.5c.2 0 .4 0 .6.5s.8 2 .9 2.1.1.3 0 .5-.2.4-.4.6-.3.4-.1.7.7 1.2 1.6 2c1.1.9 2 1.2 2.3 1.3s.4.1.6-.1.7-.8.9-1.1.4-.2.6-.1 1.6.8 1.9.9.4.2.5.3 0 .6-.2 1.2z"/></svg>
</a>
"""

# ---------- Hero interno reutilizável ----------
def hero(eyebrow, titulo, texto):
    return u"""<section class="hero" style="min-height:auto;padding:calc(var(--header-h) + 5rem) 0 4rem">
  <div class="hero-stripes"></div>
  <svg class="hero-crest" viewBox="0 0 200 224" aria-hidden="true"><use href="#crest"/></svg>
  <div class="wrap" style="display:block">
    <span class="eyebrow">{e}</span>
    <h1 style="font-size:clamp(2.2rem,5.4vw,4rem)" data-split>{t}</h1>
    <p class="lead">{x}</p>
  </div>
</section>
<div class="marquee" aria-hidden="true"><div>
  <span>Família Tricolor</span><span>Made in Cotia</span><span>Escola Oficial SPFC</span><span>Guarulhos</span><span>Aula experimental grátis</span>
</div></div>
""".format(e=eyebrow, t=titulo, x=texto)

CTA = u"""<section class="cta-final">
  <div class="wrap rv">
    <h2>Vem conhecer no campo</h2>
    <p>A aula experimental é gratuita e sem compromisso. Escolha o dia e o horário em menos de um minuto.</p>
    <p style="margin-top:2rem"><a class="btn btn-lg" style="background:#000" href="agendar.html">Agendar aula grátis</a></p>
  </div>
</section>
"""

# =====================================================================
PAGINAS = {}

# ---------------------------------------------------------- A ESCOLA
PAGINAS["a-escola.html"] = dict(
    title=u"A Escola | Escola de Futebol SPFC Guarulhos",
    desc=u"Conheça a Escola Oficial de Futebol do São Paulo FC em Guarulhos: metodologia Made in Cotia, comissão técnica formada e calendário de competições.",
    nav="a-escola.html",
    corpo=hero(u"A escola",
               u"O São Paulo <span class='txt-red'>em Guarulhos</span>",
               u"Somos uma unidade oficial licenciada do São Paulo Futebol Clube. Isso quer dizer método do clube, uniforme do clube e o escudo que seu filho já conhece — a poucos minutos de casa.") + u"""
<section class="section">
  <div class="wrap">
    <div class="grid g-2" style="align-items:center;gap:3rem">
      <div class="rv">
        <span class="eyebrow">Nosso jeito</span>
        <h2>Formar atleta é consequência.<br><span class="txt-red">Formar gente é o objetivo.</span></h2>
        <p class="lead">Nem toda criança que passa por aqui vira jogador profissional — e tudo bem. Mas todas levam junto disciplina, rotina, respeito ao coletivo e a experiência de vestir uma camisa que significa alguma coisa.</p>
        <p class="lead">O treino é dividido por faixa etária, conduzido por professores formados e organizado em ciclos: fundamentos, tática, competição.</p>
      </div>
      <div class="grid rv rv-d1" style="gap:1rem">
        <article class="card"><div class="ico">&#127942;</div><h3>Unidade oficial</h3><p>Licenciada pelo São Paulo Futebol Clube, seguindo as diretrizes do programa de escolas do clube.</p></article>
        <article class="card"><div class="ico">&#9917;</div><h3>Made in Cotia</h3><p>A metodologia que virou marca registrada da base tricolor, aplicada por idade e nível.</p></article>
        <article class="card"><div class="ico">&#128101;</div><h3>Turmas pequenas</h3><p>Número limitado de alunos por horário para o professor conseguir corrigir individualmente.</p></article>
      </div>
    </div>
  </div>
</section>

<section class="section section-alt">
  <div class="wrap">
    <div class="head center rv">
      <span class="eyebrow">Calendário</span>
      <h2>Aqui a molecada joga de verdade</h2>
      <p class="lead">Treino sem jogo cansa. Por isso o ano tem competição, festival e uma taça pra levantar.</p>
    </div>
    <div class="grid g-3">
      <article class="card rv"><div class="ico">&#127942;</div><h3>Campeonato interno</h3><p>Todas as categorias divididas em seleções, com tabela, disputa e final. É a festa do ano da Família Tricolor.</p></article>
      <article class="card rv rv-d1"><div class="ico">&#129351;</div><h3>Festivais e amistosos</h3><p>Jogos contra outras unidades e escolas da região, com arbitragem e uniforme oficial.</p></article>
      <article class="card rv rv-d2"><div class="ico">&#128248;</div><h3>Copa Avaliação</h3><p>Momento em que a comissão técnica observa evolução individual e conversa com as famílias.</p></article>
    </div>
  </div>
</section>

<section class="section">
  <div class="wrap">
    <div class="head center rv">
      <span class="eyebrow">Valores</span>
      <h2>O que a gente cobra dentro de campo</h2>
    </div>
    <div class="grid g-4">
      <article class="card rv"><div class="ico">&#9200;</div><h3>Pontualidade</h3><p>Chegar no horário é parte do treino. Rotina constrói atleta.</p></article>
      <article class="card rv rv-d1"><div class="ico">&#129309;</div><h3>Respeito</h3><p>Com o professor, com o companheiro e com o adversário. Sem exceção.</p></article>
      <article class="card rv rv-d2"><div class="ico">&#128170;</div><h3>Esforço</h3><p>Talento ajuda, entrega decide. A gente elogia quem tenta de novo.</p></article>
      <article class="card rv rv-d3"><div class="ico">&#127775;</div><h3>Alegria</h3><p>É futebol, é infância. Treino sério não é treino triste.</p></article>
    </div>
  </div>
</section>
""" + CTA)

# ---------------------------------------------------------- TURMAS
def turma_bloco(idc, nome, faixa, texto, itens, dias):
    lis = u"".join([u"<li>%s</li>" % i for i in itens])
    return u"""<article class="turma rv" id="{id}">
  <div class="turma-top"><small>{faixa}</small><b>{nome}</b></div>
  <div class="turma-body">
    <p style="color:var(--mute);font-size:.95rem">{texto}</p>
    <ul>{lis}</ul>
    <p style="margin:1rem 0 0;font-size:.85rem;color:var(--mute-2)"><b style="color:var(--red)">Treinos:</b> {dias}</p>
  </div>
  <div class="turma-foot"><a class="btn btn-block" href="agendar.html">Agendar experimental</a></div>
</article>""".format(id=idc, nome=nome, faixa=faixa, texto=texto, lis=lis, dias=dias)

PAGINAS["turmas.html"] = dict(
    title=u"Turmas e horários | Escola de Futebol SPFC Guarulhos",
    desc=u"Baby Foot, Sub-9, Sub-12 e Sub-15: veja as categorias por idade, o que é trabalhado em cada uma e os dias de treino na unidade Guarulhos.",
    nav="turmas.html",
    corpo=hero(u"Categorias",
               u"Turmas de <span class='txt-red'>4 a 15 anos</span>",
               u"Cada categoria tem objetivo, linguagem e intensidade próprios. Encontre a turma do seu filho e agende a experimental gratuita.") + u"""
<section class="section">
  <div class="wrap">
    <div class="grid g-2">
""" + turma_bloco("baby", u"Baby Foot", u"4 a 6 anos",
                  u"A porta de entrada. Aqui o objetivo é a criança se apaixonar pela bola — o resto vem depois.",
                  [u"Coordenação motora e equilíbrio", u"Primeiro contato com a bola", u"Jogos e brincadeiras dirigidas",
                   u"Socialização e regras básicas", u"Sem cobrança de resultado"],
                  u"Segunda a sábado, manhã e tarde") +
          turma_bloco("sub9", u"Sub-9", u"7 a 9 anos",
                      u"Idade de ouro para os fundamentos. É quando o gesto técnico é assimilado com mais facilidade.",
                      [u"Domínio, passe e condução", u"Finalização e chute", u"Noções de jogo coletivo",
                       u"Disciplina e rotina de treino", u"Primeiros festivais"],
                      u"Segunda a sábado, manhã e tarde") +
          turma_bloco("sub12", u"Sub-12", u"10 a 12 anos",
                      u"O jogo começa a ficar tático. O aluno passa a entender espaço, função e tomada de decisão.",
                      [u"Posicionamento e movimentação", u"Leitura de jogo", u"Trabalho por posição",
                       u"Campeonato interno", u"Preparação física introdutória"],
                      u"Segunda a sábado, manhã e tarde") +
          turma_bloco("sub15", u"Sub-15", u"13 a 15 anos",
                      u"Intensidade de competição. Categoria de quem quer levar o futebol a sério.",
                      [u"Preparação física específica", u"Sistemas de jogo", u"Amistosos e festivais",
                       u"Observação técnica individual", u"Orientação sobre peneiras"],
                      u"Segunda a sábado, manhã e tarde") + u"""
    </div>
  </div>
</section>

<section class="section section-alt">
  <div class="wrap">
    <div class="head center rv">
      <span class="eyebrow">Não sabe a turma?</span>
      <h2>A gente descobre em 1 minuto</h2>
      <p class="lead">Informe a idade do atleta e o sistema já indica a categoria certa e mostra os horários com vaga.</p>
    </div>
    <div class="booking rv" data-booking></div>
  </div>
</section>
""" + CTA,
    extra=u'<script src="assets/js/booking.js"></script>\n')

# ---------------------------------------------------------- ESTRUTURA
PAGINAS["estrutura.html"] = dict(
    title=u"Estrutura e localização | Escola de Futebol SPFC Guarulhos",
    desc=u"Campo, vestiários e espaço para os pais acompanharem o treino. Veja a estrutura da Escola Oficial do São Paulo FC em Guarulhos e como chegar.",
    nav="estrutura.html",
    corpo=hero(u"Estrutura",
               u"Onde o time <span class='txt-red'>treina de verdade</span>",
               u"Campo, vestiário, material oficial e um espaço pensado para a família acompanhar o treino de perto.") + u"""
<section class="section">
  <div class="wrap">
    <div class="gal rv">
      <figure><span class="ph">&#9917;</span><figcaption>Campo oficial</figcaption></figure>
      <figure><span class="ph">&#127967;</span><figcaption>Vestiários</figcaption></figure>
      <figure><span class="ph">&#128101;</span><figcaption>Espaço para os pais</figcaption></figure>
      <figure><span class="ph">&#128083;</span><figcaption>Uniforme oficial</figcaption></figure>
      <figure><span class="ph">&#127942;</span><figcaption>Campeonato interno</figcaption></figure>
      <figure><span class="ph">&#129351;</span><figcaption>Festivais</figcaption></figure>
      <figure><span class="ph">&#9970;</span><figcaption>Material de treino</figcaption></figure>
      <figure><span class="ph">&#128241;</span><figcaption>Secretaria</figcaption></figure>
    </div>
    <p class="note rv" style="margin-top:1.6rem">Espaço reservado para as fotos reais da unidade. Substitua cada bloco por uma imagem em <code>assets/img/</code>.</p>
  </div>
</section>

<section class="section section-alt">
  <div class="wrap">
    <div class="head center rv">
      <span class="eyebrow">O que tem</span>
      <h2>Tudo o que o treino pede</h2>
    </div>
    <div class="grid g-3">
      <article class="card rv"><div class="ico">&#9917;</div><h3>Campo</h3><p>Espaço adequado para treino de todas as categorias, com material completo de treinamento.</p></article>
      <article class="card rv rv-d1"><div class="ico">&#128704;</div><h3>Vestiário</h3><p>Para o atleta trocar de roupa antes e depois do treino com conforto e segurança.</p></article>
      <article class="card rv rv-d2"><div class="ico">&#128101;</div><h3>Área dos pais</h3><p>Lugar reservado para acompanhar o treino sem interferir no trabalho da comissão.</p></article>
      <article class="card rv rv-d3"><div class="ico">&#128083;</div><h3>Uniforme oficial</h3><p>Kit de treino com a identidade do São Paulo FC, do jeito que o aluno merece vestir.</p></article>
      <article class="card rv"><div class="ico">&#128717;</div><h3>Secretaria</h3><p>Atendimento presencial para matrícula, dúvidas e organização das turmas.</p></article>
      <article class="card rv rv-d1"><div class="ico">&#128663;</div><h3>Acesso fácil</h3><p>Localização central em Guarulhos, com acesso por transporte público e vias principais.</p></article>
    </div>
  </div>
</section>

<section class="section" id="chegar">
  <div class="wrap">
    <div class="head rv">
      <span class="eyebrow">Como chegar</span>
      <h2>A escola fica aqui</h2>
    </div>
    <div class="grid g-2 rv">
      <div class="map-box" data-map></div>
      <div>
        <ul class="info-list">
          <li><span class="ic">&#128205;</span><span><b>Endereço</b><span data-fill="endereco-full"></span></span></li>
          <li><span class="ic">&#128222;</span><span><b>Telefone</b><span data-fill="telefone"></span></span></li>
          <li><span class="ic">&#9993;</span><span><b>E-mail</b><span data-fill="email"></span></span></li>
          <li><span class="ic">&#128337;</span><span><b>Treinos</b><span>Segunda a sábado, manhã e tarde</span></span></li>
        </ul>
        <div style="display:flex;gap:.8rem;flex-wrap:wrap;margin-top:1.6rem">
          <a class="btn" data-href="maps" target="_blank" rel="noopener">Traçar rota no Maps</a>
          <a class="btn btn-wa" data-wa="Olá! Vim pelo site e quero saber como chegar na escola." target="_blank" rel="noopener">Falar no WhatsApp</a>
        </div>
      </div>
    </div>
  </div>
</section>
""" + CTA)

# ---------------------------------------------------------- CONTATO
PAGINAS["contato.html"] = dict(
    title=u"Contato | Escola de Futebol SPFC Guarulhos",
    desc=u"Fale com a secretaria da Escola Oficial de Futebol do São Paulo FC em Guarulhos: WhatsApp, telefone, e-mail e endereço.",
    nav="contato.html",
    corpo=hero(u"Contato",
               u"Fala com a <span class='txt-red'>secretaria</span>",
               u"Dúvida sobre turma, horário ou mensalidade? Chama no WhatsApp que a gente responde rápido — ou passa aqui pra conhecer o campo.") + u"""
<section class="section">
  <div class="wrap">
    <div class="grid g-2 rv" style="gap:2.5rem">
      <div>
        <ul class="info-list">
          <li><span class="ic">&#128172;</span><span><b>WhatsApp</b><span>O canal mais rápido — respondemos em horário comercial</span></span></li>
          <li><span class="ic">&#128222;</span><span><b>Telefones</b><span><span data-fill="telefone"></span> &nbsp;·&nbsp; <span data-fill="telefone2"></span></span></span></li>
          <li><span class="ic">&#9993;</span><span><b>E-mail</b><span data-fill="email"></span></span></li>
          <li><span class="ic">&#128205;</span><span><b>Endereço</b><span data-fill="endereco-full"></span></span></li>
          <li><span class="ic">&#128337;</span><span><b>Secretaria</b><span>Segunda a sexta, das 8h às 18h · Sábado, das 8h às 12h</span></span></li>
        </ul>
        <div style="display:flex;gap:.8rem;flex-wrap:wrap;margin-top:1.8rem">
          <a class="btn btn-wa btn-lg" data-wa="Olá! Vim pelo site da escola e queria tirar uma dúvida." target="_blank" rel="noopener">Chamar no WhatsApp</a>
          <a class="btn btn-ghost" data-href="instagram" target="_blank" rel="noopener">Ver o Instagram</a>
        </div>
        <p class="note" style="margin-top:1.8rem">Quer agendar a aula experimental? Não precisa nem chamar: <a href="agendar.html" style="color:var(--red)">marque direto por aqui</a> em 1 minuto.</p>
      </div>
      <div class="map-box" data-map></div>
    </div>
  </div>
</section>

<section class="section section-alt">
  <div class="wrap" style="max-width:820px">
    <div class="head center rv">
      <span class="eyebrow">Dúvidas</span>
      <h2>Perguntas frequentes</h2>
    </div>
    <div class="rv">
      <div class="faq-item"><button class="faq-q" aria-expanded="false">Preciso agendar para conhecer a escola?</button><div class="faq-a"><p>Para a aula experimental, sim — assim garantimos que a turma do seu filho estará treinando no horário. Para só conhecer a estrutura, pode passar durante o horário da secretaria.</p></div></div>
      <div class="faq-item"><button class="faq-q" aria-expanded="false">Quais documentos são necessários para matrícula?</button><div class="faq-a"><p>Documento do responsável, documento ou certidão da criança e comprovante de endereço. A secretaria orienta sobre atestado médico no ato da matrícula.</p></div></div>
      <div class="faq-item"><button class="faq-q" aria-expanded="false">Posso remarcar a aula experimental?</button><div class="faq-a"><p>Pode. É só responder a mensagem da confirmação no WhatsApp pedindo outro dia — a gente reorganiza sem problema.</p></div></div>
      <div class="faq-item"><button class="faq-q" aria-expanded="false">Vocês atendem outras regiões de Guarulhos?</button><div class="faq-a"><p>Recebemos alunos de toda a cidade e das cidades vizinhas. Muita família vem de bairros mais distantes por causa da chancela oficial do clube.</p></div></div>
    </div>
  </div>
</section>
""" + CTA)

# ---------------------------------------------------------- AGENDAR
PAGINAS["agendar.html"] = dict(
    title=u"Agendar aula experimental grátis | SPFC Guarulhos",
    desc=u"Escolha a turma pela idade, o dia e o horário. Aula experimental gratuita na Escola Oficial do São Paulo FC em Guarulhos.",
    nav="agendar.html",
    robots="noindex, follow",
    corpo=u"""<section class="hero" style="min-height:auto;padding:calc(var(--header-h) + 4rem) 0 3rem">
  <div class="hero-stripes"></div>
  <svg class="hero-crest" viewBox="0 0 200 224" aria-hidden="true"><use href="#crest"/></svg>
  <div class="wrap" style="display:block;text-align:center">
    <span class="eyebrow" style="justify-content:center">Aula experimental gratuita</span>
    <h1 style="font-size:clamp(2.2rem,5.4vw,4rem)" data-split>Escolha o dia do <span class="txt-red">primeiro treino</span></h1>
    <p class="lead" style="margin-inline:auto">Três passos rápidos. Só aparecem dias e horários que a escola liberou — e você vê na hora quantas vagas restam.</p>
  </div>
</section>

<section class="section" style="padding-top:0">
  <div class="wrap">
    <div class="booking rv" data-booking></div>
    <div class="grid g-3" style="margin-top:3rem">
      <article class="card rv"><div class="ico">&#128176;</div><h3>Não custa nada</h3><p>A experimental é gratuita e não gera compromisso de matrícula.</p></article>
      <article class="card rv rv-d1"><div class="ico">&#9917;</div><h3>Treino de verdade</h3><p>Seu filho entra na turma da idade dele e treina junto com os alunos.</p></article>
      <article class="card rv rv-d2"><div class="ico">&#128172;</div><h3>Confirmação na hora</h3><p>Depois de reservar, a confirmação sai direto no WhatsApp da secretaria.</p></article>
    </div>
  </div>
</section>
""",
    extra=u'<script src="assets/js/booking.js"></script>\n')

# =====================================================================
def gerar():
    for arquivo, p in PAGINAS.items():
        head = HEAD.format(title=p["title"], desc=p["desc"], slug=arquivo,
                           robots=p.get("robots", "index, follow"))
        header = HEADER.replace('href="index.html" aria-current="page"', 'href="index.html"')
        header = header.replace('href="%s"' % p["nav"], 'href="%s" aria-current="page"' % p["nav"], 1) \
            if p["nav"] != "agendar.html" else header
        header = header.replace('<a class="btn" href="#agendar">', '<a class="btn" href="agendar.html">')
        footer = FOOTER.replace('href="#agendar"', 'href="agendar.html"')
        html = head + SYMBOL + header + p["corpo"] + footer + WAFLOAT + \
            SCRIPTS.format(extra=p.get("extra", ""))
        io.open(os.path.join(BASE, arquivo), "w", encoding="utf-8").write(html)
        print("gerado:", arquivo)

if __name__ == "__main__":
    gerar()
