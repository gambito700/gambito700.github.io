export class CalendarModule {
  static init() {
    const titleEl = document.getElementById('cal-title')
    const bodyEl = document.getElementById('cal-body')
    const prevBtn = document.getElementById('cal-prev')
    const nextBtn = document.getElementById('cal-next')
    if (!titleEl || !bodyEl) return

    CalendarModule._calMonth = new Date().getMonth()
    CalendarModule._calYear = new Date().getFullYear()

    CalendarModule._render()

    const prevHandler = () => {
      CalendarModule._calMonth--
      if (CalendarModule._calMonth < 0) { CalendarModule._calMonth = 11; CalendarModule._calYear-- }
      CalendarModule._render()
    }
    const nextHandler = () => {
      CalendarModule._calMonth++
      if (CalendarModule._calMonth > 11) { CalendarModule._calMonth = 0; CalendarModule._calYear++ }
      CalendarModule._render()
    }

    if (prevBtn) { prevBtn.removeEventListener('click', CalendarModule._prevHandler); prevBtn.addEventListener('click', prevHandler) }
    if (nextBtn) { nextBtn.removeEventListener('click', CalendarModule._nextHandler); nextBtn.addEventListener('click', nextHandler) }

    CalendarModule._prevHandler = prevHandler
    CalendarModule._nextHandler = nextHandler

    document.addEventListener('language-changed', () => CalendarModule._render())
  }

  static _render() {
    const titleEl = document.getElementById('cal-title')
    const bodyEl = document.getElementById('cal-body')
    if (!titleEl || !bodyEl) return

    const MONTHS_ES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
    const MONTHS_EN = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
    const months = (window.currentLang || 'es') === 'en' ? MONTHS_EN : MONTHS_ES
    titleEl.textContent = months[CalendarModule._calMonth] + ' ' + CalendarModule._calYear
    bodyEl.innerHTML = ''

    const first = new Date(CalendarModule._calYear, CalendarModule._calMonth, 1).getDay()
    const days = new Date(CalendarModule._calYear, CalendarModule._calMonth + 1, 0).getDate()
    const today = new Date()

    for (let i = 0; i < first; i++) {
      const empty = document.createElement('span'); empty.className = 'cal-empty'; bodyEl.appendChild(empty)
    }
    for (let d = 1; d <= days; d++) {
      const cell = document.createElement('span')
      cell.textContent = d
      cell.className = 'cal-day'
      if (d === today.getDate() && CalendarModule._calMonth === today.getMonth() && CalendarModule._calYear === today.getFullYear()) cell.classList.add('cal-today')
      bodyEl.appendChild(cell)
    }
  }
}

CalendarModule._calMonth = 0
CalendarModule._calYear = 0
CalendarModule._prevHandler = null
CalendarModule._nextHandler = null
export default CalendarModule
