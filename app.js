'use strict';

const STEP_NAMES={intro:'课程导入',learn:'认识星体',guide:'星跳引导',quiz:'认星测试',practice:'天空实战',binocular:'双筒模拟'};
const state={lesson:null,objects:new Map(),index:0,passed:false,bino:{x:50,y:50,drag:false}};
const $=id=>document.getElementById(id);
const ui={day:$('dayTag'),meta:$('meta'),title:$('lessonTitle'),goal:$('lessonGoal'),bar:$('progressBar'),sky:$('sky'),stars:$('starLayer'),lines:$('lineLayer'),bino:$('binocular'),caption:$('skyCaption'),kicker:$('stepKicker'),stepTitle:$('stepTitle'),content:$('stepContent'),list:$('guideList'),feedback:$('feedback'),back:$('backButton'),action:$('actionButton')};

async function getJSON(path){const response=await fetch(path);if(!response.ok)throw new Error(`${path} (${response.status})`);return response.json()}
async function loadLesson(){
  const day=new URLSearchParams(location.search).get('day')||'01';
  state.lesson=await getJSON(`data/lessons/day${String(day).padStart(2,'0')}.json`);
  const objects=await Promise.all(state.lesson.objects.map(id=>getJSON(`data/objects/${id}.json`)));
  objects.forEach(object=>state.objects.set(object.id,object));
  ui.day.textContent=`DAY ${String(state.lesson.day).padStart(2,'0')}`;
  ui.meta.textContent=`难度 ${state.lesson.difficulty} · ${state.lesson.duration}`;
  ui.title.textContent=state.lesson.title;ui.goal.textContent=state.lesson.goal;
  renderStep();
}

function allStars(){return [...state.objects.values()].flatMap(object=>object.stars||[])}
function renderSky(step){
  ui.stars.innerHTML='';ui.lines.innerHTML='';ui.bino.classList.toggle('active',step.type==='binocular');
  const hideLabels=step.hideLabels||['quiz','practice','binocular'].includes(step.type);
  allStars().forEach(star=>{
    const button=document.createElement('button');button.className='star';button.dataset.id=star.id;button.ariaLabel=hideLabels?'星点':star.name;
    button.style.cssText=`left:${star.x}%;top:${star.y}%;--size:${star.magnitudeSize||4}px;--color:${star.color||'#fff3db'}`;
    button.addEventListener('click',event=>{event.stopPropagation();handleStar(star)});ui.stars.appendChild(button);
    if(!hideLabels){const label=document.createElement('span');label.className='star-label';label.style.cssText=`left:${star.x}%;top:${star.y}%`;label.innerHTML=`${star.name}<small>${star.en||''}</small>`;ui.stars.appendChild(label)}
  });
  if(!step.hideLines&&['learn','guide'].includes(step.type)){state.objects.forEach(object=>(object.lines||[]).forEach(ids=>{const a=allStars().find(s=>s.id===ids[0]),b=allStars().find(s=>s.id===ids[1]);if(a&&b)ui.lines.insertAdjacentHTML('beforeend',`<line x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}"/>`)}))}
  if(step.type==='guide'&&step.action==='ursa_to_polaris'){const a=allStars().find(s=>s.id==='merak'),b=allStars().find(s=>s.id==='dubhe'),p=allStars().find(s=>s.id==='polaris');if(a&&b&&p)ui.lines.insertAdjacentHTML('beforeend',`<polyline points="${a.x},${a.y} ${b.x},${b.y} ${p.x},${p.y}"/>`)}
  ui.caption.textContent=step.type==='binocular'?'拖动双筒视场，对准目标后点击星点':step.type==='quiz'||step.type==='practice'?'点击你判断的目标星点':'';
}

function renderStep(){
  const step=state.lesson.steps[state.index];state.passed=!['quiz','practice','binocular'].includes(step.type);
  ui.bar.style.width=`${(state.index/state.lesson.steps.length)*100}%`;ui.kicker.textContent=`${STEP_NAMES[step.type]||step.type} · ${state.index+1}/${state.lesson.steps.length}`;
  ui.stepTitle.textContent=step.title||step.question||({guide:'跟随路径寻找',practice:'关掉辅助，再找一次',binocular:'举起 10×50 双筒'}[step.type]||'开始训练');
  ui.content.textContent=step.content||step.hint||'';ui.feedback.textContent='';ui.feedback.className='feedback';
  ui.list.innerHTML='';(step.steps||[]).forEach(text=>{const li=document.createElement('li');li.textContent=text;ui.list.appendChild(li)});
  renderSky(step);ui.back.disabled=state.index===0;ui.action.disabled=!state.passed;ui.action.textContent=state.index===state.lesson.steps.length-1?'完成课程':'下一步';
}

function handleStar(star){
  const step=state.lesson.steps[state.index];
  if(step.type==='learn'){const object=state.objects.get(step.target);if(object){ui.stepTitle.textContent=star.name;ui.content.textContent=star.description||object.description}}
  if(step.type==='quiz'||step.type==='practice')checkTarget(star,step);
  if(step.type==='binocular'){
    const rect=ui.sky.getBoundingClientRect(),sx=star.x*rect.width/100,sy=star.y*rect.height/100,bx=state.bino.x*rect.width/100,by=state.bino.y*rect.height/100;
    if(Math.hypot(sx-bx,sy-by)>92){showFeedback('目标还不在双筒视野内，先拖动圆形视场。');return}checkTarget(star,step);
  }
}
function checkTarget(star,step){if(star.id===step.target){state.passed=true;ui.action.disabled=false;showFeedback('✓ 正确，目标已找到。',true);document.querySelector(`[data-id="${star.id}"]`)?.classList.add('pulse')}else showFeedback(step.retryHint||'再观察一下周围星点，不会直接显示答案。')}
function showFeedback(text,ok=false){ui.feedback.textContent=text;ui.feedback.classList.toggle('ok',ok)}

ui.back.addEventListener('click',()=>{if(state.index>0){state.index--;renderStep()}});
ui.action.addEventListener('click',()=>{if(ui.action.dataset.done==='true'){ui.action.dataset.done='false';state.index=0;renderStep();return}if(!state.passed)return;if(state.index<state.lesson.steps.length-1){state.index++;renderStep()}else completeLesson()});
function completeLesson(){const c=state.lesson.completion;localStorage.setItem(`starpath.day${state.lesson.day}.completed`,new Date().toISOString());ui.bar.style.width='100%';ui.kicker.textContent='课程完成';ui.stepTitle.textContent='今晚的天空地图又清晰了一点';ui.content.textContent=`获得能力：${c.ability}。已认识：${c.knownObjects.map(id=>state.objects.get(id)?.name||id).join('、')}。Day ${c.unlockDay} 已解锁。`;ui.list.innerHTML='';ui.action.textContent='再练一次';ui.action.dataset.done='true'}

function setBino(event){const rect=ui.sky.getBoundingClientRect(),point=event.touches?.[0]||event;state.bino.x=Math.max(0,Math.min(100,(point.clientX-rect.left)*100/rect.width));state.bino.y=Math.max(0,Math.min(100,(point.clientY-rect.top)*100/rect.height));ui.bino.style.setProperty('--bx',`${state.bino.x}%`);ui.bino.style.setProperty('--by',`${state.bino.y}%`)}
ui.sky.addEventListener('pointerdown',event=>{if(state.lesson?.steps[state.index]?.type==='binocular'){state.bino.drag=true;setBino(event)}});window.addEventListener('pointermove',event=>{if(state.bino.drag)setBino(event)});window.addEventListener('pointerup',()=>state.bino.drag=false);
loadLesson().catch(error=>{ui.title.textContent='课程加载失败';ui.goal.textContent='请通过本地服务器打开本项目。';ui.content.textContent=error.message;console.error(error)});
