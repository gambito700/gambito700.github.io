import { LANGUAGES, STORAGE_KEYS } from '../config.js';
import StorageUtil from '../utils/storage.js';

class LanguageManager {
  constructor() { this.currentLanguage = LANGUAGES.DEFAULT; this.translations = {}; }

  async init() {
    await this.loadTranslations();
    const saved = StorageUtil.getItem(STORAGE_KEYS.LANGUAGE);
    if (saved) { this.setLanguage(saved); } else { this.detectBrowserLanguage(); }
    this.attachListeners();
  }

  async loadTranslations() {
    try {
      const res = await fetch('assets/data/translations.json');
      this.translations = await res.json();
    } catch { this.translations = { es: {}, en: {} }; }
  }

  setLanguage(lang) {
    if (!this.translations[lang]) return;
    this.currentLanguage = lang;
    document.documentElement.lang = lang;
    StorageUtil.setItem(STORAGE_KEYS.LANGUAGE, lang);
    document.querySelectorAll('[data-i18n]').forEach(el => {
      el.textContent = this.translate(el.getAttribute('data-i18n'));
    });
  }

  translate(key) {
    const keys = key.split('.');
    let value = this.translations[this.currentLanguage];
    for (const k of keys) { value = value?.[k]; }
    return value || key;
  }

  detectBrowserLanguage() {
    const lang = navigator.language.split('-')[0];
    this.setLanguage(['es', 'en'].includes(lang) ? lang : LANGUAGES.DEFAULT);
  }

  attachListeners() {
    document.querySelectorAll('[data-lang]').forEach(btn => {
      btn.addEventListener('click', (e) => this.setLanguage(e.target.getAttribute('data-lang')));
    });
  }
}

export const LanguageManagerInstance = new LanguageManager();
export default LanguageManager;
