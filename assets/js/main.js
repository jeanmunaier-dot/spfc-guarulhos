/* ============================================================
   MAIN — comportamento comum a todas as páginas
   ============================================================ */
(function () {
  "use strict";
  var C = window.SPFC || {};

  /* ---------- Helpers ---------- */
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  window.spfcQ = $; window.spfcQA = $$;

  window.spfcWaLink = function (msg) {
    var n = (C.whatsapp || "").replace(/\D/g, "");
    return "https://wa.me/" + n + (msg ? "?text=" + encodeURIComponent(msg) : "");
  };

  /* ---------- UTM / origem do tráfego ---------- */
  (function utm() {
    try {
      var p = new URLSearchParams(location.search), keys = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "fbclid", "gclid"], got = {};
      keys.forEach(function (k) { if (p.get(k)) got[k] = p.get(k); });
      if (Object.keys(got).length) sessionStorage.setItem("spfc_utm", JSON.stringify(got));
    } catch (e) { }
  })();
  window.spfcUTM = function () {
    try { return JSON.parse(sessionStorage.getItem("spfc_utm") || "{}"); } catch (e) { return {}; }
  };

  /* ---------- Pixels ---------- */
  (function pixels() {
    if (C.metaPixelId) {
      !function (f, b, e, v, n, t, s) {
        if (f.fbq) return; n = f.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments) };
        if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = "2.0"; n.queue = [];
        t = b.createElement(e); t.async = !0; t.src = v; s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s)
      }(window, document, "script", "https://connect.facebook.net/en_US/fbevents.js");
      fbq("init", C.metaPixelId); fbq("track", "PageView");
    }
    if (C.gaId) {
      var g = document.createElement("script"); g.async = 1;
      g.src = "https://www.googletagmanager.com/gtag/js?id=" + C.gaId;
      document.head.appendChild(g);
      window.dataLayer = window.dataLayer || [];
      window.gtag = function () { dataLayer.push(arguments) };
      gtag("js", new Date()); gtag("config", C.gaId);
    }
  })();
  window.spfcTrack = function (evt, data) {
    try { if (window.fbq) fbq("track", evt, data || {}); } catch (e) { }
    try { if (window.gtag) gtag("event", evt, data || {}); } catch (e) { }
    try { (window.dataLayer = window.dataLayer || []).push(Object.assign({ event: evt }, data || {})); } catch (e) { }
  };

  /* ---------- Header ---------- */
  var header = $(".header");
  function onScroll() {
    if (header) header.classList.toggle("is-stuck", window.scrollY > 24);
  }
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  var burger = $(".burger"), nav = $(".nav");
  if (burger && nav) {
    burger.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      burger.classList.toggle("open", open);
      burger.setAttribute("aria-expanded", open ? "true" : "false");
    });
    $$(".nav a").forEach(function (a) {
      a.addEventListener("click", function () { nav.classList.remove("open"); burger.classList.remove("open"); });
    });
  }

  /* ---------- Reveal on scroll ---------- */
  var rv = $$(".rv");
  if (rv.length) {
    if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
        });
      }, { rootMargin: "0px 0px -8% 0px", threshold: .08 });
      rv.forEach(function (el) { io.observe(el); });
    } else {
      rv.forEach(function (el) { el.classList.add("in"); });
    }
  }

  /* ---------- Contadores ---------- */
  $$("[data-count]").forEach(function (el) {
    var target = parseFloat(el.getAttribute("data-count")), suf = el.getAttribute("data-suffix") || "", done = false;
    function run() {
      if (done) return; done = true;
      var t0 = performance.now(), dur = 1400;
      (function tick(now) {
        var p = Math.min((now - t0) / dur, 1), eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(target * eased).toLocaleString("pt-BR") + suf;
        if (p < 1) requestAnimationFrame(tick);
      })(t0);
    }
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (en, ob) {
        if (en[0].isIntersecting) { run(); ob.disconnect(); }
      }, { threshold: .4 }).observe(el);
    } else run();
  });

  /* ---------- Título do hero palavra por palavra ---------- */
  $$("[data-split]").forEach(function (el) {
    var i = 0;
    el.innerHTML = el.innerHTML.replace(/([^\s<>]+)(?![^<]*>)/g, function (w) {
      if (!w.trim()) return w;
      var d = (i++ * 0.07).toFixed(2);
      return '<span class="word" style="animation-delay:' + d + 's">' + w + "</span>";
    });
  });

  /* ---------- Marquee (duplica o conteúdo pro loop ficar contínuo) ---------- */
  $$(".marquee > div").forEach(function (d) { d.innerHTML += d.innerHTML; });

  /* ---------- FAQ ---------- */
  $$(".faq-q").forEach(function (q) {
    q.addEventListener("click", function () {
      var item = q.closest(".faq-item"), a = $(".faq-a", item), open = item.classList.contains("open");
      $$(".faq-item.open").forEach(function (o) {
        o.classList.remove("open"); $(".faq-a", o).style.maxHeight = null;
        $(".faq-q", o).setAttribute("aria-expanded", "false");
      });
      if (!open) {
        item.classList.add("open"); a.style.maxHeight = a.scrollHeight + "px";
        q.setAttribute("aria-expanded", "true");
      }
    });
  });

  /* ---------- Preenche dados de contato vindos do config ---------- */
  function fill() {
    var e = C.endereco || {};
    var enderecoCurto = e.rua + " — " + e.bairro;
    var enderecoFull = e.rua + ", " + e.bairro + ", " + e.cidade + "/" + e.uf + " — CEP " + e.cep;

    $$("[data-fill]").forEach(function (el) {
      var k = el.getAttribute("data-fill"), v = "";
      if (k === "endereco") v = enderecoCurto;
      else if (k === "endereco-full") v = enderecoFull;
      else if (k === "cidade") v = e.cidade + "/" + e.uf;
      else if (k === "telefone") v = (C.telefones || [""])[0];
      else if (k === "telefone2") v = (C.telefones || [])[1] || "";
      else if (k === "email") v = C.email;
      else if (k === "ano") v = new Date().getFullYear();
      if (v) el.textContent = v;
    });

    $$("[data-wa]").forEach(function (el) {
      el.href = window.spfcWaLink(el.getAttribute("data-wa") ||
        "Olá! Vim pelo site e quero agendar a aula experimental gratuita.");
      el.addEventListener("click", function () { window.spfcTrack("Contact", { method: "whatsapp" }); });
    });
    $$("[data-href=instagram]").forEach(function (el) { el.href = C.instagram; });
    $$("[data-href=facebook]").forEach(function (el) { el.href = C.facebook; });
    $$("[data-href=email]").forEach(function (el) { el.href = "mailto:" + C.email; });
    $$("[data-href=tel]").forEach(function (el) { el.href = "tel:+55" + (C.telefones[0] || "").replace(/\D/g, ""); });
    $$("[data-href=maps]").forEach(function (el) {
      el.href = "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(e.mapsQuery);
    });

    var map = $("[data-map]");
    if (map) {
      map.innerHTML = '<iframe loading="lazy" referrerpolicy="no-referrer-when-downgrade" title="Mapa da Escola de Futebol SPFC Guarulhos" src="https://maps.google.com/maps?q=' +
        encodeURIComponent(e.mapsQuery) + '&output=embed"></iframe>';
    }
  }
  fill();

  /* ---------- Aviso de configuração pendente ---------- */
  if (!C.whatsapp || /0{6,}/.test(C.whatsapp)) {
    console.warn("[SPFC] Número de WhatsApp ainda não configurado em assets/js/config.js");
  }
})();
