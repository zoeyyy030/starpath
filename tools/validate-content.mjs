import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const lessonsDir=path.join(root,'data','lessons');
const objectsDir=path.join(root,'data','objects');
const read=file=>JSON.parse(fs.readFileSync(file,'utf8'));
const manifest=read(path.join(lessonsDir,'index.json'));
const allowedTypes=new Set(['intro','learn','guide','quiz','practice','binocular']);
const allowedModes=new Set(['direction_check','shape_recognition','blind_sky','angle_estimation','field_of_view_compare','rotate_sky_map','sky_map_match','sky_map_recall','sequence_click','star_hop','target_centering','comparison','observation_check']);
const errors=[];
const ids=new Set();
const lessons=[];

if(!Array.isArray(manifest.chapters)||manifest.chapters.length!==4)errors.push('index.json 必须定义四个课程阶段');
for(let day=1;day<=30;day+=1){
  const file=path.join(lessonsDir,`day${String(day).padStart(2,'0')}.json`);
  if(!fs.existsSync(file)){errors.push(`missing Day ${day}`);continue}
  lessons.push(read(file));
}

for(const lesson of lessons){
  const objects=new Map();const points=new Set();
  if(lesson.day<1||lesson.day>30)errors.push(`invalid day ${lesson.day}`);
  if(!manifest.chapters.some(chapter=>chapter.id===lesson.chapterId))errors.push(`Day ${lesson.day}: missing chapter ${lesson.chapterId}`);
  for(const id of lesson.objects){
    const file=path.join(objectsDir,`${id}.json`);
    if(!fs.existsSync(file)){errors.push(`Day ${lesson.day}: missing object ${id}`);continue}
    const object=read(file);objects.set(id,object);
    for(const point of object.points||object.stars||[])points.add(point.id);
    if(object.type==='star')points.add(object.id);
  }
  for(const step of lesson.steps){
    if(ids.has(step.id))errors.push(`duplicate step id ${step.id}`);ids.add(step.id);
    if(!allowedTypes.has(step.type))errors.push(`${step.id}: unsupported type ${step.type}`);
    if(step.type==='practice'&&!allowedModes.has(step.mode))errors.push(`${step.id}: unsupported mode ${step.mode}`);
    const targetNeedsSky=step.type==='quiz'||step.type==='binocular'||['blind_sky','target_centering'].includes(step.mode);
    if(targetNeedsSky&&step.target&&!points.has(step.target)&&!objects.has(step.target))errors.push(`${step.id}: target ${step.target} missing`);
    for(const id of [...(step.sequence||[]),...(step.path||[])])if(!points.has(id))errors.push(`${step.id}: path point ${id} missing`);
  }
}

if(errors.length){console.error(errors.join('\n'));process.exit(1)}
console.log(`Validated ${lessons.length} lessons, ${ids.size} unique steps, all object/target/path references OK.`);
