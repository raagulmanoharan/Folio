import test from 'node:test'
import assert from 'node:assert/strict'
import {validateContent,renderPage,safeUrl,contentPath} from '../lib/content.js'
import {createHandler} from '../services/content-api/worker.js'
import {GitHubStore} from '../services/content-api/github.js'
const draft={type:'blog',slug:'a-new-idea',title:'A new idea',summary:'A short summary.',blocks:[{type:'hero',text:'An opening thought.'},{type:'paragraph',text:'The full story.'}]}
const env={FOLIO_API_KEY:'draft-key-'.padEnd(40,'x'),FOLIO_PUBLISH_KEY:'publisher-key-'.padEnd(40,'y'),FOLIO_PREVIEW_SECRET:'preview-secret-'.padEnd(40,'z')}
export class MemoryStore {
 constructor(){this.items=new Map();this.counter=0;this.proposals=[];this.images=new Map()}
 async list(type){return [...this.items.values()].filter(x=>!type||x.content.type===type).map(x=>({type:x.content.type,slug:x.content.slug,revision:x.revision}))}
 async read(type,slug){const v=this.items.get(contentPath(type,slug));if(!v){const e=Error('Not found');e.status=404;throw e}return structuredClone(v)}
 async write(c,revision){const key=contentPath(c.type,c.slug),old=this.items.get(key);if(old?.revision!==revision){const {ContentError}=await import('../lib/content.js');throw new ContentError('Revision conflict.',409)}const item={content:structuredClone(c),revision:String(++this.counter)};this.items.set(key,item);return structuredClone(item)}
 async propose(c,revision){const current=await this.read(c.type,c.slug);if(current.revision!==revision){const {ContentError}=await import('../lib/content.js');throw new ContentError('Revision conflict.',409)}this.proposals.push(c);return {status:'awaiting-review',pullRequest:'https://github.com/example/site/pull/1'}}
 async upload(base64,extension){const src='/uploads/example.'+extension;this.images.set(src,{content:base64});return {src}}
 async image(path){return this.images.get(path)}
}
function api(){const store=new MemoryStore(),handle=createHandler(()=>store);return {store,request:async(path,method='GET',body,key=env.FOLIO_API_KEY)=>handle(new Request('https://api.example.com'+path,{method,headers:{...(key?{Authorization:'Bearer '+key}:{}),'Content-Type':'application/json'},...(body===undefined?{}:{body:JSON.stringify(body)})}),env)}}
test('schema rejects traversal, unsafe URLs, unsupported blocks, and incomplete metrics',()=>{
 for(const slug of ['../main','a/b','Uppercase','','index'])assert.throws(()=>validateContent({...draft,slug}))
 for(const url of ['javascript:alert(1)','//evil.test/a','http://evil.test','https://u:p@evil.test','/../secret'])assert.throws(()=>safeUrl(url))
 assert.throws(()=>validateContent({...draft,blocks:[{type:'raw-html',text:'<script>'}]}))
 assert.throws(()=>validateContent({...draft,blocks:[{type:'metrics',items:[]}]}))
 assert.throws(()=>validateContent({...draft,blocks:[{type:'metrics',items:[null,null,null]}]}),e=>e.status===400)
 assert.equal(validateContent({...draft,status:'published'}).status,'draft')
})
test('rendering escapes HTML, attributes, and script injection',()=>{
 const c={...draft,title:'<script>alert(1)</script>',blocks:[{type:'paragraph',text:'<img src=x onerror=alert(1)>'},{type:'image',src:'/safe.png',alt:'" onload="alert(1)'}]}
 const html=renderPage(c,{preview:true})
 assert.ok(!html.includes('<script>'));assert.ok(html.includes('&lt;script&gt;'));assert.ok(html.includes('&quot; onload=&quot;'));assert.ok(html.includes('noindex,nofollow'))
})
test('draft create/update workflow enforces authentication and optimistic concurrency',async()=>{
 const a=api()
 assert.equal((await a.request('/v1/content','GET',undefined,null)).status,401)
 let r=await a.request('/v1/content','POST',{...draft,status:'published'});assert.equal(r.status,201)
 const created=await r.json();assert.equal(created.content.status,'draft')
 assert.equal((await a.request('/v1/content','POST',draft)).status,409)
 assert.equal((await a.request('/v1/content/blog/a-new-idea','PUT',{content:draft})).status,428)
 r=await a.request('/v1/content/blog/a-new-idea','PUT',{content:{...draft,title:'Updated'},revision:created.revision});assert.equal(r.status,200)
 assert.equal((await a.request('/v1/content/blog/a-new-idea','PUT',{content:draft,revision:created.revision})).status,409)
 assert.equal((await (await a.request('/v1/content')).json()).items.length,1)
})
test('publishing requires a publisher key and the exact reviewed revision',async()=>{
 const a=api(),c=await (await a.request('/v1/content','POST',draft)).json()
 const path='/v1/content/blog/a-new-idea/publish'
 assert.equal((await a.request(path,'POST',{revision:c.revision})).status,403)
 assert.equal((await a.request(path,'POST',{revision:'stale'},env.FOLIO_PUBLISH_KEY)).status,409)
 const r=await a.request(path,'POST',{revision:c.revision},env.FOLIO_PUBLISH_KEY)
 assert.equal(r.status,201);assert.equal((await r.json()).status,'awaiting-review');assert.equal(a.store.proposals.length,1)
})
test('signed previews expire, detect tampering, and stop working after an edit',async()=>{
 const a=api(),c=await(await a.request('/v1/content','POST',draft)).json()
 const link=await(await a.request('/v1/content/blog/a-new-idea/preview','POST')).json()
 const url=new URL(link.url)
 let r=await a.request(url.pathname+url.search);assert.equal(r.status,200);assert.ok(r.headers.get('Content-Security-Policy').includes("default-src 'none'"))
 assert.ok((await r.text()).includes('A new idea'))
 assert.equal((await a.request(url.pathname+url.search+'tampered')).status,401)
 const now=Date.now;Date.now=()=>now()+7200000
 try{assert.equal((await a.request(url.pathname+url.search)).status,401)}finally{Date.now=now}
 await a.request('/v1/content/blog/a-new-idea','PUT',{content:{...draft,title:'Revised'},revision:c.revision})
 assert.equal((await a.request(url.pathname+url.search)).status,409)
})
test('image uploads validate format; signed preview can only read referenced images',async()=>{
 const a=api()
 assert.equal((await a.request('/v1/images','POST',{base64:btoa('<svg onload="evil">')})).status,400)
 const base64='iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aOt8AAAAASUVORK5CYII='
 const upload=await(await a.request('/v1/images','POST',{base64})).json()
 const c={...draft,blocks:[{type:'image',src:upload.src,alt:'Test image'}]}
 await a.request('/v1/content','POST',c)
 const link=await(await a.request('/v1/content/blog/a-new-idea/preview','POST')).json();const token=new URL(link.url).searchParams.get('token')
 const r=await a.request('/v1/preview-asset?token='+token+'&path='+upload.src);assert.equal(r.status,200);assert.equal(r.headers.get('Content-Type'),'image/png')
 assert.equal((await a.request('/v1/preview-asset?token='+token+'&path=/uploads/other.png')).status,404)
})
test('GitHub adapter writes drafts only to draft branch and surfaces write conflicts',async()=>{
 const calls=[];const store=new GitHubStore({FOLIO_REPOSITORY:'example/site',FOLIO_GITHUB_TOKEN:'test',FOLIO_DRAFT_BRANCH:'content-drafts'},async(url,init)=>{
  calls.push({url,init})
  if(url.includes('/git/ref/heads/'))return Response.json({object:{sha:'base'}})
  if(init.method==='PUT')return Response.json({content:{sha:'new-revision'}})
  return Response.json({sha:'existing',content:btoa(JSON.stringify(draft))})
 })
 await assert.rejects(store.write(draft),e=>e.status===409)
 const r=await store.write(draft,'existing');assert.equal(r.revision,'new-revision')
 const write=calls.find(c=>c.init.method==='PUT');assert.equal(JSON.parse(write.init.body).branch,'content-drafts')
 assert.throws(()=>new GitHubStore({FOLIO_REPOSITORY:'example/site',FOLIO_DRAFT_BRANCH:'main'}))
})
test('GitHub adapter preserves the native Cloudflare fetch receiver',async()=>{
 const original=globalThis.fetch
 globalThis.fetch=async function(){
  assert.equal(this,globalThis,'Native fetch must keep its Worker global receiver')
  return Response.json({ok:true})
 }
 try{
  const store=new GitHubStore({FOLIO_REPOSITORY:'example/site',FOLIO_GITHUB_TOKEN:'test'})
  assert.deepEqual(await store.api('/probe'),{ok:true})
 }finally{globalThis.fetch=original}
})
test('GitHub publication copies only the selected document and its images into one review commit',async()=>{
 const calls=[];const doc={...draft,blocks:[{type:'image',src:'/uploads/example.png',alt:'Example'}]}
 const store=new GitHubStore({FOLIO_REPOSITORY:'example/site',FOLIO_GITHUB_TOKEN:'test'},async(url,init)=>{
  const body=init.body?JSON.parse(init.body):null;calls.push({url,method:init.method,body})
  if(url.includes('/contents/content/'))return Response.json({sha:'reviewed',content:btoa(JSON.stringify(doc))})
  if(url.includes('/contents/public/'))return Response.json({sha:'image-blob'})
  if(url.includes('/git/ref/heads/'))return Response.json({object:{sha:'base-commit'}})
  if(url.endsWith('/git/commits/base-commit'))return Response.json({tree:{sha:'base-tree'}})
  if(url.endsWith('/git/trees'))return Response.json({sha:'next-tree'})
  if(url.endsWith('/git/commits'))return Response.json({sha:'next-commit'})
  if(url.endsWith('/git/refs'))return Response.json({})
  if(url.endsWith('/pulls'))return Response.json({html_url:'https://github.com/example/site/pull/1'})
  throw Error('Unexpected GitHub endpoint')
 })
 const r=await store.propose(doc,'reviewed');assert.equal(r.status,'awaiting-review')
 const tree=calls.find(c=>c.url.endsWith('/git/trees')).body
 assert.equal(tree.tree.length,2);assert.equal(JSON.parse(tree.tree[0].content).status,'published');assert.equal(tree.tree[1].sha,'image-blob')
 assert.ok(!calls.some(c=>c.url.includes('/merge')||c.method==='PATCH'))
 assert.equal(calls.find(c=>c.url.endsWith('/pulls')).body.base,'main')
})
