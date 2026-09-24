# gambito700.github.io - Portafolio Profesional estilo Windows 11

[HTML5] [CSS3] [JavaScript ES Modules] [GitHub Pages] [Sin build]

Portafolio interactivo que simula un escritorio Windows 11 en el navegador:
ventanas arrastrables, taskbar, menu inicio, tema claro/oscuro y bilingue
ES/EN. 100% estatico, sin frameworks, sin compilacion, listo para GitHub
Pages.

Demo en vivo: https://gambito700.github.io/

## Stack

| Capa        | Tecnologia                                |
|-------------|-------------------------------------------|
| Markup      | HTML5 semantico + JSON-LD (SEO)           |
| Estilos     | CSS3 (variables en :root) + Bootstrap 5.3 |
| Interaccion | JavaScript vanilla ES Modules              |
| Iconos      | Font Awesome 6.5 + PNG custom en images/  |
| Animacion   | CSS + Anime.js                             |
| Tipografia  | Inter + JetBrains Mono                     |
| APIs        | Open-Meteo, ipapi.co, Picsum, Formspree, YouTube IFrame |

## Funcionalidades (14 ventanas)

| Ventana       | Descripcion                                   |
|---------------|-----------------------------------------------|
| window-cv     | CV descargable (Alex CV 2026.pdf)            |
| window-about  | Sobre mi                                      |
| window-experience | Linea de tiempo profesional               |
| window-skills | Barras de habilidades                         |
| window-portfolio | Proyectos destacados                       |
| window-contact | Formulario (Formspree) + redes               |
| window-calendar | Calendario interactivo                      |
| window-logs   | Consola de eventos del sistema                |
| window-music  | Reproductor lo-fi via YouTube IFrame          |
| window-calculator | Calculadora                                |
| window-indicators | Indicadores economicos (UTM)              |
| window-weather | Clima en vivo (geolocalizacion por IP)       |
| window-qr     | Generador de codigos QR                       |
| window-comments | Anotaciones de codigo                       |

Extras: tema claro/oscuro persistente, idioma ES/EN con deteccion
automatica, wallpaper dinamico (Picsum), 404.html custom, sitemap y robots.

## Arquitectura

Archivo unico de entrada con modulos ESM. Configuracion centralizada en
js/config.js (sin hardcodeo en features).

|-- index.html                entry point (escritorio + ventanas)
|-- css/
|   |-- style.css             estilos principales (entry de @imports en P2)
|   |-- extra.css            animacion de bienvenida (.ml12)
|-- js/
|   |-- main.js              bootstrap de modulos (safeInit)
|   |-- config.js            parametros globales (ver seccion Config)
|   |-- core/                window-manager, theme, language
|   |-- features/            13 modulos: calculator, calendar, clock,
|   |                        comments, contact, indicators, moving-letters,
|   |                        music, qr-generator, skill-bars, text-fx,
|   |                        toast, weather
|   |-- utils/               storage (localStorage) y dom helpers
|-- assets/
|   |-- data/                projects.json, translations.json
|   |-- libs/                qrcode.min.js (vendored)
|   |-- fonts/               tipografias locales
|-- images/icons/            iconografia PNG del escritorio
|-- scripts/audit-encoding.py  auditoria UTF-8 (npm run audit)
|-- docs/dev-log.md          bitacora de cambios del proyecto
|-- Alex CV 2026.pdf         CV descargable

## Configuracion (js/config.js)

| Parametro        | Que controla                                  |
|------------------|-----------------------------------------------|
| AUTHOR           | Nombre, email, ubicacion, titulo              |
| THEME            | Modos light/dark/auto                         |
| LANGUAGES        | Idiomas es/en y default                       |
| EMULATOR         | Breakpoints, tamano de ventanas, z-index (incl. FAB) |
| APIS             | Endpoints externos (meteo, ip, Formspree...) |
| STORAGE_KEYS     | Claves de localStorage                        |
| CACHE            | TTL de cache por servicio                     |
| FEATURES         | Flags de features habilitadas                 |
| SOCIAL_LINKS     | GitHub, email, portfolio                      |
| WINDOWS          | Catalogo de ventanas (id, titulo, icono)      |

## Desarrollo local

Requisitos: Node.js 18+ (para live-server y scripts), Python 3 (auditoria).

# Servidor con auto-reload (recomendado)
npx --yes live-server . --port=8080

# Auditoria de encoding (UTF-8 sin BOM, sin line endings mixtos)
npm run audit

# Tests (cuando existan en P1/P2)
npm test

El proyecto no requiere build: es un sitio estatico puro.

## Convenciones del proyecto

- Todo archivo de texto: UTF-8 SIN BOM. Nunca cp1252 ni Latin-1.
- Line endings: LF (git normaliza; .editorconfig lo declara).
- Salida de consola y scripts: ASCII-safe (sin emojis ni unicode decorativo).
- Commits: conventional (fix:, feat:, chore:, docs:, security:) con el
  task-id de lemoria cuando aplique.
- Cada cambio material queda registrado en docs/dev-log.md.

## Deploy (GitHub Pages)

El sitio se sirve directo desde la rama main con .nojekyll (Jekyll
desactivado). No hay paso de build ni CI obligatoria.

1. Git commit + push a main
2. En GitHub: Settings > Pages > Source: Deploy from a branch > main / (root)
3. En minutos queda en https://gambito700.github.io/

Ventaja del stack estatico: deploy deterministico, sin artefactos, sin
secretos servidor-side. Github Pages no permite headers HTTP custom, por
eso la CSP se declara via meta tag en index.html.

## Roadmap

### Activo (P0 - P4)

- P0 - Rigor de produccion: strip de firma SSH de la fuente
  publica, auditoria de encoding (36 archivos, 0 fallos), .editorconfig,
  README de produccion, eliminacion de data muerta (blog), package.json
  minimo, UX basica para no tecnicos (wizard, FAB, help, labels, hint).
- P1 - Sistema de logs: js/core/logger.js (ring buffer, niveles, captura
  de errores, export JSON/TXT), modo simple UX, state manager + event bus.
- P2 - Migracion a addEventListener (elimina los ~79 onclick inline y
  habilita quitar unsafe-inline de la CSP), split de style.css por @import.
- P3 - Componentes reutilizables: modal, button, notification,
  context-menu, tooltip.
- P4 - Capa de servicios: weather, indicators, github, formspree, youtube,
  picsum + repositorio de datos y correccion del drift entre config.WINDOWS
  y los ids reales de las ventanas.

### Congelado (P5+)

- P5 - Web Components propios
- P6 - Suite de tests completa (npm test)
- P7 - Observabilidad: metricas web + logging centralizado
- P8 - Migracion de estetica Windows 11 a tema propio
- P9 - Experimentos en React (react-lab) - solo aprendizaje, no produccion

## Estado P0 (2026-09-24)

Progreso P0 con commits atomicos y bitacora en docs/dev-log.md:
seguridad (firma SSH removida de fuente publica), encoding (auditoria:
36 archivos, 0 fallos), config (blog muerto eliminado, package.json),
README de produccion. Implementado en P0: UX para no tecnicos (wizard de bienvenida por
sesion, boton flotante WhatsApp con hover de correo, boton de ayuda en
la barra de tareas con overlay Como navegar, hint Click to start).
Pendiente: verificacion en vivo con live-server :8080 (14 ventanas,
consola sin errores). El cierre de P0 se marca en dev-log cuando la
verificacion confirme consola sin errores y las 14 ventanas operativas.

## Autor

Alex Martinez (gambito700) - Desarrollador Full Stack
Villarrica, Chile
(ver SOCIAL_LINKS en js/config.js)