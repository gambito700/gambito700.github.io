/*
 * =====================================================================
 * PORTAFOLIO ALEX MARTÍNEZ – Front-End 2026
 * File: js/script.js
 *
 * REQUIRES (loaded before this in index.html):
 *   1. jquery-1.11.0.min.js
 *   2. plugins.js  (Swiper, AOS, Chocolat, Jarallax)
 *   3. bootstrap.bundle.min.js
 *
 * SECTIONS:
 *   A. OS Core (window manager, drag, theme, lang, wallpaper, log)
 *   B. Digital Clock
 *   C. Custom Cursor (canvas trail)
 *   D. Skill Bars + Wave Animation
 *   E. Language Toggle ES/EN
 *   F. Swiper Sliders
 *   G. Text FX (letter by letter)
 *   H. Contact Form
 *   I. Calendar Widget
 *   J. Init (DOMContentLoaded)
 * =====================================================================
 */

(function () {
  "use strict";

  /* ============================================================
     A. OS CORE – Window Manager, Drag & Drop, Theme, Lang, Wallpaper
     ============================================================ */

  // zIndex counter ensures each opened/clicked window comes to front
  var zIndexCounter = 100;

  function bringToFront(win) {
    zIndexCounter++;
    win.style.zIndex = zIndexCounter;
  }

  /* ── Límites dinámicos según breakpoint actual ──────────
     Devuelve el área segura donde las ventanas pueden moverse.
     Se recalcula en cada drag y en cada resize.             */
  function getDesktopBounds() {
    var TASKBAR_H = window.innerWidth < 481 ? 40 :
      window.innerWidth < 768 ? 44 : 50;

    /* Zona de iconos — ventanas no deben iniciar encima */
    var ICON_ZONE_W = window.innerWidth < 481 ? 90 :
      window.innerWidth < 768 ? 100 : 210;

    return {
      minX: 0,           /* borde izquierdo */
      minY: 10,          /* borde superior (margen de seguridad) */
      maxX: window.innerWidth,   /* borde derecho   */
      maxY: window.innerHeight - TASKBAR_H,  /* sobre taskbar */
      iconZoneW: ICON_ZONE_W  /* ancho reservado para iconos */
    };
  }

  /* ── Clamp una ventana dentro de los límites ─────────── */
  function clampWindowToBounds(win) {
    var bounds = getDesktopBounds();
    var left = parseInt(win.style.left) || 0;
    var top = parseInt(win.style.top) || 0;
    var maxLeft = Math.max(0, bounds.maxX - win.offsetWidth);
    var maxTop = Math.max(0, bounds.maxY - win.offsetHeight);

    win.style.left = Math.max(bounds.minX, Math.min(left, maxLeft)) + "px";
    win.style.top = Math.max(bounds.minY, Math.min(top, maxTop)) + "px";
  }

  function saveOpenWindows() {
    // Session persistence removed as requested
    return;
  }

  window.openWindow = function (id) {
    var win = document.getElementById(id);
    if (!win) return;

    win.classList.remove("d-none");
    bringToFront(win);

    // Update Taskbar Icon
    updateTaskbarIcon(id, true);

    // Close Start Menu if open
    var sm = document.getElementById("start-menu");
    if (sm) sm.classList.remove("show-sm");

    saveOpenWindows();
    systemLog("Window opened: " + id);
  };

  window.closeWindow = function (id) {
    var win = document.getElementById(id);
    if (win) win.classList.add("d-none");
    updateTaskbarIcon(id, false);
    saveOpenWindows();
  };

  window.minimizeWindow = function (id) {
    var win = document.getElementById(id);
    if (win) win.classList.add("d-none");
    // We keep the icon but remove active state or mark as minimized
    var icon = document.querySelector(`.tb-app[data-win="${id}"]`);
    if (icon) icon.classList.remove("active-win");
    saveOpenWindows();
  };

  window.maximizeWindow = function (id) {
    var win = document.getElementById(id);
    if (!win) return;
    if (win.classList.contains("maximized")) {
      win.classList.remove("maximized");
      // Restore to a sensible default if no specific style exists
      if (!win.style.left || win.style.left === "0px") {
        win.style.left = "100px";
        win.style.top = "100px";
      }
      reclampAllWindows();
    } else {
      win.classList.add("maximized");
      win.style.left = "0px";
      win.style.top = "0px";
    }
    bringToFront(win);
    systemLog(`Window ${id} ${win.classList.contains("maximized") ? "maximized" : "restored"}`);
  };

  window.closeAllWindows = function () {
    document.querySelectorAll(".win11-window:not(.d-none)").forEach(win => {
      closeWindow(win.id);
    });
    systemLog("All windows closed");
  };

  function updateTaskbarIcon(id, isOpen) {
    var container = document.getElementById("taskbar-icons");
    if (!container) return;

    var existing = container.querySelector(`.tb-btn[data-win="${id}"]`);
    if (isOpen) {
      if (!existing) {
        // Find icon from desktop or start menu
        var sourceIcon = document.querySelector(`.desktop-icon[onclick*="${id}"] img`) ||
          document.querySelector(`.sm-grid-item[onclick*="${id}"] img`);
        var iconSrc = sourceIcon ? sourceIcon.src : "images/icons/about.png";

        var btn = document.createElement("button");
        btn.className = "tb-btn tb-app active-win";
        btn.setAttribute("data-win", id);
        btn.title = id.replace("window-", "").toUpperCase();
        btn.onclick = function () {
          var win = document.getElementById(id);
          if (win.classList.contains("d-none")) {
            openWindow(id);
          } else {
            minimizeWindow(id);
          }
        };
        btn.innerHTML = `<img src="${iconSrc}">`;
        container.appendChild(btn);
      } else {
        existing.classList.add("active-win");
      }
    } else {
      if (existing) existing.remove();
    }
  }

  // ── Start Menu Toggle ───────────────────────────────────────
  function initStartMenu() {
    var btn = document.getElementById("start-btn");
    var menu = document.getElementById("start-menu");
    if (!btn || !menu) return;

    btn.addEventListener("click", function (e) {
      menu.classList.toggle("show-sm");
      e.stopPropagation();
    });

    document.addEventListener("click", function (e) {
      if (!menu.contains(e.target) && e.target !== btn && !btn.contains(e.target)) {
        menu.classList.remove("show-sm");
      }
    });
  }

  // ── Re-clamp Windows (Dynamic boundaries) ─────────────────
  function reclampAllWindows() {
    document.querySelectorAll(".win11-window:not(.maximized):not(.d-none)").forEach(win => {
      clampWindowToBounds(win);
    });
  }

  // ── System Tray (Battery, etc) ──────────────────────────────
  function initSystemTray() {
    // Reemplazar el ícono FA de batería por un <img> controlable
    var tray = document.querySelector(".tb-system-tray");
    if (tray) {
      var batteryFa = tray.querySelector(".fa-battery-three-quarters, .fa-battery-full, [class*='battery']");
      if (batteryFa) {
        var batteryImg = document.createElement("img");
        batteryImg.id = "tray-battery-icon";
        batteryImg.src = "images/icons/battery-full.png";
        batteryImg.style.cssText = "width:18px;height:18px;object-fit:contain;";
        batteryImg.alt = "batería";
        batteryFa.replaceWith(batteryImg);
      }
    }

    if (navigator.getBattery) {
      navigator.getBattery().then(function (battery) {
        function updateBattery() {
          var img = document.getElementById("tray-battery-icon");
          if (!img) return;
          if (battery.charging) {
            img.src = "images/icons/battery-charging.png";
            img.title = "Cargando — " + Math.round(battery.level * 100) + "%";
          } else {
            img.src = "images/icons/battery-full.png";
            img.title = Math.round(battery.level * 100) + "%";
          }
        }
        battery.addEventListener("chargingchange", updateBattery);
        battery.addEventListener("levelchange", updateBattery);
        updateBattery();
      }).catch(function () {
        systemLog("[battery] API not available");
      });
    } else {
      var img = document.getElementById("tray-battery-icon");
      if (img) {
        img.src = "images/icons/battery-full.png";
        img.title = "Batería";
      }
    }
  }

  // ── Drag & Drop con límites de escritorio ───────────────────
  // ── Drag & Drop (Global Listener Pattern) ─────────────────
  function initDrag() {
    var activeWin = null;
    var isDragging = false;
    var startX, startY, initLeft, initTop;

    document.querySelectorAll(".window-header").forEach(function (header) {
      var win = header.closest(".win11-window");

      // Click anywhere on window → bring to front
      win.addEventListener("mousedown", function () {
        bringToFront(win);
      });

      header.addEventListener("mousedown", function (e) {
        if (e.target.closest("button")) return;
        activeWin = win;
        isDragging = true;
        startX = e.clientX;
        startY = e.clientY;
        initLeft = win.offsetLeft;
        initTop = win.offsetTop;
        bringToFront(win);
        e.preventDefault();
      });
    });

    document.addEventListener("mousemove", function (e) {
      if (!isDragging || !activeWin) return;

      var bounds = getDesktopBounds();
      var newLeft = initLeft + (e.clientX - startX);
      var newTop = initTop + (e.clientY - startY);
      var maxLeft = Math.max(0, bounds.maxX - activeWin.offsetWidth);
      var maxTop = Math.max(0, bounds.maxY - activeWin.offsetHeight);

      activeWin.style.left = Math.max(bounds.minX, Math.min(newLeft, maxLeft)) + "px";
      activeWin.style.top = Math.max(bounds.minY, Math.min(newTop, maxTop)) + "px";
    });

    document.addEventListener("mouseup", function () {
      isDragging = false;
      activeWin = null;
    });
  }

  // Reajustar ventanas al cambiar tamaño del navegador
  window.addEventListener("resize", function () {
    reclampAllWindows();
  });

  // ── Initial State & Auto-Open ────────────────────────────────
  function restoreOS() {
    // Reset positions to default on every load (no persistence)
    document.querySelectorAll(".win11-window").forEach(win => {
      win.style.left = "";
      win.style.top = "";
    });

    // Siempre abrir CV al inicio
    setTimeout(() => {
      openWindow("window-cv");
      systemLog("[startup] Fresh session: CV window opened");
    }, 500);
  }

  // ── System Log with Performance Tracking ─────────────────────
  let lastInterTime = Date.now();
  window.systemLog = function (msg) {
    var now = Date.now();
    var diff = now - lastInterTime;
    lastInterTime = now;

    try {
      var d = new Date();
      var ts = d.toISOString().replace("T", " ").substring(0, 19);
      var perf = ` [Response: ${diff}ms]`;
      var line = "[" + ts + "] [INFO]" + perf + " " + msg;
      console.log(line);
      var area = document.getElementById("log-output-area");
      if (area) {
        var div = document.createElement("div");
        div.textContent = line;
        area.appendChild(div);
        area.scrollTop = area.scrollHeight;
      }
    } catch (e) { }
  };

  window.nextWallpaper = function () {
    var seed = Math.floor(Math.random() * 1000);
    var url = "https://picsum.photos/seed/" + seed + "/1366/768";
    var d = document.getElementById("desktop");
    if (!d) return;
    var img = new Image();
    img.onload = function () {
      d.style.backgroundImage = "url('" + url + "')";
      systemLog("[wallpaper] Next wallpaper loaded — seed: " + seed);
    };
    img.onerror = function () {
      systemLog("[wallpaper] Failed to load — keeping current wallpaper");
    };
    img.src = url;
  };

  window.showPowerPopup = function () {
    alert("Contacto: alexmartinezdiaz91@gmail.com\nVillarrica, Chile");
    systemLog("Power menu opened: Contact info displayed");
  };

  // ── Click-to-Reveal for obfuscated contacts ──────────────
  function initObfuscatedContacts() {
    document.querySelectorAll(".obfuscated-contact").forEach(function (el) {
      el.addEventListener("click", function (e) {
        e.preventDefault();
        var masked = el.querySelector(".contact-masked");
        var revealed = el.querySelector(".contact-revealed");
        if (masked && revealed) {
          masked.classList.toggle("d-none");
          revealed.classList.toggle("d-none");
        }
        var href = el.getAttribute("href");
        if (href && !masked.classList.contains("d-none")) {
          window.open(href, "_blank");
        }
      });
    });
  }

  var ICON_DARK = "images/icons/theme-dark.png";   // modo oscuro activo
  var ICON_LIGHT = "images/icons/theme-light.png"; // modo claro activo

  function initTheme() {
    var btn = document.getElementById("theme-toggle");
    if (!btn) return;

    function updateThemeBtn(isLight) {
      btn.innerHTML = '<img src="' + (isLight ? ICON_LIGHT : ICON_DARK) + '" style="width:20px;height:20px;" alt="tema">';
      btn.title = isLight ? "Cambiar a modo oscuro" : "Cambiar a modo claro";
    }

    // Default to Dark Mode on every load (no persistence for theme selection as per current logic)
    document.body.classList.remove("light-mode");
    updateThemeBtn(false);

    btn.addEventListener("click", function () {
      document.body.classList.toggle("light-mode");
      var isLight = document.body.classList.contains("light-mode");
      updateThemeBtn(isLight);

      var desktop = document.getElementById("desktop");
      if (desktop) {
        desktop.style.filter = isLight ? "brightness(1.1) saturate(0.8)" : "";
      }

      systemLog("Theme toggled: " + (isLight ? "Light" : "Dark"));
    });
  }

  // ── Start Menu ──────────────────────────────────────────────
  function initMenuToggle() {
    initStartMenu();
  }

  // ── Dynamic Wallpaper (Bing) ──────────────────────────────────
  function initWallpaper() {
    if (!document.body.classList.contains("desktop-mode")) return;
    if (!navigator.onLine) {
      systemLog("[wallpaper] Offline — using CSS fallback");
      return;
    }
    try {
      var seed = Math.floor(Math.random() * 1000);
      var url = "https://picsum.photos/seed/" + seed + "/1366/768";
      var img = new Image();
      img.onload = function () {
        var d = document.getElementById("desktop");
        if (d) d.style.backgroundImage = "url('" + url + "')";
        systemLog("[wallpaper] Bing wallpaper loaded");
      };
      img.onerror = function () { systemLog("[wallpaper] Failed to load — CSS fallback active"); };
      img.src = url;
    } catch (e) { systemLog("[wallpaper] Error: " + e.message); }
  }

  // ── Auto-detect Language ──────────────────────────────────────
  function initAutoLang() {
    var nav = navigator.language || "es";
    var lang = nav.startsWith("es") ? "es" : "en";
    systemLog("Auto-detected language: " + lang);
    currentLang = lang;
    updateLanguage();
  }


  /* ============================================================
     B. DIGITAL CLOCK (Time + Date)
     ============================================================ */
  function initClock() {
    var timeEl = document.getElementById("clock-time"); // fixed: was #clockTime
    var dateEl = document.getElementById("clock-date"); // fixed: was #clockDate
    if (!timeEl) return;
    function tick() {
      var n = new Date();
      timeEl.textContent =
        String(n.getHours()).padStart(2, "0") + ":" +
        String(n.getMinutes()).padStart(2, "0");
      if (dateEl) {
        var options = { day: "2-digit", month: "2-digit", year: "numeric" };
        dateEl.textContent = n.toLocaleDateString(currentLang === "es" ? "es-CL" : "en-US", options);
      }
    }
    tick();
    setInterval(tick, 1000);
  }


  /* ============================================================
     C. CUSTOM CURSOR (Canvas Trail)
     Fixed canvas so it follows correctly even on scroll.
     ============================================================ */
  function initCursor() {
    var canvas = document.getElementById("cursor-canvas");
    var dot = document.getElementById("cursorDot");
    // Skip on touch devices
    if (!canvas || window.matchMedia("(pointer: coarse)").matches) return;

    var ctx = canvas.getContext("2d");
    function resize() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
    resize();
    window.addEventListener("resize", resize);

    var points = [], MAX = 60, FADE = 5000;
    var lastMove = Date.now(), alpha = 1, fading = false;

    document.addEventListener("mousemove", function (e) {
      if (dot) { dot.style.left = e.clientX + "px"; dot.style.top = e.clientY + "px"; }
      points.push({ x: e.clientX, y: e.clientY });
      if (points.length > MAX) points.shift();
      lastMove = Date.now(); fading = false; alpha = 1;
    });
    document.addEventListener("mouseover", function (e) {
      if (dot && e.target.closest("a, button, label")) dot.style.transform = "translate(-50%,-50%) scale(2.5)";
    });
    document.addEventListener("mouseout", function (e) {
      if (dot && e.target.closest("a, button, label")) dot.style.transform = "translate(-50%,-50%) scale(1)";
    });

    (function draw() {
      requestAnimationFrame(draw);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (points.length < 2) return;
      if (!fading && Date.now() - lastMove > FADE) fading = true;
      if (fading) { alpha -= 0.008; if (alpha <= 0) { alpha = 0; points = []; return; } }
      ctx.save();
      for (var i = 1; i < points.length; i++) {
        var t = i / points.length;
        ctx.beginPath();
        ctx.moveTo(points[i - 1].x, points[i - 1].y);
        ctx.lineTo(points[i].x, points[i].y);
        ctx.strokeStyle = "rgba(232,197,71," + (t * 0.65 * alpha) + ")";
        ctx.lineWidth = t * 2.5;
        ctx.lineCap = ctx.lineJoin = "round";
        ctx.stroke();
      }
      ctx.restore();
    })();
  }


  /* ============================================================
     D. SKILL BARS + WAVE
     ============================================================ */
  function initSkillBars() {
    var bars = document.querySelectorAll(".skill-fill");
    if (!bars.length) return;
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { animateBar(entry.target); observer.unobserve(entry.target); }
      });
    }, { threshold: 0.3 });
    bars.forEach(function (b) { b.style.width = "0%"; observer.observe(b); });
  }

  function animateBar(bar) {
    var base = parseInt(bar.getAttribute("data-value"), 10) || 50;
    var label = bar.closest(".skill-bar-item") && bar.closest(".skill-bar-item").querySelector(".skill-pct");
    var start = null, dur = 1100;
    function ease(t) { return 1 - Math.pow(1 - t, 4); }
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1), v = ease(p) * base;
      bar.style.width = v.toFixed(1) + "%";
      if (label) label.textContent = Math.round(v) + "%";
      if (p < 1) requestAnimationFrame(step);
      else startWave(bar, base, label);
    }
    setTimeout(function () { requestAnimationFrame(step); }, 100);
  }

  function startWave(bar, base, label) {
    var cur = base, tgt = base, R = 3;
    (function wave() {
      cur += (tgt - cur) * 0.04;
      bar.style.width = cur.toFixed(2) + "%";
      if (label) label.textContent = Math.round(cur) + "%";
      if (Math.abs(cur - tgt) < 0.25) tgt = Math.max(base - R, Math.min(base + R, base + Math.random() * R * 2 - R));
      requestAnimationFrame(wave);
    })();
  }


  /* ============================================================
     E. LANGUAGE TOGGLE ES / EN
     ============================================================ */
  var currentLang = "es";

  function initLangToggle() {
    var btn = document.getElementById("lang-toggle");
    if (!btn) return;

    // Keep auto-detected language (don't force English)
    updateLanguage();

    btn.addEventListener("click", function () {
      currentLang = (currentLang === "es") ? "en" : "es";
      updateLanguage();
      systemLog("Language switched to: " + currentLang);
    });
  }

  // Helper to update all language-dependent elements
  function updateLanguage() {
    var btn = document.getElementById("lang-toggle");
    if (btn) btn.textContent = currentLang === "es" ? "EN" : "ES";
    applyLanguage(currentLang);
    initClock(); // Re-render clock for date format
    initCalendar(); // Re-render calendar for month names
  }

  function applyLanguage(lang) {
    document.querySelectorAll("[data-" + lang + "]").forEach(function (el) {
      var val = el.getAttribute("data-" + lang);
      if (val !== null && el.tagName !== "INPUT" && el.tagName !== "TEXTAREA") {
        el.textContent = val;
      }
    });
    document.querySelectorAll("[data-placeholder-" + lang + "]").forEach(function (el) {
      var ph = el.getAttribute("data-placeholder-" + lang);
      if (ph !== null) el.placeholder = ph;
    });
    document.documentElement.setAttribute("lang", lang);
  }


  /* ============================================================
     F. SWIPER SLIDERS
     ============================================================ */
  function initSliders() {
    if (typeof Swiper === "undefined") return;
    try {
      if (document.querySelector(".swiper.hero-slider-bg")) {
        new Swiper(".swiper.hero-slider-bg", {
          slidesPerView: 1, speed: 1200, effect: "fade",
          allowTouchMove: false,
          autoplay: { delay: 6000, disableOnInteraction: false },
          fadeEffect: { crossFade: true }
        });
      }
    } catch (e) { systemLog("[swiper] Hero slider error: " + e.message); }
  }


  /* ============================================================
     G. TEXT FX (letter-by-letter animation)
     ============================================================ */
  function initTextFx() {
    var stagger = 14, delay = 150;
    document.querySelectorAll(".txt-fx").forEach(function (el) {
      var words = el.textContent.trim().split(/\s+/);
      var count = 0, out = [];
      words.forEach(function (word, idx) {
        if (idx > 0) { out.push("<span class='letter' style='transition-delay:" + delay + "ms'>&nbsp;</span>"); count++; }
        var wh = "<span class='word'>";
        for (var i = 0; i < word.length; i++) {
          wh += "<span class='letter' style='transition-delay:" + (delay + stagger * count) + "ms'>" + word[i] + "</span>";
          count++;
        }
        out.push(wh + "</span>");
      });
      el.innerHTML = out.join("");
      setTimeout(function () { el.classList.add("active"); }, 100);
    });
  }


  /* ============================================================
     H. CONTACT FORM (simulated send / EmailJS ready)
     ============================================================ */
  function initContactForm() {
    var btn = document.getElementById("contact-submit");
    var successMsg = document.getElementById("form-success");
    var errorMsg = document.getElementById("form-error");
    if (!btn) return;

    btn.addEventListener("click", function (e) {
      e.preventDefault();
      var name = (document.getElementById("contact-name").value || "").trim();
      var email = (document.getElementById("contact-email").value || "").trim();
      var subject = (document.getElementById("contact-subject").value || "").trim();
      var message = (document.getElementById("contact-message").value || "").trim();

      if (!name || !email || !message) {
        showErr(currentLang === "es" ? "Por favor completa nombre, correo y mensaje." : "Please fill in name, email and message.");
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        showErr(currentLang === "es" ? "Ingresa un correo válido." : "Please enter a valid email.");
        return;
      }

      btn.querySelector(".btn-text").classList.add("d-none");
      btn.querySelector(".btn-loading").classList.remove("d-none");
      btn.disabled = true;

      /* ── Send via Formspree ── */
      var formData = new FormData(document.getElementById("contactForm"));
      fetch("https://formspree.io/f/xpqeyqqg", {
        method: "POST",
        body: formData,
        headers: { "Accept": "application/json" }
      }).then(function (response) {
        if (response.ok) {
          successMsg.classList.remove("d-none");
          errorMsg.classList.add("d-none");
          document.getElementById("contactForm").reset();
          systemLog("Contact form submitted by: " + name);
        } else {
          showErr(currentLang === "es" ? "Error al enviar. Escríbeme directo a alexmartinezdiaz91@gmail.com" : "Error sending. Email me at alexmartinezdiaz91@gmail.com");
        }
        resetBtn();
        setTimeout(function () { successMsg.classList.add("d-none"); }, 6000);
      }).catch(function () {
        showErr(currentLang === "es" ? "Error de conexión. Escríbeme directo a alexmartinezdiaz91@gmail.com" : "Connection error. Email me at alexmartinezdiaz91@gmail.com");
        resetBtn();
      });
    });

    function showErr(msg) {
      var span = errorMsg.querySelector("span");
      if (span) span.textContent = msg;
      errorMsg.classList.remove("d-none");
      successMsg.classList.add("d-none");
      resetBtn();
    }

    function resetBtn() {
      btn.querySelector(".btn-text").classList.remove("d-none");
      btn.querySelector(".btn-loading").classList.add("d-none");
      btn.disabled = false;
    }
  }


  /* ============================================================
     I. CALENDAR WIDGET
     ============================================================ */
  function initCalendar() {
    var titleEl = document.getElementById("cal-title");
    var bodyEl = document.getElementById("cal-body");
    var prevBtn = document.getElementById("cal-prev");
    var nextBtn = document.getElementById("cal-next");
    if (!titleEl || !bodyEl) return;

    var MONTHS_ES = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
    var MONTHS_EN = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    var now = new Date();
    var year = now.getFullYear();
    var month = now.getMonth();

    function render() {
      var months = currentLang === "en" ? MONTHS_EN : MONTHS_ES;
      titleEl.textContent = months[month] + " " + year;
      bodyEl.innerHTML = "";
      var first = new Date(year, month, 1).getDay();
      var days = new Date(year, month + 1, 0).getDate();
      var today = new Date();

      for (var i = 0; i < first; i++) {
        var empty = document.createElement("span"); empty.className = "cal-empty"; bodyEl.appendChild(empty);
      }
      for (var d = 1; d <= days; d++) {
        var cell = document.createElement("span");
        cell.textContent = d;
        cell.className = "cal-day";
        if (d === today.getDate() && month === today.getMonth() && year === today.getFullYear()) cell.classList.add("cal-today");
        bodyEl.appendChild(cell);
      }
    }

    if (prevBtn) prevBtn.addEventListener("click", function () { month--; if (month < 0) { month = 11; year--; } render(); });
    if (nextBtn) nextBtn.addEventListener("click", function () { month++; if (month > 11) { month = 0; year++; } render(); });

    render();
  }


  /* ============================================================
     L. WEATHER API (Open-Meteo)
     ============================================================ */
  async function getCity() {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(function () { controller.abort(); }, 3000);
      const res = await fetch("https://ipapi.co/json/", { signal: controller.signal });
      clearTimeout(timeout);
      if (!res.ok) throw new Error("HTTP " + res.status);
      const data = await res.json();
      return data.city || "Villarrica";
    } catch (e) {
      systemLog("[weather] City detection failed: " + e.message);
      return "Villarrica";
    }
  }

  async function initWeather() {
    const tempEl = document.getElementById("weather-temp");
    const descEl = document.getElementById("weather-desc");
    if (!tempEl) {
      tempEl.textContent = "--°C";
      return;
    }

    const city = await getCity();
    const controller = new AbortController();
    const timeout = setTimeout(function () { controller.abort(); }, 5000);

    fetch("https://api.open-meteo.com/v1/forecast?latitude=-39.28&longitude=-72.23&current_weather=true", { signal: controller.signal })
      .then(function (r) {
        if (!r.ok) throw new Error("HTTP " + r.status);
        return r.json();
      })
      .then(function (data) {
        clearTimeout(timeout);
        if (data && data.current_weather) {
          tempEl.textContent = Math.round(data.current_weather.temperature) + "°C";
          if (descEl) descEl.textContent = city + ", CL";
        } else {
          throw new Error("Empty response");
        }
      })
      .catch(function (e) {
        clearTimeout(timeout);
        systemLog("[weather] Forecast failed: " + e.message);
        tempEl.textContent = "18°C";
        if (descEl) descEl.textContent = "Villarrica, CL";
      });
  }

  /* ============================================================
     M. MUSIC PLAYER — YouTube IFrame API
     Canciones 100% sin derechos de autor (YouTube Audio Library /
     lofi públicos). El iframe queda oculto; la UI propia controla
     reproducción, progreso y volumen vía la API oficial de YT.
     ============================================================ */

  // Playlist: IDs de YouTube de música sin copyright
  var ytPlaylist = [
    { id: "jfKfPfyJRdk", name: "lofi hip hop radio", artist: "Lofi Girl · YouTube" },
    { id: "5qap5aO4i9A", name: "lofi hip hop beats", artist: "Lofi Girl · YouTube" },
    { id: "Na0w3Mz46GA", name: "Chillhop Essentials", artist: "Chillhop Music · YouTube" },
    { id: "FDMq9ie0ih0", name: "Dark & Darker Lofi", artist: "Lofi Girl · YouTube" },
    { id: "DWcJFNfaw9c", name: "Study Music — Deep Focus", artist: "Yellow Brick Cinema · YouTube" }
  ];
  var ytPlayer = null;   // instancia YT.Player
  var ytReady = false;  // API cargada
  var ytCurrentTrack = 0;
  var ytPlaying = false;
  var ytProgressTimer = null;

  // Callback global requerido por la YouTube IFrame API
  window.onYouTubeIframeAPIReady = function () {
    ytReady = true;
    ytPlayer = new YT.Player("yt-player", {
      height: "1",
      width: "1",
      videoId: ytPlaylist[ytCurrentTrack].id,
      playerVars: {
        autoplay: 0,
        controls: 0,
        disablekb: 1,
        fs: 0,
        modestbranding: 1,
        rel: 0,
        origin: window.location.origin || "http://localhost"
      },
      events: {
        onReady: onYTReady,
        onStateChange: onYTStateChange,
        onError: onYTError
      }
    });
  };

  function onYTReady(event) {
    updateMusicUI(ytCurrentTrack);
    var vol = document.getElementById("music-volume");
    if (vol) event.target.setVolume(parseInt(vol.value, 10));
    systemLog("[music] YouTube player listo");
  }

  function onYTStateChange(event) {
    var playIconImg = document.getElementById("music-play-icon-img"); // Changed to img
    var disc = document.getElementById("music-disc");

    if (event.data === YT.PlayerState.PLAYING) {
      ytPlaying = true;
      if (playIconImg) playIconImg.src = "images/icons/pause.png"; // Use img src
      if (disc) disc.style.animationPlayState = "running";
      startProgressLoop();
      systemLog("[music] Playing: " + ytPlaylist[ytCurrentTrack].name);
    } else if (event.data === YT.PlayerState.PAUSED ||
      event.data === YT.PlayerState.BUFFERING) {
      ytPlaying = false;
      if (playIconImg) playIconImg.src = "images/icons/play.png"; // Use img src
      if (disc) disc.style.animationPlayState = "paused";
      if (event.data === YT.PlayerState.PAUSED) {
        stopProgressLoop();
        systemLog("[music] Paused");
      }
    } else if (event.data === YT.PlayerState.ENDED) {
      // Auto-siguiente al terminar la canción
      ytCurrentTrack = (ytCurrentTrack + 1) % ytPlaylist.length;
      loadYTTrack(ytCurrentTrack, true);
    }
  }

  function onYTError(event) {
    // Si el video no se puede reproducir (restricción de embedding)
    // avanzar al siguiente automáticamente
    systemLog("[music] YT error en track " + ytCurrentTrack + " (code " + event.data + ") — saltando");
    ytCurrentTrack = (ytCurrentTrack + 1) % ytPlaylist.length;
    loadYTTrack(ytCurrentTrack, ytPlaying);
  }

  function loadYTTrack(index, autoplay) {
    if (!ytPlayer || !ytPlayer.loadVideoById) return;
    var track = ytPlaylist[index];
    ytCurrentTrack = index;
    updateMusicUI(index);
    if (autoplay) {
      ytPlayer.loadVideoById(track.id);
    } else {
      ytPlayer.cueVideoById(track.id);
    }
    resetProgress();
  }

  function updateMusicUI(index) {
    var track = ytPlaylist[index];
    var nameEl = document.getElementById("music-track-name");
    var artistEl = document.getElementById("music-track-artist");
    var artBg = document.getElementById("music-art-bg");
    var colors = ["#1a1a2e", "#0f2027", "#16213e", "#1a1a2e", "#0d1b2a"];
    if (nameEl) nameEl.textContent = track.name;
    if (artistEl) artistEl.textContent = track.artist;
    if (artBg) artBg.style.background =
      "linear-gradient(135deg, " + (colors[index % colors.length]) + ", #000)";
  }

  function formatMusicTime(s) {
    if (!s || isNaN(s) || s < 0) return "0:00";
    var m = Math.floor(s / 60);
    var sec = Math.floor(s % 60);
    return m + ":" + (sec < 10 ? "0" : "") + sec;
  }

  function startProgressLoop() {
    stopProgressLoop();
    ytProgressTimer = setInterval(function () {
      if (!ytPlayer || !ytPlayer.getCurrentTime) return;
      var cur = ytPlayer.getCurrentTime() || 0;
      var dur = ytPlayer.getDuration() || 0;
      var fill = document.getElementById("music-progress-fill");
      var curEl = document.getElementById("music-time-current");
      var totEl = document.getElementById("music-time-total");
      if (fill && dur > 0) fill.style.width = ((cur / dur) * 100) + "%";
      if (curEl) curEl.textContent = formatMusicTime(cur);
      if (totEl) totEl.textContent = formatMusicTime(dur);
    }, 500);
  }

  function stopProgressLoop() {
    if (ytProgressTimer) { clearInterval(ytProgressTimer); ytProgressTimer = null; }
  }

  function resetProgress() {
    var fill = document.getElementById("music-progress-fill");
    var curEl = document.getElementById("music-time-current");
    var totEl = document.getElementById("music-time-total");
    if (fill) fill.style.width = "0%";
    if (curEl) curEl.textContent = "0:00";
    if (totEl) totEl.textContent = "0:00";
  }

  function initMusicPlayer() {
    var playBtn = document.getElementById("music-btn-play");
    var prevBtn = document.getElementById("music-btn-prev");
    var nextBtn = document.getElementById("music-btn-next");
    var progressBar = document.getElementById("music-progress-bar");
    var volumeSlider = document.getElementById("music-volume");

    // ── Play / Pause ─────────────────────────────────────────
    if (playBtn) {
      playBtn.addEventListener("click", function () {
        if (!ytPlayer || !ytPlayer.getPlayerState) return;
        var state = ytPlayer.getPlayerState();
        if (state === YT.PlayerState.PLAYING) {
          ytPlayer.pauseVideo();
        } else {
          ytPlayer.playVideo();
        }
      });
    }

    // ── Siguiente ────────────────────────────────────────────
    if (nextBtn) {
      nextBtn.addEventListener("click", function () {
        var next = (ytCurrentTrack + 1) % ytPlaylist.length;
        loadYTTrack(next, ytPlaying);
      });
    }

    // ── Anterior ─────────────────────────────────────────────
    if (prevBtn) {
      prevBtn.addEventListener("click", function () {
        var prev = (ytCurrentTrack - 1 + ytPlaylist.length) % ytPlaylist.length;
        loadYTTrack(prev, ytPlaying);
      });
    }

    // ── Click en barra de progreso para saltar ───────────────
    if (progressBar) {
      progressBar.addEventListener("click", function (e) {
        if (!ytPlayer || !ytPlayer.getDuration) return;
        var rect = progressBar.getBoundingClientRect();
        var pct = (e.clientX - rect.left) / rect.width;
        ytPlayer.seekTo(pct * ytPlayer.getDuration(), true);
      });
    }

    // ── Volumen ──────────────────────────────────────────────
    if (volumeSlider) {
      volumeSlider.addEventListener("input", function () {
        if (ytPlayer && ytPlayer.setVolume) ytPlayer.setVolume(parseInt(this.value, 10));
      });
    }

    // Si la API ya estaba lista antes de que initMusicPlayer se ejecutara
    // (posible en recargas con caché caliente)
    if (typeof YT !== "undefined" && YT.Player && !ytPlayer) {
      window.onYouTubeIframeAPIReady();
    }

    updateMusicUI(ytCurrentTrack);
    systemLog("[music] Player inicializado — modo YouTube IFrame API");
  }


  /* ============================================================
     J. DOMContentLoaded — Main Init
     ============================================================ */
  document.addEventListener("DOMContentLoaded", function () {

    // Console welcome
    console.log("%c PORTAFOLIO ALEX MARTÍNEZ 2026 ", "background:#0078d4;color:#fff;font-weight:bold;font-size:13px;padding:6px 14px;");
    console.log("%c HTML5 · CSS3 · JavaScript · Villarrica, Chile", "color:#888;font-size:10px;");

    // AOS animations
    if (typeof AOS !== "undefined") {
      AOS.init({ duration: 850, easing: "ease-out-quart", once: false, offset: 60 });
    }

    // OS Core
    initTheme();
    initAutoLang();
    initMenuToggle();
    initDrag();
    restoreOS();
    initWallpaper();
    initSystemTray();

    // UI features
    initClock();
    initCursor();
    initSkillBars();
    initLangToggle();
    initSliders();
    initTextFx();
    initContactForm();
    initCalendar();
    initWeather();
    initMusicPlayer();
    initObfuscatedContacts();

    // Auto-open widgets
    setTimeout(() => {
      openWindow("window-weather");
      openWindow("window-music");
    }, 1000);

    reclampAllWindows();
    systemLog("OS Initialized successfully — Windows 11 Overhaul Mode");
  });

})();