import { defineConfig } from 'vite'

// Project is served from https://raagulmanoharan.github.io/Folio/,
// so assets must be requested under the /Folio/ base path in production.
// Locally (`npm run dev`) the base is '/', so hot-reload just works.
export default defineConfig({
  base: process.env.NODE_ENV === 'production' ? '/Folio/' : '/',
})
