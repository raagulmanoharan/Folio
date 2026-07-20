# Folio

A minimal [Vite](https://vitejs.dev) site deployed to GitHub Pages.

## Develop (with hot reload)

```bash
npm install
npm run dev
```

Open the printed `http://localhost:5173` URL. Editing any file under `src/`
or `index.html` updates the page instantly — no manual refresh.

## Build & preview

```bash
npm run build    # outputs static files to ./dist
npm run preview  # serve the production build locally
```

## Deploy

Every push to `main` triggers `.github/workflows/deploy.yml`, which builds
the site and publishes it to GitHub Pages at
<https://raagulmanoharan.github.io/Folio/>.

> One-time setup: in the repo's **Settings → Pages**, set **Source** to
> **GitHub Actions**.
