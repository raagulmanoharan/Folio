import './style.css'
import './portfolio-frame.css'
import './reflections-page.css'
import './page-transitions.css'
import './reflections-page.js'
import './case-entry.css'
import './case-entry.js'
import './project-sections.css'
import './project-sections.js'

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

  // Smooth trailing follow. The lerp factor sets how much the cursor lags
  // behind the pointer; ~0.33 halves the drag of the original 0.2.
  const tick = () => {
    cx += (tx - cx) * 0.33
    cy += (ty - cy) * 0.33
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
  if (window.location.hash === '#about') openDrawer()
  backdrop.addEventListener('click', closeDrawer)
  drawer.querySelector('[data-drawer-close]').addEventListener('click', closeDrawer)
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && drawer.classList.contains('is-open')) closeDrawer()
  })
}

/* ---------- Wordmark cipher decode ----------
   The name is split into per-letter spans and arrives scrambled — each letter
   cycles cipher glyphs (with Tamil aksharas from ராகுல் மனோகரன் woven in), then
   locks to its real letter, left to right, resolving into "Raagul Manoharan".
   Both wordmark forms are wired — the full name on desktop and the "RM" short
   form on mobile — and whichever is visible decodes. Runs once on load and
   again on hover/focus; calm and readable at rest. Skipped for reduced-motion. */
const isWritingNavigation = location.pathname.includes('/side-quests/') || document.referrer.includes('/side-quests/') || location.pathname.includes('/reflections/') || document.referrer.includes('/reflections/')
const wordmarkBtn = document.querySelector('[data-wordmark]')
if (wordmarkBtn && !reducedMotion) {
  const TAMIL = ['ரா', 'கு', 'ல்', 'ம', 'னோ', 'க', 'ர', 'ன்']
  const TAMIL_FACE = "'Noto Sans Tamil', sans-serif"
  // Scramble vocabulary: cipher glyphs plus a few Tamil aksharas from the name.
  const CIPHER = [
    '▓', '#', '&', 'R', 'K', 'Q', '1', '0', '3', '%', '☰', '*', '£', '€', '▒', '§', '¥', 'Ø',
    ...TAMIL,
  ]
  const isTamil = (g) => /[஀-௿]/.test(g)
  if (document.fonts?.load) {
    document.fonts.load(`500 16px 'Noto Sans Tamil'`, TAMIL.join('')).catch(() => {})
  }

  const pick = (arr) => arr[(Math.random() * arr.length) | 0]
  const scramble = (s) => {
    const g = pick(CIPHER)
    s.textContent = g
    s.style.fontFamily = isTamil(g) ? TAMIL_FACE : ''
    s.classList.add('is-cipher')
  }
  const lock = (s) => {
    s.textContent = s.dataset.orig
    s.style.fontFamily = ''
    s.classList.remove('is-cipher')
  }

  // Build one decoder per wordmark form. Each splits its text into per-letter
  // spans (the space is kept but never scrambled) and exposes a decode() that
  // no-ops when its element is hidden — so the offscreen form stays readable.
  const makeCipher = (el) => {
    const letters = []
    const frag = document.createDocumentFragment()
    ;[...el.textContent].forEach((ch) => {
      const s = document.createElement('span')
      s.textContent = ch
      if (ch.trim()) {
        s.className = 'wm-l'
        s.dataset.orig = ch
        letters.push(s)
      }
      frag.appendChild(s)
    })
    el.textContent = ''
    el.appendChild(frag)

    let runId = 0
    const decode = () => {
      if (!el.offsetParent) return // hidden form (e.g. the other one at this width)
      const id = ++runId // a newer run supersedes any in progress
      const STAGGER = 70 // ms between each letter locking in
      const PREROLL = 220 // ms of scramble before the first letter resolves
      const t0 = performance.now()
      letters.forEach((s, i) => {
        s._lockAt = t0 + PREROLL + i * STAGGER + Math.random() * 80
      })
      let last = 0
      const tick = (now) => {
        if (id !== runId) return // cancelled by a newer run
        const reroll = now - last >= 45
        if (reroll) last = now
        let anyLeft = false
        for (const s of letters) {
          if (now >= s._lockAt) {
            if (s.classList.contains('is-cipher')) lock(s)
          } else {
            anyLeft = true
            if (reroll) scramble(s)
          }
        }
        if (anyLeft) requestAnimationFrame(tick)
      }
      requestAnimationFrame(tick)
    }

    if (!isWritingNavigation) letters.forEach(scramble)
    return decode
  }

  const decoders = [...wordmarkBtn.querySelectorAll('.wordmark-full, .wordmark-short')]
    .map(makeCipher)
  const decodeAll = () => decoders.forEach((d) => d()) // only the visible form runs

  if (!isWritingNavigation) decodeAll()
  if (finePointer) {
    wordmarkBtn.addEventListener('pointerenter', decodeAll) // re-decode on hover
  }
  wordmarkBtn.addEventListener('focus', decodeAll) // and on keyboard focus
  // When the layout swaps forms (crossing the mobile breakpoint), decode the
  // one that just became visible.
  window.matchMedia('(max-width: 640px)').addEventListener('change', decodeAll)
}

/* ---------- Metal badge sheen ----------
   Track the cursor across the award pill so its specular highlight shifts like
   a reflection on a real metal plate. Desktop pointers only. */
if (finePointer) {
  document.querySelectorAll('.work-badge').forEach((badge) => {
    badge.addEventListener(
      'pointermove',
      (e) => {
        const r = badge.getBoundingClientRect()
        badge.style.setProperty('--sheen-x', `${((e.clientX - r.left) / r.width) * 100}%`)
        badge.style.setProperty('--sheen-y', `${((e.clientY - r.top) / r.height) * 100}%`)
      },
      { passive: true },
    )
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
    if (document.body.matches('.reflections-page, .side-quests-page')) return
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
