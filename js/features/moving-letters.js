export class MovingLettersModule {
  static init() {
    const messages = [
      'Bienvenido a mi Portafolio Demostrativo',
      'diseno y programado por   alex M.'
    ]
    let idx = 0
    const container = document.getElementById('moving-letters')
    if (!container) return
    if (typeof anime === 'undefined') return

    const showMessage = (text) => {
      container.innerHTML = '<h1 class="ml12">' + text + '</h1>'
      const wrapper = container.querySelector('.ml12')
      wrapper.innerHTML = wrapper.textContent.replace(/\S/g, "<span class='letter'>$&</span>")
      anime.timeline({ loop: false })
        .add({
          targets: '.ml12 .letter',
          translateX: [40, 0],
          translateZ: 0,
          opacity: [0, 1],
          easing: 'easeOutExpo',
          duration: 1200,
          delay: (el, i) => 500 + 30 * i
        })
        .add({
          targets: '.ml12 .letter',
          translateX: [0, -30],
          opacity: [1, 0],
          easing: 'easeInExpo',
          duration: 1100,
          delay: (el, i) => 100 + 30 * i
        })
    }

    showMessage(messages[idx])
    setInterval(() => {
      idx = (idx + 1) % messages.length
      showMessage(messages[idx])
    }, 12000)
  }
}

export default MovingLettersModule
