import { createMcpServer } from './mcp-tools.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
const base=process.env.FOLIO_API_URL?.replace(/\/$/,'')
if(!base || !process.env.FOLIO_API_KEY) {console.error('Set FOLIO_API_URL and FOLIO_API_KEY.');process.exit(1)}
const parsed=new URL(base)
if(parsed.protocol!=='https:' && !(parsed.protocol==='http:' && ['127.0.0.1','localhost','[::1]'].includes(parsed.hostname))) throw Error('API URL must use HTTPS (HTTP is allowed only on loopback for development).')
if(parsed.username || parsed.password) throw Error('Do not put credentials in the API URL.')
async function call(path,method='GET',body,publish=false) {
 const token=publish?process.env.FOLIO_PUBLISH_KEY:process.env.FOLIO_API_KEY
 if(!token) return {isError:true,content:[{type:'text',text:'Publisher key is not configured.'}]}
 try {
  const response=await fetch(base+path,{method,headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/json'},...(body?{body:JSON.stringify(body)}:{}),signal:AbortSignal.timeout(60000),redirect:'error'})
  const data=await response.json()
  return {isError:!response.ok,content:[{type:'text',text:JSON.stringify(data)}]}
 }catch{return {isError:true,content:[{type:'text',text:'Content API request failed. Check connectivity and service URL.'}]}}
}
const server=createMcpServer(call,{publisher:!!process.env.FOLIO_PUBLISH_KEY})
await server.connect(new StdioServerTransport())
