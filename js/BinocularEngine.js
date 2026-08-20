export class BinocularEngine {
  constructor({skyRoot,overlay,sky}){this.root=skyRoot;this.overlay=overlay;this.sky=sky;this.active=false;this.drag=false;this.timer=null;this.success=false;this.target=null;this.onSuccess=()=>{};this.boundDown=e=>this.down(e);this.boundMove=e=>this.move(e);this.boundUp=()=>this.up();this.root.addEventListener('pointerdown',this.boundDown);window.addEventListener('pointermove',this.boundMove);window.addEventListener('pointerup',this.boundUp)}
  start(target,onSuccess,{holdMs=500}={}){this.stop();this.active=true;this.success=false;this.target=target;this.onSuccess=onSuccess;this.holdMs=holdMs;this.overlay.classList.add('active');this.overlay.setAttribute('aria-hidden','false');this.set(50,50)}
  stop(){this.active=false;this.drag=false;clearTimeout(this.timer);this.timer=null;this.overlay.classList.remove('active');this.overlay.setAttribute('aria-hidden','true')}
  down(event){if(!this.active)return;this.drag=true;this.update(event)}
  move(event){if(this.drag)this.update(event)}
  up(){this.drag=false}
  update(event){const rect=this.root.getBoundingClientRect();this.set(Math.max(0,Math.min(100,(event.clientX-rect.left)*100/rect.width)),Math.max(0,Math.min(100,(event.clientY-rect.top)*100/rect.height)));this.check(rect)}
  set(x,y){this.x=x;this.y=y;this.overlay.style.setProperty('--bx',`${x}%`);this.overlay.style.setProperty('--by',`${y}%`)}
  check(rect){if(this.success)return;const point=this.sky.pointForTarget(this.target);if(!point)return;const distance=Math.hypot((point.x-this.x)*rect.width/100,(point.y-this.y)*rect.height/100);if(distance<=28){if(!this.timer)this.timer=setTimeout(()=>{this.success=true;this.sky.highlight(point.id);this.onSuccess(point.id)},this.holdMs)}else{clearTimeout(this.timer);this.timer=null}}
}
