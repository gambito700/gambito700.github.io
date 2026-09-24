# DEV LOG - gambito700.github.io

Bitacora de cambios del proyecto. Reglas: UTF-8 sin BOM en todo archivo,
salida de consola ASCII-safe, sin emojis. Formato por entrada:
fecha | fase | archivo(s) | cambio | resultado | duracion.

--------------------------------------------------------------------------------

## 2026-09-24 - P0 Baseline + Rigor de produccion

- [baseline] Git tag baseline-p0 creado sobre commit 534474f (HEAD al inicio de P0).
- [backup] Copia de seguridad completa del repo (con .git) en
  C:/Users/HPVICT~1/AppData/Local/Temp/opencode/gambito700-backup-baseline-p0.zip
  (222 KB, 2026-09-24).
- [decision] Firma SSH/HOST expuesta en fuente publica: STRIP completo, se reemplaza
  por copyright neutro (c) 2026 gambito700. No se rota la clave SSH (el fingerprint
  era solo una forma profesional de firmar el proyecto; nunca se uso en otro lado).
- [decision] CV descargable Alex CV 2026.pdf: se MANTIENE completo en el index
  (logica reclutadora clasica).
- [decision] Alcance roadmap: freno en P4 (P0-P4 activos; P5+ congelados y
  documentados en README).
- [decision] Encuesta UX respondida: wizard por sesion nueva via sessionStorage,
  labels descriptivos + hint Click to start en P0, FAB WhatsApp siempre visible,
  modo simple en P1, blog-posts.json se elimina (data muerta).
- [entorno] Node v24.11.1 / npm 11.6.2 / Python 3.14.5 / Windows 11 PS 5.1.
- [seguridad] Strip de firma SSH/HOST/EMAIL/FECHA en index.html, css/style.css y
  js/main.js. Reemplazo por copyright neutro: (c) 2026 gambito700 - Alex Martinez.
  Verificado: 0 ocurrencias de SSH:/HOST:/FECHA: en el repo, UTF-8 valido intacto.
  result=OK
- [incidencia] Tras el strip, el transform de lineas elimino por error los separadores
  de cierre de comentarios de cabecera (index.html quedaba con el comentario HTML
  abierto; style.css con la seccion de variables dentro del comentario). Detectado
  por balance de comentarios (48 vs 47 en markup). Corregido reconstruyendo ambas
  cabeceras desde git 534474f con cirugia de lineas: reemplazo SOLO de FIRMA/HOST/
  SSH/EMAIL/FECHA por copyright. Verificado byte-a-byte idem original salvo firma.
  result=OK (commits 2d56b9c + e6b225e)
- [audit] Nuevo .editorconfig (UTF-8, LF, final newline) y scripts/audit-encoding.py
  (verifica UTF-8 estricto + sin BOM + sin mezcla de line endings). Resultado:
  36 archivos, 0 fallos. result=OK
- [docs] README.md reescrito a nivel produccion: badges, stack, arquitectura
  ASCII, estructura de archivos, tabla de configuracion, convenciones (UTF-8/LF/
  commits), deploy GH Pages (sin build, .nojekyll), roadmap P0-P4 activo y P5+
  congelado, estado P0 honesto (pendiente UX + verificacion). result=OK
- [ux] P0.6 implementado por subagente frontend: js/features/ux.js (wizard
  bienvenida por sesion via sessionStorage, FAB WhatsApp con hover email,
  boton help en taskbar con overlay Como navegar, hint Click to start via
  toast). z-index centralizado en config (overlays=2500 derivado de MODAL,
  FAB=EMULATOR.Z_INDEX.FAB). 434 inserciones, 0 deletes; balance de
  comentarios index.html 76/76; sin BOM; sin emojis nuevos. result=OK
- [verificacion] live-server :8080 levantado en background (PID del cmd abierto).
  Verificado con Playwright headless (1440x900): 14 ventanas unicas en DOM
  (cv, about, experience, skills, portfolio, contact, calendar, logs, music,
  calculator, indicators, weather, qr, comments), 18 iconos de escritorio,
  wizard visible en primera sesion y cierra con Empezar, hint toast dispara,
  FAB presente, boton help abre/cierra overlay. 0 errores JS propios; unicas
  fallas de red = pings de terceros de YouTube (doubleclick DNS bloqueado,
  stats qoe abortado) + aviso CSP 'frame-ancestors' ignorado en meta (limite
  documentado de GH Pages sin headers HTTP). result=OK
- [incidencia] live-server fallo la primera vez por cache npx corrupta
  (snapdragon/define-property MODULE_NOT_FOUND). Resuelto limpiando
  _npx/a4d64eb1fb549592; reinstalacion limpia OK. result=OK
- [cierre] CRITERIOS DE SALIDA P0: audit 36/0 OK, firma limpia, README
  produccion, 14/14 ventanas, wizard/FAB/help/labels/hint operativos, sin
  errores de codigo. P0 COMPLETADO.

--------------------------------------------------------------------------------

## 2026-09-24 - P0.8 UX revamp: splash screen + onboarding guiado + microcopy

- [decision] D1: Splash reemplaza al wizard/hint de P0 (composicion de capas UX).
  Splash SIEMPRE en cada carga (z 4000, reloj gigante, CTA bilingue); onboarding
  solo en la 1ra visita via localStorage. Wizard #welcome-wizard y hint de P0
  ELIMINADOS; FAB y help intactos. result=OK
- [decision] D2: Clic unico se mantiene (el spec decia "doble clic"; el copy se
  corrigio a "Haz clic aqui"). result=OK
- [decision] D3: Sin push hasta que el usuario lo pida explicitamente. result=OK
- [decision] D4: onclick/CSP/CSS split NO se tocan en este ciclo (deuda diferida
  a P2; riesgo asumido por decision del usuario). result=OK
- [decision] D5: Microcopy mapping exacto ES/EN: CTA splash "Entrar como
  Reclutador / Cliente" / "Enter as Recruiter / Client"; tour "Tu punto de
  partida" / "Your starting point", "Contacto directo" / "Direct contact",
  "Siguiente" / "Next", "Finalizar" / "Finish", "Saltar ayuda" / "Skip help".
  result=OK
- [feat] Splash screen (#splash-screen) en cada carga: z 4000 centralizado en
  EMULATOR.Z_INDEX.SPLASH (js/config.js), reloj gigante bilingue (es-CL/en-US),
  CTA bilingue, evento window 'app-ready', fade .splash-leaving y remove del DOM
  a los 500ms. Implementado en js/features/ux.js (_initSplash). result=OK
- [feat] OnboardingModule nuevo (js/features/onboarding.js, +216 lineas): tour de
  2 pasos con spotlight + tooltip sobre el icono Mi Curriculumn
  ([data-onboard="step1"] con fallback por onclick) y #fab-wrap; contenido
  bilingue en COPY; Escape/cancelar/terminar limpian DOM y listeners. Clave
  g700_onboarding_done en localStorage via StorageUtil; evento window
  'onboarding-resolved' (detail.finished). result=OK
- [refactor] Wizard #welcome-wizard y hint de P0 ELIMINADOS de index.html y
  ux.js; FAB WhatsApp y boton help intactos. result=OK
- [copy] Renames en 4 iconos del escritorio: Bienvenida -> Mi Curriculumn (EN:
  My Resume) + data-onboard="step1"; Logs -> Consola del Sistema (Solo Devs) /
  System Console (Devs Only); Proyectos -> Proyectos Reales / Real Projects;
  Indicadores -> Indicadores Chile / Chile Indicators. result=OK
- [audio] main.js gatea la musica detras de app-ready/onboarding-resolved:
  visitante recurrente (g700_onboarding_done) abre window-music a los 600ms;
  visitante nuevo espera 'onboarding-resolved' y abre a los 400ms. result=OK
- [archivos] 6 archivos tocados en b662787: css/style.css (+201), index.html
  (58 lineas), js/config.js (+1: Z_INDEX.SPLASH), js/features/onboarding.js
  (nuevo, +216), js/features/ux.js (98), js/main.js (23). Total +508/-90.
  result=OK
- [scm] Commits: b662787 feat(p0): splash screen + onboarding guiado + microcopy
  (task 7f503a66); 7367c68 chore: ignore lemoria vault output dir (vault/ en
  .gitignore, S5). result=OK
- [verificacion] node --check OK en modulos; auditoria encoding 57/57 sin fallos;
  E2E 24/24 del implementador + test independiente 10/10 PASS + revision
  APROBADO. result=OK
- [deuda] Sugerencias pendientes de la revision (S1-S6; registradas, NO
  implementadas por decision de scope; detalle en docs/adr-009-ux-tech-debt.md):
  S1. Focus trap en splash: #splash-screen aria-modal=true sin trap; autofocus
      en #splash-enter o quitar aria-modal.
  S2. Tooltip del tour: aria-labelledby hacia .ux-tooltip-title (hoy aria-label
      fijo "Onboarding").
  S3. Devolver foco a #start-btn tras stop() del tour.
  S4. Comentario scrollX/Y en _positionStep describe mal el mecanismo (no-op
      hoy; fragile si el root scrollea).
  S5. (HECHO en 7367c68) vault/ en .gitignore.
  S6. js/features/ux.js sin newline final.
