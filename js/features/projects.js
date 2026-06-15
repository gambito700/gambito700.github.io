export class ProjectsModule {
  static async init() {
    const container = document.getElementById('projects-grid')
    if (!container) return
    try {
      const res = await fetch('assets/data/projects.json')
      const data = await res.json()
      const projects = data.projects || data
      container.innerHTML = projects.map(p => `
        <div class="project-card">
          <div class="project-icon"><i class="${p.icon || 'fas fa-code'}"></i></div>
          <h3 class="project-title">${p.title}</h3>
          <p class="project-desc">${p.description}</p>
          <div class="project-tags">${(p.tags || []).map(t => `<span class="project-tag">${t}</span>`).join('')}</div>
          <div class="project-links">
            ${p.github ? `<a href="${p.github}" target="_blank" class="project-link"><i class="fab fa-github"></i> GitHub</a>` : ''}
            ${p.demo ? `<a href="${p.demo}" target="_blank" class="project-link"><i class="fas fa-external-link-alt"></i> Demo</a>` : ''}
          </div>
        </div>
      `).join('')
    } catch {
      container.innerHTML = '<p class="text-muted">Proximamente...</p>'
    }
  }
}

export default ProjectsModule
