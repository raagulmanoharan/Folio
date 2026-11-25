import './v2-outputs.css'

// Editorial Morrow scenario, rendered as a working prototype rather than an
// image. Mirrors Jarwiz's PrototypeCardShapeUtil / iframe output concept.
const goals = ['Ship a calmer week', 'Bring a project into focus', 'Make room for deep work']
const tasks = [ ['Mon', 'Design review', 'Align on the first-run experience'], ['Wed', 'Pilot check-in', 'Listen to the next six teams'], ['Fri', 'Share launch recap', 'Decide what changes next'] ]
const deckSlides = [
  {eyebrow:'01 / Evidence',title:'What we learned',body:'The useful moment came before the invitation.',stats:[['6','pilot teams'],['7 min','to a first plan'],['40 min','assisted onboarding']],note:'“I wanted to see an example before I sent invites.”',footer:'Pilot interviews · illustrative Morrow scenario'},
  {eyebrow:'02 / Decisions',title:'What we changed',body:'An example first. A promise the evidence can support.',stats:[['Example','before invitation'],['20 teams','first beta cohort'],['13h 20m','support needed']],note:'“A clear weekly plan. A team that knows what’s next.”',footer:'50 teams → 20 teams · 40 minutes support per team'},
  {eyebrow:'03 / Next',title:'What launches next',body:'A small beta. A clear first plan. Room to learn.',stats:[['20','teams invited'],['6h 40m','support buffer'],['Weekly','learning review']],note:'Show an example → publish a plan → invite a teammate.',footer:'20h support budget − 13h 20m estimated demand'},
]

export function morrowPrototype() {
  return `<div class="jvo-prototype" data-jvo-prototype data-jvo-screen="goal">
    <header class="jvo-appbar"><span class="jvo-brand"><span class="jvo-brand-mark" aria-hidden="true">m</span>Morrow</span><span class="jvo-step" data-jvo-step>1 of 3</span></header>
    <div class="jvo-screens">
      <section class="jvo-screen jvo-screen--active" data-jvo-view="goal" aria-label="Choose a team goal">
        <div class="jvo-eyebrow">A little direction</div><h3>What would make this<br>week feel better?</h3><p class="jvo-subtle">Start with a goal. We’ll give it a shape.</p>
        <div class="jvo-goals" aria-label="Your team goal">${goals.map((goal,i)=>`<button type="button" class="jvo-goal${i===0?' jvo-goal--selected':''}" data-jvo-goal="${i}" aria-pressed="${i===0}"><span>${goal}</span><span class="jvo-radio" aria-hidden="true"></span></button>`).join('')}</div>
        <button class="jvo-primary" type="button" data-jvo-next="preview">Preview an example <span aria-hidden="true">→</span></button>
      </section>
      <section class="jvo-screen" data-jvo-view="preview" aria-label="Preview your weekly plan" inert>
        <div class="jvo-eyebrow">Your first useful moment</div><h3>A week with<br>room to breathe.</h3><p class="jvo-subtle" data-jvo-goal-label>${goals[0]}</p>
        <div class="jvo-plan jvo-plan--preview">${tasks.map(([day,title])=>`<div class="jvo-preview-row"><span class="jvo-day">${day}</span><span>${title}</span><span class="jvo-task-dot" aria-hidden="true"></span></div>`).join('')}</div>
        <button class="jvo-primary" type="button" data-jvo-next="plan">Use this plan <span aria-hidden="true">→</span></button><button class="jvo-text-button" type="button" data-jvo-next="goal">← Choose a different goal</button>
      </section>
      <section class="jvo-screen" data-jvo-view="plan" aria-label="Your working weekly plan" inert>
        <div class="jvo-plan-title"><div><div class="jvo-eyebrow">Your workspace</div><h3>This week, together.</h3></div><span class="jvo-ready">Ready</span></div><p class="jvo-subtle" data-jvo-goal-label>${goals[0]}</p>
        <div class="jvo-plan">${tasks.map(([day,title,detail],i)=>`<button type="button" class="jvo-task" data-jvo-task="${i}" aria-pressed="false"><span class="jvo-checkbox" aria-hidden="true"></span><span class="jvo-task-copy"><span class="jvo-task-name">${title}</span><span class="jvo-task-detail">${detail}</span></span><span class="jvo-day">${day}</span></button>`).join('')}</div>
        <div class="jvo-plan-progress" aria-live="polite" data-jvo-progress>0 of 3 things, a little clearer.</div>
        <button type="button" class="jvo-primary" data-jvo-invite-open>Bring a teammate in <span aria-hidden="true">→</span></button>
        <form class="jvo-invite" data-jvo-invite hidden><label class="jvo-invite-label">Teammate’s email<input type="email" required autocomplete="email" placeholder="alex@yourteam.com" aria-label="Teammate’s email"></label><button type="submit" class="jvo-primary">Add invitation</button></form>
        <p class="jvo-invite-status" data-jvo-invite-status aria-live="polite"></p>
      </section>
    </div>
  </div>`
}

export function launchDeck() {
  return `<div class="jvo-deck" data-jvo-deck data-jvo-slide="0"><div class="jvo-deck-slides">${deckSlides.map((slide,i)=>`<section class="jvo-slide${i===0?' jvo-slide--active':''}" data-jvo-slide-index="${i}" aria-label="Slide ${i+1}: ${slide.title}" ${i?'inert':''}><div class="jvo-deck-top"><span class="jvo-deck-brand">Morrow / launch</span><span class="jvo-deck-eyebrow">${slide.eyebrow}</span></div><h3>${slide.title}</h3><p class="jvo-deck-body">${slide.body}</p><div class="jvo-deck-stats">${slide.stats.map(([value,label])=>`<div><strong>${value}</strong><span>${label}</span></div>`).join('')}</div><blockquote>${slide.note}</blockquote><div class="jvo-deck-footnote">${slide.footer}</div></section>`).join('')}</div><div class="jvo-deck-controls"><button type="button" data-jvo-deck-move="-1" aria-label="Previous slide" disabled>←</button><span data-jvo-deck-count aria-live="polite">1 / 3</span><button type="button" data-jvo-deck-move="1" aria-label="Next slide">→</button><button type="button" class="jvo-deck-download" data-jvo-download>Markdown ↓</button><button type="button" class="jvo-deck-print" data-jvo-pdf>PDF ↓</button></div></div>`
}

const boundRoots = new WeakSet()
function showScreen(prototype, name) {
  prototype.dataset.jvoScreen = name
  prototype.querySelectorAll('[data-jvo-view]').forEach(view=>{const active=view.dataset.jvoView===name;view.classList.toggle('jvo-screen--active',active);view.inert=!active})
  prototype.querySelector('[data-jvo-step]').textContent = `${['goal','preview','plan'].indexOf(name)+1} of 3`
}
function downloadMarkdown() {
  const text = '# Morrow — launch decision\n\n## What we learned\n\nIllustrative pilot: 6 teams. Median first plan: 7 minutes. Assisted onboarding: 40 minutes per team. Show an example before requesting invitations.\n\n## What we changed\n\nReplace “Your entire team aligned in 60 seconds” with “A clear weekly plan. A team that knows what’s next.”\n\nReduce the first cohort from 50 to 20 teams.\n\n## Capacity estimate\n\n- Support budget: 20 hours.\n- 50 teams × 40 minutes = 33 hours 20 minutes; 13 hours 20 minutes over budget.\n- 20 teams × 40 minutes = 13 hours 20 minutes; 6 hours 40 minutes buffer.\n\n## What launches next\n\n1. Invite 20 teams.\n2. Show a populated example before inviting teammates.\n3. Review learning every week.\n\nSource: an illustrative Morrow scenario authored for Jarwiz product interaction studies.\n'
  const url=URL.createObjectURL(new Blob([text],{type:'text/markdown;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download='morrow-launch.md';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)
}

export function bindOutputs(root) {
  if(boundRoots.has(root))return
  boundRoots.add(root)
  root.addEventListener('click',event=>{
    const button=event.target.closest('button');if(!button||!root.contains(button))return
    const prototype=button.closest('[data-jvo-prototype]')
    if(prototype){
      if(button.hasAttribute('data-jvo-goal')){
        const index=Number(button.dataset.jvoGoal);prototype.querySelectorAll('[data-jvo-goal]').forEach(b=>{const active=b===button;b.classList.toggle('jvo-goal--selected',active);b.setAttribute('aria-pressed',String(active))});prototype.querySelectorAll('[data-jvo-goal-label]').forEach(label=>label.textContent=goals[index])
      }
      if(button.dataset.jvoNext)showScreen(prototype,button.dataset.jvoNext)
      if(button.hasAttribute('data-jvo-task')){
        const done=button.getAttribute('aria-pressed')!=='true';button.setAttribute('aria-pressed',String(done));button.classList.toggle('jvo-task--done',done);const count=prototype.querySelectorAll('[data-jvo-task][aria-pressed="true"]').length;prototype.querySelector('[data-jvo-progress]').textContent=`${count} of 3 things, a little clearer.`
      }
      if(button.hasAttribute('data-jvo-invite-open')){button.hidden=true;const form=prototype.querySelector('[data-jvo-invite]');form.hidden=false;form.querySelector('input').focus()}
    }
    const deck=button.closest('[data-jvo-deck]')
    if(deck&&button.hasAttribute('data-jvo-deck-move')){
      const next=Math.max(0,Math.min(2,Number(deck.dataset.jvoSlide)+Number(button.dataset.jvoDeckMove)));deck.dataset.jvoSlide=String(next);deck.querySelectorAll('[data-jvo-slide-index]').forEach(slide=>{const active=Number(slide.dataset.jvoSlideIndex)===next;slide.classList.toggle('jvo-slide--active',active);slide.inert=!active});deck.querySelector('[data-jvo-deck-count]').textContent=`${next+1} / 3`;deck.querySelector('[data-jvo-deck-move="-1"]').disabled=next===0;deck.querySelector('[data-jvo-deck-move="1"]').disabled=next===2
    }
    if(button.hasAttribute('data-jvo-download'))downloadMarkdown()
    if(button.hasAttribute('data-jvo-pdf')){const a=document.createElement('a');a.href=`${import.meta.env.BASE_URL}work/jarwiz/morrow-launch.pdf`;a.download='morrow-launch.pdf';a.click()}
  })
  root.addEventListener('submit',event=>{
    const form=event.target.closest('[data-jvo-invite]');if(!form)return
    event.preventDefault();const prototype=form.closest('[data-jvo-prototype]');const email=form.querySelector('input').value.trim();prototype.querySelector('[data-jvo-invite-status]').textContent=`Invitation ready for ${email}.`;form.hidden=true
  })
}
