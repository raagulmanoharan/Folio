export const TYPES = ['case-study', 'blog', 'side-project']
export class ContentError extends Error {
  constructor(message, status = 400) { super(message); this.status = status }
}
export function identifier(value) {
  if (typeof value !== 'string' || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value) || value.length > 80) throw new ContentError('Use a lowercase slug with letters, digits, and hyphens (max 80).')
  return value
}
export function contentPath(type, slug) {
  if (!TYPES.includes(type)) throw new ContentError('Unknown content type.')
  if (slug === 'index') throw new ContentError('The slug index is reserved for collection pages.')
  return `content/${type}/${identifier(slug)}.json`
}
function text(value, name, max = 20000) {
  if (typeof value !== 'string' || !value.trim() || value.length > max) throw new ContentError(`Invalid ${name} (1–${max} characters).`)
  return value.trim()
}
export function safeUrl(value, image = false) {
  if (typeof value !== 'string') throw new ContentError('Invalid URL.')
  if (/^\/(?!\/)[a-zA-Z0-9/_#.?=%&+~-]*$/.test(value) && !value.includes('..')) return value
  try { const u = new URL(value); if (u.protocol === 'https:' && !u.username && !u.password) return u.href } catch {}
  throw new ContentError(image ? 'Images must use HTTPS or a site-relative path.' : 'Links must use HTTPS or a site-relative path.')
}
export function validateContent(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new ContentError('A content object is required.')
  contentPath(input.type, input.slug)
  const result = { type: input.type, slug: input.slug, title: text(input.title, 'title', 160), summary: text(input.summary, 'summary', 600), status: 'draft' }
  if (input.role !== undefined) result.role = text(input.role, 'role', 100)
  if (input.year !== undefined) result.year = text(input.year, 'year', 4)
  if (input.link !== undefined) result.link = safeUrl(input.link)
  if (!Array.isArray(input.blocks) || input.blocks.length < 1 || input.blocks.length > 100) throw new ContentError('Provide between 1 and 100 content blocks.')
  result.blocks = input.blocks.map(b => {
    if (!b || typeof b !== 'object') throw new ContentError('Invalid block.')
    if (['hero', 'heading', 'subheading', 'paragraph'].includes(b.type)) return { type: b.type, text: text(b.text, b.type) }
    if (b.type === 'image') {
      const block = { type: b.type, src: safeUrl(b.src, true), alt: text(b.alt, 'image alt', 400) }
      if (b.caption !== undefined) block.caption = text(b.caption, 'caption', 600)
      return block
    }
    if (b.type === 'metrics') {
      if (!Array.isArray(b.items) || b.items.length !== 3) throw new ContentError('A metrics block needs exactly three items.')
      return { type: b.type, items: b.items.map(m => {
        if(!m || typeof m !== 'object') throw new ContentError('Invalid metric item.')
        return { value: text(m.value, 'metric value', 40), label: text(m.label, 'metric label', 100), note: text(m.note, 'metric evidence or placeholder note', 400) }
      }) }
    }
    throw new ContentError('Unknown block type.')
  })
  if(new TextEncoder().encode(JSON.stringify(result)).length>500000) throw new ContentError('Content exceeds the 500 KB document limit.',413)
  return result
}
export function escapeHtml(value) { return String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])) }
export function routeFor(c) { return `/${c.type === 'case-study' ? 'projects' : c.type === 'blog' ? 'writing' : 'side-projects'}/${c.slug}.html` }
export function renderBlocks(blocks) {
  const e = escapeHtml
  return blocks.map(b => {
    if (b.type === 'image') return `<figure class="case-image"><img src="${e(b.src)}" alt="${e(b.alt)}" loading="lazy">${b.caption ? `<figcaption class="case-subtext">${e(b.caption)}</figcaption>` : ''}</figure>`
    if (b.type === 'metrics') return `<div class="case-metrics">${b.items.map(m => `<div><strong>${e(m.value)}</strong><span class="case-body-text">${e(m.label)}</span><p class="case-subtext">${e(m.note)}</p></div>`).join('')}</div>`
    const [tag, cls] = {hero:['p','case-heading'], heading:['h2','case-heading'], subheading:['h3','case-subheading'], paragraph:['p','case-body-text']}[b.type]
    return `<${tag} class="${cls}">${e(b.text).replace(/\n/g,'<br>')}</${tag}>`
  }).join('\n')
}
export function renderPage(content, { preview = false, moreProject } = {}) {
  const c = validateContent(content), e = escapeHtml
  if(moreProject) validateContent(moreProject)
  const navigation = !preview && moreProject ? `<section aria-label="Explore more"><nav class="case-projects" aria-label="Related reading and more projects"><a href="/#/reflections/chat-is-the-new-skeuomorphism"><h2 class="case-subheading">Related reading</h2><span class="case-project-title"><strong>Chat is the new skeuomorphism.</strong> <span aria-hidden="true">↗</span></span></a><a href="${routeFor(moreProject)}"><h2 class="case-subheading">More projects</h2><span class="case-project-title"><strong>${e(moreProject.title)}</strong> <span aria-hidden="true">↗</span></span></a></nav></section>` : '' 
  return `<!doctype html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${e(c.title)} — Raagul Manoharan</title><meta name="description" content="${e(c.summary)}">${preview ? '<meta name="robots" content="noindex,nofollow"><style>'+previewCss+'</style>' : ''}</head><body class="case-page">${preview ? '<header class="site-header"><nav class="header-inner">Draft preview — not published</nav></header>' : '<!-- shared-site-header -->'}<main class="case-main"><section class="case-intro"><h1 class="case-hero-text">${e(c.title)}</h1><div class="case-meta"><p><span>Role</span>${e(c.role || '—')}</p><p><span>Year</span>${e(c.year || '—')}</p><div class="case-links"><span class="case-meta-label">Link</span>${c.link ? `<a href="${e(c.link)}" rel="noopener noreferrer">View project ↗</a>` : '—'}</div></div></section><article class="case-content case-blocks">${renderBlocks(c.blocks)}</article>${navigation}</main><footer class="site-footer" aria-label="Site footer"></footer>${preview ? '' : '<script type="module" src="/src/project.js"></script>'}</body></html>`
}
const previewCss = `*{box-sizing:border-box}body{margin:0;background:#161616;color:#ededed;font-family:Arial,sans-serif}.site-header{border-bottom:1px solid #333;padding:16px}.case-main{max-width:1120px;width:84%;margin:auto;border-inline:1px solid #292929}.case-intro{padding:16px 16px 0}.case-hero-text{font-size:clamp(48px,8vw,120px);font-weight:400;line-height:1;letter-spacing:-.055em;margin:0 0 32px}.case-meta{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));margin:0 -16px;border-block:1px solid #292929}.case-meta>*{margin:0;padding:12px 16px;overflow-wrap:anywhere}.case-meta>*+*{border-left:1px solid #292929}.case-meta span{display:block;color:#999;font-size:12px;margin-bottom:6px}.case-content{padding:32px;display:flex;flex-direction:column;gap:32px}.case-content>*{margin:0}.case-heading{font-size:clamp(20px,2.2vw,24px);font-weight:400;color:#b8b8b8}.case-subheading{font-size:16px;font-weight:400;color:#a3a3a3}.case-body-text{font-size:clamp(18px,1.8vw,20px);line-height:1.6;max-width:70ch}.case-subtext{font-size:13px;color:#999;line-height:1.5}.case-image img{width:100%;display:block}.case-image figcaption{margin-top:12px}.case-metrics{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));margin-inline:-32px;border-block:1px solid #292929}.case-metrics>div{padding:16px;overflow-wrap:anywhere}.case-metrics>div+div{border-left:1px solid #292929}.case-metrics strong{font-size:48px;display:block;font-weight:400}.case-metrics span{display:block}a{color:inherit}.site-footer{min-height:43px;border-top:1px solid #333}@media(max-width:600px){.case-main{width:100%;border:0}}`
