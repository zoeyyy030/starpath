export class GuideRenderer {
  constructor(sky,list){this.sky=sky;this.list=list}
  render(step){
    this.list.innerHTML='';(step.steps||[]).forEach(text=>{const li=document.createElement('li');li.textContent=text;this.list.appendChild(li)});
    if(step.path?.length)this.sky.animatePath(step.path,step.segmentDelay||420);
  }
}
