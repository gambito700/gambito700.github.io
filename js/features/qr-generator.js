class QRGenerator {
  constructor() { this.window = null; this.lastQR = null; this.qrcodeLibrary = null; }

  async init() {
    await this.loadQRLibrary();
    this.window = document.getElementById('qr-generator');
    if (!this.window) return;
    const content = this.window.querySelector('.window-content');
    if (!content) return;
    content.innerHTML = `<div class="qr-container"><div class="qr-input-group"><label for="qr-input">Texto o URL:</label><input type="text" id="qr-input" placeholder="Ingresa una URL o texto..."></div><div class="qr-display" id="qr-display"></div><div class="qr-actions"><button id="qr-generate" class="btn btn-primary">Generar QR</button><button id="qr-download" class="btn btn-secondary">Descargar</button><button id="qr-copy" class="btn btn-secondary">Copiar Link</button></div><div id="qr-message" class="qr-message"></div></div>`;
    this.attachListeners();
  }

  async loadQRLibrary() {
    return new Promise((resolve) => {
      const s = document.createElement('script');
      s.src = 'https://cdnjs.cloudflare.com/ajax/libs/qrcode-generator/1.5.2/qrcode.min.js';
      s.onload = () => { this.qrcodeLibrary = window.QRCode; resolve(); };
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
    const display = document.getElementById('qr-display'); if (!display) return;
    display.innerHTML = '';
    try { new this.qrcodeLibrary(display, { text, width: 256, height: 256, colorDark: '#000', colorLight: '#fff', correctLevel: this.qrcodeLibrary.CorrectLevel.H }); this.lastQR = text; this.showMessage('QR generado', 'success'); } catch { this.showMessage('Error', 'error'); }
  }

  download() {
    if (!this.lastQR) return;
    const canvas = document.querySelector('#qr-display canvas'); if (!canvas) return;
    const link = document.createElement('a'); link.href = canvas.toDataURL('image/png'); link.download = 'qr.png'; link.click();
  }

  copyToClipboard() { if (this.lastQR) navigator.clipboard.writeText(this.lastQR).catch(() => {}); }

  showMessage(text) { const el = document.getElementById('qr-message'); if (el) { el.textContent = text; el.style.display = 'block'; setTimeout(() => el.style.display = 'none', 3000); } }
}

export const QRGeneratorInstance = new QRGenerator();
export default QRGenerator;
