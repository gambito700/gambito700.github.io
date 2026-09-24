/* (c) 2026 gambito700 - Alex Martinez | gambito700.github.io */

// P0.9: el tour corre en cada carga, sin persistencia ni gate por
// localStorage.

// Texto bilingue del tour (idioma activo = window.currentLang).
const COPY = {
  step1: {
    title: { es: 'Tu punto de partida', en: 'Your starting point' },
    text: {
      es: 'Bienvenido. Si viniste a evaluar el trabajo de Alex, parte por aqui: su Curriculumn resume experiencia, skills y proyectos.',
      en: 'Welcome. If you are here to evaluate Alex, start here: his resume summarizes experience, skills and projects.'
    }
  },
  step2: {
    title: { es: 'Contacto directo', en: 'Direct contact' },
    text: {
      es: 'Casi listo. Si quieres agendar una entrevista o resolver una consulta, este boton te conecta directo a WhatsApp o correo.',
      en: 'Almost done. To schedule an interview or ask a question, this button connects you straight to WhatsApp or email.'
    }
  },
  next: { es: 'Siguiente', en: 'Next' },
  finish: { es: 'Finalizar', en: 'Finish' },
  skip: { es: 'Saltar ayuda', en: 'Skip help' }
}

class OnboardingManager {
  constructor() {
    this._active = false
    this._step = 0
    this._spotlight = null
    this._tooltip = null
    this._targets = []
    this._resizeTimer = null
    this._onKeydown = null
    this._onResize = null
  }

  start() {
    if (this._active) return

    // Paso 1: icono del Curriculumn (marcado en index.html con
    // data-onboard="step1"); fallback por onclick por robustez.
    const step1Target =
      document.querySelector('[data-onboard="step1"]') ||
      document.querySelector('.desktop-icon[onclick*="window-cv"]')
    const step2Target = document.getElementById('fab-wrap')
    this._targets = [step1Target, step2Target]

    this._spotlight = document.createElement('div')
    this._spotlight.className = 'ux-spotlight'

    this._tooltip = document.createElement('div')
    this._tooltip.className = 'ux-tooltip'
    this._tooltip.setAttribute('role', 'dialog')
    this._tooltip.setAttribute('aria-label', 'Onboarding')

    document.body.appendChild(this._spotlight)
    document.body.appendChild(this._tooltip)

    this._active = true
    this._bindEvents()
    this._goTo(1)
  }

  _bindEvents() {
    this._onKeydown = (e) => {
      if (e.key !== 'Escape') return
      if (!this._active) return
      e.preventDefault()
      this.stop(false)
    }
    // Debounce compartido: resize Y scroll del root reposicionan
    // spotlight + tooltip (los fixed se anclan al ICB y se desplazan
    // con el scroll, asi que hay que recalcular).
    this._onResize = () => {
      if (this._resizeTimer) clearTimeout(this._resizeTimer)
      this._resizeTimer = setTimeout(() => {
        if (!this._active) return
        this._positionStep(this._step)
      }, 150)
    }
    document.addEventListener('keydown', this._onKeydown)
    window.addEventListener('resize', this._onResize)
    window.addEventListener('scroll', this._onResize, { passive: true })
  }

  _goTo(step) {
    if (!this._active) return
    this._step = step
    const target = this._targets[step - 1]
    if (!target || !target.getBoundingClientRect) {
      this.stop(false)
      return
    }
    this._renderTooltip(step)
    this._positionStep(step)
  }

  _renderTooltip(step) {
    const lang = (window.currentLang || 'es') === 'en' ? 'en' : 'es'
    const data = step === 1 ? COPY.step1 : COPY.step2
    const primary = step === 1 ? COPY.next[lang] : COPY.finish[lang]
    const skip = COPY.skip[lang]

    this._tooltip.innerHTML = ''

    const title = document.createElement('strong')
    title.className = 'ux-tooltip-title'
    title.textContent = data.title[lang]

    const text = document.createElement('p')
    text.className = 'ux-tooltip-text'
    text.textContent = data.text[lang]

    const actions = document.createElement('div')
    actions.className = 'ux-tooltip-actions'

    const nextBtn = document.createElement('button')
    nextBtn.type = 'button'
    nextBtn.className = 'ux-tooltip-btn'
    nextBtn.textContent = primary
    nextBtn.addEventListener('click', () => {
      if (step === 1) this._goTo(2)
      else this.stop(true)
    })

    const skipBtn = document.createElement('button')
    skipBtn.type = 'button'
    skipBtn.className = 'ux-tooltip-link'
    skipBtn.textContent = skip
    skipBtn.addEventListener('click', () => this.stop(false))

    actions.appendChild(nextBtn)
    actions.appendChild(skipBtn)
    this._tooltip.appendChild(title)
    this._tooltip.appendChild(text)
    this._tooltip.appendChild(actions)
  }

  // Posiciona spotlight sobre el rect del objetivo y el tooltip
  // cerca (abajo si hay espacio, arriba si no). El spotlight es
  // pointer-events:none, asi el icono/FAB siguen siendo clicables.
  // NOTA: los elementos position:fixed se anclan al ICB, no al
  // viewport; con scroll del root hay que compensar scrollX/scrollY.
  _positionStep(step) {
    if (!this._active) return
    const target = this._targets[step - 1]
    if (!target) { this.stop(false); return }

    const rect = target.getBoundingClientRect()
    if (rect.width === 0 && rect.height === 0) { this.stop(false); return }

    const vw = window.innerWidth
    const vh = window.innerHeight
    const sx = window.scrollX || 0
    const sy = window.scrollY || 0
    const gap = 14

    this._spotlight.style.left = (rect.left + sx) + 'px'
    this._spotlight.style.top = (rect.top + sy) + 'px'
    this._spotlight.style.width = rect.width + 'px'
    this._spotlight.style.height = rect.height + 'px'

    const tw = this._tooltip.offsetWidth || 300
    const th = this._tooltip.offsetHeight || 140
    let topV = 12
    if (rect.bottom + th + gap <= vh - 12) {
      topV = rect.bottom + gap
    } else if (rect.top - th - gap >= 12) {
      topV = rect.top - th - gap
    }
    let leftV = rect.left
    if (leftV + tw > vw - 12) leftV = Math.max(12, vw - tw - 12)

    this._tooltip.style.left = (leftV + sx) + 'px'
    this._tooltip.style.top = (topV + sy) + 'px'

    const primaryBtn = this._tooltip.querySelector('.ux-tooltip-btn')
    if (primaryBtn) primaryBtn.focus()
  }

  // Finaliza el tour: limpia DOM y listeners y avisa a main.js
  // (abre la musica). P0.9: sin persistencia.
  stop(finished) {
    this._active = false
    this._step = 0

    if (this._onKeydown) document.removeEventListener('keydown', this._onKeydown)
    if (this._onResize) {
      window.removeEventListener('resize', this._onResize)
      window.removeEventListener('scroll', this._onResize)
    }
    this._onKeydown = null
    this._onResize = null
    if (this._resizeTimer) { clearTimeout(this._resizeTimer); this._resizeTimer = null }

    if (this._spotlight && this._spotlight.parentNode) {
      this._spotlight.parentNode.removeChild(this._spotlight)
    }
    if (this._tooltip && this._tooltip.parentNode) {
      this._tooltip.parentNode.removeChild(this._tooltip)
    }
    this._spotlight = null
    this._tooltip = null
    this._targets = []

    window.dispatchEvent(new CustomEvent('onboarding-resolved', { detail: { finished: !!finished } }))
  }
}

export const OnboardingModule = new OnboardingManager()
export default OnboardingModule