export class ToastModule {
  static init() {
    const closeBtn = document.getElementById('toast-close-btn')
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        const toast = document.getElementById('toast-notification')
        if (toast) toast.classList.add('d-none')
        if (window.toastHideTimer) { clearTimeout(window.toastHideTimer); window.toastHideTimer = null }
      })
    }
  }
}

export default ToastModule
