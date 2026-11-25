import { gsap } from 'gsap'
import { spark, icon, sourceChip, card, prompt, comment, cursor, status } from './v2-components'
import { morrowPrototype, launchDeck, bindOutputs } from './v2-outputs'
import { machineInput, exportEntry, bindExportEntry } from './v2-source-controls'
import './v2-components.css'
import './v2-scenes.css'

const eyebrow = text => `<div class="jv-eyebrow">${text}</div>`
const tag = (text,kind='') => `<span class="jv-tag ${kind}">${text}</span>`
const arrow = () => `<span class="jv-connection" aria-hidden="true">${icon('arrow',28)}</span>`
const button = (label,action,cls='') => `<button type="button" class="jv-action ${cls}" data-action="${action}">${label}</button>`
const small = text => `<span class="jv-muted">${text}</span>`
const brief = className => card({className:`${className} jv-brief`,title:'Morrow / launch brief',body:`${eyebrow('A weekly planning app')}<p class="jv-lead">A calmer week.<br>A clearer team.</p><div class="jv-stat-pair"><div><strong>50</strong><span>beta teams</span></div><div><strong>20h</strong><span>support budget</span></div></div>`})
const interview = className => card({className:`${className} jv-interview`,title:'Pilot interviews',body:`${eyebrow('6 teams · first-use study')}<p class="jv-quote">“I wanted to see an example before I sent invites.”</p><span class="jv-person"><i>O</i> Omar · team lead</span><div class="jv-source-stat"><strong>40 min</strong><span>assisted onboarding / team</span></div>`})

export const scenes = [
 {id:'begin',title:'A thought becomes a place to work.',hint:'Try the prompt',wide:true,html:`
 <div class="jv-start-heading">${spark(38)}<h2>What are we building?</h2></div>
 <div class="jv-start-cards">${card({className:'jv-start-card',title:'The audience',body:`${tag('People')}<p class="jv-lead">Small teams.<br>Big weeks.</p>${small('3–10 people, moving together.')}`})}${card({className:'jv-start-card',title:'The useful moment',body:`${tag('Experience','jv-tag-blue')}<p class="jv-lead">A first plan<br>worth sharing.</p>${small('Give the week a little shape.')}`})}${card({className:'jv-start-card',title:'The open question',body:`${tag('Explore','jv-tag-amber')}<p class="jv-lead">What makes<br>people stay?</p>${small('Start with six pilot interviews.')}`})}</div>
 <div class="jv-start-prompt">${prompt({text:'Help me launch Morrow.<br>A weekly planning app for small teams.'})}</div><div class="jv-start-status">${status('A starting point. Everything stays editable.')}</div>`},
 {id:'source',title:'Bring the messy beginnings.',hint:'Drop the interview into the canvas',html:`
 <div class="jv-source-layout"><div class="jv-file-zone"><button type="button" class="jv-file" data-action="import">${icon('doc',38)}<strong>Morrow—pilot interviews.txt</strong><span>6 conversations · 3.2 KB</span></button><div class="jv-drop-area">${icon('attach',24)}<span>Drop anything into the canvas</span></div></div>
 ${card({className:'jv-transcript',title:'Pilot interviews',body:`${eyebrow('Original transcript · preserved')}<div class="jv-study-facts"><span><strong>6</strong> pilot teams</span><span><strong>7 min</strong> to first plan</span><span><strong>40 min</strong> support / team</span></div><div class="jv-transcript-line"><span>09:12</span><p><b>Lena</b><br>I understood the plan quickly. Inviting the team took longer.</p></div><div class="jv-transcript-line jv-source-quote"><span>14:08</span><p><b>Omar</b><br>I wanted to see an example before I sent invites.</p></div><div class="jv-transcript-line"><span>21:36</span><p><b>Priya</b><br>The empty workspace made me wonder what to do next.</p></div>`})}</div>
 <div class="jv-source-starters">${button(`${spark(17)} Find the insight`,'debrief')}${button('What surprised us?','insight')}</div><div class="jv-source-insight">${status('People need an example before an invitation.')}</div>`},
 {id:'debrief',title:'From a transcript to something you can act on.',hint:'Run the debrief',html:`
 <div class="jv-debrief-source">${sourceChip('Pilot interviews')}${button(`${spark(17)} Debrief`,'debrief')}</div>
 <div class="jv-branch-lines" aria-hidden="true"><i></i><i></i><i></i></div>
 <div class="jv-debrief-cards">${card({className:'jv-decision',source:'Pilot interviews',title:'Decisions',body:`${tag('01','jv-tag-blue')}<p class="jv-lead">An example<br>before an invite.</p><p>Show a populated week before asking people to bring their team.</p>`})}${card({className:'jv-actions',source:'Pilot interviews',title:'Actions',body:`${tag('02')}<ul class="jv-check-list"><li>Prototype the first run</li><li>Validate support capacity</li><li>Test the launch promise</li></ul>`})}${card({className:'jv-risks',source:'Pilot interviews',title:'Risks',body:`${tag('03','jv-tag-amber')}<p class="jv-lead">A promise<br>ahead of proof.</p><p>“Aligned in 60 seconds.”<br>The pilot took 7 minutes.</p>`})}</div>
 <div class="jv-debrief-status">${status('Decisions, actions, and risks. Connected to the source.')}</div>`},
 {id:'ground',title:'Tell it exactly what to think with.',hint:'Type @ to reference a card, or select it on the canvas',html:`
 <div class="jv-ground-inputs"><button type="button" class="jv-source-select is-selected" data-source="Launch brief" aria-pressed="true">${brief('')}</button><button type="button" class="jv-source-select is-selected" data-source="Pilot interviews" aria-pressed="true">${interview('')}</button></div>
 <div class="jv-ground-answer">${card({title:'The cohort is bigger than the capacity.',source:['Launch brief','Pilot interviews'],body:`<div class="jv-math"><span><strong>50</strong> teams</span><i>×</i><span><strong>40</strong> min</span><i>=</i><span class="jv-math-result"><strong>33h 20m</strong> support needed</span></div><div class="jv-capacity-line"><span>20h available</span><strong>13h 20m over</strong></div><p>Start with a smaller cohort. Keep room to learn.</p>`})}</div>
 <div class="jv-ground-prompt">${prompt({text:`Is ${sourceChip('Launch brief')} realistic given <span class="jv-at-token">@</span>${sourceChip('Pilot interviews')}?`})}<div class="jv-mention-menu" role="menu" aria-label="Mention a card"><span class="jv-mode-menu-title">Mention a card</span>${['Launch brief','Pilot interviews'].map(name=>`<button type="button" role="menuitem" data-mention="${name}"><span>@</span><strong>${name}</strong><i>Text</i></button>`).join('')}</div></div>`},
 {id:'machine',title:'Change the way you think, not the workspace.',hint:'Run an Effort–Impact Matrix',html:`
 <div class="jv-machine-input">${machineInput()}</div>
 <div class="jv-matrix-wrap"><div class="jv-axis-y">Higher impact ↑</div><div class="jv-matrix"><div class="jv-quadrant"><span>Quick wins</span></div><div class="jv-quadrant"><span>Big bets</span></div><div class="jv-quadrant"><span>Fill-ins</span></div><div class="jv-quadrant"><span>Time sinks</span></div><button class="jv-matrix-note jv-note-example" data-note="example" type="button">Example<br>workspace ${icon('check',16)}</button><button class="jv-matrix-note jv-note-invite" data-note="invite" type="button">Clearer invite copy</button><button class="jv-matrix-note jv-note-calendar" data-note="calendar" type="button">Calendar integration</button><button class="jv-matrix-note jv-note-slack" data-note="slack" type="button">Slack digest</button></div><div class="jv-axis-x">More effort →</div></div><div class="jv-machine-verdict">${status('Build the example workspace first.')}</div>`},
 {id:'notice',title:'A second pair of eyes. Right where it matters.',hint:'Open the comment. Let Jarwiz fix it.',html:`
 <div class="jv-notice-evidence">${card({title:'What the pilot showed',source:'Pilot interviews',body:`${eyebrow('Median time to first plan')}<div class="jv-huge">7<span>min</span></div><p>People understood the plan.<br>Getting the team in took longer.</p>`})}</div>
 <div class="jv-positioning">${card({title:'Morrow / positioning',body:`${eyebrow('The launch promise')}<div class="jv-promise-copy"><p class="jv-promise-before">Your entire team<br>aligned in <em>60 seconds.</em></p><p class="jv-promise-after">A clear weekly plan.<br>A team that knows<br>what’s next.</p></div><span class="jv-promise-footer">Simple. Useful. Believable.</span>`})}<button class="jv-comment-pin" type="button" data-action="comment" aria-label="Open Jarwiz’s comment">${spark(20)}</button></div>
 <div class="jv-notice-comment">${comment({body:'The first plan took <strong>7 minutes</strong> in the pilot. The <strong>60-second promise</strong> sets an expectation the evidence doesn’t support.'})}</div>
 <div class="jv-notice-status">${status('Positioning updated')}</div>`},
 {id:'flow',title:'A decision takes the shape of a journey.',hint:'Choose Flow, then send',html:`
 <div class="jv-flow-source">${card({title:'The decision',source:'Pilot interviews',body:`<p class="jv-lead">Value before<br>commitment.</p><p>Let people see a useful plan before inviting a teammate.</p>`})}</div>
 <div class="jv-flow-prompt">${prompt({text:'Map a first run that starts with an example.',chips:['The decision'],mode:'Doc'})}</div>
 <div class="jv-flow-result"><div class="jv-flow-label">${icon('flow',19)} Morrow / first run</div><div class="jv-flow-steps"><div class="jv-flow-node">Open Morrow</div>${arrow()}<div class="jv-flow-node">Choose a goal</div>${arrow()}<div class="jv-flow-node jv-flow-highlight"><span class="jv-node-dot"></span>Preview a plan</div>${arrow()}<div class="jv-flow-node">Use this plan</div>${arrow()}<div class="jv-flow-node">Invite a teammate</div></div><div class="jv-flow-takeaway">Something useful, before anything is asked.</div></div>`},
 {id:'prototype',title:'Don’t explain the experience. Try it.',hint:'This prototype works. Pick a goal and make a plan.',html:`
 <div class="jv-prototype-input"><div class="jv-mini-flow"><span>Choose a goal</span>↓<span>Preview a plan</span>↓<span>Invite later</span></div>${prompt({text:'Build this first run. Let me try a real plan before inviting anyone.',chips:['Morrow / first run'],mode:'Prototype'})}</div>
 <div class="jv-prototype-output"><div class="jv-artifact-bar">${icon('prototype',17)}<span>Morrow / first run</span><span class="jv-live-badge"><i></i> Interactive</span></div>${morrowPrototype()}<div class="jv-output-provenance">${sourceChip('Morrow / first run')} ${small('Built on the canvas')}</div></div>`},
 {id:'sync',title:'One change. The rest stays in step.',hint:'Edit the team count. Connected cards update automatically.',html:`
 <div class="jv-sync-source">${card({title:'Launch brief',body:`${eyebrow('Private beta cohort')}<div class="jv-cohort-input"><input aria-label="Beta team count" type="text" inputmode="numeric" pattern="[0-9]*" maxlength="3" value="50"><span>teams</span></div><p>40 minutes of support per team.<br>20 hours available this week.</p>`})}</div>
 <div class="jv-sync-links" aria-hidden="true"><i></i><i></i></div><div class="jv-sync-dependent"><div class="jv-capacity-card">${card({title:'Support capacity',source:'Launch brief',body:`${eyebrow('Estimated demand')}<div class="jv-demand"><strong>33h 20m</strong><span class="jv-demand-state">13h 20m over budget</span></div><div class="jv-capacity-track"><span></span><i></i></div><div class="jv-track-label"><span>0h</span><span>20h budget</span><span>40h</span></div>`})}<div class="jv-update-receipt" data-receipt="capacity">${spark(14)} Updated to match “Launch brief” ${button('Undo','undo-capacity')}</div></div><div class="jv-checklist-card">${card({title:'Launch checklist',source:'Launch brief',body:`<p class="jv-invite-count"><span class="jv-checkbox-icon"></span> Invite the first <strong>50 teams</strong></p>`})}<div class="jv-update-receipt" data-receipt="checklist">${spark(14)} Updated to match “Launch brief” ${button('Undo','undo-checklist')}</div></div></div>
 <div class="jv-sync-status">${status('Updated to match “Launch brief”')}</div>`},
 {id:'scout',title:'The next useful idea finds its way in.',hint:'Add a resource to the canvas',html:`
 <div class="jv-scout-board">${card({title:'Our first-use principle',source:'Pilot interviews',body:`<p class="jv-lead">An example<br>before an invitation.</p><p>Replace the empty workspace with a useful starting point.</p>`})}<div class="jv-scout-added">${card({title:'Progressive Disclosure',source:'Scout',body:`${eyebrow('Nielsen Norman Group')}<p>Show the essential first.<br>Reveal complexity when it’s needed.</p><a href="https://www.nngroup.com/articles/progressive-disclosure/" target="_blank" rel="noopener" class="jv-resource-link">Read the source ${icon('arrow',14)}</a>`})}</div></div>
 <div class="jv-scout-drawer"><header>${spark(19)}<strong>Found for your board</strong><button type="button" data-action="reset-resource">Think again</button><button type="button" data-action="close-scout" aria-label="Close resources">${icon('close',16)}</button></header><div class="jv-scout-topic">First-use experience</div><button type="button" class="jv-resource" data-action="add-resource"><span class="jv-scout-kind">${icon('doc',22)}</span><span class="jv-scout-row-copy"><strong>Progressive Disclosure</strong><span>Show the essential first. Reveal complexity when it’s needed.</span><em>Useful for Morrow’s example-first onboarding.</em></span><span class="jv-scout-plus">+</span></button><div class="jv-scout-empty">${icon('check',24)}<strong>Added to your board</strong></div></div><button type="button" class="jv-scout-trigger" data-action="show-scout">${spark(18)}<span>Found something</span></button>`},

 {id:'export',title:'The thinking is already the story.',hint:'Browse the deck or download the handoff',html:`
 <div class="jv-export-source"><div class="jv-export-stack"><span>${icon('doc',19)} Pilot interviews</span><span>${icon('doc',19)} Launch decisions</span><span>${icon('dashboard',19)} Capacity estimate</span></div>${exportEntry()}</div><div class="jv-export-result">${launchDeck()}</div>`},
]

function motion(root, id) {
 const $ = s => root.querySelector(s), $$ = s => [...root.querySelectorAll(s)]
 const camera = $('.jv-camera')
 camera.insertAdjacentHTML('beforeend',cursor({id:`pointer-${id}`}))
 const pointer=$('.jv-cursor');gsap.set(pointer,{autoAlpha:0})
 const aim=selector=>{const el=$(selector);let x=el.offsetWidth/2,y=el.offsetHeight/2,node=el;while(node&&node!==camera){x+=node.offsetLeft;y+=node.offsetTop;node=node.offsetParent}return{x,y}}
 const tl = gsap.timeline({paused:true,defaults:{duration:.8,ease:'power3.out'}})
 const enter = (s,t,vars={}) => tl.from(s==='.jv-camera'?camera:$$(s),{autoAlpha:0,y:22,...vars},t)
 const focus = (scale,x,y,t,duration=1.3) => tl.to(camera,{scale,x:()=>id==='source'&&root.classList.contains('jv-mobile')?-45:x,y,duration,ease:'power2.inOut'},t)
 const gesture=(selector,t)=>{tl.set(pointer,{x:()=>aim(selector).x+48,y:()=>aim(selector).y+55,autoAlpha:0},t);tl.to(pointer,{x:()=>aim(selector).x,y:()=>aim(selector).y,autoAlpha:1,duration:.5,ease:'power2.inOut'},t);tl.to($(selector),{scale:.94,duration:.12,yoyo:true,repeat:1},t+.5);tl.to(pointer,{autoAlpha:0,duration:.25},t+.8)}
 const hold = t => tl.to({}, {duration:t})
 switch(id){
 case 'begin':
  gesture('.jv-send',.9)
  tl.from($('.jv-start-heading'),{autoAlpha:0,y:16},0)
  tl.from($('.jv-start-prompt'),{y:-125,scale:1.08,duration:1.4},0)
  enter('.jv-start-prompt .jv-mode',1.8,{y:0,duration:.25})
  enter('.jv-start-cards .jv-card',1.8,{y:45,stagger:.2,duration:1})
  tl.to($('.jv-start-heading'),{autoAlpha:0,y:-20},1.6)
  focus(1.02,0,-8,1.4)
  enter('.jv-start-status',3.1)
  tl.addLabel('result',4);hold(2);break
 case 'source':
  tl.from($('.jv-file'),{x:50,y:-40,rotation:-5,duration:1.2},.4)
  tl.to($('.jv-file'),{y:105,scale:.91,autoAlpha:0,duration:.9,ease:'power2.inOut'},1.8)
  tl.to($('.jv-drop-area'),{autoAlpha:0},2.1)
  enter('.jv-transcript',2.35,{x:-160,y:0,scale:.95,duration:1.2})
  enter('.jv-source-starters',3.15)
  tl.from($('.jv-source-quote'),{backgroundColor:'transparent',duration:1.2},3.2)
  enter('.jv-source-insight',4)
  focus(1.06,-85,0,2.4)
  tl.addLabel('result',5);hold(1.5);break
 case 'debrief':
  gesture('[data-action=debrief]',.1)
  enter('.jv-branch-lines',.7)
  enter('.jv-debrief-cards .jv-card',1.3,{y:55,stagger:.28,duration:1})
  focus(1.025,0,6,1)
  enter('.jv-debrief-status',2.8)
  tl.addLabel('result',3.8);hold(2);break
 case 'ground':
  gesture('[data-mention="Pilot interviews"]',.25)
  gesture('.jv-send',1.15)
  enter('.jv-mention-menu',.05,{y:10,duration:.35})
  tl.to($('.jv-mention-menu'),{autoAlpha:0,y:6,duration:.25},1.1)
  tl.to($('.jv-at-token'),{autoAlpha:0,duration:.15},1.1)
  tl.set($('.jv-at-token'),{display:'none'},1.25)
  tl.fromTo($('.jv-ground-prompt .jv-source-chip:last-of-type'),{autoAlpha:0,width:0,paddingLeft:0,paddingRight:0,overflow:'hidden'},{autoAlpha:1,width:'auto',paddingLeft:6,paddingRight:6,duration:.35},1.15)
  tl.from($('.jv-ground-prompt'),{y:-25,scale:1.035,duration:1.1},.2)
  tl.to($('.jv-ground-inputs'),{scale:.75,y:-16,autoAlpha:.7,duration:1.2,ease:'power2.inOut'},1.6)
  enter('.jv-ground-answer',2,{y:70,duration:1.25})
  tl.to($('.jv-ground-prompt'),{y:15,scale:.94,duration:1},1.8)
  focus(.995,0,-3,2.3)
  tl.addLabel('result',3.8);hold(2.3);break
 case 'machine':
  gesture('[data-action=matrix]',.4)
  enter('.jv-matrix-wrap',1.1,{x:50,y:0})
  enter('.jv-matrix-note',1.7,{x:-80,y:25,stagger:.24,duration:1})
  enter('.jv-machine-verdict',3.3)
  focus(1.025,-8,0,2.5)
  tl.addLabel('result',4.5);hold(1.5);break
 case 'notice':
  gesture('.jv-comment-pin',1.35)
  gesture('.jv-comment-fix',5.4)
  enter('.jv-comment-pin',1.2,{scale:0,y:0,duration:.5,ease:'back.out(1.7)'})
  enter('.jv-notice-comment',2,{x:30,y:20,duration:.85})
  focus(1.035,-10,-8,1.65)
  tl.addLabel('comment',3);hold(3.2)
  tl.to($('.jv-notice-comment'),{autoAlpha:0,y:12,duration:.4},6.2)
  tl.to($('.jv-promise-before'),{autoAlpha:0,y:-10,duration:.5},6.5)
  enter('.jv-promise-after',6.85,{y:14,duration:.7})
  tl.to($('.jv-comment-pin'),{autoAlpha:0,scale:.5,duration:.35},6.6)
  tl.fromTo($('.jv-positioning .jv-card'),{boxShadow:'0 0 0 0px #cad8be00'},{boxShadow:'0 0 0 7px #cad8be80',duration:.65,yoyo:true,repeat:1},6.7)
  enter('.jv-notice-status',7.4)
  focus(1.075,-13,-8,6.4)
  tl.addLabel('result',8.2);hold(2);break
 case 'flow':
  gesture('.jv-mode',.1)
  gesture('[data-mode=Flow]',.9)
  tl.set($('.jv-mode-menu'),{display:'block',autoAlpha:0},0)
  enter('.jv-mode-menu',.6,{y:10,duration:.35})
  tl.to($('[data-mode="Flow"]'),{backgroundColor:'#dedede',duration:.35},1.4)
  tl.to($('.jv-mode-menu'),{autoAlpha:0,y:5,duration:.25},2)
  tl.set($('.jv-mode-menu'),{display:'none'},2.3)
  tl.call(()=>{$('.jv-mode-label').textContent='Flow'},[],2.1)
  enter('.jv-flow-result',2.3,{y:40,duration:.8})
  enter('.jv-flow-node,.jv-connection',2.55,{x:-14,y:0,stagger:.12,duration:.6})
  focus(1.025,0,-8,2.6)
  tl.addLabel('result',4.5);hold(2);break
 case 'prototype':
  gesture('.jv-send',.3)
  enter('.jv-prototype-output',1.2,{x:55,y:0,duration:1.3})
  focus(1.04,-12,0,1.3,1.5)
  tl.addLabel('result',3);hold(2);break
 case 'sync':
  gesture('.jv-cohort-input input',.6)
  tl.to($('.jv-cohort-input input'),{color:'#2563eb',duration:.3},1)
  tl.call(()=>{$('.jv-cohort-input input').value='20'},[],1.4)
  tl.to($('.jv-sync-links'),{opacity:1,duration:.6},1.7)
  tl.call(()=>updateCohort(root,20,false),[],2.25)
  tl.fromTo($$('.jv-sync-dependent .jv-card'),{boxShadow:'0 0 0 0px #cad8be00'},{boxShadow:'0 0 0 6px #cad8be70',stagger:.2,duration:.5,yoyo:true,repeat:1},2.2)
  enter('.jv-update-receipt',3,{y:8,stagger:.1})
  focus(1.035,-6,0,1.7)
  tl.addLabel('result',4.1);hold(2);break
 case 'scout':
  gesture('.jv-resource',3.2)
  enter('.jv-scout-drawer',.8,{x:25,y:12,duration:.7})
  tl.addLabel('ready',2);hold(2)
  enter('.jv-scout-added',4,{y:45,duration:.9})
  tl.to($('.jv-resource'),{autoAlpha:0,scale:.97,duration:.45},4)
  enter('.jv-scout-empty',4.35,{y:12})
  tl.addLabel('result',5.3);hold(1.8);break
 case 'export':
  tl.call(()=>{const m=$('.jvs-export-menu');m.hidden=false;$('[data-jvs-export-trigger]').setAttribute('aria-expanded','true')},[],.35)
  gesture('[data-jvs-export-build=slideshow]',.5)
  tl.call(()=>{const m=$('.jvs-export-menu');m.hidden=true;$('[data-jvs-export-trigger]').setAttribute('aria-expanded','false')},[],2.4)
  enter('.jv-export-result',1.2,{x:45,y:0,rotation:1,duration:1.3})
  focus(1.03,-7,0,1.5)
  tl.addLabel('result',3);hold(2);break
 }
 return tl
}

function formatted(minutes){const h=Math.floor(minutes/60),m=minutes%60;return `${h}h${m?` ${m}m`:''}`}
function updateCohort(root,count,animate=true){
 count=Math.min(100,Math.max(1,Math.round(count)||20))
 const q=s=>root.querySelector(s),needed=count*40,remaining=1200-needed
 root._previousCapacity=root._capacityMinutes??2000;root._previousChecklist=root._checklistCount??50;root._capacityMinutes=needed;root._checklistCount=count
 q('.jv-cohort-input input').value=count
 q('.jv-demand strong').textContent=formatted(needed)
 q('.jv-demand-state').textContent=`${formatted(Math.abs(remaining))} ${remaining>=0?'room to learn':'over budget'}`
 q('.jv-demand').classList.toggle('is-under',remaining>=0)
 q('.jv-invite-count strong').textContent=`${count} teams`
 const track=q('.jv-capacity-track span')
 gsap.to(track,{width:`${Math.min(100,needed/24)}%`,backgroundColor:remaining>=0?'#82a696':'#d9af72',duration:animate?.65:0,ease:'power2.inOut'})
 root.querySelectorAll('.jv-update-receipt').forEach(el=>{el.style.visibility='visible';el.style.opacity='1'})
}

export function mountScenes(container){
 const controllers=new Map(), reduce=matchMedia('(prefers-reduced-motion: reduce)')
 window.__timelines={};window.__jarwizScenes=controllers
 container.querySelectorAll('.jv-stage').forEach(root=>{
  const id=root.dataset.scene, fit=root.querySelector('.jv-fit');let tl=motion(root,id)
  const control=root.closest('figure').querySelector('.clip-control')
  const shownMode=id==='flow'?'Flow':id==='prototype'?'Prototype':'Doc'
  const setModes=()=>root.querySelectorAll('.jv-mode-item').forEach(item=>{if(item.dataset.mode!==shownMode){item.disabled=true;item.title='This interaction study demonstrates '+shownMode}});setModes()
  const ctrl={root,tl,started:false,userPaused:false,id};controllers.set(id,ctrl);window.__timelines[id]=tl
  const size=()=>{const mobile=innerWidth<=640;root.classList.toggle('jv-mobile',mobile);const w=mobile?640:960,h=mobile?720:600;fit.style.width=`${w}px`;fit.style.height=`${h}px`;fit.style.transform=`scale(${root.clientWidth/w})`;root.style.height=`${root.clientWidth*h/w}px`}
  new ResizeObserver(size).observe(root);size()
  const label=()=>{control.textContent=tl.progress()>=.999?'↺ Replay':tl.paused()?'▷ Play':'Ⅱ Pause';control.setAttribute('aria-label',`${tl.progress()>=.999?'Replay':tl.paused()?'Play':'Pause'} ${id} animation`)}
  tl.eventCallback('onComplete',label)
  const stop=()=>{tl.pause();gsap.killTweensOf(tl);gsap.set(root.querySelector('.jv-cursor'),{autoAlpha:0});ctrl.userPaused=true;label()}
  const playTo=(name='result')=>{stop();if(tl.progress()>=.995)tl.seek(Math.max(0,(tl.labels[name]||tl.duration())-2.5));gsap.to(tl,{time:tl.labels[name]??tl.duration(),duration:reduce.matches?0:Math.max(.45,Math.min(1.5,Math.abs((tl.labels[name]||tl.duration())-tl.time())*.4)),ease:'power2.inOut',onComplete:label})}
  ctrl.seek=(time)=>{tl.pause().seek(time);label()}
  ctrl.reset=()=>{gsap.killTweensOf(tl);tl.kill();root.querySelector('.jv-cursor')?.remove();root.querySelector('.jv-scene-body').innerHTML=scenes.find(s=>s.id===id).html;gsap.set(root.querySelector('.jv-camera'),{clearProps:'all'});delete root._capacityMinutes;delete root._checklistCount;delete root._previousCapacity;delete root._previousChecklist;tl=motion(root,id);ctrl.tl=tl;window.__timelines[id]=tl;tl.eventCallback('onComplete',label);setModes();tl.play();ctrl.userPaused=false;label()}
  control.addEventListener('click',()=>{if(tl.progress()>=.999){ctrl.reset()}else if(tl.paused()){ctrl.userPaused=false;tl.play()}else stop();label()})
  root.addEventListener('pointerdown',e=>{if(e.isTrusted&&e.target.closest('button,input,textarea,[contenteditable]'))stop()})
  root.addEventListener('focusin',e=>{if(e.isTrusted&&e.target.matches('input,[contenteditable]'))stop()})
  root.addEventListener('click',event=>{
   const b=event.target.closest('button');if(!b)return
   const action=b.dataset.action
   if(b.hasAttribute('data-mention')){const name=b.dataset.mention,selection=[...root.querySelectorAll('.jv-source-select')].find(el=>el.dataset.source===name);selection.classList.add('is-selected');selection.setAttribute('aria-pressed','true');const selected=[...root.querySelectorAll('.jv-source-select.is-selected')].map(el=>sourceChip(el.dataset.source));root.querySelector('.jv-prompt-input').innerHTML=`Is ${selected.join(' realistic given ')}?`;root.querySelector('.jv-send').disabled=selected.length!==2;gsap.set(root.querySelector('.jv-mention-menu'),{autoAlpha:0});return}
   if(b.hasAttribute('data-source-name')){const sourceName=b.dataset.sourceName;const local=[...root.querySelectorAll('.jv-source-select')].find(el=>el.dataset.source===sourceName);if(local){stop();gsap.to(root.querySelector('.jv-ground-answer'),{autoAlpha:0,duration:.25});gsap.to(root.querySelector('.jv-ground-inputs'),{scale:1,y:0,autoAlpha:1,duration:.65});local.focus()}else{const target=sourceName==='Pilot interviews'?controllers.get('source'):sourceName==='Launch brief'?controllers.get('sync'):null;if(target){target.root.scrollIntoView({behavior:reduce.matches?'instant':'smooth',block:'center'});target.tl.progress(1).pause()}}return}
   if(b.matches('.jv-mode')){const menu=b.closest('.jv-prompt').querySelector('.jv-mode-menu'),open=b.getAttribute('aria-expanded')!=='true';menu.hidden=!open;gsap.set(menu,{display:open?'block':'none',autoAlpha:1,y:0});b.setAttribute('aria-expanded',String(open));return}
   if(b.matches('.jv-mode-item')){const p=b.closest('.jv-prompt');p.querySelector('.jv-mode-label').textContent=b.dataset.mode;p.querySelector('.jv-mode').setAttribute('aria-expanded','false');gsap.set(p.querySelector('.jv-mode-menu'),{display:'none'});return}
   if(b.matches('.jv-send')){playTo();return}
   if(b.matches('.jv-attach')){const file=document.createElement('input');file.type='file';file.accept='.txt,.md,.pdf,.csv';file.addEventListener('change',()=>{const chosen=file.files[0];if(chosen){const chip=document.createElement('span');chip.className='jv-source-chip';chip.textContent=chosen.name;b.closest('.jv-prompt').querySelector('.jv-prompt-input').prepend(chip)}});file.click();return}
   if(b.matches('.jv-source-select')){b.classList.toggle('is-selected');b.setAttribute('aria-pressed',String(b.classList.contains('is-selected')));const selected=[...root.querySelectorAll('.jv-source-select.is-selected')].map(el=>sourceChip(el.dataset.source));root.querySelector('.jv-prompt-input').innerHTML=`${selected.join(' ')} Is this launch realistic?`;root.querySelector('.jv-send').disabled=selected.length!==2;gsap.set(root.querySelector('.jv-ground-answer'),{autoAlpha:selected.length===2?1:0});return}
   if(b.matches('[data-idea]')){playTo();const note=root.querySelector(`[data-note="${b.dataset.idea}"]`);gsap.fromTo(note,{scale:.9},{scale:1.07,duration:.35,yoyo:true,repeat:1});return}
   if(b.matches('[data-note]')){root.querySelectorAll('[data-note]').forEach(n=>n.classList.toggle('jv-note-selected',n===b));return}
   if(b.matches('.jv-comment-fix')){playTo();return}
   if(b.matches('.jv-comment-dismiss,.jv-comment-close')){stop();gsap.to(root.querySelector('.jv-notice-comment'),{autoAlpha:0,y:10,duration:.3});if(b.matches('.jv-comment-dismiss'))gsap.to(root.querySelector('.jv-comment-pin'),{autoAlpha:0,duration:.3});return}
   if(action==='comment'||action==='unfix'){stop();tl.seek('comment');gsap.set(root.querySelector('.jv-notice-comment'),{autoAlpha:1,y:0,x:0});label()}
   if(['import','debrief','insight','matrix','export','add-resource'].includes(action)){playTo();if(action==='matrix'){const showVerdict=root.querySelector('[name=verdict]').checked;root.querySelector('.jv-machine-verdict').hidden=!showVerdict;let scores=root.querySelector('.jv-machine-scores');if(!scores){root.querySelector('.jv-scene-body').insertAdjacentHTML('beforeend',`<div class="jv-machine-scores">${card({title:'Score table',body:'<table><thead><tr><th>Idea</th><th>Effort</th><th>Impact</th></tr></thead><tbody><tr><td>Example workspace</td><td>1</td><td>5</td></tr><tr><td>Clearer invite copy</td><td>1</td><td>3</td></tr><tr><td>Calendar integration</td><td>5</td><td>4</td></tr><tr><td>Slack digest</td><td>4</td><td>2</td></tr></tbody></table>'})}</div>`);scores=root.querySelector('.jv-machine-scores')}scores.hidden=!root.querySelector('[name=scores]').checked}}
   if(action==='reset-resource'){stop();tl.seek('ready');gsap.set(root.querySelector('.jv-scout-drawer'),{autoAlpha:1});label()}
   if(action==='close-scout'){stop();gsap.to(root.querySelector('.jv-scout-drawer'),{autoAlpha:0,duration:.2})}
   if(action==='show-scout'){stop();gsap.to(root.querySelector('.jv-scout-drawer'),{autoAlpha:1,duration:.2})}
   if(action==='undo-capacity'){stop();const minutes=root._previousCapacity??2000,room=1200-minutes;root._capacityMinutes=minutes;root.querySelector('.jv-demand strong').textContent=formatted(minutes);root.querySelector('.jv-demand-state').textContent=formatted(Math.abs(room))+(room>=0?' room to learn':' over budget');root.querySelector('.jv-demand').classList.toggle('is-under',room>=0);gsap.to(root.querySelector('.jv-capacity-track span'),{width:Math.min(100,minutes/24)+'%',backgroundColor:room>=0?'#82a696':'#d9af72',duration:.4});gsap.set(b.closest('.jv-update-receipt'),{autoAlpha:0})}
   if(action==='undo-checklist'){stop();root._checklistCount=root._previousChecklist??50;root.querySelector('.jv-invite-count strong').textContent=root._checklistCount+' teams';gsap.set(b.closest('.jv-update-receipt'),{autoAlpha:0})}
  })
  root.addEventListener('keydown',e=>{const mention=root.querySelector('.jv-mention-menu');if(mention&&e.target.matches('.jv-prompt-input')){if(e.key==='@'){gsap.set(mention,{autoAlpha:1,y:0});}else if(e.key==='Escape'){gsap.set(mention,{autoAlpha:0});return}else if(e.key==='ArrowDown'&&gsap.getProperty(mention,'opacity')===1){e.preventDefault();mention.querySelector('button').focus();return}else if(e.key==='Enter'&&gsap.getProperty(mention,'opacity')===1){e.preventDefault();mention.querySelector('button').click();return}}if(e.key==='Enter'&&e.target.matches('.jv-prompt-input')&&!e.shiftKey){e.preventDefault();if(!root.querySelector('.jv-send').disabled)playTo()}if(e.key==='Enter'&&e.target.matches('.jv-cohort-input input')){e.preventDefault();e.target.blur()}})
  if(id==='sync')root.addEventListener('change',e=>{if(e.target.matches('.jv-cohort-input input')){stop();updateCohort(root,Number(e.target.value))}})
  if(reduce.matches){tl.progress(1).pause();ctrl.started=true;label()}
  bindOutputs(root);bindExportEntry(root)
 })
 const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{
  const c=controllers.get(entry.target.dataset.scene)
  if(entry.isIntersecting){if(!reduce.matches&&!c.userPaused&&c.tl.progress()<1){c.started=true;c.tl.play();const b=entry.target.closest('figure').querySelector('.clip-control');b.textContent='Ⅱ Pause'}}else c.tl.pause()
 }),{threshold:.36})
 controllers.forEach(c=>observer.observe(c.root))
 document.addEventListener('visibilitychange',()=>{if(document.hidden)controllers.forEach(c=>c.tl.pause())})
 return controllers
}
