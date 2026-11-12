import { ContentError, contentPath, TYPES, validateContent } from '../../lib/content.js'
const encode = s => {
  const bytes=new TextEncoder().encode(s);let binary=''
  for(let i=0;i<bytes.length;i+=8192)binary+=String.fromCharCode(...bytes.slice(i,i+8192))
  return btoa(binary)
}
const decode = s => new TextDecoder().decode(Uint8Array.from(atob(s.replace(/\s/g,'')), c => c.charCodeAt(0)))
export class GitHubStore {
  constructor(env, fetcher = globalThis.fetch.bind(globalThis)) {
    this.env = env; this.fetcher = fetcher
    if (!/^[\w.-]+\/[\w.-]+$/.test(env.FOLIO_REPOSITORY || '')) throw new ContentError('Repository is not configured.', 503)
    this.root = `https://api.github.com/repos/${env.FOLIO_REPOSITORY}`
    this.base = env.FOLIO_BASE_BRANCH || 'main'; this.drafts = env.FOLIO_DRAFT_BRANCH || 'content-drafts'
    if (this.drafts === this.base) throw new ContentError('Draft branch must differ from publication branch.', 503)
  }
  async api(path, options = {}) {
    const response = await this.fetcher(this.root + path, { ...options, headers: { Authorization: `Bearer ${this.env.FOLIO_GITHUB_TOKEN}`, Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version':'2022-11-28', 'User-Agent':'Folio-Content', 'Content-Type':'application/json' } })
    if (!response.ok) {
      const status = response.status === 404 ? 404 : [409,422].includes(response.status) ? 409 : 502
      throw new ContentError(status === 404 ? 'Content or repository not found.' : status === 409 ? 'Revision conflict. Read the latest revision and retry.' : 'GitHub operation failed. Check service permissions and GitHub status.', status)
    }
    return response.status === 204 ? null : response.json()
  }
  async ensureDraftBranch() {
    try { await this.api(`/git/ref/heads/${encodeURIComponent(this.drafts)}`); return } catch(e) { if(e.status !== 404) throw e }
    const base = await this.api(`/git/ref/heads/${encodeURIComponent(this.base)}`)
    try { await this.api('/git/refs', {method:'POST', body:JSON.stringify({ref:`refs/heads/${this.drafts}`,sha:base.object.sha})}) }
    catch(e) { if(e.status !== 409) throw e; await this.api(`/git/ref/heads/${encodeURIComponent(this.drafts)}`) }
  }
  async file(path, ref = this.drafts) { return this.api(`/contents/${path}?ref=${encodeURIComponent(ref)}`) }
  async read(type, slug) {
    const f = await this.file(contentPath(type,slug))
    return { content: JSON.parse(decode(f.content)), revision:f.sha }
  }
  async list(type) {
    if(type && !TYPES.includes(type)) throw new ContentError('Unknown content type.')
    const result=[]
    for(const kind of type ? [type] : TYPES) {
      let files
      try { files = await this.file(`content/${kind}`) } catch(e) { if(e.status===404) continue; throw e }
      for(const f of files) if(f.type==='file' && f.name.endsWith('.json')) result.push({type:kind,slug:f.name.slice(0,-5),revision:f.sha})
    }
    return result
  }
  async write(content, revision) {
    await this.ensureDraftBranch()
    const path=contentPath(content.type,content.slug)
    let current
    try { current=await this.file(path) } catch(e) { if(e.status!==404) throw e }
    if((current && current.sha !== revision) || (!current && revision)) throw new ContentError('Revision conflict. Read the latest revision and retry.',409)
    const result = await this.api(`/contents/${path}`, {method:'PUT',body:JSON.stringify({message:`Draft ${content.type}: ${content.title}`,branch:this.drafts,content:encode(JSON.stringify(content,null,2)+'\n'),...(revision?{sha:revision}:{})})})
    return {content,revision:result.content.sha}
  }
  async upload(base64, extension) {
    await this.ensureDraftBranch()
    const path=`public/uploads/${crypto.randomUUID()}.${extension}`
    await this.api(`/contents/${path}`,{method:'PUT',body:JSON.stringify({message:'Add content image',branch:this.drafts,content:base64})})
    return {src:'/'+path.slice(7)}
  }
  async image(path) {
    const file=await this.file('public'+path)
    return file.encoding==='none' ? this.api(`/git/blobs/${file.sha}`) : file
  }
  async propose(content, revision) {
    const current=await this.read(content.type,content.slug)
    if(current.revision!==revision) throw new ContentError('Revision conflict. Read the latest revision and retry.',409)
    content=validateContent(current.content)
    const base=await this.api(`/git/ref/heads/${encodeURIComponent(this.base)}`)
    const commit=await this.api(`/git/commits/${base.object.sha}`)
    const files=[{path:contentPath(content.type,content.slug),mode:'100644',type:'blob',content:JSON.stringify({...content,status:'published'},null,2)+'\n'}]
    const images=new Set(content.blocks.filter(b=>b.type==='image' && /^\/uploads\/[\w-]+\.(png|jpg|webp|gif)$/.test(b.src)).map(b=>b.src))
    for(const path of images) {
      const image=await this.image(path)
      files.push({path:'public'+path,mode:'100644',type:'blob',sha:image.sha})
    }
    const tree=await this.api('/git/trees',{method:'POST',body:JSON.stringify({base_tree:commit.tree.sha,tree:files})})
    const next=await this.api('/git/commits',{method:'POST',body:JSON.stringify({message:`Publish ${content.type}: ${content.title}`,tree:tree.sha,parents:[base.object.sha]})})
    const branch=`publish/${content.slug}-${crypto.randomUUID().slice(0,8)}`
    await this.api('/git/refs',{method:'POST',body:JSON.stringify({ref:`refs/heads/${branch}`,sha:next.sha})})
    const pr=await this.api('/pulls',{method:'POST',body:JSON.stringify({title:`Publish: ${content.title}`,head:branch,base:this.base,body:'Review this content before merging. Merging runs the existing Pages production deployment.\n\nDraft revision: '+revision})})
    return {pullRequest:pr.html_url,status:'awaiting-review',message:'Nothing is live until this pull request is merged.'}
  }
}
