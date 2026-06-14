/*
 * =====================================================================
 * PORTAFOLIO ALEX MARTÍNEZ – Front-End 2026
 * File: js/script.js
 *
 * OBJETIVO:
 *   Controlar todo el simulador de escritorio Windows 11:
 *   apertura/cierre de ventanas, arrastre, barra de tareas,
 *   menú inicio, reloj, clima, calculadora, reproductor de
 *   música vía YouTube, calendario, barras de habilidades,
 *   cambio de idioma, fondos animados, y más.
 *
 * DEPENDENCIAS EXTERNAS (deben cargarse ANTES en el HTML):
 *   - anime.js       → Animaciones de texto letra por letra
 *   - Vanta.js       → Efecto de ondas en el fondo del escritorio
 *   - Three.js       → Librería 3D requerida por Vanta.js
 *   - YouTube IFrame API → Reproductor de música oculto
 *   - Bootstrap 5    → Acordeones, modales (formulario FAQ)
 *   - Font Awesome 6 → Iconos en ventanas y barra de tareas
 *
 * ESTRUCTURA DEL CÓDIGO (secciones):
 *   A. OS Core  – Gestor de ventanas (abrir, cerrar, arrastrar)
 *   B. Reloj    – Reloj digital actualizado cada segundo
 *   C. Animación de letras flotantes (initMovingLetters)
 *   D. Skill Bars – Barras de progreso animadas
 *   E. Idioma   – Toggle español/inglés con traducción dinámica
 *   F. Text FX  – Animación de texto letra por letra
 *   G. Contacto – Formulario vía Formspree
 *   H. Calendario – Widget de calendario mensual
 *   I. Clima    – Datos desde Open-Meteo API
 *   J. Música   – Reproductor YouTube con playlist propia
 *   K. Calculadora – Operaciones aritméticas básicas
 *   L. Indicadores – UTM, UF, Dólar desde scraper chileno
 *   M. Inicio   – safeInit + DOMContentLoaded (arranque)
 *
 * CONVENCIÓN:
 *   - Las funciones expuestas globalmente (openWindow, closeWindow,
 *     etc.) se asignan a window.* para que funcionen desde los
 *     onclick en el HTML.
 *   - Las funciones internas se declaran con function name() {}
 *     dentro del IIFE para mantener el ámbito privado.
 *   - safeInit() envuelve cada inicialización para capturar errores
 *     sin romper el resto del programa.
 * =====================================================================
 */

(function () {
  "use strict";

  /* ============================================================
     A. OS CORE – Window Manager, Drag & Drop, Theme, Lang, Wallpaper
     ============================================================
     Esta sección contiene el núcleo del simulador de escritorio:
     apertura/cierre de ventanas, control de z-index, arrastre,
     barra de tareas, menú inicio, fondos de pantalla y registro
     de actividades (systemLog).

     Cada función expuesta globalmente (openWindow, closeWindow,
     nextWallpaper, etc.) se asigna a window.* para que pueda
     usarse desde los onclick en index.html.
     ============================================================ */

  /*
   * ─── zIndexCounter ───────────────────────────────────────────
   * Lleva la cuenta del índice Z para que las ventanas se superpongan
   * correctamente. Cada vez que se abre o se hace clic en una ventana,
   * su z-index aumenta para que quede al frente.
   * ─────────────────────────────────────────────────────────────── */
  var zIndexCounter = 100;

  /**
   * bringToFront(win)
   * Trae una ventana al frente incrementando su z-index.
   * @param {HTMLElement} win - El elemento .win11-window a traer al frente.
   * Cuando el contador llega a 140, se reinicia a 100 para evitar
   * valores excesivamente grandes.
   */
  function bringToFront(win) {
  zIndexCounter = Math.min(zIndexCounter + 2, 150);
  win.style.zIndex = zIndexCounter;
  if (zIndexCounter >= 140) {
    zIndexCounter = 100;
  }
}

  /**
   * getDesktopBounds()
   * Calcula el área segura donde las ventanas pueden moverse sin
   * salirse de la pantalla ni quedar debajo de la barra de tareas.
   * Se recalcula en cada drag y en cada resize del navegador.
   * @returns {Object} { minX, minY, maxX, maxY } Límites en píxeles.
   */
  function getDesktopBounds() {
    var TASKBAR_H = window.innerWidth < 481 ? 40 :
      window.innerWidth < 768 ? 44 : 50;
    return {
      minX: 0,
      minY: 10,
      maxX: window.innerWidth,
      maxY: window.innerHeight - TASKBAR_H
    };
  }

  /**
   * clampWindowToBounds(win)
   * Reubica una ventana para que no se salga del área visible del
   * escritorio. Se usa después de un drag o al redimensionar.
   * @param {HTMLElement} win - La ventana a reubicar.
   */
  function clampWindowToBounds(win) {
    var bounds = getDesktopBounds();
    var left = win.offsetLeft || 0;
    var top = win.offsetTop || 0;
    var maxLeft = Math.max(0, bounds.maxX - win.offsetWidth);
    var maxTop = Math.max(0, bounds.maxY - win.offsetHeight);

    win.style.left = Math.max(bounds.minX, Math.min(left, maxLeft)) + "px";
    win.style.top = Math.max(bounds.minY, Math.min(top, maxTop)) + "px";
  }

  function saveOpenWindows() {
    // Session persistence removed as requested
    return;
  }

  /**
   * openWindow(id)
   * Abre una ventana del sistema: la muestra, reproduce la animación
   * de apertura, la trae al frente y actualiza el icono en la barra
   * de tareas. También cierra el menú inicio si está abierto.
   * @param {string} id - El ID del elemento .win11-window a abrir
   *                      (ej: "window-cv", "window-about").
   * Para usar desde HTML: onclick="openWindow('window-cv')"
   */
  window.openWindow = function (id) {
    var win = document.getElementById(id);
    if (!win) return;

    win.classList.remove("d-none", "minimized", "win-closing");
    // Trigger opening animation
    win.classList.add("win-opening");
    bringToFront(win);

    // Clean up animation class after it completes
    clearTimeout(win._openTimer);
    win._openTimer = setTimeout(function () {
      win.classList.remove("win-opening");
    }, 400);

    // Re-trigger lazy feature initializations when window becomes visible
    win.dispatchEvent(new CustomEvent("window-show"));

    // Update Taskbar Icon
    updateTaskbarIcon(id, true);

    // Close Start Menu if open
    var sm = document.getElementById("start-menu");
    if (sm) sm.classList.remove("show-sm");

    saveOpenWindows();
    var rect = win.getBoundingClientRect();
    systemLog("Window opened: " + id + " at (" + Math.round(rect.left) + "," + Math.round(rect.top) + ") " + Math.round(rect.width) + "x" + Math.round(rect.height));
  };

  /**
   * closeWindow(id)
   * Cierra una ventana: reproduce la animación de cierre y luego
   * la oculta (clase .d-none). También limpia el icono de la barra
   * de tareas y guarda el estado.
   * @param {string} id - El ID de la ventana a cerrar.
   */
  window.closeWindow = function (id) {
    var win = document.getElementById(id);
    if (win && !win.classList.contains("win-closing")) {
      // Ensure any transient state is cleared when closing
      win.classList.remove("maximized", "minimized", "win-opening");
      // DO NOT clear width/height — preserve window size on close/reopen
      // win.style.width = "";
      // win.style.height = "";
      try { delete win.dataset.prevRect; } catch (e) {}
      // Play closing animation
      win.classList.add("win-closing");
      clearTimeout(win._closeTimer);
      win._closeTimer = setTimeout(function () {
        win.classList.remove("win-closing");
        win.classList.add("d-none");
      }, 220);
    }
    updateTaskbarIcon(id, false);
    saveOpenWindows();
  };

  /**
   * minimizeWindow(id)
   * Minimiza una ventana agregándole la clase .minimized (escala a 0).
   * @param {string} id - El ID de la ventana a minimizar.
   * Para usar desde HTML: onclick="minimizeWindow('window-cv')"
   */
  window.minimizeWindow = function (id) {
    var win = document.getElementById(id);
    if (win) win.classList.add("minimized");
    var icon = document.querySelector(`.tb-app[data-win="${id}"]`);
    if (icon) icon.classList.remove("active-win");
    saveOpenWindows();
    systemLog("Window minimized: " + id);
  };

  /**
   * maximizeWindow(id)
   * Maximiza una ventana al tamaño completo del escritorio (menos la
   * barra de tareas). Si ya está maximizada, la restaura a su tamaño
   * y posición anterior.
   * @param {string} id - El ID de la ventana a maximizar/restaurar.
   * Guarda la posición y tamaño previos en dataset.prevRect para
   * poder restaurarlos.
   */
  window.maximizeWindow = function (id) {
    var win = document.getElementById(id);
    if (!win) return;
    if (win.classList.contains("maximized")) {
      win.classList.remove("maximized");
      var prev = win.dataset.prevRect;
      if (prev) {
        try {
          var r = JSON.parse(prev);
          win.style.left = r.left + "px";
          win.style.top = r.top + "px";
          win.style.width = r.width + "px";
          win.style.height = r.height + "px";
        } catch (e) {}
      } else {
        win.style.left = "100px";
        win.style.top = "100px";
      }
      reclampAllWindows();
    } else {
      win.dataset.prevRect = JSON.stringify({
        left: win.offsetLeft,
        top: win.offsetTop,
        width: win.offsetWidth,
        height: win.offsetHeight
      });
      win.style.width = "";
      win.style.height = "";
      win.classList.add("maximized");
      win.style.left = "0px";
      win.style.top = "0px";
    }
    bringToFront(win);
    systemLog(`Window ${id} ${win.classList.contains("maximized") ? "maximized" : "restored"}`);
  };

  /**
   * closeAllWindows()
   * Cierra todas las ventanas abiertas (que no estén ocultas ni
   * minimizadas) iterando sobre los elementos .win11-window visibles.
   */
  window.closeAllWindows = function () {
    document.querySelectorAll(".win11-window:not(.d-none):not(.minimized)").forEach(win => {
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
          if (win.classList.contains("d-none") || win.classList.contains("minimized")) {
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

  /**
   * initStartMenu()
   * Configura el menú Inicio: al hacer clic en el botón Windows
   * (#start-btn), se alterna la clase .show-sm en #start-menu.
   * También cierra el menú si se hace clic fuera de él.
   */
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
  try {
    document.querySelectorAll(".win11-window:not(.maximized):not(.d-none)").forEach(win => {
      clampWindowToBounds(win);
    });
  } catch (e) {
    console.warn("Error reclamping windows:", e);
  }
}

  /**
   * initSystemTray()
   * Configura los iconos de la bandeja del sistema (esquina inferior
   * derecha de la barra de tareas). Reemplaza el icono de batería
   * de Font Awesome por una imagen PNG para mejor control visual.
   */
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

    var img = document.getElementById("tray-battery-icon");
    if (img) {
      img.src = "images/icons/battery-charging.png";
      img.title = "Batería (simulada)";
    }
  }

  /**
   * initDrag()
   * Habilita el arrastre de ventanas usando el mouse o táctil.
   * Solo se puede arrastrar desde .window-header. Las ventanas
   * no pueden salirse del área del escritorio (usando getDesktopBounds
   * para definir los límites). Soporta eventos touch para móviles.
   */
  function initDrag() {
    var activeWin = null;
    var isDragging = false;
    var startX, startY, initLeft, initTop;

    function getPos(e) {
      if (e.touches) return { x: e.touches[0].clientX, y: e.touches[0].clientY };
      return { x: e.clientX, y: e.clientY };
    }

    function getWinRect(win) {
      if (win.classList.contains("d-none")) return { left: 100, top: 60 };
      var r = win.getBoundingClientRect();
      return { left: r.left, top: r.top };
    }

    document.querySelectorAll(".window-header").forEach(function (header) {
      var win = header.closest(".win11-window");

      function startDrag(e) {
        if (e.target.closest("button")) return;
        if (win.classList.contains("d-none") || win.classList.contains("minimized") || win.classList.contains("maximized")) return;
        activeWin = win;
        isDragging = true;
        var pos = getPos(e);
        startX = pos.x;
        startY = pos.y;
        var rect = getWinRect(win);
        initLeft = rect.left;
        initTop = rect.top;
        bringToFront(win);
        e.stopPropagation();
        e.preventDefault();
      }

      win.addEventListener("mousedown", function () { bringToFront(win); });
      win.addEventListener("touchstart", function () { bringToFront(win); }, { passive: true });

      header.addEventListener("mousedown", startDrag);
      header.addEventListener("touchstart", startDrag, { passive: false });
    });

    function moveDrag(e) {
      if (!isDragging || !activeWin) return;
      var pos = getPos(e);
      var bounds = getDesktopBounds();
      var newLeft = initLeft + (pos.x - startX);
      var newTop = initTop + (pos.y - startY);

      // Recalculate bounds with current dimensions
      var w = activeWin.offsetWidth;
      var h = activeWin.offsetHeight;
      var maxLeft = Math.max(0, bounds.maxX - w);
      var maxTop = Math.max(0, bounds.maxY - h);

      activeWin.style.left = Math.max(bounds.minX, Math.min(newLeft, maxLeft)) + "px";
      activeWin.style.top = Math.max(bounds.minY, Math.min(newTop, maxTop)) + "px";
    }

    function endDrag() {
      if (isDragging && activeWin) {
        systemLog("[drag] Ended: " + activeWin.id);
      }
      isDragging = false;
      activeWin = null;
    }

    document.addEventListener("mousemove", moveDrag);
    document.addEventListener("touchmove", moveDrag, { passive: false });
    document.addEventListener("mouseup", endDrag);
    document.addEventListener("touchend", endDrag);
  }

  // Reajustar ventanas al cambiar tamaño del navegador
  var resizeTimer;
  window.addEventListener("resize", function () {
    reclampAllWindows();
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      systemLog("[resize] Viewport: " + window.innerWidth + "x" + window.innerHeight);
    }, 500);
  });

  /**
   * restoreOS()
   * Restaura el estado inicial del escritorio: reinicia posiciones
   * de ventanas y abre automáticamente la ventana de CV (portafolio)
   * después de 500ms de carga.
   */
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

  /**
   * systemLog(msg)
   * Registra mensajes en la consola y en el visor de logs del sistema
   * (#log-output-area). Cada mensaje incluye una marca de tiempo y
   * el tiempo de respuesta desde el último mensaje.
   * @param {string} msg - El mensaje a registrar.
   * 
   * Útil para depuración: todos los componentes del sistema llaman
   * a systemLog() para informar sus acciones.
   */
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
        // FIFO: keep max 200 entries
        while (area.children.length > 200) {
          area.removeChild(area.firstChild);
        }
        area.scrollTop = area.scrollHeight;
      }
    } catch (e) { }
  };



  function setWallpaperFallback(d) {
    if (!d) d = document.getElementById("desktop");
    if (!d) return;
    d.style.backgroundImage = "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)";
    d.style.backgroundColor = "#1a1a2e";
    systemLog("[wallpaper] Using gradient fallback");
  }

  function getWallpaperUrl(seed) {
    // Reduced max size for background images (1280x720) - much faster loading, less bandwidth
    // Using WebP format via picsum.photos format parameter
    var w = Math.min(window.innerWidth, 1280);
    var h = Math.min(window.innerHeight, 720);
    // Ensure minimum dimensions to avoid tiny images on small viewports
    w = Math.max(w, 800);
    h = Math.max(h, 450);
    return "https://picsum.photos/seed/" + seed + "/" + w + "/" + h + "?format=webp";
  }

  function loadWallpaperUrl(d, url, fallback) {
    // Show blur placeholder while loading
    d.style.backgroundImage = "none";
    d.style.backgroundColor = "#0f0f0f";
    d.style.filter = "blur(0)";
    d.style.transition = "filter 0.6s ease-out, background-color 0.3s ease";

    var img = new Image();
    img.decoding = "async"; // Allow async decoding for better performance
    img.loading = "lazy"; // Hint for lazy loading (though not used directly as bg)

    img.onload = function () {
      // Apply loaded image with smooth transition
      d.style.backgroundImage = "url('" + url + "')";
      d.style.backgroundColor = "#0f0f0f";
      // Remove blur after image loads
      requestAnimationFrame(function () {
        d.style.filter = "blur(0px)";
      });
      systemLog("[wallpaper] Loaded: " + url.substring(0, 60) + " (" + img.width + "x" + img.height + ")");
    };
    img.onerror = function () {
      systemLog("[wallpaper] Failed: " + url.substring(0, 60));
      d.style.filter = "blur(0px)";
      if (fallback) fallback();
    };
    img.src = url;
  }

  // Preload next wallpaper for instant switching
  function preloadNextWallpaper() {
    var seed = Math.floor(Math.random() * 1000);
    var url = getWallpaperUrl(seed);
    var link = document.createElement("link");
    link.rel = "preload";
    link.as = "image";
    link.type = "image/webp";
    link.href = url;
    document.head.appendChild(link);
    // Clean up after load
    link.onload = function () { link.remove(); };
    link.onerror = function () { link.remove(); };
  }

  /**
   * nextWallpaper()
   * Cambia el fondo de escritorio a una imagen aleatoria de
   * Picsum (servicio de imágenes placeholder). Precarga la
   * imagen antes de aplicarla para una transición suave.
   * Se llama desde el botón de la bandeja del sistema.
   */
  window.nextWallpaper = function () {
    var d = document.getElementById("desktop");
    if (!d) return;
    var seed = Math.floor(Math.random() * 1000);
    loadWallpaperUrl(d, getWallpaperUrl(seed), function () {
      setWallpaperFallback(d);
    });
  };

  /**
   * showPowerPopup()
   * Muestra un diálogo con información de contacto al hacer clic
   * en el botón de apagado del menú inicio.
   * Simula el menú de apagado de Windows 11 mostrando datos
   * del portafolio en su lugar.
   */
  window.showPowerPopup = function () {
    alert("Contacto: alexmartinezdiaz91@gmail.com\nVillarrica, Chile");
    systemLog("Power menu opened: Contact info displayed");
  };

  /**
   * initObfuscatedContacts()
   * Activa el sistema de contactos ofuscados: al hacer clic en un
   * enlace de email o teléfono, se revela la información completa
   * (oculta inicialmente con "a***@gmail.com" / "+56 *** *** ****")
   * y abre el enlace correspondiente.
   * 
   * Es una medida de privacidad para evitar que bots scraping
   * capturen direcciones de email fácilmente.
   */
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
        if (href && revealed && !revealed.classList.contains("d-none")) {
          window.open(href, "_blank");
        }
      });
    });
  }

  // ── Shadow Intensity Sliders — REMOVED per user request ──

  /**
   * initMenuToggle()
   * Inicializa el menú inicio. Es un wrapper que llama a
   * initStartMenu() para mantener consistencia con el patrón
   * de inicialización usado en DOMContentLoaded.
   */
  function initMenuToggle() {
    initStartMenu();
  }

  /* ──────────────────────────────────────────────────────────────
     initVantaWaves()
     Inicializa el efecto de ondas animadas en el fondo del
     escritorio usando la librería Vanta.js (que a su vez usa
     Three.js). Las ondas reaccionan al movimiento del mouse.

     REQUISITO: Vanta.js y Three.js deben estar cargados en el HTML
     antes de llamar esta función.

     CÓMO MODIFICAR:
     - Cambia waveHeight para ondas más altas o bajas.
     - Ajusta shininess para más/menos brillo.
     - Si no quieres el efecto, comenta la línea safeInit en
       DOMContentLoaded.
     ────────────────────────────────────────────────────────────── */
  function initVantaWaves() {
    if (!document.body.classList.contains("desktop-mode")) return;
    var d = document.getElementById("desktop");
    if (!d) return;
    // Initialize Vanta.WAVES background effect
    VANTA.WAVES({
        el: "#desktop",
        mouseControls: true,
        touchControls: true,
        gyroControls: false,
        minHeight: 200.0,
        minWidth: 200.0,
        scale: 1.0,
        scaleMobile: 1.0,
        shininess: 102.0,
        waveHeight: 29.5,
        zoom: 1.35
    });
  }

/**
 * initAutoLang()
 * Detecta automáticamente el idioma del navegador del usuario.
 * Si comienza con "es", usa español; de lo contrario, usa inglés.
 * También actualiza el atributo lang en el elemento <html> para
 * accesibilidad WCAG.
 */
function initAutoLang() {
  var nav = navigator.language || "es";
  var lang = nav.startsWith("es") ? "es" : "en";
  systemLog("Auto-detected language: " + lang);
  currentLang = lang;
  updateLanguage();
  
  // Añadir atributos de lenguaje para WCAG 2.1
  document.documentElement.setAttribute("lang", lang);
}

  /**
   * initIndicators()
   * Carga los indicadores económicos chilenos (UTM, UF, Dólar)
   * desde un archivo JSON (scraperUTM/dashboard_data.json) con
   * fallback a api/indicators.json.
   * Muestra los valores formateados como moneda chilena ($).
   * Si falla la carga, muestra "No disponible".
   */
  function initIndicators() {
    var utmEl = document.getElementById("ind-utm");
    var ufEl = document.getElementById("ind-uf");
    var dolarEl = document.getElementById("ind-dolar");
    if (!utmEl) return;
    var urls = [
      "scraperUTM/dashboard_data.json",
      "api/indicators.json"
    ];
    function tryFetch(i) {
      if (i >= urls.length) throw new Error("All URLs failed");
      return fetch(urls[i]).then(function (r) {
        if (!r.ok) throw new Error("HTTP " + r.status);
        return r.json();
      });
    }
    tryFetch(0).catch(function () { return tryFetch(1); })
      .then(function (data) {
        var utm, uf, dolar;
        if (data.previred) {
          utm = data.previred.utm_mayo;
          uf = data.previred.uf_mayo;
        } else {
          utm = data.utm;
          uf = data.uf;
        }
        if (data.sii && data.sii.dolar_diario && data.sii.dolar_diario.length) {
          var ultimo = data.sii.dolar_diario[data.sii.dolar_diario.length - 1];
          dolar = ultimo.valor;
        } else {
          dolar = data.dolar;
        }
        if (utm && utmEl) utmEl.textContent = "$" + Number(utm).toLocaleString("es-CL");
        if (uf && ufEl) ufEl.textContent = "$" + Number(uf).toLocaleString("es-CL");
        if (dolar && dolarEl) dolarEl.textContent = "$" + Number(dolar).toLocaleString("es-CL");
        systemLog("[indicators] UTM/UF loaded");
      })
      .catch(function () {
        if (utmEl) utmEl.textContent = "No disponible";
        if (ufEl) ufEl.textContent = "No disponible";
        if (dolarEl) dolarEl.textContent = "No disponible";
        systemLog("[indicators] Fetch failed, showing N/A");
      });
  }


  /* ============================================================
     J. DOMContentLoaded — Main Init
     ============================================================ */
  var clockInterval = null;
  /**
   * initClock()
   * Inicializa el reloj digital en la barra de tareas. Actualiza
   * la hora cada segundo (setInterval con 1000ms). Muestra formato
   * HH:MM y la fecha según el idioma seleccionado.
   * 
   * Los elementos HTML objetivo son #clock-time y #clock-date.
   */
  function initClock() {
    var timeEl = document.getElementById("clock-time"); // fixed: was #clockTime
    var dateEl = document.getElementById("clock-date"); // fixed: was #clockDate
    if (!timeEl) return;
    if (clockInterval) { clearInterval(clockInterval); clockInterval = null; }
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
    systemLog("[clock] Digital clock started");
    clockInterval = setInterval(tick, 1000);
  }



  /* ============================================================
     D. SKILL BARS
     ============================================================
     Anima las barras de progreso de habilidades cuando la ventana
     correspondiente se hace visible. Usa IntersectionObserver para
     detectar cuándo la barra entra en pantalla, o MutationObserver
     si está dentro de una ventana cerrada inicialmente.
     ============================================================ */
  function initSkillBars() {
    var bars = document.querySelectorAll(".skill-fill");
    if (!bars.length) return;
    bars.forEach(function (b) {
      b.style.width = "0%";
      var win = b.closest(".win11-window");
      if (win && win.classList.contains("d-none")) {
        var mo = new MutationObserver(function () {
          if (!win.classList.contains("d-none")) {
            animateBar(b);
            mo.disconnect();
          }
        });
        mo.observe(win, { attributes: true, attributeFilter: ["class"] });
      } else {
        var observer = new IntersectionObserver(function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) { animateBar(entry.target); observer.unobserve(entry.target); }
          });
        }, { threshold: 0.3 });
        observer.observe(b);
      }
    });
  }

  function animateBar(bar) {
    var base = parseInt(bar.getAttribute("data-value"), 10) || 50;
    var label = bar.closest(".skill-bar-item") && bar.closest(".skill-bar-item").querySelector(".skill-pct");
    // Animate from 0% to data-value once using CSS transition
    bar.style.width = base + "%";
    if (label) label.textContent = base + "%";
  }


  /* ============================================================
     E. LANGUAGE TOGGLE ES / EN
     ============================================================
     Sistema de internacionalización (i18n) básico. Cambia todos
     los textos del sitio entre español e inglés usando atributos
     data-en y data-es en cada elemento del HTML.

     CÓMO AGREGAR UN NUEVO TEXTO TRADUCIBLE:
     1. En el HTML, agrega data-en="English text" data-es="Texto español"
        al elemento.
     2. Para placeholders (inputs), usa data-placeholder-en y
        data-placeholder-es.
     ============================================================ */
  var currentLang = "es";

  /**
   * initLangToggle()
   * Configura el botón de cambio de idioma (#lang-toggle). Al hacer
   * clic, alterna entre español e inglés y actualiza todos los textos
   * visibles mediante applyLanguage().
   * También ajusta el formato del reloj y el calendario.
   */
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
    // Update clock format without re-initializing
    var n = new Date();
    var timeEl = document.getElementById("clock-time");
    var dateEl = document.getElementById("clock-date");
    if (timeEl) timeEl.textContent = String(n.getHours()).padStart(2, "0") + ":" + String(n.getMinutes()).padStart(2, "0");
    if (dateEl) dateEl.textContent = n.toLocaleDateString(currentLang === "es" ? "es-CL" : "en-US", { day: "2-digit", month: "2-digit", year: "numeric" });
    // Re-render calendar labels without re-initializing
    renderCalendar();
  }

  function applyLanguage(lang) {
    document.querySelectorAll("[data-" + lang + "]").forEach(function (el) {
      var val = el.getAttribute("data-" + lang);
      if (val === null) return;
      var tag = el.tagName;
      // Skip inputs, textareas, accordion buttons (Bootstrap managed), and select
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      if (el.classList.contains("accordion-button")) return;
      // txt-fx elements: actualizar textContent (initTextFx reconstruye el DOM interno)
      if (el.classList.contains("txt-fx")) {
        el.textContent = val;
        return;
      }
      el.textContent = val;
    });
    // Update placeholders
    document.querySelectorAll("[data-placeholder-" + lang + "]").forEach(function (el) {
      var ph = el.getAttribute("data-placeholder-" + lang);
      if (ph !== null) el.placeholder = ph;
    });
    // Update accordion button data attributes (they store the button text)
    document.querySelectorAll("[data-" + lang + "].accordion-button").forEach(function (el) {
      var val = el.getAttribute("data-" + lang);
      if (val !== null) el.textContent = val;
    });
    // Update accordion body data attributes
    document.querySelectorAll("[data-" + lang + "].accordion-body").forEach(function (el) {
      var val = el.getAttribute("data-" + lang);
      if (val !== null) el.textContent = val;
    });
    document.documentElement.setAttribute("lang", lang);
  }


  /* ============================================================
     F. TEXT FX (letter-by-letter animation)
     ============================================================
     Toma elementos con clase .txt-fx y descompone su texto en
     letras individuales envueltas en <span>, luego las anima
     secuencialmente (efecto "máquina de escribir" / revelado).

     Cada letra aparece con un retraso progresivo (stagger) que
     crea un efecto de escritura fluida. Usa transiciones CSS
     definidas en style.css (.txt-fx .letter).

     REQUISITO: Los elementos deben tener la clase .txt-fx en HTML.
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
     H. CONTACT FORM (Formspree)
     ============================================================
     Gestiona el envío del formulario de contacto a través de
     Formspree (servicio que convierte formularios HTML en emails).
     Incluye validación básica (nombre, email, mensaje requeridos;
     formato de email válido).

     Estados:
     - Éxito: muestra mensaje verde (#form-success)
     - Error: muestra mensaje rojo (#form-error)
     - Cargando: deshabilita botón y muestra spinner

     CÓMO MODIFICAR:
     - Cambia la URL en fetch() si usas otro servicio.
     - Ajusta la validación en las condiciones if.
     ============================================================ */
  function initContactForm() {
    var btn = document.getElementById("contact-submit");
    var successMsg = document.getElementById("form-success");
    var errorMsg = document.getElementById("form-error");
    if (!btn) return;

    var form = document.getElementById("contactForm");
    if (!form) return;

    form.addEventListener("submit", function (e) {
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
      var formData = new FormData(form);
      fetch("https://formspree.io/f/xpqeyqqg", {
        method: "POST",
        body: formData,
        headers: { "Accept": "application/json" }
      }).then(function (response) {
        if (response.ok) {
          successMsg.classList.remove("d-none");
          errorMsg.classList.add("d-none");
          form.reset();
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
     ============================================================
     Widget de calendario mensual con navegación entre meses.
     Renderiza una grilla de días similar al calendario de Windows.
     El mes y año actuales se almacenan en calMonth y calYear.

     COMPONENTES HTML:
     - #cal-title  Muestra "Mes Año" (ej: "Junio 2026")
     - #cal-body   Contenedor de la grilla de días
     - #cal-prev   Botón mes anterior
     - #cal-next   Botón mes siguiente

     CÓMO MODIFICAR:
     - Los nombres de meses están en MONTHS_ES y MONTHS_EN.
     - Ajusta el formato de las celdas en renderCalendar().
     ============================================================ */
  var calMonth = new Date().getMonth();
  var calYear = new Date().getFullYear();

  /**
   * initCalendar()
   * Inicializa el calendario: asigna eventos a los botones de
   * navegación y renderiza el mes actual.
   */
  function initCalendar() {
    var titleEl = document.getElementById("cal-title");
    var bodyEl = document.getElementById("cal-body");
    var prevBtn = document.getElementById("cal-prev");
    var nextBtn = document.getElementById("cal-next");
    if (!titleEl || !bodyEl) return;

    renderCalendar();

    if (prevBtn) prevBtn.addEventListener("click", function () {
      calMonth--; if (calMonth < 0) { calMonth = 11; calYear--; }
      renderCalendar();
      systemLog("[calendar] Navigated to " + titleEl.textContent);
    });
    if (nextBtn) nextBtn.addEventListener("click", function () {
      calMonth++; if (calMonth > 11) { calMonth = 0; calYear++; }
      renderCalendar();
      systemLog("[calendar] Navigated to " + titleEl.textContent);
    });
    systemLog("[calendar] Initialized");
  }

  /**
   * renderCalendar()
   * Renderiza la grilla del calendario para el mes/año actuales
   * (calMonth/calYear). Calcula el primer día del mes y el número
   * total de días, luego genera celdas (.cal-day) para cada día.
   * Resalta el día actual con la clase .cal-today.
   * No recibe parámetros; usa las variables globales calMonth y
   * calYear, y los elementos del DOM #cal-title y #cal-body.
   */
  function renderCalendar() {
    var titleEl = document.getElementById("cal-title");
    var bodyEl = document.getElementById("cal-body");
    if (!titleEl || !bodyEl) return;
    var MONTHS_ES = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
    var MONTHS_EN = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    var months = currentLang === "en" ? MONTHS_EN : MONTHS_ES;
    titleEl.textContent = months[calMonth] + " " + calYear;
    bodyEl.innerHTML = "";
    var first = new Date(calYear, calMonth, 1).getDay();
    var days = new Date(calYear, calMonth + 1, 0).getDate();
    var today = new Date();
    for (var i = 0; i < first; i++) {
      var empty = document.createElement("span"); empty.className = "cal-empty"; bodyEl.appendChild(empty);
    }
    for (var d = 1; d <= days; d++) {
      var cell = document.createElement("span");
      cell.textContent = d;
      cell.className = "cal-day";
      if (d === today.getDate() && calMonth === today.getMonth() && calYear === today.getFullYear()) cell.classList.add("cal-today");
      bodyEl.appendChild(cell);
    }
  }


  /* ============================================================
     L. WEATHER API (Open-Meteo)
     ============================================================
     Consulta la API gratuita de Open-Meteo para obtener el clima
     actual de Villarrica, Chile (lat: -39.2833, lon: -72.2333).

     Muestra:
     - Temperatura actual
     - Descripción del clima (traducida ES/EN)
     - Humedad relativa
     - Velocidad del viento

     Si la API no responde, muestra un mensaje de error.
     La función weatherCodeDesc() traduce los códigos numéricos
     de Open-Meteo a texto legible.
     ============================================================ */
  function initWeather() {
    var tempEl = document.getElementById("weather-temp");
    var descEl = document.getElementById("weather-desc");
    var humidEl = document.getElementById("weather-humidity");
    var windEl = document.getElementById("weather-wind");
    var errEl = document.getElementById("weather-error");
    if (!tempEl) return;

    // Villarrica, Chile coordinates
    var lat = -39.2833;
    var lon = -72.2333;
    var url = "https://api.open-meteo.com/v1/forecast?latitude=" + lat + "&longitude=" + lon + "&current_weather=true&hourly=temperature_2m,relative_humidity_2m,wind_speed_10m,weathercode&timezone=America%2FSantiago&forecast_days=1";

    fetch(url)
      .then(function (r) { if (!r.ok) throw new Error("HTTP " + r.status); return r.json(); })
      .then(function (data) {
        var cw = data.current_weather;
        var desc = weatherCodeDesc(cw.weathercode, currentLang);
        tempEl.textContent = Math.round(cw.temperature) + "°C";
        descEl.textContent = desc;
        descEl.setAttribute("data-es", weatherCodeDesc(cw.weathercode, "es"));
        descEl.setAttribute("data-en", weatherCodeDesc(cw.weathercode, "en"));
        if (humidEl && data.hourly) {
          var idx = data.hourly.time.findIndex(function (t) { return t >= cw.time; });
          if (idx >= 0) humidEl.innerHTML = '<i class="fas fa-tint"></i> ' + data.hourly.relative_humidity_2m[idx] + "%";
        }
        if (windEl) windEl.innerHTML = '<i class="fas fa-wind"></i> ' + Math.round(cw.windspeed) + " km/h";
        if (errEl) errEl.classList.add("d-none");
        systemLog("[weather] Data loaded for Villarrica");
      })
      .catch(function (err) {
        if (errEl) { errEl.classList.remove("d-none"); errEl.textContent = currentLang === "es" ? "No se pudo cargar el clima" : "Could not load weather"; }
        systemLog("[weather] Error: " + err.message);
      });
  }

  /**
   * weatherCodeDesc(code, lang)
   * Traduce un código numérico de clima de Open-Meteo a texto
   * descriptivo en español o inglés.
   * @param {number} code  - Código WMO de condición climática (0-99).
   * @param {string} lang  - Idioma: "es" o "en".
   * @returns {string} Descripción del clima en el idioma indicado.
   * 
   * Los códigos siguen el estándar WMO (Organización Meteorológica
   * Mundial). Ver: https://open-meteo.com/en/docs
   */
  function weatherCodeDesc(code, lang) {
    lang = lang || currentLang;
    var codes = {
      0: { es: "Despejado", en: "Clear sky" },
      1: { es: "Mayormente despejado", en: "Mainly clear" },
      2: { es: "Parcialmente nublado", en: "Partly cloudy" },
      3: { es: "Nublado", en: "Overcast" },
      45: { es: "Niebla", en: "Foggy" },
      48: { es: "Niebla con escarcha", en: "Depositing rime fog" },
      51: { es: "Llovizna ligera", en: "Light drizzle" },
      53: { es: "Llovizna moderada", en: "Moderate drizzle" },
      55: { es: "Llovizna densa", en: "Dense drizzle" },
      61: { es: "Lluvia ligera", en: "Slight rain" },
      63: { es: "Lluvia moderada", en: "Moderate rain" },
      65: { es: "Lluvia intensa", en: "Heavy rain" },
      71: { es: "Nevada ligera", en: "Slight snow" },
      73: { es: "Nevada moderada", en: "Moderate snow" },
      75: { es: "Nevada intensa", en: "Heavy snow" },
      80: { es: "Chubascos ligeros", en: "Slight rain showers" },
      81: { es: "Chubascos moderados", en: "Moderate rain showers" },
      82: { es: "Chubascos violentos", en: "Violent rain showers" },
      95: { es: "Tormenta", en: "Thunderstorm" },
      96: { es: "Tormenta con granizo ligero", en: "Thunderstorm with slight hail" },
      99: { es: "Tormenta con granizo intenso", en: "Thunderstorm with heavy hail" }
    };
    var entry = codes[code];
    return entry ? entry[lang] : (lang === "es" ? "Estado desconocido" : "Unknown");
  }


  /* ============================================================
     M. MUSIC PLAYER — YouTube IFrame API
     ============================================================
     Reproductor de música que usa la API de YouTube para reproducir
     videos (audio solamente) en segundo plano. El iframe de YT está
     oculto (1x1px) y la UI propia controla la reproducción.

     Playlist: canciones sin derechos de autor (YouTube Audio Library
     / lofi públicos) seleccionadas para ambiente de trabajo.

     FLUJO:
     1. La YouTube IFrame API se carga desde el HTML.
     2. onYouTubeIframeAPIReady() crea el reproductor oculto.
     3. La UI (botones play/pause, siguiente, anterior, volumen,
        barra de progreso) controla el reproductor vía la API.

     CÓMO MODIFICAR LA PLAYLIST:
     - Edita el array ytPlaylist con IDs de videos de YouTube.
     - Asegúrate de que los videos permitan embedding.
     ============================================================ */

  // Playlist: canciones atractivas seleccionadas (embedding permitido)
  var ytPlaylist = [
    { id: "lPlmFBYqzF0", name: "Midnight Vibes", artist: "Track 1" },
    { id: "RGlIdPb7QTA", name: "Electric Dreams", artist: "Track 2" },
    { id: "6aouLxiL4Cw", name: "Urban Flow", artist: "Track 3" },
    { id: "TQvXEza4fPc", name: "Neon Lights", artist: "Track 4" },
    { id: "hPt1gUE1zAc", name: "Sunset Drive", artist: "Track 5" },
    { id: "5QdtKpZgtmU", name: "Starlight", artist: "Track 6" }
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
    var vol = document.getElementById("window-music-volume");
    if (vol) event.target.setVolume(parseInt(vol.value, 10));
    systemLog("[music] YouTube player listo");
  }

  function onYTStateChange(event) {
    var winPlayIconImg = document.getElementById("window-music-play-icon");

    if (event.data === YT.PlayerState.PLAYING) {
      ytPlaying = true;
      if (winPlayIconImg) winPlayIconImg.src = "images/icons/pausa.png";
      startProgressLoop();
      systemLog("[music] Playing: " + ytPlaylist[ytCurrentTrack].name);
      window.showToast(ytPlaylist[ytCurrentTrack].name, ytPlaylist[ytCurrentTrack].artist);
    } else if (event.data === YT.PlayerState.PAUSED) {
      ytPlaying = false;
      if (winPlayIconImg) winPlayIconImg.src = "images/icons/play.png";
      stopProgressLoop();
      systemLog("[music] Paused");
    } else if (event.data === YT.PlayerState.BUFFERING) {
      if (winPlayIconImg) winPlayIconImg.src = "images/icons/pausa.png";
    } else if (event.data === YT.PlayerState.ENDED) {
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
    var winName = document.getElementById("window-music-name");
    var winArtist = document.getElementById("window-music-artist");
    if (winName) winName.textContent = track.name;
    if (winArtist) winArtist.textContent = track.artist;
  }

  function startProgressLoop() {
    stopProgressLoop();
    ytProgressTimer = setInterval(function () {
      if (!ytPlayer || !ytPlayer.getCurrentTime) return;
      var cur = ytPlayer.getCurrentTime() || 0;
      var dur = ytPlayer.getDuration() || 0;
      var winFill = document.getElementById("window-progress-fill");
      var pct = (dur > 0) ? ((cur / dur) * 100) + "%" : "0%";
      if (winFill) winFill.style.width = pct;
    }, 500);
  }

  function stopProgressLoop() {
    if (ytProgressTimer) { clearInterval(ytProgressTimer); ytProgressTimer = null; }
  }

  function resetProgress() {
    var fill = document.getElementById("window-progress-fill");
    if (fill) fill.style.width = "0%";
  }

  /**
   * initMusicPlayer()
   * Inicializa la interfaz del reproductor de música: asigna
   * eventos a los botones de play/pause (#window-music-play),
   * siguiente/anterior, barra de progreso y volumen.
   * También verifica si la API de YouTube ya está disponible
   * (polling cada 500ms) por si la carga es asíncrona.
   */
  function initMusicPlayer() {
    var playBtn = document.getElementById("window-music-play");
    var prevBtn = document.getElementById("window-music-prev");
    var nextBtn = document.getElementById("window-music-next");
    var progressBar = document.getElementById("window-progress-bar");
    var volumeSlider = document.getElementById("window-music-volume");

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

    // Polling: si YT.Player aun no esta disponible, reintentar cada 500ms
    (function pollYT() {
      if (typeof YT !== "undefined" && YT.Player && !ytPlayer) {
        systemLog("[music] Fallback: YT.Player detected via polling, creating player");
        window.onYouTubeIframeAPIReady();
      } else if (!ytPlayer) {
        systemLog("[music] Polling: YT.Player not ready yet, retrying in 500ms");
        setTimeout(pollYT, 500);
      }
/**
 * initMovingLetters()
 * Crea la animación de texto de bienvenida que flota sobre el
 * escritorio. Muestra mensajes en un ciclo infinito, con letras
 * que entran y salen usando anime.js.

 * CÓMO MODIFICAR:
 * - Cambia los textos en el array "messages" (primer idioma español).
 * - Ajusta la duración del intervalo (12000ms = 12 segundos) para
 *   que los mensajes cambien más rápido o más lento.
 * - Modifica los valores de translateX, opacity, duration y delay
 *   para personalizar la animación.

 * REQUISITO: anime.js debe estar cargado en el HTML.
 */
function initMovingLetters() {
  const messages = [
    "Bienvenido a mi Portafolio Demostrativo",
    "diseño y programado por alex M."
  ];
  let idx = 0;
  const container = document.getElementById("moving-letters");
  if (!container) return;
  function showMessage(text) {
    container.innerHTML = `<h1 class="ml12">${text}</h1>`;
    const wrapper = container.querySelector('.ml12');
    wrapper.innerHTML = wrapper.textContent.replace(/\S/g, "<span class='letter'>$&</span>");
    anime.timeline({loop:false})
      .add({
        targets: '.ml12 .letter',
        translateX: [40,0],
        translateZ: 0,
        opacity: [0,1],
        easing: "easeOutExpo",
        duration: 1200,
        delay: (el, i) => 500 + 30 * i
      })
      .add({
        targets: '.ml12 .letter',
        translateX: [0,-30],
        opacity: [1,0],
        easing: "easeInExpo",
        duration: 1100,
        delay: (el, i) => 100 + 30 * i
      });
  }
  showMessage(messages[idx]);
  setInterval(() => {
    idx = (idx + 1) % messages.length;
    showMessage(messages[idx]);
  }, 12000);
}

/**
 * initRandomBackgroundFilter()
 * APLICA un filtro CSS aleatorio al body de la página.
 * Es una función experimental que demuestra cómo manipular estilos
 * desde JavaScript. Actualmente se llama pero puede desactivarse
 * comentando su safeInit en DOMContentLoaded.
 *
 * POSIBLES FILTROS: blur, brightness, contrast, hue-rotate
 */
function initRandomBackgroundFilter(){
  const filters=['blur(2px)','brightness(0.8)','contrast(1.3)','hue-rotate(45deg)'];
  const f=filters[Math.floor(Math.random()*filters.length)];
  document.body.style.filter = f;
}
safeInit(initMovingLetters, "initMovingLetters");
})();

    updateMusicUI(ytCurrentTrack);
    systemLog("[music] Player inicializado — modo YouTube IFrame API");
  }




  /**
   * initCalculator()
   * Inicializa la calculadora: maneja clics en los botones
   * (.calc-btn) mediante event delegation (un solo evento en
   * .calc-grid). Soporta dígitos, operaciones (+ - × ÷),
   * porcentaje (%), cambio de signo (±), limpieza (C) e
   * igual (=). Usa atributos data-v en cada botón para saber
   * qué valor representan.
   * 
   * Estados internos: cur (valor actual), op (operador pendiente),
   * prev (valor previo), reset (borrar al escribir), isError.
   */
  function initCalculator() {
    var display = document.getElementById("calc-display");
    var sub = document.getElementById("calc-sub");
    var grid = document.querySelector(".calc-grid");
    if (!display || !grid) return;
    var cur = "0", op = null, prev = null, reset = false, isError = false;

    function updateDisplay() {
      display.textContent = cur.length > 14 ? parseFloat(cur).toExponential(6) : cur;
    }

    // Event delegation on grid container — robust against DOM timing
    grid.addEventListener("click", function (e) {
      var btn = e.target.closest(".calc-btn");
      if (!btn) return;
      var v = btn.getAttribute("data-v");

      if (btn.classList.contains("num")) {
        if (isError) {
          cur = "0"; op = null; prev = null; reset = false; isError = false;
          if (sub) sub.textContent = "";
        }
        if (reset || cur === "0") { cur = ""; reset = false; }
        if (v === "." && cur.indexOf(".") !== -1) return;
        cur += v;
        updateDisplay();
      } else if (v === "C") {
        cur = "0"; op = null; prev = null; reset = false; isError = false;
        if (sub) sub.textContent = "";
        updateDisplay();
      } else if (v === "\u00B1") {
        if (isError) return;
        cur = String(parseFloat(cur) * -1);
        updateDisplay();
      } else if (v === "%") {
        if (isError) return;
        cur = String(parseFloat(cur) / 100);
        updateDisplay();
      } else if (v === "=") {
        if (isError) return;
        if (op && prev !== null) {
          var a = parseFloat(prev), b = parseFloat(cur), r;
          if (op === "+") r = a + b;
          else if (op === "-") r = a - b;
          else if (op === "\u00D7") r = a * b;
          else if (op === "\u00F7") r = b !== 0 ? a / b : "Error";
          if (sub) sub.textContent = prev + " " + op + " " + cur + " =";
          if (r === "Error" || r === Infinity || (typeof r === "number" && !isFinite(r))) {
            cur = "Error"; isError = true; op = null; prev = null; reset = true;
            display.textContent = "Error";
            return;
          }
          cur = String(typeof r === "number" ? Math.round(r * 1e10) / 1e10 : r);
          op = null; prev = null; reset = true;
          updateDisplay();
        }
      } else if (["+","-","\u00D7","\u00F7"].indexOf(v) !== -1) {
        if (isError) return;
        if (op && prev !== null && !reset) {
          var a = parseFloat(prev), b = parseFloat(cur), r;
          if (op === "+") r = a + b;
          else if (op === "-") r = a - b;
          else if (op === "\u00D7") r = a * b;
          else if (op === "\u00F7") r = b !== 0 ? a / b : "Error";
          if (r === "Error" || r === Infinity || (typeof r === "number" && !isFinite(r))) {
            cur = "Error"; isError = true; op = null; prev = null; reset = true;
            display.textContent = "Error";
            return;
          }
          cur = String(typeof r === "number" ? Math.round(r * 1e10) / 1e10 : r);
          updateDisplay();
        }
        prev = cur; op = v; reset = true;
        if (sub) sub.textContent = prev + " " + op;
      }
      systemLog("[calc] " + v + " = " + cur);
    });
    systemLog("[calculator] Initialized (event delegation)");
  }

  /**
   * showToast(title, msg)
   * Muestra una notificación emergente tipo "toast" en la esquina
   * inferior derecha. Se usa actualmente para notificar la canción
   * que está sonando en el reproductor.
   * @param {string} title - Título de la notificación.
   * @param {string} msg   - Mensaje descriptivo.
   * La notificación se oculta automáticamente tras 4 segundos.
   */
  var toastHideTimer = null;
  window.showToast = function (title, msg) {
    var toast = document.getElementById("toast-notification");
    if (!toast) return;
    var titleEl = toast.querySelector(".toast-title");
    var msgEl = toast.querySelector(".toast-msg");
    if (titleEl && title) titleEl.textContent = title;
    if (msgEl && msg) msgEl.textContent = msg;
    toast.classList.remove("d-none");
    if (toastHideTimer) { clearTimeout(toastHideTimer); toastHideTimer = null; }
    toastHideTimer = setTimeout(function () {
      toast.classList.add("d-none");
    }, 4000);
  };
  function initToastDismiss() {
    var closeBtn = document.getElementById("toast-close-btn");
    if (closeBtn) {
      closeBtn.addEventListener("click", function () {
        var toast = document.getElementById("toast-notification");
        if (toast) toast.classList.add("d-none");
        if (toastHideTimer) { clearTimeout(toastHideTimer); toastHideTimer = null; }
      });
    }
  }







  /* ============================================================
     J. DOMContentLoaded — Main Init
     ============================================================
     safeInit() es una función auxiliar que envuelve cada
     inicialización en un bloque try/catch. Si una función falla,
     el error se registra en systemLog pero NO detiene al resto
     del programa. Esto asegura que todo el sitio siga funcionando
     aunque un componente tenga problemas.

     @param {Function} fn   - La función a ejecutar.
     @param {string}   name - Nombre descriptivo para los logs.
     ============================================================ */
  function safeInit(fn, name) {
    try { fn(); } catch (e) { systemLog("[error] " + name + " failed: " + e.message); console.error(name, e); }
  }

  /*
   * ================================================================
   * DOMContentLoaded  –  Punto de entrada principal
   * ================================================================
   * Este evento se dispara cuando el HTML ha sido completamente
   * cargado y parseado. Aquí se inicializan todos los componentes
   * del simulador Windows 11.
   *
   * ORDEN DE INICIALIZACIÓN:
   * 1. Núcleo del OS  →  Idioma, menú inicio, arrastre de ventanas,
   *                      restauración de estado, fondo Vanta, bandeja
   * 2. Características UI → Reloj, barras de skills, idioma, textos
   *                         animados, formulario, calendario, clima
   * 3. Extras          →  Calculadora, indicadores, música, contactos
   *                       ofuscados, letras flotantes
   *
   * CADA COMPONENTE USA safeInit() para que un error en uno no
   * afecte a los demás.
   *
   * CÓMO MODIFICAR:
   * - Para DESACTIVAR un componente, simplemente comenta su safeInit().
   * - Para AGREGAR uno nuevo, escribe tu función init*() y añade
   *   su safeInit() aquí.
   * - Para CAMBIAR el orden, reordena las líneas de safeInit().
   * ================================================================ */
  document.addEventListener("DOMContentLoaded", function () {

    // Console welcome — mensaje decorativo en la consola del navegador
    console.log("%c PORTAFOLIO ALEX MARTÍNEZ 2026 ", "background:#0078d4;color:#fff;font-weight:bold;font-size:13px;padding:6px 14px;");
    console.log("%c HTML5 · CSS3 · JavaScript · Villarrica, Chile", "color:#888;font-size:10px;");

    // ── OS Core ─────────────────────────────────────────────
    // Funciones fundamentales del sistema operativo simulado
    safeInit(initAutoLang, "initAutoLang");       // Detecta idioma del navegador
    safeInit(initMenuToggle, "initMenuToggle");   // Activa botón de menú inicio
    safeInit(initDrag, "initDrag");               // Arrastre de ventanas
    safeInit(restoreOS, "restoreOS");             // Estado inicial (abre CV)
    safeInit(initVantaWaves, "initVantaWaves");   // Ondas animadas de fondo
    safeInit(initSystemTray, "initSystemTray");   // Iconos de la bandeja del sistema

    // ── UI Features ─────────────────────────────────────────
    // Componentes visuales e interactivos
    safeInit(initClock, "initClock");             // Reloj digital en barra de tareas
    safeInit(initSkillBars, "initSkillBars");     // Barras de habilidades animadas
    safeInit(initLangToggle, "initLangToggle");   // Botón de cambio de idioma
    safeInit(initTextFx, "initTextFx");           // Animación de texto letra por letra
    safeInit(initContactForm, "initContactForm"); // Formulario de contacto (Formspree)
    safeInit(initCalendar, "initCalendar");       // Calendario mensual
    safeInit(initIndicators, "initIndicators");   // Indicadores económicos (UTM/UF/Dólar)
    safeInit(initMusicPlayer, "initMusicPlayer"); // Reproductor de música YouTube
    safeInit(initObfuscatedContacts, "initObfuscatedContacts"); // Contactos con clic para revelar

    // ── New Features ────────────────────────────────────────
    // Funcionalidades adicionales
    safeInit(initCalculator, "initCalculator");       // Calculadora
    safeInit(initWeather, "initWeather");             // Clima desde Open-Meteo
    safeInit(initToastDismiss, "initToastDismiss");   // Cerrar notificaciones
    safeInit(initMovingLetters, "initMovingLetters"); // Texto animado de bienvenida

    // ── Auto-open ──────────────────────────────────────────
    // La ventana de música se abre automáticamente al cargar
    setTimeout(function () {
      openWindow("window-music");
      systemLog("[startup] Music window auto-opened");
    }, 800);

    // Reajusta todas las ventanas dentro de los límites del escritorio
    reclampAllWindows();
    systemLog("OS Initialized successfully — Windows 11 Overhaul Mode");
  });

})();
