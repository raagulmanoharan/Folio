const base = import.meta.env.BASE_URL
const legacyPrefix = '#/reflections/'
// Preserve previously shared drawer URLs when the writing moves to its own page.
if (!document.querySelector('[data-reflections-page]') && location.hash.startsWith(legacyPrefix)) {
  location.replace(`${base}reflections/#${location.hash.slice(legacyPrefix.length)}`)
}

const page = document.querySelector('[data-reflections-page]')
if (page) {
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)')
  const slugify = text => text.toLowerCase().replace(/[’'"]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
  const items = [...page.querySelectorAll('.reflections-item')]
  const scrollToItem = item => item.scrollIntoView({ block: 'start', behavior: reducedMotion.matches ? 'instant' : 'smooth' })

  const setOpen = (item, open) => {
    const toggle = item.querySelector('[data-refl-toggle]')
    const reveal = item.querySelector('.reflections-item__reveal')
    clearTimeout(item.settleTimer)
    item.classList.toggle('is-open', open)
    toggle.setAttribute('aria-expanded', String(open))
    reveal.inert = !open
    if (open) {
      item.querySelectorAll('iframe[data-embed-src]').forEach(frame => {
        frame.src = frame.dataset.embedSrc
        frame.removeAttribute('data-embed-src')
      })
      reveal.style.maxHeight = `${reveal.scrollHeight}px`
      item.settleTimer = setTimeout(() => {
        reveal.style.maxHeight = 'none'
        reveal.style.overflow = 'visible'
      }, reducedMotion.matches ? 0 : 500)
    } else {
      reveal.style.overflow = 'hidden'
      reveal.style.maxHeight = `${reveal.scrollHeight}px`
      void reveal.offsetHeight
      reveal.style.maxHeight = '0px'
    }
  }

  items.forEach(item => {
    item.id = item.dataset.slug || slugify(item.querySelector('.reflections-title').textContent)
    const toggle = item.querySelector('[data-refl-toggle]')
    const reveal = item.querySelector('.reflections-item__reveal')
    reveal.id = `${item.id}-body`
    reveal.inert = true
    toggle.setAttribute('aria-controls', reveal.id)
    toggle.addEventListener('click', () => {
      const open = !item.classList.contains('is-open')
      setOpen(item, open)
      history.pushState(null, '', open ? `#${item.id}` : location.pathname)
      if (open) scrollToItem(item)
    })
    item.querySelector('[data-refl-collapse]').addEventListener('click', () => {
      toggle.focus({ preventScroll: true })
      setOpen(item, false)
      history.replaceState(null, '', location.pathname)
      scrollToItem(item)
    })
  })

  const syncHash = () => {
    let slug
    try { slug = decodeURIComponent(location.hash.slice(1).replace(/^\/reflections\//, '')) } catch { return }
    const item = items.find(item => item.id === slug)
    if (!item) {
      if (!slug) items.forEach(item => setOpen(item, false))
      return
    }
    setOpen(item, true)
    requestAnimationFrame(() => scrollToItem(item))
  }
  window.addEventListener('hashchange', syncHash)
  syncHash()
}
