/* =====================================================================
   METAVERSO URBANO 3D · FÍSICAS, SALTO, CONSTRUCCIÓN Y ESTILOS DINÁMICOS
   ===================================================================== */
(function () {
  "use strict";

  var container = document.getElementById("webgl-container");
  var overlay = document.getElementById("instructions-overlay");
  var startBtn = document.getElementById("startBtn");

  if (!container) return;

  // 1. Sincronización real del estilo activo de la web
  var urlParams = new URLSearchParams(window.location.search);
  var currentStyle = urlParams.get('style') || localStorage.getItem('hugo-style') || document.documentElement.getAttribute("data-style") || "unico";
  
  var themeColors = {
    unico: { bg: 0x07070b, fog: 0x07070b, primary: 0xe4172b, secondary: 0xff3a4d, grid: 0x1b1b22 },
    professional: { bg: 0x0e1626, fog: 0x0e1626, primary: 0x6ea8fe, secondary: 0xe03a4c, grid: 0x1b2c4c },
    gamer: { bg: 0x000000, fog: 0x000000, primary: 0xff0000, secondary: 0x21e6c1, grid: 0x222222 },
    retro: { bg: 0x0d0d12, fog: 0x0d0d12, primary: 0x3ddc84, secondary: 0xff2e4c, grid: 0x1d1d28 }
  };
  var palette = themeColors[currentStyle] || themeColors.unico;

  // 2. Escena, Cámara y Renderizador
  var scene = new THREE.Scene();
  scene.background = new THREE.Color(palette.bg);
  scene.fog = new THREE.FogExp2(palette.bg, 0.015);

  var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 2.2, 12);

  var renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  container.appendChild(renderer.domElement);

  // 3. Controles en Primera Persona
  var controls = new THREE.PointerLockControls(camera, document.body);

  startBtn.addEventListener("click", function () {
    controls.lock();
  });

  controls.addEventListener("lock", function () {
    overlay.style.opacity = "0";
    setTimeout(function () { overlay.hidden = true; }, 500);
  });

  controls.addEventListener("unlock", function () {
    overlay.hidden = false;
    overlay.style.opacity = "1";
  });

  scene.add(controls.getObject());

  // 4. Iluminación y Sombras
  var ambientLight = new THREE.AmbientLight(0xffffff, 0.65);
  scene.add(ambientLight);

  var dirLight = new THREE.DirectionalLight(palette.primary, 1.2);
  dirLight.position.set(30, 60, 30);
  dirLight.castShadow = true;
  dirLight.shadow.mapSize.width = 2048;
  dirLight.shadow.mapSize.height = 2048;
  scene.add(dirLight);

  // 5. Suelo y Calles Urbanas
  var floorGeo = new THREE.PlaneGeometry(300, 300);
  var floorMat = new THREE.MeshStandardMaterial({ color: palette.bg, roughness: 0.9, metalness: 0.1 });
  var floor = new THREE.Mesh(floorGeo, floorMat);
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = 0;
  floor.receiveShadow = true;
  scene.add(floor);

  var gridHelper = new THREE.GridHelper(300, 75, palette.primary, palette.grid);
  gridHelper.position.y = 0.01;
  scene.add(gridHelper);

  // 6. Generación de Ciudad Irregular (Evitando zonas de paso central)
  var buildingsGroup = new THREE.Group();
  var buildableObjects = [floor];
  var blockSize = 1; // Bloques pequeños tipo Minecraft (1x1x1)

  for (var x = -50; x <= 50; x += 10) {
    for (var z = -80; z <= -10; z += 10) {
      // Dejar la avenida central completamente libre de edificios
      if (Math.abs(x) < 7) continue;

      var offsetX = (Math.sin(x * 12.9898 + z * 78.233) * 3);
      var offsetZ = (Math.cos(x * 4.1414 + z * 12.121) * 3);
      var posX = x + offsetX;
      var posZ = z + offsetZ;

      var width = 6 + Math.abs(Math.sin(x) * 2);
      var depth = 6 + Math.abs(Math.cos(z) * 2);
      var height = 12 + Math.abs(Math.sin(x * z) * 20);

      var bGeo = new THREE.BoxGeometry(width, height, depth);
      var bMat = new THREE.MeshStandardMaterial({ color: 0x111118, roughness: 0.5, metalness: 0.7 });
      var building = new THREE.Mesh(bGeo, bMat);
      building.position.set(posX, height / 2, posZ);
      building.castShadow = true;
      building.receiveShadow = true;
      buildingsGroup.add(building);
      buildableObjects.push(building);
    }
  }
  scene.add(buildingsGroup);

  // 7. Secciones, Señales Indicadoras y Hologramas Interactivos (Ubicados en zonas libres)
  var sectionsData = [
    { title: "SOBRE MÍ", emoji: "🧠", sub: "Perfil y Valores", url: "sobre.html", x: -10, z: -18 },
    { title: "TRAYECTORIA", emoji: "⚡", sub: "SMX, Erasmus y DAM", url: "trabajo.html", x: -10, z: -38 },
    { title: "ME GUSTA", emoji: "🎮", sub: "Bento Grid e Intereses", url: "gusta.html", x: 10, z: -18 },
    { title: "FUTURO e IA", emoji: "🚀", sub: "Roadmap e Inteligencia Artificial", url: "futuro.html", x: 10, z: -38 },
    { title: "CONTACTO", emoji: "✉️", sub: "Formulario y Enlaces", url: "contacto.html", x: 0, z: -58 }
  ];

  var hologramsGroup = new THREE.Group();
  var clickablePortals = [];

  sectionsData.forEach(function (data) {
    // A) SEÑAL GUÍA (Poste colocado detrás para no tapar el texto)
    var poleGeo = new THREE.CylinderGeometry(0.08, 0.08, 4.5, 8);
    var poleMat = new THREE.MeshStandardMaterial({ color: 0x555566, metalness: 0.8 });
    var pole = new THREE.Mesh(poleGeo, poleMat);
    pole.position.set(data.x, 2.25, data.z + 2.6);
    scene.add(pole);

    var signCanvas = document.createElement("canvas");
    signCanvas.width = 256;
    signCanvas.height = 128;
    var sCtx = signCanvas.getContext("2d");
    sCtx.fillStyle = "rgba(12, 12, 20, 0.95)";
    sCtx.fillRect(0, 0, signCanvas.width, signCanvas.height);
    sCtx.strokeStyle = "#ffffff";
    sCtx.lineWidth = 6;
    sCtx.strokeRect(4, 4, signCanvas.width - 8, signCanvas.height - 8);
    sCtx.fillStyle = "#ffffff";
    sCtx.font = "bold 22px 'Space Grotesk', sans-serif";
    sCtx.textAlign = "center";
    sCtx.textBaseline = "middle";
    sCtx.fillText("➜ " + data.title, signCanvas.width / 2, signCanvas.height / 2);

    var signTex = new THREE.CanvasTexture(signCanvas);
    var signMat = new THREE.MeshBasicMaterial({ map: signTex, side: THREE.DoubleSide });
    var signMesh = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 1.1), signMat);
    signMesh.position.set(data.x, 3.8, data.z + 2.5);
    scene.add(signMesh);

    // B) HOLOGRAMA PORTAL INTERACTIVO (En zona abierta)
    var canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 256;
    var ctx = canvas.getContext("2d");

    ctx.fillStyle = "rgba(10, 10, 16, 0.9)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = "#" + palette.primary.toString(16);
    ctx.lineWidth = 10;
    ctx.strokeRect(6, 6, canvas.width - 12, canvas.height - 12);

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 36px 'Space Grotesk', sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(data.emoji + " " + data.title, canvas.width / 2, canvas.height / 2 - 25);

    ctx.fillStyle = "#" + palette.secondary.toString(16);
    ctx.font = "18px monospace";
    ctx.fillText(data.sub, canvas.width / 2, canvas.height / 2 + 25);

    ctx.fillStyle = "rgba(255,255,255,0.6)";
    ctx.font = "15px monospace";
    ctx.fillText("[ CLIC PARA ENTRAR AL PORTAL ]", canvas.width / 2, canvas.height / 2 + 65);

    var texture = new THREE.CanvasTexture(canvas);
    var mat = new THREE.MeshBasicMaterial({ map: texture, transparent: true, opacity: 0.95, side: THREE.DoubleSide });
    var geo = new THREE.PlaneGeometry(4.2, 2.1);
    var mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(data.x, 3.2, data.z);
    mesh.userData = { url: data.url };

    var pedGeo = new THREE.CylinderGeometry(0.25, 0.5, 2.5, 8);
    var pedMat = new THREE.MeshStandardMaterial({ color: palette.primary, emissive: palette.primary, emissiveIntensity: 0.6 });
    var pedestal = new THREE.Mesh(pedGeo, pedMat);
    pedestal.position.set(data.x, 1.25, data.z);
    scene.add(pedestal);

    hologramsGroup.add(mesh);
    clickablePortals.push(mesh);
  });

  scene.add(hologramsGroup);

  // 8. Físicas, Movimiento WASD, Gravedad y Salto
  var moveForward = false;
  var moveBackward = false;
  var moveLeft = false;
  var moveRight = false;
  var canJump = false;

  var velocity = new THREE.Vector3();
  var direction = new THREE.Vector3();
  var gravity = 30.0;
  var jumpForce = 10.0;
  var playerVelocityY = 0;
  var prevTime = performance.now();

  document.addEventListener("keydown", function (e) {
    if (e.code === "KeyW" || e.code === "ArrowUp") moveForward = true;
    if (e.code === "KeyA" || e.code === "ArrowLeft") moveLeft = true;
    if (e.code === "KeyS" || e.code === "ArrowDown") moveBackward = true;
    if (e.code === "KeyD" || e.code === "ArrowRight") moveRight = true;
    if (e.code === "Space" && canJump) {
      playerVelocityY = jumpForce;
      canJump = false;
    }
  });

  document.addEventListener("keyup", function (e) {
    if (e.code === "KeyW" || e.code === "ArrowUp") moveForward = false;
    if (e.code === "KeyA" || e.code === "ArrowLeft") moveLeft = false;
    if (e.code === "KeyS" || e.code === "ArrowDown") moveBackward = false;
    if (e.code === "KeyD" || e.code === "ArrowRight") moveRight = false;
  });

  // 9. Sistema de Construcción (Clic Izq) y Destrucción (Clic Der) Tipo Minecraft
  var builtBlocks = [];
  var raycaster = new THREE.Raycaster();

  // CONSTRUIR (Clic Izquierdo)
  window.addEventListener("click", function (e) {
    if (!controls.isLocked || e.button !== 0) return;

    raycaster.setFromCamera(new THREE.Vector2(0, 0), camera);
    var intersects = raycaster.intersectObjects(clickablePortals.concat(buildableObjects).concat(builtBlocks));

    if (intersects.length > 0) {
      var hit = intersects[0];

      if (hit.object.userData && hit.object.userData.url) {
        window.location.href = hit.object.userData.url;
        return;
      }

      if (hit.face) {
        var targetPos = new THREE.Vector3().copy(hit.point).add(hit.face.normal.clone().multiplyScalar(blockSize / 2));
        
        targetPos.x = Math.floor((targetPos.x + blockSize / 2) / blockSize) * blockSize;
        targetPos.y = Math.floor((targetPos.y + blockSize / 2) / blockSize) * blockSize + blockSize / 2;
        targetPos.z = Math.floor((targetPos.z + blockSize / 2) / blockSize) * blockSize;

        var blockGeo = new THREE.BoxGeometry(blockSize, blockSize, blockSize);
        var blockMat = new THREE.MeshStandardMaterial({ 
          color: palette.secondary, 
          emissive: palette.primary,
          emissiveIntensity: 0.3,
          roughness: 0.3, 
          metalness: 0.8 
        });
        var block = new THREE.Mesh(blockGeo, blockMat);
        block.position.copy(targetPos);
        block.castShadow = true;
        block.receiveShadow = true;

        scene.add(block);
        builtBlocks.push(block);
        buildableObjects.push(block);
      }
    }
  });

  // DESTRUIR / QUITAR BLOQUES (Clic Derecho)
  window.addEventListener("contextmenu", function (e) {
    e.preventDefault(); // Evitar menú contextual predeterminado
    if (!controls.isLocked) return;

    raycaster.setFromCamera(new THREE.Vector2(0, 0), camera);
    var intersects = raycaster.intersectObjects(builtBlocks); // Solo permite quitar bloques construidos por el usuario

    if (intersects.length > 0) {
      var targetBlock = intersects[0].object;
      
      // Eliminar de la escena
      scene.remove(targetBlock);

      // Eliminar de los arrays de control
      builtBlocks = builtBlocks.filter(function(b) { return b !== targetBlock; });
      buildableObjects = buildableObjects.filter(function(b) { return b !== targetBlock; });
    }
  });

  // 10. Bucle de Renderizado y Física
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

      // Aplicar gravedad y salto
      playerVelocityY -= gravity * delta;
      controls.getObject().position.y += playerVelocityY * delta;

      // Colisión básica con el suelo (altura de ojos = 2.2)
      if (controls.getObject().position.y < 2.2) {
        controls.getObject().position.y = 2.2;
        playerVelocityY = 0;
        canJump = true;
      }
    }

    prevTime = time;

    // Animación de hologramas
    var elapsedTime = clock.getElapsedTime();
    hologramsGroup.children.forEach(function (mesh, index) {
      mesh.position.y = 3.2 + Math.sin(elapsedTime * 2 + index) * 0.15;
      mesh.rotation.y = Math.sin(elapsedTime * 0.5 + index) * 0.1;
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