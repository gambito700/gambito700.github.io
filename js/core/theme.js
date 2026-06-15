import { THEME, STORAGE_KEYS } from '../config.js';
import StorageUtil from '../utils/storage.js';

class ThemeManager {
  constructor() { this.currentTheme = THEME.LIGHT; }

  async init() {
    const saved = StorageUtil.getItem(STORAGE_KEYS.THEME);
    if (saved) { this.setTheme(saved); }
    else if (THEME.DEFAULT === 'auto') { this.detectSystemTheme(); }
    else { this.setTheme(THEME.DEFAULT); }
    this.attachListeners();
  }

  detectSystemTheme() {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    this.setTheme(prefersDark ? THEME.DARK : THEME.LIGHT);
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => this.setTheme(e.matches ? THEME.DARK : THEME.LIGHT));
  }

  setTheme(theme) {
    this.currentTheme = theme;
    const html = document.documentElement;
    html.setAttribute('data-theme', theme);
    html.style.colorScheme = theme === THEME.DARK ? 'dark' : 'light';
    StorageUtil.setItem(STORAGE_KEYS.THEME, theme);
  }

  toggle() { this.setTheme(this.currentTheme === THEME.LIGHT ? THEME.DARK : THEME.LIGHT); }

  attachListeners() {
    document.getElementById('theme-toggle')?.addEventListener('click', () => this.toggle());
  }
}

export const ThemeManagerInstance = new ThemeManager();
export default ThemeManager;
