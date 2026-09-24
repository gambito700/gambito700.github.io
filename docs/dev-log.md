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
