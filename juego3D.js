/* =====================================================================
   HUGO SIGNES SISTERNES · METAVERSO URBANO 3D
   Clima en vivo (Open-Meteo) + NPCs con Diálogos (API Noticias Ready)
   ===================================================================== */
(function () {
  "use strict";

  var container = document.getElementById("webgl-container");
  var overlay = document.getElementById("instructions-overlay");
  var startBtn = document.getElementById("startBtn");
  var qualityToggle = document.getElementById("qualityToggle");
  var qualityPanel = document.getElementById("qualityPanel");
  var qualityButtons = Array.prototype.slice.call(document.querySelectorAll(".quality-option"));

  if (!container) return;

  var qualityProfiles = {
    high: {
      label: "Alta",
      pixelRatio: Math.min(window.devicePixelRatio || 1, 1.8),
      shadows: true,
      rainCount: 1600,
      fogDensity: 0.011,
      nasaEnabled: true,
      rainOpacity: 0.7,
      sunLight: 1.4,
      shadowSize: 2048
    },
    medium: {
      label: "Media",
      pixelRatio: Math.min(window.devicePixelRatio || 1, 1.2),
      shadows: true,
      rainCount: 700,
      fogDensity: 0.014,
      nasaEnabled: true,
      rainOpacity: 0.5,
      sunLight: 1.1,
      shadowSize: 1024
    },
    low: {
      label: "Baja",
      pixelRatio: Math.min(window.devicePixelRatio || 1, 0.9),
      shadows: false,
      rainCount: 220,
      fogDensity: 0.02,
      nasaEnabled: false,
      rainOpacity: 0.15,
      sunLight: 0.8,
      shadowSize: 512
    }
  };

  var qualityState = {
    current: (localStorage.getItem("hugo-3d-quality") || "high").toLowerCase()
  };

  function applyQualityProfile(profileName) {
    var profile = qualityProfiles[profileName] || qualityProfiles.high;
    qualityState.current = profileName;
    if (typeof localStorage !== "undefined") {
      localStorage.setItem("hugo-3d-quality", profileName);
    }

    if (qualityToggle) {
      qualityToggle.setAttribute("aria-expanded", qualityPanel && qualityPanel.classList.contains("is-open") ? "true" : "false");
    }

    if (qualityButtons && qualityButtons.length) {
      qualityButtons.forEach(function (btn) {
        var selected = btn.getAttribute("data-quality") === profileName;
        btn.classList.toggle("is-selected", selected);
      });
    }

    if (typeof renderer !== "undefined") {
      renderer.setPixelRatio(profile.pixelRatio);
      renderer.shadowMap.enabled = profile.shadows;
      renderer.shadowMap.type = profile.shadows ? THREE.PCFSoftShadowMap : THREE.BasicShadowMap;
    }

    if (typeof mainDirLight !== "undefined") {
      mainDirLight.intensity = profile.sunLight;
      mainDirLight.castShadow = profile.shadows;
      mainDirLight.shadow.mapSize.width = profile.shadowSize;
      mainDirLight.shadow.mapSize.height = profile.shadowSize;
    }

    if (typeof flashLight !== "undefined") {
      flashLight.intensity = profile.shadows ? flashLight.intensity || 0 : 0;
    }

    if (typeof nasaDisplay !== "undefined") {
      nasaDisplay.visible = !!(profile.nasaEnabled && nasaTexture);
    }

    if (typeof rainMat !== "undefined") {
      rainMat.opacity = profile.rainOpacity;
    }

    if (typeof scene !== "undefined" && typeof scene.fog !== "undefined") {
      scene.fog.density = profile.fogDensity;
    }

    if (typeof rebuildRainSystem !== "undefined") {
      rebuildRainSystem(profile.rainCount);
    }
  }

  function bindQualityMenu() {
    if (!qualityToggle || !qualityPanel) return;

    qualityToggle.addEventListener("click", function () {
      qualityPanel.classList.toggle("is-open");
      var isOpen = qualityPanel.classList.contains("is-open");
      qualityToggle.setAttribute("aria-expanded", String(isOpen));
    });

    qualityButtons.forEach(function (button) {
      button.addEventListener("click", function () {
        var next = button.getAttribute("data-quality") || "high";
        applyQualityProfile(next);
        qualityPanel.classList.remove("is-open");
        qualityToggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  bindQualityMenu();

  var loadingOverlay = document.createElement("div");
  loadingOverlay.id = "loading-overlay";
  loadingOverlay.style.cssText = `
    position: fixed; inset: 0; z-index: 99999; display: flex; align-items: center; justify-content: center;
    background: radial-gradient(circle at center, rgba(12,16,28,0.85), rgba(2,3,8,1));
    color: #fff; font-family: 'Space Grotesk', sans-serif; transition: opacity 0.5s ease, visibility 0.5s ease;
  `;
  loadingOverlay.innerHTML = `
    <div style="text-align:center; letter-spacing:0.18em; text-transform:uppercase;">
      <div style="width:110px;height:110px;margin:0 auto 1.2rem;border:2px solid rgba(255,255,255,0.2);border-radius:50%;position:relative;display:grid;place-items:center;box-shadow:0 0 30px rgba(228,23,43,0.25);">
        <div style="width:76px;height:76px;border:2px solid rgba(255,255,255,0.18);border-top-color:#e4172b;border-radius:50%;animation:spin 1.2s linear infinite;"></div>
      </div>
      <div style="font-size:0.72rem; opacity:0.8; margin-bottom:0.6rem;">Cargando ciudad 3D</div>
      <div style="font-size:1.4rem; font-weight:700; color:#e9e4d6;">HUGO METAVERSE</div>
    </div>
    <style>
      @keyframes spin { to { transform: rotate(360deg); } }
    </style>
  `;
  document.body.appendChild(loadingOverlay);

  function hideLoadingScreen() {
    loadingOverlay.style.opacity = "0";
    loadingOverlay.style.visibility = "hidden";
    setTimeout(function () {
      loadingOverlay.remove();
    }, 500);
  }

  // 1. Detección de tema y parámetros URL / localStorage
  var urlParams = new URLSearchParams(window.location.search);
  var currentStyle = urlParams.get('style') || localStorage.getItem('hugo-style') || document.documentElement.getAttribute("data-style") || "unico";
  var rootTheme = document.documentElement.getAttribute("data-theme") || "dark";

  var themeColors = {
    unico: { bg: 0x0A0A0C, fog: 0x121217, primary: 0xe4172b, secondary: 0xff3a4d, accent: 0xe9e4d6, grid: 0x1b1b22, npc: 0xff3a4d },
    professional: { bg: 0x0E1626, fog: 0x13203A, primary: 0x6ea8fe, secondary: 0xe03a4c, accent: 0xffb703, grid: 0x1b2c4c, npc: 0x6ea8fe },
    gamer: { bg: 0x000000, fog: 0x080808, primary: 0xff0000, secondary: 0xffff00, accent: 0x00c0ff, grid: 0x333333, npc: 0xffff00 },
    retro: { bg: 0x0d0d12, fog: 0x15151d, primary: 0x3ddc84, secondary: 0xff2e4c, accent: 0xffd23f, grid: 0x1d1d28, npc: 0x3ddc84 }
  };
  var palette = themeColors[currentStyle] || themeColors.unico;
  document.documentElement.setAttribute("data-style", currentStyle);

  // 2. Escena, Cámara y Renderizador
  var scene = new THREE.Scene();
  scene.background = new THREE.Color(palette.bg);
  scene.fog = new THREE.FogExp2(palette.fog, 0.011);

  var camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 2.2, 12);

  var renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.2;
  container.appendChild(renderer.domElement);

  // 3. SkyDome y Cuerpos Celestes
  var skyGeo = new THREE.SphereGeometry(350, 32, 15);
  var skyMat = new THREE.MeshBasicMaterial({ color: palette.bg, side: THREE.BackSide });
  var skyDome = new THREE.Mesh(skyGeo, skyMat);
  scene.add(skyDome);

  var nasaTextureLoader = new THREE.TextureLoader();
  var nasaTexture = null;
  var nasaDisplay = null;

  function createNasaDisplay() {
    var nasaScreenMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.9,
      side: THREE.DoubleSide,
      depthWrite: false
    });
    var nasaScreenMesh = new THREE.Mesh(new THREE.PlaneGeometry(14, 8), nasaScreenMat);
    nasaScreenMesh.position.set(0, 8, -76);
    nasaScreenMesh.rotation.y = 0;
    scene.add(nasaScreenMesh);
    nasaDisplay = nasaScreenMesh;
  }

  createNasaDisplay();

  function applyNasaTexture(texture) {
    if (!texture || !skyMat) return;
    nasaTexture = texture;
    texture.colorSpace = texture.colorSpace || THREE.SRGBColorSpace;
    if (texture.colorSpace) {
      texture.colorSpace = THREE.SRGBColorSpace;
    }
    if (texture.encoding) {
      texture.encoding = THREE.sRGBEncoding;
    }
    skyMat.color.setHex(0xffffff);
    skyMat.map = texture;
    skyMat.needsUpdate = true;
    if (nasaDisplay && nasaDisplay.material) {
      nasaDisplay.material.map = texture;
      nasaDisplay.material.needsUpdate = true;
      nasaDisplay.visible = true;
    }
  }

  async function fetchNasaApod() {
    var apiUrl = "https://api.nasa.gov/planetary/apod?api_key=DEMO_KEY";

    try {
      var res = await fetch(apiUrl);
      if (!res.ok) throw new Error("APOD no disponible");
      var data = await res.json();
      if (!data || (!data.hdurl && !data.url)) return;
      var imageUrl = data.hdurl || data.url;

      nasaTextureLoader.crossOrigin = "anonymous";
      nasaTextureLoader.load(
        imageUrl,
        function (texture) {
          applyNasaTexture(texture);
        },
        function (error) {
          console.warn("No se pudo cargar la foto de la NASA para el cielo:", error);
        },
        function () {
          console.warn("No se pudo cargar la foto de la NASA para el cielo.");
        }
      );
    } catch (err) {
      console.warn("APOD no disponible, usando cielo base:", err);
    }
  }

  var sunMoonMesh = new THREE.Mesh(
    new THREE.SphereGeometry(12, 32, 32),
    new THREE.MeshBasicMaterial({ color: palette.accent })
  );
  sunMoonMesh.position.set(60, 110, -120);
  scene.add(sunMoonMesh);

  // 4. Luces del Sistema
  var ambientLight = new THREE.AmbientLight(0xffffff, 0.45);
  scene.add(ambientLight);

  var mainDirLight = new THREE.DirectionalLight(palette.primary, 1.4);
  mainDirLight.position.set(60, 110, -120);
  mainDirLight.castShadow = true;
  mainDirLight.shadow.mapSize.width = 1024;
  mainDirLight.shadow.mapSize.height = 1024;
  scene.add(mainDirLight);

  // Luz de Relámpago (Efectos de Tormenta)
  var flashLight = new THREE.PointLight(0xffffff, 0, 300);
  flashLight.position.set(0, 80, -40);
  scene.add(flashLight);

  // Plaza con sol localizado: un punto del mapa más cálido y luminoso
  var sunZoneLight = new THREE.PointLight(0xffd98a, 1.4, 45, 2);
  sunZoneLight.position.set(-20, 12, -58);
  scene.add(sunZoneLight);

  var sunZoneMarker = new THREE.Mesh(
    new THREE.CircleGeometry(3.5, 32),
    new THREE.MeshBasicMaterial({ color: 0xffd98a, transparent: true, opacity: 0.9 })
  );
  sunZoneMarker.rotation.x = -Math.PI / 2;
  sunZoneMarker.position.set(-20, 0.05, -58);
  scene.add(sunZoneMarker);

  // 5. Sistema de Partículas de Lluvia
  var rainCount = 1600;
  function rebuildRainSystem(targetCount) {
    var safeCount = Math.max(50, Math.min(2000, targetCount || 1600));
    rainCount = safeCount;

    if (rainSystem) {
      scene.remove(rainSystem);
      rainSystem.geometry.dispose();
      rainSystem.material.dispose();
    }

    var rainGeo = new THREE.BufferGeometry();
    var rainPos = new Float32Array(rainCount * 3);
    for (var r = 0; r < rainCount * 3; r += 3) {
      rainPos[r] = (Math.random() - 0.5) * 260;
      rainPos[r + 1] = Math.random() * 95;
      rainPos[r + 2] = (Math.random() - 0.5) * 260 - 30;
    }
    rainGeo.setAttribute('position', new THREE.BufferAttribute(rainPos, 3));
    rainMat = new THREE.PointsMaterial({
      color: 0x88ccff,
      size: 0.32,
      transparent: true,
      opacity: 0.0
    });
    rainSystem = new THREE.Points(rainGeo, rainMat);
    scene.add(rainSystem);
  }
  var rainSystem = null;
  var rainMat = null;
  rebuildRainSystem(rainCount);

  // 6. SINCRONIZACIÓN DE CLIMA EN TIEMPO REAL (Open-Meteo) + NASA APOD
  var isStormy = false;
  async function syncWeatherWith3D() {
    var lat = 40.4168, lon = -3.7038; // Madrid
    var url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,is_day,weather_code&timezone=auto`;

    try {
      var res = await fetch(url);
      var data = await res.json();
      var current = data.current;
      if (!current) return;

      var isDay = current.is_day === 1;
      var code = current.weather_code;

      if (nasaDisplay) {
        nasaDisplay.visible = !!nasaTexture;
      }

      if (isDay) {
        skyMat.color.setHex(currentStyle === "professional" ? 0x224477 : 0x1a2b4c);
        scene.fog.color.setHex(0x1a2b4c);
        ambientLight.intensity = 0.9;
        mainDirLight.intensity = 1.6;
        sunMoonMesh.material.color.setHex(0xffdd66);
      } else {
        skyMat.color.setHex(palette.bg);
        scene.fog.color.setHex(palette.fog);
        ambientLight.intensity = 0.35;
        mainDirLight.intensity = 0.6;
        sunMoonMesh.material.color.setHex(0xe9e4d6);
      }

      var isSunnyZone = isDay && (code === 0 || code === 1 || code === 2 || code === 3 || code === 100 || code === 101);
      var isRainyZone = (code >= 51 && code <= 67) || (code >= 80 && code <= 82) || code >= 95;

      if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) {
        rainMat.opacity = 0.7;
        scene.fog.density = 0.018;
        isStormy = false;
      } else if (code >= 95) {
        rainMat.opacity = 0.95;
        scene.fog.density = 0.028;
        isStormy = true;
      } else if (code === 45 || code === 48) {
        rainMat.opacity = 0.0;
        scene.fog.density = 0.038;
        isStormy = false;
      } else {
        rainMat.opacity = 0.0;
        scene.fog.density = 0.011;
        isStormy = false;
      }

      sunZoneLight.intensity = isSunnyZone ? 1.8 : isRainyZone ? 0.3 : 0.8;
      sunZoneMarker.material.opacity = isSunnyZone ? 0.9 : isRainyZone ? 0.15 : 0.45;
    } catch (err) {
      console.warn("Clima local en fallback:", err);
    }

    await fetchNasaApod();
  }
  syncWeatherWith3D();

  async function fetchTechNews() {
    const rssUrl = "https://feeds.weblogssl.com/xataka2";
    const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}`;

    try {
      const res = await fetch(apiUrl);
      const data = await res.json();
      if (data.status === "ok" && data.items && data.items.length > 0) {
        return data.items.slice(0, 5).map(function (item) {
          return "📰 [XATAKA]: " + item.title;
        });
      }
    } catch (err) {
      console.warn("No se pudieron cargar noticias en vivo, usando respaldo local:", err);
    }

    return [
      "📰 [NOTICIA TECH]: La IA generativa revoluciona el desarrollo de software en 2026.",
      "⚡ [SISTEMA]: Red cibernética de Madrid funcionando a máxima capacidad.",
      "🤖 [NOTICIA IA]: Avances en agentes autónomos aplicados a entornos 3D."
    ];
  }

  async function initNpcNews() {
    const liveNews = await fetchTechNews();
    npcs.forEach(function (npc) {
      if (npc.role && /periodista|reportero|ia|datos/i.test(npc.role)) {
        npc.news = liveNews;
      }
    });
  }

  // 7. SISTEMA DE NPCs CON DIÁLOGOS (PREPARADO PARA API DE NOTICIAS)
  var npcs = [];
  var activeNpc = null;

  // UI de Diálogo estilo RPG / Cyberpunk
  var dialogUI = document.createElement("div");
  dialogUI.id = "npc-dialog-box";
  dialogUI.style.cssText = `
    position: fixed; bottom: 25px; left: 50%; transform: translateX(-50%);
    width: 90vw; max-width: 800px; padding: 20px; z-index: 9998;
    background: rgba(10, 10, 18, 0.92); border: 2px solid #${palette.primary.toString(16)};
    border-radius: 12px; backdrop-filter: blur(12px); color: #fff;
    font-family: 'Space Grotesk', monospace, sans-serif; display: none;
    box-shadow: 0 0 30px rgba(0,0,0,0.8), 0 0 10px #${palette.primary.toString(16)};
  `;
  dialogUI.innerHTML = `
    <div style="display:flex; justify-content:space-between; margin-bottom:8px; border-bottom:1px solid rgba(255,255,255,0.15); padding-bottom:5px;">
      <span id="npc-name" style="font-weight:700; color:#${palette.secondary.toString(16)}; text-transform:uppercase; letter-spacing:1px;">🤖 NPC</span>
      <span style="font-size:11px; opacity:0.6;">[PULSA E O CLIC PARA CERRAR]</span>
    </div>
    <div id="npc-text" style="font-size:15px; line-height:1.6; min-height:48px;">Cargando transmisión...</div>
  `;
  document.body.appendChild(dialogUI);

  var npcNameEl = document.getElementById("npc-name");
  var npcTextEl = document.getElementById("npc-text");
  var typeTimer = null;

  function showNpcDialog(npc) {
    if (typeTimer) clearInterval(typeTimer);
    dialogUI.style.display = "block";
    npcNameEl.textContent = npc.role + " · " + npc.name;
    npc.isTalking = true;

    if (window.askHugoAI) {
      npcTextEl.textContent = "ECHO-AI está analizando la conversación...";
      var prompt = "Eres ECHO-AI. Habla en 2-3 frases breves y con humor geek sobre Hugo Signes Sisternes, su formación SMX y DAM, su Metaverso 3D con Three.js, y su interés en IA. Habla como si fueras el NPC " + npc.name + " y el rol " + npc.role + ".";

      window.askHugoAI(prompt)
        .then(function (reply) {
          if (!npc.isTalking) return;
          npcTextEl.textContent = reply;
        })
        .catch(function () {
          if (!npc.isTalking) return;
          npcTextEl.textContent = "ECHO-AI no responde ahora mismo, pero la red sigue funcionando.";
        });
      return;
    }

    var newsFeed = npc.news || ["📰 [NPC]: Sistema de noticias en línea activo."];
    var randomMessage = newsFeed[Math.floor(Math.random() * newsFeed.length)];

    var charIdx = 0;
    npcTextEl.textContent = "";
    typeTimer = setInterval(function () {
      npcTextEl.textContent += randomMessage[charIdx];
      charIdx++;
      if (charIdx >= randomMessage.length) clearInterval(typeTimer);
    }, 25);
  }

  function hideNpcDialog() {
    dialogUI.style.display = "none";
    if (typeTimer) clearInterval(typeTimer);
    npcs.forEach(function (npc) {
      npc.isTalking = false;
    });
  }

  // Creador de Modelos 3D para los NPCs
  function createNPC(name, role, x, z, news) {
    var group = new THREE.Group();

    // Cuerpo / Armadura
    var bodyGeo = new THREE.CylinderGeometry(0.5, 0.3, 1.6, 8);
    var bodyMat = new THREE.MeshStandardMaterial({
      color: palette.npc,
      emissive: palette.primary,
      emissiveIntensity: 0.15,
      roughness: 0.3,
      metalness: 0.8
    });
    var body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = 1.0;
    group.add(body);

    // Cabeza Holográfica
    var headGeo = new THREE.SphereGeometry(0.35, 16, 16);
    var headMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: palette.primary,
      emissiveIntensity: 0.7
    });
    var head = new THREE.Mesh(headGeo, headMat);
    head.position.y = 2.1;
    group.add(head);

    // Ojos / Visor Cyberpunk
    var visorGeo = new THREE.BoxGeometry(0.4, 0.1, 0.2);
    var visorMat = new THREE.MeshBasicMaterial({ color: palette.secondary });
    var visor = new THREE.Mesh(visorGeo, visorMat);
    visor.position.set(0, 2.15, 0.25);
    group.add(visor);

    // Anillo flotante interactivo
    var ringGeo = new THREE.TorusGeometry(0.7, 0.03, 16, 32);
    var ringMat = new THREE.MeshBasicMaterial({ color: palette.secondary, wireframe: true });
    var ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 2;
    ring.position.y = 0.1;
    group.add(ring);

    group.position.set(x, 0, z);
    scene.add(group);

    var npcObj = {
      mesh: group,
      headMesh: head,
      visorMesh: visor,
      ringMesh: ring,
      name: name,
      role: role,
      news: news,
      x: x,
      z: z,
      homeX: x,
      homeZ: z,
      idleOffset: Math.random() * Math.PI * 2,
      isTalking: false,
      walkPhase: Math.random() * Math.PI * 2,
      route: [
        { x: x, z: z },
        { x: x + (Math.random() > 0.5 ? 1.5 : -1.5), z: z + (Math.random() > 0.5 ? 1.8 : -1.8) },
        { x: x + (Math.random() > 0.5 ? 3 : -3), z: z + (Math.random() > 0.5 ? 2.5 : -2.5) }
      ],
      routeIndex: 0
    };
    npcs.push(npcObj);
  }

  // Spawn de NPCs con Feed de Noticias (Estructurado para conectar con API externa)
  createNPC("Sora", "Periodista IA", -8, -15, [
    "📰 [ÚLTIMA HORA]: Los modelos de Inteligencia Artificial Generativa reducen un 40% el tiempo de maquetación web.",
    "🌐 [NOTICIA TECH]: Hugo Signes alinea su portafolio 3D con APIs meteorológicas en tiempo real.",
    "💡 [IA APLICADA]: La integración de visión por computador revoluciona la automatización industrial."
  ]);

  createNPC("ECHO-7", "Androide de Datos", 8, -35, [
    "📊 [MERCADO TECH]: Crece un 65% la demanda de desarrolladores con perfil híbrido Web3 + IA.",
    "⚡ [SISTEMA]: Estado de la red al 99.8%. Todos los hologramas funcionan con sincronización de estado.",
    "🤖 [NOTICIA IA]: Nuevos agentes autónomos ya son capaces de refactorizar código en tiempo real."
  ]);

  initNpcNews();

  // 8. Modal Holográfico para Navegación Web
  var previewModal = document.createElement("div");
  previewModal.id = "hologram-modal";
  previewModal.style.cssText = `
    position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%) scale(0.92);
    width: 88vw; height: 85vh; max-width: 1200px; z-index: 9999;
    background: rgba(10, 10, 15, 0.95); border: 2px solid #${palette.primary.toString(16)};
    box-shadow: 0 0 40px rgba(0,0,0,0.85), 0 0 15px #${palette.primary.toString(16)};
    border-radius: 12px; backdrop-filter: blur(14px); display: none; flex-direction: column;
    opacity: 0; transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  `;
  previewModal.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:center; padding: 12px 20px; background: rgba(0,0,0,0.6); border-bottom: 1px solid rgba(255,255,255,0.12);">
      <span id="holo-title" style="color:#fff; font-family:sans-serif; font-weight:700; font-size:16px;">🌐 Holograma</span>
      <div style="display:flex; gap:10px;">
        <a id="holo-open-external" href="#" target="_blank" style="color:#fff; text-decoration:none; background:#${palette.primary.toString(16)}; padding:6px 14px; border-radius:6px; font-size:12px; font-weight:700;">Pantalla Completa ↗</a>
        <button id="holo-close" style="background:#222; color:#fff; border:1px solid #444; padding:6px 12px; border-radius:6px; cursor:pointer; font-weight:700;">✕ Cerrar</button>
      </div>
    </div>
    <iframe id="holo-frame" style="width:100%; height:100%; border:none; background:#000;" src=""></iframe>
  `;
  document.body.appendChild(previewModal);

  var holoFrame = document.getElementById("holo-frame");
  var holoTitle = document.getElementById("holo-title");
  var holoOpenExt = document.getElementById("holo-open-external");
  var holoCloseBtn = document.getElementById("holo-close");

  function openHologram(url, title) {
    var fullUrl = url + "?theme=" + rootTheme + "&style=" + currentStyle;
    holoFrame.src = fullUrl;
    holoTitle.textContent = "🌐 Previsualización: " + title;
    holoOpenExt.href = fullUrl;
    
    // 1. Mostrar modal antes de desbloquear controles para evitar conflictos
    previewModal.style.display = "flex";
    setTimeout(function () {
      previewModal.style.opacity = "1";
      previewModal.style.transform = "translate(-50%, -50%) scale(1)";
    }, 10);

    controls.unlock();
  }

  function closeHologram() {
    previewModal.style.opacity = "0";
    previewModal.style.transform = "translate(-50%, -50%) scale(0.92)";
    setTimeout(function () {
      previewModal.style.display = "none";
      holoFrame.src = "";
      
      // 2. Volver a bloquear el puntero al cerrar el holograma
      controls.lock();
    }, 300);
  }

  // 3. Reactivar el puntero al hacer clic en el contenedor WebGL si está desbloqueado
  container.addEventListener("click", function () {
    if (!controls.isLocked && previewModal.style.display !== "flex") {
      controls.lock();
    }
  });

  holoCloseBtn.addEventListener("click", closeHologram);

  // 9. Controles PointerLock y Estado de Juego
  var controls = new THREE.PointerLockControls(camera, document.body);

  if (startBtn) {
    startBtn.addEventListener("click", function () {
      if (isTouchDevice) {
        if (overlay) {
          overlay.style.opacity = "0";
          setTimeout(function () { overlay.hidden = true; }, 400);
        }
        return;
      }
      if (previewModal.style.display !== "flex") controls.lock();
    });
  }

  controls.addEventListener("lock", function () {
    hideNpcDialog();
    if (overlay) {
      overlay.style.opacity = "0";
      setTimeout(function () { overlay.hidden = true; }, 400);
    }
  });

  controls.addEventListener("unlock", function () {
    if (previewModal.style.display !== "flex" && overlay) {
      overlay.hidden = false;
      overlay.style.opacity = "1";
    }
  });

  scene.add(controls.getObject());

  // 10. Suelo Ciberpunk y Malla Urbana Avanzada
  var floorGeo = new THREE.PlaneGeometry(350, 350);
  var floorMat = new THREE.MeshStandardMaterial({ color: palette.bg, roughness: 0.2, metalness: 0.8 });
  var floor = new THREE.Mesh(floorGeo, floorMat);
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  scene.add(floor);

  var grid = new THREE.GridHelper(350, 70, palette.primary, palette.grid);
  grid.position.y = 0.01;
  scene.add(grid);

  // Decoración urbana: calles, plazas y farolas para que la ciudad parezca más real
  var urbanDecor = [
    { x: -18, z: -25, w: 22, h: 10, color: 0x111821, accent: 0x2b3d5e },
    { x: 18, z: -25, w: 22, h: 10, color: 0x171d29, accent: 0x334d7a },
    { x: -18, z: -52, w: 20, h: 12, color: 0x121923, accent: 0x3b2f69 },
    { x: 18, z: -52, w: 20, h: 12, color: 0x111821, accent: 0x2f5b6a },
    { x: 0, z: -78, w: 28, h: 14, color: 0x121620, accent: 0x4d3a5e }
  ];

  urbanDecor.forEach(function (plaza) {
    var plazaMesh = new THREE.Mesh(
      new THREE.BoxGeometry(plaza.w, 0.2, plaza.h),
      new THREE.MeshStandardMaterial({ color: plaza.color, roughness: 0.9, metalness: 0.2 })
    );
    plazaMesh.position.set(plaza.x, 0.08, plaza.z);
    scene.add(plazaMesh);

    for (var i = 0; i < 6; i++) {
      var lamp = new THREE.Mesh(
        new THREE.CylinderGeometry(0.12, 0.12, 4.2, 8),
        new THREE.MeshStandardMaterial({ color: 0x1b2333, emissive: plaza.accent, emissiveIntensity: 0.25 })
      );
      lamp.position.set(plaza.x - plaza.w / 2 + 3 + i * 2.4, 2.1, plaza.z - plaza.h / 2 + 2.5);
      scene.add(lamp);

      var lampGlow = new THREE.PointLight(plaza.accent, 0.6, 12, 2);
      lampGlow.position.set(lamp.position.x, 4.2, lamp.position.z);
      scene.add(lampGlow);
    }

    // Árboles
    for (var t = 0; t < 4; t++) {
      var treeTrunk = new THREE.Mesh(
        new THREE.CylinderGeometry(0.18, 0.22, 1.4, 8),
        new THREE.MeshStandardMaterial({ color: 0x4d3320 })
      );
      treeTrunk.position.set(plaza.x - plaza.w / 2 + 3 + t * 4.8, 0.7, plaza.z + plaza.h / 2 - 2.5);
      scene.add(treeTrunk);

      var treeTop = new THREE.Mesh(
        new THREE.SphereGeometry(0.8, 12, 12),
        new THREE.MeshStandardMaterial({ color: 0x3f7f5a, emissive: 0x1a4d2a, emissiveIntensity: 0.16 })
      );
      treeTop.position.set(treeTrunk.position.x, 1.8, treeTrunk.position.z);
      scene.add(treeTop);
    }

    // Bancos
    for (var b = 0; b < 2; b++) {
      var bench = new THREE.Group();
      var benchBase = new THREE.Mesh(
        new THREE.BoxGeometry(1.2, 0.12, 0.3),
        new THREE.MeshStandardMaterial({ color: 0xb18d5a })
      );
      benchBase.position.y = 0.4;
      bench.add(benchBase);
      bench.position.set(plaza.x + (b === 0 ? -3 : 3), 0, plaza.z + plaza.h / 2 - 5);
      scene.add(bench);
    }

    // Vallas pequeñas
    var fenceMat = new THREE.MeshStandardMaterial({ color: 0x7b8fa3, metalness: 0.4, roughness: 0.8 });
    for (var f = 0; f < 4; f++) {
      var fence = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.6, 0.08), fenceMat);
      fence.position.set(plaza.x - 5 + f * 3.2, 0.3, plaza.z + plaza.h / 2 - 0.8);
      scene.add(fence);
    }
  });

  // Portales Holográficos Seccionales
  var sections = [
    {
      title: "SOBRE MÍ",
      emoji: "🧠",
      sub: "Perfil y Valores",
      url: "sobre.html",
      x: -18,
      z: -25,
      style: { bg: 0x1a1d2a, accent: 0xe4172b }
    },
    {
      title: "TRAYECTORIA",
      emoji: "⚡",
      sub: "SMX, Erasmus y DAM",
      url: "trabajo.html",
      x: 18,
      z: -25,
      style: { bg: 0x182130, accent: 0x6ea8fe }
    },
    {
      title: "ME GUSTA",
      emoji: "🎮",
      sub: "Bento Grid e Intereses",
      url: "gusta.html",
      x: -18,
      z: -52,
      style: { bg: 0x1e152d, accent: 0xe15eff }
    },
    {
      title: "FUTURO IA",
      emoji: "🚀",
      sub: "Roadmap y Proyectos",
      url: "futuro.html",
      x: 18,
      z: -52,
      style: { bg: 0x132328, accent: 0x22d3ee }
    },
    {
      title: "CONTACTO",
      emoji: "✉️",
      sub: "Formulario y Redes",
      url: "contacto.html",
      x: 0,
      z: -78,
      style: { bg: 0x1d1325, accent: 0xffb703 }
    }
  ];

  var clickablePortals = [];
  var buildableObjects = [floor];
  var builtBlocks = [];

  sections.forEach(function (sec) {
    var canvas = document.createElement("canvas");
    canvas.width = 512; canvas.height = 256;
    var ctx = canvas.getContext("2d");
    ctx.fillStyle = "rgba(10, 10, 18, 0.95)"; ctx.fillRect(0, 0, 512, 256);
    ctx.strokeStyle = "#" + (sec.style && sec.style.accent ? sec.style.accent.toString(16) : palette.primary.toString(16)); ctx.lineWidth = 10;
    ctx.strokeRect(6, 6, 500, 244);

    ctx.fillStyle = "#ffffff"; ctx.font = "bold 34px sans-serif"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText(sec.emoji + " " + sec.title, 256, 85);
    ctx.fillStyle = "#" + (sec.style && sec.style.accent ? sec.style.accent.toString(16) : palette.secondary.toString(16)); ctx.font = "20px monospace";
    ctx.fillText(sec.sub, 256, 135);
    ctx.fillStyle = "#00f0ff"; ctx.font = "bold 16px monospace";
    ctx.fillText("[ CLIC PARA ABRIR HOLOGRAMA ]", 256, 190);

    var texture = new THREE.CanvasTexture(canvas);
    var portalMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(5.2, 2.6),
      new THREE.MeshBasicMaterial({ map: texture, transparent: true, side: THREE.DoubleSide })
    );
    portalMesh.position.set(sec.x, 3.2, sec.z);
    portalMesh.userData = { url: sec.url, title: sec.title };

    scene.add(portalMesh);
    clickablePortals.push(portalMesh);
  });

  // Generación de Rascacielos compactos y con menos carga para mejorar rendimiento
  for (var bx = -80; bx <= 80; bx += 25) {
    for (var bz = -110; bz <= 10; bz += 25) {
      if (Math.abs(bx) < 16 && Math.abs(bz) < 30) continue;
      var h = 12 + Math.abs(Math.sin(bx * 0.9 + bz) * 24);
      var bGeo = new THREE.BoxGeometry(9, h, 9);
      var bMat = new THREE.MeshStandardMaterial({
        color: 0x0a0a12,
        roughness: 0.5,
        metalness: 0.8,
        flatShading: true
      });
      var bMesh = new THREE.Mesh(bGeo, bMat);
      bMesh.position.set(bx, h / 2, bz);
      bMesh.castShadow = true;
      bMesh.receiveShadow = true;
      scene.add(bMesh);
      buildableObjects.push(bMesh);
    }
  }

  // 11. Movimiento, Físicas, Interacción y Construcción
  var moveFwd = false, moveBwd = false, moveLft = false, moveRgt = false, canJump = false;
  var velocity = new THREE.Vector3(), dir = new THREE.Vector3();
  var gravity = 28.0, jumpForce = 9.5, playerVelY = 0, eyeHeight = 2.0;
  var prevTime = performance.now();
  var isTouchDevice = window.matchMedia("(pointer: coarse)").matches || "ontouchstart" in window;
  var mobileControls = document.getElementById("mobile-controls");
  var mobileLookPad = document.getElementById("mobile-look-pad");
  var mobileJumpBtn = document.getElementById("mobile-jump-btn");
  var mobileLookState = { active: false, pointerId: null, lastX: 0, lastY: 0 };

  function setMoveState(key, active) {
    if (key === "up") moveFwd = active;
    if (key === "down") moveBwd = active;
    if (key === "left") moveLft = active;
    if (key === "right") moveRgt = active;
  }

  function bindTouchMovement() {
    if (!mobileControls || !mobileLookPad || !mobileJumpBtn) return;

    mobileControls.classList.add("is-active");

    var moveButtons = document.querySelectorAll(".move-btn");
    moveButtons.forEach(function (button) {
      var key = button.getAttribute("data-move");
      button.addEventListener("pointerdown", function (event) {
        event.preventDefault();
        button.classList.add("is-pressed");
        setMoveState(key, true);
      });
      button.addEventListener("pointerup", function () {
        button.classList.remove("is-pressed");
        setMoveState(key, false);
      });
      button.addEventListener("pointerleave", function () {
        button.classList.remove("is-pressed");
        setMoveState(key, false);
      });
      button.addEventListener("pointercancel", function () {
        button.classList.remove("is-pressed");
        setMoveState(key, false);
      });
    });

    mobileLookPad.addEventListener("pointerdown", function (event) {
      mobileLookState.active = true;
      mobileLookState.pointerId = event.pointerId;
      mobileLookState.lastX = event.clientX;
      mobileLookState.lastY = event.clientY;
      mobileLookPad.setPointerCapture(event.pointerId);
    });

    mobileLookPad.addEventListener("pointermove", function (event) {
      if (!mobileLookState.active || event.pointerId !== mobileLookState.pointerId) return;

      var dx = event.clientX - mobileLookState.lastX;
      var dy = event.clientY - mobileLookState.lastY;
      mobileLookState.lastX = event.clientX;
      mobileLookState.lastY = event.clientY;

      var object = controls.getObject();
      object.rotation.y -= dx * 0.004;
      object.rotation.x -= dy * 0.003;
      object.rotation.x = Math.max(-1.2, Math.min(1.2, object.rotation.x));
    });

    var releaseLook = function (event) {
      if (mobileLookState.pointerId !== null && event.pointerId === mobileLookState.pointerId) {
        mobileLookState.active = false;
        mobileLookState.pointerId = null;
      }
    };

    mobileLookPad.addEventListener("pointerup", releaseLook);
    mobileLookPad.addEventListener("pointercancel", releaseLook);
    mobileLookPad.addEventListener("pointerleave", releaseLook);

    mobileJumpBtn.addEventListener("pointerdown", function (event) {
      event.preventDefault();
      if (canJump) {
        playerVelY = jumpForce;
        canJump = false;
      }
    });
  }

  if (isTouchDevice) {
    bindTouchMovement();
  }

  document.addEventListener("keydown", function (e) {
    if (e.code === "KeyW" || e.code === "ArrowUp") moveFwd = true;
    if (e.code === "KeyA" || e.code === "ArrowLeft") moveLft = true;
    if (e.code === "KeyS" || e.code === "ArrowDown") moveBwd = true;
    if (e.code === "KeyD" || e.code === "ArrowRight") moveRgt = true;
    if (e.code === "Space" && canJump) { playerVelY = jumpForce; canJump = false; }
    
    // Tecla 'E' para hablar con el NPC más cercano
    if (e.code === "KeyE" && controls.isLocked) {
      checkNpcInteraction();
    }
  });

  document.addEventListener("keyup", function (e) {
    if (e.code === "KeyW" || e.code === "ArrowUp") moveFwd = false;
    if (e.code === "KeyA" || e.code === "ArrowLeft") moveLft = false;
    if (e.code === "KeyS" || e.code === "ArrowDown") moveBwd = false;
    if (e.code === "KeyD" || e.code === "ArrowRight") moveRgt = false;
  });

  function checkNpcInteraction() {
    var pPos = controls.getObject().position;
    var closest = null;
    var minDist = 4.5; // Distancia máxima de interacción

    npcs.forEach(function (npc) {
      var dist = pPos.distanceTo(npc.mesh.position);
      if (dist < minDist) {
        minDist = dist;
        closest = npc;
      }
    });

    if (closest) {
      showNpcDialog(closest);
    } else {
      hideNpcDialog();
    }
  }

  var raycaster = new THREE.Raycaster();
  var downRaycaster = new THREE.Raycaster();

  window.addEventListener("click", function (e) {
    if (!controls.isLocked || e.button !== 0) return;

    // Si hay un diálogo abierto, el clic lo cierra
    if (dialogUI.style.display === "block") {
      hideNpcDialog();
      return;
    }

    raycaster.setFromCamera(new THREE.Vector2(0, 0), camera);
    var intersects = raycaster.intersectObjects(clickablePortals.concat(buildableObjects).concat(builtBlocks));

    if (intersects.length > 0) {
      var hit = intersects[0];
      if (hit.object.userData && hit.object.userData.url) {
        openHologram(hit.object.userData.url, hit.object.userData.title);
        return;
      }

      // Si hace clic en una cara para construir
      if (hit.face) {
        var targetPos = new THREE.Vector3().copy(hit.point).add(hit.face.normal.clone().multiplyScalar(0.5));
        targetPos.x = Math.floor(targetPos.x + 0.5);
        targetPos.y = Math.floor(targetPos.y + 0.5);
        targetPos.z = Math.floor(targetPos.z + 0.5);

        var block = new THREE.Mesh(
          new THREE.BoxGeometry(1, 1, 1),
          new THREE.MeshStandardMaterial({ color: palette.secondary, emissive: palette.primary, emissiveIntensity: 0.35 })
        );
        block.position.copy(targetPos);
        scene.add(block);
        builtBlocks.push(block);
        buildableObjects.push(block);
      }
    }
  });

  window.addEventListener("contextmenu", function (e) {
    e.preventDefault();
    if (!controls.isLocked) return;
    raycaster.setFromCamera(new THREE.Vector2(0, 0), camera);
    var intersects = raycaster.intersectObjects(builtBlocks);
    if (intersects.length > 0) {
      var blockToDestroy = intersects[0].object;
      scene.remove(blockToDestroy);
      builtBlocks = builtBlocks.filter(function (b) { return b !== blockToDestroy; });
      buildableObjects = buildableObjects.filter(function (b) { return b !== blockToDestroy; });
    }
  });

  // 12. Bucle de Animación
  function animate() {
    requestAnimationFrame(animate);

    var time = performance.now();
    var delta = (time - prevTime) / 1000;

    // Animación más realista: cada NPC tiene una ruta propia y deja de moverse cuando habla
    npcs.forEach(function (npc) {
      var angleToPlayer = Math.atan2(camera.position.x - npc.mesh.position.x, camera.position.z - npc.mesh.position.z);

      if (npc.isTalking) {
        npc.mesh.rotation.y = angleToPlayer;
        npc.headMesh.rotation.y = -angleToPlayer * 0.5;
        npc.visorMesh.rotation.y = -angleToPlayer * 0.5;
        npc.headMesh.position.y = 2.12;
        npc.ringMesh.rotation.z += 0.03;
        return;
      }

      var target = npc.route[npc.routeIndex] || { x: npc.homeX, z: npc.homeZ };
      var dx = target.x - npc.mesh.position.x;
      var dz = target.z - npc.mesh.position.z;
      var dist = Math.sqrt(dx * dx + dz * dz);

      if (dist < 0.6) {
        npc.routeIndex = (npc.routeIndex + 1) % npc.route.length;
      } else {
        npc.mesh.position.x += dx * 0.025;
        npc.mesh.position.z += dz * 0.025;
      }

      npc.mesh.rotation.y = Math.atan2(dx, dz) + Math.PI;
      npc.headMesh.position.y = 2.12 + Math.sin(time * 0.004 + npc.idleOffset) * 0.12;
      npc.headMesh.rotation.y = Math.sin(time * 0.003 + npc.idleOffset) * 0.45;
      npc.visorMesh.rotation.y = Math.sin(time * 0.003 + npc.idleOffset) * 0.5;
      npc.ringMesh.rotation.z += 0.02;
    });

    // Relámpagos dinámicos si hay tormenta
    if (isStormy && Math.random() < 0.008) {
      flashLight.intensity = 3.5;
      setTimeout(function () { flashLight.intensity = 0; }, 120);
    }

    if (controls.isLocked || isTouchDevice) {
      velocity.x -= velocity.x * 10.0 * delta;
      velocity.z -= velocity.z * 10.0 * delta;

      dir.z = Number(moveFwd) - Number(moveBwd);
      dir.x = Number(moveRgt) - Number(moveLft);
      dir.normalize();

      if (moveFwd || moveBwd) velocity.z -= dir.z * 38.0 * delta;
      if (moveLft || moveRgt) velocity.x -= dir.x * 38.0 * delta;

      controls.moveRight(-velocity.x * delta);
      controls.moveForward(-velocity.z * delta);

      playerVelY -= gravity * delta;
      var playerPos = controls.getObject().position;

      downRaycaster.set(playerPos, new THREE.Vector3(0, -1, 0));
      var groundHits = downRaycaster.intersectObjects(buildableObjects);

      var groundY = 0;
      if (groundHits.length > 0 && groundHits[0].distance <= eyeHeight + 0.3) {
        groundY = playerPos.y - groundHits[0].distance;
      }

      playerPos.y += playerVelY * delta;
      if (playerPos.y <= groundY + eyeHeight) {
        playerPos.y = groundY + eyeHeight;
        playerVelY = 0;
        canJump = true;
      }
    }

    prevTime = time;

    // Caída de Lluvia
    if (rainMat.opacity > 0) {
      var positions = rainSystem.geometry.attributes.position.array;
      for (var i = 1; i < rainCount * 3; i += 3) {
        positions[i] -= delta * 55;
        if (positions[i] < 0) positions[i] = 90;
      }
      rainSystem.geometry.attributes.position.needsUpdate = true;
    }

    renderer.render(scene, camera);
  }

  animate();
  setTimeout(hideLoadingScreen, 900);

  window.addEventListener("resize", function () {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
})();