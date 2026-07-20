import './style.css'

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
