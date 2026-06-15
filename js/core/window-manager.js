import { EMULATOR } from '../config.js';
import { debounce, throttle } from '../utils/dom.js';

class WindowManager {
  constructor() {
    this.windows = new Map();
    this.activeWindow = null;
    this.desktopElement = null;
    this.maxZIndex = EMULATOR.Z_INDEX.WINDOW_BASE;
  }

  init() {
    this.desktopElement = document.getElementById('desktop');
    if (!this.desktopElement) return;
    this.setupDesktop();
    this.attachEventListeners();
    this.handleResponsive();
  }

  setupDesktop() {
    const taskbar = document.createElement('div');
    taskbar.id = 'taskbar';
    taskbar.className = 'taskbar';
    taskbar.innerHTML = `<div class="taskbar-content"><button id="start-btn" class="start-button"><i class="fab fa-windows"></i></button><div class="taskbar-apps"></div><div class="system-tray"><div class="clock"></div></div></div>`;
    this.desktopElement.appendChild(taskbar);
  }

  createWindow(config) {
    if (this.windows.has(config.id)) {
      this.bringToFront(config.id);
      return this.windows.get(config.id);
    }
    const windowEl = document.createElement('div');
    windowEl.id = config.id;
    windowEl.className = 'window-frame';
    windowEl.style.width = config.width + 'px';
    windowEl.style.height = config.height + 'px';
    windowEl.style.zIndex = this.maxZIndex++;
    windowEl.innerHTML = `<div class="window-header"><span class="window-title">${config.title}</span><div class="window-controls"><button class="btn-minimize" title="Minimizar">−</button><button class="btn-maximize" title="Maximizar">□</button><button class="btn-close" title="Cerrar">✕</button></div></div><div class="window-content"></div>`;
    this.desktopElement.appendChild(windowEl);
    this.windows.set(config.id, windowEl);
    this.attachWindowListeners(windowEl, config.id);
    return windowEl;
  }

  closeWindow(windowId) {
    const windowEl = this.windows.get(windowId);
    if (windowEl) { windowEl.remove(); this.windows.delete(windowId); }
  }

  bringToFront(windowId) {
    const windowEl = this.windows.get(windowId);
    if (windowEl) { windowEl.style.zIndex = this.maxZIndex++; this.activeWindow = windowId; }
  }

  attachWindowListeners(windowEl, windowId) {
    const header = windowEl.querySelector('.window-header');
    windowEl.addEventListener('mousedown', () => this.bringToFront(windowId));
    windowEl.querySelector('.btn-close')?.addEventListener('click', () => this.closeWindow(windowId));
    windowEl.querySelector('.btn-minimize')?.addEventListener('click', () => windowEl.classList.toggle('minimized'));
    windowEl.querySelector('.btn-maximize')?.addEventListener('click', () => windowEl.classList.toggle('maximized'));
    let isDragging = false, offset = { x: 0, y: 0 };
    header.addEventListener('mousedown', (e) => { isDragging = true; offset.x = e.clientX - windowEl.offsetLeft; offset.y = e.clientY - windowEl.offsetTop; });
    document.addEventListener('mousemove', throttle((e) => {
      if (!isDragging) return;
      const bounds = this.constrainBounds({ x: e.clientX - offset.x, y: e.clientY - offset.y, width: windowEl.offsetWidth, height: windowEl.offsetHeight });
      windowEl.style.left = bounds.x + 'px'; windowEl.style.top = bounds.y + 'px';
    }, 16));
    document.addEventListener('mouseup', () => { isDragging = false; });
  }

  constrainBounds(coords) {
    const maxX = this.desktopElement.offsetWidth - coords.width;
    const maxY = this.desktopElement.offsetHeight - coords.height;
    return { x: Math.max(0, Math.min(coords.x, maxX)), y: Math.max(0, Math.min(coords.y, maxY)), width: coords.width, height: coords.height };
  }

  handleResponsive() {
    window.addEventListener('resize', debounce(() => this.adjustLayout(), 250));
    this.adjustLayout();
  }

  adjustLayout() {
    const width = window.innerWidth;
    let mode = 'desktop';
    if (width < EMULATOR.BREAKPOINTS.MOBILE) mode = 'mobile';
    else if (width < EMULATOR.BREAKPOINTS.TABLET) mode = 'tablet';
    this.desktopElement.setAttribute('data-mode', mode);
    this.windows.forEach((windowEl) => {
      if (windowEl.offsetLeft + windowEl.offsetWidth > this.desktopElement.offsetWidth) windowEl.style.left = '10px';
      if (windowEl.offsetTop + windowEl.offsetHeight > this.desktopElement.offsetHeight) windowEl.style.top = '50px';
    });
  }

  attachEventListeners() {
    document.getElementById('start-btn')?.addEventListener('click', () => {});
  }
}

export const WindowManagerInstance = new WindowManager();
export default WindowManager;
