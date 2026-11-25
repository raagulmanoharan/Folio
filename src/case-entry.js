import { unlockCase } from './case-crypto.js'

const cards = [...document.querySelectorAll('[data-case-card]')]
const cursor = document.querySelector('[data-cursor]')
const reduced = matchMedia('(prefers-reduced-motion: reduce)')
const lock = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path class="lock-shackle" d="M7 11V7a5 5 0 0 1 10 0v4"/><rect x="5" y="11" width="14" height="11" rx="3"/><path d="M12 15v3"/></svg>'

if (cards.length) {
  if (cursor) cursor.insertAdjacentHTML('beforeend', `<span class="cursor-case-label">Open case study<span aria-hidden="true">↗</span></span><span class="cursor-case-lock">${lock}</span>`)
  const dialog = document.createElement('dialog')
  dialog.className = 'password-cursor'
  dialog.setAttribute('aria-label', 'Unlock case study')
  dialog.innerHTML = `<form novalidate><input id="case-password" type="password" placeholder="Password" aria-label="Password" autocomplete="current-password" aria-describedby="password-error" required><button type="submit" aria-label="Unlock case study"><span aria-hidden="true">→</span></button></form><p class="password-error" id="password-error" role="alert"></p><span class="password-lock">${lock}</span>`
  document.body.append(dialog)
  const form = dialog.querySelector('form')
  const input = dialog.querySelector('input')
  const submit = dialog.querySelector('[type="submit"]')
  const error = dialog.querySelector('.password-error')
  let target = null
  let trigger = null
  let busy = false
  let revision = 0

  const resetCursor = () => cursor?.classList.remove('is-case', 'is-case-locked')
  document.addEventListener('pointermove', event => {
    if (dialog.open) return
    const card = event.target.closest('[data-case-card]')
    const secondary = event.target.closest('.work-links')
    cursor?.classList.toggle('is-case', !!card && !secondary)
    cursor?.classList.toggle('is-case-locked', !!card?.querySelector('[data-protected-case]') && !secondary)
  }, { passive: true })
  window.addEventListener('pagehide', resetCursor)
  window.addEventListener('pageshow', () => {
    resetCursor()
    if (dialog.open) dialog.close()
  })

  const close = () => dialog.close()
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return
    const rect = dialog.getBoundingClientRect()
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) close()
  })
  dialog.addEventListener('close', () => {
    revision++
    dialog.className = 'password-cursor'
    cursor?.classList.remove('is-password-open')
    form.reset()
    busy = false
    trigger?.focus({ preventScroll: true })
  })

  cards.forEach(card => {
    const link = card.querySelector('[data-case-link]')
    if (!link.dataset.protectedCase) return
    link.insertAdjacentHTML('beforeend', `<span class="case-inline-lock">${lock}</span>`)
    link.setAttribute('aria-haspopup', 'dialog')
    link.addEventListener('click', event => {
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button) return
      event.preventDefault()
      target = link
      trigger = link
      const rect = link.getBoundingClientRect()
      const x = event.detail ? event.clientX : rect.left + rect.width / 2
      const y = event.detail ? event.clientY : rect.top + rect.height / 2
      const usesCursor = matchMedia('(pointer: fine)').matches && !reduced.matches && cursor
      const left = event.detail ? (usesCursor ? cursor.getBoundingClientRect().left : x - 7) : rect.left
      const finalX = Math.max(16, Math.min(innerWidth - 124 - 16, left))
      const finalY = Math.max(34, Math.min(innerHeight - 64, y))
      dialog.style.setProperty('--entry-x', `${left}px`)
      dialog.style.setProperty('--entry-y', `${y}px`)
      error.textContent = ''
      input.removeAttribute('aria-invalid')
      submit.disabled = false
      cursor?.classList.add('is-password-open')
      dialog.showModal()
      // Start at the cursor's lock shape, then grow into the focused form.
      void dialog.offsetWidth
      requestAnimationFrame(() => {
        if (!dialog.open) return
        dialog.style.setProperty('--entry-x', `${finalX}px`)
        dialog.style.setProperty('--entry-y', `${finalY}px`)
        dialog.classList.add('is-expanded')
      })
      input.focus({ preventScroll: true })
    })
  })

  input.addEventListener('input', () => {
    input.removeAttribute('aria-invalid')
    error.textContent = ''
  })

  form.addEventListener('submit', async event => {
    event.preventDefault()
    if (busy || !target) return
    if (!input.value) { error.textContent = 'Enter a password.'; input.focus(); return }
    const id = ++revision
    const link = target
    busy = true
    submit.disabled = true
    error.textContent = ''
    try {
      await unlockCase(link.dataset.protectedCase, input.value)
      if (id !== revision || !dialog.open) return
      input.value = ''
      dialog.classList.remove('is-expanded')
      dialog.classList.add('is-unlocking')
      setTimeout(() => {
        if (id !== revision || !dialog.open) return
        dialog.classList.add('is-unlocked')
        setTimeout(() => {
          if (id === revision && dialog.open) location.assign(link.href)
        }, reduced.matches ? 0 : 480)
      }, reduced.matches ? 0 : 360)
    } catch (reason) {
      if (id !== revision || !dialog.open) return
      error.textContent = reason.name === 'OperationError' ? 'Incorrect password. Try again.' : 'Couldn’t open this case study. Please try again.'
      input.setAttribute('aria-invalid', 'true')
      input.focus()
      input.select()
      busy = false
      submit.disabled = false
    }
  })
}
