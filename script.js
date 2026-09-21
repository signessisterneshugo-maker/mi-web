/* =====================================================================
   HUGO SIGNES SISTERNES · interacciones
   ===================================================================== */
(function () {
  "use strict";
  var reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var fine   = matchMedia("(pointer:fine)").matches;
  var root   = document.documentElement;
  var $  = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ---------- Tema claro/oscuro ---------- */
  var tBtn = $("#themeToggle");
  function syncTheme() { tBtn.setAttribute("aria-pressed", root.getAttribute("data-theme") === "light"); }
  syncTheme();
  tBtn.addEventListener("click", function () {
    var n = root.getAttribute("data-theme") === "light" ? "dark" : "light";
    root.setAttribute("data-theme", n);
    try { localStorage.setItem("hugo-theme", n); } catch (e) {}
    syncTheme();
  });

  /* ---------- Selector de estilo ---------- */
  var sBtn = $("#styleToggle"), sPanel = $("#stylePanel"), sOpts = $$("[data-set-style]");
  function applyStyle(s) {
    root.setAttribute("data-style", s);
    try { localStorage.setItem("hugo-style", s); } catch (e) {}
    sOpts.forEach(function (b) {
      var on = b.dataset.setStyle === s;
      b.classList.toggle("is-active", on);
      b.setAttribute("aria-checked", on);
    });
    updateCursor();
  }
  applyStyle(root.getAttribute("data-style") || "unico");
  sBtn.addEventListener("click", function (e) {
    e.stopPropagation();
    var o = sPanel.hidden; sPanel.hidden = !o; sBtn.setAttribute("aria-expanded", String(o));
  });
  sOpts.forEach(function (b) {
    b.addEventListener("click", function () {
      applyStyle(b.dataset.setStyle);
      sPanel.hidden = true; sBtn.setAttribute("aria-expanded", "false");
    });
  });
  document.addEventListener("click", function () { sPanel.hidden = true; sBtn.setAttribute("aria-expanded", "false"); });
  sPanel.addEventListener("click", function (e) { e.stopPropagation(); });

  /* ---------- Progreso + topbar + to-top ---------- */
  var bar = $(".progress span"), topbar = $(".topbar"), toTop = $("#toTop");
  function onScroll() {
    var h = document.documentElement, p = h.scrollTop / ((h.scrollHeight - h.clientHeight) || 1);
    bar.style.transform = "scaleX(" + p + ")";
    topbar.classList.toggle("is-scrolled", h.scrollTop > 30);
    toTop.classList.toggle("is-show", h.scrollTop > 600);
  }
  addEventListener("scroll", onScroll, { passive: true }); onScroll();
  toTop.addEventListener("click", function () { scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" }); });

  /* ---------- Cursor custom + rastro de brasas ---------- */
  var cur = $(".cursor"), ring = $(".cursor-ring"), trail = $(".trail");
  var mx = innerWidth / 2, my = innerHeight / 2, rx = mx, ry = my, lastTrail = 0;
  function updateCursor() {
    var s = root.getAttribute("data-style");
    document.body.classList.toggle("has-cursor", fine && !reduce && s !== "professional");
  }
  updateCursor();
  if (fine && !reduce) {
    addEventListener("pointermove", function (e) {
      mx = e.clientX; my = e.clientY;
      cur.style.transform = "translate(" + (mx - 3.5) + "px," + (my - 3.5) + "px)";
      var s = root.getAttribute("data-style");
      if ((s === "gamer" || s === "unico" || s === "retro") && performance.now() - lastTrail > 45) {
        lastTrail = performance.now();
        var d = document.createElement("i");
        d.style.left = mx + "px"; d.style.top = my + "px";
        trail.appendChild(d);
        setTimeout(function () { d.remove(); }, 800);
      }
    });
    (function loop() {
      rx += (mx - rx) * 0.18; ry += (my - ry) * 0.18;
      ring.style.transform = "translate(" + (rx - 19) + "px," + (ry - 19) + "px)";
      requestAnimationFrame(loop);
    })();
    var hov = "a,button,[data-magnetic],[data-tilt],.work__card,.cell,.official a";
    addEventListener("pointerover", function (e) { if (e.target.closest(hov)) ring.classList.add("is-hover"); });
    addEventListener("pointerout",  function (e) { if (e.target.closest(hov)) ring.classList.remove("is-hover"); });
  }

  /* ---------- Ripple al click ---------- */
  var ripples = $(".ripples");
  if (ripples && !reduce) {
    addEventListener("pointerdown", function (e) {
      var s = document.createElement("span");
      s.style.left = e.clientX + "px"; s.style.top = e.clientY + "px";
      ripples.appendChild(s);
      setTimeout(function () { s.remove(); }, 700);
    });
  }

  /* ---------- Spotlight + parallax alas + grid ---------- */
  var spot = $(".spotlight"), wl = $(".hero__wing--l"), wr = $(".hero__wing--r"), glow = $(".hero__glow"), hgrid = $(".hero__grid");
  if (!reduce && fine) {
    addEventListener("pointermove", function (e) {
      spot.style.opacity = "1"; spot.style.left = e.clientX + "px"; spot.style.top = e.clientY + "px";
      var x = (e.clientX / innerWidth - 0.5), y = (e.clientY / innerHeight - 0.5);
      if (wl) wl.style.transform = "translateY(calc(-50% + " + (y * 26) + "px)) translateX(" + (x * 26) + "px) scaleX(-1)";
      if (wr) wr.style.transform = "translateY(calc(-50% + " + (y * 26) + "px)) translateX(" + (x * 26) + "px)";
      if (glow) glow.style.transform = "translate(" + (x * -40) + "px," + (y * -40) + "px)";
      if (hgrid) hgrid.style.transform = "translate(" + (x * 14) + "px," + (y * 14) + "px)";
    });
  }

  /* ---------- Embers (brasas) ---------- */
  var embers = $(".embers");
  if (embers && !reduce) {
    for (var i = 0; i < 22; i++) {
      var e = document.createElement("i");
      e.style.left = Math.random() * 100 + "%";
      e.style.setProperty("--dx", (Math.random() * 60 - 30) + "px");
      e.style.animationDuration = (7 + Math.random() * 8) + "s";
      e.style.animationDelay = (-Math.random() * 12) + "s";
      e.style.width = e.style.height = (3 + Math.random() * 4) + "px";
      embers.appendChild(e);
    }
  }

  /* ---------- Tambor 3D (marquesina que gira) ---------- */
  var drum = $("#drum");
  if (drum) {
    var items = [
      ["GRADO MEDIO SMX", 1], ["VOLVER A ENCENDER", 0], ["ESSEPI TECH · IT", 0],
      ["1º DAM · SIMARRO", 0], ["THE CHALLENGE", 1], ["IA", 0], ["ROBÓTICA", 0], ["ROCK", 0]
    ];
    var N = items.length;
    items.forEach(function (it, idx) {
      var el = document.createElement("div");
      el.className = "drum__item";
      el.style.setProperty("--a", (360 / N) * idx + "deg");
      el.innerHTML = '<span class="' + (it[1] ? "" : "w") + '">' + it[0] + '</span><span class="x">✦</span>';
      drum.appendChild(el);
    });
    drum.addEventListener("pointerenter", function () { $(".drum__stage").style.animationPlayState = "paused"; });
    drum.addEventListener("pointerleave", function () { $(".drum__stage").style.animationPlayState = "running"; });
  }

  /* ---------- Marquee fino ---------- */
  var marquee = $("#marquee");
  if (marquee) {
    var words = ["ERASMUS · ESSEPI TECH", "SMX", "DAM", "VOLVER A ENCENDER", "THE CHALLENGE", "IA", "ROBÓTICA", "ROCK", "XÀTIVA", "SIMARRO"];
    function grp() {
      var g = document.createElement("div"); g.className = "marquee__group";
      words.forEach(function (w) {
        var s = document.createElement("span"); s.textContent = w; g.appendChild(s);
        var x = document.createElement("span"); x.className = "x"; x.textContent = "✦"; g.appendChild(x);
      });
      return g;
    }
    marquee.appendChild(grp()); marquee.appendChild(grp());
  }

  /* ---------- Scramble del nombre ---------- */
  var CH = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%&/";
  function scramble(el) {
    var target = el.dataset.text || el.textContent, frame = 0;
    var q = target.split("").map(function (c, i) {
      return { c: c, s: Math.floor(Math.random() * 12), e: Math.floor(Math.random() * 12) + 14 + i * 2 };
    });
    (function tick() {
      var out = "", done = 0;
      q.forEach(function (o) {
        if (frame >= o.e) { out += o.c; done++; }
        else if (frame >= o.s) out += CH[Math.floor(Math.random() * CH.length)];
      });
      el.textContent = out;
      if (done !== q.length) { frame++; requestAnimationFrame(tick); }
    })();
  }
  if (!reduce) setTimeout(function () { $$(".hero__name-line").forEach(scramble); }, 650);

  /* ---------- Reveal on scroll ---------- */
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("is-in"); io.unobserve(en.target); } });
  }, { threshold: 0.15, rootMargin: "0px 0px -8% 0px" });
  $$("[data-reveal]").forEach(function (el) { io.observe(el); });

  /* ---------- Contadores ---------- */
  var cio = new IntersectionObserver(function (es) {
    es.forEach(function (en) {
      if (!en.isIntersecting) return;
      var el = en.target, t = +el.dataset.count;
      if (reduce) { el.textContent = t; cio.unobserve(el); return; }
      var c = 0;
      (function step() {
        c += Math.max(1, Math.round(t / 16));
        if (c >= t) el.textContent = t; else { el.textContent = c; requestAnimationFrame(step); }
      })();
      cio.unobserve(el);
    });
  }, { threshold: 0.6 });
  $$("[data-count]").forEach(function (el) { cio.observe(el); });

  /* ---------- Ecualizador de rock ---------- */
  var eq = $("#eq");
  if (eq) for (var b = 0; b < 26; b++) {
    var s = document.createElement("span");
    s.style.setProperty("--h", (22 + Math.random() * 78) + "%");
    s.style.animationDuration = (0.5 + Math.random() * 0.9) + "s";
    s.style.animationDelay = (-Math.random() * 2) + "s";
    eq.appendChild(s);
  }

  /* ---------- Tarjetas apiladas (scale por profundidad) ---------- */
  var cards = $$(".work__card");
  function stackScale() {
    var top = 100;
    cards.forEach(function (card) {
      var i = cards.indexOf(card), next = cards[i + 1], sc = 1;
      if (next) {
        var nr = next.getBoundingClientRect(), cr = card.getBoundingClientRect();
        if (cr.top <= top + 2 && nr.top > top) {
          var ov = (top - cr.top) / cr.height;
          sc = 1 - Math.min(Math.max(ov, 0), 1) * 0.08;
        }
      }
      card.style.setProperty("--sc", sc.toFixed(3));
    });
  }
  if (!reduce) { addEventListener("scroll", stackScale, { passive: true }); stackScale(); }

  /* ---------- Scrollspy (topnav + rail) ---------- */
  var navLinks = $$(".topnav a, .rail__nav a"), map = new Map();
  navLinks.forEach(function (l) { var sec = $(l.getAttribute("href")); if (sec) map.set(sec, l); });
  var sio = new IntersectionObserver(function (es) {
    es.forEach(function (en) {
      if (en.isIntersecting) {
        navLinks.forEach(function (l) { l.classList.remove("is-active"); });
        var lk = map.get(en.target); if (lk) lk.classList.add("is-active");
      }
    });
  }, { rootMargin: "-45% 0px -50% 0px" });
  map.forEach(function (_, sec) { sio.observe(sec); });

  /* ---------- Menú móvil ---------- */
  var burger = $(".burger"), drawer = $("#drawer");
  function toggleMenu(open) {
    drawer.hidden = !open;
    burger.setAttribute("aria-expanded", String(open));
    document.body.style.overflow = open ? "hidden" : "";
  }
  burger.addEventListener("click", function () { toggleMenu(drawer.hidden); });
  $$("a", drawer).forEach(function (a) { a.addEventListener("click", function () { toggleMenu(false); }); });

  /* ---------- Tabs ---------- */
  var tabs = $$(".tabs__btn");
  tabs.forEach(function (btn) {
    btn.addEventListener("click", function () {
      tabs.forEach(function (x) { x.classList.remove("is-active"); x.setAttribute("aria-selected", "false"); });
      $$(".tabs__panel").forEach(function (p) { p.hidden = true; p.classList.remove("is-active"); });
      btn.classList.add("is-active"); btn.setAttribute("aria-selected", "true");
      var p = $("#" + btn.dataset.tab); p.hidden = false; p.classList.add("is-active");
    });
  });

  /* ---------- Terminal typewriter ---------- */
  var termBody = $("#termBody"), termStatus = $("#termStatus");
  if (termBody) {
    var lines = [
      "whoami → hugo_signes",
      "cat ~/dam/plan.md → IA aplicada a industria",
      "git log --oneline → smx · vae · erasmus · dam",
      "echo $SIGUIENTE → especialización en IA"
    ];
    if (reduce) {
      termBody.innerHTML = '<span class="prompt">$</span> ' + lines[0];
    } else {
      var li = 0, ci = 0, del = false;
      (function type() {
        var line = lines[li], shown = line.slice(0, ci);
        termBody.innerHTML = '<span class="prompt">$</span> ' + shown + '<span class="caret"></span>';
        if (termStatus) termStatus.textContent = "ejecutando";
        if (!del) { ci++; if (ci > line.length) { del = true; setTimeout(type, 1200); return; } }
        else { ci--; if (ci < 0) { del = false; ci = 0; li = (li + 1) % lines.length; } }
        setTimeout(type, del ? 26 : 46 + Math.random() * 40);
      })();
    }
  }

  /* ---------- Tilt (spec + celdas) ---------- */
  if (!reduce && fine) {
    $$("[data-tilt]").forEach(function (c) {
      c.addEventListener("pointermove", function (e) {
        var r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
        var strong = c.classList.contains("spec") ? 4 : 3;
        c.style.transform = "perspective(900px) rotateY(" + (x * strong) + "deg) rotateX(" + (-y * strong) + "deg)";
        c.style.setProperty("--mx", (x + 0.5) * 100 + "%");
        c.style.setProperty("--my", (y + 0.5) * 100 + "%");
      });
      c.addEventListener("pointerleave", function () { c.style.transform = ""; });
    });
  }

  /* ---------- Botones magnéticos ---------- */
  if (!reduce && fine) {
    $$("[data-magnetic]").forEach(function (b) {
      b.addEventListener("pointermove", function (e) {
        var r = b.getBoundingClientRect();
        b.style.transform = "translate(" + ((e.clientX - r.left - r.width / 2) * 0.18) + "px," + ((e.clientY - r.top - r.height / 2) * 0.3) + "px)";
      });
      b.addEventListener("pointerleave", function () { b.style.transform = ""; });
    });
  }

  /* ---------- Roadmap progreso por scroll ---------- */
  var road = $("#road"), roadFill = $("#roadFill"), steps = $$(".road__step");
  function roadProgress() {
    if (!road) return;
    var r = road.getBoundingClientRect(), vh = innerHeight;
    var p = Math.min(Math.max((vh * 0.7 - r.top) / (r.height + vh * 0.3), 0), 1);
    if (roadFill) roadFill.style.width = (p * 88) + "%";
    steps.forEach(function (st, i) { st.classList.toggle("on", p >= (i / (steps.length - 1)) * 0.9); });
  }
  if (road) { addEventListener("scroll", roadProgress, { passive: true }); roadProgress(); }

  /* ---------- Copiar correo ---------- */
  var toast = $("#toast");
  $("#copy").addEventListener("click", function () {
    var mail = $("#mail").textContent.trim();
    function ok() { toast.classList.add("is-show"); setTimeout(function () { toast.classList.remove("is-show"); }, 2200); }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(mail).then(ok, function () { location.href = "mailto:" + mail; });
    } else { location.href = "mailto:" + mail; }
  });

  /* ---------- Año dinámico ---------- */
  $("#year").textContent = new Date().getFullYear();
})();