/* ============================================================
   PAINEL DA AGENDA — grade semanal, exceções por data e leads
   Sem endpoint configurado, roda em MODO DEMONSTRAÇÃO (localStorage)
   pra você conseguir ver e testar tudo antes de publicar a planilha.
   ============================================================ */
(function () {
  "use strict";
  var C = window.SPFC || {};
  var DIAS = ["Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"];
  var HORARIOS = ["08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00",
    "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00", "17:30", "18:00", "19:00"];

  var DEMO = !C.endpoint;
  var senha = "";
  var dados = { grade: {}, excecoes: {}, leads: [] };

  function $(s) { return document.querySelector(s); }
  function toast(msg, erro) {
    var t = $("#toast");
    t.textContent = msg;
    t.classList.toggle("err", !!erro);
    t.classList.add("show");
    clearTimeout(t._t); t._t = setTimeout(function () { t.classList.remove("show"); }, 3200);
  }

  /* ---------------- transporte ---------------- */
  function api(payload) {
    if (DEMO) return demo(payload);
    return fetch(C.endpoint, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(Object.assign({ senha: senha }, payload))
    }).then(function (r) { return r.json(); });
  }

  function demo(p) {
    var db = JSON.parse(localStorage.getItem("spfc_admin_demo") || "{}");
    if (p.action === "login") return Promise.resolve({ ok: p.senha === "spfc2026" });
    if (p.action === "admin-dados") return Promise.resolve({
      ok: true, grade: db.grade || {}, excecoes: db.excecoes || {},
      leads: JSON.parse(localStorage.getItem("spfc_leads") || "[]")
    });
    if (p.action === "salvar-grade") { db.grade = p.grade; localStorage.setItem("spfc_admin_demo", JSON.stringify(db)); return Promise.resolve({ ok: true }); }
    if (p.action === "salvar-excecoes") { db.excecoes = p.excecoes; localStorage.setItem("spfc_admin_demo", JSON.stringify(db)); return Promise.resolve({ ok: true }); }
    if (p.action === "status-lead") return Promise.resolve({ ok: true });
    return Promise.resolve({ ok: false });
  }

  /* ---------------- login ---------------- */
  if (DEMO) {
    $("#aviso-endpoint").innerHTML = "Modo demonstração (a planilha ainda não foi conectada).<br>Senha de teste: <b>spfc2026</b>";
  }

  $("#entrar").addEventListener("click", entrar);
  $("#senha").addEventListener("keydown", function (e) { if (e.key === "Enter") entrar(); });

  function entrar() {
    var campo = $("#senha"), v = campo.value.trim();
    if (!v) { campo.closest(".field").classList.add("invalid"); return; }
    var btn = $("#entrar"); btn.disabled = true; btn.textContent = "Entrando...";
    senha = v;
    api({ action: "login", senha: v }).then(function (j) {
      btn.disabled = false; btn.textContent = "Entrar";
      if (!j || !j.ok) { campo.closest(".field").classList.add("invalid"); senha = ""; return; }
      try { sessionStorage.setItem("spfc_admin", v); } catch (e) { }
      abrir();
    }).catch(function () {
      btn.disabled = false; btn.textContent = "Entrar";
      toast("Não consegui falar com a planilha. Confira o endpoint no config.js.", true);
    });
  }

  $("#sair").addEventListener("click", function () {
    try { sessionStorage.removeItem("spfc_admin"); } catch (e) { }
    location.reload();
  });

  function abrir() {
    $("#tela-login").classList.add("hidden");
    $("#tela-painel").classList.remove("hidden");
    $("#sair").classList.remove("hidden");
    carregar();
  }

  /* ---------------- carregar tudo ---------------- */
  function carregar() {
    api({ action: "admin-dados" }).then(function (j) {
      if (!j || !j.ok) { toast("Não consegui carregar os dados.", true); return; }
      dados.grade = (j.grade && Object.keys(j.grade).length) ? j.grade : clone(C.gradePadrao);
      dados.excecoes = j.excecoes || {};
      dados.leads = j.leads || [];
      renderGrade(); renderExc(); renderLeads();
    }).catch(function () { toast("Falha de conexão com a planilha.", true); });
  }
  function clone(o) { return JSON.parse(JSON.stringify(o)); }

  /* ---------------- grade semanal ---------------- */
  function renderGrade() {
    var html = "";
    for (var d = 1; d <= 6; d++) html += linhaDia(d);
    html += linhaDia(0);
    $("#grade").innerHTML = html;

    Array.prototype.forEach.call($("#grade").querySelectorAll("input[type=checkbox]"), function (cb) {
      cb.addEventListener("change", function () {
        cb.closest(".slot-chip").classList.toggle("on", cb.checked);
        atualizaLinha(cb.closest(".day-row"));
      });
    });
  }

  function linhaDia(d) {
    var slots = dados.grade[String(d)] || dados.grade[d] || [];
    var mapa = {}; slots.forEach(function (s) { mapa[s.h] = s.v; });
    var ativos = slots.length;
    var chips = HORARIOS.map(function (h) {
      var on = mapa.hasOwnProperty(h);
      return '<div class="slot-chip' + (on ? " on" : "") + '">' +
        '<input type="checkbox" id="c' + d + h.replace(":", "") + '"' + (on ? " checked" : "") + '>' +
        '<label for="c' + d + h.replace(":", "") + '">' + h + "</label>" +
        '<input type="number" min="0" max="30" value="' + (on ? mapa[h] : 4) + '" title="Vagas nesse horário">' +
        "</div>";
    }).join("");
    return '<div class="day-row' + (ativos ? "" : " off") + '" data-dia="' + d + '">' +
      '<div class="dname">' + DIAS[d] + '<small><span class="qtd">' + ativos + "</span> horário(s)</small></div>" +
      '<div class="slot-grid">' + chips + "</div></div>";
  }

  function atualizaLinha(row) {
    var n = row.querySelectorAll("input[type=checkbox]:checked").length;
    row.querySelector(".qtd").textContent = n;
    row.classList.toggle("off", n === 0);
  }

  ["#salvar-grade", "#salvar-grade-2"].forEach(function (sel) {
    var b = $(sel); if (b) b.addEventListener("click", publicarGrade);
  });

  function publicarGrade() {
    var grade = {};
    Array.prototype.forEach.call(document.querySelectorAll(".day-row"), function (row) {
      var d = row.getAttribute("data-dia"), lista = [];
      Array.prototype.forEach.call(row.querySelectorAll(".slot-chip"), function (chip) {
        var cb = chip.querySelector("input[type=checkbox]");
        if (!cb.checked) return;
        lista.push({ h: chip.querySelector("label").textContent, v: parseInt(chip.querySelector("input[type=number]").value, 10) || 0 });
      });
      if (lista.length) grade[d] = lista;
    });
    if (!Object.keys(grade).length) {
      toast("Deixe pelo menos um horário aberto — senão o site cai na grade padrão.", true); return;
    }
    var btns = [$("#salvar-grade"), $("#salvar-grade-2")].filter(Boolean);
    function estado(txt, off) { btns.forEach(function (b) { b.disabled = off; b.textContent = txt; }); }
    estado("Publicando...", true);
    api({ action: "salvar-grade", grade: grade }).then(function (j) {
      estado("Publicar grade", false);
      if (j && j.ok) { dados.grade = grade; toast("Grade publicada. Já está valendo no site."); }
      else toast("Não consegui publicar.", true);
    }).catch(function () { estado("Publicar grade", false); toast("Falha ao publicar.", true); });
  }

  /* ---------------- exceções ---------------- */
  $("#exc-tipo").addEventListener("change", function () {
    $("#exc-slots").classList.toggle("hidden", this.value !== "slots");
  });

  $("#add-exc").addEventListener("click", function () {
    var data = $("#exc-data").value;
    if (!data) { toast("Escolha a data.", true); return; }
    var tipo = $("#exc-tipo").value;
    var reg = { fechado: true };

    if (tipo === "slots") {
      var campo = $("#exc-horarios"), bruto = campo.value.trim();
      var slots = [], ok = bruto.length > 0;
      bruto.split(",").forEach(function (p) {
        var m = p.trim().match(/^(\d{1,2}:\d{2})\s*[xX]\s*(\d{1,2})$/);
        if (m) slots.push({ h: m[1].padStart(5, "0"), v: parseInt(m[2], 10) }); else ok = false;
      });
      campo.closest(".field").classList.toggle("invalid", !ok);
      if (!ok) return;
      reg = { fechado: false, slots: slots };
    }
    dados.excecoes[data] = reg;
    salvarExc();
  });

  function salvarExc() {
    api({ action: "salvar-excecoes", excecoes: dados.excecoes }).then(function (j) {
      if (j && j.ok) { renderExc(); toast("Exceção salva."); }
      else toast("Não consegui salvar a exceção.", true);
    }).catch(function () { toast("Falha ao salvar exceção.", true); });
  }

  function renderExc() {
    var chaves = Object.keys(dados.excecoes).sort();
    if (!chaves.length) {
      $("#lista-exc").innerHTML = '<tr><td colspan="3" style="color:var(--mute)">Nenhuma exceção cadastrada — a grade da semana vale para todos os dias.</td></tr>';
      return;
    }
    $("#lista-exc").innerHTML = chaves.map(function (k) {
      var e = dados.excecoes[k], p = k.split("-");
      var txt = e.fechado ? '<span class="pill pill-new">Fechado</span>'
        : '<span class="pill pill-ok">' + (e.slots || []).map(function (s) { return s.h + " (" + s.v + ")"; }).join(", ") + "</span>";
      return "<tr><td>" + p[2] + "/" + p[1] + "/" + p[0] + "</td><td>" + txt +
        '</td><td><button class="back" data-del="' + k + '" style="color:#FF6B6B">remover</button></td></tr>';
    }).join("");
    Array.prototype.forEach.call($("#lista-exc").querySelectorAll("[data-del]"), function (b) {
      b.addEventListener("click", function () { delete dados.excecoes[b.getAttribute("data-del")]; salvarExc(); });
    });
  }

  /* ---------------- leads ---------------- */
  $("#recarregar").addEventListener("click", carregar);

  function renderLeads() {
    var l = dados.leads || [];
    if (!l.length) {
      $("#lista-leads").innerHTML = '<tr><td colspan="10" style="color:var(--mute)">Nenhum agendamento ainda.</td></tr>';
      return;
    }
    $("#lista-leads").innerHTML = l.slice().reverse().map(function (x, i) {
      var dt = x.criadoEm ? new Date(x.criadoEm) : null;
      var utm = x.utm || {};
      var origem = utm.utm_source || (utm.fbclid ? "meta" : (utm.gclid ? "google" : "direto"));
      var dia = (x.data || "").split("-");
      var zap = String(x.whatsapp || "").replace(/\D/g, "");
      return "<tr>" +
        "<td>" + (dt ? dt.toLocaleDateString("pt-BR") + " " + dt.toLocaleTimeString("pt-BR").slice(0, 5) : "-") + "</td>" +
        "<td><b>" + esc(x.aluno) + "</b></td><td>" + esc(x.idade) + "</td><td>" + esc(x.categoria) + "</td>" +
        "<td>" + (dia.length === 3 ? dia[2] + "/" + dia[1] : "-") + "</td><td>" + esc(x.horario) + "</td>" +
        "<td>" + esc(x.responsavel) + "</td>" +
        '<td><a href="https://wa.me/55' + zap + '" target="_blank" rel="noopener" style="color:#25D366">' + esc(x.whatsapp) + "</a></td>" +
        "<td>" + esc(origem) + "</td>" +
        '<td><span class="pill ' + (x.status === "atendido" ? "pill-ok" : "pill-new") + '">' + (x.status === "atendido" ? "atendido" : "novo") + "</span></td>" +
        "</tr>";
    }).join("");
  }
  function esc(s) { return String(s == null ? "" : s).replace(/[<>&"]/g, function (c) { return { "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;" }[c]; }); }

  /* ---------------- sessão ---------------- */
  try {
    var s = sessionStorage.getItem("spfc_admin");
    if (s) { senha = s; abrir(); }
  } catch (e) { }
})();
