/* =====================================================================
   HUGO SIGNES SISTERNES · SCRIPT COMPLETO + MOTOR DEVICE_KNIGHT (CANVAS)
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
    if (s === "rpg") { try { s = localStorage.getItem("hugo-style") || "unico"; } catch (e) { s = "unico"; } }
    
    $$(".logo, .topnav a, .rail__nav a, .hero__cta a, .mnav a").forEach(function(a) {
      var href = a.getAttribute("href");
      if (!href || href.startsWith("http") || href.startsWith("mailto:")) return;
      var base = href.split("?")[0].split("#")[0];
      var hash = href.includes("#") ? "#" + href.split("#")[1] : "";
      if (base) a.setAttribute("href", base + "?theme=" + t + "&style=" + s + hash);
    });
  }

  /* ---------- Menú Superior (Fondo al scrollear arreglado) ---------- */
  var topbar = $(".topbar");
  function onScroll() {
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
      
      try {
        var urlObj = new URL(window.location);
        urlObj.searchParams.set('theme', n);
        window.history.replaceState({}, '', urlObj);
      } catch (e) {}

      syncTheme();
    });
  }

  /* ---------- Selector de estilo & Toggle RPG (Canvas) ---------- */
  var sBtn = $("#styleToggle"), sPanel = $("#stylePanel"), sOpts = $$("[data-set-style]");
  var btnExitRpg = $("#btn-exit-rpg");
  
  function applyStyle(s) {
    root.setAttribute("data-style", s);
    if (s !== "rpg") { try { localStorage.setItem("hugo-style", s); } catch (e) {} }
    
    try {
      var urlObj = new URL(window.location);
      urlObj.searchParams.set('style', s);
      window.history.replaceState({}, '', urlObj);
    } catch (e) {}

    sOpts.forEach(function (b) {
      var on = b.dataset.setStyle === s;
      b.classList.toggle("is-active", on);
      b.setAttribute("aria-checked", on);
    });
    
    dialogFx(s);
    updateCursor();
    syncLinks(); 

    var rpgContainer = $("#rpg-mode");
    var mainWeb = $("#mainWeb");
    
    if (s === "rpg") {
      if (rpgContainer) rpgContainer.hidden = false;
      if (mainWeb) mainWeb.hidden = true; 
      if (typeof window.initDeviceKnightGame === "function") window.initDeviceKnightGame();
    } else {
      if (rpgContainer) rpgContainer.hidden = true;
      if (mainWeb) mainWeb.hidden = false;
      if (typeof window.stopDeviceKnightGame === "function") window.stopDeviceKnightGame();
    }
  }
  
  var urlParams = new URLSearchParams(window.location.search);
  var initialStyle = urlParams.get('style') || localStorage.getItem('hugo-style') || "unico";
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
     MOTOR DE JUEGO TIPO DEVICE_KNIGHT (EN CANVAS)
     ===================================================================== */
  var canvas, ctx;
  var gameRunning = false;
  var animId = null;
  var pX = 320, pY = 240, pSize = 10, pSpeed = 3.5;
  var hp = 20, maxHp = 20, score = 0;
  var bullets = [];
  var keys = { up: false, down: false, left: false, right: false, z: false, x: false };
  var frameCount = 0;
  var shieldActive = false, shieldCd = 0;

  window.initDeviceKnightGame = function() {
    canvas = document.getElementById("game");
    if (!canvas) return;
    ctx = canvas.getContext("2d");
    ctx.imageSmoothingEnabled = false;

    resetGameData();
    gameRunning = true;
    
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    setupTouchControls();

    if (!animId) animId = requestAnimationFrame(gameLoop);
  };

  window.stopDeviceKnightGame = function() {
    gameRunning = false;
    if (animId) cancelAnimationFrame(animId);
    animId = null;
    window.removeEventListener("keydown", handleKeyDown);
    window.removeEventListener("keyup", handleKeyUp);
  };

  window.exitRpgGame = function() {
    stopDeviceKnightGame();
    var stored = localStorage.getItem('hugo-style') || "unico";
    applyStyle(stored === "rpg" ? "unico" : stored);
  };

  function resetGameData() {
    hp = 20; score = 0; pX = 320; pY = 240; bullets = []; frameCount = 0;
  }

  function handleKeyDown(e) {
    if (!gameRunning) return;
    if (e.key === "ArrowUp" || e.key === "w") keys.up = true;
    if (e.key === "ArrowDown" || e.key === "s") keys.down = true;
    if (e.key === "ArrowLeft" || e.key === "a") keys.left = true;
    if (e.key === "ArrowRight" || e.key === "d") keys.right = true;
    if (e.key === "z") keys.z = true;
    if (e.key === "x") keys.x = true;
    if (e.key === "r" || e.key === "R") resetGameData();
  }

  function handleKeyUp(e) {
    if (e.key === "ArrowUp" || e.key === "w") keys.up = false;
    if (e.key === "ArrowDown" || e.key === "s") keys.down = false;
    if (e.key === "ArrowLeft" || e.key === "a") keys.left = false;
    if (e.key === "ArrowRight" || e.key === "d") keys.right = false;
    if (e.key === "z") keys.z = false;
    if (e.key === "x") keys.x = false;
  }

  function setupTouchControls() {
    var dpad = document.getElementById("dpad");
    if (!dpad || dpad.dataset.initialized) return;
    dpad.dataset.initialized = "true";

    dpad.addEventListener("pointermove", handleDpadTouch);
    dpad.addEventListener("pointerdown", handleDpadTouch);
    dpad.addEventListener("pointerup", function() {
      keys.up = keys.down = keys.left = keys.right = false;
    });

    function handleDpadTouch(e) {
      e.preventDefault();
      var rect = dpad.getBoundingClientRect();
      var x = e.clientX - rect.left - rect.width / 2;
      var y = e.clientY - rect.top - rect.height / 2;
      keys.up = y < -20; keys.down = y > 20;
      keys.left = x < -20; keys.right = x > 20;
    }

    var bindBtn = function(id, keyName) {
      var el = document.getElementById(id);
      if (!el) return;
      el.addEventListener("pointerdown", function(e) { e.preventDefault(); el.classList.add("down"); keys[keyName] = true; });
      el.addEventListener("pointerup", function() { el.classList.remove("down"); keys[keyName] = false; });
    };

    bindBtn("btnZ", "z");
    bindBtn("btnX", "x");
    
    var btnR = document.getElementById("btnR");
    if(btnR) {
      btnR.addEventListener("pointerdown", function(e) { e.preventDefault(); resetGameData(); });
    }
  }

  function updateGame() {
    if (!gameRunning) return;
    frameCount++;

    if (keys.up && pY > 60) pY -= pSpeed;
    if (keys.down && pY < 420) pY += pSpeed;
    if (keys.left && pX > 40) pX -= pSpeed;
    if (keys.right && pX < 600) pX += pSpeed;

    if (keys.x && shieldCd <= 0) { shieldActive = true; shieldCd = 50; }
    if (shieldActive) { shieldCd--; if (shieldCd <= 25) shieldActive = false; }

    if (keys.z && frameCount % 12 === 0) {
      bullets.push({ x: pX, y: pY - 8, vx: 0, vy: -6, type: 'player' });
    }

    if (frameCount % 25 === 0) {
      var angle = Math.random() * Math.PI * 2;
      bullets.push({
        x: 320 + Math.cos(angle) * 120, y: 100 + Math.sin(angle) * 40,
        vx: (Math.random() - 0.5) * 3, vy: Math.random() * 2 + 1, type: 'enemy'
      });
    }

    for (var i = bullets.length - 1; i >= 0; i--) {
      var b = bullets[i];
      b.x += b.vx; b.y += b.vy;

      if (b.type === 'enemy') {
        var dist = Math.hypot(b.x - pX, b.y - pY);
        if (dist < pSize + 4) {
          if (!shieldActive) { hp -= 2; if (hp <= 0) hp = 0; }
          else { score += 10; }
          bullets.splice(i, 1);
          continue;
        }
      }

      if (b.y < 0 || b.y > 480 || b.x < 0 || b.x > 640) { bullets.splice(i, 1); }
    }

    score++;
    var hud = document.getElementById("hud");
    if (hud) hud.textContent = "HP: " + hp + "/" + maxHp + " | SCORE: " + score + " | Z: DISPARAR X: ESCUDO";
  }

  function drawGame() {
    if (!ctx) return;
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, 640, 480);

    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 2;
    ctx.strokeRect(30, 40, 580, 400);

    ctx.fillStyle = shieldActive ? "#33ccff" : "#ff0000";
    ctx.beginPath();
    ctx.arc(pX, pY, pSize, 0, Math.PI * 2);
    ctx.fill();

    for (var i = 0; i < bullets.length; i++) {
      var b = bullets[i];
      ctx.fillStyle = b.type === 'player' ? "#ffff00" : "#ff5533";
      ctx.fillRect(b.x - 3, b.y - 3, 6, 6);
    }
  }

  function gameLoop() {
    if (!gameRunning) return;
    updateGame();
    drawGame();
    animId = requestAnimationFrame(gameLoop);
  }

  /* =====================================================================
     ANIMACIONES: Contadores, Reveal, Terminal y Diálogos
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

  var tools = $(".tools"), topnavEl = $(".topnav");
  if (tools && topnavEl) {
    var burger = document.createElement("button");
    burger.className = "burger"; burger.setAttribute("aria-label", "Abrir menú");
    burger.setAttribute("aria-expanded", "false"); burger.setAttribute("aria-controls", "mnav");
    burger.innerHTML = "<span></span><span></span><span></span>";
    tools.appendChild(burger);
    var mnav = document.createElement("nav");
    mnav.id = "mnav"; mnav.className = "mnav"; mnav.hidden = true; mnav.setAttribute("aria-label", "Menú");
    mnav.innerHTML = topnavEl.innerHTML;
    var homeA = document.createElement("a");
    homeA.href = "index.html"; homeA.textContent = "Inicio";
    if (page === "index.html") homeA.className = "is-active";
    mnav.insertBefore(homeA, mnav.firstChild);
    document.body.appendChild(mnav);
    var setMenu = function (o) { mnav.hidden = !o; burger.setAttribute("aria-expanded", String(o)); document.body.classList.toggle("menu-open", o); };
    burger.addEventListener("click", function (e) { e.stopPropagation(); setMenu(mnav.hidden); });
    mnav.addEventListener("click", function (e) { if (e.target.closest("a")) setMenu(false); });
    addEventListener("keydown", function (e) { if (e.key === "Escape") setMenu(false); });
    syncLinks();
  }
  $$(".rail a").forEach(function (a) { a.tabIndex = -1; });

  var roadEl = $("#road"), roadFill = $("#roadFill");
  if (roadEl && roadFill) {
    var rsteps = $$(".road__step", roadEl);
    var rio = new IntersectionObserver(function (es) {
      if (!es[0].isIntersecting) return;
      rio.disconnect();
      var i = 0;
      (function go() {
        roadFill.style.width = (i / (rsteps.length - 1) * 88) + "%";
        rsteps[i].classList.add("on");
        if (++i < rsteps.length) setTimeout(go, reduce ? 0 : 700);
      })();
    }, { threshold: 0.5 });
    rio.observe(roadEl);
  }

  var tabBar = $(".tabs__bar");
  if (tabBar) tabBar.addEventListener("keydown", function (e) {
    var i = tabs.indexOf(document.activeElement);
    if (i < 0 || (e.key !== "ArrowRight" && e.key !== "ArrowLeft")) return;
    var n = tabs[(i + (e.key === "ArrowRight" ? 1 : -1) + tabs.length) % tabs.length];
    n.focus(); n.click();
  });

  var form = $(".real-form");
  if (form) {
    var status = document.createElement("p");
    status.className = "form-status"; status.setAttribute("role", "status");
    form.appendChild(status);
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!form.checkValidity()) { form.reportValidity(); return; }
      var d = new FormData(form);
      if (d.get("website")) return;
      var to = mailEl ? mailEl.textContent.trim() : "";
      var endpoint = form.getAttribute("action") || "";
      if (/TU_ID_AQUI/.test(endpoint)) {
        location.href = "mailto:" + to + "?subject=" + encodeURIComponent("Mensaje de " + d.get("name")) +
          "&body=" + encodeURIComponent(d.get("message") + "\n\n— " + d.get("name") + " (" + d.get("email") + ")");
        status.textContent = "Se ha abierto tu programa de correo con el mensaje listo para enviar.";
        return;
      }
      var btn = $("button[type=submit]", form); btn.disabled = true; status.textContent = "Enviando…";
      fetch(endpoint, { method: "POST", body: d, headers: { Accept: "application/json" } })
        .then(function (r) { if (!r.ok) throw new Error(); form.reset(); status.textContent = "Mensaje enviado. Te responderé pronto."; })
        .catch(function () { status.textContent = "No se pudo enviar. Escríbeme a " + to + "."; })
        .then(function () { btn.disabled = false; });
    });
  }

  var dlgTimer = null;
  function dialogFx(s) {
    var el = $(".hero__phrase") || $(".section__sub");
    if (!el) return;
    clearTimeout(dlgTimer);
    if (el.dataset.orig) { el.innerHTML = el.dataset.orig; el.style.minHeight = ""; }
    else el.dataset.orig = el.innerHTML;
    if (s !== "gamer" || reduce) return;
    el.style.minHeight = el.offsetHeight + "px";
    var w = document.createTreeWalker(el, NodeFilter.SHOW_TEXT), nodes = [], n;
    while ((n = w.nextNode())) nodes.push({ n: n, t: n.nodeValue });
    nodes.forEach(function (o) { o.n.nodeValue = ""; });
    var ni = 0, ci = 0;
    (function step() {
      if (ni >= nodes.length) return;
      var o = nodes[ni]; ci++;
      o.n.nodeValue = o.t.slice(0, ci);
      if (ci >= o.t.length) { ni++; ci = 0; }
      dlgTimer = setTimeout(step, 40);
    })();
  }
})();