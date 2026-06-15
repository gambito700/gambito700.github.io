import { FEATURES } from './config.js';
import { ThemeManagerInstance } from './core/theme.js';
import { LanguageManagerInstance } from './core/language.js';
import { WindowManagerInstance } from './core/window-manager.js';
import { QRGeneratorInstance } from './features/qr-generator.js';
import { CommentSystemInstance } from './features/comments.js';
import { WeatherModule } from './features/weather.js';
import { BlogModule } from './features/blog.js';
import { ProjectsModule } from './features/projects.js';
import { SocialModule } from './features/social.js';

async function initApp() {
  console.log('Iniciando app modular');

  await ThemeManagerInstance.init();
  await LanguageManagerInstance.init();
  WindowManagerInstance.init();

  if (FEATURES.WEATHER) WeatherModule.init();
  if (FEATURES.QR_GENERATOR) await QRGeneratorInstance.init();
  if (FEATURES.COMMENTS) CommentSystemInstance.init();
  if (FEATURES.BLOG) BlogModule.init();
  if (FEATURES.PROJECTS) ProjectsModule.init();
  if (FEATURES.SOCIAL) SocialModule.init();
}

document.addEventListener('DOMContentLoaded', initApp);
