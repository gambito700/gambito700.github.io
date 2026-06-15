import { WindowManagerInstance } from './core/window-manager.js'
import { ThemeManagerInstance } from './core/theme.js'
import { LanguageManagerInstance } from './core/language.js'
import { WeatherModule } from './features/weather.js'
import { ClockModule } from './features/clock.js'
import { CalendarModule } from './features/calendar.js'
import { CalculatorModule } from './features/calculator.js'
import { MusicModule } from './features/music.js'
import { ContactModule } from './features/contact.js'
import { IndicatorsModule } from './features/indicators.js'
import { TextFxModule } from './features/text-fx.js'
import { SkillBarsModule } from './features/skill-bars.js'
import { MovingLettersModule } from './features/moving-letters.js'
import { ToastModule } from './features/toast.js'
import { QRGeneratorInstance } from './features/qr-generator.js'
import { CommentSystemInstance } from './features/comments.js'
import { BlogModule } from './features/blog.js'
import { ProjectsModule } from './features/projects.js'
import { SocialModule } from './features/social.js'

function safeInit(fn, name) {
  try {
    const result = fn()
    if (result instanceof Promise) {
      result.catch(e => console.warn('[modular] ' + name + ' async failed:', e))
    }
  } catch (e) {
    console.warn('[modular] ' + name + ' failed:', e)
  }
}

async function initApp() {
  console.log('%c PORTAFOLIO ALEX MARTINEZ 2026 (MODULAR) ', 'background:#0078d4;color:#fff;font-weight:bold;font-size:13px;padding:6px 14px;')

  WindowManagerInstance.assignGlobals()
  WindowManagerInstance.init()

  ThemeManagerInstance.init()
  LanguageManagerInstance.init()

  safeInit(() => ClockModule.init(), 'Clock')
  safeInit(() => SkillBarsModule.init(), 'SkillBars')
  safeInit(() => TextFxModule.init(), 'TextFx')
  safeInit(() => ContactModule.init(), 'Contact')
  safeInit(() => CalendarModule.init(), 'Calendar')
  safeInit(() => IndicatorsModule.init(), 'Indicators')
  safeInit(() => MusicModule.init(), 'Music')
  safeInit(() => CalculatorModule.init(), 'Calculator')
  safeInit(() => WeatherModule.init(), 'Weather')
  safeInit(() => ToastModule.init(), 'Toast')
  safeInit(() => MovingLettersModule.init(), 'MovingLetters')

  safeInit(() => ProjectsModule.init(), 'Projects')
  safeInit(() => BlogModule.init(), 'Blog')
  safeInit(() => SocialModule.init(), 'Social')

  QRGeneratorInstance.init().catch(e => console.warn('[modular] QRGenerator failed:', e))
  CommentSystemInstance.init()

  setTimeout(() => {
    WindowManagerInstance.openWindow('window-music')
  }, 800)

  WindowManagerInstance._systemLog('[modular] All modules initialized')
}

const scriptJsDetected = (function () {
  try {
    const test = window.openWindow && window.openWindow.toString().includes('win.classList')
    return test
  } catch (e) { return false }
})()

if (!scriptJsDetected) {
  window.__MODULAR_MODE__ = true
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp)
  } else {
    initApp()
  }
} else {
  console.log('[modular] script.js detected, modular init deferred — ready for swap')
}

export default initApp
