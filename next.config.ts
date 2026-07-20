import type { NextConfig } from "next";

// When deploying to GitHub Pages as a project site the app is served from
// https://<user>.github.io/<repo>/, so it needs a base path. The deploy
// workflow sets NEXT_PUBLIC_BASE_PATH; local `next dev` leaves it empty.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const config: NextConfig = {
  reactStrictMode: true,
  // Emit a fully static site into ./out for GitHub Pages.
  output: "export",
  // GitHub Pages can't run the Next.js image optimizer.
  images: { unoptimized: true },
  // Serve every route as a directory (/foo/ -> /foo/index.html).
  trailingSlash: true,
  basePath,
  assetPrefix: basePath || undefined,
};

export default config;
