import { writeFile, unlink, readFile, stat } from 'node:fs/promises'
import { execFileSync } from 'node:child_process'
import { createServer } from 'node:http'
import { resolve, extname } from 'node:path'
import assert from 'node:assert/strict'
import { chromium } from '../services/content-api/node_modules/playwright-core/index.mjs'
const root=resolve(import.meta.dirname,'..'), fixtures=[]
let server,browser
const runBuild=()=>execFileSync('npm',['run','build'],{cwd:root,stdio:'pipe'})
try {
 for(const [type,slug,status] of [['blog','content-smoke-blog','published'],['side-project','content-smoke-side','published'],['blog','content-smoke-draft','draft']]) {
  const file=resolve(root,`content/${type}/${slug}.json`)
  await writeFile(file,JSON.stringify({type,slug,title:'Content browser test',summary:'Generated content integration test.',status,blocks:[{type:'hero',text:'An opening thought.'},{type:'heading',text:'A section heading'},{type:'paragraph',text:'A safe paragraph with <script>literal text</script>.'},{type:'image',src:'/work/placeholder-overview.svg',alt:'Browser test image',caption:'An image caption.'}]}),{flag:'wx'})
  fixtures.push(file)
 }
 runBuild()
 await assert.rejects(stat(resolve(root,'dist/writing/content-smoke-draft.html')))
 server=createServer(async(req,res)=>{
  try {
   const pathname=new URL(req.url,'http://localhost').pathname
   const file=resolve(root,'dist','.'+pathname+(pathname.endsWith('/')?'index.html':''))
   if(!file.startsWith(resolve(root,'dist')+'/')){res.writeHead(403).end();return}
   const data=await readFile(file)
   res.setHeader('Content-Type',({'.html':'text/html','.js':'application/javascript','.css':'text/css','.svg':'image/svg+xml','.png':'image/png','.woff2':'font/woff2'})[extname(file)]||'application/octet-stream')
   res.end(data)
  }catch{res.writeHead(404).end('Not found')}
 })
 await new Promise(r=>server.listen(0,'127.0.0.1',r))
 const origin='http://127.0.0.1:'+server.address().port
 browser=await chromium.launch({executablePath:process.env.BROWSER_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox']})
 const page=await browser.newPage({viewport:{width:1440,height:1000}}), errors=[]
 page.on('pageerror',e=>errors.push(e.message))
 let response=await page.goto(origin+'/writing/content-smoke-blog.html');assert.equal(response.status(),200)
 await page.locator('.case-intro h1').waitFor();assert.equal(await page.locator('.case-intro h1').textContent(),'Content browser test')
 assert.equal(await page.locator('.case-content script').count(),0)
 assert.ok(await page.locator('.case-body-text').last().textContent().then(t=>t.includes('<script>literal text</script>')))
 assert.equal(await page.locator('.case-content').evaluate(e=>getComputedStyle(e).paddingLeft),'32px')
 await page.screenshot({path:'/tmp/folio-content-desktop.png',fullPage:true})
 await page.setViewportSize({width:390,height:844})
 assert.equal(await page.locator('body').evaluate(e=>getComputedStyle(e,'::before').display),'none')
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true)
 await page.screenshot({path:'/tmp/folio-content-mobile.png',fullPage:true})
 response=await page.goto(origin+'/side-projects/content-smoke-side.html');assert.equal(response.status(),200)
 response=await page.goto(origin+'/writing/content-smoke-draft.html');assert.equal(response.status(),404)
 await page.goto(origin+'/')
 assert.equal(await page.locator('a[href="/writing/content-smoke-blog.html"]').count(),1)
 await page.goto(origin+'/writing/index.html')
 assert.equal(await page.locator('a[href="/writing/content-smoke-blog.html"]').count(),1)
 assert.deepEqual(errors,[])
 console.log('PASS generated blog and side-project pages, collections, homepage discovery, draft exclusion, HTML escaping, mobile gutters, overflow, and browser runtime.')
 console.log('Screenshots: /tmp/folio-content-desktop.png and /tmp/folio-content-mobile.png')
}finally{
 await browser?.close()
 if(server)await new Promise(r=>server.close(r))
 for(const file of fixtures)await unlink(file)
 runBuild()
}
