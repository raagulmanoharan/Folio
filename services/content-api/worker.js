import { ContentError, validateContent, contentPath, renderPage, routeFor } from '../../lib/content.js'
import { GitHubStore } from './github.js'
import openapi from './openapi.json' with { type: 'json' }
const json=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}})
const bytesTo64 = bytes => btoa(String.fromCharCode(...bytes)).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'')
const from64 = value => Uint8Array.from(atob(value.replace(/-/g,'+').replace(/_/g,'/')),c=>c.charCodeAt(0))
async function key(secret) { return crypto.subtle.importKey('raw',new TextEncoder().encode(secret),{name:'HMAC',hash:'SHA-256'},false,['sign','verify']) }
async function sign(payload,secret) {
  const data=bytesTo64(new TextEncoder().encode(JSON.stringify(payload)))
  return data+'.'+bytesTo64(new Uint8Array(await crypto.subtle.sign('HMAC',await key(secret),new TextEncoder().encode(data))))
}
async function verify(token,secret) {
  try {
    const [data,signature,...rest]=token.split('.')
    if(rest.length || !await crypto.subtle.verify('HMAC',await key(secret),from64(signature),new TextEncoder().encode(data))) throw Error()
    const payload=JSON.parse(new TextDecoder().decode(from64(data)))
    if(payload.expires < Date.now()) throw Error()
    contentPath(payload.type,payload.slug)
    return payload
  } catch { throw new ContentError('Preview link is invalid or expired.',401) }
}
async function authorized(request,expected) {
  const actual=request.headers.get('Authorization') || ''
  if(!expected || expected.length<32 || !actual.startsWith('Bearer ')) return false
  const digest=s=>crypto.subtle.digest('SHA-256',new TextEncoder().encode(s))
  const [a,b]=await Promise.all([digest(actual.slice(7)),digest(expected)])
  const aa=new Uint8Array(a),bb=new Uint8Array(b); let diff=0
  for(let i=0;i<aa.length;i++) diff|=aa[i]^bb[i]
  return diff===0
}
async function body(request) {
  if(!request.headers.get('content-type')?.includes('application/json')) throw new ContentError('Use application/json.',415)
  if(Number(request.headers.get('content-length'))>6000000) throw new ContentError('Request too large.',413)
  const reader=request.body?.getReader(); if(!reader) throw new ContentError('JSON body is required.')
  const chunks=[];let size=0
  while(true){const {value,done}=await reader.read();if(done)break;size+=value.length;if(size>6000000){await reader.cancel();throw new ContentError('Request too large.',413)}chunks.push(value)}
  const data=new Uint8Array(size);let offset=0;for(const c of chunks){data.set(c,offset);offset+=c.length}
  try {return JSON.parse(new TextDecoder().decode(data))} catch {throw new ContentError('Invalid JSON.')}
}
function imageInput(input) {
  if(!input || typeof input.base64!=='string' || input.base64.length>5600000) throw new ContentError('Image must be base64 encoded and at most 4 MiB.')
  let bytes;try{bytes=Uint8Array.from(atob(input.base64),c=>c.charCodeAt(0))}catch{throw new ContentError('Invalid base64 image.')}
  if(bytes.length>4194304 || bytes.length<12) throw new ContentError('Invalid image size.')
  const hex=Array.from(bytes.slice(0,12),b=>b.toString(16).padStart(2,'0')).join('')
  const extension=hex.startsWith('89504e470d0a1a0a')?'png':hex.startsWith('ffd8ff')?'jpg':hex.startsWith('474946383761')||hex.startsWith('474946383961')?'gif':hex.startsWith('52494646')&&hex.slice(16)==='57454250'?'webp':null
  if(!extension) throw new ContentError('Only PNG, JPEG, GIF, and WebP images are supported.')
  return extension
}
export function createHandler(storeFactory=env=>new GitHubStore(env)) {
 return async function handle(request,env) {
  try {
    const url=new URL(request.url), path=url.pathname
    if(path==='/health' && request.method==='GET') return json({status:'ok',service:'folio-content',version:1})
    if(!env.FOLIO_PREVIEW_SECRET || env.FOLIO_PREVIEW_SECRET.length<32) throw new ContentError('Service secrets are not configured.',503)
    if(env.FOLIO_API_KEY && env.FOLIO_API_KEY===env.FOLIO_PUBLISH_KEY) throw new ContentError('Draft and publisher keys must be distinct.',503)
    const store=storeFactory(env)
    if(path==='/v1/preview' || path==='/v1/preview-asset') {
      if(request.method!=='GET') throw new ContentError('Method not allowed.',405)
      const token=url.searchParams.get('token')||'',p=await verify(token,env.FOLIO_PREVIEW_SECRET)
      const current=await store.read(p.type,p.slug)
      if(current.revision!==p.revision) throw new ContentError('Draft changed. Request a fresh preview link.',409)
      const c=validateContent(current.content)
      if(path==='/v1/preview-asset') {
        const asset=url.searchParams.get('path')
        if(!/^\/uploads\/[\w-]+\.(png|jpg|webp|gif)$/.test(asset||'') || !c.blocks.some(b=>b.type==='image'&&b.src===asset)) throw new ContentError('Image not found.',404)
        const file=await store.image(asset)
        const mime={png:'image/png',jpg:'image/jpeg',gif:'image/gif',webp:'image/webp'}[asset.split('.').pop()]
        return new Response(Uint8Array.from(atob(file.content.replace(/\s/g,'')),c=>c.charCodeAt(0)),{headers:{'Content-Type':mime,'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}})
      }
      for(const b of c.blocks) if(b.type==='image'&&b.src.startsWith('/uploads/')) b.src=`${url.origin}/v1/preview-asset?token=${encodeURIComponent(token)}&path=${encodeURIComponent(b.src)}`
      else if(b.type==='image'&&b.src.startsWith('/')) b.src=(env.FOLIO_SITE_URL||'https://raagulmanoharan.com').replace(/\/$/,'')+b.src
      return new Response(renderPage(c,{preview:true}),{headers:{'Content-Type':'text/html;charset=utf-8','Cache-Control':'no-store','Referrer-Policy':'no-referrer','X-Content-Type-Options':'nosniff','X-Frame-Options':'DENY','Content-Security-Policy':"default-src 'none'; style-src 'unsafe-inline'; img-src 'self' https:; base-uri 'none'; form-action 'none'; frame-ancestors 'none'"}})
    }
    const publisher=await authorized(request,env.FOLIO_PUBLISH_KEY)
    if(!publisher && !await authorized(request,env.FOLIO_API_KEY)) throw new ContentError('Unauthorized.',401)
    if(path==='/mcp') {
      const origin=request.headers.get('Origin')
      if(origin && origin!==url.origin) throw new ContentError('Origin is not allowed.',403)
      if(request.method!=='POST') throw new ContentError('Use MCP Streamable HTTP POST requests.',405)
      const input=await body(request)
      const {handleMcp}=await import('./mcp-http.js')
      return await handleMcp(request,env,handle,publisher,input)
    }
    if(path==='/v1/openapi' && request.method==='GET') return json(openapi)
    if(path==='/v1/schema' && request.method==='GET') return json({types:['case-study','blog','side-project'],blocks:['hero','heading','subheading','paragraph','image','metrics'],required:['type','slug','title','summary','blocks'],optional:['role','year','link'],notes:'Metrics require exactly three items with value, label, and evidence/placeholder note. See docs/content-api.md for the complete schema.'})
    if(path==='/v1/content' && request.method==='GET') return json({items:await store.list(url.searchParams.get('type')||undefined)})
    if(path==='/v1/content' && request.method==='POST') {
      const input=await body(request),c=validateContent(input)
      return json(await store.write(c),201)
    }
    if(path==='/v1/images' && request.method==='POST') {
      const input=await body(request),extension=imageInput(input)
      return json(await store.upload(input.base64,extension),201)
    }
    const match=path.match(/^\/v1\/content\/([^/]+)\/([^/]+)(?:\/(preview|publish))?$/)
    if(match) {
      const [,type,slug,action]=match;contentPath(type,slug)
      if(!action && request.method==='GET') return json(await store.read(type,slug))
      if(!action && request.method==='PUT') {
        const input=await body(request)
        if(typeof input?.revision!=='string' || !input.revision) throw new ContentError('The current revision is required.',428)
        const c=validateContent(input.content)
        if(c.type!==type||c.slug!==slug) throw new ContentError('Content identity must match the URL.')
        return json(await store.write(c,input.revision))
      }
      if(action==='preview' && request.method==='POST') {
        const current=await store.read(type,slug)
        const expires=Date.now()+3600000
        const token=await sign({type,slug,revision:current.revision,expires},env.FOLIO_PREVIEW_SECRET)
        return json({url:`${url.origin}/v1/preview?token=${token}`,expiresAt:new Date(expires).toISOString(),route:routeFor(current.content)})
      }
      if(action==='publish' && request.method==='POST') {
        if(!publisher) throw new ContentError('Publishing requires the separate publisher key.',403)
        const input=await body(request)
        if(typeof input?.revision!=='string'||!input.revision) throw new ContentError('The reviewed revision is required.',428)
        const current=await store.read(type,slug)
        if(current.revision!==input.revision) throw new ContentError('Revision conflict. Read the latest revision and retry.',409)
        return json(await store.propose(validateContent(current.content),input.revision),201)
      }
      throw new ContentError('Method not allowed.',405)
    }
    throw new ContentError('Not found.',404)
  } catch(e) {return json({error:e instanceof ContentError?e.message:'Unexpected service error.'},e instanceof ContentError?e.status:500)}
 }
}
export default {fetch:createHandler()}
