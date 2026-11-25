import './v2-source-controls.css'

// Anatomy and labels: Jarwiz MachineCardShapeUtil.tsx and ExportMenu.tsx.
// Scenario text is authored; these controls do not call a model or a server.
const svg = (body,size=17) => `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${body}</svg>`
const plus = () => svg('<path d="M12 5v14M5 12h14"/>',16)
const down = () => svg('<path d="M12 4v11m-4-4 4 4 4-4M5 19h14"/>',16)
const arrow = () => svg('<path d="M4 12h16m-5-5 5 5-5 5"/>',15)
const slides = () => svg('<rect x="3" y="4" width="18" height="12" rx="1.5"/><path d="M12 16v3M9 21h6"/>',18)
const doc = () => svg('<path d="M6 2h8l4 4v14a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1zm8 0v4h4M8 12h8M8 16h8M8 8h3"/>',18)

export function machineInput() {
  return `<div class="jvs-machine-card" data-jvs-machine>
    <div class="jvs-machine-head"><span class="jvs-machine-badge">${svg('<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',16)}</span><span class="jvs-machine-name">Effort–Impact Matrix</span></div>
    <p class="jvs-machine-description">Scores each idea on effort and impact, then drops it into a Quick wins / Big bets / Fill-ins / Time sinks quadrant.</p>
    <textarea class="jvs-machine-subject" rows="4" aria-label="What should I analyse?" placeholder="What should I analyse?">Prioritize Morrow’s first-run work:
Example workspace
Clearer invite copy
Calendar integration
Slack digest</textarea>
    <div class="jvs-machine-options"><label><input type="checkbox" name="verdict" checked> <span>Sequencing verdict</span></label><label><input type="checkbox" name="scores"> <span>Score table</span></label></div>
    <button type="button" class="jvs-machine-run" data-action="matrix" title="Run this machine (⌘↵)"><span>Run analysis</span>${arrow()}</button>
  </div>`
}

function exportRow(mode,title,description,icon) {
  return `<div class="jvs-export-row" role="menuitem" data-jvs-export-row="${mode}"><span class="jvs-export-row-icon">${icon}</span><span class="jvs-export-row-copy"><span class="jvs-export-row-title">${title}</span><span class="jvs-export-row-description">${description}</span><span class="jvs-export-progress" hidden><span><i></i></span><small>Reading your whole board…</small></span></span><button type="button" class="jvs-export-row-action" data-jvs-export-build="${mode}" ${mode==='slideshow'?'data-action="export"':''} aria-label="Build the ${mode==='slideshow'?'slideshow':'markdown'}" title="Build the ${mode==='slideshow'?'slideshow':'markdown'}">${plus()}</button></div>`
}

export function exportEntry() {
  return `<div class="jvs-export" data-jvs-export><button type="button" class="jvs-export-trigger" data-jvs-export-trigger aria-haspopup="menu" aria-expanded="false">${svg('<path d="M12 15V4m-4 4 4-4 4 4M5 15v3a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-3"/>',15)}<span>Export</span>${svg('<path d="m6 9 6 6 6-6"/>',10)}</button><div class="jvs-export-menu" role="menu" aria-label="Export this board" hidden>${exportRow('slideshow','As a slideshow','A presentation-ready PDF deck built from your board',slides())}${exportRow('markdown','Markdown for another LLM','A comprehensive handoff to continue elsewhere',doc())}</div></div>`
}

const bound = new WeakSet()
export function bindExportEntry(root) {
  if(bound.has(root))return
  bound.add(root)
  const close = () => root.querySelectorAll('[data-jvs-export]').forEach(entry=>{entry.querySelector('.jvs-export-menu').hidden=true;entry.querySelector('[data-jvs-export-trigger]').setAttribute('aria-expanded','false')})
  root.addEventListener('click',event=>{
    const target=event.target.closest('button');if(!target)return
    if(target.hasAttribute('data-jvs-export-trigger')){
      const menu=target.closest('[data-jvs-export]').querySelector('.jvs-export-menu');menu.hidden=!menu.hidden;target.setAttribute('aria-expanded',String(!menu.hidden));return
    }
    if(!target.closest('[data-jvs-export]'))close()
    if(target.hasAttribute('data-jvs-export-build')){
      const mode=target.dataset.jvsExportBuild,row=target.closest('[data-jvs-export-row]')
      if(row.dataset.ready==='true'){
        root.querySelector(mode==='slideshow'?'[data-jvo-pdf]':'[data-jvo-download]')?.click();return
      }
      // A compressed authored-output preparation state, retaining the actual
      // source menu's independent inline progress → download anatomy.
      target.disabled=true;const progress=row.querySelector('.jvs-export-progress');progress.hidden=false
      setTimeout(()=>{
        row.dataset.ready='true';progress.hidden=true;target.disabled=false;target.innerHTML=down();target.removeAttribute('data-action');target.setAttribute('aria-label',mode==='slideshow'?'Download PDF':'Download markdown');target.title=mode==='slideshow'?'Download PDF':'Download .md'
        if(mode==='markdown')root.querySelector('[data-jvo-download]')?.click()
      },450)
    }
  })
  root.addEventListener('input',event=>{if(event.target.matches('.jvs-machine-subject'))event.target.closest('[data-jvs-machine]').querySelector('.jvs-machine-run').disabled=!event.target.value.trim()})
  root.addEventListener('keydown',event=>{
    if(event.key==='Escape'){close();return}
    if((event.metaKey||event.ctrlKey)&&event.key==='Enter'&&event.target.matches('.jvs-machine-subject')){event.preventDefault();event.target.closest('[data-jvs-machine]').querySelector('.jvs-machine-run').click()}
  })
}
