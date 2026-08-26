/* ============================================================
   AGENDAMENTO DA AULA EXPERIMENTAL — funil de 3 passos
   Regras de ouro:
   1) O lead é gravado ANTES de ir pro WhatsApp (e se a rede cair,
      fica salvo no navegador e é reenviado depois).
   2) A agenda NUNCA aparece vazia: se o painel não publicou nada,
      cai na grade padrão do config.js.
   3) Horário sem vaga não some — aparece como LOTADO. Escola cheia
      é prova social, buraco na agenda é objeção.
   ============================================================ */
(function () {
  "use strict";
  var C = window.SPFC || {};
  var DIAS = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
  var DIAS_C = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
  var MESES = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];

  var host = document.querySelector("[data-booking]");
  if (!host) return;

  var state = { step: 1, categoria: null, idade: "", dataISO: "", hora: "", enviando: false };
  var dispo = null;   // { grade, excecoes, ocupacao }
  var dias = [];      // dias calculados

  /* ---------------- utilidades de data ---------------- */
  function iso(d) {
    return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  }
  function rotulo(d, hoje) {
    var diff = Math.round((d - hoje) / 864e5);
    if (diff === 0) return "Hoje";
    if (diff === 1) return "Amanhã";
    return DIAS_C[d.getDay()];
  }
  function dataExtenso(isoStr) {
    var p = isoStr.split("-"), d = new Date(+p[0], +p[1] - 1, +p[2]);
    return DIAS[d.getDay()] + ", " + p[2] + " de " + MESES[+p[1] - 1] + ".";
  }

  /* ---------------- carrega disponibilidade ---------------- */
  function carregar() {
    if (!C.endpoint) { montarDias(null); return Promise.resolve(); }
    return fetch(C.endpoint + "?action=disponibilidade", { method: "GET" })
      .then(function (r) { return r.json(); })
      .then(function (j) { montarDias(j && j.ok ? j : null); })
      .catch(function () { montarDias(null); });
  }

  function montarDias(resposta) {
    dispo = resposta || {};
    if (dispo.config && dispo.config.whatsapp) C.whatsapp = dispo.config.whatsapp;

    var grade = (dispo.grade && Object.keys(dispo.grade).length) ? dispo.grade : C.gradePadrao;
    var exc = dispo.excecoes || {};
    var ocup = dispo.ocupacao || {};

    dias = calcular(grade, exc, ocup);
    // Rede de segurança: se sobrou zero dia, volta pra grade padrão sem ocupação.
    if (!dias.length) dias = calcular(C.gradePadrao, {}, {});
    render();
  }

  function calcular(grade, exc, ocup) {
    var out = [], agora = new Date();
    var hoje = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate());
    var limite = new Date(agora.getTime() + (C.antecedenciaHoras || 0) * 36e5);

    for (var i = 0; i < (C.janelaDias || 12); i++) {
      var d = new Date(hoje.getTime() + i * 864e5), key = iso(d);
      var e = exc[key];
      if (e && e.fechado) continue;

      var base = (e && e.slots && e.slots.length) ? e.slots : (grade[String(d.getDay())] || grade[d.getDay()] || []);
      if (!base || !base.length) continue;

      var slots = [];
      base.forEach(function (s) {
        var hm = String(s.h).split(":");
        var quando = new Date(d.getFullYear(), d.getMonth(), d.getDate(), +hm[0], +hm[1] || 0);
        if (quando < limite) return;                       // já passou / sem antecedência
        var usadas = ocup[key + "|" + s.h] || 0;
        var total = typeof s.v === "number" ? s.v : 4;
        slots.push({ h: s.h, restam: Math.max(0, total - usadas), total: total });
      });
      if (!slots.length) continue;
      if (!slots.some(function (s) { return s.restam > 0; })) continue;  // dia 100% lotado não entra

      out.push({ iso: key, date: d, rotulo: rotulo(d, hoje), dia: String(d.getDate()).padStart(2, "0") + "/" + String(d.getMonth() + 1).padStart(2, "0"), slots: slots });
    }
    return out;
  }

  /* ---------------- render ---------------- */
  function render() {
    host.innerHTML =
      '<div class="steps-bar">' +
      [1, 2, 3].map(function (n) { return '<i class="' + (state.step >= n ? "on" : "") + '"></i>'; }).join("") +
      "</div>" +
      (state.step === 1 ? passo1() : state.step === 2 ? passo2() : state.step === 3 ? passo3() : sucesso());
    ligar();
  }

  function passo1() {
    return '<div class="step active">' +
      '<div class="step-h"><small>Passo 1 de 3</small><b>Qual a idade do atleta?</b>' +
      "<p>A gente já separa a turma certa pra ele treinar com a molecada da mesma faixa.</p></div>" +
      '<div class="opts">' +
      C.categorias.map(function (c) {
        return '<button type="button" class="opt' + (state.categoria === c.id ? " sel" : "") + '" data-cat="' + c.id + '">' +
          "<b>" + c.nome + "</b><span>" + c.idade + "</span></button>";
      }).join("") +
      "</div>" +
      '<div class="field" style="margin-top:1.2rem"><label for="bk-idade">Idade exata (anos)</label>' +
      '<input id="bk-idade" type="number" min="4" max="15" inputmode="numeric" placeholder="Ex.: 8" value="' + (state.idade || "") + '">' +
      '<span class="err">Digite uma idade entre 4 e 15 anos.</span></div>' +
      '<div class="step-nav"><button type="button" class="btn btn-block" data-next="2">Escolher o dia &rarr;</button></div>' +
      "</div>";
  }

  function passo2() {
    var sel = dias.filter(function (d) { return d.iso === state.dataISO; })[0] || null;
    return '<div class="step active">' +
      '<div class="step-h"><small>Passo 2 de 3</small><b>Quando vocês podem vir?</b>' +
      "<p>Escolha o dia e o horário da aula experimental — é gratuita e sem compromisso.</p></div>" +
      '<div class="opts">' +
      dias.map(function (d) {
        var livres = d.slots.reduce(function (a, s) { return a + s.restam; }, 0);
        return '<button type="button" class="opt' + (state.dataISO === d.iso ? " sel" : "") + '" data-dia="' + d.iso + '">' +
          (livres <= 2 ? '<span class="tag tag-hot">últimas ' + livres + "</span>" : "") +
          "<b>" + d.rotulo + "</b><span>" + d.dia + "</span></button>";
      }).join("") +
      "</div>" +
      (sel ?
        '<div style="margin-top:1.5rem"><div class="step-h" style="margin-bottom:.9rem"><b style="font-size:1.15rem">Horários de ' + dataExtenso(sel.iso) + "</b></div>" +
        '<div class="opts">' +
        sel.slots.map(function (s) {
          var full = s.restam <= 0;
          return '<button type="button" class="opt' + (full ? " full" : "") + (state.hora === s.h ? " sel" : "") + '"' +
            (full ? " disabled" : ' data-hora="' + s.h + '"') + ">" +
            (full ? '<span class="tag tag-full">lotado</span>' : (s.restam <= 2 ? '<span class="tag tag-hot">' + s.restam + " vaga" + (s.restam > 1 ? "s" : "") + "</span>" : "")) +
            "<b>" + s.h + "</b><span>" + (full ? "turma cheia" : s.restam + " vaga" + (s.restam > 1 ? "s" : "") + " livre" + (s.restam > 1 ? "s" : "")) + "</span></button>";
        }).join("") +
        '</div><p class="slot-note">Horário marcado como <b>lotado</b> é turma cheia de verdade. Se o seu preferido fechou, escolha outro dia — abrem vagas toda semana.</p></div>'
        : '<p class="slot-note" style="margin-top:1.2rem">Selecione um dia acima para ver os horários livres.</p>') +
      '<div class="step-nav">' +
      '<button type="button" class="back" data-back="1">&larr; Voltar</button>' +
      '<button type="button" class="btn" style="flex:1" data-next="3"' + (state.hora ? "" : " disabled") + ">Continuar &rarr;</button>" +
      "</div></div>";
  }

  function passo3() {
    var cat = C.categorias.filter(function (c) { return c.id === state.categoria; })[0] || {};
    return '<div class="step active">' +
      '<div class="step-h"><small>Passo 3 de 3</small><b>Últimos dados e pronto</b>' +
      "<p>Só pra reservar a vaga no nome do seu filho e te mandar a confirmação.</p></div>" +
      '<div class="resume">Turma <b>' + (cat.nome || "-") + "</b> &nbsp;·&nbsp; <b>" + dataExtenso(state.dataISO) + "</b> &nbsp;·&nbsp; <b>" + state.hora + "</b></div>" +
      '<div class="field"><label for="bk-aluno">Nome do atleta</label>' +
      '<input id="bk-aluno" type="text" placeholder="Nome da criança" autocomplete="off">' +
      '<span class="err">Preencha o nome do atleta.</span></div>' +
      '<div class="row-2">' +
      '<div class="field"><label for="bk-resp">Nome do responsável</label>' +
      '<input id="bk-resp" type="text" placeholder="Seu nome" autocomplete="name">' +
      '<span class="err">Preencha seu nome.</span></div>' +
      '<div class="field"><label for="bk-zap">WhatsApp</label>' +
      '<input id="bk-zap" type="tel" inputmode="tel" placeholder="(11) 9 0000-0000" autocomplete="tel">' +
      '<span class="err">Digite um WhatsApp válido com DDD.</span></div>' +
      "</div>" +
      '<div class="step-nav">' +
      '<button type="button" class="back" data-back="2">&larr; Voltar</button>' +
      '<button type="button" class="btn btn-lg" style="flex:1" data-enviar>Confirmar minha vaga</button>' +
      "</div>" +
      '<p class="privacy">Seus dados são usados só para confirmar a aula experimental. Sem spam.</p>' +
      "</div>";
  }

  function sucesso() {
    var cat = C.categorias.filter(function (c) { return c.id === state.categoria; })[0] || {};
    return '<div class="step active success">' +
      '<div class="check"><svg viewBox="0 0 52 52" fill="none"><path d="M14 27l8 8 16-18" stroke="#22C55E" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/></svg></div>' +
      "<h3>Vaga reservada!</h3>" +
      "<p class=\"lead\" style=\"margin-inline:auto\">Guardamos o lugar do <b>" + esc(state.aluno || "seu filho") + "</b> na turma <b>" + (cat.nome || "") + "</b> em <b>" + dataExtenso(state.dataISO) + "</b> às <b>" + state.hora + "</b>.</p>" +
      '<p style="color:var(--mute);font-size:.92rem">Agora é só confirmar no WhatsApp com a secretaria — leva 10 segundos.</p>' +
      '<a class="btn btn-wa btn-lg btn-pulse" href="' + window.spfcWaLink(msgWhats()) + '" target="_blank" rel="noopener" data-wa-final>Confirmar no WhatsApp</a>' +
      '<p class="privacy">Leve roupa de treino, chuteira (ou tênis) e uma garrafinha de água. Chegue 15 minutos antes.</p>' +
      "</div>";
  }

  function esc(s) { return String(s).replace(/[<>&"]/g, function (c) { return { "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;" }[c]; }); }

  function msgWhats() {
    var cat = C.categorias.filter(function (c) { return c.id === state.categoria; })[0] || {};
    return "Olá! Acabei de agendar a aula experimental pelo site.\n\n" +
      "Atleta: " + (state.aluno || "") + "\n" +
      "Idade: " + (state.idade || "") + " anos (" + (cat.nome || "") + ")\n" +
      "Dia: " + dataExtenso(state.dataISO) + "\n" +
      "Horário: " + state.hora + "\n" +
      "Responsável: " + (state.resp || "") + "\n\n" +
      "Pode confirmar pra mim?";
  }

  /* ---------------- eventos ---------------- */
  function ligar() {
    var q = function (s) { return host.querySelector(s); }, qa = function (s) { return Array.prototype.slice.call(host.querySelectorAll(s)); };

    qa("[data-cat]").forEach(function (b) {
      b.addEventListener("click", function () {
        state.categoria = b.getAttribute("data-cat");
        var c = C.categorias.filter(function (x) { return x.id === state.categoria; })[0];
        if (c && !state.idade) state.idade = c.min;
        render();
        var inp = host.querySelector("#bk-idade"); if (inp) inp.focus();
      });
    });

    var idade = q("#bk-idade");
    if (idade) idade.addEventListener("input", function () {
      state.idade = idade.value;
      var n = parseInt(idade.value, 10);
      var c = C.categorias.filter(function (x) { return n >= x.min && n <= x.max; })[0];
      if (c && c.id !== state.categoria) {
        state.categoria = c.id;
        qa("[data-cat]").forEach(function (b) { b.classList.toggle("sel", b.getAttribute("data-cat") === c.id); });
      }
      idade.closest(".field").classList.remove("invalid");
    });

    qa("[data-dia]").forEach(function (b) {
      b.addEventListener("click", function () {
        state.dataISO = b.getAttribute("data-dia"); state.hora = ""; render();
      });
    });
    qa("[data-hora]").forEach(function (b) {
      b.addEventListener("click", function () { state.hora = b.getAttribute("data-hora"); render(); });
    });

    qa("[data-next]").forEach(function (b) {
      b.addEventListener("click", function () {
        var alvo = +b.getAttribute("data-next");
        if (alvo === 2) {
          var n = parseInt(state.idade, 10);
          if (!state.categoria || isNaN(n) || n < 4 || n > 15) {
            var f = q("#bk-idade").closest(".field"); f.classList.add("invalid"); q("#bk-idade").focus(); return;
          }
          window.spfcTrack("ViewContent", { content_name: "agenda_aberta" });
        }
        state.step = alvo; render(); topo();
      });
    });
    qa("[data-back]").forEach(function (b) {
      b.addEventListener("click", function () { state.step = +b.getAttribute("data-back"); render(); topo(); });
    });

    var zap = q("#bk-zap");
    if (zap) zap.addEventListener("input", function () {
      var v = zap.value.replace(/\D/g, "").slice(0, 11);
      if (v.length > 6) v = "(" + v.slice(0, 2) + ") " + v.slice(2, v.length - 4) + "-" + v.slice(-4);
      else if (v.length > 2) v = "(" + v.slice(0, 2) + ") " + v.slice(2);
      zap.value = v;
      zap.closest(".field").classList.remove("invalid");
    });

    var enviar = q("[data-enviar]");
    if (enviar) enviar.addEventListener("click", function () { submeter(enviar); });

    var final = q("[data-wa-final]");
    if (final) final.addEventListener("click", function () { window.spfcTrack("Contact", { method: "whatsapp_pos_agendamento" }); });
  }

  function topo() {
    var r = host.getBoundingClientRect();
    if (r.top < 0 || r.top > window.innerHeight * .6) {
      window.scrollTo({ top: window.scrollY + r.top - 90, behavior: "smooth" });
    }
  }

  /* ---------------- envio ---------------- */
  function submeter(btn) {
    if (state.enviando) return;
    var q = function (s) { return host.querySelector(s); };
    var aluno = q("#bk-aluno"), resp = q("#bk-resp"), zap = q("#bk-zap");
    var ok = true;
    [[aluno, aluno.value.trim().length >= 2], [resp, resp.value.trim().length >= 2],
    [zap, zap.value.replace(/\D/g, "").length >= 10]].forEach(function (p) {
      p[0].closest(".field").classList.toggle("invalid", !p[1]);
      if (!p[1] && ok) { p[0].focus(); ok = false; }
    });
    if (!ok) return;

    state.aluno = aluno.value.trim();
    state.resp = resp.value.trim();
    state.zap = zap.value;
    state.enviando = true;
    btn.disabled = true;
    btn.textContent = "Reservando...";

    // Abre a aba AGORA (dentro do clique) pra não ser bloqueada depois do fetch.
    var aba = null;
    try { aba = window.open("", "_blank"); } catch (e) { }

    var cat = C.categorias.filter(function (c) { return c.id === state.categoria; })[0] || {};
    var lead = {
      criadoEm: new Date().toISOString(),
      aluno: state.aluno, idade: state.idade, categoria: cat.nome || "",
      responsavel: state.resp, whatsapp: state.zap,
      data: state.dataISO, horario: state.hora,
      pagina: location.pathname, url: location.href, utm: window.spfcUTM()
    };

    salvar(lead).then(function () {
      window.spfcTrack("Lead", { content_name: "aula_experimental", categoria: cat.nome, value: 1, currency: "BRL" });
      window.spfcTrack("Schedule", { content_name: "aula_experimental" });
      state.step = 4;
      render();
      topo();
      var url = window.spfcWaLink(msgWhats());
      if (aba && !aba.closed) { try { aba.location.href = url; } catch (e) { } }
      state.enviando = false;
    });
  }

  function salvar(lead) {
    fila(lead); // guarda local primeiro — nunca se perde
    if (!C.endpoint) return Promise.resolve();
    return fetch(C.endpoint, {
      method: "POST",
      // text/plain evita o preflight CORS do Apps Script
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({ action: "lead", lead: lead })
    }).then(function (r) { return r.json(); })
      .then(function (j) { if (j && j.ok) desenfileirar(lead.criadoEm); })
      .catch(function () { /* fica na fila e reenvia depois */ });
  }

  function fila(lead) {
    try {
      var f = JSON.parse(localStorage.getItem("spfc_leads") || "[]");
      f.push(lead); localStorage.setItem("spfc_leads", JSON.stringify(f.slice(-40)));
    } catch (e) { }
  }
  function desenfileirar(id) {
    try {
      var f = JSON.parse(localStorage.getItem("spfc_leads") || "[]");
      localStorage.setItem("spfc_leads", JSON.stringify(f.filter(function (l) { return l.criadoEm !== id; })));
    } catch (e) { }
  }
  /* Reenvia o que ficou preso numa visita anterior */
  function reenviar() {
    if (!C.endpoint) return;
    var f = [];
    try { f = JSON.parse(localStorage.getItem("spfc_leads") || "[]"); } catch (e) { }
    f.forEach(function (l) {
      fetch(C.endpoint, { method: "POST", headers: { "Content-Type": "text/plain;charset=utf-8" }, body: JSON.stringify({ action: "lead", lead: l }) })
        .then(function (r) { return r.json(); })
        .then(function (j) { if (j && j.ok) desenfileirar(l.criadoEm); })
        .catch(function () { });
    });
  }

  /* ---------------- boot ---------------- */
  host.innerHTML = '<div class="step active" style="padding:3rem 1.8rem;text-align:center;color:var(--mute)">Carregando a agenda...</div>';
  carregar().then(reenviar);
})();
