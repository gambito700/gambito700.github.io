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
