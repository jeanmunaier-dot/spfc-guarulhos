/**
 * ============================================================
 *  BACKEND DA AGENDA — Escola de Futebol SPFC / Guarulhos
 *  Google Apps Script ligado a uma Planilha Google.
 *
 *  COMO INSTALAR (5 minutos):
 *  1. Crie uma Planilha Google nova (nome sugerido: "SPFC Guarulhos — Agenda").
 *  2. Extensões > Apps Script. Apague o conteúdo e cole este arquivo.
 *  3. Rode a função  instalar()  uma vez (autorize quando pedir).
 *  4. Implantar > Nova implantação > Tipo: App da Web
 *       - Executar como: Eu
 *       - Quem tem acesso: Qualquer pessoa
 *  5. Copie a URL que termina em /exec e cole em assets/js/config.js (campo endpoint).
 *  6. Na aba "Config" da planilha, troque SENHA_PAINEL e WHATSAPP.
 * ============================================================
 */

var ABA_LEADS = 'Leads';
var ABA_CONFIG = 'Config';
var ABA_GRADE = 'Grade';
var ABA_EXC = 'Excecoes';

/* ---------------------------------------------------------- setup */
function instalar() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  var leads = aba(ss, ABA_LEADS);
  if (leads.getLastRow() === 0) {
    leads.appendRow(['Recebido em', 'Atleta', 'Idade', 'Turma', 'Data da aula', 'Horário',
      'Responsável', 'WhatsApp', 'Origem', 'Campanha', 'Página', 'Status']);
    leads.setFrozenRows(1);
    leads.getRange(1, 1, 1, 12).setFontWeight('bold').setBackground('#FE0000').setFontColor('#FFFFFF');
  }

  var cfg = aba(ss, ABA_CONFIG);
  if (cfg.getLastRow() === 0) {
    cfg.appendRow(['Chave', 'Valor']);
    cfg.appendRow(['SENHA_PAINEL', 'spfc2026']);
    cfg.appendRow(['WHATSAPP', '5511000000000']);
    cfg.setFrozenRows(1);
    cfg.getRange(1, 1, 1, 2).setFontWeight('bold').setBackground('#000000').setFontColor('#FFFFFF');
  }

  var grade = aba(ss, ABA_GRADE);
  if (grade.getLastRow() === 0) {
    grade.appendRow(['Dia da semana (0=dom)', 'Horário', 'Vagas']);
    grade.setFrozenRows(1);
    grade.getRange(1, 1, 1, 3).setFontWeight('bold').setBackground('#000000').setFontColor('#FFFFFF');
    // grade inicial: segunda a sexta manhã/tarde + sábado de manhã
    [1, 2, 3, 4, 5].forEach(function (d) {
      [['09:00', 4], ['10:30', 4], ['15:00', 5], ['16:30', 5]].forEach(function (s) {
        grade.appendRow([d, s[0], s[1]]);
      });
    });
    [['08:30', 6], ['10:00', 6]].forEach(function (s) { grade.appendRow([6, s[0], s[1]]); });
  }

  var exc = aba(ss, ABA_EXC);
  if (exc.getLastRow() === 0) {
    exc.appendRow(['Data (AAAA-MM-DD)', 'Fechado', 'Horários (09:00x4, 10:30x4)']);
    exc.setFrozenRows(1);
    exc.getRange(1, 1, 1, 3).setFontWeight('bold').setBackground('#000000').setFontColor('#FFFFFF');
  }

  SpreadsheetApp.getUi().alert('Pronto! Agora implante como App da Web e cole a URL no config.js.');
}

function aba(ss, nome) {
  return ss.getSheetByName(nome) || ss.insertSheet(nome);
}

/* ---------------------------------------------------------- rotas */
function doGet(e) {
  var acao = (e && e.parameter && e.parameter.action) || 'disponibilidade';
  if (acao === 'disponibilidade') return json(disponibilidade());
  return json({ ok: false, erro: 'acao desconhecida' });
}

function doPost(e) {
  var body = {};
  try { body = JSON.parse(e.postData.contents); } catch (err) { return json({ ok: false, erro: 'json invalido' }); }
  var acao = body.action;

  if (acao === 'lead') return json(gravarLead(body.lead || {}));

  // A partir daqui exige senha
  if (!conferirSenha(body.senha)) return json({ ok: false, erro: 'senha' });

  if (acao === 'login') return json({ ok: true });
  if (acao === 'admin-dados') return json(dadosAdmin());
  if (acao === 'salvar-grade') return json(salvarGrade(body.grade || {}));
  if (acao === 'salvar-excecoes') return json(salvarExcecoes(body.excecoes || {}));
  return json({ ok: false, erro: 'acao desconhecida' });
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

/* ---------------------------------------------------------- config */
function config() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(ABA_CONFIG);
  var out = {};
  if (!sh || sh.getLastRow() < 2) return out;
  sh.getRange(2, 1, sh.getLastRow() - 1, 2).getValues().forEach(function (r) {
    if (r[0]) out[String(r[0]).trim()] = String(r[1]).trim();
  });
  return out;
}

function conferirSenha(s) {
  var esperada = config().SENHA_PAINEL || '';
  return !!s && String(s) === esperada;
}

/* ---------------------------------------------------------- leitura */
function lerGrade() {
  var sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(ABA_GRADE);
  var out = {};
  if (!sh || sh.getLastRow() < 2) return out;
  sh.getRange(2, 1, sh.getLastRow() - 1, 3).getValues().forEach(function (r) {
    if (r[0] === '' || r[1] === '') return;
    var d = String(parseInt(r[0], 10));
    out[d] = out[d] || [];
    out[d].push({ h: hhmm(r[1]), v: parseInt(r[2], 10) || 0 });
  });
  Object.keys(out).forEach(function (d) {
    out[d].sort(function (a, b) { return a.h < b.h ? -1 : 1; });
  });
  return out;
}

function lerExcecoes() {
  var sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(ABA_EXC);
  var out = {};
  if (!sh || sh.getLastRow() < 2) return out;
  sh.getRange(2, 1, sh.getLastRow() - 1, 3).getValues().forEach(function (r) {
    if (!r[0]) return;
    var data = ymd(r[0]);
    var fechado = String(r[1]).toLowerCase() === 'true' || r[1] === true || String(r[1]).toUpperCase() === 'SIM';
    var slots = [];
    String(r[2] || '').split(',').forEach(function (p) {
      var m = p.trim().match(/^(\d{1,2}:\d{2})\s*[xX]\s*(\d{1,2})$/);
      if (m) slots.push({ h: ('0' + m[1]).slice(-5), v: parseInt(m[2], 10) });
    });
    out[data] = fechado ? { fechado: true } : { fechado: false, slots: slots };
  });
  return out;
}

function lerLeads() {
  var sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(ABA_LEADS);
  var out = [];
  if (!sh || sh.getLastRow() < 2) return out;
  sh.getRange(2, 1, sh.getLastRow() - 1, 12).getValues().forEach(function (r) {
    if (!r[1] && !r[6]) return;
    out.push({
      criadoEm: r[0] instanceof Date ? r[0].toISOString() : String(r[0]),
      aluno: r[1], idade: r[2], categoria: r[3], data: ymd(r[4]), horario: hhmm(r[5]),
      responsavel: r[6], whatsapp: r[7],
      utm: { utm_source: r[8], utm_campaign: r[9] },
      pagina: r[10], status: String(r[11] || '').toLowerCase()
    });
  });
  return out;
}

/* ---------------------------------------------------------- público */
function disponibilidade() {
  var leads = lerLeads(), ocup = {};
  var hoje = ymd(new Date());
  leads.forEach(function (l) {
    if (l.status === 'cancelado') return;
    if (!l.data || l.data < hoje) return;
    var k = l.data + '|' + l.horario;
    ocup[k] = (ocup[k] || 0) + 1;
  });
  return {
    ok: true,
    grade: lerGrade(),
    excecoes: lerExcecoes(),
    ocupacao: ocup,
    config: { whatsapp: config().WHATSAPP || '' }
  };
}

function gravarLead(lead) {
  var lock = LockService.getScriptLock();
  try { lock.waitLock(8000); } catch (e) { return { ok: false, erro: 'ocupado' }; }
  try {
    var sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(ABA_LEADS);
    if (!sh) return { ok: false, erro: 'planilha sem aba Leads' };

    // Evita linha duplicada se o navegador reenviar o mesmo lead da fila offline
    if (jaExiste(sh, lead)) return { ok: true, duplicado: true };

    var utm = lead.utm || {};
    var origem = utm.utm_source || (utm.fbclid ? 'meta' : (utm.gclid ? 'google' : 'direto'));
    sh.appendRow([
      lead.criadoEm ? new Date(lead.criadoEm) : new Date(),
      lead.aluno || '', lead.idade || '', lead.categoria || '',
      lead.data || '', lead.horario || '',
      lead.responsavel || '', "'" + (lead.whatsapp || ''),
      origem, utm.utm_campaign || '', lead.pagina || '', 'novo'
    ]);
    return { ok: true };
  } finally {
    lock.releaseLock();
  }
}

function jaExiste(sh, lead) {
  if (sh.getLastRow() < 2 || !lead.criadoEm) return false;
  var n = Math.min(50, sh.getLastRow() - 1);
  var vals = sh.getRange(sh.getLastRow() - n + 1, 1, n, 8).getValues();
  var alvo = new Date(lead.criadoEm).getTime();
  for (var i = 0; i < vals.length; i++) {
    var t = vals[i][0] instanceof Date ? vals[i][0].getTime() : 0;
    if (Math.abs(t - alvo) < 1000 && String(vals[i][1]) === String(lead.aluno || '')) return true;
  }
  return false;
}

/* ---------------------------------------------------------- admin */
function dadosAdmin() {
  return { ok: true, grade: lerGrade(), excecoes: lerExcecoes(), leads: lerLeads() };
}

function salvarGrade(grade) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(ABA_GRADE);
  if (sh.getLastRow() > 1) sh.getRange(2, 1, sh.getLastRow() - 1, 3).clearContent();
  var linhas = [];
  Object.keys(grade).forEach(function (d) {
    (grade[d] || []).forEach(function (s) { linhas.push([parseInt(d, 10), "'" + s.h, s.v]); });
  });
  if (linhas.length) sh.getRange(2, 1, linhas.length, 3).setValues(linhas);
  return { ok: true, total: linhas.length };
}

function salvarExcecoes(exc) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(ABA_EXC);
  if (sh.getLastRow() > 1) sh.getRange(2, 1, sh.getLastRow() - 1, 3).clearContent();
  var linhas = [];
  Object.keys(exc).forEach(function (data) {
    var e = exc[data];
    var horarios = (e.slots || []).map(function (s) { return s.h + 'x' + s.v; }).join(', ');
    linhas.push(["'" + data, e.fechado ? 'TRUE' : 'FALSE', horarios]);
  });
  if (linhas.length) sh.getRange(2, 1, linhas.length, 3).setValues(linhas);
  return { ok: true, total: linhas.length };
}

/* ---------------------------------------------------------- utils */
function ymd(v) {
  if (v instanceof Date) {
    return Utilities.formatDate(v, Session.getScriptTimeZone(), 'yyyy-MM-dd');
  }
  return String(v || '').trim().slice(0, 10);
}

function hhmm(v) {
  if (v instanceof Date) {
    return Utilities.formatDate(v, Session.getScriptTimeZone(), 'HH:mm');
  }
  var s = String(v || '').trim();
  return s.length === 4 ? '0' + s : s.slice(0, 5);
}
