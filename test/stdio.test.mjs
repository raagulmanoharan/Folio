import test from 'node:test'
import assert from 'node:assert/strict'
import { createServer } from 'node:http'
import { Client } from '../services/content-api/node_modules/@modelcontextprotocol/sdk/dist/esm/client/index.js'
import { StdioClientTransport } from '../services/content-api/node_modules/@modelcontextprotocol/sdk/dist/esm/client/stdio.js'
import { createHandler } from '../services/content-api/worker.js'
const apiKey='local-integration-test-'.padEnd(40,'x')
test('official MCP stdio client connects through the adapter to the HTTP API',async()=>{
 const handle=createHandler(()=>({list:async()=>[{type:'blog',slug:'stdio-test',revision:'one'}]}))
 const env={FOLIO_API_KEY:apiKey,FOLIO_PREVIEW_SECRET:'preview-test-'.padEnd(40,'z')}
 const server=createServer(async(req,res)=>{
  const chunks=[];for await(const c of req)chunks.push(c)
  const response=await handle(new Request(`http://127.0.0.1${req.url}`,{method:req.method,headers:req.headers,...(chunks.length?{body:Buffer.concat(chunks)}:{})}),env)
  res.writeHead(response.status,Object.fromEntries(response.headers));res.end(Buffer.from(await response.arrayBuffer()))
 })
 await new Promise(r=>server.listen(0,'127.0.0.1',r))
 const client=new Client({name:'stdio-test',version:'1.0.0'})
 const transport=new StdioClientTransport({command:process.execPath,args:[new URL('../services/content-api/mcp.mjs',import.meta.url).pathname],env:{PATH:process.env.PATH,FOLIO_API_URL:'http://127.0.0.1:'+server.address().port,FOLIO_API_KEY:apiKey},stderr:'pipe'})
 try {
  await client.connect(transport)
  const tools=await client.listTools();assert.ok(tools.tools.some(t=>t.name==='list_content'))
  assert.ok(!tools.tools.some(t=>t.name==='publish_content'))
  const result=await client.callTool({name:'list_content',arguments:{}})
  assert.equal(JSON.parse(result.content[0].text).items[0].slug,'stdio-test')
 }finally{await client.close();await new Promise(r=>server.close(r))}
})
