(() => {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  document.getElementById("year").textContent = new Date().getFullYear();

  /* ---------------------------------------------------------
     1. Bezel hour ticks (12 marks drawn around the hero ring)
  --------------------------------------------------------- */
  (function drawTicks(){
    const g = document.querySelector(".bezel-ticks");
    if(!g) return;
    const cx = 200, cy = 200, rOuter = 164, rInner = 150;
    for(let i=0;i<12;i++){
      const angle = (i / 12) * Math.PI * 2 - Math.PI/2;
      const x1 = cx + Math.cos(angle) * rOuter;
      const y1 = cy + Math.sin(angle) * rOuter;
      const x2 = cx + Math.cos(angle) * rInner;
      const y2 = cy + Math.sin(angle) * rInner;
      const line = document.createElementNS("http://www.w3.org/2000/svg","line");
      line.setAttribute("x1", x1.toFixed(2));
      line.setAttribute("y1", y1.toFixed(2));
      line.setAttribute("x2", x2.toFixed(2));
      line.setAttribute("y2", y2.toFixed(2));
      line.style.animationDelay = (0.9 + i*0.05) + "s";
      g.appendChild(line);
    }
  })();

  /* ---------------------------------------------------------
     2. Product placeholder data — Timepieces & Fragrances
  --------------------------------------------------------- */
  const watchIcon = `<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="1.6">
    <circle cx="32" cy="32" r="20"/>
    <circle cx="32" cy="32" r="1.8" fill="currentColor" stroke="none"/>
    <path d="M32 20v12l8 6"/>
    <path d="M27 8h10M27 56h10"/>
    <path d="M20 12l4 6M44 12l-4 6M20 52l4-6M44 52l-4-6"/>
  </svg>`;

  const bottleIcon = `<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="1.6">
    <rect x="20" y="10" width="10" height="8" rx="1"/>
    <path d="M22 18v6c-6 3-9 9-9 16v14a3 3 0 0 0 3 3h20a3 3 0 0 0 3-3V40c0-7-3-13-9-16v-6"/>
    <path d="M17 46h20" opacity=".5"/>
  </svg>`;

  const timepieces = [
    { name: "The Meridian",   tag: "Coming to the Atelier", note: "Blackened steel · gold index" },
    { name: "The Obsidian",   tag: "Coming to the Atelier", note: "Automatic movement" },
    { name: "The Regent",     tag: "Coming to the Atelier", note: "Limited run of 50" },
  ];

  const fragrances = [
    { name: "Fumée Noire",    tag: "In the Blending Room", note: "Smoke · leather · oud" },
    { name: "Aurum Nocturne", tag: "In the Blending Room", note: "Amber · gilded musk" },
    { name: "Cendre",         tag: "In the Blending Room", note: "Ash · vetiver · vanilla" },
  ];

  function renderCards(list, icon, gridId){
    const grid = document.getElementById(gridId);
    if(!grid) return;
    grid.innerHTML = list.map(item => `
      <article class="p-card" tabindex="0">
        <div class="icon">${icon}</div>
        <h3>${item.name}</h3>
        <span class="tag">${item.tag}</span>
        <p class="price">${item.note}</p>
      </article>
    `).join("");
  }
  renderCards(timepieces, watchIcon, "timepiece-grid");
  renderCards(fragrances, bottleIcon, "fragrance-grid");

  /* ---------------------------------------------------------
     3. Scroll-triggered reveals (IntersectionObserver)
  --------------------------------------------------------- */
  const revealTargets = document.querySelectorAll(
    ".section-head, .p-card, .contact-card, .atelier-body p"
  );
  if("IntersectionObserver" in window && !reduceMotion){
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry, idx) => {
        if(entry.isIntersecting){
          setTimeout(() => entry.target.classList.add("in-view"), (idx % 4) * 90);
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.18, rootMargin: "0px 0px -60px 0px" });
    revealTargets.forEach(el => io.observe(el));
  } else {
    revealTargets.forEach(el => el.classList.add("in-view"));
  }

  /* ---------------------------------------------------------
     4. Chronograph scroll-progress ring
  --------------------------------------------------------- */
  const chronoFill = document.querySelector(".chrono-fill");
  const CIRC = 176; // 2 * PI * 28, matches stroke-dasharray in CSS
  function updateChrono(){
    const scrollTop = window.scrollY;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const pct = max > 0 ? Math.min(scrollTop / max, 1) : 0;
    if(chronoFill) chronoFill.style.strokeDashoffset = (CIRC * (1 - pct)).toFixed(1);
  }
  document.addEventListener("scroll", updateChrono, { passive: true });
  updateChrono();

  /* ---------------------------------------------------------
     5. Ambient smoke particle canvas
  --------------------------------------------------------- */
  const canvas = document.getElementById("smoke-canvas");
  if(canvas && !reduceMotion){
    const ctx = canvas.getContext("2d");
    let w, h, dpr;
    function resize(){
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.width = window.innerWidth * dpr;
      h = canvas.height = window.innerHeight * dpr;
      canvas.style.width = window.innerWidth + "px";
      canvas.style.height = window.innerHeight + "px";
    }
    resize();
    window.addEventListener("resize", resize);

    const particles = [];
    const MAX_PARTICLES = 34;
    const goldTones = ["199,163,86", "239,215,154", "138,115,69"];

    function spawn(x, y, burst){
      particles.push({
        x: x ?? Math.random() * w,
        y: y ?? h + 40 * dpr,
        r: (burst ? 14 : 24) + Math.random() * (burst ? 20 : 46),
        vy: -(0.18 + Math.random() * 0.35) * dpr,
        vx: (Math.random() - 0.5) * 0.25 * dpr,
        life: 0,
        maxLife: burst ? 90 : 600 + Math.random() * 400,
        alpha: burst ? 0.35 : 0.10 + Math.random() * 0.08,
        tone: goldTones[Math.floor(Math.random()*goldTones.length)],
        drift: Math.random() * Math.PI * 2,
      });
    }

    for(let i=0;i<MAX_PARTICLES;i++){
      spawn(Math.random()*w, Math.random()*h);
    }

    function tick(){
      ctx.clearRect(0,0,w,h);
      for(let i = particles.length - 1; i >= 0; i--){
        const p = particles[i];
        p.life++;
        p.y += p.vy;
        p.drift += 0.01;
        p.x += p.vx + Math.sin(p.drift) * 0.3 * dpr;
        const lifeRatio = p.life / p.maxLife;
        const fade = lifeRatio < 0.15 ? lifeRatio/0.15 : lifeRatio > 0.7 ? Math.max(0, 1 - (lifeRatio-0.7)/0.3) : 1;
        const a = p.alpha * fade;

        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r);
        grad.addColorStop(0, `rgba(${p.tone},${a})`);
        grad.addColorStop(1, `rgba(${p.tone},0)`);
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI*2);
        ctx.fill();

        if(p.life > p.maxLife || p.y < -60*dpr){
          particles.splice(i,1);
          if(particles.length < MAX_PARTICLES) spawn();
        }
      }
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);

    // expose a small burst spawner for interactive puffs
    window.__noirSmokeBurst = function(clientX, clientY){
      for(let i=0;i<6;i++){
        spawn(clientX*dpr, clientY*dpr, true);
      }
    };
  }

  /* ---------------------------------------------------------
     6. Synthesized sound design (no external audio files)
     A soft plucked chime for interactions, muted by default.
  --------------------------------------------------------- */
  let audioCtx = null;
  let soundOn = false;
  const soundToggle = document.getElementById("sound-toggle");

  function ensureAudio(){
    if(!audioCtx){
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if(audioCtx.state === "suspended") audioCtx.resume();
    return audioCtx;
  }

  function chime(kind){
    if(!soundOn) return;
    const ctx = ensureAudio();
    const now = ctx.currentTime;
    const freqs = kind === "click" ? [523.25, 783.99] : [392.0, 587.33]; // soft fifths
    const master = ctx.createGain();
    master.gain.value = 0.0001;
    master.connect(ctx.destination);

    freqs.forEach((f, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = f;
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(kind === "click" ? 0.05 : 0.03, now + 0.02 + i*0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + (kind === "click" ? 0.5 : 0.9));
      osc.connect(gain);
      gain.connect(master);
      osc.start(now);
      osc.stop(now + 1);
    });
  }

  soundToggle?.addEventListener("click", () => {
    soundOn = !soundOn;
    soundToggle.setAttribute("aria-pressed", String(soundOn));
    soundToggle.querySelector(".sound-icon").textContent = soundOn ? "◉" : "◔";
    if(soundOn){ ensureAudio(); chime("click"); }
  });

  document.querySelectorAll("[data-sound], .p-card, .contact-card").forEach(el => {
    el.addEventListener("mouseenter", () => chime("soft"));
    el.addEventListener("click", (e) => {
      chime("click");
      if(window.__noirSmokeBurst){
        window.__noirSmokeBurst(e.clientX, e.clientY);
      }
    });
  });

})();
