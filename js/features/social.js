export class SocialModule {
  static init() {
    const container = document.getElementById('social-links')
    if (!container) return
    const links = [
      { icon: 'fab fa-github', url: 'https://github.com/gambito700', label: 'GitHub' },
      { icon: 'fab fa-linkedin', url: 'https://linkedin.com/in/gambito700', label: 'LinkedIn' },
      { icon: 'fab fa-twitter', url: 'https://twitter.com/gambito700', label: 'Twitter' },
      { icon: 'fas fa-envelope', url: 'mailto:alexmartinezdiaz91@gmail.com', label: 'Email' }
    ]
    container.innerHTML = links.map(l => `
      <a href="${l.url}" target="_blank" rel="noopener noreferrer" class="social-link" title="${l.label}">
        <i class="${l.icon}"></i>
        <span>${l.label}</span>
      </a>
    `).join('')
  }
}

export default SocialModule
