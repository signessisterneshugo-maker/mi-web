/* =====================================================================
   HUGO SIGNES SISTERNES · MOTOR RPG Y ANIMACIONES (CORREGIDO)
   ===================================================================== */
(function () {
  "use strict";
  var reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var fine   = matchMedia("(pointer:fine)").matches;
  var root   = document.documentElement;
  var $  = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ---------- Sincronizar enlaces (Soluciona persistencia local) ---------- */
  function syncLinks() {
    var t = root.getAttribute("data-theme");
    var s = root.getAttribute("data-style");
    $$(".topnav a, .rail__nav a, .hero__cta a").forEach(function(a) {
      var href = a.getAttribute("href");
      if (!href || href.startsWith("http") || href.startsWith("mailto:")) return;
      var base = href.split("?")[0].split("#")[0];
      var hash = href.includes("#") ? "#" + href.split("#")[1] : "";
      if (base) a.setAttribute("href", base + "?theme=" + t + "&style=" + s + hash);
    });
    $$(".rpg-obj").forEach(function(obj) {
      var base = obj.getAttribute("data-url");
      if (base) {
        base = base.split("?")[0];
        obj.setAttribute("data-url", base + "?theme=" + t + "&style=" + s);
      }
    });
  }

  /* ---------- Menú Superior (Fondo al scrollear arreglado) ---------- */
  var topbar = $(".topbar");
  function onScroll() {
    if (rpgModeActive) return;
    var st = window.scrollY || window.pageYOffset;
    if(topbar) topbar.classList.toggle("is-scrolled", st > 30);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Tema claro/oscuro ---------- */
  var tBtn = $("#themeToggle");
  function syncTheme() {
    if(tBtn) tBtn.setAttribute("aria-pressed", root.getAttribute("data-theme") === "light");
    syncLinks(); 
  }
  syncTheme();
  if(tBtn) {
    tBtn.addEventListener("click", function () {
      var n = root.getAttribute("data-theme") === "light" ? "dark" : "light";
      root.setAttribute("data-theme", n);
      try { localStorage.setItem("hugo-theme", n); } catch (e) {}
      syncTheme();
    });
  }

  /* ---------- Selector de estilo & Toggle RPG ---------- */
  var rpgModeActive = false;
  var sBtn = $("#styleToggle"), sPanel = $("#stylePanel"), sOpts = $$("[data-set-style]");
  var btnExitRpg = $("#btn-exit-rpg");
  
  function applyStyle(s) {
    root.setAttribute("data-style", s);
    if (s !== "rpg") { try { localStorage.setItem("hugo-style", s); } catch (e) {} }
    if (s === "rpg" && !$("#rpg-map")) {
      window.location.href = "index.html?style=rpg";
      return;
    }
    
    sOpts.forEach(function (b) {
      var on = b.dataset.setStyle === s;
      b.classList.toggle("is-active", on);
      b.setAttribute("aria-checked", on);
    });
    
    updateCursor();
    syncLinks(); 

    var rpgContainer = $("#rpg-mode");
    var mainWeb = $("#mainWeb");
    
    if (s === "rpg") {
      rpgModeActive = true;
      if (rpgContainer) rpgContainer.hidden = false;
      if (mainWeb) mainWeb.hidden = true; 
      initRPG();
    } else {
      rpgModeActive = false;
      if (rpgContainer) rpgContainer.hidden = true;
      if (mainWeb) mainWeb.hidden = false;
      stopRPG();
    }
  }
  
  var urlParams = new URLSearchParams(window.location.search);
  var initialStyle = urlParams.get('style') || localStorage.getItem('hugo-style') || "unico";
  if (initialStyle === "rpg") initialStyle = "unico"; 
  applyStyle(initialStyle);

  if(sBtn) {
    sBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      var o = sPanel.hidden; sPanel.hidden = !o; sBtn.setAttribute("aria-expanded", String(o));
    });
  }
  
  sOpts.forEach(function (b) {
    b.addEventListener("click", function () {
      applyStyle(b.dataset.setStyle);
      if(sPanel) sPanel.hidden = true; 
      if(sBtn) sBtn.setAttribute("aria-expanded", "false");
    });
  });
  
  document.addEventListener("click", function () { if(sPanel) sPanel.hidden = true; if(sBtn) sBtn.setAttribute("aria-expanded", "false"); });
  if(sPanel) sPanel.addEventListener("click", function (e) { e.stopPropagation(); });

  if (btnExitRpg) {
    btnExitRpg.addEventListener("click", function() {
      var stored = localStorage.getItem('hugo-style') || "unico";
      applyStyle(stored === "rpg" ? "unico" : stored);
    });
  }

  /* ---------- Navegación Activa Automática ---------- */
  var path = window.location.pathname;
  var page = path.split("/").pop();
  if(page === "" || page === "index.html") page = "index.html";
  $$(".topnav a, .rail__nav a").forEach(function(a) {
    var href = a.getAttribute("href").split("?")[0];
    if (href === page) a.classList.add("is-active");
    else a.classList.remove("is-active");
  });

  /* ---------- Cursor custom ---------- */
  var cur = $(".cursor"), ring = $(".cursor-ring"), trail = $(".trail");
  var mx = innerWidth / 2, my = innerHeight / 2, rx = mx, ry = my, lastTrail = 0;
  function updateCursor() {
    var s = root.getAttribute("data-style");
    document.body.classList.toggle("has-cursor", fine && !reduce && s !== "professional" && s !== "rpg");
  }
  if (fine && !reduce) {
    addEventListener("pointermove", function (e) {
      mx = e.clientX; my = e.clientY;
      if(cur) cur.style.transform = "translate(" + (mx - 3.5) + "px," + (my - 3.5) + "px)";
      var s = root.getAttribute("data-style");
      if ((s === "gamer" || s === "unico" || s === "retro") && performance.now() - lastTrail > 45) {
        lastTrail = performance.now();
        if(trail) {
          var d = document.createElement("i");
          d.style.left = mx + "px"; d.style.top = my + "px";
          trail.appendChild(d);
          setTimeout(function () { d.remove(); }, 800);
        }
      }
    });
    (function loop() {
      rx += (mx - rx) * 0.18; ry += (my - ry) * 0.18;
      if(ring) ring.style.transform = "translate(" + (rx - 19) + "px," + (ry - 19) + "px)";
      requestAnimationFrame(loop);
    })();
    var hov = "a,button,[data-magnetic],[data-tilt],.work__card,.cell,.official a";
    addEventListener("pointerover", function (e) { if (e.target.closest(hov) && ring) ring.classList.add("is-hover"); });
    addEventListener("pointerout",  function (e) { if (e.target.closest(hov) && ring) ring.classList.remove("is-hover"); });
  }

  /* =====================================================================
     MOTOR MINIJUEGO 2D (RPG) LIGADO A PÁGINAS
     ===================================================================== */
  var mapEl, playerEl, playerInner;
  var pX = 430, pY = 430; 
  var speed = 6; 
  var keys = {};
  var rpgLoopId = null;
  var currentNear = null;
  var playerDir = 1;

  function initRPG() {
    mapEl = $("#rpg-map");
    playerEl = $("#rpg-player");
    playerInner = $(".rpg-player-inner");

    if(!mapEl) return;
    window.addEventListener("keydown", rpgKeyDown);
    window.addEventListener("keyup", rpgKeyUp);
    if(!rpgLoopId) rpgLoopId = requestAnimationFrame(rpgGameLoop);
  }

  function stopRPG() {
    window.removeEventListener("keydown", rpgKeyDown);
    window.removeEventListener("keyup", rpgKeyUp);
    if(rpgLoopId) cancelAnimationFrame(rpgLoopId);
    rpgLoopId = null;
    keys = {};
  }

  function rpgKeyDown(e) {
    if(!rpgModeActive) return;
    keys[e.key.toLowerCase()] = true;
    
    if (e.key === "Enter" && currentNear) {
      window.location.href = currentNear.getAttribute("data-url");
    }
    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].indexOf(e.key) > -1) {
      e.preventDefault();
    }
  }
  function rpgKeyUp(e) { keys[e.key.toLowerCase()] = false; }

  function rpgGameLoop() {
    if (!rpgModeActive) return;

    var dx = 0, dy = 0;
    if (keys["arrowup"] || keys["w"]) dy = -speed;
    if (keys["arrowdown"] || keys["s"]) dy = speed;
    if (keys["arrowleft"] || keys["a"]) dx = -speed;
    if (keys["arrowright"] || keys["d"]) dx = speed;

    var nextX = pX + dx;
    var nextY = pY + dy;
    
    if (nextX < 24) nextX = 24;
    if (nextX > 1576) nextX = 1576;
    if (nextY < 32) nextY = 32;
    if (nextY > 1568) nextY = 1568;

    pX = nextX;
    pY = nextY;

    var isMoving = (dx !== 0 || dy !== 0);
    if (dx < 0) playerDir = -1;
    else if (dx > 0) playerDir = 1;

    if (isMoving) playerInner.classList.add("is-walking");
    else playerInner.classList.remove("is-walking");

    playerEl.style.transform = "translate(" + pX + "px, " + pY + "px)";
    playerInner.style.transform = "scaleX(" + playerDir + ")";

    var camX = (window.innerWidth / 2) - pX - 24;
    var camY = (window.innerHeight / 2) - pY - 32;
    mapEl.style.transform = "translate(" + camX + "px, " + camY + "px)";

    var foundNear = null;
    $$(".rpg-obj").forEach(function(objEl) {
      var parentRect = objEl.parentElement.getBoundingClientRect();
      var mapRect = mapEl.getBoundingClientRect();
      var objX = (parentRect.left - mapRect.left) + parseInt(getComputedStyle(objEl).getPropertyValue('--ox')); 
      var objY = (parentRect.top - mapRect.top) + parseInt(getComputedStyle(objEl).getPropertyValue('--oy')); 
      
      var dist = Math.sqrt(Math.pow(pX - objX, 2) + Math.pow(pY - objY, 2));
      if (dist < 110) { 
        if (!objEl.classList.contains("is-near")) objEl.classList.add("is-near");
        foundNear = objEl;
      } else {
        if (objEl.classList.contains("is-near")) objEl.classList.remove("is-near");
      }
    });
    currentNear = foundNear;
    rpgLoopId = requestAnimationFrame(rpgGameLoop);
  }

  /* =====================================================================
     ANIMACIONES: Contadores, Reveal y Typewriter
     ===================================================================== */
  
  var io = new IntersectionObserver(function (es) { es.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("is-in"); io.unobserve(en.target); } }); }, { threshold: 0.12, rootMargin: "0px 0px -10% 0px" });
  $$("[data-reveal]").forEach(function (el) { io.observe(el); });

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

  var CH = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%&/";
  function scramble(el) {
    var target = el.dataset.text || el.textContent, frame = 0;
    var q = target.split("").map(function (c, i) { return { c: c, s: Math.floor(Math.random() * 12), e: Math.floor(Math.random() * 12) + 14 + (i * 2.5) }; });
    (function tick() {
      var out = "", done = 0;
      q.forEach(function (o) {
        if (frame >= o.e) { out += o.c; done++; }
        else if (frame >= o.s) out += CH[Math.floor(Math.random() * CH.length)];
        else out += " ";
      });
      el.textContent = out;
      if (done !== q.length) { frame++; requestAnimationFrame(tick); }
    })();
  }
  if (!reduce) setTimeout(function () { $$(".hero__name-line").forEach(scramble); }, 550);

  var termBody = $("#termBody"), termStatus = $("#termStatus"), termBlock = $("#terminalBlock");
  if (termBody && termBlock) {
    var lines = ["whoami → hugo_signes", "cat ~/dam/plan.md → IA aplicada a industria", "git log --oneline → smx · vae · erasmus · dam", "echo $SIGUIENTE → especialización en IA"];
    if (reduce) { termBody.innerHTML = '<span class="prompt">$</span> ' + lines[0]; } else {
      var typeStarted = false;
      var termObserver = new IntersectionObserver(function(entries) {
        if(entries[0].isIntersecting && !typeStarted) { typeStarted = true; startTyping(); termObserver.disconnect(); }
      }, { threshold: 0.5 });
      termObserver.observe(termBlock);
      function startTyping() {
        var li = 0, ci = 0, del = false;
        (function type() {
          var line = lines[li], shown = line.slice(0, ci);
          termBody.innerHTML = '<span class="prompt">$</span> ' + shown + '<span class="caret"></span>';
          if (termStatus) termStatus.textContent = "ejecutando";
          if (!del) { ci++; if (ci > line.length) { del = true; setTimeout(type, 1800); return; } }
          else { ci--; if (ci < 0) { del = false; ci = 0; li = (li + 1) % lines.length; } }
          setTimeout(type, del ? 20 : 46 + Math.random() * 40);
        })();
      }
    }
  }

  var tabs = $$(".tabs__btn");
  tabs.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var panelId = btn.dataset.tab;
      var parent = btn.closest(".future__grid") || document;
      $$(".tabs__btn", parent).forEach(function (x) { x.classList.remove("is-active"); x.setAttribute("aria-selected", "false"); });
      $$(".tabs__panel", parent).forEach(function (p) { p.hidden = true; p.classList.remove("is-active"); });
      btn.classList.add("is-active"); btn.setAttribute("aria-selected", "true");
      var p = $("#" + panelId, parent) || parent.querySelector("#" + panelId); 
      if(p) { p.hidden = false; p.classList.add("is-active"); }
    });
  });

  var toast = $("#toast"), copyBtn = $("#copy"), mailEl = $("#mail");
  if(copyBtn && mailEl) {
    copyBtn.addEventListener("click", function () {
      var mail = mailEl.textContent.trim();
      function ok() { if(toast){toast.classList.add("is-show"); setTimeout(function () { toast.classList.remove("is-show"); }, 2200);} }
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(mail).then(ok, function () { location.href = "mailto:" + mail; });
      else location.href = "mailto:" + mail;
    });
  }
})();