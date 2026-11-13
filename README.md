# 资治通鉴动画

用代码（Remotion + React + TypeScript + SVG/CSS）把《资治通鉴》里的故事做成 16:9、1920×1080、30fps 的讲解动画。第一集：《三家分晋》。

画面不引用任何外部图片素材，地图、人物、印章全部由代码绘制；配音用 edge-tts，字幕由语音时间戳生成。

- 需求与进度：[TASK.md](TASK.md)
- 制作规范与内容规则：[AGENTS.md](AGENTS.md)
- 变更记录：[docs/CHANGELOG.md](docs/CHANGELOG.md)

## 环境要求

| 工具 | 版本 | 用途 |
| --- | --- | --- |
| Node.js | 20 或以上（推荐 22 LTS） | Remotion / TypeScript |
| npm | 10 或以上 | 安装依赖、跑脚本（也可以用 pnpm） |
| Python | 3.10 或以上 | edge-tts 配音（阶段 5 起） |
| ffmpeg | 6 或以上 | 成片检查、抽帧（阶段 11 起） |

Remotion 首次渲染会自动下载 Chrome Headless Shell（约 100 MB），需要能访问网络；之后会缓存在本地。

## 从零跑起来

```bash
# 1. 安装前端依赖（npm 或 pnpm 均可，仓库内附 pnpm-lock.yaml）
npm install
# 或：pnpm install

# 2. 准备 Python 配音环境（阶段 5 才需要，可先跳过）
python -m venv .venv
# Windows PowerShell:
.venv\Scripts\Activate.ps1
# macOS / Linux:
# source .venv/bin/activate
python -m pip install -r requirements.txt

# 3. 打开 Remotion Studio 实时预览
npm run studio
```

Studio 会列出当前所有 Composition。阶段 1 只有一个 `ScaffoldPreview`（5 秒的脚手架预览，用来验证画布、宣纸底色和标题动效）。

## 常用命令

| 命令 | 作用 |
| --- | --- |
| `npm run studio` / `npm run dev` | 打开 Remotion Studio 预览、逐帧调试 |
| `npm run typecheck` | TypeScript 类型检查（不产出文件） |
| `npm test` | 跑 vitest 单元测试 |
| `npm run still -- <CompositionId> <输出路径> --frame=<帧号>` | 渲染单帧 PNG，用于检查画面 |
| `npm run render -- <CompositionId> <输出路径>` | 渲染 mp4 |

阶段 1 的自检命令：

```bash
npm run typecheck
npm test
npm run still -- ScaffoldPreview out/stills/scaffold-preview.png --frame=60
```

渲染结果在 `out/`，已被 `.gitignore` 忽略；`episodes/<id>/audio/` 下的配音与时间戳同样是生成物，不提交。

## 目录结构

```
episodes/<id>/script.md        口播稿（原创表述）
episodes/<id>/storyboard.json  分镜，zod 校验（阶段 3–4）
episodes/<id>/sources.md       引用的《资治通鉴》原文与出处（阶段 2）
episodes/<id>/audio/           edge-tts 生成的 mp3 + 时间戳（生成物）
src/index.ts                   Remotion 入口，注册 Composition
src/Root.tsx                   Composition 注册表
src/video.ts                   画布尺寸 / 帧率 / 秒帧换算
src/theme.ts                   全片色板（宣纸、墨黑、朱红、赭石、石青）
src/components/                通用视觉组件（宣纸背景等）
src/scenes/                    具体镜头
src/templates/                 可复用镜头模板（阶段 6 起）
src/characters/                皮影风格人物组件（阶段 8 起）
scripts/                       TTS、时间轴、渲染检查脚本（阶段 5 起）
docs/                          变更记录、自查报告、新集制作指南
out/                           渲染输出（不提交）
```

## 制作流程（后续阶段）

1. **写稿**：`episodes/<id>/script.md`，750–900 字，按 TASK.md 的故事要点组织；古文引用单独记到 `sources.md`。
2. **分镜**：写 `storyboard.json`，用 `src/schema.ts` 校验；每个镜头一段旁白。
3. **配音**：`npm run tts -- <集 id>`（阶段 5 提供）逐镜头生成 mp3 与时间戳，汇总成 `timeline.json`。
4. **渲染**：主 Composition 读取 storyboard + timeline，合成画面、配音、字幕，`npm run render -- <集 id>` 输出成片。

## 内容与技术约定

- 史实以《资治通鉴》古文原文（公有领域）为依据，旁白必须是本项目原创表述；不复制、不近似改写现代白话译本。
- 引用的古文金句必须准确，并在 `episodes/<id>/sources.md` 标出卷名与段落。
- 动效克制：缓入缓出、淡入淡出、轻微推拉，不做闪烁和快切。
- 每个阶段完成前必须 `npm run typecheck`、`npm test` 通过，并能渲染出相关静帧。
