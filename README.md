# Gambito700 · Portafolio Profesional

Portafolio interactivo con interfaz simulada de Windows 11. Desarrollado con HTML, CSS y JavaScript vanilla + Bootstrap 5.

[GitHub Pages](https://pages.github.com/) · [Bootstrap](https://getbootstrap.com/) · [JavaScript](https://developer.mozilla.org/en-US/docs/Web/JavaScript)

## Demo

**→ [gambito700.github.io](https://gambito700.github.io/)**

## Stack

| Capa | Tecnología |
|------|-----------|
| Markup | HTML5 semantico |
| Estilos | CSS3 + Bootstrap 5.3.3 |
| Interactividad | JavaScript ES6+ (Vanilla) |
| Iconos | Font Awesome 6.5 |
| Animaciones | Anime.js |
| Tipografia | Inter + JetBrains Mono |
| APIs externas | YouTube IFrame API, Open-Meteo, ipapi.co, Picsum Photos, Formspree |

## Funcionalidades

- **Simulador de Windows 11** — Escritorio con taskbar, menu inicio, ventanas arrastrables con z-index
- **Tema claro/oscuro** — Alternancia en tiempo real con variables CSS
- **Idioma ES/EN** — Switch bilingue con deteccion automatica del navegador
- **Reproductor Lo-fi** — Musica via YouTube IFrame API con controles y barra de progreso
- **Clima en vivo** — Geolocalizacion por IP + datos de Open-Meteo
- **Calendario interactivo** — Navegacion mensual con resaltado del dia actual
- **Wallpaper dinamico** — Fondos aleatorios desde Picsum Photos
- **Formulario de contacto** — Validacion client-side + envio via Formspree
- **Logs del sistema** — Consola de eventos en vivo

## Estructura

```
gambito700.github.io/
├── index.html              # Single-page application (entry point)
├── 404.html                # Pagina de error personalizada
├── robots.txt              # Instrucciones para crawlers
├── sitemap.xml             # Mapa del sitio para SEO
├── .nojekyll               # Desactiva Jekyll en GitHub Pages
├── css/
│   ├── style.css           # Estilos principales (variables, layout, componentes)
│   └── extra.css           # Estilos de animacion de texto (.ml12)
├── js/
│   ├── main.js             # Entry point modular (type="module")
│   ├── config.js           # Configuracion global
│   ├── core/
│   │   ├── window-manager.js  # Gestor de ventanas, drag & drop, taskbar
│   │   ├── theme.js           # Tema claro/oscuro
│   │   └── language.js        # Idioma ES/EN con deteccion automatica
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

```
# No requiere build tools — abre directo en el navegador
start index.html

# O sirve con servidor local (recomendado)
npx serve .
```

## Contacto

**Alex Martinez** — [alexmartinezdiaz91@gmail.com](mailto:alexmartinezdiaz91@gmail.com) · Villarrica, Chile
