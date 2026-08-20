import {LessonPlayer} from './LessonPlayer.js?v=0403';

const app=new LessonPlayer();
app.init().catch(error=>{
  console.error(error);
  const target=document.getElementById('catalogStatus')||document.getElementById('stepContent');
  if(target)target.textContent=`加载失败：${error.message}。请通过本地静态服务器或静态网站托管打开。`;
});
