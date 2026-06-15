/**
 * CONFIGURACIÓN GLOBAL DEL PORTAFOLIO
 * @module config
 */

export const AUTHOR = {
  name: 'Alex Martínez',
  email: 'alexmartinezdiaz91@gmail.com',
  location: 'Villarrica, Chile',
  title: 'Desarrollador Full Stack'
};

export const THEME = {
  LIGHT: 'light',
  DARK: 'dark',
  DEFAULT: 'auto'
};

export const LANGUAGES = {
  ES: 'es',
  EN: 'en',
  DEFAULT: 'es'
};

export const EMULATOR = {
  BREAKPOINTS: { MOBILE: 768, TABLET: 1024, DESKTOP: 1440 },
  WINDOW: {
    MIN_WIDTH: 200, MIN_HEIGHT: 150,
    DEFAULT_WIDTH: 600, DEFAULT_HEIGHT: 400,
    TITLE_BAR_HEIGHT: 32
  },
  Z_INDEX: { DESKTOP: 1, TASKBAR: 100, WINDOW_BASE: 1000, MODAL: 2000, NOTIFICATION: 3000 }
};

export const APIS = {
  WEATHER: 'https://api.open-meteo.com/v1/forecast',
  GEOLOCATION: 'https://ipapi.co/json/',
  RANDOM_IMAGE: 'https://picsum.photos',
  FORMSPREE: 'https://formspree.io/f/xpqeyqqg',
  YOUTUBE_EMBED: 'https://www.youtube.com/embed/',
  QR_LIBRARY: 'https://cdnjs.cloudflare.com/ajax/libs/qrcode-generator/1.5.2/qrcode.min.js'
};

export const STORAGE_KEYS = {
  THEME: 'portafolio_theme',
  LANGUAGE: 'portafolio_language',
  COMMENTS: 'portafolio_comments',
  PREFERENCES: 'portafolio_preferences',
  CACHE_WEATHER: 'cache_weather',
  CACHE_PROJECTS: 'cache_projects'
};

export const CACHE = {
  TTL: { WEATHER: 3600000, PROJECTS: 86400000, COMMENTS: Infinity }
};

export const FEATURES = {
  WEATHER: true, CLOCK: true, CALENDAR: true, PLAYER: true,
  BATTERY: true, QR_GENERATOR: true, COMMENTS: true,
  BLOG: true, PROJECTS: true, SOCIAL: true
};

export const SOCIAL_LINKS = {
  GITHUB: 'https://github.com/gambito700',
  EMAIL: 'alexmartinezdiaz91@gmail.com',
  PORTFOLIO: 'https://gambito700.github.io'
};

export const WINDOWS = {
  CALCULATOR: { id: 'calculator', title: 'Calculadora', icon: '🧮', width: 280, height: 350 },
  WEATHER: { id: 'weather', title: 'Clima', icon: '🌤️', width: 350, height: 300 },
  CALENDAR: { id: 'calendar', title: 'Calendario', icon: '📅', width: 400, height: 450 },
  PLAYER: { id: 'player', title: 'Reproductor Lo-fi', icon: '🎵', width: 400, height: 200 },
  BLOG: { id: 'blog', title: 'Blog del Proyecto', icon: '📝', width: 900, height: 600 },
  PROJECTS: { id: 'projects', title: 'Proyectos', icon: '🎯', width: 900, height: 600 },
  COMMENTS: { id: 'comments', title: 'Anotaciones de Codigo', icon: '💬', width: 500, height: 500 },
  QR: { id: 'qr-generator', title: 'Generador de QR', icon: '📲', width: 450, height: 400 },
  SOCIAL: { id: 'social', title: 'Conecta Conmigo', icon: '👥', width: 350, height: 400 },
  ABOUT: { id: 'about', title: 'Sobre Mi', icon: 'ℹ️', width: 500, height: 500 }
};

export default { AUTHOR, THEME, LANGUAGES, EMULATOR, APIS, STORAGE_KEYS, CACHE, FEATURES, SOCIAL_LINKS, WINDOWS };
