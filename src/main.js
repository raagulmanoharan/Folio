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
}

/* ---------- Gallery drawer (opens from the top) ---------- */
const gallery = document.querySelector('[data-gallery]')
const galleryBackdrop = document.querySelector('[data-gallery-backdrop]')
const galleryOpenBtn = document.querySelector('[data-gallery-open]')

if (gallery && galleryBackdrop && galleryOpenBtn) {
  // Load the embedded experiments (a Figma deck, a video) only on first open, so
  // a visitor who never opens the drawer never hits those external apps.
  const loadEmbeds = () => {
    gallery.querySelectorAll('iframe[data-embed-src]').forEach((f) => {
      f.src = f.getAttribute('data-embed-src')
      f.removeAttribute('data-embed-src')
    })
  }
  const openGallery = () => {
    loadEmbeds()
    gallery.classList.add('is-open')
    galleryBackdrop.classList.add('is-open')
    gallery.setAttribute('aria-hidden', 'false')
    galleryOpenBtn.setAttribute('aria-expanded', 'true')
  }
  const closeGallery = () => {
    gallery.classList.remove('is-open')
    galleryBackdrop.classList.remove('is-open')
    gallery.setAttribute('aria-hidden', 'true')
    galleryOpenBtn.setAttribute('aria-expanded', 'false')
  }

  galleryOpenBtn.addEventListener('click', openGallery)
  galleryBackdrop.addEventListener('click', closeGallery)
  document
    .querySelectorAll('[data-gallery-close]')
    .forEach((el) => el.addEventListener('click', closeGallery))
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && gallery.classList.contains('is-open')) closeGallery()
  })

  // Reveal each project's caption only once it scrolls into view.
  const figures = gallery.querySelectorAll('[data-figure]')
  if (figures.length && 'IntersectionObserver' in window) {
    // Observe against the viewport (not the transformed drawer, whose transform
    // breaks a scroll-container root); the fixed drawer fills the viewport.
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => e.target.classList.toggle('is-inview', e.isIntersecting))
      },
      { threshold: 0.5 },
    )
    figures.forEach((f) => io.observe(f))
  } else {
    figures.forEach((f) => f.classList.add('is-inview'))
  }
}

/* ---------- Reflections (full-screen writing panel) ---------- */
const reflections = document.querySelector('[data-reflections]')
const reflectionsOpenBtn = document.querySelector('[data-reflections-open]')

if (reflections && reflectionsOpenBtn) {
  let reflectionsLastFocused = null

  const openReflections = () => {
    reflectionsLastFocused = document.activeElement
    reflections.classList.add('is-open')
    reflections.setAttribute('aria-hidden', 'false')
    reflectionsOpenBtn.setAttribute('aria-expanded', 'true')
    document.documentElement.classList.add('is-locked')
    reflections.scrollTop = 0
  }
  const closeReflections = () => {
    reflections.classList.remove('is-open')
    reflections.setAttribute('aria-hidden', 'true')
    reflectionsOpenBtn.setAttribute('aria-expanded', 'false')
    document.documentElement.classList.remove('is-locked')
    reflectionsLastFocused?.focus?.()
  }

  reflectionsOpenBtn.addEventListener('click', openReflections)
  reflections
    .querySelectorAll('[data-reflections-close]')
    .forEach((el) => el.addEventListener('click', closeReflections))
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && reflections.classList.contains('is-open')) closeReflections()
  })

  // Each article expands in place on click — no links, no separate pages.
  const RDUR = reducedMotion ? 20 : 500
  const bar = reflections.querySelector('.reflections-bar')
  // Smoothly bring an item's heading just under the sticky bar.
  const scrollToItem = (item) => {
    const toggle = item.querySelector('[data-refl-toggle]')
    const y =
      reflections.scrollTop +
      toggle.getBoundingClientRect().top -
      reflections.getBoundingClientRect().top -
      (bar ? bar.offsetHeight : 0) -
      12
    reflections.scrollTo({ top: Math.max(0, y), behavior: reducedMotion ? 'auto' : 'smooth' })
  }
  const collapseItem = (item) => {
    const toggle = item.querySelector('[data-refl-toggle]')
    const reveal = item.querySelector('.reflections-item__reveal')
    item.classList.remove('is-open', 'is-settled') // fade the control out first
    toggle.setAttribute('aria-expanded', 'false')
    // clip again before animating shut (overflow was opened for the sticky control)
    reveal.style.overflow = 'hidden'
    reveal.style.maxHeight = `${reveal.scrollHeight}px`
    void reveal.offsetHeight
    requestAnimationFrame(() => {
      reveal.style.maxHeight = '0px'
    })
  }
  reflections.querySelectorAll('[data-refl-toggle]').forEach((toggle) => {
    const item = toggle.closest('.reflections-item')
    const reveal = item.querySelector('.reflections-item__reveal')
    let settle
    toggle.addEventListener('click', () => {
      const open = item.classList.toggle('is-open')
      toggle.setAttribute('aria-expanded', String(open))
      clearTimeout(settle)
      if (open) {
        reveal.style.overflow = 'hidden'
        reveal.style.maxHeight = `${reveal.scrollHeight}px`
        settle = setTimeout(() => {
          if (item.classList.contains('is-open')) {
            reveal.style.maxHeight = 'none'
            // let the sticky "Collapse" control stick, then fade it in
            reveal.style.overflow = 'visible'
            item.classList.add('is-settled')
          }
        }, RDUR)
      } else {
        item.classList.remove('is-settled')
        reveal.style.overflow = 'hidden'
        reveal.style.maxHeight = `${reveal.scrollHeight}px`
        void reveal.offsetHeight
        requestAnimationFrame(() => {
          reveal.style.maxHeight = '0px'
        })
      }
    })
  })

  // The in-article "Collapse" control closes its own article and eases back
  // to the heading.
  reflections.querySelectorAll('[data-refl-collapse]').forEach((btn) => {
    const item = btn.closest('.reflections-item')
    btn.addEventListener('click', () => {
      scrollToItem(item)
      collapseItem(item)
    })
  })
}

/* ---------- Case study (expands inline, in place, below the work item) ---------- */
const caseInline = document.querySelector('[data-case]')
if (caseInline) {
  const toggles = document.querySelectorAll('[data-case-open]')
  const closers = caseInline.querySelectorAll('[data-case-close]')
  const hint = document.querySelector('[data-case-hint]')
  const featured = document.querySelector('.work-item--featured')
  const headerEl = document.querySelector('[data-header]')

  const scrollToEl = (el) => {
    if (!el) return
    const offset = (headerEl?.offsetHeight || 43) + 8
    const y = el.getBoundingClientRect().top + window.scrollY - offset
    window.scrollTo({ top: y, behavior: reducedMotion ? 'auto' : 'smooth' })
  }

  const reveal = caseInline.querySelector('.case-inline__reveal')
  const DUR = reducedMotion ? 20 : 560
  let settleTimer

  const setState = (open) => {
    caseInline.classList.toggle('is-open', open)
    toggles.forEach((t) => t.setAttribute('aria-expanded', String(open)))
    if (hint) {
      hint.innerHTML = open
        ? 'Hide case study <span aria-hidden="true">&#8593;</span>'
        : 'Read the case study <span aria-hidden="true">&#8595;</span>'
    }
  }

  const openCase = () => {
    setState(true)
    clearTimeout(settleTimer)
    // animate to the measured content height, then release to `none` so the
    // panel can grow if images finish loading or the viewport reflows
    reveal.style.overflow = 'hidden'
    reveal.style.maxHeight = `${reveal.scrollHeight}px`
    settleTimer = setTimeout(() => {
      if (caseInline.classList.contains('is-open')) {
        reveal.style.maxHeight = 'none'
        // overflow visible so the sticky footer collapse can stick
        reveal.style.overflow = 'visible'
      }
    }, DUR)
    scrollToEl(caseInline)
  }
  const closeCase = () => {
    setState(false)
    clearTimeout(settleTimer)
    // clip again before animating shut (overflow was opened for the sticky control)
    reveal.style.overflow = 'hidden'
    // from `none`/auto back to a fixed height, then to 0 so it animates
    reveal.style.maxHeight = `${reveal.scrollHeight}px`
    // force a reflow so the browser registers the fixed start height
    void reveal.offsetHeight
    requestAnimationFrame(() => {
      reveal.style.maxHeight = '0px'
    })
    // return the reader to its trigger so the viewport isn't left in whitespace
    scrollToEl(featured)
  }
  const toggleCase = () =>
    caseInline.classList.contains('is-open') ? closeCase() : openCase()

  toggles.forEach((el) => el.addEventListener('click', toggleCase))
  closers.forEach((el) => el.addEventListener('click', closeCase))
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && caseInline.classList.contains('is-open')) closeCase()
  })
}

/* ---------- Work carousel (screenshots on the right) ---------- */
document.querySelectorAll('[data-carousel]').forEach((car) => {
  const track = car.querySelector('[data-carousel-track]')
  const dotsWrap = car.querySelector('[data-carousel-dots]')
  const slides = track ? [...track.children] : []
  if (!track || !dotsWrap || slides.length < 2) return

  // Track the current index explicitly so a click always advances exactly one
  // (reading scrollLeft mid-scroll is unreliable when clicks come quickly).
  let current = 0
  let lock = false
  let lockT
  const setActive = (i) => {
    current = ((i % slides.length) + slides.length) % slides.length
    dots.forEach((d, di) =>
      di === current ? d.setAttribute('aria-current', 'true') : d.removeAttribute('aria-current'),
    )
  }
  const goTo = (i) => {
    setActive(i)
    // Lock the scroll listener out until the programmatic scroll settles, so it
    // can't clobber `current` with an in-progress position.
    lock = true
    clearTimeout(lockT)
    lockT = setTimeout(() => (lock = false), reducedMotion ? 60 : 600)
    track.scrollTo({ left: current * track.clientWidth, behavior: reducedMotion ? 'auto' : 'smooth' })
  }

  slides.forEach((_, i) => {
    const dot = document.createElement('button')
    dot.type = 'button'
    dot.setAttribute('aria-label', `Show screenshot ${i + 1} of ${slides.length}`)
    if (i === 0) dot.setAttribute('aria-current', 'true')
    dot.addEventListener('click', () => goTo(i))
    dotsWrap.appendChild(dot)
  })
  const dots = [...dotsWrap.children]

  // Keep the counter in sync when the reader swipes/scrolls the track by hand.
  let raf
  track.addEventListener(
    'scroll',
    () => {
      if (lock) return
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        if (!lock) setActive(Math.round(track.scrollLeft / track.clientWidth))
      })
    },
    { passive: true },
  )

  // Click the image to advance; wrap back to the first after the last.
  track.addEventListener('click', () => goTo(current + 1))

  // While hovering the images, the custom cursor reads "Next" (fine pointers only).
  if (cursor && finePointer && !reducedMotion) {
    track.addEventListener('mouseenter', () => cursor.classList.add('is-next'))
    track.addEventListener('mouseleave', () => cursor.classList.remove('is-next'))
  }
})

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
