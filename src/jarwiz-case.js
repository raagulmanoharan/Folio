const menuToggle = document.querySelector('.menu-toggle')
const mobileMenu = document.querySelector('#mobile-navigation')
function closeMenu(returnFocus = false) {
  menuToggle.setAttribute('aria-expanded', 'false')
  menuToggle.setAttribute('aria-label', 'Open navigation')
  mobileMenu.hidden = true
  if (returnFocus) menuToggle.focus()
}
menuToggle.addEventListener('click', () => {
  const open = menuToggle.getAttribute('aria-expanded') !== 'true'
  menuToggle.setAttribute('aria-expanded', String(open))
  menuToggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation')
  mobileMenu.hidden = !open
})
mobileMenu.addEventListener('click', event => { if (event.target.closest('a')) closeMenu() })
document.addEventListener('keydown', event => { if (event.key === 'Escape' && !mobileMenu.hidden) closeMenu(true) })
document.addEventListener('click', event => { if (!event.target.closest('.site-header') && !mobileMenu.hidden) closeMenu() })
matchMedia('(min-width: 761px)').addEventListener('change', event => { if (event.matches) closeMenu() })

const base = import.meta.env.BASE_URL
const release = `${base}work/jarwiz-launch-v1/`
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)')
const imageDialog = document.querySelector('.image-dialog')
const filmDialog = document.querySelector('.film-dialog')
const video = document.querySelector('[data-video]')
const progress = document.querySelector('[data-progress]')
const playButton = document.querySelector('[data-play]')
const playIcon = document.querySelector('[data-play-icon]')
const timeLabel = document.querySelector('[data-time]')
const filmTabs = document.querySelector('[data-film-tabs]')
const filmMoments = document.querySelector('[data-film-moments]')
const videoStatus = document.querySelector('[data-video-status]')
const videoError = document.querySelector('[data-video-error]')
const frame = document.querySelector('.player-frame')
const positions = new Map()
const manualPauses = new Set()
let activeFilm = null
let activeGroup = []
let imageOpener = null
let filmOpener = null
let loadingTimer = 0
let loadingVersion = 0
let restoreAt = 0
let isScrubbing = false
let advanceTimer = 0
let advanceGeneration = 0
let advanceAfterPlayback = false

// Semantic metadata is authored here; release manifest.json records production provenance.
// Durations are replaced by the actual metadata as soon as the selected film loads.
const films = {
  'first-question': { title: 'From a question to a working canvas', duration: 18.1, description: 'A question and two reports become research, opportunities, evidence, a comparison and a service blueprint.' },
  context: { title: 'Ask the next question', duration: 15, description: 'A short question uses the trip already on the canvas. Four clothing recommendations bring together reasons, individual visuals and browse links.' },
  create: { title: 'Create from selected context', label: 'Create', duration: 15, description: 'The selected journey and current screen give one working onboarding prototype a specific starting point.' },
  refine: { title: 'Refine the same prototype', label: 'Refine', duration: 15, description: 'A comment asks for a visible Paste my notes action. Review the proposed correction, then approve the change to the same prototype card.' },
  notice: { title: 'Notice the mismatch', label: 'Notice', duration: 15, description: 'Illustrative onboarding-session data puts a requirement in question. Jarwiz proposes moving invitations after the first useful plan.' },
  update: { title: 'Approve a focused change', label: 'Update', duration: 12, description: 'Approval updates the invitation requirement and acceptance criterion in the existing PRD. The rest of the document stays intact.' },
  discussion: { title: 'Keep the conversation with the work', duration: 15, description: 'People discuss a passage in a travel-notes PRD. After the author replies, Jarwiz joins the same thread with a sourced recommendation; the document stays under the author’s control.' },
  sales: { title: 'From source context to a working view', duration: 45.71666666666667, description: 'Inspect prepared source snapshots, then explore the overview and account table. Drive and Slack snapshots and all sales data are illustrative.', chapters: [{ time: 0, label: 'Connected context' }, { time: 8.65, label: 'Ask' }, { time: 15.283, label: 'Generate' }, { time: 23.35, label: 'Explore' }] },
  M01: { title: 'Edit the document', duration: 9.083333333333334, proof: true, description: 'Open the native document editor, add “Try one task first.”, and close it. The change remains in the research card.' },
  M02: { title: 'Edit a reason, keep the visuals', duration: 8.3, proof: true, description: 'Edit the jacket’s reason in the native table. All four images, browse links, other rows and sources remain intact.' },
  M03: { title: 'Choose the context', duration: 7.566666666666666, proof: true, description: 'Select the journey and the current screen. Both appear as source mentions in the real composer, ready for the next request.' },
  M04: { title: 'Return to the source', duration: 11.066666666666666, proof: true, description: 'Expand the complete service blueprint, close the focus view, then use its source chip to select and frame the original report on the canvas.' },
  M05: { title: 'Review, approve, refine', duration: 8, proof: true, description: 'Read the complete proposal before approving. The current prototype stays visible while the targeted change is prepared; the same card updates.' },
  M06: { title: 'Explore the details', duration: 9.266666666666667, proof: true, description: 'Read March’s actual chart tooltip, then switch to Accounts and inspect the complete rows, owners and next actions.' },
}
const groups = { create: ['create', 'refine'], notice: ['notice', 'update'] }
const imageTitles = {
  A01: 'A workspace to build on', A02: 'A question and its sources', A03: 'Research you can edit', A04: 'Compare the alternatives', A05: 'A complete service blueprint', A06: 'The context already on the canvas', A07: 'Recommendations that fit the trip', A08: 'Select the context that matters', A09: 'A working onboarding prototype', A10: 'A proposal before a change', A11: 'New evidence, a focused proposal', A12: 'The approved requirement', A13: 'Discussion beside the passage', A14: 'The source snapshots', A15: 'The complete pipeline overview', A16: 'Accounts and next actions',
}
const mediaPath = (id, extension) => `${release}${films[id].proof ? 'proofs' : 'films'}/${id}.${extension}`
const clock = seconds => `${Math.floor(Math.max(0, seconds || 0) / 60)}:${String(Math.floor(Math.max(0, seconds || 0) % 60)).padStart(2, '0')}`
const duration = () => Number.isFinite(video.duration) && video.duration > 0 ? video.duration : films[activeFilm]?.duration || 0
function cancelAdvance() {
  clearTimeout(advanceTimer)
  advanceGeneration++
}
function pauseMedia() {
  cancelAdvance()
  if (activeFilm && Number.isFinite(video.currentTime)) positions.set(activeFilm, video.currentTime)
  video.pause()
}
function lockPage() { document.documentElement.style.overflow = imageDialog.open || filmDialog.open ? 'hidden' : '' }
function openDialog(dialog) { closeMenu(); dialog.showModal(); lockPage() }
function afterClose(opener) { lockPage(); if (opener?.isConnected) opener.focus({ preventScroll: true }) }
function closeImage() { imageDialog.close() }
function closeFilm() { filmDialog.close() }
imageDialog.addEventListener('close', () => afterClose(imageOpener))
filmDialog.addEventListener('close', () => {
  loadingVersion++
  pauseMedia()
  clearTimeout(loadingTimer)
  videoStatus.hidden = true
  if (document.fullscreenElement) document.exitFullscreen().catch(() => {})
  afterClose(filmOpener)
})
document.querySelector('[data-close-image]').addEventListener('click', closeImage)
document.querySelector('[data-close-film]').addEventListener('click', closeFilm)
for (const dialog of [imageDialog, filmDialog]) {
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return
    const bounds = dialog.getBoundingClientRect()
    if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close()
  })
}

function selectView(inspector, id, focus = false) {
  for (const tab of inspector.querySelectorAll('[data-tab]')) {
    const selected = tab.dataset.tab === id
    tab.setAttribute('aria-selected', String(selected))
    tab.tabIndex = selected ? 0 : -1
    if (selected && focus) tab.focus()
  }
  for (const panel of inspector.querySelectorAll('[data-panel]')) panel.hidden = panel.dataset.panel !== id
}
function keyboardTabs(event, tabs, select) {
  const current = tabs.indexOf(event.target)
  if (current < 0) return
  let next
  if (event.key === 'ArrowRight') next = (current + 1) % tabs.length
  if (event.key === 'ArrowLeft') next = (current - 1 + tabs.length) % tabs.length
  if (event.key === 'Home') next = 0
  if (event.key === 'End') next = tabs.length - 1
  if (next === undefined) return
  event.preventDefault()
  select(tabs[next])
  tabs[next].focus()
}
for (const inspector of document.querySelectorAll('[data-inspector]')) {
  inspector.addEventListener('click', event => { const tab = event.target.closest('[data-tab]'); if (tab) selectView(inspector, tab.dataset.tab) })
  inspector.querySelector('[role=tablist]').addEventListener('keydown', event => keyboardTabs(event, [...inspector.querySelectorAll('[data-tab]')], tab => selectView(inspector, tab.dataset.tab)))
}

const inspectedImage = document.querySelector('[data-inspected-image]')
const imageStatus = document.querySelector('.image-dialog-status')
const imageRetry = document.querySelector('[data-image-retry]')
function loadInspectedImage(source) {
  inspectedImage.hidden = true
  imageStatus.hidden = false
  imageRetry.hidden = true
  document.querySelector('[data-image-status]').textContent = 'Loading full-size image…'
  document.querySelector('[data-image-size]').disabled = true
  document.querySelector('.image-viewport').setAttribute('aria-busy', 'true')
  inspectedImage.src = source
}
inspectedImage.addEventListener('load', () => {
  inspectedImage.hidden = false
  imageStatus.hidden = true
  document.querySelector('[data-image-size]').disabled = false
  document.querySelector('.image-viewport').setAttribute('aria-busy', 'false')
})
inspectedImage.addEventListener('error', () => {
  if (!inspectedImage.getAttribute('src')) return
  inspectedImage.hidden = true
  imageStatus.hidden = false
  imageRetry.hidden = false
  document.querySelector('[data-image-status]').textContent = 'This full-size image could not load. Try again or open the original image above.'
  document.querySelector('.image-viewport').setAttribute('aria-busy', 'false')
})
imageRetry.addEventListener('click', () => loadInspectedImage(document.querySelector('[data-image-original]').href))
function inspectImage(id, opener) {
  const source = document.querySelector(`[data-still="${id}"]`)
  if (!source) return
  pauseMedia()
  imageOpener = opener
  const original = source.dataset.full || source.src
  inspectedImage.alt = source.alt
  loadInspectedImage(original)
  document.querySelector('#image-dialog-title').textContent = imageTitles[id]
  document.querySelector('[data-image-original]').href = original
  document.querySelector('.image-viewport').classList.remove('is-actual')
  const sizeButton = document.querySelector('[data-image-size]')
  sizeButton.textContent = 'Actual size'
  sizeButton.setAttribute('aria-pressed', 'false')
  openDialog(imageDialog)
  document.querySelector('[data-close-image]').focus()
}
document.querySelector('[data-image-size]').addEventListener('click', event => {
  const viewport = document.querySelector('.image-viewport')
  const before = inspectedImage.getBoundingClientRect()
  const bounds = viewport.getBoundingClientRect()
  const clamp = value => Math.max(0, Math.min(1, value))
  const focusX = before.width ? clamp((bounds.left + viewport.clientLeft + viewport.clientWidth / 2 - before.left) / before.width) : .5
  const focusY = before.height ? clamp((bounds.top + viewport.clientTop + viewport.clientHeight / 2 - before.top) / before.height) : .5
  const actual = viewport.classList.toggle('is-actual')
  event.currentTarget.textContent = actual ? 'Fit image' : 'Actual size'
  event.currentTarget.setAttribute('aria-pressed', String(actual))
  if (actual) {
    const image = inspectedImage.getBoundingClientRect()
    const visible = viewport.getBoundingClientRect()
    viewport.scrollTo({
      left: viewport.scrollLeft + image.left + image.width * focusX - visible.left - viewport.clientLeft - viewport.clientWidth / 2,
      top: viewport.scrollTop + image.top + image.height * focusY - visible.top - viewport.clientTop - viewport.clientHeight / 2,
      behavior: 'instant',
    })
  } else viewport.scrollTo({ left: 0, top: 0, behavior: 'instant' })
})
for (const image of document.querySelectorAll('[data-still]')) {
  const container = image.closest('.image-inspect')
  const showImageError = () => {
    if (container.querySelector('.image-error')) return
    const message = document.createElement('span')
    message.className = 'image-error'
    message.textContent = 'This view could not load. Inspect the full image ↗'
    container.append(message)
  }
  image.addEventListener('error', showImageError)
  image.addEventListener('load', () => container.querySelector('.image-error')?.remove())
  if (image.complete && image.naturalWidth === 0 && (image.currentSrc || image.getAttribute('src') || '').trim()) showImageError()
}

function updatePlaybackUI() {
  playButton.setAttribute('aria-label', video.paused ? 'Play film' : 'Pause film')
  playIcon.innerHTML = video.paused ? '<path d="m6 4 10 6-10 6V4Z" fill="currentColor"/>' : '<path d="M6 4v12M14 4v12" stroke="currentColor" stroke-width="2.5"/>'
  const total = duration()
  if (!isScrubbing) progress.value = String(video.currentTime || 0)
  progress.max = String(total)
  progress.style.setProperty('--progress', `${total ? (Number(progress.value) / total) * 100 : 0}%`)
  progress.setAttribute('aria-valuetext', `${clock(Number(progress.value))} of ${clock(total)}`)
  timeLabel.textContent = `${clock(Number(progress.value))} / ${clock(total)}`
  for (const [index, button] of [...filmMoments.children].entries()) {
    const next = filmMoments.children[index + 1]
    const current = video.currentTime >= Number(button.dataset.time) && (!next || video.currentTime < Number(next.dataset.time))
    button.setAttribute('aria-pressed', String(current))
  }
}
async function playFilm() {
  if (!activeFilm || !filmDialog.open) return
  cancelAdvance()
  advanceAfterPlayback = true
  if (video.ended) video.currentTime = 0
  manualPauses.delete(activeFilm)
  const version = loadingVersion
  try { await video.play() } catch (error) {
    if (version !== loadingVersion || error.name === 'AbortError') return
    if (error.name !== 'NotAllowedError') showVideoError()
    updatePlaybackUI()
  }
}
function showVideoError() { videoError.hidden = false; videoStatus.hidden = true; clearTimeout(loadingTimer) }
function setFilm(id, shouldPlay = false) {
  pauseMedia()
  advanceAfterPlayback = shouldPlay
  loadingVersion++
  activeFilm = id
  const entry = films[id]
  restoreAt = positions.get(id) || 0
  videoError.hidden = true
  videoStatus.hidden = true
  clearTimeout(loadingTimer)
  progress.disabled = true
  progress.value = '0'
  progress.max = String(entry.duration)
  document.querySelector('#film-dialog-title').textContent = entry.title
  document.querySelector('[data-film-eyebrow]').textContent = entry.proof ? 'A closer look' : 'Product workflow'
  document.querySelector('[data-film-description]').textContent = entry.description
  video.setAttribute('aria-label', entry.title)
  video.poster = mediaPath(id, 'webp')
  video.src = mediaPath(id, 'mp4')
  video.preload = 'metadata'
  document.querySelector('[data-video-download]').href = video.src
  const paired = activeGroup.length > 1
  frame.setAttribute('role', paired ? 'tabpanel' : 'region')
  frame.setAttribute('aria-labelledby', 'film-dialog-title')
  for (const tab of filmTabs.children) {
    const selected = tab.dataset.filmId === id
    tab.setAttribute('aria-selected', String(selected))
    tab.tabIndex = selected ? 0 : -1
    if (selected && paired) frame.setAttribute('aria-labelledby', tab.id)
  }
  filmMoments.hidden = !entry.chapters?.length
  filmMoments.replaceChildren()
  for (const chapter of entry.chapters || []) {
    const button = document.createElement('button')
    button.type = 'button'
    button.dataset.time = String(chapter.time)
    button.textContent = `${clock(chapter.time)} ${chapter.label}`
    button.setAttribute('aria-label', `Seek to ${chapter.label} at ${clock(chapter.time)}`)
    filmMoments.append(button)
  }
  updatePlaybackUI()
  if (shouldPlay && !manualPauses.has(id)) playFilm()
}
function watch(id, opener) {
  if (!films[id]) return
  filmOpener = opener
  activeGroup = groups[id] || [id]
  filmTabs.replaceChildren()
  filmTabs.hidden = activeGroup.length < 2
  for (const filmId of activeGroup) {
    const tab = document.createElement('button')
    tab.type = 'button'
    tab.role = 'tab'
    tab.dataset.filmId = filmId
    tab.id = `film-tab-${filmId}`
    tab.textContent = films[filmId].label || films[filmId].title
    tab.setAttribute('aria-controls', 'workflow-video-panel')
    filmTabs.append(tab)
  }
  video.id = 'workflow-video'
  openDialog(filmDialog)
  document.querySelector('.motion-note').hidden = !reducedMotion.matches
  setFilm(id, !reducedMotion.matches)
  document.querySelector('[data-close-film]').focus()
}
filmTabs.addEventListener('click', event => {
  const tab = event.target.closest('[data-film-id]')
  if (tab && tab.dataset.filmId !== activeFilm) setFilm(tab.dataset.filmId, !video.paused && !reducedMotion.matches)
})
filmTabs.addEventListener('keydown', event => keyboardTabs(event, [...filmTabs.children], tab => setFilm(tab.dataset.filmId, false)))
filmMoments.addEventListener('click', event => {
  const button = event.target.closest('[data-time]')
  if (!button) return
  cancelAdvance()
  advanceAfterPlayback = false
  const time = Number(button.dataset.time)
  if (video.readyState >= 1) video.currentTime = Math.min(time, duration())
  else restoreAt = time
})
playButton.addEventListener('click', () => {
  if (video.paused) playFilm()
  else { manualPauses.add(activeFilm); pauseMedia() }
})
document.querySelector('[data-replay]').addEventListener('click', () => {
  cancelAdvance()
  restoreAt = 0
  if (video.readyState) video.currentTime = 0
  positions.set(activeFilm, 0)
  playFilm()
})
progress.addEventListener('pointerdown', () => { isScrubbing = true })
progress.addEventListener('input', () => {
  cancelAdvance()
  advanceAfterPlayback = false
  if (video.readyState < 1) return
  video.currentTime = Number(progress.value)
  updatePlaybackUI()
})
progress.addEventListener('change', () => { isScrubbing = false; updatePlaybackUI() })
window.addEventListener('pointerup', () => { isScrubbing = false })
document.querySelector('[data-fullscreen]').addEventListener('click', async () => {
  try {
    if (document.fullscreenElement) await document.exitFullscreen()
    else if (document.querySelector('[data-player-shell]').requestFullscreen) await document.querySelector('[data-player-shell]').requestFullscreen()
    else if (video.webkitEnterFullscreen) video.webkitEnterFullscreen()
  } catch { document.querySelector('[data-video-download]').focus() }
})
video.addEventListener('loadedmetadata', () => {
  progress.disabled = false
  if (restoreAt > 0 && restoreAt < duration() - .15) video.currentTime = restoreAt
  else if (restoreAt >= duration() - .15) video.currentTime = 0
  restoreAt = 0
  updatePlaybackUI()
})
video.addEventListener('play', () => {
  for (const other of document.querySelectorAll('video')) if (other !== video) other.pause()
  updatePlaybackUI()
})
video.addEventListener('pause', updatePlaybackUI)
video.addEventListener('timeupdate', updatePlaybackUI)
video.addEventListener('ended', () => {
  positions.set(activeFilm, 0)
  updatePlaybackUI()
  const next = activeGroup[activeGroup.indexOf(activeFilm) + 1]
  if (!next || !advanceAfterPlayback || reducedMotion.matches || manualPauses.has(activeFilm)) return
  const previous = activeFilm
  const version = loadingVersion
  const generation = advanceGeneration
  advanceTimer = window.setTimeout(() => {
    if (!filmDialog.open || activeFilm !== previous || loadingVersion !== version || advanceGeneration !== generation || reducedMotion.matches || manualPauses.has(previous) || !video.ended) return
    setFilm(next, true)
  }, 1000)
})
video.addEventListener('waiting', () => { clearTimeout(loadingTimer); loadingTimer = window.setTimeout(() => { if (!video.paused) videoStatus.hidden = false }, 350) })
for (const event of ['canplay', 'playing', 'seeked']) video.addEventListener(event, () => { clearTimeout(loadingTimer); videoStatus.hidden = true })
video.addEventListener('error', () => { if (activeFilm && filmDialog.open) showVideoError() })
reducedMotion.addEventListener('change', event => {
  document.querySelector('.motion-note').hidden = !event.matches
  if (event.matches) pauseMedia()
})
document.addEventListener('visibilitychange', () => { if (document.hidden) pauseMedia() })
new IntersectionObserver(entries => { if (!entries[0].isIntersecting) pauseMedia() }, { threshold: 0 }).observe(frame)
document.addEventListener('focusin', event => { if (!mobileMenu.hidden && !event.target.closest('.site-header')) closeMenu() })
document.addEventListener('click', event => {
  const inspect = event.target.closest('[data-zoom], [data-zoom-target]')
  if (inspect) {
    event.preventDefault()
    inspectImage(inspect.dataset.zoom || inspect.dataset.zoomTarget, inspect)
  }
  const trigger = event.target.closest('[data-workflow], [data-proof]')
  if (trigger) watch(trigger.dataset.workflow || trigger.dataset.proof, trigger)
  if (event.target.closest('[data-external-artifact]')) pauseMedia()
})
