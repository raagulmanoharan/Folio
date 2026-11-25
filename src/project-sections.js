for (const surface of document.querySelectorAll('[data-side-video]')) {
  surface.querySelector('[data-side-video-play]').addEventListener('click', () => {
    const frame = surface.querySelector('template').content.cloneNode(true)
    surface.replaceChildren(frame)
    surface.querySelector('iframe').focus()
  }, { once: true })
}
