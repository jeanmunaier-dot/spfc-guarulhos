/* ============================================================
   CONFIGURAÇÃO CENTRAL — Escola de Futebol SPFC / Guarulhos
   Tudo que muda de valor fica aqui. Nada de sair caçando em HTML.
   ============================================================ */
window.SPFC = {

  /* ---- Contato ------------------------------------------------
     whatsapp: só números, com 55 + DDD. Ex.: 5511999998888
     >>> TROCAR PELO NÚMERO REAL DA ESCOLA ANTES DE SUBIR <<<     */
  whatsapp: "5511000000000",

  telefones: ["(11) 2441-4460", "(11) 4964-1772"],
  email: "spfc.guarulhos@uol.com.br",
  instagram: "https://www.instagram.com/spfc.guarulhos/",
  facebook: "https://www.facebook.com/spfc.escoladefutebol.3/",

  endereco: {
    rua: "Rua Soldado João Espinardi, 80",
    bairro: "Vila Silveira",
    cidade: "Guarulhos",
    uf: "SP",
    cep: "07093-010",
    mapsQuery: "Escola de Futebol SPFC Guarulhos, Rua Soldado João Espinardi, 80, Guarulhos SP"
  },

  /* ---- Backend (Google Apps Script) ---------------------------
     Cole aqui a URL do App da Web publicado (termina em /exec).
     Enquanto estiver vazio o site funciona em MODO OFFLINE:
     usa a grade padrão e guarda os leads no navegador.           */
  endpoint: "",

  /* ---- Pixels (opcional) ---- */
  metaPixelId: "",
  gaId: "",

  /* ---- Categorias por idade ---- */
  categorias: [
    { id: "baby",  nome: "Baby Foot", idade: "4 a 6 anos",   min: 4,  max: 6,
      desc: "Primeiro contato com a bola: coordenação, equilíbrio e muita brincadeira." },
    { id: "sub9",  nome: "Sub-9",     idade: "7 a 9 anos",   min: 7,  max: 9,
      desc: "Fundamentos do futebol: domínio, passe, condução e trabalho em equipe." },
    { id: "sub12", nome: "Sub-12",    idade: "10 a 12 anos", min: 10, max: 12,
      desc: "Leitura de jogo, posicionamento tático e disputa em campeonatos." },
    { id: "sub15", nome: "Sub-15",    idade: "13 a 15 anos", min: 13, max: 15,
      desc: "Alto rendimento, preparação física e observação para peneiras." }
  ],

  /* ---- Grade padrão (fallback) --------------------------------
     Usada quando o painel admin ainda não publicou nada OU quando
     a internet/planilha falha. A agenda NUNCA aparece vazia.
     dia: 0=domingo ... 6=sábado                                  */
  gradePadrao: {
    1: [ {h:"09:00",v:4}, {h:"10:30",v:4}, {h:"15:00",v:5}, {h:"16:30",v:5} ],
    2: [ {h:"09:00",v:4}, {h:"10:30",v:4}, {h:"15:00",v:5}, {h:"16:30",v:5} ],
    3: [ {h:"09:00",v:4}, {h:"10:30",v:4}, {h:"15:00",v:5}, {h:"16:30",v:5} ],
    4: [ {h:"09:00",v:4}, {h:"10:30",v:4}, {h:"15:00",v:5}, {h:"16:30",v:5} ],
    5: [ {h:"09:00",v:4}, {h:"10:30",v:4}, {h:"15:00",v:5}, {h:"16:30",v:5} ],
    6: [ {h:"08:30",v:6}, {h:"10:00",v:6} ]
  },

  /* Quantos dias pra frente o pai/mãe pode escolher */
  janelaDias: 12,

  /* Antecedência mínima em horas (não deixa marcar pra daqui 10 min) */
  antecedenciaHoras: 3
};
