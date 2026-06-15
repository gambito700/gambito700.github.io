export class BlogModule {
  static async init() {
    const container = document.getElementById('blog-posts')
    if (!container) return
    try {
      const res = await fetch('assets/data/blog-posts.json')
      const data = await res.json()
      const posts = data.posts || data
      container.innerHTML = posts.map(p => `
        <article class="blog-card">
          <div class="blog-meta">
            <span class="blog-date"><i class="far fa-calendar-alt"></i> ${new Date(p.date).toLocaleDateString()}</span>
            <span class="blog-category">${p.category || ''}</span>
          </div>
          <h3 class="blog-title">${p.title}</h3>
          <p class="blog-excerpt">${p.excerpt}</p>
          <a href="${p.link || '#'}" class="blog-read-more">Leer mas <i class="fas fa-arrow-right"></i></a>
        </article>
      `).join('')
    } catch {
      container.innerHTML = '<p class="text-muted">Proximamente...</p>'
    }
  }
}

export default BlogModule
