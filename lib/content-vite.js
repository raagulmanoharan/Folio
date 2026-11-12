import { readdirSync, readFileSync, mkdirSync, writeFileSync, existsSync, renameSync, rmSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { validateContent, renderPage, routeFor, escapeHtml, TYPES } from './content.js'
export function contentPlugin(root) {
 let server
 function read() {
  const entries=[]
  for(const type of TYPES) {
   const directory=resolve(root,'content',type)
   if(!existsSync(directory)) continue
   for(const name of readdirSync(directory).filter(n=>n.endsWith('.json'))) {
    const source=JSON.parse(readFileSync(resolve(directory,name),'utf8'))
    const c=validateContent(source)
    if(c.type!==type || name!==c.slug+'.json') throw Error(`Content identity does not match file: ${type}/${name}`)
    if(source.status!=='published') continue
    if(existsSync(resolve(root,routeFor(c).slice(1)))) throw Error(`Content route conflicts with an existing page: ${routeFor(c)}`)
    entries.push(c)
   }
  }
  return entries
 }
 function listing(entries,type) {
  const selected=entries.filter(c=>!type||c.type===type)
  return `<section class="content-list" aria-label="Published content"><h2 class="case-heading">${type?{'case-study':'Case studies',blog:'Writing','side-project':'Side projects'}[type]:'Latest additions'}</h2>${selected.map(c=>`<article><p class="case-subtext">${escapeHtml(c.type)}</p><h3 class="case-subheading"><a href="${routeFor(c)}">${escapeHtml(c.title)} ↗</a></h3><p class="case-body-text">${escapeHtml(c.summary)}</p></article>`).join('') || '<p class="case-body-text">Nothing published yet.</p>'}</section>`
 }
 function collection(type,entries) {
  return `<!doctype html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(type)} — Raagul Manoharan</title></head><body class="case-page"><!-- shared-site-header --><main class="case-main"><div class="case-content">${listing(entries,type)}</div></main><footer class="site-footer"></footer><script type="module" src="/src/project.js"></script></body></html>`
 }
 const indexRoute=type=>({'case-study':'/projects/index.html',blog:'/writing/index.html','side-project':'/side-projects/index.html'}[type])
 return {
  name:'folio-content',
  config(config) {
   const entries=read(),input={...config.build?.rollupOptions?.input}
   for(const [route,html] of [...entries.map(c=>[routeFor(c),renderPage(c,{moreProject:entries.find(other=>other.type==='case-study' && routeFor(other)!==routeFor(c))})]),...TYPES.map(type=>[indexRoute(type),collection(type,entries)])]) {
    const file=resolve(root,'.generated-content'+route)
    mkdirSync(dirname(file),{recursive:true});writeFileSync(file,html)
    input['content:'+route]=file
   }
   return {build:{rollupOptions:{input}}}
  },
  configureServer(s) {
   server=s
   server.watcher.add(resolve(root,'content'))
   server.watcher.on('all',(_,file)=>{if(file.startsWith(resolve(root,'content')+'/'))server.ws.send({type:'full-reload'})})
   server.middlewares.use(async(req,res,next)=>{
    const path=(req.url||'').split('?')[0]
    try {
     const entries=read(),c=entries.find(c=>routeFor(c)===path),type=TYPES.find(type=>indexRoute(type)===path)
     if(!c&&!type) return next()
     res.setHeader('Content-Type','text/html;charset=utf-8')
     res.end(await server.transformIndexHtml(path,c?renderPage(c,{moreProject:entries.find(other=>other.type==='case-study' && routeFor(other)!==routeFor(c))}):collection(type,entries)))
    }catch(e){next(e)}
   })
  },
  transformIndexHtml:{order:'pre',handler(html,ctx){
   if(ctx.path!=='/index.html' && ctx.path!=='/')return html
   const entries=read().filter(c=>!html.includes(`href="${routeFor(c)}"`))
   return entries.length?html.replace('</main>',listing(entries)+'</main>'):html
  }},
  writeBundle(options) {
   const output=resolve(root,options.dir || 'dist'),generated=resolve(output,'.generated-content')
   function move(directory,relative='') {
    for(const entry of readdirSync(directory,{withFileTypes:true})) {
     const from=resolve(directory,entry.name),to=resolve(output,relative,entry.name)
     if(entry.isDirectory())move(from,relative?relative+'/'+entry.name:entry.name)
     else {mkdirSync(dirname(to),{recursive:true});renameSync(from,to)}
    }
   }
   // Vite emits HTML in its own late generateBundle hook, so relocate after writing.
   if(existsSync(generated)){move(generated);rmSync(generated,{recursive:true})}
  }
 }
}
