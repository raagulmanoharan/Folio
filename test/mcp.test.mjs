import test from 'node:test'
import assert from 'node:assert/strict'
import { Client } from '../services/content-api/node_modules/@modelcontextprotocol/sdk/dist/esm/client/index.js'
import { StreamableHTTPClientTransport } from '../services/content-api/node_modules/@modelcontextprotocol/sdk/dist/esm/client/streamableHttp.js'
import { createHandler } from '../services/content-api/worker.js'
import { ContentError,contentPath } from '../lib/content.js'
const env={FOLIO_API_KEY:'draft-key-'.padEnd(40,'x'),FOLIO_PUBLISH_KEY:'publisher-key-'.padEnd(40,'y'),FOLIO_PREVIEW_SECRET:'preview-secret-'.padEnd(40,'z')}
class Store {
 constructor(){this.data=new Map()}
 async write(c){const k=contentPath(c.type,c.slug);if(this.data.has(k))throw new ContentError('Exists',409);const v={content:c,revision:'one'};this.data.set(k,v);return v}
 async read(t,s){return this.data.get(contentPath(t,s))}
 async list(){return [...this.data.values()]}
}
test('official MCP client initializes remote transport and creates, reads, previews a draft',async()=>{
 const store=new Store(),handle=createHandler(()=>store)
 const transport=new StreamableHTTPClientTransport(new URL('https://api.example.com/mcp'),{requestInit:{headers:{Authorization:'Bearer '+env.FOLIO_API_KEY}},fetch:(input,init)=>handle(new Request(input,init),env)})
 const client=new Client({name:'integration-test',version:'1.0.0'})
 try {
  await client.connect(transport)
  const tools=await client.listTools();assert.ok(tools.tools.some(t=>t.name==='create_draft'));assert.ok(!tools.tools.some(t=>t.name==='publish_content'))
  const content={type:'side-project',slug:'sound-lab',title:'Sound lab',summary:'A synthesizer experiment.',blocks:[{type:'paragraph',text:'A story about sound.'}]}
  const created=await client.callTool({name:'create_draft',arguments:{content}});assert.ok(!created.isError)
  const fetched=await client.callTool({name:'get_content',arguments:{type:'side-project',slug:'sound-lab'}})
  assert.equal(JSON.parse(fetched.content[0].text).content.title,'Sound lab')
  const preview=await client.callTool({name:'preview_draft',arguments:{type:'side-project',slug:'sound-lab'}})
  const url=JSON.parse(preview.content[0].text).url;const page=await handle(new Request(url),env)
  assert.equal(page.status,200);assert.ok((await page.text()).includes('A story about sound.'))
 }finally{await client.close()}
})
test('remote MCP rejects unauthenticated and cross-origin requests',async()=>{
 const handle=createHandler(()=>new Store()),body=JSON.stringify({jsonrpc:'2.0',id:1,method:'initialize',params:{protocolVersion:'2025-03-26',capabilities:{},clientInfo:{name:'test',version:'1'}}})
 const headers={'Content-Type':'application/json',Accept:'application/json, text/event-stream'}
 assert.equal((await handle(new Request('https://api.example.com/mcp',{method:'POST',headers,body}),env)).status,401)
 assert.equal((await handle(new Request('https://api.example.com/mcp',{method:'POST',headers:{...headers,Authorization:'Bearer '+env.FOLIO_API_KEY,Origin:'https://evil.example'},body}),env)).status,403)
})
