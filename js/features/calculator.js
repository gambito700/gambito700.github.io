export class CalculatorModule {
  static init() {
    const display = document.getElementById('calc-display')
    const sub = document.getElementById('calc-sub')
    const grid = document.querySelector('.calc-grid')
    if (!display || !grid) return

    let cur = '0', op = null, prev = null, reset = false, isError = false

    const updateDisplay = () => {
      display.textContent = cur.length > 14 ? parseFloat(cur).toExponential(6) : cur
    }

    const compute = (a, operator, b) => {
      if (operator === '+') return a + b
      if (operator === '-') return a - b
      if (operator === 'x') return a * b
      if (operator === '/') return b !== 0 ? a / b : 'Error'
      return 'Error'
    }

    const handler = (e) => {
      const btn = e.target.closest('.calc-btn')
      if (!btn) return
      const v = btn.getAttribute('data-v')

      if (btn.classList.contains('num')) {
        if (isError) {
          cur = '0'; op = null; prev = null; reset = false; isError = false
          if (sub) sub.textContent = ''
        }
        if (reset || cur === '0') { cur = ''; reset = false }
        if (v === '.' && cur.indexOf('.') !== -1) return
        cur += v
        updateDisplay()
      } else if (v === 'C') {
        cur = '0'; op = null; prev = null; reset = false; isError = false
        if (sub) sub.textContent = ''
        updateDisplay()
      } else if (v === '+-') {
        if (isError) return
        cur = String(parseFloat(cur) * -1)
        updateDisplay()
      } else if (v === '%') {
        if (isError) return
        cur = String(parseFloat(cur) / 100)
        updateDisplay()
      } else if (v === '=') {
        if (isError) return
        if (op && prev !== null) {
          const result = compute(parseFloat(prev), op, parseFloat(cur))
          if (sub) sub.textContent = prev + ' ' + op + ' ' + cur + ' ='
          if (result === 'Error') {
            cur = 'Error'; isError = true; op = null; prev = null; reset = true
            display.textContent = 'Error'; return
          }
          cur = String(Math.round(result * 1e10) / 1e10)
          op = null; prev = null; reset = true
          updateDisplay()
        }
      } else if (['+', '-', 'x', '/'].indexOf(v) !== -1) {
        if (isError) return
        if (op && prev !== null && !reset) {
          const result = compute(parseFloat(prev), op, parseFloat(cur))
          if (result === 'Error') {
            cur = 'Error'; isError = true; op = null; prev = null; reset = true
            display.textContent = 'Error'; return
          }
          cur = String(Math.round(result * 1e10) / 1e10)
          updateDisplay()
        }
        prev = cur; op = v; reset = true
        if (sub) sub.textContent = prev + ' ' + op
      }
    }

    grid.removeEventListener('click', CalculatorModule._handler)
    grid.addEventListener('click', handler)
    CalculatorModule._handler = handler
  }
}

CalculatorModule._handler = null
export default CalculatorModule
