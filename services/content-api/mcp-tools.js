import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'
const type=z.enum(['case-study','blog','side-project']),slug=z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
const block=z.discriminatedUnion('type',[
 ...['hero','heading','subheading','paragraph'].map(type=>z.object({type:z.literal(type),text:z.string()})),
 z.object({type:z.literal('image'),src:z.string(),alt:z.string(),caption:z.string().optional()}),
 z.object({type:z.literal('metrics'),items:z.array(z.object({value:z.string(),label:z.string(),note:z.string()})).length(3)})
])
const content=z.object({type,slug,title:z.string(),summary:z.string(),role:z.string().optional(),year:z.string().optional(),link:z.string().optional(),blocks:z.array(block).min(1).max(100)})

export function createMcpServer(call, {publisher=false,jsonSchemaValidator}={}) {
const server=new McpServer({name:'folio-content',version:'1.0.0'},jsonSchemaValidator?{jsonSchemaValidator}:undefined)
const path=(type,slug)=>`/v1/content/${encodeURIComponent(type)}/${encodeURIComponent(slug)}`
server.tool('content_schema','Get supported content fields and blocks.',{},()=>call('/v1/schema'))
server.tool('list_content','List Git-backed draft content and revisions.',{type:type.optional()},({type})=>call('/v1/content'+(type?`?type=${type}`:'')))
server.tool('get_content','Read a draft, including its revision for safe updates.',{type,slug},a=>call(path(a.type,a.slug)))
server.tool('create_draft','Create a draft. Does not publish or overwrite existing content.',{content},a=>call('/v1/content','POST',a.content))
server.tool('update_draft','Replace a draft using the revision returned by get_content. Stale edits fail.',{content,revision:z.string()},a=>call(path(a.content.type,a.content.slug),'PUT',a))
server.tool('upload_image','Upload a base64 PNG, JPEG, WebP, or GIF up to 4 MiB. Returns a site-relative src.',{base64:z.string()},a=>call('/v1/images','POST',a))
server.tool('preview_draft','Create a browser preview link valid for one hour, or until the draft changes.',{type,slug},a=>call(path(a.type,a.slug)+'/preview','POST'))
// Keep publication unavailable to ordinary writing agents.
if(publisher) server.tool('publish_content','Propose publication by opening a review PR for this exact revision. Does not merge or deploy.',{type,slug,revision:z.string()},a=>call(path(a.type,a.slug)+'/publish','POST',{revision:a.revision},true))
return server
}
