# Folio content service

The site remains a static Vite/GitHub Pages site. The separate Cloudflare Worker exposes an authenticated HTTP API and remote MCP endpoint. A local stdio MCP adapter is included for agents that run commands.

## Design and workflow

1. An agent submits a validated JSON document with reusable content blocks.
2. The service stores it on the `content-drafts` branch of `raagulmanoharan/Folio`. Draft writes never target `main`.
3. `preview_draft` issues a signed browser link that lasts one hour. Editing the document invalidates older links. No account or token is needed to open that specific signed link; treat it as a temporary share link.
4. A separate publisher key can propose publication for a specific reviewed revision. The service copies only that document and its referenced uploaded images into a new branch and opens a PR against `main`.
5. A human reviews and merges the PR. The existing production Pages workflow builds and deploys it. The API does not merge PRs or deploy production.

JSON blocks, rather than raw HTML or arbitrary Markdown, preserve the five agreed typography styles and allow images and metrics to remain structured. All agent-provided text is escaped. Documents are limited to 500 KB and 100 blocks. There is no database, destructive delete tool, OAuth server, or automatic production publication.

Published case studies render at `/projects/<slug>.html`, blog posts at `/writing/<slug>.html`, and side projects at `/side-projects/<slug>.html`. Collections are at `/projects/index.html`, `/writing/index.html`, and `/side-projects/index.html`. Published additions also appear on the home page. Draft documents are excluded from site builds, including the shared staging build; use the signed API preview for draft review.

The three existing placeholder case studies have moved to `content/case-study/*.json`. Their routes remain the same. Those are layout drafts with explicitly illustrative metrics, not completed case studies.

## Local setup

Use Node 24 or newer for development and the test runner. The Vite production build also remains compatible with the existing CI Node 20 workflow.

```sh
cd /workspace/Folio
npm ci
npm --prefix services/content-api ci
npm test
npm run build
npm run dev
```

Generated HTML is transient under ignored `.generated-content/`. Edit `content/`, not generated HTML. JSON files must match their directory type and slug. Only files with `status: "published"` enter the site build. `draft` is the default for API writes.

### Configure a local Worker

Copy `services/content-api/.dev.vars.example` to `.dev.vars` in the same directory, then fill in values locally. `.dev.vars` is ignored by Git. Use a test GitHub repository when checking writes. Do not paste tokens into chat, commit them, or put GitHub credentials into the browser or MCP configuration.

```sh
cd services/content-api
npm run dev
```

Wrangler prints its local address (normally `http://127.0.0.1:8787`). `GET /health` is a liveness check only. An authenticated `GET /v1/content` verifies actual GitHub access. For restricted cloud workspaces, use `XDG_CONFIG_HOME=/tmp/folio-xdg WRANGLER_LOG_PATH=/tmp/folio-wrangler.log` when the normal user config directory is not writable.

## Cloudflare setup (first deployment)

1. Create a Cloudflare account at https://dash.cloudflare.com/sign-up. Open **Workers & Pages** and finish the account setup. A custom domain is optional; the initial API can use `workers.dev`.
2. Install dependencies as above. From `services/content-api`, run `npx wrangler login` on your own machine to authorize Cloudflare. Alternatively, CI can use a Cloudflare API token with permission to edit Workers and the account ID, supplied securely through that system's secrets. No Cloudflare credential is included in this repo.
3. Create a fine-grained GitHub personal access token for **only** `raagulmanoharan/Folio` (or install a GitHub App and supply/rotate its installation token externally). Required repository permissions: **Contents: read/write**, **Pull requests: read/write**, and metadata read. Set an appropriate expiry and rotate it before expiration. The chat's GitHub connection is not automatically available to a deployed Worker.
4. Check non-secret settings in `wrangler.jsonc`. Keep `FOLIO_DRAFT_BRANCH` different from `FOLIO_BASE_BRANCH`. `FOLIO_SITE_URL` supplies the origin for existing site-relative images in previews.
5. Generate three distinct random secrets, each at least 32 characters: `FOLIO_API_KEY` for writing agents, `FOLIO_PUBLISH_KEY` for publication proposals, and `FOLIO_PREVIEW_SECRET` for signing temporary preview links. A password manager or `openssl rand -hex 32` can generate each one. Store them securely.
6. Set secrets using Wrangler's secure prompts:

```sh
npx wrangler secret put FOLIO_GITHUB_TOKEN
npx wrangler secret put FOLIO_API_KEY
npx wrangler secret put FOLIO_PUBLISH_KEY
npx wrangler secret put FOLIO_PREVIEW_SECRET
npm run deploy
```

7. Record the HTTPS Worker URL. Verify `/health`, then make an authenticated `/v1/content` request. Create a draft in a test repository first, preview it, and test the review PR flow before pointing the Worker at production. Publication requires this implementation to be merged into the source repository first so its build knows how to render content files.
8. Connect an agent as described below. Give ordinary writing agents only the draft key. Keep the publisher key with the person or agent responsible for review. Revoking/rotating the draft key cuts off those clients; rotating the preview secret invalidates all signed preview links.

The service is ready to deploy, but it is not an already-hosted endpoint. Cloudflare account creation, credentials, and actual deployment are required. No paid plan is assumed; confirm Cloudflare's current quotas for your usage. The service has no per-agent identity or application-level rate limiter in this version; use Cloudflare rate limiting if exposing it broadly and separate deployments/keys if you need stronger client isolation.

## Content format

See runnable request bodies in `examples/new-case-study.json`, `examples/new-blog-post.json`, and `examples/new-side-project.json`. Required document fields:

| Field | Meaning |
|---|---|
| `type` | `case-study`, `blog`, or `side-project` |
| `slug` | Lowercase URL identifier, max 80 characters |
| `title` | Page title, max 160 characters |
| `summary` | Listing and search description, max 600 characters |
| `blocks` | One to 100 content blocks |

Optional fields are `role`, `year` (up to four characters), and `link` (one HTTPS or site-relative link). The API always forces draft status, regardless of what an agent submits.

| Block | Fields / appearance |
|---|---|
| `hero` | `text`; opening text in the agreed heading size |
| `heading` | `text`; section heading |
| `subheading` | `text`; smaller subsection label |
| `paragraph` | `text`; body copy, newlines supported |
| `image` | `src`, required descriptive `alt`, optional `caption` |
| `metrics` | Exactly three `items`, each with `value`, `label`, `note` |

Metric notes should provide evidence or explicitly say the value is a placeholder. Image captions use subtext. Content blocks are spaced 32px apart, inside the 32px content padding. Relative image paths must resolve to actual site assets; the service does not fetch arbitrary image URLs or verify external image availability. Upload images through the service to bundle new images into the publication PR. Uploads accept PNG, JPEG, GIF, and WebP up to 4 MiB; SVG uploads are intentionally excluded. Unreferenced draft uploads are retained on the draft branch and can be cleaned up manually in Git.

## HTTP API

All `/v1/content`, `/v1/images`, `/v1/schema`, `/v1/openapi`, and `/mcp` requests require `Authorization: Bearer <key>`. JSON writes require `Content-Type: application/json`. OpenAPI 3.1 is available in `services/content-api/openapi.json` and at authenticated `GET /v1/openapi`.

| Method | Path | Behavior |
|---|---|---|
| GET | `/v1/content?type=blog` | List type/slug/revision entries from draft branch |
| GET | `/v1/content/{type}/{slug}` | Read content and revision |
| POST | `/v1/content` | Create a draft; existing slugs conflict |
| PUT | `/v1/content/{type}/{slug}` | Replace using `{ "content": {...}, "revision": "..." }` |
| POST | `/v1/images` | `{ "base64": "..." }`; returns `src` for an image block |
| POST | `/v1/content/{type}/{slug}/preview` | Returns expiring browser preview URL |
| POST | `/v1/content/{type}/{slug}/publish` | Publisher key + `{ "revision": "..." }`; opens review PR |

A `409` means another edit changed the revision; reread and reconcile. Missing update revisions return `428`. A `403` on publication means the draft key cannot perform that action. The GitHub draft branch is created on first write, based on the configured publication branch; reads before it exists can return an empty list or 404. The draft branch retains its own revisions after publication; it is not automatically synchronized with later manual main-branch edits. For content edited outside the API, reconcile the draft branch in Git before continuing API edits.

Example, using shell variables already supplied by your secret manager:

```sh
curl --fail-with-body "$FOLIO_API_URL/v1/content" \
  -H "Authorization: Bearer $FOLIO_API_KEY" \
  -H 'Content-Type: application/json' \
  --data-binary @examples/new-case-study.json

curl --fail-with-body -X POST \
  "$FOLIO_API_URL/v1/content/case-study/a-better-workflow/preview" \
  -H "Authorization: Bearer $FOLIO_API_KEY"
```

## MCP clients

### Remote MCP

Use `https://<your-worker>/mcp` with **Streamable HTTP** transport and `Authorization: Bearer <draft-key>`. The endpoint is stateless. Clients must support custom bearer headers; OAuth-only clients cannot connect directly to this version. Browser-origin calls are restricted to the API's own origin; no wildcard CORS access is granted. A local stdio adapter is available for command-based MCP clients.

### Local stdio adapter

Run `node /absolute/path/to/Folio/services/content-api/mcp.mjs` with environment variables `FOLIO_API_URL` and `FOLIO_API_KEY`. The URL must be HTTPS, except for loopback development addresses. Supply keys via your client's secret manager/environment; example configuration deliberately omits secrets:

```json
{
  "mcpServers": {
    "folio": {
      "command": "node",
      "args": ["/absolute/path/to/Folio/services/content-api/mcp.mjs"],
      "env": { "FOLIO_API_URL": "https://your-worker.workers.dev" }
    }
  }
}
```

Expose `FOLIO_API_KEY` to the subprocess using your client's supported secure mechanism. Optional `FOLIO_PUBLISH_KEY` enables the publication tool in the stdio adapter; omit it for writing-only agents. For remote MCP, the key used in the request determines whether publication is offered.

Tools: `content_schema`, `list_content`, `get_content`, `create_draft`, `update_draft`, `upload_image`, `preview_draft`, and optionally `publish_content`. All clients share the same validation, revision rules, preview signing, and review workflow.

Suggested agent instruction:

> Create or update a Folio draft. Use the schema tools and structured content blocks. Upload images and include descriptive alt text. Do not invent measured results. Read before updating and use the latest revision. Return a preview link for review. Do not propose publication unless explicitly asked.

## Verification

`npm test` covers content validation, escaping, draft authentication/concurrency, publisher separation, preview tampering/expiry, image checks, GitHub write contracts, and an official MCP client handshake with create/read/preview calls. `npm run test:site` builds sample published blog/side-project content, verifies draft exclusion, and checks desktop/mobile rendering with Playwright and system Chromium. Configure `BROWSER_PATH` if Chromium is elsewhere. It cleans up its fixtures and rebuilds the ordinary site afterward.

From `services/content-api`, `npx wrangler deploy --dry-run` validates bundling without deploying. Local mock tests do not establish real GitHub write authorization, a Cloudflare deployment, or a live production publication. Those must be tested with your credentials in a test repository after setup.
