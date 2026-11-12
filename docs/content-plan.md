# Content API implementation plan

1. Keep GitHub Pages and the existing site styles; move case study content into validated, versioned files. Generate case study, blog, and side-project routes and collection pages during Vite builds. Exclude drafts.
2. Build a Cloudflare Worker HTTP API backed by a separate Git branch. Require authentication, safe structured blocks, bounded uploads, and revisions on edits.
3. Add expiring, revision-bound previews that render without publishing. Bind uploaded-image access to the same signed draft preview.
4. Require a separate publisher capability to create a review pull request containing one document and its images. Never merge or update the production branch from the service.
5. Expose the same operations through the official MCP SDK, using remote Streamable HTTP and a local stdio adapter.
6. Test API failures, concurrency, previews, GitHub contracts, official MCP transports, browser rendering, draft exclusion, and Worker bundling. Document first-time Cloudflare setup and client configuration.

Deployment prerequisites: a Cloudflare account, Worker authorization, and a repository-scoped GitHub credential. These are not supplied by the site's existing Pages deployment or automatically inherited from the chat.
