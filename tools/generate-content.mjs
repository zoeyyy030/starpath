import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const lessonDir=path.join(root,'data','lessons');const objectDir=path.join(root,'data','objects');fs.mkdirSync(lessonDir,{recursive:true});fs.mkdirSync(objectDir,{recursive:true});
const chapters=[
  {id:'orientation',order:1,title:'建立天空方向感'},
  {id:'summer',order:2,title:'夏季大三角与星座骨架'},
  {id:'binocular',order:3,title:'双筒使用与星跳基础'},
  {id:'autumn',order:4,title:'秋季星空与深空目标'}
];
const I=(title,content)=>({type:'intro',title,content});
const L=(target,title,content)=>({type:'learn',target,title,content});
const G=(title,steps,pathIds,content='跟随星图分段建立路径。')=>({type:'guide',title,content,steps,path:pathIds});
const Q=(target,question,retryHint)=>({type:'quiz',target,question,retryHint});
const P=(mode,instruction,extra={})=>({type:'practice',mode,title:extra.title||'完成实战练习',instruction,...extra});
const B=(target,hint,extra={})=>({type:'binocular',title:'10×50 双筒模拟',target,fieldOfView:6,holdMs:500,hint,...extra});
const C=(unlockDay,knownObjects,ability,extra={})=>({unlockDay,knownObjects,ability,...extra});
const lesson=(day,title,chapterId,difficulty,duration,goal,objects,steps,completion)=>{const chapter=chapters.find(c=>c.id===chapterId).title;return {day,title,chapterId,chapter,difficulty,duration,goal,objects,steps:steps.map((step,index)=>({id:`d${String(day).padStart(2,'0')}_s${String(index+1).padStart(2,'0')}`,...step})),completion}};
const shapeChoices=(correctLabel='目标形状')=>[{id:'a',label:'A：散乱星点'},{id:'b',label:`B：${correctLabel}`},{id:'c',label:'C：短直线'}];
const directionChoices=[{id:'east',label:'东'},{id:'south',label:'南'},{id:'west',label:'西'},{id:'north',label:'北'}];

const lessons=[
lesson(1,'确认东南西北','orientation',1,'15分钟','知道自己面朝哪个方向，并理解天顶与地平线',['ursa_major','polaris'],[
  I('先给天空建立坐标','地平线围绕着你，头顶最高点叫天顶。方向感是所有找星训练的起点。'),
  L('polaris','北极星与北方','北极星接近北天极，它在地平线上的方向就是北方。'),
  P('direction_check','根据北极星判断北方',{visual:'★ 北极星<br>↓<br>地平线',choices:directionChoices,answer:'north',success:'✓ 北极星所在的地平线方向就是北方。'}),
  B('polaris','肉眼锁定北极星后再举镜，将它保持在中央。',{required:false})
],C(2,['polaris'],'天空方向感 Lv1')),

lesson(2,'找到北斗七星','orientation',1,'15分钟','通过勺子形轮廓识别北斗',['ursa_major','polaris'],[
  I('先找一个大勺子','北斗七星由四颗斗身星和三颗斗柄星组成。先记图形，不急着背星名。'),
  L('ursa_major','认识北斗轮廓','点击星点观察勺口、勺身与弯曲的斗柄。'),
  P('shape_recognition','哪一个图形最像北斗？',{visual:'A ·····　B ▱—⌒　C ∨∨',choices:shapeChoices('勺形轮廓'),answer:'b',success:'✓ 四星斗身加三星斗柄就是北斗。'}),
  P('blind_sky','关闭名称与连线，再找一次北斗。',{target:'ursa_major',hideLabels:true,hideLines:true,retryHint:'先寻找四边形斗身。'})
],C(3,['ursa_major'],'北斗识别 Lv1')),

lesson(3,'用北斗找到北极星','orientation',1,'15分钟','利用斗口两星找到北极星并判断北方',['ursa_major','polaris'],[
  I('北斗不只是一个勺子','斗口外侧的天璇和天枢是一把指向北极星的天空尺。'),
  L('ursa_major','找到斗口两星','先确认天璇与天枢的位置。'),
  G('分段延长五倍距离',['找到北斗','识别天璇和天枢','从天璇指向天枢','沿方向延长约五倍','抵达北极星'],['merak','dubhe','polaris']),
  Q('polaris','现在请自己找到北极星','先回到天璇与天枢。'),
  P('blind_sky','不看连线，再完成一次北斗 → 北极星。',{target:'polaris',hideLabels:true,hideLines:true}),
  B('polaris','先肉眼定位，再举起双筒。',{required:false})
],C(4,['ursa_major','polaris'],'方向定位 Lv1')),

lesson(4,'找到天空中的 W','orientation',1,'15分钟','通过 W/M 轮廓识别仙后座',['polaris','cassiopeia'],[
  I('北天的第二个路标','仙后座由五颗主要恒星组成 W 或 M，是北斗之外的重要北天路标。'),
  L('cassiopeia','记住 W/M','不先背星名，只记连续折线。'),
  G('从北极星扩展地图',['找到北极星','寻找五颗星的折线','确认完整 W/M'],['polaris','schedar','navi','ruchbah']),
  P('shape_recognition','哪一组是仙后座？',{visual:'A ·—·—·　B ·∨·∨·　C ·····',choices:shapeChoices('W / M'),answer:'b'}),
  Q('cassiopeia','请在星空中找到仙后座','寻找完整 W/M，不要只找最亮星。')
],C(5,['cassiopeia'],'北天路标识别 Lv1')),

lesson(5,'学会测量天空','orientation',1,'15分钟','使用手势估算天空中的角距离',['ursa_major','polaris'],[
  I('天空也可以测量','观星使用角度描述距离，你的手就是随身天空尺。'),
  L('polaris','四把天空尺','伸直手臂：小指约 1°，三指约 5°，一拳约 10°，张手约 20–25°。'),
  P('angle_estimation','两星相隔约 10°，选择最接近的手势。',{visual:'★　　　　★',choices:[{id:'finger',label:'小指 · 1°'},{id:'three',label:'三指 · 5°'},{id:'fist',label:'一拳 · 10°'},{id:'span',label:'张手 · 22°'}],answer:'fist'}),
  P('field_of_view_compare','10×50 约 6° 视场最接近哪种手势？',{visual:'◯ 10×50 · 约 6°',choices:[{id:'finger',label:'小指'},{id:'three',label:'三指'},{id:'fist',label:'一拳'}],answer:'three'})
],C(6,[],'角距离估算 Lv1')),

lesson(6,'把星图对上真实天空','orientation',1,'15分钟','根据观察方向正确旋转星图，并与真实天空对应',['ursa_major','polaris','cassiopeia'],[
  I('星图为什么总像是反的？','星图不是普通地图，应把自己面对的方向转到屏幕下方。'),
  G('先确定面朝方向',['找到北极星','确认北方','把北方转到屏幕下方','再比较真实天空'],['dubhe','polaris','schedar']),
  P('rotate_sky_map','你面向北方，请旋转星图。',{targetAngle:180}),
  P('sky_map_match','哪张图与北天路标关系一致？',{visual:'北斗　★北极星　W',choices:[{id:'a',label:'A：左右颠倒'},{id:'b',label:'B：路标对应'},{id:'c',label:'C：方向相反'}],answer:'b'}),
  P('sky_map_recall','先在脑中放好三个路标，再显示骨架。',{answerVisual:'北斗 → ★ 北极星 → W 仙后座',hideLabels:true,hideLines:true})
],C(7,[],'星图对应 Lv1')),

lesson(7,'第一次闭卷看天空','orientation',2,'20分钟','脱离辅助提示，独立完成一次北天导航',['ursa_major','polaris','cassiopeia'],[
  I('今天不学新东西','关闭大部分提示，检验北天地图是否已经形成。'),
  P('blind_sky','第一关：找到北斗。',{target:'ursa_major',hideLabels:true,hideLines:true}),
  Q('polaris','第二关：利用北斗找到北极星','回忆斗口两星与五倍距离。'),
  P('shape_recognition','第三关：辨认仙后座。',{visual:'A ·····　B ·∨·∨·　C ▱—',choices:shapeChoices('W / M'),answer:'b'}),
  P('direction_check','第四关：判断北方。',{visual:'★ 北极星 → 地平线',choices:directionChoices,answer:'north'}),
  P('sky_map_recall','最后重建三者位置。',{answerVisual:'北斗 → ★ 北极星 → W 仙后座'})
],C(8,['ursa_major','polaris','cassiopeia'],'北天导航 Lv1',{resultKicker:'第一阶段完成',resultTitle:'你的北天地图已经建立',summary:'已掌握北斗、北极星与仙后座，获得北天导航 Lv1。下一阶段进入夏季大三角。'})),

lesson(8,'找到织女星','summer',1,'15分钟','不看名称也能独立找到织女星',['vega','lyra'],[
  I('进入夏季星空','织女星是夏季天空非常醒目的亮星，也是夏季大三角的一个顶点。'),L('vega','认识织女星','记住它很亮、偏蓝白，并位于天琴座。'),P('blind_sky','关闭名称找到织女星。',{target:'vega',hideLabels:true,hideLines:true}),P('target_centering','肉眼锁定后将双筒视场举到织女星。',{target:'vega',holdMs:500})
],C(9,['vega'],'夏季亮星识别 Lv1')),

lesson(9,'从织女星找到天琴座','summer',1,'15分钟','识别织女星旁边的小平行四边形',['vega','lyra'],[
  I('别只记一颗孤星','织女星旁边四颗较暗星组成小平行四边形，这就是天琴座主体。'),L('lyra','寻找小四边形','先找织女星，再看它旁边紧凑的四星结构。'),P('shape_recognition','哪一个是天琴座主体？',{visual:'A ◇+★　B W　C 十字',choices:[{id:'a',label:'A：亮星旁小四边形'},{id:'b',label:'B：W 形'},{id:'c',label:'C：大十字'}],answer:'a'}),P('blind_sky','无连线找到天琴座。',{target:'lyra',hideLabels:true,hideLines:true})
],C(10,['lyra'],'天琴座识别 Lv1')),

lesson(10,'找到天津四','summer',1,'15分钟','从织女星扩展到天津四',['vega','deneb','cygnus'],[
  I('寻找第二个顶点','天津四位于织女星东北侧，是天鹅座尾部的亮星。'),G('从织女星走向天津四',['找到织女星','观察东北方向','移动一个大角距','抵达天津四'],['vega','deneb']),P('sequence_click','依次点击织女星和天津四。',{sequence:['vega','deneb'],sequenceLabels:['织女星','天津四'],hideLabels:true}),B('deneb','先肉眼确认天津四，再把它稳定在双筒中央。',{required:false})
],C(11,['deneb'],'夏季星跳 Lv1')),

lesson(11,'找到牛郎星','summer',1,'15分钟','识别牛郎星及其两侧较暗伴星',['altair','aquila'],[
  I('第三个导航星','牛郎星两侧各有一颗较暗星，形成醒目的短直线。'),L('aquila','认出三连星','牛郎星在中间最亮，两侧伴星帮助确认。'),P('shape_recognition','哪一个结构属于牛郎星？',{visual:'A ·★·　B W　C ◇',choices:[{id:'a',label:'A：短直线三颗星'},{id:'b',label:'B：W'},{id:'c',label:'C：四边形'}],answer:'a'}),P('blind_sky','无名称找到牛郎星。',{target:'altair',hideLabels:true,hideLines:true})
],C(12,['altair','aquila'],'天鹰座识别 Lv1')),

lesson(12,'拼出完整夏季大三角','summer',2,'18分钟','不依赖名称识别三颗亮星的位置关系',['summer_triangle'],[
  I('三颗亮星连接成地图','织女星、天津四、牛郎星组成跨越大片天空的夏季大三角。'),L('summer_triangle','观察三点关系','不要死记连线，记住一高、一侧、一低的空间关系。'),P('sequence_click','依次点击织女星、天津四、牛郎星。',{sequence:['vega','deneb','altair'],sequenceLabels:['织女星','天津四','牛郎星'],hideLabels:true,hideLines:true}),P('blind_sky','关闭全部辅助，再找到三角中的织女星。',{target:'vega',hideLabels:true,hideLines:true})
],C(13,['vega','deneb','altair','summer_triangle'],'夏季大三角 Lv1')),

lesson(13,'认识天鹅座','summer',2,'15分钟','通过北天十字结构识别天鹅座',['deneb','cygnus'],[
  I('天津四是天鹅的尾巴','从天津四经辇道增七到辇道增七南侧的辇道亮星，形成天鹅座长轴。'),L('cygnus','记住北天十字','一条长轴加一条短横轴，是天鹅座最有用的骨架。'),P('shape_recognition','哪一个是天鹅座骨架？',{visual:'A 十字　B W　C ◇',choices:[{id:'a',label:'A：十字结构'},{id:'b',label:'B：W'},{id:'c',label:'C：四边形'}],answer:'a'}),P('star_hop','沿天鹅长轴点击天津四、辇道增七、辇道增五。',{sequence:['deneb','sadr','albireo'],sequenceLabels:['天津四','辇道增七','辇道增五'],hideLabels:true})
],C(14,['cygnus'],'天鹅座骨架 Lv1')),

lesson(14,'第二阶段闭卷','summer',2,'20分钟','闭卷重建夏季大三角与三个所属星座',['summer_triangle','lyra','cygnus','aquila'],[
  I('关闭名称，重新找回夏季地图','这次不教新知识，只检验三颗导航星与星座骨架。'),P('sequence_click','依次找到织女星、天津四、牛郎星。',{sequence:['vega','deneb','altair'],hideLabels:true,hideLines:true}),P('shape_recognition','辨认天琴座的小平行四边形。',{visual:'A ★+◇　B W　C 十字',choices:[{id:'a',label:'A：亮星与小四边形'},{id:'b',label:'B：W'},{id:'c',label:'C：十字'}],answer:'a'}),P('sky_map_recall','重建三颗亮星与三个星座。',{answerVisual:'织女星·天琴　—　天津四·天鹅　—　牛郎星·天鹰'})
],C(15,['summer_triangle','lyra','cygnus','aquila'],'夏季导航 Lv1',{resultKicker:'第二阶段完成',resultTitle:'夏季星空已经有了骨架'})),

lesson(15,'练习一次举镜命中','binocular',2,'15分钟','肉眼锁定亮星后直接举双筒定位',['vega','lyra'],[
  I('眼睛盯住目标再举镜','不要低头看双筒。视线保持在织女星上，把双筒送到眼前。'),P('target_centering','拖动模拟视场，将织女星进入中央 30% 并停留 500ms。',{target:'vega',holdMs:500}),B('vega','再做一次完整举镜命中。')
],C(16,[],'双筒指向 Lv1')),

lesson(16,'移动一个双筒视场','binocular',2,'15分钟','理解约 6° 双筒视场的尺度',['vega','lyra'],[
  I('一次只移动一个视场','10×50 常见教学视场约 6°，接近伸直手臂三指宽。'),P('field_of_view_compare','哪种手势最接近 6°？',{visual:'◯ 6°',choices:[{id:'one',label:'小指 1°'},{id:'three',label:'三指 5°'},{id:'fist',label:'一拳 10°'}],answer:'three'}),P('sequence_click','从织女星移动到天琴座旁两颗路标星。',{sequence:['vega','sheliak','sulafat'],hideLabels:true})
],C(17,[],'视场尺度 Lv1')),

lesson(17,'沿天鹅座扫星','binocular',2,'18分钟','沿明显星座结构移动双筒',['deneb','cygnus'],[
  I('沿骨架移动，不在黑暗中乱扫','从天津四出发，沿天鹅座长轴逐视场向南。'),G('天鹅长轴路线',['天津四 Deneb','辇道增七 Sadr','辇道增五 Albireo'],['deneb','sadr','albireo']),P('star_hop','按顺序完成三个路标。',{sequence:['deneb','sadr','albireo'],hideLabels:true,hideLines:true}),B('albireo','把路径终点稳定在双筒中央。',{required:false})
],C(18,[],'结构扫描 Lv1')),

lesson(18,'认识银河星野','binocular',2,'15分钟','理解银河区域恒星密度更高',['sparse_field','milky_way_field'],[
  I('不是虚假的彩色银河照片','双筒里的差别主要是背景星数量，而非夸张云雾。'),P('comparison','哪一个更接近银河密集星野？',{visual:'A ·　·　　　·　　B ··· ·· ···· ··',choices:[{id:'a',label:'A：稀疏星野'},{id:'b',label:'B：密集星野'}],answer:'b'}),P('observation_check','记录你观察星野时注意到的差异。',{checks:[{id:'more_stars',label:'密集区域背景星更多'},{id:'no_color',label:'没有夸张彩色云雾'},{id:'structure',label:'能看出星链或小星群'}],minChecks:2})
],C(19,[],'银河星野识别 Lv1')),

lesson(19,'寻找星链','binocular',2,'15分钟','把连续星点作为导航路径',['star_chain','vega'],[
  I('把散点连成路','三到五颗连续排列的星可以成为双筒移动时的临时路标。'),L('star_chain','观察星链','记住弯曲方向与星间距，而不是星名。'),P('sequence_click','沿星链依次点击五颗星。',{sequence:['chain1','chain2','chain3','chain4','chain5'],hideLabels:true,hideLines:true}),P('star_hop','从织女星跳到星链末端。',{sequence:['vega','chain1','chain3','chain5'],hideLabels:true})
],C(20,['star_chain'],'星链识别 Lv1')),

lesson(20,'第一次完整星跳','binocular',3,'20分钟','从已知亮星经过多个中间点抵达目标区域',['vega','lyra','star_chain'],[
  I('完整星跳不是一次跳到终点','每次只确认下一个明显路标，失去方向就回到上一个点。'),G('起点到目标区',['织女星起点','天琴座路标','星链中点','目标区域'],['vega','sheliak','chain3','chain5']),P('star_hop','不显示连线，完成整条路径。',{sequence:['vega','sheliak','chain3','chain5'],hideLabels:true,hideLines:true,retryHint:'回到最后确认的路标。'}),P('sky_map_recall','闭眼回忆这条路径的转折方向。',{answerVisual:'织女星 ↘ 天琴路标 → 星链中点 ↗ 目标区'})
],C(21,[],'星跳 Lv1')),

lesson(21,'第三阶段闭卷','binocular',3,'20分钟','独立完成肉眼定位、举镜、移动视场与星跳',['vega','lyra','star_chain'],[
  I('把动作连成一套流程','肉眼定位 → 举镜 → 移动一个视场 → 星跳 → 找回起点。'),P('target_centering','第一关：把织女星稳定在中央。',{target:'vega'}),P('star_hop','第二关：沿路标到星链末端。',{sequence:['vega','sheliak','chain3','chain5'],hideLabels:true}),P('sky_map_recall','第三关：回忆并找回起点。',{answerVisual:'目标区 → 星链 → 天琴路标 → 织女星'})
],C(22,[],'双筒导航 Lv1',{resultKicker:'第三阶段完成',resultTitle:'你已经会用双筒沿路径找目标'})),

lesson(22,'找到飞马大四边形','autumn',2,'15分钟','识别秋季重要的大四边形',['pegasus'],[
  I('秋季天空的新入口','四颗较亮星围成一个很大的四边形，是秋季天空的重要路标。'),L('pegasus','观察四边形','它比想象中大，内部星点相对稀疏。'),P('shape_recognition','哪一个是飞马大四边形？',{visual:'A □　B W　C 十字',choices:[{id:'a',label:'A：大四边形'},{id:'b',label:'B：W'},{id:'c',label:'C：十字'}],answer:'a'}),P('blind_sky','无连线找到飞马四边形。',{target:'pegasus',hideLabels:true,hideLines:true})
],C(23,['pegasus'],'秋季路标识别 Lv1')),

lesson(23,'从飞马找到仙女座','autumn',2,'18分钟','从飞马四边形延伸到仙女座主星链',['pegasus','andromeda'],[
  I('从四边形一角向外延伸','壁宿二同时连接飞马四边形与仙女座主星链。'),G('飞马到仙女座',['找到飞马四边形','定位壁宿二','沿星链经过奎宿九','到达天大将军一'],['markab','alpheratz','mirach','almach']),P('star_hop','按顺序点击飞马到仙女座的路标。',{sequence:['markab','alpheratz','mirach','almach'],hideLabels:true,hideLines:true})
],C(24,['andromeda'],'秋季星跳 Lv1')),

lesson(24,'第一次找 M31','autumn',3,'20分钟','通过星跳找到仙女座星系',['pegasus','andromeda','m31'],[
  I('你的第一个河外星系目标','M31 在双筒中应是微弱、椭圆、模糊的光斑，不是高清银河照片。'),G('从飞马跳向 M31',['壁宿二','奎宿九','仙女座 μ 路标','M31 模糊光斑'],['alpheratz','mirach','mu_and','m31']),P('star_hop','关闭连线完成 M31 星跳。',{sequence:['alpheratz','mirach','mu_and','m31'],hideLabels:true,hideLines:true}),B('m31','把微弱椭圆光斑保持在视场中央。')
],C(25,['m31'],'深空目标 Lv1',{resultTitle:'你完成了第一次深空星跳'})),

lesson(25,'认识英仙座','autumn',3,'18分钟','建立仙后座到英仙座的空间联系',['cassiopeia','perseus'],[
  I('从熟悉的 W 向外扩展','英仙座位于仙后座附近，可用弯曲星链识别。'),G('仙后座到英仙座',['找到仙后座 W','从王良四向外','抵达天船三','确认英仙座弯曲星链'],['schedar','navi','mirfak']),P('star_hop','沿路标进入英仙座。',{sequence:['schedar','navi','mirfak'],hideLabels:true}),P('shape_recognition','哪一个更像英仙座星链？',{visual:'A 弯曲长星链　B W　C 大方框',choices:[{id:'a',label:'A：弯曲星链'},{id:'b',label:'B：W'},{id:'c',label:'C：方框'}],answer:'a'})
],C(26,['perseus'],'英仙座识别 Lv1')),

lesson(26,'寻找双星团','autumn',3,'20分钟','用 10×50 找到英仙座双星团',['cassiopeia','perseus','double_cluster'],[
  I('双筒的甜蜜点','肉眼可能只见一小团模糊区域，10×50 会展开成两个密集星群。'),G('从仙后座走向双星团',['仙后座 W','英仙座方向','两团相邻密集星点'],['ruchbah','mirfak','double_cluster']),P('star_hop','沿路标找到双星团。',{sequence:['ruchbah','mirfak','double_cluster'],hideLabels:true,hideLines:true}),B('double_cluster','外围保留肉眼星空，将双星团移到中央。')
],C(27,['double_cluster'],'双筒星团 Lv1')),

lesson(27,'回到天鹅银河','autumn',2,'18分钟','复习夏季银河星野并与 Day17 比较',['deneb','cygnus','milky_way_field'],[
  I('第二次看会看见更多结构','比较自己是否更容易看到背景星、沿天鹅移动并找回天津四。'),P('comparison','哪一个星野更接近天鹅银河区域？',{visual:'A ·　·　·　　B ···· ·· ···',choices:[{id:'a',label:'A：稀疏'},{id:'b',label:'B：密集'}],answer:'b'}),P('observation_check','完成一次复习记录。',{checks:[{id:'background',label:'看到更多背景星'},{id:'cygnus_path',label:'能沿天鹅结构移动'},{id:'deneb',label:'仍能独立找到天津四'}],minChecks:2})
],C(28,[],'银河复习 Lv1')),

lesson(28,'月球双筒训练','autumn',2,'18分钟','使用 10×50 观察月球整体结构',['moon'],[
  I('满月并非地形观察最佳时机','太阳斜射时，明暗分界线附近的山脉和坑壁阴影更明显。'),L('moon','认识月海与明暗分界线','月海是较暗的大区域，Terminator 是亮面与暗面的分界。'),P('comparison','哪种光照更容易看出地形起伏？',{visual:'A 满月正面照亮　B 明暗分界线斜射',choices:[{id:'a',label:'A：满月'},{id:'b',label:'B：有明暗分界线'}],answer:'b'}),P('observation_check','记录月球整体观察。',{checks:[{id:'maria',label:'分辨出较暗的月海'},{id:'terminator',label:'找到明暗分界线'},{id:'shadows',label:'注意到坑壁或山脉阴影'}],minChecks:1}),B('moon','将月球保持在中央，观察整体而非夸张放大。',{required:false})
],C(29,['moon'],'月球双筒 Lv1')),

lesson(29,'全局闭卷','autumn',4,'25分钟','不依赖 App 重建本月学习的天空骨架',['ursa_major','polaris','cassiopeia','summer_triangle','pegasus','andromeda'],[
  I('把四周天空连成一张图','这次跨越北天、夏季与秋季三张局部地图。'),P('sky_map_recall','先重建三组天空路标。',{answerVisual:'北斗—北极星—仙后　｜　织女—天津四—牛郎　｜　飞马—仙女'}),P('sequence_click','按路线点击八个主路标。',{sequence:['dubhe','polaris','schedar','vega','deneb','altair','markab','alpheratz'],hideLabels:true,hideLines:true,retryHint:'回到最近确认的天空区域。'}),P('direction_check','最后确认北方。',{visual:'★ 北极星 → 地平线',choices:directionChoices,answer:'north'})
],C(30,['ursa_major','polaris','cassiopeia','summer_triangle','pegasus','andromeda'],'全局天空地图 Lv1')),

lesson(30,'毕业夜','autumn',4,'30分钟','自己规划并完成一条五目标观测路线',['polaris','vega','deneb','altair','pegasus','m31','double_cluster','moon'],[
  I('今晚由你决定路线','从候选目标中按想观测的顺序选择五个。课程不直接给答案。'),P('observation_check','依次选择五个目标；点击顺序就是路线顺序。',{selectionLimit:5,options:[{id:'polaris',label:'北极星'},{id:'vega',label:'织女星'},{id:'deneb',label:'天津四'},{id:'altair',label:'牛郎星'},{id:'pegasus',label:'飞马四边形'},{id:'m31',label:'M31'},{id:'double_cluster',label:'双星团'},{id:'moon',label:'月球'}]}),P('observation_check','按自定路线完成观测后逐项确认。',{checks:[{id:'route',label:'按路线依次寻找目标'},{id:'binocular',label:'至少一次肉眼锁定后举镜命中'},{id:'starhop',label:'至少完成一次星跳'},{id:'return',label:'能够重新找回起点'},{id:'log',label:'准备记录毕业夜日志'}],minChecks:3})
],C(31,['polaris','vega','deneb','altair','pegasus','m31','double_cluster','moon'],'StarPath 30 天基础训练完成',{resultKicker:'毕业夜完成',resultTitle:'StarPath 30 天基础训练完成',summary:'天空方向感、北天导航、夏季导航、双筒导航、星跳与深空目标能力均达到 Lv1。你已经可以独立制定一条简单观星路线。'}))
];

const objects=[
{id:'ursa_major',type:'constellation',name:'北斗七星',recognitionShape:'勺形',description:'大熊座中七颗醒目恒星组成的勺形路标。',points:[
  {id:'dubhe',name:'天枢',en:'Dubhe',x:27,y:39,size:6,description:'斗口上方指极星。'},{id:'merak',name:'天璇',en:'Merak',x:30,y:52,size:5,description:'斗口下方指极星。'},{id:'phecda',name:'天玑',x:42,y:55,size:4},{id:'megrez',name:'天权',x:45,y:42,size:4},{id:'alioth',name:'玉衡',x:56,y:38,size:5},{id:'mizar',name:'开阳',x:66,y:42,size:5},{id:'alkaid',name:'摇光',x:75,y:50,size:5}],lines:[['dubhe','merak'],['merak','phecda'],['phecda','megrez'],['megrez','dubhe'],['megrez','alioth'],['alioth','mizar'],['mizar','alkaid']]},
{id:'polaris',type:'star',name:'北极星',enName:'Polaris',x:50,y:20,size:6,magnitude:1.98,visibleBy:'naked_eye',description:'接近北天极，可帮助判断北方。',points:[{id:'polaris',name:'北极星',en:'Polaris',x:50,y:20,size:6,description:'接近北天极，在北半球夜空中位置变化很小。'}]},
{id:'cassiopeia',type:'constellation',name:'仙后座',recognitionShape:'W/M',points:[{id:'caph',name:'王良一',x:64,y:27,size:5},{id:'schedar',name:'王良四',x:71,y:39,size:6},{id:'navi',name:'策',x:78,y:27,size:5},{id:'ruchbah',name:'阁道三',x:85,y:42,size:5},{id:'segin',name:'阁道二',x:92,y:31,size:4}],lines:[['caph','schedar'],['schedar','navi'],['navi','ruchbah'],['ruchbah','segin']]},
{id:'vega',type:'star',name:'织女星',enName:'Vega',x:28,y:29,size:7,magnitude:0.03,visibleBy:'naked_eye',points:[{id:'vega',name:'织女星',en:'Vega',x:28,y:29,size:7,color:'#eef4ff',description:'天琴座最亮星，夏季大三角最醒目的顶点。'}]},
{id:'lyra',type:'constellation',name:'天琴座',recognitionShape:'亮星旁小平行四边形',points:[{id:'vega',name:'织女星',x:28,y:29,size:7},{id:'sheliak',name:'渐台二',en:'Sheliak',x:38,y:42,size:4},{id:'sulafat',name:'渐台三',en:'Sulafat',x:44,y:39,size:4},{id:'delta_lyr',name:'天琴 δ',x:41,y:51,size:3},{id:'zeta_lyr',name:'天琴 ζ',x:34,y:50,size:3}],lines:[['sheliak','sulafat'],['sulafat','delta_lyr'],['delta_lyr','zeta_lyr'],['zeta_lyr','sheliak']]},
{id:'deneb',type:'star',name:'天津四',enName:'Deneb',x:70,y:23,size:6,points:[{id:'deneb',name:'天津四',en:'Deneb',x:70,y:23,size:6,color:'#eef4ff'}]},
{id:'cygnus',type:'constellation',name:'天鹅座',recognitionShape:'北天十字',points:[{id:'deneb',name:'天津四',x:70,y:23,size:6},{id:'sadr',name:'辇道增七',en:'Sadr',x:62,y:43,size:5},{id:'albireo',name:'辇道增五',en:'Albireo',x:52,y:70,size:5,color:'#ffe2a8'},{id:'gienah',name:'天津九',x:48,y:43,size:4},{id:'delta_cyg',name:'天津二',x:76,y:45,size:4}],lines:[['deneb','sadr'],['sadr','albireo'],['gienah','sadr'],['sadr','delta_cyg']]},
{id:'altair',type:'star',name:'牛郎星',enName:'Altair',x:54,y:73,size:6,points:[{id:'altair',name:'牛郎星',en:'Altair',x:54,y:73,size:6,color:'#fff1d8'}]},
{id:'aquila',type:'constellation',name:'天鹰座',recognitionShape:'牛郎星三连星',points:[{id:'tarazed',name:'河鼓三',x:50,y:65,size:4},{id:'altair',name:'牛郎星',x:54,y:73,size:6},{id:'alshain',name:'河鼓一',x:59,y:80,size:4}],lines:[['tarazed','altair'],['altair','alshain']]},
{id:'summer_triangle',type:'asterism',name:'夏季大三角',points:[{id:'vega',name:'织女星',x:28,y:29,size:7},{id:'deneb',name:'天津四',x:70,y:23,size:6},{id:'altair',name:'牛郎星',x:54,y:73,size:6}],lines:[['vega','deneb'],['deneb','altair'],['altair','vega']]},
{id:'star_chain',type:'training_field',name:'训练星链',points:[{id:'chain1',name:'星链 1',x:36,y:40,size:3},{id:'chain2',name:'星链 2',x:45,y:45,size:3},{id:'chain3',name:'星链 3',x:54,y:42,size:4},{id:'chain4',name:'星链 4',x:63,y:49,size:3},{id:'chain5',name:'星链 5',x:72,y:45,size:4}],lines:[['chain1','chain2'],['chain2','chain3'],['chain3','chain4'],['chain4','chain5']]},
{id:'sparse_field',type:'training_field',name:'稀疏星野',points:[{id:'sparse1',name:'背景星',x:25,y:30,size:2},{id:'sparse2',name:'背景星',x:60,y:55,size:2},{id:'sparse3',name:'背景星',x:82,y:28,size:2}]},
{id:'milky_way_field',type:'training_field',name:'银河密集星野',points:Array.from({length:18},(_,i)=>({id:`dense${i+1}`,name:'背景星',x:15+(i*17)%75,y:20+(i*23)%62,size:2+(i%4===0?1:0)}))},
{id:'pegasus',type:'constellation',name:'飞马大四边形',recognitionShape:'大四边形',points:[{id:'markab',name:'室宿一',en:'Markab',x:24,y:62,size:5},{id:'scheat',name:'室宿二',en:'Scheat',x:20,y:27,size:5},{id:'algenib',name:'壁宿一',en:'Algenib',x:64,y:60,size:5},{id:'alpheratz',name:'壁宿二',en:'Alpheratz',x:61,y:25,size:6}],lines:[['markab','scheat'],['scheat','alpheratz'],['alpheratz','algenib'],['algenib','markab']]},
{id:'andromeda',type:'constellation',name:'仙女座',recognitionShape:'从壁宿二延伸的星链',points:[{id:'alpheratz',name:'壁宿二',x:61,y:25,size:6},{id:'mirach',name:'奎宿九',en:'Mirach',x:72,y:37,size:5},{id:'mu_and',name:'仙女座 μ',x:78,y:27,size:4},{id:'almach',name:'天大将军一',en:'Almach',x:88,y:49,size:5}],lines:[['alpheratz','mirach'],['mirach','almach'],['mirach','mu_and']]},
{id:'m31',type:'deep_sky',name:'仙女座星系',catalog:'M31',visibleBy:'10x50',appearance:'faint_oval_glow',points:[{id:'m31',name:'仙女座星系',en:'M31',x:84,y:18,size:12,kind:'deep_sky',description:'双筒中呈微弱椭圆模糊光斑。'}]},
{id:'perseus',type:'constellation',name:'英仙座',recognitionShape:'弯曲星链',points:[{id:'mirfak',name:'天船三',en:'Mirfak',x:58,y:48,size:6},{id:'algol',name:'大陵五',en:'Algol',x:69,y:63,size:5},{id:'delta_per',name:'英仙 δ',x:48,y:58,size:4},{id:'epsilon_per',name:'英仙 ε',x:39,y:68,size:4}],lines:[['epsilon_per','delta_per'],['delta_per','mirfak'],['mirfak','algol']]},
{id:'double_cluster',type:'deep_sky',name:'英仙座双星团',catalog:'h/χ Persei',visibleBy:'10x50',appearance:'two_dense_glows',points:[{id:'double_cluster',name:'双星团',en:'h/χ',x:43,y:29,size:14,kind:'deep_sky',description:'两团相邻的密集星群。'}]},
{id:'moon',type:'solar_system',name:'月球',visibleBy:'10x50',points:[{id:'moon',name:'月球',en:'Moon',x:50,y:45,size:18,color:'#eee7ce',description:'观察月海、明暗区域和明暗分界线。'}],training:{features:['lunar_maria','terminator']}}
];

for(const item of objects)fs.writeFileSync(path.join(objectDir,`${item.id}.json`),JSON.stringify(item,null,2)+'\n','utf8');
for(const item of lessons)fs.writeFileSync(path.join(lessonDir,`day${String(item.day).padStart(2,'0')}.json`),JSON.stringify(item,null,2)+'\n','utf8');
fs.writeFileSync(path.join(lessonDir,'index.json'),JSON.stringify({version:'0.4',chapters},null,2)+'\n','utf8');
console.log(`Generated ${lessons.length} lessons and ${objects.length} objects.`);
