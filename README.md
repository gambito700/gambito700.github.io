# Gambito700 · Portafolio Profesional

> Portafolio interactivo con interfaz simulada de Windows 11.
> Desarrollado con HTML, CSS y JavaScript vanilla + Bootstrap 5.

[![GitHub Pages](https://img.shields.io/badge/hosted%20on-GitHub%20Pages-blue?logo=github)](https://gambito700.github.io/)
[![Bootstrap](https://img.shields.io/badge/Bootstrap-5.3-purple?logo=bootstrap)](https://getbootstrap.com/)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES6%2B-yellow?logo=javascript)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)

## Demo

**→ [gambito700.github.io](https://gambito700.github.io/)**

## Stack

| Capa | Tecnología |
|------|-----------|
| Markup | HTML5 semántico |
| Estilos | CSS3 + Bootstrap 5.3.3 |
| Interactividad | JavaScript ES6+ (Vanilla) |
| Íconos | Font Awesome 6.5 |
| Animaciones | Anime.js |
| Tipografía | Inter + JetBrains Mono |
| APIs externas | YouTube IFrame API, Open-Meteo, ipapi.co, Picsum Photos, Formspree |

## Funcionalidades

- **Simulador de Windows 11** — Escritorio con taskbar, menú inicio, ventanas arrastrables con z-index
- **Tema claro/oscuro** — Alternancia en tiempo real con variables CSS
- **Idioma ES/EN** — Switch bilingüe con detección automática del navegador
- **Reproductor Lo-fi** — Música vía YouTube IFrame API con controles y barra de progreso
- **Clima en vivo** — Geolocalización por IP + datos de Open-Meteo
- **Calendario interactivo** — Navegación mensual con resaltado del día actual
- **Wallpaper dinámico** — Fondos aleatorios desde Picsum Photos
- **Formulario de contacto** — Validación client-side + envío vía Formspree
- **Batería en tiempo real** — API de batería del navegador
- **Logs del sistema** — Consola de eventos en vivo

## Estructura

```
gambito700.github.io/
├── index.html              # Single-page application (entry point)
├── 404.html                # Página de error personalizada
├── robots.txt              # Instrucciones para crawlers
├── sitemap.xml             # Mapa del sitio para SEO
├── .nojekyll               # Desactiva Jekyll en GitHub Pages
├── css/
│   ├── style.css           # Estilos principales (variables, layout, componentes)
│   └── extra.css           # Estilos de animación de texto (.ml12)
├── js/
│   ├── main.js             # Entry point modular (type="module")
│   ├── config.js           # Configuración global
│   ├── core/
│   │   ├── window-manager.js  # Gestor de ventanas, drag & drop, taskbar
│   │   ├── theme.js           # Tema claro/oscuro
│   │   └── language.js        # Idioma ES/EN con detección automática
│   ├── features/
│   │   ├── blog.js, calculator.js, calendar.js, clock.js
│   │   ├── comments.js, contact.js, indicators.js
│   │   ├── moving-letters.js, music.js, projects.js
│   │   ├── qr-generator.js, skill-bars.js, social.js
│   │   ├── text-fx.js, toast.js, weather.js
│   │   └── ...
│   └── utils/
│       ├── storage.js      # Utilidades de localStorage
│       └── dom.js           # Helpers DOM (createElement, debounce, throttle)
├── assets/
│   └── data/               # JSON de traducciones, proyectos y blog
├── images/
│   └── icons/              # Iconos PNG personalizados
└── Alex CV 2026.pdf       # CV descargable
```

## Desarrollo local

```bash
# No requiere build tools — abre directo en el navegador
start index.html

# O sirve con servidor local (recomendado)
npx serve .
```

## Contacto

**Alex Martínez** — [alexmartinezdiaz91@gmail.com](mailto:alexmartinezdiaz91@gmail.com) · Villarrica, Chile
