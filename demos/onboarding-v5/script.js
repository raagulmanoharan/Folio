/* One authored, seekable product journey. UI is rebuilt for the demo. */
const proof = new URLSearchParams(location.search).get('proof');
if (proof) {
  document.querySelectorAll('.scene').forEach(scene => {scene.style.opacity=scene.id===proof?'1':'0';scene.style.pointerEvents=scene.id===proof?'auto':'none'});
  document.querySelector('.pointer').style.opacity='0';document.querySelector('.click-ring').style.opacity='0';
  document.querySelector('.role-check').style.opacity='0';document.querySelector('.idea-focus').style.opacity='0';
  document.querySelector('.prompt-placeholder').style.opacity='0';
} else {
  const followup = document.querySelector('.followup > span:first-child');
  followup.innerHTML='<span class="followup-idle">Where should we take this?</span><span class="followup-ready">Explore the example-first direction</span>';
  document.querySelectorAll('.prompt-line').forEach(line=>{
    const text=line.textContent;line.textContent='';
    for(const character of text){const glyph=document.createElement('span');glyph.className='glyph';glyph.textContent=character;line.append(glyph)}
  });
  const tl=gsap.timeline({paused:true,defaults:{ease:'power2.out'}});
  window.__timelines=window.__timelines||{};
  window.__timelines.onboarding=tl;
  tl.addLabel('choose',0).addLabel('ask',4.5).addLabel('ideas',12.8).addLabel('continue',18.5);
  tl.from('.app-window',{y:18,scale:.985,opacity:0,duration:.7,ease:'power3.out'},.12);
  tl.from('.app-header',{opacity:0,y:-8,duration:.45,ease:'sine.out'},.28);
  tl.from('#persona h1',{opacity:0,y:22,duration:.65,ease:'power3.out'},.4);
  tl.from('#persona .subheading',{opacity:0,duration:.55,ease:'sine.out'},.55);
  tl.from('.role',{opacity:0,y:24,duration:.6,stagger:.065,ease:'power2.out'},.72);
  tl.from('.persona-actions',{opacity:0,y:12,duration:.5,ease:'power3.out'},1.02);
  tl.from('.onboarding-note',{opacity:0,duration:.5,ease:'sine.out'},1.16);
  tl.set('.role-check',{opacity:0,scale:.5},0);
  tl.set('.idea-focus',{opacity:0},0);
  tl.set('.click-ring',{opacity:0},0);
  tl.set('.pointer',{opacity:0,x:1300,y:1020},0);
  const point=(x,y,time,duration=.55)=>tl.to('.pointer',{x,y,duration,ease:'power2.inOut'},time);
  const click=(time)=>{tl.to('.pointer',{scale:.88,duration:.09,ease:'sine.out'},time);tl.to('.pointer',{scale:1,duration:.16,ease:'power2.out'},time+.09)};
  tl.to('.pointer',{opacity:1,duration:.18},1.65);point(597,616,1.7,.6);
  tl.to('.role-product',{borderColor:'#87978c',y:-3,duration:.2},2.25);click(2.48);
  tl.to('.role-product',{backgroundColor:'#171918',color:'#ffffff',borderColor:'#171918',y:0,duration:.23},2.51);
  tl.to('.role-product small',{color:'#d3dcd4',duration:.23},2.51);
  tl.to('.role-product .role-icon',{backgroundColor:'#343d36',color:'#ffffff',duration:.23},2.51);
  tl.to('.role-check',{opacity:1,scale:1,duration:.25,ease:'back.out(1.25)'},2.57);
  tl.to('.continue',{backgroundColor:'#171918',color:'#ffffff',duration:.25},2.65);
  point(901,931,3.05,.5);click(3.68);
  // One related-screen transition. The app frame stays in place.
  tl.to('#persona',{opacity:0,scale:.985,duration:.6,ease:'power2.inOut'},3.9);
  tl.fromTo('#prompt',{opacity:0,scale:1.015},{opacity:1,scale:1,duration:.6,ease:'power2.inOut'},3.9);
  tl.from('.context-pill',{opacity:0,y:8,duration:.5,ease:'sine.out'},4.06);
  tl.from('#prompt h1',{opacity:0,y:17,duration:.55,ease:'power3.out'},4.12);
  tl.from('.prompt-card',{opacity:0,y:24,duration:.6,ease:'power2.out'},4.2);
  tl.from('.prompt-hints button',{opacity:0,y:8,duration:.45,stagger:.06,ease:'sine.out'},4.38);
  tl.set('.prompt-line .glyph',{opacity:0},0);
  point(471,672,4.65,.5);click(5.2);
  tl.to('.prompt-card',{borderColor:'#98aa9c',boxShadow:'0 0 0 3px #e7ede7,0 20px 35px #17191806',duration:.24},5.2);
  tl.to('.pointer',{opacity:0,duration:.25},5.38);
  tl.to('.prompt-placeholder',{opacity:0,duration:.15},5.38);
  tl.to('.line-one .glyph',{opacity:1,duration:.01,stagger:{amount:1.74},ease:'none'},5.55);
  tl.to('.line-two .glyph',{opacity:1,duration:.01,stagger:{amount:1.07},ease:'none'},7.34);
  tl.set('.pointer',{x:1593,y:948},8.62);tl.to('.pointer',{opacity:1,duration:.2},8.62);point(1528,813,8.67,.5);click(9.38);
  tl.to('.send',{scale:.94,duration:.1,yoyo:true,repeat:1,ease:'sine.inOut'},9.38);
  // The camera settles before the results populate; there is no crop animation.
  tl.to('#prompt',{opacity:0,scale:.985,duration:.65,ease:'power2.inOut'},9.65);
  tl.fromTo('#result',{opacity:0},{opacity:1,duration:.65,ease:'power2.inOut'},9.65);
  tl.to('.app-window',{scale:1.055,duration:1,ease:'power2.inOut'},9.65);
  tl.to('.pointer',{opacity:0,duration:.25},9.7);
  tl.from('.result-top',{opacity:0,y:15,duration:.55,ease:'power3.out'},10.05);
  tl.from('.problem-chip',{opacity:0,y:10,duration:.55,ease:'sine.out'},10.22);
  tl.from('.idea',{opacity:0,y:30,duration:.65,stagger:.16,ease:'power3.out'},10.85);
  tl.from('.idea-example .micro-title',{opacity:0,y:8,duration:.35,ease:'power2.out'},11.82);
  tl.from('.idea-example .task',{opacity:0,x:-9,duration:.35,stagger:.13,ease:'power2.out'},12.02);
  tl.from('.mini-note',{opacity:0,y:10,duration:.4,ease:'sine.out'},12.05);
  tl.from('.notes-arrow',{opacity:0,x:-8,duration:.35,ease:'power2.out'},12.35);
  tl.from('.mini-result',{opacity:0,y:9,duration:.4,ease:'power3.out'},12.62);
  tl.from('.guided-step,.guided-question',{opacity:0,y:8,duration:.4,stagger:.1,ease:'sine.out'},12.2);
  tl.from('.guided-options span',{opacity:0,scale:.97,duration:.35,stagger:.12,ease:'power2.out'},12.65);
  tl.from('.result-bottom',{opacity:0,y:12,duration:.55,ease:'power3.out'},13.2);
  tl.set('.followup-ready',{opacity:0},0);
  // An idea is a next step, not a static card: selection prepares a follow-up.
  tl.set('.pointer',{x:1350,y:1160},16.7);tl.to('.pointer',{opacity:1,duration:.2},16.7);point(492,976,16.75,.65);
  tl.to('.idea-example',{y:-5,duration:.25,ease:'power2.out'},17.35);click(17.65);
  tl.to('.idea-focus',{opacity:1,duration:.25,ease:'sine.out'},17.68);
  tl.to('.followup-idle',{opacity:0,duration:.2},17.75);
  tl.to('.followup-ready',{opacity:1,duration:.3},17.85);
  tl.to('.followup > span:last-child',{backgroundColor:'#171918',color:'#ffffff',duration:.3},17.85);
  point(1795,1170,18.2,.6);tl.to('.pointer',{opacity:0,duration:.25},18.72);
  tl.to('.app-window',{opacity:0,duration:.4,ease:'sine.inOut'},21.6);
  // Preview interactions seek the authored state, then continue the same film.
  document.querySelector('.role-product').addEventListener('click',()=>tl.play(2.48));
  document.querySelector('.continue').addEventListener('click',()=>tl.play(3.68));
  document.querySelector('.send').addEventListener('click',()=>tl.play(9.38));
  document.querySelector('.idea-example .idea-action').addEventListener('click',()=>tl.play(17.65));
}
