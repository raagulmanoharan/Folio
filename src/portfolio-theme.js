import './portfolio-theme.css'
const root = document.documentElement
const sun = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5"/></svg>'
const moon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true"><path d="M20.5 14A9 9 0 0 1 10 3.5 9 9 0 1 0 20.5 14Z"/></svg>'
const header = document.querySelector('.header-inner')
let button
function apply(theme) {
  root.dataset.theme = theme === 'light' ? 'light' : 'dark'
  if (!button) return
  const light = root.dataset.theme === 'light'
  button.innerHTML = light ? moon : sun
  button.setAttribute('aria-pressed', String(light))
  button.title = `Switch to ${light ? 'dark' : 'light'} mode`
}
if (header && !header.querySelector('[data-theme-toggle]')) {
  const actions = document.createElement('div')
  actions.className = 'header-actions'
  const existing = header.querySelector('.header-link--right, #motion-toggle')
  button = document.createElement('button')
  button.type = 'button'
  button.className = 'theme-toggle'
  button.dataset.themeToggle = ''
  button.setAttribute('aria-label', 'Light mode')
  actions.append(button)
  if (existing) actions.append(existing)
  header.append(actions)
  button.addEventListener('click', () => {
    const next = root.dataset.theme === 'light' ? 'dark' : 'light'
    root.classList.add('theme-ready')
    apply(next)
    try { localStorage.setItem('folio-theme', next) } catch {}
  })
}
apply(root.dataset.theme)
window.addEventListener('storage', event => {
  if (event.key === 'folio-theme') apply(event.newValue)
})
