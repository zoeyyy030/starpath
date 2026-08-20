'use strict';

const STEP_NAMES={intro:'课程导入',learn:'认识星体',guide:'星跳引导',quiz:'认星测试',practice:'天空实战',binocular:'双筒模拟'};
const state={lesson:null,objects:new Map(),index:0,passed:false,mapAngle:0,bino:{x:50,y:50,drag:false}};
const $=id=>document.getElementById(id);
const ui={day:$('dayTag'),meta:$('meta'),title:$('lessonTitle'),goal:$('lessonGoal'),bar:$('progressBar'),sky:$('sky'),stars:$('starLayer'),lines:$('lineLayer'),bino:$('binocular'),caption:$('skyCaption'),kicker:$('stepKicker'),stepTitle:$('stepTitle'),content:$('stepContent'),list:$('guideList'),interaction:$('interactionPanel'),feedback:$('feedback'),back:$('backButton'),action:$('actionButton')};

async function getJSON(path){const response=await fetch(path);if(!response.ok)throw new Error(`${path} (${response.status})`);return response.json()}
async function loadCatalog(){
  const entries=await getJSON('data/lessons/index.json');
  const lessons=await Promise.all(entries.map(entry=>getJSON(`data/lessons/${entry.file}`)));
  const grid=$('lessonGrid');grid.innerHTML='';let completed=0;
  lessons.sort((a,b)=>a.day-b.day).forEach(lesson=>{
    const done=Boolean(localStorage.getItem(`starpath.day${lesson.day}.completed`));if(done)completed++;
    const card=document.createElement('a');card.className=`lesson-card${done?' completed':''}`;card.href=`?day=${String(lesson.day).padStart(2,'0')}`;
    card.innerHTML=`<div class="lesson-day">DAY ${String(lesson.day).padStart(2,'0')}</div><h2>${lesson.title}</h2><p>${lesson.goal}</p><div class="lesson-meta"><span>难度 ${lesson.difficulty} · ${lesson.duration}</span><span class="${done?'complete-mark':''}">${done?'✓ 已完成':'开始训练 →'}</span></div>`;grid.appendChild(card);
  });
  $('completedCount').textContent=completed;$('lessonCount').textContent=lessons.length;
}
async function loadLesson(){
  const day=new URLSearchParams(location.search).get('day');
  state.lesson=await getJSON(`data/lessons/day${String(day).padStart(2,'0')}.json`);
  const objects=await Promise.all(state.lesson.objects.map(id=>getJSON(`data/objects/${id}.json`)));
  objects.forEach(object=>state.objects.set(object.id,object));
  ui.day.textContent=`DAY ${String(state.lesson.day).padStart(2,'0')}`;ui.meta.textContent=`难度 ${state.lesson.difficulty} · ${state.lesson.duration}`;ui.title.textContent=state.lesson.title;ui.goal.textContent=state.lesson.goal;renderStep();
}

function allStars(){return [...state.objects.values()].flatMap(object=>object.stars||[])}
function targetMatches(star,target){if(star.id===target)return true;return Boolean(state.objects.get(target)?.stars?.some(item=>item.id===star.id))}
function drawLine(a,b){if(a&&b)ui.lines.insertAdjacentHTML('beforeend',`<line x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}"/>`)}
function renderSky(step){
  ui.stars.innerHTML='';ui.lines.innerHTML='';ui.bino.classList.toggle('active',step.type==='binocular');
  const hideLabels=step.hideLabels||['quiz','practice','binocular'].includes(step.type);
  allStars().forEach(star=>{
    const button=document.createElement('button');button.className='star';button.dataset.id=star.id;button.ariaLabel=hideLabels?'星点':star.name;button.style.cssText=`left:${star.x}%;top:${star.y}%;--size:${star.magnitudeSize||4}px;--color:${star.color||'#fff3db'}`;button.addEventListener('click',event=>{event.stopPropagation();handleStar(star)});ui.stars.appendChild(button);
    if(!hideLabels){const label=document.createElement('span');label.className='star-label';label.style.cssText=`left:${star.x}%;top:${star.y}%`;label.innerHTML=`${star.name}<small>${star.en||''}</small>`;ui.stars.appendChild(label)}
  });
  if(!step.hideLines&&['learn','guide'].includes(step.type))state.objects.forEach(object=>(object.lines||[]).forEach(ids=>drawLine(allStars().find(s=>s.id===ids[0]),allStars().find(s=>s.id===ids[1]))));
  if(step.type==='guide'&&step.action==='ursa_to_polaris'){drawLine(allStars().find(s=>s.id==='merak'),allStars().find(s=>s.id==='dubhe'));drawLine(allStars().find(s=>s.id==='dubhe'),allStars().find(s=>s.id==='polaris'))}
  if(step.type==='guide'&&step.action==='polaris_to_cassiopeia')drawLine(allStars().find(s=>s.id==='polaris'),allStars().find(s=>s.id==='schedar'));
  ui.caption.textContent=step.type==='binocular'?'拖动双筒视场，对准目标后点击星点':['quiz','practice'].includes(step.type)&&step.target?'点击你判断的目标星点':'';
}

function renderStep(){
  const step=state.lesson.steps[state.index];state.mapAngle=0;ui.action.dataset.done='false';state.passed=!['quiz','practice','binocular'].includes(step.type)||step.required===false;
  ui.bar.style.width=`${state.index/state.lesson.steps.length*100}%`;ui.kicker.textContent=`${STEP_NAMES[step.type]||step.type} · ${state.index+1}/${state.lesson.steps.length}`;
  ui.stepTitle.textContent=step.title||step.question||({guide:'跟随路径寻找',practice:'完成这一项实战',binocular:'举起 10×50 双筒'}[step.type]||'开始训练');
  ui.content.textContent=step.content||step.instruction||step.hint||'';ui.feedback.textContent='';ui.feedback.className='feedback';ui.list.innerHTML='';ui.interaction.innerHTML='';
  (step.steps||[]).forEach(text=>{const li=document.createElement('li');li.textContent=text;ui.list.appendChild(li)});renderSky(step);if(step.type==='practice')renderPractice(step);
  ui.back.disabled=state.index===0;ui.action.disabled=!state.passed;ui.action.textContent=state.index===state.lesson.steps.length-1?'完成课程':step.required===false?'跳过 / 下一步':'下一步';
}

function addChoice(label,value,answer,success){const button=document.createElement('button');button.className='choice-btn';button.textContent=label;button.addEventListener('click',()=>{if(value===answer){button.classList.add('correct');state.passed=true;ui.action.disabled=false;showFeedback(success||'✓ 正确。',true)}else{button.classList.add('wrong');showFeedback('再想一想，观察形状或方向线索。')}});ui.interaction.appendChild(button)}
function renderPractice(step){
  if(step.mode==='shape_recognition'){ui.interaction.innerHTML='<div class="practice-visual">A ·—·—·<br>B ·∨·∨·<br>C ·—··—·</div>';addChoice('A：直线','a','b');addChoice('B：W / M','b','b','✓ 五颗星形成了仙后座的 W/M。');addChoice('C：散乱星点','c','b');return}
  if(step.mode==='angle_estimation'){ui.interaction.innerHTML='<div class="practice-visual">★　　　　★<br><small>估算两星角距离</small></div>';(step.choices||[]).forEach(choice=>addChoice(`${choice.label} · ${choice.angle}°`,choice.id,'fist','✓ 大约 10°，相当于伸直手臂的一拳。'));return}
  if(step.mode==='field_of_view_compare'){ui.interaction.innerHTML='<div class="practice-visual">◯ 10×50<br><small>视场约 6°</small></div>';addChoice('小指 · 1°','finger','three');addChoice('三指 · 5°','three','three','✓ 最接近三指宽。');addChoice('一拳 · 10°','fist','three');return}
  if(step.mode==='rotate_sky_map'){
    ui.interaction.innerHTML='<div class="practice-visual"><div class="map-disc" id="mapDisc">N ↑<br>北天星图</div></div>';const disc=$('mapDisc');const turn=amount=>{state.mapAngle=(state.mapAngle+amount+360)%360;disc.style.transform=`rotate(${state.mapAngle}deg)`;if(state.mapAngle===180){state.passed=true;ui.action.disabled=false;showFeedback('✓ 面向北方时，把北方一侧转到屏幕下方。',true)}};const left=document.createElement('button');left.className='choice-btn';left.textContent='↶ 旋转 90°';left.onclick=()=>turn(-90);const right=document.createElement('button');right.className='choice-btn';right.textContent='旋转 90° ↷';right.onclick=()=>turn(90);ui.interaction.append(left,right);return
  }
  if(step.mode==='sky_map_match'){ui.interaction.innerHTML='<div class="practice-visual">北斗　★北极星　W</div>';addChoice('星图 A：左右颠倒','a','b');addChoice('星图 B：路标对应','b','b','✓ 三个北天路标的位置关系一致。');addChoice('星图 C：方向相反','c','b');return}
  if(step.mode==='direction_check'){ui.interaction.innerHTML='<div class="practice-visual">★ 北极星<br>↓<br>地平线</div>';['东','南','西','北'].forEach(value=>addChoice(value,value,'北','✓ 面向北极星所在的地平线方向，就是北方。'));return}
  if(step.mode==='sky_map_recall'){ui.interaction.innerHTML='<div class="practice-visual">北斗　？　仙后座</div>';const button=document.createElement('button');button.className='choice-btn wide-choice';button.textContent='我已在脑中放好位置，显示答案';button.onclick=()=>{ui.interaction.querySelector('.practice-visual').innerHTML='北斗　→　★ 北极星　→　W 仙后座';state.passed=true;ui.action.disabled=false;showFeedback('✓ 北极星位于两组北天路标之间。',true)};ui.interaction.appendChild(button)}
}

function handleStar(star){
  const step=state.lesson.steps[state.index];
  if(step.type==='learn'){const object=state.objects.get(step.target);ui.stepTitle.textContent=star.name;ui.content.textContent=star.description||object?.description||step.content}
  if(step.type==='quiz'||(step.type==='practice'&&step.target&&step.mode!=='shape_recognition'))checkTarget(star,step);
  if(step.type==='binocular'){
    const rect=ui.sky.getBoundingClientRect(),sx=star.x*rect.width/100,sy=star.y*rect.height/100,bx=state.bino.x*rect.width/100,by=state.bino.y*rect.height/100;
    if(Math.hypot(sx-bx,sy-by)>92){showFeedback('目标还不在双筒视野内，先拖动圆形视场。');return}checkTarget(star,step)
  }
}
function checkTarget(star,step){if(targetMatches(star,step.target)){state.passed=true;ui.action.disabled=false;showFeedback('✓ 正确，目标已找到。',true);document.querySelector(`[data-id="${star.id}"]`)?.classList.add('pulse')}else showFeedback(step.retryHint||'再观察一下周围星点，不会直接显示答案。')}
function showFeedback(text,ok=false){ui.feedback.textContent=text;ui.feedback.classList.toggle('ok',ok)}

ui.back.addEventListener('click',()=>{if(state.index>0){state.index--;renderStep()}});
ui.action.addEventListener('click',()=>{if(ui.action.dataset.done==='true'){location.href='./';return}if(!state.passed)return;if(state.index<state.lesson.steps.length-1){state.index++;renderStep()}else completeLesson()});
function completeLesson(){const c=state.lesson.completion;localStorage.setItem(`starpath.day${state.lesson.day}.completed`,new Date().toISOString());ui.bar.style.width='100%';ui.kicker.textContent=state.lesson.day===7?'第一阶段完成':'课程完成';ui.stepTitle.textContent=state.lesson.day===7?'你的北天地图已经建立':'今晚的天空地图又清晰了一点';ui.content.textContent=state.lesson.day===7?'已掌握：北斗七星、北极星、仙后座。获得：北天导航 Lv1。下一阶段从夏季大三角开始。':`获得能力：${c.ability}。已认识：${c.knownObjects.map(id=>state.objects.get(id)?.name||id).join('、')||'新的天空技能'}。Day ${c.unlockDay} 已解锁。`;ui.list.innerHTML='';ui.interaction.innerHTML='';ui.action.textContent='返回课程列表';ui.action.dataset.done='true'}

function setBino(event){const rect=ui.sky.getBoundingClientRect(),point=event.touches?.[0]||event;state.bino.x=Math.max(0,Math.min(100,(point.clientX-rect.left)*100/rect.width));state.bino.y=Math.max(0,Math.min(100,(point.clientY-rect.top)*100/rect.height));ui.bino.style.setProperty('--bx',`${state.bino.x}%`);ui.bino.style.setProperty('--by',`${state.bino.y}%`)}
ui.sky.addEventListener('pointerdown',event=>{if(state.lesson?.steps[state.index]?.type==='binocular'){state.bino.drag=true;setBino(event)}});window.addEventListener('pointermove',event=>{if(state.bino.drag)setBino(event)});window.addEventListener('pointerup',()=>state.bino.drag=false);

const requestedDay=new URLSearchParams(location.search).get('day');
if(requestedDay){$('catalog').classList.add('hidden');$('app').classList.remove('hidden');loadLesson().catch(error=>{ui.title.textContent='课程加载失败';ui.goal.textContent='请返回课程列表重试。';ui.content.textContent=error.message;console.error(error)})}else loadCatalog().catch(error=>{$('catalogStatus').textContent='课程列表加载失败，请刷新重试。';console.error(error)});
