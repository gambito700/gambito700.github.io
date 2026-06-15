import { THEME, STORAGE_KEYS } from '../config.js'
import StorageUtil from '../utils/storage.js'

class ThemeManager {
  constructor() {
    this.currentTheme = THEME.LIGHT
    this.mediaQuery = null
  }

  init() {
    this.mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const saved = StorageUtil.getItem(STORAGE_KEYS.THEME)
    if (saved === THEME.DARK || saved === THEME.LIGHT) {
      this.setTheme(saved)
    } else {
      this.setTheme(this.mediaQuery.matches ? THEME.DARK : THEME.LIGHT)
    }
    this.mediaQuery.addEventListener('change', (e) => {
      if (!StorageUtil.getItem(STORAGE_KEYS.THEME)) {
        this.setTheme(e.matches ? THEME.DARK : THEME.LIGHT)
      }
    })
    this.attachListeners()
  }

  setTheme(theme) {
    this.currentTheme = theme
    document.documentElement.setAttribute('data-theme', theme)
    document.documentElement.style.colorScheme = theme === THEME.DARK ? 'dark' : 'light'
    const meta = document.querySelector('meta[name="theme-color"]')
    if (meta) meta.content = theme === THEME.DARK ? '#1a1a2e' : '#ffffff'
    StorageUtil.setItem(STORAGE_KEYS.THEME, theme)
    const icon = document.getElementById('theme-toggle-icon')
    if (icon) {
      icon.src = theme === THEME.DARK ? 'images/icons/theme-dark.png' : 'images/icons/theme-light.png'
    }
    document.dispatchEvent(new CustomEvent('theme-changed', { detail: { theme } }))
  }

  toggle() {
    this.setTheme(this.currentTheme === THEME.LIGHT ? THEME.DARK : THEME.LIGHT)
  }

  attachListeners() {
    const btn = document.getElementById('theme-toggle')
    if (btn) {
      btn.addEventListener('click', () => this.toggle())
    }
  }
}

export const ThemeManagerInstance = new ThemeManager()
export default ThemeManager
