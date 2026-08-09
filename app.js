/* ============================================================
   NOIR & AURUM — app
   Hash router + full-screen "iris" transition (gold wipe + smoke
   burst) between every page change, plus cart & checkout views.
   ============================================================ */
(() => {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const app = document.getElementById("app");
  const overlay = document.getElementById("page-transition");
  const toastRoot = document.getElementById("toast-root");
  const yearEl = document.getElementById("year");
  if(yearEl) yearEl.textContent = new Date().getFullYear();

  const fmt = (n) => "৳" + n.toLocaleString("en-US");

  /* ---------------------------------------------------------
     Orders (localStorage)
  --------------------------------------------------------- */
  const ORDERS_KEY = "noir-aurum-orders";
  function saveOrder(order){
    const all = JSON.parse(localStorage.getItem(ORDERS_KEY) || "[]");
    all.push(order);
    localStorage.setItem(ORDERS_KEY, JSON.stringify(all));
  }
  function getOrder(id){
    const all = JSON.parse(localStorage.getItem(ORDERS_KEY) || "[]");
    return all.find(o => o.id === id);
  }
  function makeOrderId(){
    return "NA-" + Date.now().toString(36).toUpperCase().slice(-5);
  }

  const WHATSAPP_NUMBER = "8801951467502";
  const BKASH_NUMBER_PLACEHOLDER = "— add your bKash merchant number here —";

  /* ---------------------------------------------------------
     Toasts
  --------------------------------------------------------- */
  function toast(msg){
    const el = document.createElement("div");
    el.className = "toast";
    el.textContent = msg;
    toastRoot.appendChild(el);
    requestAnimationFrame(() => el.classList.add("show"));
    setTimeout(() => {
      el.classList.remove("show");
      setTimeout(() => el.remove(), 400);
    }, 2600);
  }

  /* ---------------------------------------------------------
     Product icon / card helpers
  --------------------------------------------------------- */
  function productBy(id){ return window.NOIR_PRODUCTS.find(p => p.id === id); }

  function cardHTML(p){
    return `
      <article class="p-card reveal" data-route="/product/${p.id}" tabindex="0">
        <div class="icon">${window.NOIR_ICONS[p.icon]}</div>
        <h3>${p.name}</h3>
        <span class="tag">Pre-Order</span>
        <p class="p-tagline">${p.tagline}</p>
        <div class="p-card-foot">
          <span class="price">${fmt(p.price)}</span>
          <button class="btn-mini" data-action="quick-add" data-id="${p.id}">+ Cart</button>
        </div>
      </article>`;
  }

  /* ---------------------------------------------------------
     VIEWS
  --------------------------------------------------------- */
  function viewHome(){
    return `
      <section class="hero">
        <div class="hero-mark" id="hero-mark">
          <svg viewBox="0 0 400 400" class="bezel-svg" aria-hidden="true">
            <circle class="bezel-outer" cx="200" cy="200" r="164"/>
            <circle class="bezel-inner" cx="200" cy="200" r="130"/>
            <g class="bezel-ticks"></g>
            <g class="bottle-mark">
              <path d="M186 90 h28 v22 h-6 v14 c18 6 30 24 30 46 v96 c0 12 -10 22 -22 22 h-32 c-12 0 -22 -10 -22 -22 v-96 c0 -22 12 -40 30 -46 v-14 h-6 z"/>
              <rect x="188" y="86" width="24" height="10" rx="2" class="bottle-cap"/>
            </g>
          </svg>
        </div>
        <p class="eyebrow">Est. for those who keep their own hours</p>
        <h1 class="hero-title">Noir <span class="amp">&amp;</span> Aurum</h1>
        <p class="hero-sub">Timepieces struck in shadow. Fragrances distilled from gold.</p>
        <a href="#/timepieces" class="scroll-cue" data-route="/timepieces">
          <span>Enter the Atelier</span>
          <svg viewBox="0 0 24 24" width="16" height="16"><path d="M12 4v14M6 13l6 6 6-6" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>
        </a>
      </section>

      <section class="collection">
        <div class="section-head reveal">
          <span class="hour-mark">III</span>
          <h2>Timepieces</h2>
          <p class="section-note">Mechanical movements, cased in blackened steel and aurum gold.</p>
        </div>
        <div class="card-grid">
          ${window.NOIR_PRODUCTS.filter(p => p.collection === "timepieces").slice(0,3).map(cardHTML).join("")}
        </div>
      </section>

      <section class="collection alt">
        <div class="section-head reveal">
          <span class="hour-mark">VI</span>
          <h2>Fragrances</h2>
          <p class="section-note">Smoke, leather, and gilded amber, bottled in dark glass.</p>
        </div>
        <div class="card-grid">
          ${window.NOIR_PRODUCTS.filter(p => p.collection === "fragrances").slice(0,3).map(cardHTML).join("")}
        </div>
      </section>`;
  }

  function viewCollection(key, title, note, hourMark){
    const items = window.NOIR_PRODUCTS.filter(p => p.collection === key);
    return `
      <section class="collection page-top">
        <div class="section-head reveal">
          <span class="hour-mark">${hourMark}</span>
          <h2>${title}</h2>
          <p class="section-note">${note}</p>
        </div>
        <div class="card-grid">${items.map(cardHTML).join("")}</div>
      </section>`;
  }

  function viewProduct(id){
    const p = productBy(id);
    if(!p) return `<section class="collection page-top"><p class="section-note">That piece could not be found. <a href="#/" data-route="/">Return home.</a></p></section>`;
    return `
      <section class="product-detail page-top reveal">
        <a href="#/${p.collection}" data-route="/${p.collection}" class="back-link">&larr; Back to ${p.collection === "timepieces" ? "Timepieces" : "Fragrances"}</a>
        <div class="product-layout">
          <div class="product-icon">${window.NOIR_ICONS[p.icon]}</div>
          <div class="product-info">
            <span class="tag">Pre-Order</span>
            <h1>${p.name}</h1>
            <p class="p-tagline big">${p.tagline}</p>
            <p class="product-desc">${p.desc}</p>
            <div class="price-row">
              <span class="price big">${fmt(p.price)}</span>
            </div>
            <div class="qty-row">
              <div class="qty-stepper" data-qty="1">
                <button type="button" data-action="qty-dec" aria-label="Decrease quantity">&minus;</button>
                <span class="qty-value">1</span>
                <button type="button" data-action="qty-inc" aria-label="Increase quantity">&plus;</button>
              </div>
              <button class="btn-primary" data-action="add-to-cart" data-id="${p.id}">Add to Cart</button>
            </div>
          </div>
        </div>
      </section>`;
  }

  function viewCart(){
    const items = window.NoirCart.detailed();
    if(items.length === 0){
      return `
        <section class="collection page-top reveal">
          <div class="section-head">
            <span class="hour-mark">&mdash;</span>
            <h2>Your Cart</h2>
            <p class="section-note">Nothing here yet. Browse the <a href="#/timepieces" data-route="/timepieces">Timepieces</a> or <a href="#/fragrances" data-route="/fragrances">Fragrances</a>.</p>
          </div>
        </section>`;
    }
    const subtotal = window.NoirCart.subtotal();
    return `
      <section class="cart-page page-top reveal">
        <div class="section-head">
          <span class="hour-mark">&mdash;</span>
          <h2>Your Cart</h2>
        </div>
        <div class="cart-list">
          ${items.map(i => `
            <div class="cart-row" data-id="${i.id}">
              <div class="cart-icon">${window.NOIR_ICONS[i.icon]}</div>
              <div class="cart-info">
                <h3>${i.name}</h3>
                <span class="p-tagline">${i.tagline}</span>
              </div>
              <div class="qty-stepper small" data-qty="${i.qty}">
                <button type="button" data-action="cart-dec" data-id="${i.id}" aria-label="Decrease quantity">&minus;</button>
                <span class="qty-value">${i.qty}</span>
                <button type="button" data-action="cart-inc" data-id="${i.id}" aria-label="Increase quantity">&plus;</button>
              </div>
              <span class="cart-line-total">${fmt(i.lineTotal)}</span>
              <button class="cart-remove" data-action="cart-remove" data-id="${i.id}" aria-label="Remove item">&times;</button>
            </div>`).join("")}
        </div>
        <div class="cart-summary">
          <span>Subtotal</span>
          <span class="cart-subtotal">${fmt(subtotal)}</span>
        </div>
        <div class="cart-actions">
          <a href="#/timepieces" data-route="/timepieces" class="btn-ghost">Continue Browsing</a>
          <a href="#/checkout" data-route="/checkout" class="btn-primary">Checkout</a>
        </div>
      </section>`;
  }

  function viewCheckout(){
    const items = window.NoirCart.detailed();
    if(items.length === 0){
      return `<section class="collection page-top reveal"><div class="section-head"><h2>Checkout</h2><p class="section-note">Your cart is empty. <a href="#/timepieces" data-route="/timepieces">Browse the collection</a> first.</p></div></section>`;
    }
    const subtotal = window.NoirCart.subtotal();
    return `
      <section class="checkout-page page-top reveal">
        <div class="section-head">
          <span class="hour-mark">XII</span>
          <h2>Checkout</h2>
          <p class="section-note">Orders are confirmed manually — you'll send payment via bKash and confirm on WhatsApp. Nothing is charged automatically.</p>
        </div>
        <div class="checkout-layout">
          <form id="checkout-form" class="checkout-form" novalidate>
            <label>Full name
              <input type="text" name="name" required autocomplete="name">
            </label>
            <label>Phone number
              <input type="tel" name="phone" required autocomplete="tel">
            </label>
            <label>Delivery address
              <textarea name="address" rows="3" required autocomplete="street-address"></textarea>
            </label>
            <label>Notes <span class="opt">(optional)</span>
              <textarea name="notes" rows="2"></textarea>
            </label>
            <button type="submit" class="btn-primary full">Place Order</button>
          </form>
          <aside class="order-summary">
            <h3>Order Summary</h3>
            <div class="order-lines">
              ${items.map(i => `<div class="order-line"><span>${i.qty}&times; ${i.name}</span><span>${fmt(i.lineTotal)}</span></div>`).join("")}
            </div>
            <div class="order-total"><span>Total</span><span>${fmt(subtotal)}</span></div>
          </aside>
        </div>
      </section>`;
  }

  function viewOrder(id){
    const order = getOrder(id);
    if(!order){
      return `<section class="collection page-top reveal"><div class="section-head"><h2>Order not found</h2><p class="section-note"><a href="#/" data-route="/">Return home.</a></p></div></section>`;
    }
    const waText = encodeURIComponent(
      `Order ${order.id} — Noir & Aurum\n` +
      order.items.map(i => `${i.qty}x ${i.name} — ${fmt(i.lineTotal)}`).join("\n") +
      `\nTotal: ${fmt(order.subtotal)}\n\nName: ${order.customer.name}\nPhone: ${order.customer.phone}\nAddress: ${order.customer.address}` +
      (order.customer.notes ? `\nNotes: ${order.customer.notes}` : "") +
      `\n\nI've sent payment via bKash and am confirming this order.`
    );
    const waLink = `https://wa.me/${WHATSAPP_NUMBER}?text=${waText}`;
    return `
      <section class="checkout-page page-top reveal">
        <div class="section-head">
          <span class="hour-mark">&#10003;</span>
          <h2>Order Received</h2>
          <p class="section-note">Reference <strong>${order.id}</strong> &mdash; complete payment and confirm below to finish your order.</p>
        </div>
        <div class="payment-panel">
          <div class="payment-step">
            <span class="step-num">1</span>
            <div>
              <h3>Send payment via bKash</h3>
              <p>Send <strong>${fmt(order.subtotal)}</strong> to <strong>${BKASH_NUMBER_PLACEHOLDER}</strong> using bKash &ldquo;Send Money&rdquo;, with <strong>${order.id}</strong> as the reference.</p>
            </div>
          </div>
          <div class="payment-step">
            <span class="step-num">2</span>
            <div>
              <h3>Confirm on WhatsApp</h3>
              <p>Send us your order details and bKash transaction ID so we can confirm and begin preparing your order.</p>
              <a class="btn-primary" href="${waLink}" target="_blank" rel="noopener" data-sound="click">Confirm Order on WhatsApp</a>
            </div>
          </div>
        </div>
        <div class="order-lines recap">
          ${order.items.map(i => `<div class="order-line"><span>${i.qty}&times; ${i.name}</span><span>${fmt(i.lineTotal)}</span></div>`).join("")}
          <div class="order-total"><span>Total</span><span>${fmt(order.subtotal)}</span></div>
        </div>
      </section>`;
  }

  function viewAtelier(){
    return `
      <section class="atelier page-top">
        <div class="section-head reveal">
          <span class="hour-mark">IX</span>
          <h2>The Atelier</h2>
        </div>
        <div class="atelier-body">
          <p class="reveal">Noir &amp; Aurum was founded on a simple pairing: the precision of a watch movement, and the warmth of a fragrance note. Every object we make sits at that intersection &mdash; engineered like a mechanism, worn like a scent.</p>
          <p class="reveal">We are a small house. Pieces are produced in limited runs, and each release is announced first to those who follow us directly.</p>
        </div>
      </section>`;
  }

  function viewContact(){
    return `
      <section class="contact page-top">
        <div class="section-head reveal">
          <span class="hour-mark">XII</span>
          <h2>Enquiries</h2>
          <p class="section-note">Orders and enquiries are handled directly.</p>
        </div>
        <div class="contact-grid">
          <a class="contact-card reveal" href="https://wa.me/${WHATSAPP_NUMBER}" target="_blank" rel="noopener" data-sound="click">
            <span class="contact-label">WhatsApp</span>
            <span class="contact-value">+880 1951 467502</span>
          </a>
          <a class="contact-card reveal" href="mailto:asifuzzaman3761@gmail.com" data-sound="click">
            <span class="contact-label">Email</span>
            <span class="contact-value">asifuzzaman3761@gmail.com</span>
          </a>
          <a class="contact-card reveal" href="#" target="_blank" rel="noopener" data-sound="click">
            <span class="contact-label">Shop</span>
            <span class="contact-value">Facebook Shop</span>
          </a>
        </div>
      </section>`;
  }

  /* ---------------------------------------------------------
     Router
  --------------------------------------------------------- */
  const routes = {
    "/": { render: viewHome, title: "Noir & Aurum" },
    "/timepieces": { render: () => viewCollection("timepieces", "Timepieces", "Mechanical movements, cased in blackened steel and aurum gold.", "III"), title: "Timepieces — Noir & Aurum" },
    "/fragrances": { render: () => viewCollection("fragrances", "Fragrances", "Smoke, leather, and gilded amber, bottled in dark glass.", "VI"), title: "Fragrances — Noir & Aurum" },
    "/atelier": { render: viewAtelier, title: "The Atelier — Noir & Aurum" },
    "/contact": { render: viewContact, title: "Enquiries — Noir & Aurum" },
    "/cart": { render: viewCart, title: "Cart — Noir & Aurum" },
    "/checkout": { render: viewCheckout, title: "Checkout — Noir & Aurum" },
  };

  function matchRoute(path){
    if(routes[path]) return { render: routes[path].render, title: routes[path].title };
    const prod = path.match(/^\/product\/([\w-]+)$/);
    if(prod) return { render: () => viewProduct(prod[1]), title: (productBy(prod[1])?.name || "Product") + " — Noir & Aurum" };
    const ord = path.match(/^\/order\/([\w-]+)$/);
    if(ord) return { render: () => viewOrder(ord[1]), title: "Order — Noir & Aurum" };
    return { render: () => `<section class="collection page-top reveal"><div class="section-head"><h2>Page not found</h2><p class="section-note"><a href="#/" data-route="/">Return home.</a></p></div></section>`, title: "Not found — Noir & Aurum" };
  }

  function currentPath(){
    const h = location.hash.replace(/^#/, "");
    return h || "/";
  }

  let pendingOrigin = null;
  let firstLoad = true;

  function setActiveNav(path){
    document.querySelectorAll(".main-nav a[data-route]").forEach(a => {
      a.classList.toggle("active", a.dataset.route === path);
    });
  }

  function render(path){
    const match = matchRoute(path);
    app.innerHTML = match.render();
    document.title = match.title;
    setActiveNav(path);
    if(path === "/") drawBezelTicks();
    initReveal();
  }

  function transitionTo(path, origin){
    const { x, y } = origin;
    const radius = Math.hypot(window.innerWidth, window.innerHeight) + 80;
    overlay.style.setProperty("--ox", x + "px");
    overlay.style.setProperty("--oy", y + "px");

    if(window.NoirAudio) window.NoirAudio.pageTransition();

    if(reduceMotion){
      render(path);
      window.scrollTo(0,0);
      if(window.__noirSmokeBurst) window.__noirSmokeBurst(x, y);
      return;
    }

    overlay.style.transition = "none";
    overlay.style.clipPath = `circle(0px at ${x}px ${y}px)`;
    overlay.classList.add("active");
    // force reflow before animating
    // eslint-disable-next-line no-unused-expressions
    overlay.offsetHeight;
    overlay.style.transition = "clip-path .6s cubic-bezier(.65,0,.35,1)";
    overlay.style.clipPath = `circle(${radius}px at ${x}px ${y}px)`;

    const onCover = () => {
      overlay.removeEventListener("transitionend", onCover);
      window.scrollTo(0,0);
      render(path);
      if(window.__noirSmokeBurst) window.__noirSmokeBurst(x, y);

      requestAnimationFrame(() => {
        overlay.style.transition = "none";
        overlay.style.clipPath = `circle(${radius}px at ${x}px ${y}px)`;
        overlay.offsetHeight;
        overlay.style.transition = "clip-path .6s cubic-bezier(.65,0,.35,1)";
        overlay.style.clipPath = `circle(0px at ${x}px ${y}px)`;

        const onReveal = () => {
          overlay.removeEventListener("transitionend", onReveal);
          overlay.classList.remove("active");
        };
        overlay.addEventListener("transitionend", onReveal, { once: true });
      });
    };
    overlay.addEventListener("transitionend", onCover, { once: true });
  }

  function goTo(path, origin){
    pendingOrigin = origin;
    if(location.hash.replace(/^#/, "") === path){
      // same route requested again — just re-render, no wipe needed
      render(path);
      return;
    }
    location.hash = path;
  }

  window.addEventListener("hashchange", () => {
    const path = currentPath();
    const origin = pendingOrigin || { x: window.innerWidth/2, y: window.innerHeight/2 };
    pendingOrigin = null;
    transitionTo(path, origin);
  });

  /* ---------------------------------------------------------
     Delegated click handling: nav, cart, checkout
  --------------------------------------------------------- */
  document.addEventListener("click", (e) => {
    const routeEl = e.target.closest("[data-route]");
    if(routeEl){
      e.preventDefault();
      if(window.NoirAudio) window.NoirAudio.click();
      goTo(routeEl.dataset.route, { x: e.clientX, y: e.clientY });
      if(window.__noirSmokeBurst) window.__noirSmokeBurst(e.clientX, e.clientY);
      return;
    }

    const actionEl = e.target.closest("[data-action]");
    if(!actionEl) return;
    const action = actionEl.dataset.action;

    if(action === "quick-add"){
      window.NoirCart.add(actionEl.dataset.id, 1);
      if(window.NoirAudio) window.NoirAudio.addToCart();
      toast(`Added ${productBy(actionEl.dataset.id)?.name || "item"} to cart`);
    }

    if(action === "add-to-cart"){
      const stepper = document.querySelector(".qty-stepper[data-qty]");
      const qty = stepper ? parseInt(stepper.dataset.qty, 10) : 1;
      window.NoirCart.add(actionEl.dataset.id, qty);
      if(window.NoirAudio) window.NoirAudio.addToCart();
      toast(`Added ${qty} \u00d7 ${productBy(actionEl.dataset.id)?.name || "item"} to cart`);
    }

    if(action === "qty-inc" || action === "qty-dec"){
      const stepper = actionEl.closest(".qty-stepper");
      let qty = parseInt(stepper.dataset.qty, 10);
      qty = action === "qty-inc" ? qty + 1 : Math.max(1, qty - 1);
      stepper.dataset.qty = qty;
      stepper.querySelector(".qty-value").textContent = qty;
    }

    if(action === "cart-inc" || action === "cart-dec"){
      const id = actionEl.dataset.id;
      const items = window.NoirCart.getItems();
      const item = items.find(i => i.id === id);
      const current = item ? item.qty : 1;
      const next = action === "cart-inc" ? current + 1 : current - 1;
      window.NoirCart.setQty(id, next);
    }

    if(action === "cart-remove"){
      if(window.NoirAudio) window.NoirAudio.remove();
      window.NoirCart.remove(actionEl.dataset.id);
    }
  });

  document.addEventListener("submit", (e) => {
    if(e.target.id !== "checkout-form") return;
    e.preventDefault();
    const fd = new FormData(e.target);
    const customer = {
      name: (fd.get("name") || "").toString().trim(),
      phone: (fd.get("phone") || "").toString().trim(),
      address: (fd.get("address") || "").toString().trim(),
      notes: (fd.get("notes") || "").toString().trim(),
    };
    if(!customer.name || !customer.phone || !customer.address){
      toast("Please fill in name, phone, and address");
      return;
    }
    const items = window.NoirCart.detailed();
    const order = {
      id: makeOrderId(),
      items: items.map(i => ({ id: i.id, name: i.name, qty: i.qty, lineTotal: i.lineTotal })),
      subtotal: window.NoirCart.subtotal(),
      customer,
      createdAt: new Date().toISOString(),
    };
    saveOrder(order);
    window.NoirCart.clear();
    if(window.NoirAudio) window.NoirAudio.checkoutSuccess();
    const rect = e.target.getBoundingClientRect();
    goTo(`/order/${order.id}`, { x: rect.left + rect.width/2, y: rect.top + rect.height/2 });
  });

  /* ---------------------------------------------------------
     Hover chimes (delegated)
  --------------------------------------------------------- */
  document.addEventListener("mouseover", (e) => {
    const el = e.target.closest("[data-route], .p-card, .contact-card, .btn-mini, .btn-primary, .btn-ghost");
    if(el && window.NoirAudio) window.NoirAudio.hover();
  });

  /* ---------------------------------------------------------
     Cart badge
  --------------------------------------------------------- */
  function updateCartBadge(){
    const badge = document.getElementById("cart-count");
    if(!badge) return;
    const n = window.NoirCart.count();
    badge.textContent = n;
    badge.style.display = n > 0 ? "flex" : "none";
  }
  window.NoirCart.onChange(updateCartBadge);

  /* ---------------------------------------------------------
     Sound toggle (persisted)
  --------------------------------------------------------- */
  const soundToggle = document.getElementById("sound-toggle");
  const SOUND_KEY = "noir-aurum-sound";
  function setSound(on){
    window.NoirAudio.setEnabled(on);
    soundToggle.setAttribute("aria-pressed", String(on));
    soundToggle.querySelector(".sound-icon").textContent = on ? "\u25c9" : "\u25d4";
    localStorage.setItem(SOUND_KEY, on ? "1" : "0");
  }
  soundToggle?.addEventListener("click", () => {
    const next = !window.NoirAudio.isEnabled();
    setSound(next);
    if(next) window.NoirAudio.click();
  });
  setSound(localStorage.getItem(SOUND_KEY) === "1");

  /* ---------------------------------------------------------
     Bezel hour-ticks (home hero only)
  --------------------------------------------------------- */
  function drawBezelTicks(){
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
  }

  /* ---------------------------------------------------------
     Scroll reveal (re-bound after every render)
  --------------------------------------------------------- */
  let io = null;
  function initReveal(){
    const targets = app.querySelectorAll(".reveal");
    if(reduceMotion || !("IntersectionObserver" in window)){
      targets.forEach(el => el.classList.add("in-view"));
      return;
    }
    if(io) io.disconnect();
    io = new IntersectionObserver((entries) => {
      entries.forEach((entry, idx) => {
        if(entry.isIntersecting){
          setTimeout(() => entry.target.classList.add("in-view"), (idx % 4) * 80);
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: "0px 0px -60px 0px" });
    targets.forEach(el => io.observe(el));
  }

  /* ---------------------------------------------------------
     Chronograph scroll-progress ring
  --------------------------------------------------------- */
  const chronoFill = document.querySelector(".chrono-fill");
  const CIRC = 176;
  function updateChrono(){
    const scrollTop = window.scrollY;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const pct = max > 0 ? Math.min(scrollTop / max, 1) : 0;
    if(chronoFill) chronoFill.style.strokeDashoffset = (CIRC * (1 - pct)).toFixed(1);
  }
  document.addEventListener("scroll", updateChrono, { passive: true });

  /* ---------------------------------------------------------
     Ambient smoke particle canvas
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
    const MAX_PARTICLES = 30;
    const goldTones = ["199,163,86", "239,215,154", "138,115,69"];

    function spawn(x, y, burst){
      particles.push({
        x: x ?? Math.random() * w,
        y: y ?? h + 40 * dpr,
        r: (burst ? 12 : 24) + Math.random() * (burst ? 26 : 46),
        vy: -(0.18 + Math.random() * 0.35) * dpr * (burst ? 1.8 : 1),
        vx: (Math.random() - 0.5) * (burst ? 1.2 : 0.25) * dpr,
        life: 0,
        maxLife: burst ? 70 : 600 + Math.random() * 400,
        alpha: burst ? 0.4 : 0.10 + Math.random() * 0.08,
        tone: goldTones[Math.floor(Math.random()*goldTones.length)],
        drift: Math.random() * Math.PI * 2,
      });
    }
    for(let i=0;i<MAX_PARTICLES;i++) spawn(Math.random()*w, Math.random()*h);

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

    window.__noirSmokeBurst = function(clientX, clientY){
      for(let i=0;i<8;i++) spawn(clientX*dpr, clientY*dpr, true);
    };
  }

  /* ---------------------------------------------------------
     Initial render
  --------------------------------------------------------- */
  render(currentPath());
  updateCartBadge();
  updateChrono();
  firstLoad = false;
})();
