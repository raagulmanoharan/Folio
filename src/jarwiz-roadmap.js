import roadmap from '../docs/jarwiz-beta-roadmap.json'

const STORAGE_KEY = 'jarwiz-beta-roadmap-status-overrides-v1'
const statuses = Array.isArray(roadmap.statuses) ? roadmap.statuses : []
const implementationStatuses = Array.isArray(roadmap.implementationStatuses) ? roadmap.implementationStatuses : []
const items = Array.isArray(roadmap.items) ? roadmap.items : []
const gates = Array.isArray(roadmap.metadata?.gates) ? roadmap.metadata.gates : []
const statusById = new Map(statuses.map(status => [status.id, status]))
const implementationStatusById = new Map(implementationStatuses.map(status => [status.id, status]))
const validStatusIds = new Set(statuses.map(status => status.id))
const search = document.querySelector('#search')
const filter = document.querySelector('#filter')
const board = document.querySelector('#board')
const dialog = document.querySelector('#item-dialog')
const dialogStatus = document.querySelector('#dialog-status')
let selectedItem = null
let overrides = readOverrides()
let persistentStorage = true

function readOverrides() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
    return Object.fromEntries(Object.entries(parsed).filter(([itemId, statusId]) => items.some(item => item.id === itemId) && validStatusIds.has(statusId)))
  } catch {
    persistentStorage = false
    return {}
  }
}

function currentStatus(item) {
  return statusById.get(overrides[item.id] || item.status) || { id: item.status, label: item.status }
}

function setStatus(itemId, statusId) {
  const item = items.find(candidate => candidate.id === itemId)
  if (!item || !validStatusIds.has(statusId)) return
  if (statusId === item.status) delete overrides[itemId]
  else overrides[itemId] = statusId
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(overrides))
  } catch {
    persistentStorage = false
  }
  updateSaveState()
  if (selectedItem?.id === itemId) renderDetail(selectedItem)
  renderBoard()
}

function escapeHtml(value = '') {
  return String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char])
}

function listMarkup(values, evidence = false) {
  if (!Array.isArray(values) || values.length === 0) return '<li>None recorded</li>'
  return values.map(value => {
    if (evidence && typeof value === 'object' && value) {
      const label = escapeHtml(value.label || value.path || 'Source')
      const url = /^https?:\/\//i.test(value.path || '') ? `<a href="${escapeHtml(value.path)}" target="_blank" rel="noopener">${label}</a>` : label
      return `<li>${url}${value.path && value.label ? ` <span class="evidence-path">${escapeHtml(value.path)}</span>` : ''}</li>`
    }
    if (typeof value === 'object' && value) return `<li>${escapeHtml(value.title || value.label || value.id || JSON.stringify(value))}</li>`
    return `<li>${escapeHtml(value)}</li>`
  }).join('')
}

function fillFilters() {
  const options = new Map()
  items.forEach(item => {
    if (item.priority) options.set(`priority:${item.priority}`, `${item.priority} priority`)
    if (item.phase) {
      const phase = roadmap.phases?.find(candidate => candidate.id === item.phase)
      options.set(`phase:${item.phase}`, phase?.label || item.phase)
    }
  })
  filter.innerHTML = '<option value="all">All priorities & workstreams</option>' + [...options].map(([value, label]) => `<option value="${escapeHtml(value)}">${escapeHtml(label)}</option>`).join('')
}

function visibleItems() {
  const query = search.value.trim().toLowerCase()
  const selectedFilter = filter.value
  return items.filter(item => {
    const matchesQuery = !query || [item.id, item.title, item.description, item.userBenefit, item.ownerRole].filter(Boolean).join(' ').toLowerCase().includes(query)
    const [filterType, filterValue] = selectedFilter.split(':')
    const matchesFilter = selectedFilter === 'all' || item[filterType] === filterValue
    return matchesQuery && matchesFilter
  })
}

function renderGates() {
  const region = document.querySelector('#launch-gates')
  const verified = gates.filter(gate => gate.state === 'verified').length
  document.querySelector('#gate-summary').textContent = `${verified} of ${gates.length} launch gates verified`
  region.innerHTML = gates.map(gate => {
    const label = gate.title || gate.label || gate.name || 'Launch gate'
    const state = gate.state || 'pending'
    const count = Array.isArray(gate.itemIds) ? gate.itemIds.length : 0
    const displayState = state.replaceAll('-', ' ')
    return `<article class="gate-card" data-status="${escapeHtml(state)}"><span class="gate-indicator" aria-hidden="true"></span><div><strong>${escapeHtml(label)}</strong><span>${escapeHtml(gate.description || '')}</span><span class="gate-status">${escapeHtml(displayState)} · ${count} work ${count === 1 ? 'item' : 'items'}</span></div></article>`
  }).join('') || '<p class="empty-results">No launch gates are recorded in the audited baseline.</p>'
}

function renderPhases() {
  const region = document.querySelector('#phase-roadmap')
  region.innerHTML = (roadmap.phases || []).map(phase => {
    const criteria = Array.isArray(phase.exitCriteria) && phase.exitCriteria.length
      ? `<ul>${phase.exitCriteria.map(criterion => `<li>${escapeHtml(criterion)}</li>`).join('')}</ul>`
      : ''
    return `<details class="phase-step"><summary>${escapeHtml(phase.label || phase.id)}</summary><p>${escapeHtml(phase.description || '')}</p>${criteria}</details>`
  }).join('')
}

function renderBoard() {
  const filteredItems = visibleItems()
  document.querySelector('#item-count').textContent = `Showing ${filteredItems.length} of ${items.length} items`
  if (!filteredItems.length) {
    board.innerHTML = '<p class="empty-results">No roadmap items match these filters. Try a different search or filter.</p>'
    return
  }
  if (!statuses.length) {
    board.innerHTML = '<p class="empty-results">Roadmap status definitions are not available yet.</p>'
    return
  }
  board.innerHTML = statuses.map(status => {
    const columnItems = filteredItems.filter(item => currentStatus(item).id === status.id)
    return `<section class="board-column" data-column="${escapeHtml(status.id)}" aria-label="${escapeHtml(status.label)} status"><div class="column-heading"><h3 class="column-title"><span class="column-dot" aria-hidden="true"></span>${escapeHtml(status.label)}</h3><span class="column-count" aria-label="${columnItems.length} items">${columnItems.length}</span></div><div class="column-cards">${columnItems.length ? columnItems.map(cardMarkup).join('') : '<p class="empty-column">No matching items</p>'}</div></section>`
  }).join('') || '<p class="empty-results">No statuses are defined.</p>'
  board.querySelectorAll('[data-item]').forEach(card => {
    card.addEventListener('click', () => openDetail(items.find(item => item.id === card.dataset.item)))
    card.addEventListener('keydown', event => {
      if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); openDetail(items.find(item => item.id === card.dataset.item)) }
    })
  })
}

function cardMarkup(item) {
  const phase = roadmap.phases?.find(candidate => candidate.id === item.phase)
  const implementationStatus = implementationStatusById.get(item.implementationStatus)?.label || item.implementationStatus || 'Unclassified'
  return `<article class="roadmap-card" tabindex="0" role="button" data-item="${escapeHtml(item.id)}" aria-label="Open ${escapeHtml(item.title)} details"><div class="card-topline"><span class="card-id">${escapeHtml(item.id)}</span><span class="priority" data-priority="${escapeHtml(item.priority || '')}"><i class="priority-mark" aria-hidden="true"></i>${escapeHtml(item.priority || 'No priority')}</span></div><h3>${escapeHtml(item.title)}</h3><p class="card-description">${escapeHtml(item.description || item.userBenefit || '')}</p><div class="card-footer"><div class="card-tags"><span class="phase-pill">${escapeHtml(phase?.label || item.phase || 'Unphased')}</span><span class="implementation-pill">${escapeHtml(implementationStatus)}</span></div><span class="card-detail-hint">Details ↗</span></div></article>`
}

function renderDetail(item) {
  selectedItem = item
  const phase = roadmap.phases?.find(candidate => candidate.id === item.phase)
  const gate = roadmap.metadata?.launchGateCategories?.find(candidate => candidate.id === item.launchGate)?.label || item.launchGate || 'No launch gate'
  const baselineStatus = implementationStatusById.get(item.implementationStatus)?.label || item.implementationStatus || 'Unclassified'
  document.querySelector('#dialog-kicker').textContent = `${item.id} · Implementation: ${baselineStatus} · Planning status: ${currentStatus(item).label}`
  document.querySelector('#dialog-title').textContent = item.title
  document.querySelector('#dialog-description').textContent = item.description || item.userBenefit || ''
  const effort = item.effort && (item.effort.minDays != null || item.effort.maxDays != null)
    ? `${item.effort.minDays ?? '?'}–${item.effort.maxDays ?? '?'} days`
    : ''
  const dependencyIds = Array.isArray(item.dependencies) ? item.dependencies : []
  const dependencies = dependencyIds.map(dependency => {
    const dependencyId = typeof dependency === 'object' ? dependency.id : dependency
    const dependencyItem = items.find(candidate => candidate.id === dependencyId)
    return dependencyItem ? `${dependencyItem.id} · ${dependencyItem.title}` : dependency
  })
  document.querySelector('#dialog-meta').innerHTML = [item.priority, phase?.label || item.phase, item.ownerRole, gate, effort].filter(Boolean).map(value => `<span class="phase-pill">${escapeHtml(value)}</span>`).join('')
  document.querySelector('#dialog-criteria').innerHTML = listMarkup(item.acceptanceCriteria)
  document.querySelector('#dialog-dependencies').innerHTML = listMarkup(dependencies)
  document.querySelector('#dialog-evidence').innerHTML = listMarkup(item.sourceEvidence, true)
  dialogStatus.innerHTML = statuses.map(status => `<option value="${escapeHtml(status.id)}" ${currentStatus(item).id === status.id ? 'selected' : ''}>${escapeHtml(status.label)}</option>`).join('')
}

function openDetail(item) {
  if (!item) return
  renderDetail(item)
  dialog.showModal()
  document.querySelector('#close-dialog').focus()
}

function setup() {
  document.querySelector('#audit-date').textContent = roadmap.metadata?.baseline || 'Baseline date not recorded'
  document.querySelector('#source-note').textContent = roadmap.metadata?.title || 'Internal planning view'
  fillFilters()
  renderGates()
  renderPhases()
  renderBoard()
  updateSaveState()
  search.addEventListener('input', renderBoard)
  filter.addEventListener('change', renderBoard)
  dialogStatus.addEventListener('change', () => selectedItem && setStatus(selectedItem.id, dialogStatus.value))
  document.querySelector('#close-dialog').addEventListener('click', () => dialog.close())
  dialog.addEventListener('close', () => {
    const card = selectedItem && board.querySelector(`[data-item="${CSS.escape(selectedItem.id)}"]`)
    if (card) card.focus()
    else search.focus()
  })
  dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close() })
  document.querySelector('#reset').addEventListener('click', () => {
    overrides = {}
    try { localStorage.removeItem(STORAGE_KEY) } catch { persistentStorage = false }
    updateSaveState()
    renderBoard()
    if (selectedItem) renderDetail(selectedItem)
  })
  document.querySelector('#export').addEventListener('click', () => {
    const payload = {
      ...roadmap,
      items: items.map(item => ({ ...item, currentStatus: currentStatus(item).id })),
      statusOverrides: { ...overrides },
      exportedAt: new Date().toISOString(),
    }
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'jarwiz-beta-roadmap.json'
    link.click()
    URL.revokeObjectURL(url)
  })
}

function updateSaveState() {
  const status = document.querySelector('#save-state')
  status.textContent = persistentStorage ? 'Changes saved in this browser only' : 'Changes kept in this tab only; browser storage is unavailable'
  status.classList.toggle('is-dirty', Object.keys(overrides).length > 0)
}

setup()
