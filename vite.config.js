import { defineConfig } from 'vite'

// Served from the custom domain https://raagulmanoharan.com/ (GitHub Pages),
// so assets are requested from the site root. The old project-page base
// (/Folio/) is no longer needed now that a custom apex domain is configured.
export default defineConfig({
  base: '/',
  build: {
    rollupOptions: {
      input: { wurdleProject: 'projects/wurdle.html', fluidProject: 'projects/fluid-innovation.html', salesforceProject: 'projects/salesforce-referral-marketing.html', vivaProject: 'projects/viva-connections.html', reflections: 'reflections/index.html', jarwizPortfolioAlias: 'projects/jarwiz.html', jarwizLayoutReview: 'jarwiz/closed-beta/layout-review/index.html', main: 'index.html', jarwiz: 'case-studies/jarwiz/index.html', jarwizStage1: 'case-studies/jarwiz/stage-1/index.html', jarwizProductReview: 'case-studies/jarwiz/product-ui-review/index.html', jarwizUiRefinement: 'case-studies/jarwiz/ui-refinement/index.html', jarwizStoryReview: 'case-studies/jarwiz/story-review/index.html', jarwizBeta: 'jarwiz/closed-beta/index.html', jarwizRoadmap: 'jarwiz/roadmap/index.html' },
    },
  },
})
