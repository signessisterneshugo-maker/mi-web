/* =====================================================================
   HUGO SIGNES SISTERNES · METAVERSO URBANO 3D
   Clima en vivo (Open-Meteo) + NPCs con Diálogos (API Noticias Ready)
   ===================================================================== */
(function () {
  "use strict";

  var container = document.getElementById("webgl-container");
  var overlay = document.getElementById("instructions-overlay");
  var startBtn = document.getElementById("startBtn");

  if (!container) return;

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
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
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
  mainDirLight.shadow.mapSize.width = 2048;
  mainDirLight.shadow.mapSize.height = 2048;
  scene.add(mainDirLight);

  // Luz de Relámpago (Efectos de Tormenta)
  var flashLight = new THREE.PointLight(0xffffff, 0, 300);
  flashLight.position.set(0, 80, -40);
  scene.add(flashLight);

  // 5. Sistema de Partículas de Lluvia
  var rainCount = 2200;
  var rainGeo = new THREE.BufferGeometry();
  var rainPos = new Float32Array(rainCount * 3);
  for (var r = 0; r < rainCount * 3; r += 3) {
    rainPos[r] = (Math.random() - 0.5) * 260;
    rainPos[r + 1] = Math.random() * 95;
    rainPos[r + 2] = (Math.random() - 0.5) * 260 - 30;
  }
  rainGeo.setAttribute('position', new THREE.BufferAttribute(rainPos, 3));
  var rainMat = new THREE.PointsMaterial({
    color: 0x88ccff,
    size: 0.32,
    transparent: true,
    opacity: 0.0
  });
  var rainSystem = new THREE.Points(rainGeo, rainMat);
  scene.add(rainSystem);

  // 6. SINCRONIZACIÓN DE CLIMA EN TIEMPO REAL (Open-Meteo)
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
    } catch (err) {
      console.warn("Clima local en fallback:", err);
    }
  }
  syncWeatherWith3D();

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
    
    // Si en el futuro conectas una API de noticias, sustituyes este array por las llamadas `fetch`
    var newsFeed = npc.news;
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
  }

  // Creador de Modelos 3D para los NPCs
  function createNPC(name, role, x, z, news) {
    var group = new THREE.Group();

    // Cuerpo / Armadura
    var bodyGeo = new THREE.CylinderGeometry(0.5, 0.3, 1.6, 8);
    var bodyMat = new THREE.MeshStandardMaterial({ color: palette.npc, roughness: 0.3, metalness: 0.8 });
    var body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = 1.0;
    group.add(body);

    // Cabeza Holográfica
    var headGeo = new THREE.SphereGeometry(0.35, 16, 16);
    var headMat = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: palette.primary, emissiveIntensity: 0.6 });
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
      ringMesh: ring,
      name: name,
      role: role,
      news: news,
      x: x,
      z: z
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
    controls.unlock();
    var fullUrl = url + "?theme=" + rootTheme + "&style=" + currentStyle;
    holoFrame.src = fullUrl;
    holoTitle.textContent = "🌐 Previsualización: " + title;
    holoOpenExt.href = fullUrl;
    previewModal.style.display = "flex";
    setTimeout(function () {
      previewModal.style.opacity = "1";
      previewModal.style.transform = "translate(-50%, -50%) scale(1)";
    }, 10);
  }

  function closeHologram() {
    previewModal.style.opacity = "0";
    previewModal.style.transform = "translate(-50%, -50%) scale(0.92)";
    setTimeout(function () {
      previewModal.style.display = "none";
      holoFrame.src = "";
    }, 300);
  }

  holoCloseBtn.addEventListener("click", closeHologram);

  // 9. Controles PointerLock y Estado de Juego
  var controls = new THREE.PointerLockControls(camera, document.body);

  if (startBtn) {
    startBtn.addEventListener("click", function () {
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

  // Portales Holográficos Seccionales
  var sections = [
    { title: "SOBRE MÍ", emoji: "🧠", sub: "Perfil y Valores", url: "sobre.html", x: -18, z: -25 },
    { title: "TRAYECTORIA", emoji: "⚡", sub: "SMX, Erasmus y DAM", url: "trabajo.html", x: -18, z: -55 },
    { title: "ME GUSTA", emoji: "🎮", sub: "Bento Grid e Intereses", url: "gusta.html", x: 18, z: -25 },
    { title: "FUTURO IA", emoji: "🚀", sub: "Roadmap y Proyectos", url: "futuro.html", x: 18, z: -55 },
    { title: "CONTACTO", emoji: "✉️", sub: "Formulario y Redes", url: "contacto.html", x: 0, z: -85 }
  ];

  var clickablePortals = [];
  var buildableObjects = [floor];
  var builtBlocks = [];

  sections.forEach(function (sec) {
    var canvas = document.createElement("canvas");
    canvas.width = 512; canvas.height = 256;
    var ctx = canvas.getContext("2d");
    ctx.fillStyle = "rgba(10, 10, 18, 0.95)"; ctx.fillRect(0, 0, 512, 256);
    ctx.strokeStyle = "#" + palette.primary.toString(16); ctx.lineWidth = 10;
    ctx.strokeRect(6, 6, 500, 244);

    ctx.fillStyle = "#ffffff"; ctx.font = "bold 34px sans-serif"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText(sec.emoji + " " + sec.title, 256, 85);
    ctx.fillStyle = "#" + palette.secondary.toString(16); ctx.font = "20px monospace";
    ctx.fillText(sec.sub, 256, 135);
    ctx.fillStyle = "#00f0ff"; ctx.font = "bold 16px monospace";
    ctx.fillText("[ CLIC PARA ABRIR HOLOGRAMA ]", 256, 190);

    var texture = new THREE.CanvasTexture(canvas);
    var portalMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(5.2, 2.6),
      new THREE.MeshBasicMaterial({ map: texture, transparent: true, side: THREE.DoubleSide })
    );
    portalMesh.position.set(sec.x, 3.4, sec.z);
    portalMesh.userData = { url: sec.url, title: sec.title };

    scene.add(portalMesh);
    clickablePortals.push(portalMesh);
  });

  // Generación de Rascacielos con Ventanas e Iluminación
  for (var bx = -80; bx <= 80; bx += 20) {
    for (var bz = -110; bz <= 10; bz += 20) {
      if (Math.abs(bx) < 12) continue;
      var h = 14 + Math.abs(Math.sin(bx * bz) * 35);
      var bGeo = new THREE.BoxGeometry(10, h, 10);
      var bMat = new THREE.MeshStandardMaterial({ color: 0x0a0a12, roughness: 0.4, metalness: 0.85 });
      var bMesh = new THREE.Mesh(bGeo, bMat);
      bMesh.position.set(bx, h / 2, bz);
      bMesh.castShadow = true;
      scene.add(bMesh);
      buildableObjects.push(bMesh);
    }
  }

  // 11. Movimiento, Físicas, Interacción y Construcción
  var moveFwd = false, moveBwd = false, moveLft = false, moveRgt = false, canJump = false;
  var velocity = new THREE.Vector3(), dir = new THREE.Vector3();
  var gravity = 28.0, jumpForce = 9.5, playerVelY = 0, eyeHeight = 2.0;
  var prevTime = performance.now();

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

    // Animación continua de NPCs
    npcs.forEach(function (npc) {
      npc.headMesh.position.y = 2.1 + Math.sin(time * 0.003 + npc.x) * 0.08;
      npc.ringMesh.rotation.z += 0.015;
    });

    // Relámpagos dinámicos si hay tormenta
    if (isStormy && Math.random() < 0.008) {
      flashLight.intensity = 3.5;
      setTimeout(function () { flashLight.intensity = 0; }, 120);
    }

    if (controls.isLocked) {
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

  window.addEventListener("resize", function () {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
})();