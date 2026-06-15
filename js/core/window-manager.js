class WindowManager {
  constructor() {
    this.zIndexCounter = 100
    this.lastInterTime = Date.now()
    this.clockInterval = null
    this.toastHideTimer = null
    this.resizeThrottled = false
    this.resizeTimer = null
  }

  init() {
    this._systemLog('[window-manager] Initializing OS Core')
    this._initAutoLang()
    this._initMenuToggle()
    this._initDrag()
    this._restoreOS()
    this._initSystemTray()
    this._initObfuscatedContacts()
    this._setupResizeHandler()
    this._setupEscapeHandler()
    this._setupDesktopClickHandler()
  }

  assignGlobals() {
    window.zIndexCounter = this.zIndexCounter
    window.openWindow = (id) => this.openWindow(id)
    window.closeWindow = (id) => this.closeWindow(id)
    window.minimizeWindow = (id) => this.minimizeWindow(id)
    window.maximizeWindow = (id) => this.maximizeWindow(id)
    window.closeAllWindows = () => this.closeAllWindows()
    window.nextWallpaper = () => this.nextWallpaper()
    window.toggleVanta = () => this.toggleVanta()
    window.showPowerPopup = () => this.showPowerPopup()
    window.showToast = (title, msg) => this.showToast(title, msg)
    window.systemLog = (msg) => this._systemLog(msg)
    window.onYouTubeIframeAPIReady = () => this._onYouTubeIframeAPIReady()
    window.updateVantaByWeather = (code, isDay) => this._updateVantaByWeather(code, isDay)
    window.getWeatherPalette = (code, isDay) => this._getWeatherPalette(code, isDay)
  }

  _systemLog(msg) {
    const now = Date.now()
    const diff = now - this.lastInterTime
    this.lastInterTime = now
    try {
      const d = new Date()
      const ts = d.toISOString().replace('T', ' ').substring(0, 19)
      const perf = ` [Response: ${diff}ms]`
      const line = '[' + ts + '] [INFO]' + perf + ' ' + msg
      console.log(line)
      const area = document.getElementById('log-output-area')
      if (area) {
        const div = document.createElement('div')
        div.textContent = line
        area.appendChild(div)
        while (area.children.length > 200) {
          area.removeChild(area.firstChild)
        }
        area.scrollTop = area.scrollHeight
      }
    } catch (e) { }
  }

  _getDesktopBounds() {
    const TASKBAR_H = window.innerWidth < 481 ? 40
      : window.innerWidth < 768 ? 44 : 50
    return {
      minX: 0, minY: 30,
      maxX: window.innerWidth,
      maxY: window.innerHeight - TASKBAR_H
    }
  }

  _clampWindowToBounds(win) {
    const bounds = this._getDesktopBounds()
    const left = win.offsetLeft || 0
    const top = win.offsetTop || 0
    const maxLeft = Math.max(0, bounds.maxX - win.offsetWidth)
    const maxTop = Math.max(0, bounds.maxY - win.offsetHeight)
    win.style.left = Math.max(bounds.minX, Math.min(left, maxLeft)) + 'px'
    win.style.top = Math.max(bounds.minY, Math.min(top, maxTop)) + 'px'
  }

  _bringToFront(win) {
    if (!win) return
    this.zIndexCounter = Math.max(this.zIndexCounter + 1, 101)
    win.style.zIndex = this.zIndexCounter
  }

  openWindow(id) {
    const win = document.getElementById(id)
    if (!win) return
    win.classList.remove('d-none', 'minimized', 'win-closing')
    win.classList.add('win-opening')
    this._bringToFront(win)
    clearTimeout(win._openTimer)
    win._openTimer = setTimeout(() => win.classList.remove('win-opening'), 400)
    win.dispatchEvent(new CustomEvent('window-show'))
    this._updateTaskbarIcon(id, true)
    const sm = document.getElementById('start-menu')
    if (sm) sm.classList.remove('show-sm')
    const rect = win.getBoundingClientRect()
    this._systemLog('Window opened: ' + id + ' at (' + Math.round(rect.left) + ',' + Math.round(rect.top) + ') ' + Math.round(rect.width) + 'x' + Math.round(rect.height))
  }

  closeWindow(id) {
    const win = document.getElementById(id)
    if (win && !win.classList.contains('win-closing')) {
      win.classList.remove('maximized', 'minimized', 'win-opening')
      try { delete win.dataset.prevRect } catch (e) { }
      win.classList.add('win-closing')
      clearTimeout(win._closeTimer)
      win._closeTimer = setTimeout(() => {
        win.classList.remove('win-closing')
        win.classList.add('d-none')
      }, 220)
    }
    this._updateTaskbarIcon(id, false)
  }

  minimizeWindow(id) {
    const win = document.getElementById(id)
    if (win) win.classList.add('minimized')
    const icon = document.querySelector(`.tb-app[data-win="${id}"]`)
    if (icon) icon.classList.remove('active-win')
    this._systemLog('Window minimized: ' + id)
  }

  maximizeWindow(id) {
    const win = document.getElementById(id)
    if (!win) return
    if (win.classList.contains('maximized')) {
      win.classList.remove('maximized')
      const prev = win.dataset.prevRect
      if (prev) {
        try {
          const r = JSON.parse(prev)
          win.style.left = r.left + 'px'
          win.style.top = r.top + 'px'
          win.style.width = r.width + 'px'
          win.style.height = r.height + 'px'
        } catch (e) { }
      } else {
        win.style.left = '100px'
        win.style.top = '100px'
      }
      this._reclampAllWindows()
    } else {
      win.dataset.prevRect = JSON.stringify({
        left: win.offsetLeft,
        top: win.offsetTop,
        width: win.offsetWidth,
        height: win.offsetHeight
      })
      win.style.width = ''
      win.style.height = ''
      win.classList.add('maximized')
      win.style.left = '0px'
      win.style.top = '0px'
    }
    this._bringToFront(win)
    this._systemLog(`Window ${id} ${win.classList.contains('maximized') ? 'maximized' : 'restored'}`)
  }

  closeAllWindows() {
    document.querySelectorAll('.win11-window:not(.d-none):not(.minimized)').forEach(win => {
      this.closeWindow(win.id)
    })
    this._systemLog('All windows closed')
  }

  _updateTaskbarIcon(id, isOpen) {
    const container = document.getElementById('taskbar-icons')
    if (!container) return
    const existing = container.querySelector(`.tb-btn[data-win="${id}"]`)
    if (isOpen) {
      if (!existing) {
        const sourceIcon = document.querySelector(`.desktop-icon[onclick*="${id}"] img`)
          || document.querySelector(`.sm-grid-item[onclick*="${id}"] img`)
        const iconSrc = sourceIcon ? sourceIcon.src : 'images/icons/about.png'
        const btn = document.createElement('button')
        btn.className = 'tb-btn tb-app active-win'
        btn.setAttribute('data-win', id)
        const label = id.replace('window-', '')
        btn.title = label.charAt(0).toUpperCase() + label.slice(1)
        btn.setAttribute('aria-label', btn.title)
        btn.onclick = () => {
          const win = document.getElementById(id)
          if (win.classList.contains('d-none') || win.classList.contains('minimized')) {
            this.openWindow(id)
          } else {
            this.minimizeWindow(id)
          }
        }
        const img = document.createElement('img')
        img.src = iconSrc
        img.alt = btn.title
        btn.appendChild(img)
        container.appendChild(btn)
      } else {
        existing.classList.add('active-win')
      }
    } else {
      if (existing) existing.remove()
    }
  }

  _initSearchAndPlaceholder() {
    const searchInput = document.querySelector('.sm-search-input')
    if (!searchInput) return
    const updatePlaceholder = () => {
      const placeholderEn = searchInput.getAttribute('data-placeholder-en') || 'Search apps...'
      const placeholderEs = searchInput.getAttribute('data-placeholder-es') || 'Buscar aplicaciones...'
      searchInput.placeholder = window.currentLang === 'en' ? placeholderEn : placeholderEs
    }
    updatePlaceholder()
    searchInput.addEventListener('input', function () {
      const query = this.value.toLowerCase()
      document.querySelectorAll('.sm-grid-item').forEach(item => {
        const text = item.textContent.toLowerCase()
        item.style.display = text.includes(query) ? 'flex' : 'none'
      })
    })
  }

  _initStartMenu() {
    const btn = document.getElementById('start-btn')
    const menu = document.getElementById('start-menu')
    if (!btn || !menu) return
    btn.setAttribute('aria-expanded', 'false')
    btn.setAttribute('aria-controls', 'start-menu')
    btn.addEventListener('click', (e) => {
      const isOpen = menu.classList.toggle('show-sm')
      btn.setAttribute('aria-expanded', isOpen)
      e.stopPropagation()
    })
    document.addEventListener('click', (e) => {
      if (!menu.contains(e.target) && e.target !== btn && !btn.contains(e.target)) {
        menu.classList.remove('show-sm')
        btn.setAttribute('aria-expanded', 'false')
      }
    })
  }

  _reclampAllWindows() {
    try {
      document.querySelectorAll('.win11-window:not(.maximized):not(.d-none)').forEach(win => {
        this._clampWindowToBounds(win)
      })
    } catch (e) {
      console.warn('Error reclamping windows:', e)
    }
  }

  _initDrag() {
    let activeWin = null
    let isDragging = false
    let startX, startY, initLeft, initTop

    const getPos = (e) => {
      if (e.touches) return { x: e.touches[0].clientX, y: e.touches[0].clientY }
      return { x: e.clientX, y: e.clientY }
    }

    const getWinRect = (win) => {
      if (win.classList.contains('d-none')) return { left: 100, top: 60 }
      const r = win.getBoundingClientRect()
      return { left: r.left, top: r.top }
    }

    document.addEventListener('dblclick', (e) => {
      const header = e.target.closest('.window-header')
      if (!header) return
      const win = header.closest('.win11-window')
      if (win) this.maximizeWindow(win.id)
    })

    document.querySelectorAll('.window-header').forEach((header) => {
      const win = header.closest('.win11-window')

      const startDrag = (e) => {
        if (e.target.closest('button')) return
        if (win.classList.contains('d-none') || win.classList.contains('minimized') || win.classList.contains('maximized')) return
        activeWin = win
        isDragging = true
        const pos = getPos(e)
        startX = pos.x
        startY = pos.y
        const rect = getWinRect(win)
        initLeft = rect.left
        initTop = rect.top
        this._bringToFront(win)
        e.stopPropagation()
        e.preventDefault()
      }

      win.addEventListener('mousedown', () => this._bringToFront(win))
      win.addEventListener('touchstart', () => this._bringToFront(win), { passive: true })
      header.addEventListener('mousedown', startDrag)
      header.addEventListener('touchstart', startDrag, { passive: false })
    })

    const moveDrag = (e) => {
      if (!isDragging || !activeWin) return
      const pos = getPos(e)
      const bounds = this._getDesktopBounds()
      const newLeft = initLeft + (pos.x - startX)
      const newTop = initTop + (pos.y - startY)
      const w = activeWin.offsetWidth
      const h = activeWin.offsetHeight
      const maxLeft = Math.max(0, bounds.maxX - w)
      const maxTop = Math.max(0, bounds.maxY - h)
      activeWin.style.left = Math.max(bounds.minX, Math.min(newLeft, maxLeft)) + 'px'
      activeWin.style.top = Math.max(bounds.minY, Math.min(newTop, maxTop)) + 'px'
    }

    const endDrag = () => {
      if (isDragging && activeWin) {
        this._systemLog('[drag] Ended: ' + activeWin.id)
      }
      isDragging = false
      activeWin = null
    }

    document.addEventListener('mousemove', moveDrag)
    document.addEventListener('touchmove', moveDrag, { passive: false })
    document.addEventListener('mouseup', endDrag)
    document.addEventListener('touchend', endDrag)
  }

  _initSystemTray() {
    const tray = document.querySelector('.tb-system-tray')
    if (tray) {
      const batteryFa = tray.querySelector('.fa-battery-three-quarters, .fa-battery-full, [class*="battery"]')
      if (batteryFa) {
        const batteryImg = document.createElement('img')
        batteryImg.id = 'tray-battery-icon'
        batteryImg.src = 'images/icons/battery-full.png'
        batteryImg.style.cssText = 'width:18px;height:18px;object-fit:contain;'
        batteryImg.alt = 'bateria'
        batteryFa.replaceWith(batteryImg)
      }
    }
    const img = document.getElementById('tray-battery-icon')
    if (img) {
      img.src = 'images/icons/battery-charging.png'
      img.title = 'Bateria (simulada)'
    }
  }

  _restoreOS() {
    document.querySelectorAll('.win11-window').forEach(win => {
      win.style.left = ''
      win.style.top = ''
    })
    this.nextWallpaper()
    setTimeout(() => {
      this.openWindow('window-cv')
      this._systemLog('[startup] Fresh session: CV window opened')
    }, 500)
  }

  _setWallpaperFallback(d) {
    if (!d) d = document.getElementById('desktop')
    if (!d) return
    d.style.backgroundImage = 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)'
    d.style.backgroundColor = '#1a1a2e'
    this._systemLog('[wallpaper] Using gradient fallback')
  }

  _getWallpaperUrl(seed) {
    let w = Math.min(window.innerWidth, 1280)
    let h = Math.min(window.innerHeight, 720)
    w = Math.max(w, 800)
    h = Math.max(h, 450)
    return 'https://picsum.photos/seed/' + seed + '/' + w + '/' + h
  }

  _loadWallpaperUrl(d, url, fallback) {
    d.style.backgroundImage = 'none'
    d.style.backgroundColor = '#0f0f0f'
    const img = new Image()
    img.decoding = 'async'
    img.onload = () => {
      d.style.backgroundImage = "url('" + url + "')"
      this._systemLog('[wallpaper] Loaded: ' + url.substring(0, 60) + ' (' + img.width + 'x' + img.height + ')')
    }
    img.onerror = () => {
      this._systemLog('[wallpaper] Failed: ' + url.substring(0, 60))
      if (fallback) fallback()
    }
    img.src = url
  }

  nextWallpaper() {
    const d = document.getElementById('desktop')
    if (!d) return
    const seed = Math.floor(Math.random() * 1000)
    const nonce = Date.now()
    this._loadWallpaperUrl(d, this._getWallpaperUrl(seed) + '?random=' + nonce, () => {
      this._setWallpaperFallback(d)
    })
  }

  toggleVanta() {
    const btn = document.getElementById('vanta-toggle')
    const d = document.getElementById('desktop')
    if (window.vantaEffect) {
      window.vantaEffect.destroy()
      window.vantaEffect = null
      if (btn) {
        btn.classList.remove('active')
        btn.title = 'Fondo 3D'
        const icon = btn.querySelector('i')
        if (icon) icon.className = 'fas fa-cloud'
      }
      this.nextWallpaper()
      this._systemLog('[vanta] Vanta Clouds disabled via toggle')
    } else {
      if (d) {
        d.style.backgroundImage = 'none'
        d.style.backgroundColor = ''
        d.style.filter = ''
      }
      this._initVantaCloudsWallpaper()
      const tempEl = document.getElementById('weather-temp')
      if (tempEl && tempEl.textContent !== '--C' && window._lastWeatherCode !== undefined && window._lastIsDay !== undefined) {
        this._updateVantaByWeather(window._lastWeatherCode, window._lastIsDay)
      }
      if (btn) {
        btn.classList.add('active')
        btn.title = 'Desactivar fondo 3D'
        const icon = btn.querySelector('i')
        if (icon) icon.className = 'fas fa-cloud-sun'
      }
      this._systemLog('[vanta] Vanta Clouds enabled via toggle')
    }
  }

  _initVantaCloudsWallpaper() {
    const d = document.getElementById('desktop')
    if (!d) return
    if (typeof VANTA === 'undefined' || typeof VANTA.CLOUDS === 'undefined') {
      this._setWallpaperFallback(d)
      this._systemLog('[vanta] Vanta not available, using fallback')
      return
    }
    window.vantaEffect = VANTA.CLOUDS({
      el: '#desktop',
      mouseControls: false,
      touchControls: true,
      gyroControls: false,
      minHeight: 200.0,
      minWidth: 200.0,
      skyColor: 0x4a90d9,
      cloudColor: 0xffffff,
      cloudShadowColor: 0x425f77,
      sunColor: 0xffd700,
      backgroundColor: 0x1a2a4a,
      speed: 0.8
    })
    this._systemLog('[vanta] Vanta Clouds initialized')
  }

  _getWeatherPalette(code, isDay) {
    if (isDay === 0) {
      return {
        skyColor: 0x0a0a1e, cloudColor: 0x1a1a3a,
        cloudShadowColor: 0x000000, sunColor: null,
        backgroundColor: 0x050510, speed: 0.6
      }
    }
    if (code === 0 || code === 1) {
      return {
        skyColor: 0x4a90d9, cloudColor: 0xffffff,
        cloudShadowColor: 0x425f77, sunColor: 0xffd700,
        backgroundColor: 0x1a2a4a, speed: 0.8
      }
    }
    if (code === 2 || code === 3 || code === 45 || code === 48) {
      return {
        skyColor: 0x7a8a9a, cloudColor: 0xcccccc,
        cloudShadowColor: 0x5a6a7a, sunColor: 0xdddddd,
        backgroundColor: 0x3a4a5a, speed: 1.0
      }
    }
    if ((code >= 51 && code <= 55) || (code >= 61 && code <= 65) || (code >= 80 && code <= 82)) {
      return {
        skyColor: 0x5a6a7a, cloudColor: 0x7a8a9a,
        cloudShadowColor: 0x3a4a5a, sunColor: null,
        backgroundColor: 0x2a3a4a, speed: 1.4
      }
    }
    if (code >= 95 && code <= 99) {
      return {
        skyColor: 0x2a2a3a, cloudColor: 0x4a4a5a,
        cloudShadowColor: 0x1a1a2a, sunColor: null,
        backgroundColor: 0x0a0a1a, speed: 2.0
      }
    }
    if (code >= 71 && code <= 75) {
      return {
        skyColor: 0xccddee, cloudColor: 0xeeeeff,
        cloudShadowColor: 0x8899aa, sunColor: 0xe8e8ff,
        backgroundColor: 0x8899aa, speed: 0.7
      }
    }
    return {
      skyColor: 0x7a8a9a, cloudColor: 0xcccccc,
      cloudShadowColor: 0x5a6a7a, sunColor: 0xdddddd,
      backgroundColor: 0x3a4a5a, speed: 1.0
    }
  }

  _updateVantaByWeather(code, isDay) {
    const palette = this._getWeatherPalette(code, isDay)
    if (window.vantaEffect) {
      window.vantaEffect.setOptions({
        skyColor: palette.skyColor, cloudColor: palette.cloudColor,
        cloudShadowColor: palette.cloudShadowColor, sunColor: palette.sunColor,
        backgroundColor: palette.backgroundColor, speed: palette.speed
      })
      this._systemLog('[vanta] Updated to weather code ' + code + ' | day=' + isDay)
    } else {
      const d = document.getElementById('desktop')
      if (d) d.style.backgroundColor = '#' + palette.backgroundColor.toString(16).padStart(6, '0')
    }
  }

  showPowerPopup() {
    this.showToast('Contacto', 'alexmartinezdiaz91@gmail.com -- Villarrica, Chile')
    const sm = document.getElementById('start-menu')
    if (sm) sm.classList.remove('show-sm')
    this._systemLog('Power menu opened: Contact info displayed via toast')
  }

  showToast(title, msg) {
    const toast = document.getElementById('toast-notification')
    if (!toast) return
    const titleEl = toast.querySelector('.toast-title')
    const msgEl = toast.querySelector('.toast-msg')
    if (titleEl && title) titleEl.textContent = title
    if (msgEl && msg) msgEl.textContent = msg
    toast.classList.remove('d-none')
    if (this.toastHideTimer) { clearTimeout(this.toastHideTimer); this.toastHideTimer = null }
    this.toastHideTimer = setTimeout(() => {
      toast.classList.add('d-none')
    }, 4000)
  }

  _initMenuToggle() {
    this._initStartMenu()
    this._initSearchAndPlaceholder()
  }

  _initAutoLang() {
    const nav = navigator.language || 'es'
    const lang = nav.startsWith('es') ? 'es' : 'en'
    window.currentLang = lang
    this._systemLog('Auto-detected language: ' + lang)
    this._updateLanguage()
    document.documentElement.setAttribute('lang', lang)
  }

  _updateLanguage() {
    const btn = document.getElementById('lang-toggle')
    if (btn) btn.textContent = window.currentLang === 'es' ? 'EN' : 'ES'
    this._applyLanguage(window.currentLang)
    const n = new Date()
    const timeEl = document.getElementById('clock-time')
    const dateEl = document.getElementById('clock-date')
    if (timeEl) timeEl.textContent = String(n.getHours()).padStart(2, '0') + ':' + String(n.getMinutes()).padStart(2, '0')
    if (dateEl) dateEl.textContent = n.toLocaleDateString(window.currentLang === 'es' ? 'es-CL' : 'en-US', { day: '2-digit', month: '2-digit', year: 'numeric' })
    document.dispatchEvent(new CustomEvent('language-changed', { detail: { lang: window.currentLang } }))
  }

  _applyLanguage(lang) {
    document.querySelectorAll('[data-' + lang + ']').forEach(el => {
      const val = el.getAttribute('data-' + lang)
      if (val === null) return
      const tag = el.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return
      if (el.classList.contains('accordion-button')) return
      if (el.classList.contains('txt-fx')) {
        el.textContent = val
        return
      }
      el.textContent = val
    })
    document.querySelectorAll('[data-placeholder-' + lang + ']').forEach(el => {
      const ph = el.getAttribute('data-placeholder-' + lang)
      if (ph !== null) el.placeholder = ph
    })
    document.querySelectorAll('[data-' + lang + '].accordion-button').forEach(el => {
      const val = el.getAttribute('data-' + lang)
      if (val !== null) el.textContent = val
    })
    document.querySelectorAll('[data-' + lang + '].accordion-body').forEach(el => {
      const val = el.getAttribute('data-' + lang)
      if (val !== null) el.textContent = val
    })
    document.documentElement.setAttribute('lang', lang)
  }

  _initObfuscatedContacts() {
    document.querySelectorAll('.obfuscated-contact').forEach(el => {
      el.addEventListener('click', (e) => {
        e.preventDefault()
        const masked = el.querySelector('.contact-masked')
        const revealed = el.querySelector('.contact-revealed')
        if (masked && revealed) {
          masked.classList.toggle('d-none')
          revealed.classList.toggle('d-none')
        }
        const href = el.getAttribute('href')
        if (href && revealed && !revealed.classList.contains('d-none')) {
          window.open(href, '_blank')
        }
      })
    })
  }

  _setupResizeHandler() {
    window.addEventListener('resize', () => {
      this._reclampAllWindows()
      if (!this.resizeThrottled) {
        this.resizeThrottled = true
        clearTimeout(this.resizeTimer)
        this.resizeTimer = setTimeout(() => {
          this._systemLog('[resize] Viewport: ' + window.innerWidth + 'x' + window.innerHeight)
          this.resizeThrottled = false
        }, 250)
      }
    })
  }

  _setupEscapeHandler() {
    document.addEventListener('keydown', (e) => {
      if (e.key !== 'Escape') return
      const windows = Array.from(document.querySelectorAll('.win11-window:not(.d-none):not(.minimized)'))
      if (!windows.length) return
      const topWin = windows.reduce((top, w) => {
        return (parseInt(w.style.zIndex) || 0) > (parseInt(top.style.zIndex) || 0) ? w : top
      })
      if (topWin && topWin.id) this.closeWindow(topWin.id)
    })
  }

  _setupDesktopClickHandler() {
    document.addEventListener('click', (e) => {
      const desktop = document.getElementById('desktop')
      if (e.target === desktop) {
        document.querySelectorAll('.win11-window').forEach(win => {
          win.classList.remove('focused')
        })
      }
    })
  }

  _onYouTubeIframeAPIReady() {
    this._systemLog('[music] YouTube IFrame API ready (handled by window-manager bridge)')
  }
}

export const WindowManagerInstance = new WindowManager()
export default WindowManager
