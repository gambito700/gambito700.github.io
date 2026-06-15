export class SkillBarsModule {
  static init() {
    const bars = document.querySelectorAll('.skill-fill')
    if (!bars.length) return

    bars.forEach(b => {
      b.style.width = '0%'
      const win = b.closest('.win11-window')
      if (win && win.classList.contains('d-none')) {
        const mo = new MutationObserver(() => {
          if (!win.classList.contains('d-none')) {
            SkillBarsModule._animateBar(b)
            mo.disconnect()
          }
        })
        mo.observe(win, { attributes: true, attributeFilter: ['class'] })
      } else {
        const observer = new IntersectionObserver(entries => {
          entries.forEach(entry => {
            if (entry.isIntersecting) { SkillBarsModule._animateBar(entry.target); observer.unobserve(entry.target) }
          })
        }, { threshold: 0.3 })
        observer.observe(b)
      }
    })
  }

  static _animateBar(bar) {
    const base = parseInt(bar.getAttribute('data-value'), 10) || 50
    const label = bar.closest('.skill-bar-item') && bar.closest('.skill-bar-item').querySelector('.skill-pct')
    bar.style.width = base + '%'
    if (label) label.textContent = base + '%'
  }
}

export default SkillBarsModule
