/* Noir & Aurum — shared site behavior */
(function () {
  "use strict";

  document.addEventListener("DOMContentLoaded", function () {
    initMobileMenu();
    initReveal();
    initCopyButtons();
    initInquiryForm();
    initYear();
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
})();
