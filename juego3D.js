/* =====================================================================
   METAVERSO URBANO 3D · CIUDAD VIVA, HOLOGRAMAS INTERACTIVOS Y FÍSICAS
   ===================================================================== */
(function () {
  "use strict";

  var container = document.getElementById("webgl-container");
  var overlay = document.getElementById("instructions-overlay");
  var startBtn = document.getElementById("startBtn");

  if (!container) return;

  // 1. Detección y sincronización de estilo
  var urlParams = new URLSearchParams(window.location.search);
  var currentStyle = urlParams.get('style') || localStorage.getItem('hugo-style') || document.documentElement.getAttribute("data-style") || "unico";

  var themeColors = {
    unico: { bg: 0x050508, fog: 0x07070d, primary: 0xe4172b, secondary: 0xff3a4d, accent: 0x00f0ff, grid: 0x161622 },
    professional: { bg: 0x080f1e, fog: 0x0b1528, primary: 0x6ea8fe, secondary: 0x3d7bfd, accent: 0xffb703, grid: 0x16243e },
    gamer: { bg: 0x000000, fog: 0x030305, primary: 0xff003c, secondary: 0x21e6c1, accent: 0xfffe00, grid: 0x222222 },
    retro: { bg: 0x08080f, fog: 0x0b0b14, primary: 0x3ddc84, secondary: 0xff2e4c, accent: 0xf7d070, grid: 0x1d1d2e }
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
  renderer.toneMappingExposure = 1.15;
  container.appendChild(renderer.domElement);

  // 3. Sistema de Modal Holográfico para visualizar la web con Scroll
  var previewModal = document.createElement("div");
  previewModal.id = "hologram-preview-modal";
  previewModal.style.cssText = `
    position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%) scale(0.9);
    width: 85vw; height: 85vh; max-width: 1200px; z-index: 9999;
    background: rgba(10, 10, 18, 0.92); border: 2px solid #${palette.primary.toString(16)};
    box-shadow: 0 0 35px rgba(0, 0, 0, 0.8), 0 0 15px #${palette.primary.toString(16)};
    border-radius: 12px; backdrop-filter: blur(12px); display: none; flex-direction: column;
    opacity: 0; transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  `;

  previewModal.innerHTML = `
    <div style="display:flex; justify-between; align-items:center; padding: 12px 20px; background: rgba(0,0,0,0.5); border-bottom: 1px solid rgba(255,255,255,0.1);">
      <span id="holo-title" style="color:#fff; font-family:sans-serif; font-weight:bold; font-size:18px; display:flex; align-items:center; gap:8px;">Holograma Activo</span>
      <div style="display:flex; gap:10px;">
        <a id="holo-external-btn" href="#" style="color:#fff; text-decoration:none; background:#${palette.primary.toString(16)}; padding:6px 14px; border-radius:6px; font-size:13px; font-weight:bold;">Abrir Web Completa ↗</a>
        <button id="holo-close-btn" style="background:#222; color:#fff; border:1px solid #444; padding:6px 14px; border-radius:6px; cursor:pointer; font-weight:bold;">✕ Cerrar (ESC)</button>
      </div>
    </div>
    <iframe id="holo-iframe" style="width:100%; height:100%; border:none; background:transparent;" src=""></iframe>
  `;
  document.body.appendChild(previewModal);

  var holoIframe = document.getElementById("holo-iframe");
  var holoTitle = document.getElementById("holo-title");
  var holoExternalBtn = document.getElementById("holo-external-btn");
  var holoCloseBtn = document.getElementById("holo-close-btn");

  function openHologramWeb(url, title) {
    controls.unlock();
    holoIframe.src = url;
    holoTitle.textContent = "🌐 Previsualización Holográfica: " + title;
    holoExternalBtn.href = url;
    previewModal.style.display = "flex";
    setTimeout(function() {
      previewModal.style.opacity = "1";
      previewModal.style.transform = "translate(-50%, -50%) scale(1)";
    }, 10);
  }

  function closeHologramWeb() {
    previewModal.style.opacity = "0";
    previewModal.style.transform = "translate(-50%, -50%) scale(0.9)";
    setTimeout(function() {
      previewModal.style.display = "none";
      holoIframe.src = "";
    }, 300);
  }

  holoCloseBtn.addEventListener("click", closeHologramWeb);
  document.addEventListener("keydown", function(e) {
    if (e.key === "Escape" && previewModal.style.display === "flex") {
      closeHologramWeb();
    }
  });

  // 4. Controles Pointer Lock
  var controls = new THREE.PointerLockControls(camera, document.body);

  if (startBtn) {
    startBtn.addEventListener("click", function () {
      if (previewModal.style.display !== "flex") controls.lock();
    });
  }

  controls.addEventListener("lock", function () {
    if (overlay) {
      overlay.style.opacity = "0";
      setTimeout(function () { overlay.hidden = true; }, 500);
    }
  });

  controls.addEventListener("unlock", function () {
    if (previewModal.style.display !== "flex" && overlay) {
      overlay.hidden = false;
      overlay.style.opacity = "1";
    }
  });

  scene.add(controls.getObject());

  // 5. Iluminación Avanzada
  var ambientLight = new THREE.AmbientLight(0xffffff, 0.45);
  scene.add(ambientLight);

  var mainLight = new THREE.DirectionalLight(palette.primary, 1.4);
  mainLight.position.set(40, 80, 20);
  mainLight.castShadow = true;
  mainLight.shadow.mapSize.width = 2048;
  mainLight.shadow.mapSize.height = 2048;
  scene.add(mainLight);

  var fillLight = new THREE.DirectionalLight(palette.secondary, 0.6);
  fillLight.position.set(-40, 30, -30);
  scene.add(fillLight);

  // 6. Suelo, Calles y Pasos de Peatones
  var floorGeo = new THREE.PlaneGeometry(400, 400);
  var floorMat = new THREE.MeshStandardMaterial({ color: palette.bg, roughness: 0.4, metalness: 0.6 });
  var floor = new THREE.Mesh(floorGeo, floorMat);
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  scene.add(floor);

  var gridHelper = new THREE.GridHelper(400, 100, palette.primary, palette.grid);
  gridHelper.position.y = 0.01;
  scene.add(gridHelper);

  // Marcas de carril en la avenida central
  var roadGroup = new THREE.Group();
  for (var rz = -150; rz <= 50; rz += 8) {
    var stripeGeo = new THREE.PlaneGeometry(0.3, 4);
    var stripeMat = new THREE.MeshBasicMaterial({ color: palette.secondary });
    var stripe = new THREE.Mesh(stripeGeo, stripeMat);
    stripe.rotation.x = -Math.PI / 2;
    stripe.position.set(0, 0.02, rz);
    roadGroup.add(stripe);
  }
  scene.add(roadGroup);

  // 7. Textura de Ventanas Dinámica
  function createBuildingTexture() {
    var canvas = document.createElement("canvas");
    canvas.width = 128;
    canvas.height = 256;
    var ctx = canvas.getContext("2d");
    ctx.fillStyle = "#090910";
    ctx.fillRect(0, 0, 128, 256);
    ctx.fillStyle = "#" + palette.primary.toString(16);

    for (var y = 8; y < 256; y += 16) {
      for (var x = 8; x < 128; x += 16) {
        if (Math.random() > 0.4) {
          ctx.globalAlpha = Math.random() * 0.85 + 0.15;
          ctx.fillRect(x, y, 8, 10);
        }
      }
    }
    return new THREE.CanvasTexture(canvas);
  }
  var buildingTexture = createBuildingTexture();
  buildingTexture.wrapS = THREE.RepeatWrapping;
  buildingTexture.wrapT = THREE.RepeatWrapping;

  // 8. Secciones y Posicionamiento
  var sectionsData = [
    { title: "SOBRE MÍ", emoji: "🧠", sub: "Perfil y Valores", url: "sobre.html", x: -15, z: -20 },
    { title: "TRAYECTORIA", emoji: "⚡", sub: "SMX, Erasmus y DAM", url: "trabajo.html", x: -15, z: -50 },
    { title: "ME GUSTA", emoji: "🎮", sub: "Bento Grid e Intereses", url: "gusta.html", x: 15, z: -20 },
    { title: "FUTURO e IA", emoji: "🚀", sub: "Roadmap e IA", url: "futuro.html", x: 15, z: -50 },
    { title: "CONTACTO", emoji: "✉️", sub: "Formulario y Redes", url: "contacto.html", x: 0, z: -80 }
  ];

  function isAreaClear(x, z) {
    if (Math.abs(x) < 8) return false;
    for (var i = 0; i < sectionsData.length; i++) {
      var p = sectionsData[i];
      var dist = Math.sqrt((x - p.x) * (x - p.x) + (z - p.z) * (z - p.z));
      if (dist < 10.0) return false;
    }
    return true;
  }

  // 9. Rascacielos y Arquitectura
  var buildingsGroup = new THREE.Group();
  var buildableObjects = [floor];
  var blockSize = 1;

  for (var bx = -65; bx <= 65; bx += 14) {
    for (var bz = -100; bz <= 15; bz += 14) {
      var posX = bx + (Math.sin(bx * 7 + bz * 3) * 2);
      var posZ = bz + (Math.cos(bx * 3 + bz * 7) * 2);

      if (!isAreaClear(posX, posZ)) continue;

      var width = 7 + Math.abs(Math.sin(bx) * 3);
      var depth = 7 + Math.abs(Math.cos(bz) * 3);
      var height = 14 + Math.abs(Math.sin(bx * bz) * 28);

      var bGeo = new THREE.BoxGeometry(width, height, depth);
      var customTex = buildingTexture.clone();
      customTex.needsUpdate = true;
      customTex.repeat.set(1, Math.floor(height / 4));

      var bMat = new THREE.MeshStandardMaterial({
        color: 0x10101a,
        emissiveMap: customTex,
        emissive: new THREE.Color(palette.primary),
        emissiveIntensity: 0.3,
        roughness: 0.4,
        metalness: 0.8
      });

      var building = new THREE.Mesh(bGeo, bMat);
      building.position.set(posX, height / 2, posZ);
      building.castShadow = true;
      building.receiveShadow = true;
      buildingsGroup.add(building);
      buildableObjects.push(building);
    }
  }
  scene.add(buildingsGroup);

  // 10. Elementos de Ciudad Real (Tráfico, NPCs, Drones, Semáforos)
  var dynamicObjects = [];

  // A) Vehículos Futuristas en Movimiento
  var vehiclesGroup = new THREE.Group();
  for (var v = 0; v < 4; v++) {
    var carGeo = new THREE.BoxGeometry(1.8, 0.8, 3.5);
    var carMat = new THREE.MeshStandardMaterial({ color: 0x11111d, metalness: 0.9, roughness: 0.2 });
    var car = new THREE.Mesh(carGeo, carMat);

    var headlightGeo = new THREE.SphereGeometry(0.2, 8, 8);
    var headlightMat = new THREE.MeshBasicMaterial({ color: palette.secondary });
    var hl1 = new THREE.Mesh(headlightGeo, headlightMat); hl1.position.set(-0.6, 0.1, -1.75);
    var hl2 = new THREE.Mesh(headlightGeo, headlightMat); hl2.position.set(0.6, 0.1, -1.75);
    car.add(hl1); car.add(hl2);

    car.position.set(v % 2 === 0 ? -3.5 : 3.5, 0.5, -120 + v * 40);
    car.userData = { speed: (0.15 + Math.random() * 0.1) * (v % 2 === 0 ? 1 : -1) };
    vehiclesGroup.add(car);
  }
  scene.add(vehiclesGroup);

  // B) Cyber-NPCs Peatones
  var npcsGroup = new THREE.Group();
  for (var n = 0; n < 6; n++) {
    var npcGroup = new THREE.Group();
    var bodyGeo = new THREE.CylinderGeometry(0.25, 0.2, 1.4, 8);
    var bodyMat = new THREE.MeshStandardMaterial({ color: palette.primary, roughness: 0.5 });
    var body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = 0.9;

    var headGeo = new THREE.SphereGeometry(0.22, 12, 12);
    var headMat = new THREE.MeshBasicMaterial({ color: palette.secondary });
    var head = new THREE.Mesh(headGeo, headMat);
    head.position.y = 1.8;

    npcGroup.add(body); npcGroup.add(head);
    var sideX = (n % 2 === 0 ? -6.5 : 6.5);
    npcGroup.position.set(sideX, 0, -10 - n * 18);
    npcGroup.userData = { speed: 0.04 + Math.random() * 0.03, dir: Math.random() > 0.5 ? 1 : -1 };
    npcsGroup.add(npcGroup);
  }
  scene.add(npcsGroup);

  // C) Drones Voladores con Escáner
  var dronesGroup = new THREE.Group();
  for (var d = 0; d < 3; d++) {
    var droneGeo = new THREE.SphereGeometry(0.6, 12, 12);
    var droneMat = new THREE.MeshStandardMaterial({ color: 0x222233, metalness: 0.9 });
    var drone = new THREE.Mesh(droneGeo, droneMat);

    var beamGeo = new THREE.ConeGeometry(1.2, 6, 16);
    var beamMat = new THREE.MeshBasicMaterial({ color: palette.accent, transparent: true, opacity: 0.2 });
    var beam = new THREE.Mesh(beamGeo, beamMat);
    beam.position.y = -3;
    drone.add(beam);

    drone.position.set((Math.random() - 0.5) * 40, 12 + d * 3, -20 - d * 30);
    drone.userData = { offset: d, speed: 0.02 };
    dronesGroup.add(drone);
  }
  scene.add(dronesGroup);

  // 11. Portales Holográficos Interactivas con Vista Previa Scrollable
  var hologramsGroup = new THREE.Group();
  var clickablePortals = [];

  sectionsData.forEach(function (data) {
    // Plaza
    var plazaGeo = new THREE.CylinderGeometry(4.5, 4.8, 0.15, 32);
    var plazaMat = new THREE.MeshStandardMaterial({ color: 0x11111a, emissive: palette.primary, emissiveIntensity: 0.25 });
    var plaza = new THREE.Mesh(plazaGeo, plazaMat);
    plaza.position.set(data.x, 0.07, data.z);
    scene.add(plaza);

    // Poste indicador
    var signCanvas = document.createElement("canvas");
    signCanvas.width = 256; signCanvas.height = 128;
    var sCtx = signCanvas.getContext("2d");
    sCtx.fillStyle = "rgba(10, 10, 18, 0.95)"; sCtx.fillRect(0, 0, 256, 128);
    sCtx.strokeStyle = "#" + palette.primary.toString(16); sCtx.lineWidth = 6;
    sCtx.strokeRect(4, 4, 248, 120);
    sCtx.fillStyle = "#ffffff"; sCtx.font = "bold 22px sans-serif";
    sCtx.textAlign = "center"; sCtx.textBaseline = "middle";
    sCtx.fillText("➜ " + data.title, 128, 64);

    var signTex = new THREE.CanvasTexture(signCanvas);
    var signMesh = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 1.2), new THREE.MeshBasicMaterial({ map: signTex, side: THREE.DoubleSide }));
    signMesh.position.set(data.x, 3.8, data.z + 3.2);

    var pole = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 4.5, 8), new THREE.MeshStandardMaterial({ color: 0x444455 }));
    pole.position.set(data.x, 2.25, data.z + 3.2);
    scene.add(pole); scene.add(signMesh);

    // Portal Principal
    var canvas = document.createElement("canvas");
    canvas.width = 512; canvas.height = 256;
    var ctx = canvas.getContext("2d");
    ctx.fillStyle = "rgba(8, 8, 14, 0.92)"; ctx.fillRect(0, 0, 512, 256);
    ctx.strokeStyle = "#" + palette.primary.toString(16); ctx.lineWidth = 10;
    ctx.strokeRect(6, 6, 500, 244);

    ctx.fillStyle = "#ffffff"; ctx.font = "bold 36px sans-serif"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText(data.emoji + " " + data.title, 256, 90);

    ctx.fillStyle = "#" + palette.secondary.toString(16); ctx.font = "18px monospace";
    ctx.fillText(data.sub, 256, 140);

    ctx.fillStyle = "#00f0ff"; ctx.font = "bold 16px monospace";
    ctx.fillText("[ CLIC PARA VER HOLOGRAMA WEB ]", 256, 195);

    var texture = new THREE.CanvasTexture(canvas);
    var mesh = new THREE.Mesh(new THREE.PlaneGeometry(4.4, 2.2), new THREE.MeshBasicMaterial({ map: texture, transparent: true, opacity: 0.95, side: THREE.DoubleSide }));
    mesh.position.set(data.x, 3.2, data.z);
    mesh.userData = { url: data.url, title: data.title };

    var pedestal = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.6, 2.2, 8), new THREE.MeshStandardMaterial({ color: palette.primary, emissive: palette.primary, emissiveIntensity: 0.6 }));
    pedestal.position.set(data.x, 1.1, data.z);
    scene.add(pedestal);

    hologramsGroup.add(mesh);
    clickablePortals.push(mesh);
  });
  scene.add(hologramsGroup);

  // 12. Físicas, Gravedad, Salto y Construcción
  var moveForward = false, moveBackward = false, moveLeft = false, moveRight = false, canJump = false;
  var velocity = new THREE.Vector3(), direction = new THREE.Vector3();
  var gravity = 28.0, jumpForce = 9.5, playerVelocityY = 0, eyeHeight = 2.0;
  var prevTime = performance.now();

  document.addEventListener("keydown", function (e) {
    if (e.code === "KeyW" || e.code === "ArrowUp") moveForward = true;
    if (e.code === "KeyA" || e.code === "ArrowLeft") moveLeft = true;
    if (e.code === "KeyS" || e.code === "ArrowDown") moveBackward = true;
    if (e.code === "KeyD" || e.code === "ArrowRight") moveRight = true;
    if (e.code === "Space" && canJump) { playerVelocityY = jumpForce; canJump = false; }
  });

  document.addEventListener("keyup", function (e) {
    if (e.code === "KeyW" || e.code === "ArrowUp") moveForward = false;
    if (e.code === "KeyA" || e.code === "ArrowLeft") moveLeft = false;
    if (e.code === "KeyS" || e.code === "ArrowDown") moveBackward = false;
    if (e.code === "KeyD" || e.code === "ArrowRight") moveRight = false;
  });

  var builtBlocks = [];
  var raycaster = new THREE.Raycaster();
  var downRaycaster = new THREE.Raycaster();

  // Partículas de ruptura de bloques
  function spawnBreakParticles(position) {
    var pCount = 15;
    var pGeo = new THREE.BufferGeometry();
    var pPos = new Float32Array(pCount * 3);
    for (var i = 0; i < pCount * 3; i++) pPos[i] = (Math.random() - 0.5) * 0.8;
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    var pMat = new THREE.PointsMaterial({ color: palette.secondary, size: 0.15, transparent: true, opacity: 1 });
    var pMesh = new THREE.Points(pGeo, pMat);
    pMesh.position.copy(position);
    scene.add(pMesh);

    var startTime = performance.now();
    function animateParticles() {
      var elapsed = (performance.now() - startTime) / 1000;
      if (elapsed < 0.4) {
        pMesh.scale.multiplyScalar(1.05);
        pMat.opacity = 1 - (elapsed / 0.4);
        requestAnimationFrame(animateParticles);
      } else {
        scene.remove(pMesh);
      }
    }
    animateParticles();
  }

  // Construir (Clic Izquierdo) & Abrir Previsualización Web
  window.addEventListener("click", function (e) {
    if (!controls.isLocked || e.button !== 0) return;

    raycaster.setFromCamera(new THREE.Vector2(0, 0), camera);
    var intersects = raycaster.intersectObjects(clickablePortals.concat(buildableObjects).concat(builtBlocks));

    if (intersects.length > 0) {
      var hit = intersects[0];

      // Si hace clic en un portal holográfico -> Abre la página sin salir del 3D
      if (hit.object.userData && hit.object.userData.url) {
        openHologramWeb(hit.object.userData.url, hit.object.userData.title);
        return;
      }

      // Colocar Bloque 1x1x1
      if (hit.face) {
        var targetPos = new THREE.Vector3().copy(hit.point).add(hit.face.normal.clone().multiplyScalar(blockSize / 2));
        targetPos.x = Math.floor((targetPos.x + blockSize / 2) / blockSize) * blockSize;
        targetPos.y = Math.floor((targetPos.y + blockSize / 2) / blockSize) * blockSize + blockSize / 2;
        targetPos.z = Math.floor((targetPos.z + blockSize / 2) / blockSize) * blockSize;

        var block = new THREE.Mesh(
          new THREE.BoxGeometry(blockSize, blockSize, blockSize),
          new THREE.MeshStandardMaterial({ color: palette.secondary, emissive: palette.primary, emissiveIntensity: 0.4, roughness: 0.2, metalness: 0.8 })
        );
        block.position.copy(targetPos);
        block.castShadow = true; block.receiveShadow = true;

        scene.add(block);
        builtBlocks.push(block);
        buildableObjects.push(block);
      }
    }
  });

  // Eliminar Bloques (Clic Derecho)
  window.addEventListener("contextmenu", function (e) {
    e.preventDefault();
    if (!controls.isLocked) return;

    raycaster.setFromCamera(new THREE.Vector2(0, 0), camera);
    var intersects = raycaster.intersectObjects(builtBlocks);

    if (intersects.length > 0) {
      var targetBlock = intersects[0].object;
      spawnBreakParticles(targetBlock.position);
      scene.remove(targetBlock);
      builtBlocks = builtBlocks.filter(function (b) { return b !== targetBlock; });
      buildableObjects = buildableObjects.filter(function (b) { return b !== targetBlock; });
    }
  });

  // 13. Bucle Principal de Renderizado y Animación Urbana
  var clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);

    var time = performance.now();
    var delta = (time - prevTime) / 1000;

    if (controls.isLocked === true) {
      velocity.x -= velocity.x * 10.0 * delta;
      velocity.z -= velocity.z * 10.0 * delta;

      direction.z = Number(moveForward) - Number(moveBackward);
      direction.x = Number(moveRight) - Number(moveLeft);
      direction.normalize();

      if (moveForward || moveBackward) velocity.z -= direction.z * 40.0 * delta;
      if (moveLeft || moveRight) velocity.x -= direction.x * 40.0 * delta;

      controls.moveRight(-velocity.x * delta);
      controls.moveForward(-velocity.z * delta);

      playerVelocityY -= gravity * delta;
      var playerPos = controls.getObject().position;

      downRaycaster.set(playerPos, new THREE.Vector3(0, -1, 0));
      var groundIntersects = downRaycaster.intersectObjects(buildableObjects);

      var currentGroundY = 0;
      if (groundIntersects.length > 0) {
        var distanceToGround = groundIntersects[0].distance;
        if (distanceToGround <= eyeHeight + 0.3) {
          currentGroundY = playerPos.y - distanceToGround;
        }
      }

      playerPos.y += playerVelocityY * delta;
      if (playerPos.y <= currentGroundY + eyeHeight) {
        playerPos.y = currentGroundY + eyeHeight;
        playerVelocityY = 0;
        canJump = true;
      }
    }

    prevTime = time;

    // Animación de Tráfico y Peatones
    vehiclesGroup.children.forEach(function (car) {
      car.position.z += car.userData.speed;
      if (car.position.z > 50) car.position.z = -130;
      if (car.position.z < -130) car.position.z = 50;
    });

    npcsGroup.children.forEach(function (npc) {
      npc.position.z += npc.userData.speed * npc.userData.dir;
      if (Math.abs(npc.position.z) > 90) npc.userData.dir *= -1;
    });

    dronesGroup.children.forEach(function (drone) {
      var t = clock.getElapsedTime() * drone.userData.speed;
      drone.position.x += Math.sin(t + drone.userData.offset) * 0.1;
    });

    // Flotación de Hologramas
    var elapsedTime = clock.getElapsedTime();
    hologramsGroup.children.forEach(function (mesh, index) {
      mesh.position.y = 3.2 + Math.sin(elapsedTime * 2 + index) * 0.15;
    });

    renderer.render(scene, camera);
  }

  animate();

  window.addEventListener("resize", function () {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
})();