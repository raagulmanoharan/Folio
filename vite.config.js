import { defineConfig } from 'vite'
import { fileURLToPath } from 'node:url'
import { readFileSync } from 'node:fs'
import { contentPlugin } from './lib/content-vite.js'

// Served from the custom domain https://raagulmanoharan.com/ (GitHub Pages),
// so assets are requested from the site root. The old project-page base
// (/Folio/) is no longer needed now that a custom apex domain is configured.
export default defineConfig({
  base: '/',
  plugins: [contentPlugin(fileURLToPath(new URL('.', import.meta.url))), {
    name: 'shared-project-header',
    transformIndexHtml: {
      order: 'pre',
      handler(html) {
        if (!html.includes('<!-- shared-site-header -->')) return html
        const home = readFileSync(new URL('./index.html', import.meta.url), 'utf8')
        const header = home.split('<body>')[1].split('<main>')[0].replace(
          /<header class="site-header"[\s\S]*?<\/header>/,
          `<header class="site-header" data-header>
            <nav class="header-inner" aria-label="Project navigation">
              <a class="header-link case-header-back" href="/#work" aria-label="Back to selected works"><span aria-hidden="true">&#8592;</span></a>
              <span class="header-link header-link--center case-header-title">Raagul Manoharan / Selected Works</span>
            </nav>
          </header>`,
        )
        return html.replace('<!-- shared-site-header -->', header)
      },
    },
  }],
  build: {
    rollupOptions: {
      input: Object.fromEntries([
        'index.html',
      ].map((path) => [path, fileURLToPath(new URL(path, import.meta.url))])),
    },
  },
})
