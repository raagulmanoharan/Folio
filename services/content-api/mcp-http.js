import { WebStandardStreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js'
import { CfWorkerJsonSchemaValidator } from '@modelcontextprotocol/sdk/validation/cfworker-provider.js'
import { createMcpServer } from './mcp-tools.js'
export async function handleMcp(request,env,handler,publisher,parsedBody) {
 const origin=new URL(request.url).origin
 const call=async(path,method='GET',body)=>{
  const r=await handler(new Request(origin+path,{method,headers:{Authorization:request.headers.get('Authorization'),'Content-Type':'application/json'},...(body?{body:JSON.stringify(body)}:{})}),env)
  return {isError:!r.ok,content:[{type:'text',text:JSON.stringify(await r.json())}]}
 }
 const server=createMcpServer(call,{publisher,jsonSchemaValidator:new CfWorkerJsonSchemaValidator()})
 const transport=new WebStandardStreamableHTTPServerTransport({sessionIdGenerator:undefined,enableJsonResponse:true})
 await server.connect(transport)
 try{return await transport.handleRequest(request,{parsedBody})}finally{await server.close()}
}
