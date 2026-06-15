import StorageUtil from '../utils/storage.js';
import { STORAGE_KEYS } from '../config.js';

class CommentSystem {
  constructor() { this.comments = []; this.window = null; this.sections = [{ id: 'window-manager', label: 'Gestor de Ventanas' }, { id: 'theme-manager', label: 'Gestor de Tema' }, { id: 'weather', label: 'Clima' }, { id: 'qr', label: 'QR' }]; }

  init() {
    this.loadComments();
    this.window = document.getElementById('comments');
    if (!this.window) return;
    const content = this.window.querySelector('.window-content');
    if (!content) return;
    content.innerHTML = `<div class="comments-container"><div class="comments-filter"><label for="code-section">Seccion:</label><select id="code-section"><option value="">Todas</option>${this.sections.map(s => `<option value="${s.id}">${s.label}</option>`).join('')}</select></div><div class="comments-list" id="comments-list"></div><div class="comment-form"><textarea id="comment-text" placeholder="Comentario..."></textarea><button id="save-comment" class="btn btn-primary">Guardar</button></div></div>`;
    this.renderComments();
    this.attachListeners();
  }

  loadComments() { this.comments = StorageUtil.getItem(STORAGE_KEYS.COMMENTS) || []; }

  renderComments() {
    const list = document.getElementById('comments-list');
    if (!list) return;
    const sel = document.getElementById('code-section'); const filter = sel?.value || '';
    const filtered = filter ? this.comments.filter(c => c.sectionId === filter) : this.comments;
    list.innerHTML = filtered.length ? filtered.map(c => `<div class="comment-item"><strong>${c.author}</strong> <small>${new Date(c.timestamp).toLocaleString()}</small><p>${c.text}</p></div>`).join('') : '<p>Sin comentarios</p>';
  }

  attachListeners() {
    document.getElementById('code-section')?.addEventListener('change', () => this.renderComments());
    document.getElementById('save-comment')?.addEventListener('click', () => {
      const text = document.getElementById('comment-text')?.value.trim();
      if (!text) return;
      const sectionId = document.getElementById('code-section')?.value || '';
      this.addComment(sectionId, text);
      document.getElementById('comment-text').value = '';
      this.renderComments();
    });
  }

  addComment(sectionId, text, author = 'Tu') {
    this.comments.push({ id: Date.now(), sectionId, text, author, timestamp: new Date().toISOString() });
    StorageUtil.setItem(STORAGE_KEYS.COMMENTS, this.comments);
  }
}

export const CommentSystemInstance = new CommentSystem();
export default CommentSystem;
