import { STORAGE_KEYS } from '../config.js'
import StorageUtil from '../utils/storage.js'

class LanguageManager {
  constructor() {
    this.currentLanguage = 'es'
    this.translations = {}
  }

  async init() {
    await this.loadTranslations()
    const saved = StorageUtil.getItem(STORAGE_KEYS.LANGUAGE)
    if (saved === 'es' || saved === 'en') {
      this.setLanguage(saved)
    } else {
      const nav = navigator.language || 'es'
      this.setLanguage(nav.startsWith('es') ? 'es' : 'en')
    }
    this.attachListeners()
    document.addEventListener('language-changed', (e) => {
      this.currentLanguage = e.detail.lang
    })
  }

  async loadTranslations() {
    try {
      const res = await fetch('assets/data/translations.json')
      this.translations = await res.json()
    } catch {
      this.translations = { es: {}, en: {} }
    }
  }

  setLanguage(lang) {
    if (lang !== 'es' && lang !== 'en') return
    this.currentLanguage = lang
    window.currentLang = lang
    document.documentElement.setAttribute('lang', lang)
    StorageUtil.setItem(STORAGE_KEYS.LANGUAGE, lang)

    const btn = document.getElementById('lang-toggle')
    if (btn) btn.textContent = lang === 'es' ? 'EN' : 'ES'

    this.applyLanguage(lang)

    document.querySelectorAll('[data-placeholder-' + lang + ']').forEach(el => {
      const ph = el.getAttribute('data-placeholder-' + lang)
      if (ph !== null) el.placeholder = ph
    })

    document.dispatchEvent(new CustomEvent('language-changed', { detail: { lang } }))
  }

  applyLanguage(lang) {
    document.querySelectorAll('[data-' + lang + ']').forEach(el => {
      const val = el.getAttribute('data-' + lang)
      if (val === null) return
      const tag = el.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return
      if (el.classList.contains('accordion-button')) return
      if (el.classList.contains('txt-fx')) {
        el.textContent = val
        return
      }
      el.textContent = val
    })
    document.querySelectorAll('[data-' + lang + '].accordion-button').forEach(el => {
      const val = el.getAttribute('data-' + lang)
      if (val !== null) el.textContent = val
    })
    document.querySelectorAll('[data-' + lang + '].accordion-body').forEach(el => {
      const val = el.getAttribute('data-' + lang)
      if (val !== null) el.textContent = val
    })
  }

  attachListeners() {
    const btn = document.getElementById('lang-toggle')
    if (btn) {
      btn.addEventListener('click', () => {
        const next = window.currentLang === 'es' ? 'en' : 'es'
        this.setLanguage(next)
      })
    }
  }

  translate(key) {
    const keys = key.split('.')
    let value = this.translations[this.currentLanguage]
    for (const k of keys) { value = value?.[k] }
    return value || key
  }
}

export const LanguageManagerInstance = new LanguageManager()
export default LanguageManager
