class QRGenerator {
  constructor() { this.window = null; this.lastQR = null; this.qrLib = null; this.canvas = null; }

  async init() {
    await this.loadLibrary();
    this.window = document.getElementById('qr-generator');
    if (!this.window) return;
    const content = this.window.querySelector('.window-content');
    if (!content) return;
    content.innerHTML = `<div class="qr-container"><div class="qr-input-group"><label for="qr-input">Texto o URL:</label><input type="text" id="qr-input" placeholder="Ingresa una URL o texto..."></div><div class="qr-display" id="qr-display"><canvas id="qr-canvas" width="256" height="256" style="display:none;"></canvas></div><div class="qr-actions"><button id="qr-generate" class="btn btn-primary">Generar QR</button><button id="qr-download" class="btn btn-secondary">Descargar</button><button id="qr-copy" class="btn btn-secondary">Copiar Link</button></div><div id="qr-message" class="qr-message"></div></div>`;
    this.canvas = document.getElementById('qr-canvas');
    this.attachListeners();
  }

  async loadLibrary() {
    return new Promise((resolve) => {
      const s = document.createElement('script');
      s.src = 'assets/libs/qrcode.min.js';
      s.onload = () => { this.qrLib = window.qrcode; resolve(); };
      s.onerror = resolve;
      document.head.appendChild(s);
    });
  }

  attachListeners() {
    const input = document.getElementById('qr-input');
    document.getElementById('qr-generate')?.addEventListener('click', () => { const t = input.value.trim(); if (t) this.generate(t); });
    document.getElementById('qr-download')?.addEventListener('click', () => this.download());
    document.getElementById('qr-copy')?.addEventListener('click', () => this.copyToClipboard());
    input?.addEventListener('keypress', (e) => { if (e.key === 'Enter') document.getElementById('qr-generate')?.click(); });
  }

  generate(text) {
    if (!this.qrLib) return;
    const display = document.getElementById('qr-display');
    if (!display) return;
    try {
      const qr = this.qrLib(0, 'H');
      qr.addData(text);
      qr.make();
      const modCount = qr.getModuleCount();
      const cellSize = Math.floor(256 / modCount) || 2;
      const size = modCount * cellSize;
      this.canvas.width = size;
      this.canvas.height = size;
      this.canvas.style.display = 'block';
      this.canvas.style.width = '200px';
      this.canvas.style.height = '200px';
      const ctx = this.canvas.getContext('2d');
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, size, size);
      qr.renderTo2dContext(ctx, cellSize);
      this.lastQR = text;
      this.showMessage('QR generado', 'success');
    } catch {
      this.showMessage('Error al generar QR', 'error');
    }
  }

  download() {
    if (!this.lastQR) return;
    this.canvas.toBlob((blob) => {
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'qr.png';
      link.click();
      URL.revokeObjectURL(link.href);
    });
  }

  copyToClipboard() { if (this.lastQR) navigator.clipboard.writeText(this.lastQR).catch(() => {}); }

  showMessage(text) { const el = document.getElementById('qr-message'); if (el) { el.textContent = text; el.style.display = 'block'; setTimeout(() => el.style.display = 'none', 3000); } }
}

export const QRGeneratorInstance = new QRGenerator();
export default QRGenerator;