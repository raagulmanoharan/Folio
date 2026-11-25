// Load only the visible demonstration. Posters remain useful without JavaScript,
// when motion is disabled, and when a browser cannot play a film.
const videos = [...document.querySelectorAll('video[data-demo]')]
const toggle = document.querySelector('#motion-toggle')
const reduced = matchMedia('(prefers-reduced-motion: reduce)')
const visible = new Map()
const failed = new Set()
let motionOverride
let current = null
let revision = 0

function motionEnabled() {
  return motionOverride ?? (!reduced.matches && !navigator.connection?.saveData)
}
function syncMotionLabel() {
  if (!toggle) return
  toggle.hidden = false
  toggle.textContent = motionEnabled() ? 'Motion on' : 'Motion off'
  toggle.setAttribute('aria-pressed', String(motionEnabled()))
  toggle.setAttribute('aria-label', motionEnabled() ? 'Pause product animations' : 'Enable product animations')
}
function pause(video) {
  video.pause()
  video.parentElement.classList.remove('is-playing')
}
function reveal(video, request) {
  const ready = () => {
    if (request === revision && current === video && !video.paused && !video.closest('[hidden]')) {
      video.parentElement.classList.add('is-playing')
    }
  }
  if (video.requestVideoFrameCallback) video.requestVideoFrameCallback(ready)
  else ready()
}
function reconcile() {
  const candidates = motionEnabled() && !document.hidden && !document.querySelector(".image-dialog[open]")
    ? videos.filter(video => (visible.get(video) || 0) > .16 && !video.closest('[hidden]') && !failed.has(video))
    : []
  candidates.sort((a, b) => (visible.get(b) || 0) - (visible.get(a) || 0))
  let next = candidates[0] || null
  // Keep adjacent scenes from repeatedly taking playback from one another
  // while their visible areas are almost equal during a scroll.
  if (current && candidates.includes(current) && next && visible.get(current) >= visible.get(next) - .1) next = current
  if (current === next) return
  const request = ++revision
  current = next
  videos.forEach(video => { if (video !== next) pause(video) })
  if (!next) return
  if (!next.getAttribute('src')) {
    next.src = `${import.meta.env.BASE_URL}work/jarwiz-launch-v1/${next.dataset.file}`
  }
  next.muted = true
  next.play().then(() => {
    if (request === revision && current === next) reveal(next, request)
    else if (current !== next) pause(next)
  }).catch(() => {
    if (request !== revision) return
    failed.add(next)
    pause(next)
    current = null
    reconcile()
  })
}
if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => visible.set(entry.target, entry.intersectionRatio))
    reconcile()
  }, { threshold: [0, .16, .25, .4, .6, .8, 1] })
  videos.forEach(video => observer.observe(video))
}
videos.forEach(video => {
  video.addEventListener('error', () => {
    failed.add(video)
    pause(video)
    if (current === video) { current = null; revision++ }
    reconcile()
  })
})
toggle?.addEventListener('click', () => {
  motionOverride = !motionEnabled()
  if (motionOverride) failed.clear()
  syncMotionLabel()
  reconcile()
})
reduced.addEventListener('change', () => { syncMotionLabel(); reconcile() })
document.addEventListener('visibilitychange', reconcile)
window.addEventListener('pagehide', () => {
  revision++
  current = null
  videos.forEach(pause)
})
window.addEventListener('pageshow', reconcile)
syncMotionLabel()


const dialog = document.querySelector('.image-dialog')
const detailImage = dialog.querySelector('img')
const title = dialog.querySelector('#image-dialog-title')
let opener
let previousOverflow
for (const link of document.querySelectorAll('[data-enlarge]')) {
  link.addEventListener('click', event => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
    event.preventDefault()
    opener = link
    const description = link.dataset.alt || link.querySelector('img')?.alt || 'Product detail'
    detailImage.src = link.href
    detailImage.alt = description
    title.textContent = description
    previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    dialog.showModal()
    dialog.querySelector('.dialog-scroll').scrollTo(0, 0)
    reconcile()
  })
}
dialog.querySelector('.dialog-close').addEventListener('click', () => dialog.close())
dialog.addEventListener('click', event => {
  if (event.target !== dialog) return
  const rect = dialog.getBoundingClientRect()
  if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close()
})
dialog.addEventListener('close', () => {
  document.body.style.overflow = previousOverflow || ''
  opener?.focus({ preventScroll: true })
  reconcile()
})
const sections = [...document.querySelectorAll('main > section[id]')]
const anchors = [...document.querySelectorAll('.contents a')]
let pending = false
function updateSection() {
  const currentSection = [...sections].reverse().find(section => section.getBoundingClientRect().top < innerHeight * .35) || sections[0]
  for (const link of anchors) {
    if (link.hash === '#' + currentSection.id) link.setAttribute('aria-current', 'location')
    else link.removeAttribute('aria-current')
  }
  pending = false
}
window.addEventListener('scroll', () => {
  if (!pending) { pending = true; requestAnimationFrame(updateSection) }
}, { passive: true })
updateSection()

dialog.addEventListener('keydown', event => {
  if (event.key !== 'Tab') return
  const close = dialog.querySelector('.dialog-close')
  const scroll = dialog.querySelector('.dialog-scroll')
  if (event.shiftKey && document.activeElement === close) {
    event.preventDefault(); scroll.focus()
  } else if (!event.shiftKey && document.activeElement === scroll) {
    event.preventDefault(); close.focus()
  }
})
