/* (c) 2026 gambito700 - Alex Martinez | gambito700.github.io */
import { EMULATOR } from '../config.js'

// Overlays: sobre MODAL (2000), bajo FAB (2600) y NOTIFICATION (3000).
// Se deriva de config para que la jerarquia siga siendo consistente.
const OVERLAY_Z = EMULATOR.Z_INDEX.MODAL + 500

function sessGet(key) {
  try { return window.sessionStorage.getItem(key) } catch (e) { return null }
}

function sessSet(key, val) {
  try { window.sessionStorage.setItem(key, val) } catch (e) { /* almacenamiento no disponible */ }
}

export class UxModule {
  static init() {
    const wizard = document.getElementById('welcome-wizard')
    const helpOverlay = document.getElementById('help-overlay')
    const fabWrap = document.getElementById('fab-wrap')
    const helpBtn = document.getElementById('help-btn')

    // Z-index consistente desde la config (EMULATOR.Z_INDEX)
    if (wizard) wizard.style.zIndex = String(OVERLAY_Z)
    if (helpOverlay) helpOverlay.style.zIndex = String(OVERLAY_Z)
    if (fabWrap) fabWrap.style.zIndex = String(EMULATOR.Z_INDEX.FAB)

    const fireHint = () => {
      if (sessGet('p0_hint_shown') === '1') return
      sessSet('p0_hint_shown', '1')
      const msg = (window.currentLang === 'en')
        ? 'Open any icon or the Start menu to begin.'
        : 'Abre cualquier icono o el menú Inicio para empezar'
      if (typeof window.showToast === 'function') {
        window.showToast('Click to start', msg)
      } else {
        console.log('[ux] hint:', msg)
      }
    }

    const closeWizard = () => {
      if (!wizard) return
      wizard.classList.add('d-none')
      sessSet('p0_welcome_shown', '1')
      if (wizard.contains(document.activeElement)) {
        const sb = document.getElementById('start-btn')
        if (sb) sb.focus()
      }
      fireHint()
    }

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

    // 1) Wizard de bienvenida: una vez por sesión de pestaña
    if (wizard && sessGet('p0_welcome_shown') !== '1') {
      wizard.classList.remove('d-none')
      const startBtn = document.getElementById('wizard-start-btn')
      if (startBtn) startBtn.focus()
    } else {
      fireHint()
    }

    const wizardStart = document.getElementById('wizard-start-btn')
    const wizardClose = document.getElementById('wizard-close-btn')
    if (wizardStart) wizardStart.addEventListener('click', closeWizard)
    if (wizardClose) wizardClose.addEventListener('click', closeWizard)

    // 3) Boton de ayuda en la barra de tareas
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

    // Esc cierra el overlay visible
    document.addEventListener('keydown', (e) => {
      if (e.key !== 'Escape') return
      if (helpOverlay && !helpOverlay.classList.contains('d-none')) { closeHelp(); return }
      if (wizard && !wizard.classList.contains('d-none')) { closeWizard() }
    })
  }
}

export default UxModule
