import './style.css'

/* ---------- 3D hero motif (three.js, code-split) ---------- */
const motifCanvas = document.querySelector('[data-motif]')
if (motifCanvas) {
  import('./motif.js')
    .then((m) => m.initMotif(motifCanvas))
    .catch(() => {})
}

/* ---------- Custom cursor ---------- */
const cursor = document.querySelector('[data-cursor]')
const finePointer = window.matchMedia('(pointer: fine)').matches
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

if (cursor && finePointer && !reducedMotion) {
  document.documentElement.classList.add('has-cursor')
  let tx = window.innerWidth / 2
  let ty = window.innerHeight / 2
  let cx = tx
  let cy = ty

  window.addEventListener(
    'mousemove',
    (e) => {
      tx = e.clientX
      ty = e.clientY
      cursor.classList.add('is-visible')
    },
    { passive: true },
  )
  document.addEventListener('mouseleave', () => cursor.classList.remove('is-visible'))

  // Smooth trailing follow.
  const tick = () => {
    cx += (tx - cx) * 0.2
    cy += (ty - cy) * 0.2
    cursor.style.setProperty('--cx', `${cx}px`)
    cursor.style.setProperty('--cy', `${cy}px`)
    requestAnimationFrame(tick)
  }
  tick()

  // Invert (and grow) over text and interactive elements.
  const invertOver = 'a, button, h1, h2, p, li'
  document.addEventListener('mouseover', (e) => {
    if (e.target.closest(invertOver)) cursor.classList.add('is-invert')
  })
  document.addEventListener('mouseout', (e) => {
    if (e.target.closest(invertOver)) cursor.classList.remove('is-invert')
  })
}

/* ---------- Side drawer ---------- */
const drawer = document.querySelector('[data-drawer]')
const backdrop = document.querySelector('[data-drawer-backdrop]')
const openBtn = document.querySelector('[data-drawer-open]')

if (drawer && backdrop && openBtn) {
  const openDrawer = () => {
    drawer.classList.add('is-open')
    backdrop.classList.add('is-open')
    drawer.setAttribute('aria-hidden', 'false')
    openBtn.setAttribute('aria-expanded', 'true')
  }
  const closeDrawer = () => {
    drawer.classList.remove('is-open')
    backdrop.classList.remove('is-open')
    drawer.setAttribute('aria-hidden', 'true')
    openBtn.setAttribute('aria-expanded', 'false')
  }

  openBtn.addEventListener('click', openDrawer)
  backdrop.addEventListener('click', closeDrawer)
  drawer.querySelector('[data-drawer-close]').addEventListener('click', closeDrawer)
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && drawer.classList.contains('is-open')) closeDrawer()
  })

  // Reveal the close button only when the cursor is near the top-right corner.
  const CORNER = 140
  drawer.addEventListener('mousemove', (e) => {
    const r = drawer.getBoundingClientRect()
    const near = e.clientX > r.right - CORNER && e.clientY < r.top + CORNER
    drawer.classList.toggle('show-close', near)
  })
  drawer.addEventListener('mouseleave', () => drawer.classList.remove('show-close'))
}

/* ---------- Case study overlay (expand a work thumbnail into a reader) ---------- */
const caseModal = document.querySelector('[data-case]')
if (caseModal) {
  const openers = document.querySelectorAll('[data-case-open]')
  const closeEls = caseModal.querySelectorAll('[data-case-close]')
  let lastFocused = null

  const openCase = () => {
    lastFocused = document.activeElement
    caseModal.classList.add('is-open')
    caseModal.setAttribute('aria-hidden', 'false')
    document.documentElement.classList.add('is-locked')
    caseModal.scrollTop = 0
    // move focus into the dialog for keyboard + screen-reader users
    caseModal.querySelector('[data-case-close]')?.focus()
  }
  const closeCase = () => {
    caseModal.classList.remove('is-open')
    caseModal.setAttribute('aria-hidden', 'true')
    document.documentElement.classList.remove('is-locked')
    lastFocused?.focus?.()
  }

  openers.forEach((el) => {
    el.addEventListener('click', openCase)
    el.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        openCase()
      }
    })
  })
  closeEls.forEach((el) => el.addEventListener('click', closeCase))
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && caseModal.classList.contains('is-open')) closeCase()
  })
}

/* ---------- Header headroom ---------- */
// "Headroom" behavior: hide the header when scrolling down, reveal on scroll up.
const header = document.querySelector('[data-header]')
let lastY = window.scrollY
const THRESHOLD = 8

window.addEventListener(
  'scroll',
  () => {
    const y = window.scrollY
    if (Math.abs(y - lastY) < THRESHOLD) return
    // Always show near the very top of the page.
    if (y > lastY && y > header.offsetHeight) {
      header.classList.add('is-hidden')
    } else {
      header.classList.remove('is-hidden')
    }
    lastY = y
  },
  { passive: true },
)
