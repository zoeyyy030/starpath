# StarPath LessonPlayer v0.2

这是一个数据驱动的手机端观星训练原型。页面只负责解释课程，课程内容位于 `data/lessons`，星体资料位于 `data/objects`。

## 运行

在本目录启动任意静态文件服务器，然后访问：

- `http://localhost:8000/`（课程列表）
- `http://localhost:8000/?day=01`（直接进入 Day 01）

直接双击 HTML 会因浏览器对本地 JSON 的安全限制而无法加载课程。

## 新增课程

复制一个 Lesson JSON 为 `data/lessons/day03.json`，填入规范字段并复用已有 object；如需新天体，再在 `data/objects` 添加对应 JSON。最后在 `data/lessons/index.json` 登记文件，课程就会出现在首页，无需修改页面代码。
