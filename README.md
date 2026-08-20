# StarPath V0.4

StarPath 是一个面向手机浏览器的 30 天观星训练器。它不是实时天文导航软件，而是通过“认、找、连、记、测、星跳、独立观测”的训练流程，帮助初学者建立自己的天空认知地图。

## 1. 当前版本

- 完整课程：Day01–Day30
- 四个阶段：建立天空方向感、夏季星空与双筒基础、双筒导航与星跳、秋季星空与深空目标
- 主要设备：肉眼与 10×50 双筒望远镜
- 手机优先：支持 320–480px 宽度和安全区域
- 数据驱动：课程正文和步骤均在 JSON 中，核心播放器不包含某一天的专用逻辑

## 2. 如何运行

课程通过 `fetch()` 读取 JSON，因此不能直接双击 `index.html`。请在本目录启动本地静态服务器，例如：

```powershell
python -m http.server 8000
```

然后打开：

- 课程目录：`http://localhost:8000/`
- 指定课程：`http://localhost:8000/?day=03`
- 开发模式：`http://localhost:8000/?dev=1`

手机与电脑在同一局域网时，也可以用电脑的局域网 IP 访问；正式分享建议使用 GitHub Pages。

## 3. 项目结构

```text
StarPath_V0.4/
├── index.html
├── css/app.css
├── js/
│   ├── app.js
│   ├── DataLoader.js
│   ├── LessonPlayer.js
│   ├── SkyRenderer.js
│   ├── GuideRenderer.js
│   ├── QuizEngine.js
│   ├── PracticeRenderer.js
│   ├── BinocularEngine.js
│   └── ProgressManager.js
├── data/
│   ├── lessons/day01.json ... day30.json
│   ├── lessons/index.json
│   └── objects/*.json
└── tools/
    ├── generate-content.mjs
    └── validate-content.mjs
```

## 4. Lesson Schema

每一天只有一个 Lesson JSON：

```json
{
  "day": 31,
  "title": "认识昴星团",
  "chapterId": "autumn",
  "chapter": "秋季星空与深空目标",
  "difficulty": 3,
  "duration": "20分钟",
  "goal": "通过星跳找到昴星团",
  "objects": ["m45"],
  "steps": [],
  "completion": {}
}
```

每个 Step 必须有全局唯一 ID，例如 `d31_s01`。支持的类型只有：`intro`、`learn`、`guide`、`quiz`、`practice`、`binocular`。

## 5. 如何增加 Day31

播放器会按 `day01.json`、`day02.json`……顺序自动发现课程，遇到第一个不存在的文件时停止。因此新增连续课程不需要修改 `LessonPlayer`、首页或课程清单。

1. 新增 `data/lessons/day31.json`，并把 `chapterId` 设为已有阶段 ID。
2. 如果课程需要新目标，新增 `data/objects/m45.json`。
3. 在 Day31 的 `objects` 中引用 `m45`，步骤中只使用已有 Step 类型和 Practice mode。
4. 运行内容检查。

只要 Day31 使用现有交互能力，上述两个数据文件就是全部功能改动。若要建立全新的第五阶段，只需再在 `data/lessons/index.json` 增加阶段标题；核心播放器仍无需修改。

## 6. Object 数据

Object 与 Lesson 分离。Object 文件保存目标的名称、类型、识别形状、星点坐标、连线、可见方式和训练描述。一个 Object 可以被多天课程复用。

当前包括北斗、北极星、仙后座、织女星、天琴座、天津四、天鹅座、牛郎星、天鹰座、夏季大三角、飞马四边形、仙女座、M31、英仙座、双星团、月球以及训练星野。

## 7. Practice modes

`PracticeRenderer` 支持：

- `direction_check`
- `shape_recognition`
- `blind_sky`
- `angle_estimation`
- `field_of_view_compare`
- `rotate_sky_map`
- `sky_map_match`
- `sky_map_recall`
- `sequence_click`
- `star_hop`
- `target_centering`
- `comparison`
- `observation_check`

课程应优先组合这些 mode，不要为单独一天新增专用页面或 `if (day === 31)`。

## 8. 进度与日志

进度保存在当前浏览器的 `localStorage`，键名为 `starpath.v04.progress`。数据包括：

- 当前解锁课程
- 已完成课程
- 已认识目标
- 已获得能力
- 每课当前步骤
- 观星日志

观星日志完全可选，地点为手动填写，不请求 GPS。清除浏览器网站数据会同时清除进度和日志。

## 9. 开发模式

访问 `?dev=1` 可：

- 暂时解锁全部课程
- 查看当前 Step ID
- 重置本机测试进度

这些操作只影响当前浏览器，不影响课程 JSON。

## 10. 内容检查

修改课程或 Object 后运行：

```powershell
node tools/validate-content.mjs
```

检查器会验证 Day01–Day30 是否齐全、Step ID 是否重复、Step 类型与 Practice mode 是否受支持，以及 Object、target、sequence 和 path 引用是否存在。

## 11. 手机测试清单

- 在 320、375、390、430、480px 宽度检查无横向滚动
- 检查按钮可点击区域和底部安全区域
- 检查 quiz 不提前显示答案
- 检查星跳必须按顺序点击路标
- 检查双筒视场可拖动，目标稳定进入中央后才通过
- 检查刷新后恢复课程步骤
- 检查完成课程后进度、能力与日志仍存在

## 12. 发布到 GitHub Pages

把本目录中的内容上传到仓库发布分支的根目录，确保仓库根目录直接看到 `index.html`、`css`、`js` 和 `data`。在 GitHub 仓库中进入 `Settings → Pages`，选择 `Deploy from a branch`、`main`、`/(root)` 并保存。

发布后地址通常是：

```text
https://你的用户名.github.io/仓库名/
```

所有资源都使用相对路径，可在项目型 GitHub Pages 地址下运行。更新文件后等待 GitHub Pages 重新部署，再在手机浏览器刷新。
