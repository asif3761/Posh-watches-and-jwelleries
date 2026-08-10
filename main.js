/* Noir & Aurum — shared site behavior */
(function () {
  "use strict";

  /* ---------------- Sound engine (synthesized, no audio files) ---------------- */
  var NASound = (function () {
    var ctx = null;
    var muted = true; // off by default; respects autoplay norms + quiet-by-default UX
    try { muted = sessionStorage.getItem("na_sound") !== "on"; } catch (e) {}

    function ensureCtx() {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      if (!ctx) ctx = new AC();
      if (ctx.state === "suspended") ctx.resume();
      return ctx;
    }

    function tone(freq, start, dur, peak, type) {
      var c = ensureCtx();
      if (!c || muted) return;
      var osc = c.createOscillator();
      var gain = c.createGain();
      osc.type = type || "sine";
      osc.frequency.value = freq;
      var t0 = c.currentTime + start;
      gain.gain.setValueAtTime(0.0001, t0);
      gain.gain.linearRampToValueAtTime(peak, t0 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
      osc.connect(gain).connect(c.destination);
      osc.start(t0);
      osc.stop(t0 + dur + 0.05);
    }

    return {
      unlock: function () { ensureCtx(); },
      isMuted: function () { return muted; },
      setMuted: function (val) {
        muted = val;
        try { sessionStorage.setItem("na_sound", val ? "off" : "on"); } catch (e) {}
      },
      tick: function () {
        tone(1500, 0, 0.06, 0.045, "sine");
        tone(2100, 0.008, 0.045, 0.018, "sine");
      },
      chime: function () {
        tone(659.25, 0, 0.5, 0.055, "sine");
        tone(987.77, 0.06, 0.42, 0.032, "sine");
      },
      confirm: function () {
        tone(523.25, 0, 0.28, 0.05, "sine");
        tone(783.99, 0.09, 0.34, 0.035, "sine");
      },
      swell: function (dur) {
        dur = dur || 1.1;
        tone(220, 0, dur, 0.04, "sine");
        tone(329.63, 0.12, dur - 0.1, 0.028, "triangle");
        tone(440, 0.28, dur - 0.24, 0.018, "sine");
      }
    };
  })();
  window.NASound = NASound;

  document.addEventListener("DOMContentLoaded", function () {
    initMobileMenu();
    initReveal();
    initCopyButtons();
    initInquiryForm();
    initYear();
    initSoundToggle();
    initPageTransitions();
    initGrandIntro();
  });

  /* ---------------- Mobile menu ---------------- */
  function initMobileMenu() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var menu = document.querySelector("[data-mobile-menu]");
    var closeBtn = document.querySelector("[data-menu-close]");
    if (!toggle || !menu) return;

    function open() {
      menu.classList.add("is-open");
      toggle.setAttribute("aria-expanded", "true");
      document.body.style.overflow = "hidden";
      NASound.tick();
      var firstLink = menu.querySelector("a");
      if (firstLink) firstLink.focus();
    }
    function close() {
      menu.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
      document.body.style.overflow = "";
      toggle.focus();
    }
    toggle.addEventListener("click", function () {
      var isOpen = menu.classList.contains("is-open");
      isOpen ? close() : open();
    });
    if (closeBtn) closeBtn.addEventListener("click", close);
    menu.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", close);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && menu.classList.contains("is-open")) close();
    });
  }

  /* ---------------- Reveal on scroll ---------------- */
  function initReveal() {
    var items = document.querySelectorAll(".reveal");
    if (!items.length) return;

    if (!("IntersectionObserver" in window)) {
      items.forEach(function (el) { el.classList.add("is-visible"); });
      return;
    }
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    );
    items.forEach(function (el) { io.observe(el); });
  }

  /* ---------------- Copy-to-clipboard ---------------- */
  function initCopyButtons() {
    document.querySelectorAll("[data-copy]").forEach(function (btn) {
      var original = btn.textContent;
      btn.addEventListener("click", function () {
        NASound.tick();
        var value = btn.getAttribute("data-copy");
        var done = function () {
          btn.textContent = "Copied";
          btn.classList.add("is-copied");
          setTimeout(function () {
            btn.textContent = original;
            btn.classList.remove("is-copied");
          }, 1800);
        };
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(value).then(done).catch(function () { fallbackCopy(value, done); });
        } else {
          fallbackCopy(value, done);
        }
      });
    });
  }
  function fallbackCopy(value, done) {
    var ta = document.createElement("textarea");
    ta.value = value;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand("copy"); done(); } catch (e) {}
    document.body.removeChild(ta);
  }

  /* ---------------- Inquiry form -> WhatsApp ---------------- */
  var WHATSAPP_NUMBER = "8801951467502";

  function initInquiryForm() {
    var form = document.querySelector("[data-inquiry-form]");
    if (!form) return;
    var status = form.querySelector("[data-form-status]");

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var name = (form.querySelector("#inq-name") || {}).value || "";
      var contact = (form.querySelector("#inq-contact") || {}).value || "";
      var interest = (form.querySelector("#inq-interest") || {}).value || "";
      var message = (form.querySelector("#inq-message") || {}).value || "";

      if (!name.trim() || !contact.trim()) {
        if (status) status.textContent = "Please add your name and a way to reach you.";
        return;
      }

      var lines = [
        "Hello Noir & Aurum, I'd like to enquire.",
        "Name: " + name,
        "Reachable at: " + contact,
        "Interested in: " + (interest || "Not specified")
      ];
      if (message.trim()) lines.push("Message: " + message);

      var text = encodeURIComponent(lines.join("\n"));
      var url = "https://wa.me/" + WHATSAPP_NUMBER + "?text=" + text;

      if (status) status.textContent = "Opening WhatsApp…";
      NASound.confirm();
      window.open(url, "_blank", "noopener");
      form.reset();
    });
  }

  /* ---------------- Product inquiry links (piece-specific) ---------------- */
  function buildWhatsAppLink(pieceName) {
    var text = encodeURIComponent(
      "Hello Noir & Aurum, I'd like to know more about " + pieceName + "."
    );
    return "https://wa.me/" + WHATSAPP_NUMBER + "?text=" + text;
  }
  window.NAWhatsApp = { buildLink: buildWhatsAppLink };

  /* ---------------- Footer year ---------------- */
  function initYear() {
    var el = document.querySelector("[data-year]");
    if (el) el.textContent = new Date().getFullYear();
  }

  /* ---------------- Sound toggle ---------------- */
  function initSoundToggle() {
    var btn = document.querySelector("[data-sound-toggle]");
    if (!btn) return;

    function sync() {
      var muted = NASound.isMuted();
      btn.classList.toggle("is-muted", muted);
      btn.setAttribute("aria-pressed", String(!muted));
      btn.setAttribute("aria-label", muted ? "Turn sound on" : "Turn sound off");
    }
    sync();
    try {
      if (!sessionStorage.getItem("na_sound")) btn.classList.add("sound-toggle--hint");
    } catch (e) {}

    btn.addEventListener("click", function () {
      var wasMuted = NASound.isMuted();
      NASound.unlock();
      NASound.setMuted(!wasMuted);
      sync();
      btn.classList.remove("sound-toggle--hint");
      if (!NASound.isMuted()) NASound.tick();
    });
  }

  /* ---------------- Page transitions ---------------- */
  function initPageTransitions() {
    var overlay = document.querySelector("[data-page-transition]");
    if (!overlay) return;

    window.addEventListener("pageshow", function (evt) {
      if (evt.persisted) overlay.classList.remove("is-exiting");
    });

    document.addEventListener("click", function (e) {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      var link = e.target.closest("a[href]");
      if (!link) return;
      var href = link.getAttribute("href");
      if (!href || link.target === "_blank") {
        if (link.target === "_blank") NASound.tick();
        return;
      }
      if (href.charAt(0) === "#" || href.indexOf("mailto:") === 0 || href.indexOf("tel:") === 0) return;
      if (/^https?:\/\//i.test(href)) { NASound.tick(); return; }
      if (href.slice(-5) !== ".html") return;

      e.preventDefault();
      NASound.chime();
      overlay.classList.add("is-exiting");
      setTimeout(function () { window.location.href = href; }, 430);
    });
  }

  /* ---------------- First-visit opening sequence (home page only) ---------------- */
  function initGrandIntro() {
    var overlay = document.querySelector("[data-page-transition]");
    var mark = document.querySelector("[data-intro-mark]");
    if (!overlay || !mark || document.body.getAttribute("data-page") !== "index") return;

    var reducedMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var alreadySeen = true;
    try { alreadySeen = sessionStorage.getItem("na_intro_seen") === "1"; } catch (e) {}

    if (alreadySeen || reducedMotion) {
      try { sessionStorage.setItem("na_intro_seen", "1"); } catch (e) {}
      return;
    }

    overlay.classList.add("is-intro");
    var ring = mark.querySelector("[data-intro-ring]");
    var skip = document.querySelector("[data-intro-skip]");
    var done = false;

    NASound.swell(1.15);

    function markSeen() {
      if (done) return;
      done = true;
      try { sessionStorage.setItem("na_intro_seen", "1"); } catch (e) {}
      overlay.classList.remove("is-intro");
      document.removeEventListener("click", onDocClick);
      document.removeEventListener("keydown", finish);
    }
    function finish() {
      if (done) { return; }
      markSeen();
      overlay.style.transition = "opacity 0.6s var(--ease)";
      overlay.style.opacity = "0";
      setTimeout(function () { overlay.style.display = "none"; }, 650);
    }
    function onDocClick(e) {
      // A real nav-link click hands off to the page-transition system instead
      // of fighting it for control of the overlay's opacity.
      if (e.target.closest("a[href]")) { markSeen(); } else { finish(); }
    }

    setTimeout(function () { if (ring) ring.classList.add("is-ticked"); }, 1250);
    setTimeout(function () {
      mark.classList.add("is-revealed");
      NASound.confirm();
    }, 1400);
    setTimeout(function () { if (skip) skip.classList.add("is-shown"); }, 800);
    setTimeout(finish, 2300);

    if (skip) skip.addEventListener("click", finish);
    document.addEventListener("click", onDocClick);
    document.addEventListener("keydown", finish);
  }
})();
