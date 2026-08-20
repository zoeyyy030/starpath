import {DataLoader} from './DataLoader.js';
import {ProgressManager} from './ProgressManager.js';
import {SkyRenderer} from './SkyRenderer.js';
import {GuideRenderer} from './GuideRenderer.js';
import {QuizEngine} from './QuizEngine.js';
import {PracticeRenderer} from './PracticeRenderer.js';
import {BinocularEngine} from './BinocularEngine.js';

const STEP_NAMES={intro:'课程导入',learn:'认识目标',guide:'路径教学',quiz:'认星测试',practice:'天空实战',binocular:'双筒模拟'};
const $=id=>document.getElementById(id);

export class LessonPlayer {
  constructor(){
    this.params=new URLSearchParams(location.search);this.devMode=this.params.get('dev')==='1';this.loader=new DataLoader();this.progress=new ProgressManager(this.devMode);this.lesson=null;this.objects=new Map();this.index=0;this.passed=false;this.finished=false;this.practiceResult=null;
    this.ui={catalog:$('catalog'),player:$('player'),chapterList:$('chapterList'),catalogStatus:$('catalogStatus'),day:$('dayTag'),stats:$('lessonStats'),chapter:$('chapterName'),title:$('lessonTitle'),goal:$('lessonGoal'),dots:$('stepDots'),devStep:$('devStepId'),skyRoot:$('sky'),starLayer:$('starLayer'),lineLayer:$('lineLayer'),caption:$('skyCaption'),bino:$('binocular'),kicker:$('stepKicker'),stepTitle:$('stepTitle'),content:$('stepContent'),list:$('guideList'),interaction:$('interactionPanel'),feedback:$('feedback'),back:$('backButton'),action:$('actionButton')};
    this.sky=new SkyRenderer({root:this.ui.skyRoot,starLayer:this.ui.starLayer,lineLayer:this.ui.lineLayer,caption:this.ui.caption});this.guide=new GuideRenderer(this.sky,this.ui.list);this.quiz=new QuizEngine(this.sky);this.practice=new PracticeRenderer(this.ui.interaction);this.binocular=new BinocularEngine({skyRoot:this.ui.skyRoot,overlay:this.ui.bino,sky:this.sky});this.sky.setPointHandler(id=>this.onPoint(id));
    this.ui.back.addEventListener('click',()=>this.previous());this.ui.action.addEventListener('click',()=>this.next());
  }
  async init(){const day=this.params.get('day');if(day)await this.openLesson(Number(day));else await this.showCatalog()}
  async showCatalog(){
    this.ui.catalog.classList.remove('hidden');this.ui.player.classList.add('hidden');const manifest=await this.loader.loadManifest();const lessons=await this.loader.discoverLessons();$('completedCount').textContent=this.progress.data.completedDays.length;$('lessonCount').textContent=lessons.length;this.ui.chapterList.innerHTML='';
    manifest.chapters.forEach(chapter=>{
      const section=document.createElement('section');section.className='chapter-section';const rows=lessons.filter(lesson=>lesson.chapterId===chapter.id);section.innerHTML=`<header><span>阶段 ${chapter.order}</span><h2>${chapter.title}</h2><p>Day ${String(rows[0]?.day||'--').padStart(2,'0')}–${String(rows.at(-1)?.day||'--').padStart(2,'0')}</p></header><div class="lesson-grid"></div>`;const grid=section.querySelector('.lesson-grid');
      rows.forEach(lesson=>{const done=this.progress.isCompleted(lesson.day),unlocked=this.progress.isUnlocked(lesson.day),current=!done&&lesson.day===this.progress.data.currentDay;const link=document.createElement('a');link.className=`lesson-card ${done?'completed':current?'current':unlocked?'':'locked'}`;link.href=`?day=${String(lesson.day).padStart(2,'0')}${this.devMode?'&dev=1':''}`;link.innerHTML=`<div class="card-top"><span>DAY ${String(lesson.day).padStart(2,'0')}</span><b>${done?'✓ 已完成':current?'● 当前':unlocked?'可学习':'🔒 未解锁'}</b></div><h3>${lesson.title}</h3><p>${lesson.goal}</p><small>${lesson.duration} · 难度 ${'★'.repeat(lesson.difficulty)}${'☆'.repeat(5-lesson.difficulty)}</small>`;grid.appendChild(link)});this.ui.chapterList.appendChild(section)
    });
    if(this.devMode){$('devPanel').classList.remove('hidden');$('devStatus').textContent=`当前解锁 Day ${this.progress.data.currentDay}`;$('unlockAll').onclick=()=>{this.progress.unlockAll();location.reload()};$('resetProgress').onclick=()=>{this.progress.reset();location.reload()}}
  }
  async openLesson(day){
    this.ui.catalog.classList.add('hidden');this.ui.player.classList.remove('hidden');this.lesson=await this.loader.loadLesson(day);this.objects=await this.loader.loadObjects(this.lesson.objects);const saved=this.progress.data.lessonProgress[day]?.stepId;const savedIndex=this.lesson.steps.findIndex(step=>step.id===saved);this.index=savedIndex>=0?savedIndex:0;
    this.ui.day.textContent=`DAY ${String(day).padStart(2,'0')}`;this.ui.stats.textContent=`${this.lesson.duration} · 难度 ${'★'.repeat(this.lesson.difficulty)}${'☆'.repeat(5-this.lesson.difficulty)}`;this.ui.chapter.textContent=this.lesson.chapter;this.ui.title.textContent=this.lesson.title;this.ui.goal.textContent=this.lesson.goal;this.renderStep();
  }
  renderStep(){
    const step=this.lesson.steps[this.index];this.finished=false;this.practiceResult=null;this.quiz.reset();this.practice.reset();this.binocular.stop();this.passed=!['quiz','practice','binocular'].includes(step.type)||step.required===false;
    this.progress.setStep(this.lesson.day,step.id);this.ui.kicker.textContent=`${STEP_NAMES[step.type]||step.type} · ${this.index+1}/${this.lesson.steps.length}`;this.ui.stepTitle.textContent=step.title||step.question||'完成训练';this.ui.content.textContent=step.content||step.instruction||step.hint||'';this.ui.list.innerHTML='';this.ui.feedback.textContent='';this.ui.feedback.className='feedback';this.ui.interaction.innerHTML='';this.ui.devStep.textContent=step.id;this.ui.devStep.classList.toggle('hidden',!this.devMode);
    this.ui.dots.innerHTML=this.lesson.steps.map((_,i)=>`<i class="${i<this.index?'done':i===this.index?'active':''}"></i>`).join('');
    const assessmentStep=step.type==='quiz';
    this.sky.render(this.objects,{hideLabels:step.hideLabels??assessmentStep,hideLines:step.hideLines??assessmentStep,caption:this.captionFor(step)});
    if(step.type==='guide')this.guide.render(step);else(step.steps||[]).forEach(text=>{const li=document.createElement('li');li.textContent=text;this.ui.list.appendChild(li)});
    if(step.type==='quiz')this.quiz.start(step);
    if(step.type==='practice'){
      this.practice.start(step,{onComplete:result=>this.pass(result),onFeedback:(text,ok)=>this.feedback(text,ok)});
      if(step.mode==='target_centering')this.binocular.start(step.target,()=>{this.feedback('✓ 目标已稳定进入双筒中央。',true);this.pass()},{holdMs:step.holdMs||500});
    }
    if(step.type==='binocular')this.binocular.start(step.target,()=>{this.feedback('✓ 目标已稳定进入双筒中央。',true);this.pass()},{holdMs:step.holdMs||500});
    this.updateNav();
  }
  captionFor(step){if(step.type==='binocular'||step.mode==='target_centering')return '拖动圆形视场，将目标保持在中央约 0.5 秒';if(['quiz','blind_sky','sequence_click','star_hop'].includes(step.type)||['blind_sky','sequence_click','star_hop'].includes(step.mode))return '点击你判断的目标或路径星点';return ''}
  onPoint(pointId){
    const step=this.lesson.steps[this.index];let result={handled:false};if(step.type==='quiz')result=this.quiz.answer(pointId);else if(step.type==='practice')result=this.practice.handleSkyClick(pointId,this.sky);
    if(result.handled){this.feedback(result.message,result.correct);if(result.correct&&(step.type==='quiz'||step.mode==='blind_sky'))this.pass()}
    else if(step.type==='learn'){const point=this.sky.points.get(pointId);if(point){this.ui.stepTitle.textContent=point.name;this.ui.content.textContent=point.description||step.content||''}}
  }
  pass(result){this.passed=true;this.practiceResult=result??this.practiceResult;this.updateNav()}
  feedback(text,ok=false){this.ui.feedback.textContent=text;this.ui.feedback.classList.toggle('ok',Boolean(ok))}
  updateNav(){this.ui.back.disabled=this.index===0;this.ui.action.disabled=!this.passed;this.ui.action.textContent=this.index===this.lesson.steps.length-1?'完成课程':this.lesson.steps[this.index].required===false?'跳过 / 继续':'继续'}
  previous(){if(this.finished){location.href=`./${this.devMode?'?dev=1':''}`;return}if(this.index>0){this.index--;this.renderStep()}}
  next(){if(this.finished){location.href=`./${this.devMode?'?dev=1':''}`;return}if(!this.passed)return;if(this.index<this.lesson.steps.length-1){this.index++;this.renderStep()}else this.complete()}
  complete(){
    this.finished=true;this.binocular.stop();this.progress.complete(this.lesson);const completion=this.lesson.completion||{};this.ui.dots.innerHTML=this.lesson.steps.map(()=>'<i class="done"></i>').join('');this.ui.kicker.textContent=completion.resultKicker||'课程完成';this.ui.stepTitle.textContent=completion.resultTitle||'今晚的天空地图又清晰了一点';this.ui.content.textContent=completion.summary||`获得能力：${completion.ability||'新的观星技能'}。Day ${completion.unlockDay||this.lesson.day+1} 已解锁。`;this.ui.list.innerHTML='';this.ui.interaction.innerHTML='';this.ui.feedback.textContent='';this.renderLogForm();this.ui.back.disabled=false;this.ui.action.disabled=false;this.ui.action.textContent='返回课程目录';
  }
  renderLogForm(){
    const wrap=document.createElement('div');wrap.className='log-form';wrap.innerHTML='<h3>观星日志（可选）</h3><form class="form-grid"><label>日期<input name="date" type="date"></label><label>天气<input name="weather" placeholder="晴 / 多云"></label><label class="wide">地点<input name="locationText" placeholder="手动填写，不使用 GPS"></label><label class="wide">找到的目标<input name="objectsFound" placeholder="例如：北极星、仙后座"></label><label class="wide">笔记<textarea name="notes" rows="3" placeholder="今晚最容易和最困难的部分"></textarea></label></form><button class="choice-btn wide" type="button">保存日志</button>';const date=wrap.querySelector('[name=date]');date.value=new Date().toISOString().slice(0,10);wrap.querySelector('button').onclick=()=>{const values=Object.fromEntries(new FormData(wrap.querySelector('.form-grid')).entries());this.progress.addLog({day:this.lesson.day,...values,objectsFound:values.objectsFound.split(/[、,，]/).map(v=>v.trim()).filter(Boolean)});this.feedback('✓ 日志已保存在当前浏览器。',true)};this.ui.interaction.appendChild(wrap)
  }
}
