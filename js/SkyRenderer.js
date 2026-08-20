export class SkyRenderer {
  constructor({root, starLayer, lineLayer, caption}) {
    this.root=root;this.starLayer=starLayer;this.lineLayer=lineLayer;this.caption=caption;this.objects=new Map();this.points=new Map();this.timers=[];this.onPoint=()=>{};
  }
  setPointHandler(handler){this.onPoint=handler}
  clear(){this.timers.forEach(clearTimeout);this.timers=[];this.starLayer.innerHTML='';this.lineLayer.innerHTML='';this.caption.textContent='';this.points.clear()}
  collect(objects){
    this.objects=objects;const points=[];
    objects.forEach(object=>{
      const source=object.points||object.stars||[];
      source.forEach(point=>{if(!this.points.has(point.id)){const full={...point,ownerId:object.id};this.points.set(point.id,full);points.push(full)}});
      if(object.type==='star'&&Number.isFinite(object.x)&&!this.points.has(object.id)){const full={...object,ownerId:object.id};this.points.set(object.id,full);points.push(full)}
    });return points;
  }
  render(objects,options={}){
    this.clear();const points=this.collect(objects);const hideLabels=Boolean(options.hideLabels);
    points.forEach(point=>{
      const button=document.createElement('button');button.className=`star-point ${point.kind==='deep_sky'||point.type==='deep_sky'?'deep-sky':''}`;button.dataset.id=point.id;button.setAttribute('aria-label',hideLabels?'星点':point.name||point.id);button.style.cssText=`left:${point.x}%;top:${point.y}%;--size:${point.size||point.magnitudeSize||5}px;--color:${point.color||'#fff4df'}`;button.addEventListener('click',event=>{event.stopPropagation();this.onPoint(point.id)});this.starLayer.appendChild(button);
      if(!hideLabels){const label=document.createElement('span');label.className='star-label';label.style.cssText=`left:${point.x}%;top:${point.y}%`;label.innerHTML=`${point.name||point.id}<small>${point.en||point.enName||''}</small>`;this.starLayer.appendChild(label)}
    });
    if(!options.hideLines)objects.forEach(object=>(object.lines||[]).forEach(([a,b])=>this.drawLine(a,b,'base')));
    this.caption.textContent=options.caption||'';
  }
  drawLine(aId,bId,className='guide'){
    const a=this.points.get(aId),b=this.points.get(bId);if(!a||!b)return;
    this.lineLayer.insertAdjacentHTML('beforeend',`<line class="${className}" x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}"/>`)
  }
  animatePath(path=[],interval=420){path.slice(0,-1).forEach((id,index)=>{this.timers.push(setTimeout(()=>this.drawLine(id,path[index+1],'guide active'),index*interval))})}
  highlight(id){const el=this.starLayer.querySelector(`[data-id="${id}"]`);el?.classList.add('highlight')}
  targetMatches(pointId,targetId){if(pointId===targetId)return true;const object=this.objects.get(targetId);return Boolean((object?.points||object?.stars||[]).some(point=>point.id===pointId))}
  pointForTarget(targetId){return this.points.get(targetId)||this.points.get((this.objects.get(targetId)?.points||this.objects.get(targetId)?.stars||[])[0]?.id)}
}
