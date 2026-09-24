/* (c) 2026 gambito700 - Alex Martinez | gambito700.github.io */
import { EMULATOR } from '../config.js'
import { OnboardingModule } from './onboarding.js'

// Overlays: sobre MODAL (2000), bajo FAB (2600) y NOTIFICATION (3000).
// Se deriva de config para que la jerarquia siga siendo consistente.
const OVERLAY_Z = EMULATOR.Z_INDEX.MODAL + 500

export class UxModule {
  static init() {
    const helpOverlay = document.getElementById('help-overlay')
    const fabWrap = document.getElementById('fab-wrap')
    const helpBtn = document.getElementById('help-btn')

    // Z-index consistente desde la config (EMULATOR.Z_INDEX)
    if (helpOverlay) helpOverlay.style.zIndex = String(OVERLAY_Z)
    if (fabWrap) fabWrap.style.zIndex = String(EMULATOR.Z_INDEX.FAB)

    // P0.8: splash screen (reloj + entrada) antes de nada del UX
    UxModule._initSplash()

    const showHelp = () => {
      if (!helpOverlay) return
      helpOverlay.classList.remove('d-none')
      const okBtn = document.getElementById('help-ok-btn')
      if (okBtn) okBtn.focus()
    }

    const closeHelp = () => {
      if (!helpOverlay) return
      helpOverlay.classList.add('d-none')
      if (helpBtn) helpBtn.focus()
    }

    // Boton de ayuda en la barra de tareas
    if (helpBtn) {
      helpBtn.addEventListener('click', () => {
        if (helpOverlay && helpOverlay.classList.contains('d-none')) showHelp()
        else closeHelp()
      })
    }
    const helpOk = document.getElementById('help-ok-btn')
    const helpClose = document.getElementById('help-close-btn')
    if (helpOk) helpOk.addEventListener('click', closeHelp)
    if (helpClose) helpClose.addEventListener('click', closeHelp)

    // Esc cierra el overlay de ayuda visible
    document.addEventListener('keydown', (e) => {
      if (e.key !== 'Escape') return
      if (helpOverlay && !helpOverlay.classList.contains('d-none')) closeHelp()
    })
  }

  // P0.8: reloj del splash + entrada al escritorio.
  // Al pulsar Entrar se dispara 'app-ready' (lo escucha main.js para
  // abrir la musica) y se lanza el tour de 2 pasos (P0.9: siempre,
  // en cada carga, sin persistencia).
  static _initSplash() {
    const splash = document.getElementById('splash-screen')
    const enterBtn = document.getElementById('splash-enter')
    if (!splash || !enterBtn) return
    splash.style.zIndex = String(EMULATOR.Z_INDEX.SPLASH)

    const clockEl = document.getElementById('splash-clock')
    const dateEl = document.getElementById('splash-date')
    const locale = (window.currentLang || 'es') === 'es' ? 'es-CL' : 'en-US'

    const renderClock = () => {
      const n = new Date()
      if (clockEl) clockEl.textContent = n.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })
      if (dateEl) dateEl.textContent = n.toLocaleDateString(locale, { weekday: 'long', day: 'numeric', month: 'long' })
    }
    renderClock()
    const timer = setInterval(renderClock, 1000)

    enterBtn.addEventListener('click', () => {
      window.dispatchEvent(new CustomEvent('app-ready', { detail: { source: 'splash' } }))
      splash.classList.add('splash-leaving')
      setTimeout(() => {
        clearInterval(timer)
        splash.remove()
        // Devuelve el foco a la barra de tareas (mismo patron del wizard P0)
        const sb = document.getElementById('start-btn')
        if (sb && (!document.activeElement || document.activeElement === document.body)) sb.focus()
        OnboardingModule.start()
      }, 500)
    })
  }
}

export default UxModule