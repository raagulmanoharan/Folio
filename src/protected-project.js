import './portfolio-theme.js'
import './protected-project.css'
import { unlockCase, restoreCase } from './case-crypto.js'

const slug = document.body.dataset.protectedProject
const main = document.querySelector('main')
const form = document.querySelector('[data-case-unlock]')
const error = document.querySelector('#project-access-error')
const show = html => {
  main.innerHTML = html.replaceAll('%BASE_URL%', import.meta.env.BASE_URL).replaceAll('/foliostaging/', import.meta.env.BASE_URL)
  main.dataset.unlocked = 'true'
  if (slug === 'jarwiz') import('./jarwiz-portfolio.js')
  // The legacy related-reading URL now leads to the full Reflections page.
  main.querySelectorAll('a[href*="#/reflections/"]').forEach(link => {
    const article = link.href.split('#/reflections/')[1]
    link.href = `${import.meta.env.BASE_URL}reflections/#${article}`
  })
}
restoreCase(slug).then(html => { if (html) show(html) })
form.addEventListener('submit', async event => {
  event.preventDefault()
  const button = form.querySelector('button')
  const input = form.querySelector('input')
  if (button.disabled) return
  button.disabled = true
  error.textContent = ''
  try { show(await unlockCase(slug, input.value)) }
  catch (reason) {
    error.textContent = reason.name === 'OperationError' ? 'That password didn’t match. Try again.' : 'Couldn’t open this case study. Please try again.'
    input.setAttribute('aria-invalid', 'true')
    input.focus()
    input.select()
    button.disabled = false
  }
})
