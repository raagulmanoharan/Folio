import { defineConfig } from 'vite'

// Served from the custom domain https://raagulmanoharan.com/ (GitHub Pages),
// so assets are requested from the site root. The old project-page base
// (/Folio/) is no longer needed now that a custom apex domain is configured.
export default defineConfig({
  base: '/',
})
