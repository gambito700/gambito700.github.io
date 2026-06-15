export class ClockModule {
  static init() {
    const timeEl = document.getElementById('clock-time')
    const dateEl = document.getElementById('clock-date')
    if (!timeEl) return

    if (ClockModule._interval) { clearInterval(ClockModule._interval); ClockModule._interval = null }

    const tick = () => {
      const n = new Date()
      timeEl.textContent = String(n.getHours()).padStart(2, '0') + ':' + String(n.getMinutes()).padStart(2, '0')
      if (dateEl) {
        const options = { day: '2-digit', month: '2-digit', year: 'numeric' }
        dateEl.textContent = n.toLocaleDateString((window.currentLang || 'es') === 'es' ? 'es-CL' : 'en-US', options)
      }
    }
    tick()
    ClockModule._interval = setInterval(tick, 1000)

    document.addEventListener('language-changed', tick)
  }
}

ClockModule._interval = null
export default ClockModule
