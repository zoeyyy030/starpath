export class PracticeRenderer {
  constructor(panel){this.panel=panel;this.step=null;this.sequenceIndex=0;this.selected=[];this.onComplete=()=>{};this.onFeedback=()=>{}}
  start(step,{onComplete,onFeedback}){
    this.step=step;this.sequenceIndex=0;this.selected=[];this.onComplete=onComplete;this.onFeedback=onFeedback;this.panel.innerHTML='';
    const mode=step.mode;
    if(['direction_check','shape_recognition','angle_estimation','field_of_view_compare','sky_map_match','comparison'].includes(mode))return this.renderChoices(step);
    if(mode==='rotate_sky_map')return this.renderRotate(step);
    if(mode==='sky_map_recall')return this.renderRecall(step);
    if(mode==='observation_check')return this.renderObservation(step);
    if(['sequence_click','star_hop','blind_sky','target_centering'].includes(mode))return this.renderPrompt(step);
  }
  visual(text,className='practice-visual'){const div=document.createElement('div');div.className=className;div.innerHTML=text;this.panel.appendChild(div);return div}
  button(label,handler,className='choice-btn'){const button=document.createElement('button');button.className=className;button.textContent=label;button.addEventListener('click',handler);this.panel.appendChild(button);return button}
  renderPrompt(step){
    const sequence=step.sequence||step.path||[];
    this.visual(step.visual||(['sequence_click','star_hop'].includes(step.mode)?`起点 → ${sequence.length-2} 个路标 → 目标`:'请在上方星图完成任务'));
    if(sequence.length)this.onFeedback(`第 1 步：找到 ${step.sequenceLabels?.[0]||'起点'}`,false);
  }
  renderChoices(step){
    if(step.visual)this.visual(step.visual);
    (step.choices||[]).forEach(choice=>this.button(choice.label,()=>{
      if(choice.id===step.answer){this.panel.querySelectorAll('.choice-btn').forEach(el=>el.disabled=true);this.onFeedback(choice.feedback||step.success||'✓ 判断正确。',true);this.onComplete()}
      else this.onFeedback(choice.feedback||step.retryHint||'再观察一下关键特征。',false)
    }));
  }
  renderRotate(step){
    const target=Number(step.targetAngle??180);let angle=0;const visual=this.visual('<div class="map-disc">N ↑<br>训练星图</div>');const disc=visual.querySelector('.map-disc');
    const turn=delta=>{angle=(angle+delta+360)%360;disc.style.transform=`rotate(${angle}deg)`;if(angle===target){this.onFeedback(step.success||'✓ 星图方向已经与观察方向对应。',true);this.onComplete()}};
    this.button('↶ 旋转 90°',()=>turn(-90));this.button('旋转 90° ↷',()=>turn(90));
  }
  renderRecall(step){
    const visual=this.visual(step.visual||'在脑中重建天空路标的位置');
    this.button(step.revealLabel||'我已完成回忆，显示骨架',()=>{visual.innerHTML=step.answerVisual||'北斗 → ★ 北极星 → W 仙后座';this.onFeedback('✓ 对照完成。记住相对位置比记名称更重要。',true);this.onComplete()},'choice-btn wide');
  }
  renderObservation(step){
    if(step.selectionLimit){
      const order=this.visual('尚未选择目标','selection-order');
      const buttons=[];(step.options||[]).forEach(option=>{const button=this.button(option.label,()=>{
        if(this.selected.length>=step.selectionLimit)return;
        this.selected.push(option.id);button.classList.add('selected');
        order.textContent=this.selected.length?this.selected.map((id,i)=>`${i+1}. ${(step.options||[]).find(item=>item.id===id)?.label}`).join('　→　'):'尚未选择目标';
        if(this.selected.length===step.selectionLimit){buttons.forEach(item=>item.disabled=true);this.onFeedback(`✓ 已规划 ${step.selectionLimit} 个目标，点击顺序就是观测路线。`,true);this.onComplete(this.selected)}else this.onFeedback(`请选择 ${step.selectionLimit} 个目标，目前 ${this.selected.length} 个。`,false)
      });buttons.push(button)});return;
    }
    const checks=(step.checks||[]).map(item=>{const label=document.createElement('label');label.className='check-row';label.innerHTML=`<input type="checkbox" value="${item.id}"><span>${item.label}</span>`;this.panel.appendChild(label);return label.querySelector('input')});
    this.button(step.confirmLabel||'完成记录',()=>{const checked=checks.filter(input=>input.checked);if(checked.length<(step.minChecks||1))return this.onFeedback(`至少确认 ${step.minChecks||1} 项。`,false);this.onFeedback('✓ 观察记录已确认。',true);this.onComplete(checked.map(input=>input.value))},'choice-btn wide');
  }
  handleSkyClick(pointId,sky){
    if(!this.step)return {handled:false};const mode=this.step.mode;
    if(mode==='blind_sky'){
      const correct=sky.targetMatches(pointId,this.step.target);if(correct)this.onComplete();return {handled:true,correct,message:correct?'✓ 已在无标签星图中找到目标。':(this.step.retryHint||'继续用形状和相邻路标判断。')};
    }
    if(['sequence_click','star_hop'].includes(mode)){
      const sequence=this.step.sequence||this.step.path||[];const expected=sequence[this.sequenceIndex];
      if(pointId===expected){this.sequenceIndex++;sky.highlight(pointId);if(this.sequenceIndex>=sequence.length){this.onComplete();return {handled:true,correct:true,message:'✓ 路径完成，已抵达目标。'}}return {handled:true,correct:true,message:`✓ 路标 ${this.sequenceIndex}/${sequence.length}，继续下一点。`}}
      return {handled:true,correct:false,message:this.step.retryHint||`先寻找当前路径的第 ${this.sequenceIndex+1} 个路标。`};
    }
    return {handled:false};
  }
  reset(){this.step=null;this.panel.innerHTML='';this.selected=[]}
}
