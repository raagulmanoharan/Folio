# Folio

Personal portfolio for Raagul Manoharan — a UX designer based in Bengaluru.
Built with [Next.js](https://nextjs.org/) (App Router) and Tailwind CSS,
deployed as a static site to GitHub Pages.

## Develop

```bash
npm install
npm run dev
```

Open http://localhost:3000. Edits hot-reload.

## Build

```bash
npm run build
```

Produces a fully static site in `./out/` (via `output: "export"`).

## Content

Copy lives in [`content/`](content/) — edit these to update the site:

- `profile.ts` — hero, dossier, bio
- `work.ts` — projects
- `writing.ts` — writing log
- `contact.ts` — contact links

## Deploy

Pushing to `main` triggers [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml),
which builds the static export and publishes it to GitHub Pages.

**One-time setup:** in the repo's **Settings → Pages**, set **Source** to
**GitHub Actions**.
