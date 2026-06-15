export class TextFxModule {
  static init() {
    const stagger = 14, delay = 150
    document.querySelectorAll('.txt-fx').forEach(el => {
      const words = el.textContent.trim().split(/\s+/)
      let count = 0, out = []
      words.forEach((word, idx) => {
        if (idx > 0) { out.push("<span class='letter' style='transition-delay:" + delay + "ms'>&nbsp;</span>"); count++ }
        let wh = "<span class='word'>"
        for (let i = 0; i < word.length; i++) {
          wh += "<span class='letter' style='transition-delay:" + (delay + stagger * count) + 'ms">' + word[i] + '</span>'
          count++
        }
        out.push(wh + '</span>')
      })
      el.innerHTML = out.join('')
      setTimeout(() => el.classList.add('active'), 100)
    })
  }
}

export default TextFxModule
