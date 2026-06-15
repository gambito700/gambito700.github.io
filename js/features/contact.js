export class ContactModule {
  static init() {
    const btn = document.getElementById('contact-submit')
    const successMsg = document.getElementById('form-success')
    const errorMsg = document.getElementById('form-error')
    if (!btn) return

    const form = document.getElementById('contactForm')
    if (!form) return

    const showErr = (msg) => {
      const span = errorMsg ? errorMsg.querySelector('span') : null
      if (span) span.textContent = msg
      if (errorMsg) errorMsg.classList.remove('d-none')
      if (successMsg) successMsg.classList.add('d-none')
      resetBtn()
    }

    const resetBtn = () => {
      const text = btn.querySelector('.btn-text')
      const loading = btn.querySelector('.btn-loading')
      if (text) text.classList.remove('d-none')
      if (loading) loading.classList.add('d-none')
      btn.disabled = false
    }

    form.addEventListener('submit', (e) => {
      e.preventDefault()
      const name = (document.getElementById('contact-name').value || '').trim()
      const email = (document.getElementById('contact-email').value || '').trim()
      const subject = (document.getElementById('contact-subject').value || '').trim()
      const message = (document.getElementById('contact-message').value || '').trim()

      if (!name || !email || !message) {
        showErr((window.currentLang || 'es') === 'es' ? 'Por favor completa nombre, correo y mensaje.' : 'Please fill in name, email and message.')
        return
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        showErr((window.currentLang || 'es') === 'es' ? 'Ingresa un correo valido.' : 'Please enter a valid email.')
        return
      }

      const text = btn.querySelector('.btn-text')
      const loading = btn.querySelector('.btn-loading')
      if (text) text.classList.add('d-none')
      if (loading) loading.classList.remove('d-none')
      btn.disabled = true

      const formData = new FormData(form)
      fetch('https://formspree.io/f/xpqeyqqg', {
        method: 'POST',
        body: formData,
        headers: { 'Accept': 'application/json' }
      }).then(response => {
        if (response.ok) {
          if (successMsg) successMsg.classList.remove('d-none')
          if (errorMsg) errorMsg.classList.add('d-none')
          form.reset()
        } else {
          showErr((window.currentLang || 'es') === 'es' ? 'Error al enviar. Escribeme directo a alexmartinezdiaz91@gmail.com' : 'Error sending. Email me at alexmartinezdiaz91@gmail.com')
        }
        resetBtn()
        setTimeout(() => { if (successMsg) successMsg.classList.add('d-none') }, 6000)
      }).catch(() => {
        showErr((window.currentLang || 'es') === 'es' ? 'Connection error. Escribeme directo a alexmartinezdiaz91@gmail.com' : 'Connection error. Email me at alexmartinezdiaz91@gmail.com')
        resetBtn()
      })
    })
  }
}

export default ContactModule
