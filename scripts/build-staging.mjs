import { execFileSync } from 'node:child_process'
import { readdir, readFile, writeFile, rm } from 'node:fs/promises'
import { join } from 'node:path'

// Publish this output only to the separate foliostaging repository.
const base = '/foliostaging/'
execFileSync('npm', ['run', 'build', '--', '--base', base, '--outDir', 'dist-staging'], { stdio: 'inherit' })
async function rewriteHtml(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name)
    if (entry.isDirectory()) await rewriteHtml(path)
    else if (entry.name.endsWith('.html')) {
      const html = await readFile(path, 'utf8')
      // Vite rewrites bundled assets; also scope public assets and navigation.
      await writeFile(path, html.replace(/\b(href|src)="\/(?!\/|foliostaging\/)/g, `$1="${base}`))
    }
  }
}
await rewriteHtml('dist-staging')
// Never copy the live custom domain into the staging Pages site.
await rm('dist-staging/CNAME', { force: true })
await writeFile('dist-staging/.nojekyll', '')
