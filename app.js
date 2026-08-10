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
  const scanLine = document.getElementById("scan-line");
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
        <span class="tag">By Commission</span>
        <p class="p-tagline">${p.tagline}</p>
        <div class="p-card-foot">
          <span class="price">${fmt(p.price)}</span>
          <button class="btn-mini" data-action="quick-add" data-id="${p.id}">+ Cart</button>
        </div>
      </article>`;
  }

  function ornamentHTML(){
    return `
      <div class="ornament" aria-hidden="true">
        <span class="line"></span>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M12 2 14 8 20 9 15.5 13 17 19 12 15.5 7 19 8.5 13 4 9 10 8Z"/></svg>
        <span class="line right"></span>
      </div>`;
  }

  function marqueeHTML(){
    const words = ["Hand-Finished", "Forged in Silver", "By Appointment", "Tempered in Steel", "Bound by the Order"];
    const line = words.map(w => `<span>${w}</span>`).join("");
    return `
      <div class="marquee" aria-hidden="true">
        <div class="marquee-track">${line}${line}</div>
      </div>`;
  }

  function splitLetters(word, startIndex){
    return word.split("").map((ch,i) => `<span class="letter" style="--i:${startIndex+i}">${ch}</span>`).join("");
  }

  /* ---------------------------------------------------------
     VIEWS
  --------------------------------------------------------- */
  function viewHome(){
    return `
      <section class="hero">
        <div class="hero-spotlight" id="hero-spotlight"></div>
        <div class="hero-mark" id="hero-mark">
          <div class="shield-frame">
            <svg viewBox="0 0 400 460" preserveAspectRatio="xMidYMid meet">
              <path d="M200 12 L360 58 V220 C360 330 290 400 200 448 C110 400 40 330 40 220 V58 Z"/>
            </svg>
          </div>
          <canvas id="hero-3d" aria-hidden="true"></canvas>
        </div>
        <p class="eyebrow">Bound by the Order &middot; Est. for those who keep their own hours</p>
        <h1 class="hero-title">${splitLetters("Noir",0)} <span class="amp letter" style="--i:4">&amp;</span> ${splitLetters("Aurum",5)}</h1>
        <p class="hero-sub">Timepieces struck in shadow. Fragrances distilled from gold. Objects made for those who move through the world quietly, and are recognised anyway.</p>
        <a href="#/timepieces" class="scroll-cue" data-route="/timepieces">
          <span>Enter the Atelier</span>
          <svg viewBox="0 0 24 24" width="16" height="16"><path d="M12 4v14M6 13l6 6 6-6" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>
        </a>
      </section>

      ${marqueeHTML()}

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
      </section>

      ${ornamentHTML()}

      <section class="collection">
        <div class="section-head reveal">
          <span class="hour-mark">IX</span>
          <h2>Codes of the Order</h2>
          <p class="section-note">Three principles the house is built on, unchanged since the first piece left the atelier.</p>
        </div>
        <div class="pillars">
          <div class="pillar reveal">
            <div class="pillar-inner">
              <span class="pillar-num">I</span>
              <div class="pillar-icon">${shieldIcon()}</div>
              <h3>Honour</h3>
              <p>Every piece is exactly what it claims to be. No plating sold as solid gold, no quartz sold as automatic.</p>
            </div>
          </div>
          <div class="pillar reveal">
            <div class="pillar-inner">
              <span class="pillar-num">II</span>
              <div class="pillar-icon">${craftIcon()}</div>
              <h3>Craft</h3>
              <p>Small runs, hand-finished. We would rather make fifty pieces well than five hundred adequately.</p>
            </div>
          </div>
          <div class="pillar reveal">
            <div class="pillar-inner">
              <span class="pillar-num">III</span>
              <div class="pillar-icon">${sealIcon()}</div>
              <h3>Discretion</h3>
              <p>No logos shouting from across the room. What you wear should speak only to those close enough to notice.</p>
            </div>
          </div>
        </div>
      </section>

      ${ornamentHTML()}

      <section class="collection alt">
        <div class="section-head reveal">
          <span class="hour-mark">XII</span>
          <h2>Correspondence</h2>
          <p class="section-note">From those who have already joined the order.</p>
        </div>
        <div class="testimonials">
          <div class="testimonial reveal">
            <p>The Meridian is the first watch I've worn that people ask about without me ever bringing it up.</p>
            <cite>Collector, Dhaka</cite>
          </div>
          <div class="testimonial reveal">
            <p>Fumée Noire doesn't behave like anything else in my collection. It arrives quietly and stays for hours.</p>
            <cite>Early Correspondent</cite>
          </div>
          <div class="testimonial reveal">
            <p>Ordering directly and hearing back the same day, from an actual person, is rarer than it should be.</p>
            <cite>First Commission</cite>
          </div>
        </div>
      </section>`;
  }

  function shieldIcon(){ return `<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M24 4 42 10v14c0 12-8 18-18 20-10-2-18-8-18-20V10Z"/><path d="M24 14v20M16 22h16"/></svg>`; }
  function craftIcon(){ return `<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="24" cy="24" r="9"/><path d="M24 4v6M24 38v6M4 24h6M38 24h6M9.5 9.5l4.3 4.3M34.2 34.2l4.3 4.3M9.5 38.5l4.3-4.3M34.2 13.8l4.3-4.3"/></svg>`; }
  function sealIcon(){ return `<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="24" cy="20" r="12"/><path d="M17 30 14 44l10-5 10 5-3-14"/></svg>`; }

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
          <p class="reveal">We are a small house. Pieces are produced in limited runs, and each release is announced first to those who follow us directly &mdash; before they ever reach a shelf.</p>
          <p class="reveal">Nothing leaves the atelier unfinished. A case is not simply cast; it is corrected by hand until the light sits on it the way it should. A fragrance is not simply blended; it is worn, revisited, and worn again before it is allowed a name.</p>
        </div>
      </section>

      ${ornamentHTML()}

      <section class="collection subsection">
        <div class="section-head reveal">
          <span class="hour-mark">VI</span>
          <h2>Heritage</h2>
          <p class="section-note">The path from a single workbench to a house.</p>
        </div>
        <div class="timeline">
          <div class="timeline-item reveal">
            <span class="timeline-dot"></span>
            <h4>Founding</h4>
            <h3>A workbench, not a workshop</h3>
            <p>The house began with a single case-maker's bench and a conviction that dark, restrained design had been left out of modern luxury for too long.</p>
          </div>
          <div class="timeline-item reveal">
            <span class="timeline-dot"></span>
            <h4>First Commission</h4>
            <h3>The Meridian takes shape</h3>
            <p>Our first timepiece was designed around a single idea: blackened steel should feel warmer, not colder, when gold is set against it.</p>
          </div>
          <div class="timeline-item reveal">
            <span class="timeline-dot"></span>
            <h4>The Blending Room</h4>
            <h3>Fragrance joins the house</h3>
            <p>What began as a personal blend for the founder became Fumée Noire &mdash; the first scent released under the Noir &amp; Aurum name.</p>
          </div>
          <div class="timeline-item reveal">
            <span class="timeline-dot"></span>
            <h4>Today</h4>
            <h3>By appointment, by hand</h3>
            <p>Every order is still confirmed personally. No call centre, no automated fulfilment &mdash; just the atelier, and the person who asked for it.</p>
          </div>
        </div>
      </section>`;
  }

  function viewContact(){
    const faqs = [
      { q: "How long until my order ships?", a: "Each piece is finished to order. Timepieces are typically ready within 2&ndash;3 weeks; fragrances within a few days. You'll be told an exact date when your order is confirmed on WhatsApp." },
      { q: "How does payment work?", a: "You place your order, then send payment via bKash and confirm the transaction ID directly with us on WhatsApp. Nothing is charged automatically." },
      { q: "Can I return or exchange a piece?", a: "Yes &mdash; reach out within 7 days of delivery. Since each piece is finished by hand, we ask that it be unworn and in its original condition." },
      { q: "Do you ship outside Bangladesh?", a: "Not yet. For now, the atelier ships within Bangladesh only &mdash; message us on WhatsApp if you're enquiring from abroad, as this may change." },
    ];
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
      </section>

      <section class="collection alt subsection">
        <div class="section-head reveal">
          <span class="hour-mark">&mdash;</span>
          <h2>Questions of the Order</h2>
        </div>
        <div class="faq-list">
          ${faqs.map((f,i) => `
            <div class="faq-item" data-faq="${i}">
              <button type="button" class="faq-q" data-action="faq-toggle">${f.q}<span class="plus">+</span></button>
              <div class="faq-a"><p>${f.a}</p></div>
            </div>`).join("")}
        </div>
      </section>

      <section class="collection subsection">
        <div class="correspondence">
          <span class="hour-mark">&#9993;</span>
          <h2 style="margin-top:18px;">Join the Correspondence</h2>
          <p class="section-note">Be first to hear when a new commission opens.</p>
          <form id="correspondence-form" class="correspondence-form">
            <input type="email" name="email" placeholder="you@example.com" required autocomplete="email">
            <button type="submit" class="btn-primary">Subscribe</button>
          </form>
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
    if(path === "/" && window.NoirScene){
      window.NoirScene.mountHero();
    } else if(window.NoirScene){
      window.NoirScene.unmountHero();
    }
    initReveal();
  }

  function transitionTo(path, origin){
    const { x, y } = origin;
    const radius = Math.hypot(window.innerWidth, window.innerHeight) + 80;
    overlay.style.setProperty("--ox", x + "px");
    overlay.style.setProperty("--oy", y + "px");

    if(window.NoirAudio) window.NoirAudio.pageTransition();

    if(scanLine){
      scanLine.classList.remove("sweep");
      // eslint-disable-next-line no-unused-expressions
      scanLine.offsetHeight;
      scanLine.classList.add("sweep");
    }

    if(reduceMotion){
      render(path);
      window.scrollTo(0,0);
      domBurst(x, y);
      return;
    }

    const tiltY = (x / window.innerWidth - 0.5) * -26;
    const tiltX = (y / window.innerHeight - 0.5) * 16;
    const flipDur = ".6s cubic-bezier(.65,0,.35,1)";

    overlay.style.transition = "none";
    overlay.style.clipPath = `circle(0px at ${x}px ${y}px)`;
    overlay.classList.add("active");
    app.style.transition = "none";
    app.style.transform = "perspective(1400px) rotateX(0deg) rotateY(0deg) scale(1) translateZ(0px)";
    // force reflow before animating
    // eslint-disable-next-line no-unused-expressions
    overlay.offsetHeight;
    overlay.style.transition = `clip-path ${flipDur}`;
    overlay.style.clipPath = `circle(${radius}px at ${x}px ${y}px)`;
    app.style.transition = `transform ${flipDur}`;
    app.style.transform = `perspective(1400px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale(.92) translateZ(-140px)`;

    const onCover = () => {
      overlay.removeEventListener("transitionend", onCover);
      window.scrollTo(0,0);
      render(path);
      domBurst(x, y);

      requestAnimationFrame(() => {
        overlay.style.transition = "none";
        overlay.style.clipPath = `circle(${radius}px at ${x}px ${y}px)`;
        app.style.transition = "none";
        app.style.transform = `perspective(1400px) rotateX(${-tiltX}deg) rotateY(${-tiltY}deg) scale(.92) translateZ(-140px)`;
        overlay.offsetHeight;
        overlay.style.transition = `clip-path ${flipDur}`;
        overlay.style.clipPath = `circle(0px at ${x}px ${y}px)`;
        app.style.transition = `transform ${flipDur}`;
        app.style.transform = "perspective(1400px) rotateX(0deg) rotateY(0deg) scale(1) translateZ(0px)";

        const onReveal = () => {
          overlay.removeEventListener("transitionend", onReveal);
          overlay.classList.remove("active");
          app.style.transition = "none";
          app.style.transform = "";
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
      domBurst(e.clientX, e.clientY);
      return;
    }

    const actionEl = e.target.closest("[data-action]");
    if(!actionEl) return;
    const action = actionEl.dataset.action;

    if(action === "quick-add"){
      window.NoirCart.add(actionEl.dataset.id, 1);
      if(window.NoirAudio) window.NoirAudio.addToCart();
      stampWaxSeal(e.clientX, e.clientY);
      toast(`Added ${productBy(actionEl.dataset.id)?.name || "item"} to cart`);
    }

    if(action === "add-to-cart"){
      const stepper = document.querySelector(".qty-stepper[data-qty]");
      const qty = stepper ? parseInt(stepper.dataset.qty, 10) : 1;
      window.NoirCart.add(actionEl.dataset.id, qty);
      if(window.NoirAudio) window.NoirAudio.addToCart();
      stampWaxSeal(e.clientX, e.clientY);
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

    if(action === "faq-toggle"){
      const item = actionEl.closest(".faq-item");
      const answer = item.querySelector(".faq-a");
      const isOpen = item.classList.contains("open");
      // close any other open FAQ item for a cleaner reveal
      document.querySelectorAll(".faq-item.open").forEach(openItem => {
        if(openItem !== item){
          openItem.classList.remove("open");
          openItem.querySelector(".faq-a").style.maxHeight = null;
        }
      });
      if(isOpen){
        item.classList.remove("open");
        answer.style.maxHeight = null;
      } else {
        item.classList.add("open");
        answer.style.maxHeight = answer.scrollHeight + "px";
      }
      if(window.NoirAudio) window.NoirAudio.hover();
    }
  });

  /* ---------------------------------------------------------
     Wax-seal stamp — visual confirmation on add-to-cart
  --------------------------------------------------------- */
  function stampWaxSeal(x, y){
    const seal = document.createElement("div");
    seal.className = "wax-seal";
    seal.style.left = x + "px";
    seal.style.top = y + "px";
    seal.textContent = "N&A";
    document.body.appendChild(seal);
    requestAnimationFrame(() => seal.classList.add("stamp"));
    setTimeout(() => seal.remove(), 750);
  }

  /* ---------------------------------------------------------
     Correspondence (newsletter) capture — stored locally
  --------------------------------------------------------- */
  document.addEventListener("submit", (e) => {
    if(e.target.id !== "correspondence-form") return;
    e.preventDefault();
    const email = new FormData(e.target).get("email");
    if(!email) return;
    const list = JSON.parse(localStorage.getItem("noir-aurum-subscribers") || "[]");
    if(!list.includes(email)) list.push(email);
    localStorage.setItem("noir-aurum-subscribers", JSON.stringify(list));
    if(window.NoirAudio) window.NoirAudio.checkoutSuccess();
    toast("You've joined the correspondence list");
    e.target.reset();
  });

  /* ---------------------------------------------------------
     Product card 3D tilt (mousemove) — desktop only
  --------------------------------------------------------- */
  const isFinePointer = window.matchMedia("(pointer: fine)").matches;
  if(isFinePointer && !reduceMotion){
    document.addEventListener("mousemove", (e) => {
      const card = e.target.closest(".p-card");
      document.querySelectorAll(".p-card.tilting").forEach(c => {
        if(c !== card){ c.style.transform = ""; c.classList.remove("tilting"); }
      });
      if(!card) return;
      const rect = card.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width - 0.5;
      const py = (e.clientY - rect.top) / rect.height - 0.5;
      card.classList.add("tilting");
      card.style.transform = `translateY(-4px) rotateY(${px*10}deg) rotateX(${-py*10}deg)`;
    });
    document.addEventListener("mouseout", (e) => {
      const card = e.target.closest(".p-card");
      if(card && !card.contains(e.relatedTarget)){
        card.style.transform = "";
        card.classList.remove("tilting");
      }
    });
  }

  /* ---------------------------------------------------------
     Hero cursor-follow spotlight
  --------------------------------------------------------- */
  if(isFinePointer && !reduceMotion){
    document.addEventListener("mousemove", (e) => {
      const spotlight = document.getElementById("hero-spotlight");
      if(!spotlight) return;
      const hero = spotlight.closest(".hero");
      const rect = hero.getBoundingClientRect();
      const mx = ((e.clientX - rect.left) / rect.width) * 100;
      const my = ((e.clientY - rect.top) / rect.height) * 100;
      spotlight.style.setProperty("--mx", mx + "%");
      spotlight.style.setProperty("--my", my + "%");
    });
  }

  /* ---------------------------------------------------------
     Hero parallax on scroll — mark drifts slower than the page,
     text drifts slightly faster, for a sense of depth.
  --------------------------------------------------------- */
  if(!reduceMotion){
    document.addEventListener("scroll", () => {
      const hero = document.querySelector(".hero");
      if(!hero) return;
      const y = window.scrollY;
      if(y > window.innerHeight * 1.2) return; // hero long out of view, skip work
      const mark = document.getElementById("hero-mark");
      const title = hero.querySelector(".hero-title");
      const sub = hero.querySelector(".hero-sub");
      if(mark) mark.style.transform = `translateY(${y * 0.18}px) scale(${Math.max(1 - y*0.0003, 0.85)})`;
      if(title) title.style.transform = `translateY(${y * 0.08}px)`;
      if(sub) sub.style.transform = `translateY(${y * 0.05}px)`;
    }, { passive: true });
  }

  /* ---------------------------------------------------------
     Magnetic buttons — nudge toward the cursor within range
  --------------------------------------------------------- */
  if(isFinePointer && !reduceMotion){
    const MAGNET_RANGE = 70;
    const MAGNET_STRENGTH = 0.28;
    document.addEventListener("mousemove", (e) => {
      document.querySelectorAll(".btn-primary, .btn-ghost, .scroll-cue").forEach(btn => {
        const rect = btn.getBoundingClientRect();
        const cx = rect.left + rect.width/2;
        const cy = rect.top + rect.height/2;
        const dx = e.clientX - cx;
        const dy = e.clientY - cy;
        const dist = Math.hypot(dx, dy);
        if(dist < MAGNET_RANGE + rect.width/2){
          btn.style.setProperty("--mgx", (dx * MAGNET_STRENGTH) + "px");
          btn.style.setProperty("--mgy", (dy * MAGNET_STRENGTH) + "px");
        } else {
          btn.style.setProperty("--mgx", "0px");
          btn.style.setProperty("--mgy", "0px");
        }
      });
    });
  }

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
     3D scene: ambient background + hero emblem lifecycle
  --------------------------------------------------------- */
  if(window.NoirScene) window.NoirScene.initBackground();

  /* ---------------------------------------------------------
     DOM ember burst — lightweight click/transition feedback
     (the ambient depth-field itself now lives in scene.js/WebGL)
  --------------------------------------------------------- */
  function domBurst(x, y){
    const count = 7;
    for(let i = 0; i < count; i++){
      const el = document.createElement("div");
      el.className = "ember-burst";
      const angle = Math.random() * Math.PI * 2;
      const dist = 34 + Math.random() * 64;
      el.style.left = x + "px";
      el.style.top = y + "px";
      el.style.setProperty("--dx", (Math.cos(angle) * dist).toFixed(1) + "px");
      el.style.setProperty("--dy", (Math.sin(angle) * dist).toFixed(1) + "px");
      el.style.setProperty("--delay", (Math.random() * 0.08).toFixed(2) + "s");
      el.style.color = Math.random() > 0.5 ? "var(--gold-bright)" : "var(--burgundy-bright)";
      document.body.appendChild(el);
      setTimeout(() => el.remove(), 850);
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
     Initial render
  --------------------------------------------------------- */
  render(currentPath());
  updateCartBadge();
  updateChrono();
  firstLoad = false;
})();
