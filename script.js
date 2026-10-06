/* =====================================================================
   HUGO SIGNES SISTERNES · SCRIPT PRINCIPAL (Optimizado para Rúbrica)
   ===================================================================== */
(function () {
  "use strict";
  var GEMINI_API_KEY = "";

  var reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var $  = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  var knowledgeBase = [
    {
      keywords: ["hola", "buenas", "hey", "saludo", "que tal", "inicio"],
      answer: "Hola, soy ECHO-AI. Estoy aquí para contarte quién es Hugo, qué stack usa y cómo funciona su proyecto 3D con estilo cyberpunk."
    },
    {
      keywords: ["hugo", "quien es", "presentate", "perfil", "sobre ti"],
      answer: "Hugo Signes Sisternes es un estudiante de DAM con base en SMX, con interés claro en la IA, el desarrollo web y la creación de experiencias digitales inmersivas. Tiene visión de producto, técnica y estética, y quiere convertir lo complejo en interfaces con carácter."
    },
    {
      keywords: ["smx", "dam", "formacion", "estudios", "estudia"],
      answer: "Su tránsito parte de SMX, donde se forma en desarrollo web, diseño y lógica de proyecto, y ahora continúa en DAM con foco en programación, arquitecturas y soluciones más complejas. Es un perfil híbrido: técnica, visual y productivo."
    },
    {
      keywords: ["stack", "tecnologias", "tecnología", "tech", "languajes", "lenguajes", "stack tecnico"],
      answer: "El stack de Hugo combina HTML, CSS, JavaScript, Three.js, APIs web, UI/UX y lógica front-end con un ojo muy fuerte hacia la experiencia de usuario. También trabaja con datos en tiempo real, integración de feeds y prototipado creativo."
    },
    {
      keywords: ["three.js", "threejs", "metaverso", "3d", "juego 3d", "proyecto 3d", "juego3d"],
      answer: "El proyecto 3D es una ciudad cyberpunk interactiva hecha con Three.js, con controles de primera persona, NPCs, hologramas, rutas urbanas y una ambientación que mezcla estética futurista con un enfoque de portafolio vivo. Es una web que funciona como experiencia, no solo como CV."
    },
    {
      keywords: ["open meteo", "meteo", "weather", "clima", "api"],
      answer: "Sí, Hugo integra APIs como Open-Meteo para traer el clima en tiempo real y mostrar una capa viva de contexto digital en la web. En ese mismo espíritu, también ha jugado con feeds RSS de Xataka para conectar el portafolio con noticias de tecnología."
    },
    {
      keywords: ["xataka", "rss", "feed", "noticias", "tech news"],
      answer: "La idea es muy clara: dar vida a la ciudad y a los NPCs con noticias reales del entorno tecnológico. Con RSS y APIs, el proyecto deja de ser estático y empieza a sentirse como un mundo conectado, un poco más vivo y narrativo."
    },
    {
      keywords: ["ia", "inteligencia artificial", "ai", "agente", "chatbot"],
      answer: "La IA para Hugo no es solo una moda; es una herramienta para crear experiencias con personalidad, automatizar contextos y dar un tono más inteligente al portafolio. Por eso el chatbot ECHO-AI tiene un punto geek, ágil y muy orientado a la narrativa del proyecto."
    },
    {
      keywords: ["futuro", "objetivo", "plan", "siguiente", "proximo", "próximo"],
      answer: "El futuro de Hugo pasa por IA aplicada, sistemas más inteligentes y una especialización más fuerte en desarrollo con impacto real. La mezcla de diseño, código y visión de producto es la que más le distingue en este momento."
    },
    {
      keywords: ["porque", "por que", "valor", "diferencia", "diferente"],
      answer: "Lo que lo hace especial es que no se limita a mostrar contenido: construye una experiencia. Hay narrativa, estética, interactividad, APIs y un enfoque muy claro de producto digital. No es un portfolio plano; es una identidad viva."
    },
    {
      keywords: ["gracias", "adios", "bye", "hasta luego", "chau"],
      answer: "Gracias por preguntar. Si quieres, puedo seguir con una versión más técnica, más creativa o más geek del proyecto de Hugo."
    }
  ];

  function normalizeQuestion(text) {
    return String(text || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
  }

  window.askHugoAI = async function askHugoAI(userQuestion) {
    var question = normalizeQuestion(userQuestion);
    if (!question) return "Pregunta corta, por favor. Puedo hablarte de Hugo, su stack, su IA y su proyecto 3D.";

    var bestMatch = null;
    var bestScore = 0;

    for (var i = 0; i < knowledgeBase.length; i++) {
      var entry = knowledgeBase[i];
      var score = 0;
      for (var j = 0; j < entry.keywords.length; j++) {
        if (question.indexOf(entry.keywords[j]) !== -1) score += 2;
      }
      if (question.length > 0 && entry.answer.length > 0 && score > bestScore) {
        bestScore = score;
        bestMatch = entry;
      }
    }

    if (bestMatch) return bestMatch.answer;

    return "Estoy preparado para hablar de Hugo, su formación, su stack, la IA y el metaverso 3D. Intenta preguntarme por SMX, DAM, Three.js, APIs o IA.";
  };

  function bindChatWidget() {
    var launcher = $("#chatLauncher");
    var panel = $("#aiChatPanel");
    var form = $("#aiChatForm");
    var input = $("#aiChatInput");
    var messages = $("#aiChatMessages");
    var closeBtn = $("[data-close-chat]");

    if (!launcher || !panel || !form || !input || !messages) return;

    if (closeBtn) {
      closeBtn.addEventListener("click", function () {
        panel.hidden = true;
      });
    }

    function appendMessage(role, text) {
      var msg = document.createElement("div");
      msg.className = "chat-message chat-message--" + role;
      msg.textContent = text;
      messages.appendChild(msg);
      messages.scrollTop = messages.scrollHeight;
    }

    launcher.addEventListener("click", function () {
      panel.hidden = !panel.hidden;
      if (!panel.hidden) {
        input.focus();
      }
    });

    form.addEventListener("submit", async function (event) {
      event.preventDefault();
      var question = input.value.trim();
      if (!question) return;

      appendMessage("user", question);
      input.value = "";
      input.disabled = true;
      appendMessage("bot", "ECHO-AI está pensando...");

      try {
        var reply = await window.askHugoAI(question);
        var lastBotMessage = messages.lastElementChild;
        if (lastBotMessage && lastBotMessage.classList.contains("chat-message--bot")) {
          lastBotMessage.textContent = reply;
        } else {
          appendMessage("bot", reply);
        }
      } catch (e) {
        var lastBotMessage = messages.lastElementChild;
        if (lastBotMessage && lastBotMessage.classList.contains("chat-message--bot")) {
          lastBotMessage.textContent = "ECHO-AI está en pausa técnica.";
        } else {
          appendMessage("bot", "ECHO-AI está en pausa técnica.");
        }
      } finally {
        input.disabled = false;
        input.focus();
      }
    });
  }

  var fine   = matchMedia("(pointer:fine)").matches;
  var root   = document.documentElement;
  bindChatWidget();

  /* ---------- Sincronización de enlaces y persistencia ---------- */
  function syncLinks() {
    var t = root.getAttribute("data-theme");
    var s = root.getAttribute("data-style");
    
    $$(".logo, .topnav a, .rail__nav a, .hero__cta a, .mnav a").forEach(function(a) {
      var href = a.getAttribute("href");
      if (!href || href.startsWith("http") || href.startsWith("mailto:")) return;
      var base = href.split("?")[0].split("#")[0];
      var hash = href.includes("#") ? "#" + href.split("#")[1] : "";
      if (base) a.setAttribute("href", base + "?theme=" + t + "&style=" + s + hash);
    });
  }

  /* ---------- Menú Superior dinámico ---------- */
  var topbar = $(".topbar");
  function onScroll() {
    var st = window.scrollY || window.pageYOffset;
    if(topbar) topbar.classList.toggle("is-scrolled", st > 30);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Clima en tiempo real ---------- */
  function weatherIconFromCode(code) {
    var map = {
      0: "☀️", 1: "🌤️", 2: "⛅", 3: "☁️", 45: "🌫️", 48: "🌫️",
      51: "🌦️", 53: "🌦️", 55: "🌧️", 56: "🌧️", 57: "🌧️",
      61: "🌦️", 63: "🌧️", 65: "🌧️", 66: "🌧️", 67: "🌧️",
      71: "❄️", 73: "❄️", 75: "❄️", 77: "❄️", 80: "🌦️",
      81: "🌧️", 82: "⛈️", 85: "🌨️", 86: "🌨️", 95: "⛈️",
      96: "⛈️", 99: "⛈️"
    };
    return map[code] || "☁️";
  }

  function loadWeather() {
    var tempEl = $("#weather-temp");
    var iconEl = $("#weather-icon");
    var cityEl = $("#weather-city");
    if (!tempEl || !iconEl || !cityEl) return;

    var city = "Madrid";
    var geocodeUrl = "https://geocoding-api.open-meteo.com/v1/search?name=" + encodeURIComponent(city) + "&count=1&language=es&format=json";

    fetch(geocodeUrl)
      .then(function (res) { return res.json(); })
      .then(function (geo) {
        var result = geo && geo.results && geo.results[0];
        if (!result) throw new Error("Ciudad no encontrada");
        cityEl.textContent = result.name || city;
        var weatherUrl = "https://api.open-meteo.com/v1/forecast?latitude=" + result.latitude + "&longitude=" + result.longitude + "&current=temperature_2m,weather_code&timezone=auto&language=es";
        return fetch(weatherUrl);
      })
      .then(function (res) { return res.json(); })
      .then(function (weather) {
        var current = weather && weather.current;
        if (!current) throw new Error("No hay datos meteorológicos");
        iconEl.textContent = weatherIconFromCode(current.weather_code);
        tempEl.textContent = Math.round(current.temperature_2m) + "°C";
      })
      .catch(function () {
        cityEl.textContent = city;
        iconEl.textContent = "☁️";
        tempEl.textContent = "Clima no disponible";
      });
  }
  loadWeather();

  /* ---------- Gestión de Tema (Claro / Oscuro con persistencia) ---------- */
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

  /* ---------- Selector de Estilos Visuales ---------- */
  var sBtn = $("#styleToggle"), sPanel = $("#stylePanel"), sOpts = $$("[data-set-style]");
  
  function applyStyle(s) {
    root.setAttribute("data-style", s);
    try { localStorage.setItem("hugo-style", s); } catch (e) {}
    
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

  /* ---------- Navegación Activa Automática ---------- */
  var path = window.location.pathname;
  var page = path.split("/").pop();
  if(page === "" || page === "index.html") page = "index.html";
  $$(".topnav a, .rail__nav a").forEach(function(a) {
    var href = a.getAttribute("href").split("?")[0];
    if (href === page) a.classList.add("is-active");
    else a.classList.remove("is-active");
  });

  /* ---------- Cursor personalizado y estela ---------- */
  var cur = $(".cursor"), ring = $(".cursor-ring"), trail = $(".trail");
  var mx = innerWidth / 2, my = innerHeight / 2, rx = mx, ry = my, lastTrail = 0;
  function updateCursor() {
    var s = root.getAttribute("data-style");
    document.body.classList.toggle("has-cursor", fine && !reduce && s !== "professional");
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

  /* ---------- Animaciones de Intersección (Reveal & Contadores) ---------- */
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

  /* ---------- Efecto Scramble en Títulos ---------- */
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

  /* ---------- Terminal Simulada Interactiva ---------- */
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

  /* ---------- Pestañas Interactivas ---------- */
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

  /* ---------- Copapapeles y Toast ---------- */
  var toast = $("#toast"), copyBtn = $("#copy"), mailEl = $("#mail");
  if(copyBtn && mailEl) {
    copyBtn.addEventListener("click", function () {
      var mail = mailEl.textContent.trim();
      function ok() { if(toast){toast.classList.add("is-show"); setTimeout(function () { toast.classList.remove("is-show"); }, 2200);} }
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(mail).then(ok, function () { location.href = "mailto:" + mail; });
      else location.href = "mailto:" + mail;
    });
  }

  /* ---------- Menú Móvil / Hamburguesa ---------- */
  var tools = $(".tools"), topnavEl = $(".topnav");
  if (tools && topnavEl) {
    var burger = document.createElement("button");
    burger.className = "burger"; burger.setAttribute("aria-label", "Abrir menú de navegación");
    burger.setAttribute("aria-expanded", "false"); burger.setAttribute("aria-controls", "mnav");
    burger.innerHTML = "<span></span><span></span><span></span>";
    tools.appendChild(burger);
    var mnav = document.createElement("nav");
    mnav.id = "mnav"; mnav.className = "mnav"; mnav.hidden = true; mnav.setAttribute("aria-label", "Menú móvil");
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

  /* ---------- Progreso del Roadmap ---------- */
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

  /* ---------- Validación Real de Formularios ---------- */
  var form = $(".real-form");
  if (form) {
    var status = document.createElement("p");
    status.className = "form-status"; status.setAttribute("role", "status");
    form.appendChild(status);
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!form.checkValidity()) { form.reportValidity(); return; }
      var d = new FormData(form);
      if (d.get("website")) return; // Honeypot antispam
      var to = mailEl ? mailEl.textContent.trim() : "";
      var endpoint = form.getAttribute("action") || "";
      if (/TU_ID_AQUI/.test(endpoint)) {
        location.href = "mailto:" + to + "?subject=" + encodeURIComponent("Mensaje de " + d.get("name")) +
          "&body=" + encodeURIComponent(d.get("message") + "\n\n— " + d.get("name") + " (" + d.get("email") + ")");
        status.textContent = "Se ha abierto tu programa de correo con el mensaje listo para enviar.";
        return;
      }
      var btn = $("button[type=submit]", form); btn.disabled = true; status.textContent = "Enviando mensaje…";
      fetch(endpoint, { method: "POST", body: d, headers: { Accept: "application/json" } })
        .then(function (r) { if (!r.ok) throw new Error(); form.reset(); status.textContent = "¡Mensaje enviado con éxito! Te responderé pronto."; })
        .catch(function () { status.textContent = "No se pudo conectar. Escríbeme directamente a " + to + "."; })
        .then(function () { btn.disabled = false; });
    });
  }

  /* ---------- Efecto de diálogo estilo RPG (Undertale) ---------- */
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