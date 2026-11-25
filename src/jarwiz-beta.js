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
  const candidates = motionEnabled() && !document.hidden
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
function selectTab(tab, tabs, panels, focus = false) {
  tabs.forEach(item => {
    const active = item === tab
    item.setAttribute('aria-selected', String(active))
    item.tabIndex = active ? 0 : -1
  })
  panels.forEach(panel => { panel.hidden = panel.id !== tab.getAttribute('aria-controls') })
  if (focus) tab.focus({ preventScroll: true })
  reconcile()
}
document.querySelectorAll('[role="tablist"]').forEach(tablist => {
  const tabs = [...tablist.querySelectorAll('[role="tab"]')]
  const panels = tabs.map(tab => document.getElementById(tab.getAttribute('aria-controls'))).filter(Boolean)
  tabs.forEach(tab => {
    tab.addEventListener('click', () => selectTab(tab, tabs, panels))
    tab.addEventListener('keydown', event => {
      const index = tabs.indexOf(tab)
      const next = { ArrowRight: (index + 1) % tabs.length, ArrowLeft: (index - 1 + tabs.length) % tabs.length, Home: 0, End: tabs.length - 1 }[event.key]
      if (next === undefined) return
      event.preventDefault()
      selectTab(tabs[next], tabs, panels, true)
    })
  })
  if (tabs.length) {
    selectTab(tabs[0], tabs, panels)
    tablist.hidden = false
  }
})
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
