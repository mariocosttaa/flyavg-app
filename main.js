(function () {
  var copy = window.AVG_COPY;
  var root = document.documentElement;
  var KEY = "avg-lang";
  // Idiomas ativos. Por agora só inglês; o PT continua em copy.js.
  var LANGS = ["en"];
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var SVGNS = "http://www.w3.org/2000/svg";

  /* ---------- Idioma ---------- */

  function stored() {
    try { return localStorage.getItem(KEY); } catch (e) { return null; }
  }
  function store(v) {
    try { localStorage.setItem(KEY, v); } catch (e) {}
  }
  function detect() {
    if (LANGS.length === 1) return LANGS[0];
    var s = stored();
    if (s === "pt" || s === "en") return s;
    var langs = navigator.languages || [navigator.language || ""];
    for (var i = 0; i < langs.length; i++) {
      var l = String(langs[i]).toLowerCase();
      if (l.indexOf("pt") === 0) return "pt";
      if (l.indexOf("en") === 0) return "en";
    }
    return "en";
  }

  function apply(lang) {
    var t = copy[lang];
    root.lang = lang === "pt" ? "pt" : "en";
    document.title = t.title;
    var meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", t.description);
    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      var k = el.getAttribute("data-i18n");
      if (t[k] != null) el.textContent = t[k];
    });
    document.querySelectorAll("[data-lang]").forEach(function (b) {
      var on = b.getAttribute("data-lang") === lang;
      b.setAttribute("aria-pressed", on ? "true" : "false");
    });
    var sw = document.querySelector(".lang");
    if (sw) sw.setAttribute("aria-label", t.langLabel);
  }

  var lang = detect();
  apply(lang);

  document.querySelectorAll("[data-lang]").forEach(function (b) {
    b.addEventListener("click", function () {
      var next = b.getAttribute("data-lang");
      if (next === lang) return;
      lang = next;
      store(lang);
      root.classList.add("swapping");
      setTimeout(function () {
        apply(lang);
        root.classList.remove("swapping");
        if (board) board.show(current, true);
      }, 180);
    });
  });

  /* ---------- Rotas a partir de Luanda ----------
     Posições em fração do ecrã; destinos fora do ecrã de propósito,
     para as linhas saírem da página. Dados de demonstração. */

  var ROUTES = [
    { flight: "AVG003", to: "LPPT", wide: [0.6, -0.12], tall: [0.2, -0.12] },
    { flight: "AVG101", to: "FAOR", wide: [0.96, 1.18], tall: [1.3, 0.34] },
    { flight: "AVG207", to: "SBGR", wide: [-0.12, 0.96], tall: [-0.3, 0.16] },
    { flight: "AVG315", to: "OMDB", wide: [1.14, 0.16], tall: [1.25, -0.06] },
    { flight: "AVG012", to: "FNHU", wide: [0.88, 0.9], tall: [1.1, 0.22] },
  ];
  var HUB = { code: "FNLU", label: "FNLU · LUANDA", wide: [0.79, 0.62], tall: [0.88, 0.42] };
  // Cada sub-marca pode trazer as suas rotas em window.AVG_PAGE (page.js).
  var PAGE = window.AVG_PAGE || {};
  if (PAGE.routes) ROUTES = PAGE.routes;
  if (PAGE.hub) HUB = PAGE.hub;
  // Avião visto de cima, a apontar para a direita (0 graus).
  var PLANE_D =
    "M11 0 L3 -1.6 L-1 -8 L-3 -8 L-0.6 -1.6 L-6 -1.4 L-8 -4 L-9.5 -4 L-8.4 0 L-9.5 4 L-8 4 L-6 1.4 L-0.6 1.6 L-3 8 L-1 8 L3 1.6 Z";

  var svg = document.querySelector(".routes");
  var routeEls = [];
  var trail, plane, current = 0;

  function el(name, attrs, parent) {
    var n = document.createElementNS(SVGNS, name);
    for (var k in attrs) n.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(n);
    return n;
  }

  function arc(a, b) {
    var mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2;
    var dx = b[0] - a[0], dy = b[1] - a[1];
    var bend = 0.2;
    // Curva para a esquerda do sentido de voo, como num grande círculo.
    var cx = mx + dy * bend, cy = my - dx * bend;
    return "M" + a[0].toFixed(1) + " " + a[1].toFixed(1) +
      " Q" + cx.toFixed(1) + " " + cy.toFixed(1) + " " + b[0].toFixed(1) + " " + b[1].toFixed(1);
  }

  function build() {
    if (!svg) return;
    var w = window.innerWidth, h = svg.clientHeight || window.innerHeight;
    var key = w / h < 0.9 ? "tall" : "wide";
    svg.setAttribute("viewBox", "0 0 " + w + " " + h);
    while (svg.firstChild) svg.removeChild(svg.firstChild);
    routeEls = [];
    var hub = [HUB[key][0] * w, HUB[key][1] * h];
    var g = el("g", {}, svg);
    ROUTES.forEach(function (r, i) {
      var to = [r[key][0] * w, r[key][1] * h];
      var p = el("path", { class: "route", d: arc(hub, to), style: "--i:" + i }, g);
      routeEls.push(p);
    });
    trail = el("path", { class: "trail", d: "M0 0" }, g);
    var hg = el("g", { class: "hub" }, g);
    el("circle", { class: "hub-ring", cx: hub[0], cy: hub[1], r: 4 }, hg);
    el("circle", { class: "hub-ring r2", cx: hub[0], cy: hub[1], r: 4 }, hg);
    el("circle", { class: "hub-dot", cx: hub[0], cy: hub[1], r: 4 }, hg);
    // No telemóvel o nome fica à esquerda do ponto, para não sair do ecrã.
    var left = key === "tall";
    var label = el("text", {
      class: "hub-label", x: hub[0] + (left ? -14 : 14), y: hub[1] + 4,
      "text-anchor": left ? "end" : "start",
    }, hg);
    // No telemóvel o cabeçalho ocupa o topo: fica só o ponto, sem o nome.
    if (key !== "tall") label.textContent = HUB.label;
    plane = el("g", { class: "plane" }, g);
    el("path", { class: "plane-glyph", d: PLANE_D }, plane);
    if (routeEls[current]) routeEls[current].classList.add("active");
  }

  /* ---------- Painel de partidas ---------- */

  var CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

  function Board(rootEl) {
    var groups = {};
    rootEl.querySelectorAll("[data-cells]").forEach(function (c) {
      var n = +c.getAttribute("data-len");
      var cells = [];
      for (var i = 0; i < n; i++) {
        var cell = document.createElement("span");
        cell.className = "cell";
        var s = document.createElement("span");
        s.textContent = " ";
        cell.appendChild(s);
        c.appendChild(cell);
        cells.push(cell);
      }
      groups[c.getAttribute("data-cells")] = cells;
    });

    function setCell(cell, ch, animate) {
      var s = cell.firstChild;
      if (s.textContent === ch) return;
      s.textContent = ch;
      if (!animate) return;
      cell.classList.remove("flip");
      void cell.offsetWidth;
      cell.classList.add("flip");
    }

    function write(cells, text, animate, base) {
      text = (text + "          ").slice(0, cells.length);
      cells.forEach(function (cell, i) {
        var target = text[i] === " " ? " " : text[i];
        if (!animate) return setCell(cell, target, false);
        if (cell.firstChild.textContent === target) return;
        var spins = 3 + Math.floor(Math.random() * 4);
        var delay = base + i * 45;
        for (var k = 0; k < spins; k++) {
          (function (k) {
            setTimeout(function () {
              setCell(cell, CHARS[Math.floor(Math.random() * CHARS.length)], true);
            }, delay + k * 60);
          })(k);
        }
        setTimeout(function () { setCell(cell, target, true); }, delay + spins * 60);
      });
    }

    this.show = function (i, animate) {
      var r = ROUTES[i];
      write(groups.flight, r.flight, animate, 0);
      write(groups.from, HUB.code, animate, 80);
      write(groups.to, r.to, animate, 160);
      write(groups.status, copy[lang].boardSoon, animate, 240);
    };
  }

  var boardEl = document.querySelector(".board");
  var board = boardEl ? new Board(boardEl) : null;

  /* ---------- Voo ao longo da rota ativa ---------- */

  var FLIGHT_MS = 4600, REST_MS = 1300, BOARD_MS = 900;
  var raf = 0, t0 = 0, phase = "idle", paused = false;

  function ease(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  function setActive(i) {
    routeEls.forEach(function (p, k) { p.classList.toggle("active", k === i); });
  }

  function startLeg() {
    setActive(current);
    if (board) board.show(current, true);
    var path = routeEls[current];
    trail.setAttribute("d", path.getAttribute("d"));
    var len = path.getTotalLength();
    trail.style.strokeDasharray = len + " " + len;
    trail.style.strokeDashoffset = len;
    trail.classList.remove("fade");
    phase = "board";
    t0 = performance.now();
    if (!raf) raf = requestAnimationFrame(tick);
  }

  function tick(now) {
    raf = 0;
    if (paused) return;
    var path = routeEls[current];
    var len = path.getTotalLength();
    var dt = now - t0;
    if (phase === "board") {
      if (dt >= BOARD_MS) { phase = "fly"; t0 = now; svg.classList.add("flying"); }
    } else if (phase === "fly") {
      var t = Math.min(dt / FLIGHT_MS, 1);
      var d = ease(t) * len;
      var p = path.getPointAtLength(d);
      var q = path.getPointAtLength(Math.min(d + 1, len));
      var ang = Math.atan2(q.y - p.y, q.x - p.x) * 180 / Math.PI;
      var s = window.innerWidth < 720 ? 0.85 : 1.05;
      plane.setAttribute("transform",
        "translate(" + p.x.toFixed(1) + " " + p.y.toFixed(1) + ") rotate(" + ang.toFixed(1) + ") scale(" + s + ")");
      trail.style.strokeDashoffset = (len - d).toFixed(1);
      if (t >= 1) {
        phase = "rest"; t0 = now;
        svg.classList.remove("flying");
        trail.classList.add("fade");
      }
    } else if (phase === "rest") {
      if (dt >= REST_MS) {
        current = (current + 1) % ROUTES.length;
        startLeg();
        return;
      }
    }
    raf = requestAnimationFrame(tick);
  }

  document.addEventListener("visibilitychange", function () {
    paused = document.hidden;
    if (!paused && phase !== "idle" && !raf) {
      t0 = performance.now();
      raf = requestAnimationFrame(tick);
    }
  });

  var resizeTimer, lastW = window.innerWidth, lastH = window.innerHeight;
  window.addEventListener("resize", function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      // No telemóvel a barra do browser muda a altura ao fazer scroll; ignorar.
      var w = window.innerWidth, h = window.innerHeight;
      if (w === lastW && Math.abs(h - lastH) < 120) return;
      lastW = w; lastH = h;
      build();
      if (svg) svg.classList.add("on");
      if (phase !== "idle" && !reduce) startLeg();
    }, 200);
  });

  build();

  /* ---------- Arranque ---------- */

  function start() {
    requestAnimationFrame(function () {
      root.classList.add("ready");
      if (reduce) {
        if (svg) svg.classList.add("on");
        if (board) board.show(0, false);
        return;
      }
      // As rotas aparecem depois do logótipo; o primeiro voo a seguir.
      setTimeout(function () { if (svg) svg.classList.add("on"); }, 1700);
      if (board) board.show(0, false);
      setTimeout(function () { if (routeEls.length) startLeg(); }, 2600);
    });
  }
  if (document.fonts && document.fonts.ready) {
    var done = false;
    document.fonts.ready.then(function () { if (!done) { done = true; start(); } });
    setTimeout(function () { if (!done) { done = true; start(); } }, 600);
  } else {
    start();
  }

  /* ---------- Paralaxe com o rato ---------- */

  var fine = window.matchMedia("(pointer: fine)").matches;
  var mark = document.querySelector(".bg-mark-inner");
  if (!mark || reduce || !fine) return;

  var tx = 0, ty = 0, cx = 0, cy = 0, praf = 0;
  function loop() {
    cx += (tx - cx) * 0.06;
    cy += (ty - cy) * 0.06;
    mark.style.transform = "translate3d(" + cx.toFixed(2) + "px," + cy.toFixed(2) + "px,0)";
    if (svg) svg.style.transform = "translate3d(" + (cx * 0.45).toFixed(2) + "px," + (cy * 0.45).toFixed(2) + "px,0)";
    if (Math.abs(tx - cx) > 0.05 || Math.abs(ty - cy) > 0.05) {
      praf = requestAnimationFrame(loop);
    } else {
      praf = 0;
    }
  }
  window.addEventListener("pointermove", function (e) {
    tx = (e.clientX / window.innerWidth - 0.5) * -24;
    ty = (e.clientY / window.innerHeight - 0.5) * -16;
    if (!praf) praf = requestAnimationFrame(loop);
  }, { passive: true });
})();
