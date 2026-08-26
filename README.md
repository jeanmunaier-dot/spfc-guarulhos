# Escola de Futebol SPFC — Unidade Guarulhos

Site institucional + landing page de conversão com **agendamento de aula experimental**
e **painel admin** de disponibilidade. Site estático (roda em GitHub Pages, Netlify,
Hostinger, qualquer lugar) com backend em **Google Apps Script + Planilha Google**.

---

## 1. Ligar antes de anunciar (obrigatório)

| Onde | O quê |
|---|---|
| `assets/js/config.js` → `whatsapp` | Número real da escola, formato `5511999998888` |
| `assets/js/config.js` → `endpoint` | URL `/exec` do Apps Script (passo 2) |
| `assets/js/config.js` → `metaPixelId` | Pixel da Meta, se for rodar tráfego |
| `index.html` e demais → `canonical` / `og:url` | Trocar `spfcguarulhos.com.br` pelo domínio final |
| `robots.txt` / `sitemap.xml` | Mesmo domínio |

> Dados de endereço e telefones vieram de listagens públicas (Moovit / Facebook /
> Instagram da escola). **Confirmar com o cliente** antes de publicar.

---

## 2. Backend (planilha) — 5 minutos

1. Crie uma Planilha Google: *SPFC Guarulhos — Agenda*.
2. **Extensões → Apps Script**, apague tudo e cole `apps-script/Codigo.gs`.
3. Rode a função `instalar()` uma vez e autorize.
4. **Implantar → Nova implantação → App da Web**
   - Executar como: **Eu**
   - Quem tem acesso: **Qualquer pessoa**
5. Copie a URL `/exec` → cole em `config.js` (`endpoint`).
6. Na aba **Config** da planilha troque `SENHA_PAINEL` e `WHATSAPP`.

A planilha ganha 4 abas: **Leads**, **Config**, **Grade**, **Excecoes**.

---

## 3. Painel admin — `/admin.html`

- **Grade da semana**: marca os horários abertos para experimental em cada dia e
  quantas vagas cabem. Publica e já vale no site.
- **Exceções por data**: feriado, campeonato, campo interditado. Ou fecha o dia
  inteiro, ou define horários especiais só naquela data. Exceção manda mais que a grade.
- **Agendamentos recebidos**: os mesmos leads da planilha, com link direto pro
  WhatsApp do responsável e a origem do tráfego (utm / meta / google).

Sem o `endpoint` configurado o painel abre em **modo demonstração**
(senha `spfc2026`, tudo salvo no navegador) — dá pra mostrar pro cliente antes de ligar a planilha.

---

## 4. As três travas anti-furo do agendamento

Escola de futebol perde lead em três lugares. O site já cobre os três:

1. **Lead gravado antes do redirect.** O agendamento vai pra planilha *antes* de
   abrir o WhatsApp. Se a internet cair, fica na fila em `localStorage` e é
   reenviado sozinho na próxima visita — ninguém some no meio do caminho.
2. **A agenda nunca aparece vazia.** Se o painel não publicou nada, ou se a
   planilha não responder, o site cai na `gradePadrao` do `config.js`.
   Nunca existe a tela "nenhum horário disponível".
3. **Horário cheio vira prova social.** Slot sem vaga não some — aparece riscado
   como **LOTADO**. Escola cheia convence; buraco na agenda gera objeção.
   Quando restam ≤ 2 vagas, o site mostra a escassez real (nunca inventada).

---

## 5. Estrutura

```
index.html        LP de conversão (destino do tráfego pago)
agendar.html      Funil isolado, sem distração (noindex)
a-escola.html     Institucional
turmas.html       Categorias por idade + funil embutido
estrutura.html    Galeria + como chegar
contato.html      Contato, mapa, FAQ
admin.html        Painel da agenda

build.py          Gera as páginas internas a partir do header/footer do index.html
apps-script/      Backend da planilha
assets/js/config.js    Tudo que muda de valor
assets/js/booking.js   Funil de agendamento
assets/js/admin.js     Painel
assets/img/gerar-og.py Gera a imagem de compartilhamento
```

**Atenção:** header e rodapé das páginas internas são gerados pelo `build.py`.
Editou o header no `index.html`? Rode `python build.py` para propagar.

---

## 6. Pendências

- [ ] Número de WhatsApp real
- [ ] Confirmar endereço, telefones e horário da secretaria
- [ ] Trocar as 8 fotos placeholder de `estrutura.html` por fotos reais do campo
- [ ] Publicar a planilha e colar o endpoint
- [ ] Pixel da Meta + evento `Lead` como conversão da campanha
- [ ] Domínio final (canonical, og:url, sitemap, robots)
