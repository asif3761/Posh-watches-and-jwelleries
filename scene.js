/* ============================================================
   NOIR & AURUM — 3D scene (Three.js)
   Two independent WebGL contexts:
   1. #scene-bg   — fixed full-viewport depth-field of drifting
                    gold/wine particles, always running.
   2. #hero-3d    — a real, draggable 3D emblem (bezel ring +
                    orbiting band + faceted gem) mounted only
                    while the home route is active.
   Falls back silently (no canvas rendered) if Three.js failed
   to load — the rest of the site works without it.
   ============================================================ */
window.NoirScene = (() => {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const hasThree = typeof THREE !== "undefined";

  let bgRenderer, bgScene, bgCamera, bgPoints, bgRAF;
  let heroRenderer, heroScene, heroCamera, heroGroup, heroGem, heroRing2, heroRAF;

  /* ---------------------------------------------------------
     Ambient background depth-field
  --------------------------------------------------------- */
  function initBackground(){
    if(!hasThree) return;
    const canvas = document.getElementById("scene-bg");
    if(!canvas) return;

    bgRenderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false });
    bgRenderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    bgScene = new THREE.Scene();
    bgCamera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 2000);
    bgCamera.position.z = 420;

    const count = 650;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const gold = new THREE.Color(0x9aa4b0);
    const burgundy = new THREE.Color(0x5b8fa3);
    for(let i = 0; i < count; i++){
      positions[i*3]   = (Math.random() - 0.5) * 1700;
      positions[i*3+1] = (Math.random() - 0.5) * 1700;
      positions[i*3+2] = (Math.random() - 0.5) * 1300;
      const c = Math.random() > 0.65 ? burgundy : gold;
      colors[i*3] = c.r; colors[i*3+1] = c.g; colors[i*3+2] = c.b;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    const mat = new THREE.PointsMaterial({
      size: 2.2, vertexColors: true, transparent: true, opacity: 0.5,
      depthWrite: false, blending: THREE.AdditiveBlending,
    });
    bgPoints = new THREE.Points(geo, mat);
    bgScene.add(bgPoints);

    function resize(){
      bgCamera.aspect = window.innerWidth / window.innerHeight;
      bgCamera.updateProjectionMatrix();
      bgRenderer.setSize(window.innerWidth, window.innerHeight);
    }
    resize();
    window.addEventListener("resize", resize);

    let mx = 0, my = 0;
    window.addEventListener("mousemove", (e) => {
      mx = (e.clientX / window.innerWidth - 0.5);
      my = (e.clientY / window.innerHeight - 0.5);
    });

    function tick(){
      bgPoints.rotation.y += 0.0007;
      bgPoints.rotation.x += 0.00022;
      bgCamera.position.x += (mx * 60 - bgCamera.position.x) * 0.02;
      bgCamera.position.y += (-my * 60 - bgCamera.position.y) * 0.02;
      bgCamera.lookAt(0,0,0);
      bgRenderer.render(bgScene, bgCamera);
      bgRAF = requestAnimationFrame(tick);
    }
    if(reduceMotion){
      bgRenderer.render(bgScene, bgCamera);
    } else {
      tick();
    }
  }

  /* ---------------------------------------------------------
     Hero emblem — mounted/unmounted per route by app.js
  --------------------------------------------------------- */
  function mountHero(){
    if(!hasThree) return;
    const canvas = document.getElementById("hero-3d");
    if(!canvas) return;
    unmountHero();

    const container = canvas.parentElement;
    let w = container.clientWidth || 260, h = container.clientHeight || 260;

    heroRenderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    heroRenderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    heroRenderer.setSize(w, h);

    heroScene = new THREE.Scene();
    heroCamera = new THREE.PerspectiveCamera(38, w / h, 0.1, 100);
    heroCamera.position.set(0, 0, 7.2);

    heroScene.add(new THREE.AmbientLight(0x1c1f22, 1.3));
    const goldLight = new THREE.PointLight(0xe6ebf0, 2.4, 22);
    goldLight.position.set(4, 4, 5);
    heroScene.add(goldLight);
    const burgLight = new THREE.PointLight(0x5b8fa3, 2.0, 22);
    burgLight.position.set(-4, -3, 4);
    heroScene.add(burgLight);
    const rim = new THREE.PointLight(0xffffff, 0.6, 20);
    rim.position.set(0, 0, -6);
    heroScene.add(rim);

    heroGroup = new THREE.Group();

    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(2.15, 0.15, 28, 100),
      new THREE.MeshStandardMaterial({ color: 0x9aa4b0, metalness: 0.92, roughness: 0.24, emissive: 0x1a2226, emissiveIntensity: 0.35 })
    );
    heroGroup.add(ring);

    heroRing2 = new THREE.Mesh(
      new THREE.TorusGeometry(1.55, 0.028, 16, 100),
      new THREE.MeshStandardMaterial({ color: 0x5b8fa3, metalness: 0.55, roughness: 0.4 })
    );
    heroRing2.rotation.x = Math.PI / 2.35;
    heroGroup.add(heroRing2);

    heroGem = new THREE.Mesh(
      new THREE.IcosahedronGeometry(0.82, 0),
      new THREE.MeshStandardMaterial({ color: 0x5b8fa3, metalness: 0.25, roughness: 0.12, emissive: 0x16262c, emissiveIntensity: 0.55, flatShading: true })
    );
    heroGroup.add(heroGem);

    const ticks = new THREE.Group();
    for(let i = 0; i < 12; i++){
      const angle = (i / 12) * Math.PI * 2;
      const tick = new THREE.Mesh(
        new THREE.BoxGeometry(0.04, 0.22, 0.04),
        new THREE.MeshStandardMaterial({ color: 0xe6ebf0, metalness: 0.8, roughness: 0.3 })
      );
      tick.position.set(Math.cos(angle) * 1.9, Math.sin(angle) * 1.9, 0);
      tick.lookAt(0,0,0);
      ticks.add(tick);
    }
    heroGroup.add(ticks);

    heroScene.add(heroGroup);

    function resize(){
      w = container.clientWidth; h = container.clientHeight;
      if(!w || !h) return;
      heroCamera.aspect = w / h;
      heroCamera.updateProjectionMatrix();
      heroRenderer.setSize(w, h);
    }
    resize();
    let ro = null;
    if("ResizeObserver" in window){
      ro = new ResizeObserver(resize);
      ro.observe(container);
    } else {
      window.addEventListener("resize", resize);
    }

    let targetRotY = 0, targetRotX = 0;
    let dragging = false, lastX = 0, lastY = 0;

    function onMove(clientX, clientY){
      const rect = container.getBoundingClientRect();
      const x = (clientX - rect.left) / rect.width - 0.5;
      const y = (clientY - rect.top) / rect.height - 0.5;
      targetRotY = x * 1.1;
      targetRotX = -y * 0.6;
    }
    function pointerMove(e){ onMove(e.clientX, e.clientY); }
    function pointerDown(e){ dragging = true; lastX = e.clientX; lastY = e.clientY; container.style.cursor = "grabbing"; }
    function pointerUp(){ dragging = false; container.style.cursor = "grab"; }
    function dragMove(e){
      if(!dragging) return;
      const dx = e.clientX - lastX, dy = e.clientY - lastY;
      lastX = e.clientX; lastY = e.clientY;
      targetRotY += dx * 0.01;
      targetRotX -= dy * 0.01;
    }

    container.style.cursor = "grab";
    container.addEventListener("pointermove", (e) => { pointerMove(e); dragMove(e); });
    container.addEventListener("pointerdown", pointerDown);
    window.addEventListener("pointerup", pointerUp);

    let clock = 0;
    function tick(){
      clock += 0.01;
      heroGroup.rotation.y += (targetRotY - heroGroup.rotation.y) * 0.045 + (dragging ? 0 : 0.0035);
      heroGroup.rotation.x += (targetRotX - heroGroup.rotation.x) * 0.045;
      heroGem.rotation.y += 0.012;
      heroGem.rotation.x += 0.007;
      heroRing2.rotation.z += 0.003;
      heroGroup.position.y = Math.sin(clock * 0.6) * 0.06;
      heroRenderer.render(heroScene, heroCamera);
      heroRAF = requestAnimationFrame(tick);
    }
    heroRenderer.__cleanup = () => {
      window.removeEventListener("pointerup", pointerUp);
      if(ro) ro.disconnect(); else window.removeEventListener("resize", resize);
    };

    if(reduceMotion){
      heroRenderer.render(heroScene, heroCamera);
    } else {
      tick();
    }
  }

  function unmountHero(){
    if(heroRAF) cancelAnimationFrame(heroRAF);
    if(heroRenderer){
      if(heroRenderer.__cleanup) heroRenderer.__cleanup();
      heroRenderer.dispose();
    }
    heroRenderer = heroScene = heroCamera = heroGroup = heroGem = heroRing2 = null;
  }

  return { initBackground, mountHero, unmountHero, get active(){ return hasThree; } };
})();
