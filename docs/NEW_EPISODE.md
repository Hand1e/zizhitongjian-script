# 制作新一集

本文是《资治通鉴》动画的可复用流程。第一集（`01-sanjia-fenjin`）是完整样例，新集按同样顺序做即可。

## 0. 新建目录

```bash
mkdir -p episodes/02-<slug>
```

需要新增/修改的文件：

| 文件 | 作用 |
| --- | --- |
| `episodes/02-<slug>/script.md` | 口播稿（原创表述） |
| `episodes/02-<slug>/sources.md` | 古文引文与出处 |
| `episodes/02-<slug>/storyboard.json` | 分镜，18–28 个镜头 |
| `src/scenes/Episode02.tsx` | 读取本集 storyboard + timeline 的主 Composition |
| `src/Root.tsx` | 注册 `Episode02` |
| `scripts/render.ts` | 在 `COMPOSITIONS` 里加 `02-<slug> → Episode02` |

> 目前每集的主 Composition 是独立文件（第一集为 `src/scenes/Episode.tsx`）。复制时只改开头的两个 JSON 导入和 Composition id，其余合成逻辑可原样保留。

## 1. 写口播稿

- 目标 850–1000 个汉字，约 3.5–4 分钟；分段 8–9 节，每节 15–30 秒。
- 旁白必须是自己的话，不能复制或近似改写柏杨等现代译本。
- 古文金句逐字准确；每一条都写进 `sources.md`，注明卷名、段落、上下文，异文单独说明。
- 史实不确定的细节宁可不讲。年代、人物关系先核对《通鉴》原文，再用《史记》等互证。
- 首尾可以呼应（第一集用开篇“礼论”与结尾“才德论”呼应）。

写完先自查：`script.md` 正文汉字数在区间内，引文与 `sources.md` 一一对应。

## 2. 写分镜

### 镜头类型

`src/schema.ts` 提供 7 种镜头：

| type | 用途 | 关键字段 |
| --- | --- | --- |
| `title` | 片头 | `title`, `subtitle`, `yearLabel` |
| `quote` | 古文金句 | `text`, `source`, `attribution`, `layout` |
| `map` | 地图 | `focus`, `arrows`, `flood`, `conquests` |
| `dialogue` | 对话 | `speakers`, `lines[{speaker,text,gesture}]` |
| `relation` | 关系图 | `nodes`, `edges[{from,to,relation,changeAt,changeTo}]` |
| `timeline` | 事件轴 | `events[{year,label}]`（year 负数表示公元前） |
| `narration` | 纯旁白 | `heading`, `keywords`, `background` |

所有镜头都必须有：

- `id`：小写字母/数字/连字符，全片唯一
- `narration`：这一段镜头的旁白，一句到几句
- `transition`：进入本镜头的转场，`none` / `fade` / `scroll`；第一个镜头写 `none`
- `estimatedDurationInFrames`（可选）：仅供 studio 预览，真实时长由配音决定

### 分镜规则

- 18–28 个镜头，每集只讲一个故事，节奏约 8–12 秒一个镜头。
- **所有镜头的 narration 按顺序拼接，必须与 `script.md` 正文完全一致**（忽略空白）；不能增删或重复。
- 对话镜头里的 `lines` 是画面上的台词，不参与配音；说话人必须在 `speakers` 里。
- 关系图连线端点必须在 `nodes` 里；`changeTo` 必须和 `changeAt` 一起出现。
- 时间轴事件必须从早到晚；地图箭头不能自己指向自己。

`episodes/01-sanjia-fenjin/storyboard.json` 是最完整的参考。写完用 schema 校验：

```bash
npm test
```

新集需要把 `src/storyboard.test.ts` 里的导入路径换成新集，或复制一份测试。

## 3. 生成配音与时间轴

```bash
npm run tts -- 02-<slug>
```

这条命令会：

1. 读取 `storyboard.json`，逐个镜头调用 edge-tts；
2. 写出 `episodes/02-<slug>/audio/<shot-id>.mp3` 与句级时间戳 json；
3. 把音频复制到 `public/audio/`（Remotion `staticFile` 读取）；
4. 用 ffprobe 汇总 `timeline.json`（镜头起止帧、句级字幕、总时长）。

语音参数在 `scripts/tts.py` 顶部：`VOICE = "zh-CN-YunjianNeural"`、`RATE = "+8%"`。语速偏慢时调大 `RATE`，但要重新生成全部音频。

**生成物不提交**：`episodes/*/audio/`、`public/audio/`。`timeline.json` 提交，方便 Composition 直接读取。

只改了音频、不重跑 TTS 时：

```bash
npm run timeline -- 02-<slug>
```

## 4. 接上主 Composition

复制 `src/scenes/Episode.tsx` → `src/scenes/Episode02.tsx`，改：

```ts
import storyboardJson from '../../episodes/02-<slug>/storyboard.json';
import timelineJson from '../../episodes/02-<slug>/timeline.json';
```

再到 `src/Root.tsx` 注册：

```tsx
<Composition
  id="Episode02"
  component={Episode02}
  durationInFrames={timelineJson.totalDurationInFrames + END_CARD_FRAMES}
  fps={VIDEO.fps}
  width={VIDEO.width}
  height={VIDEO.height}
/>
```

最后在 `scripts/render.ts` 的 `COMPOSITIONS` 里加：

```ts
'02-<slug>': 'Episode02',
```

## 5. 渲染与检查

```bash
npm run typecheck
npm test
npm run render -- 02-<slug>
npm run verify -- 02-<slug>
npm run check:frames
```

`verify` 会：

- 用 ffprobe 检查 1920×1080、30fps、视频/音频流；
- 对比正片时长与 `timeline.json` 总时长（阈值 0.5 秒，不含 5 秒片尾）；
- 抽每个镜头中间帧到 `out/frames/`，并写 `out/render-report.json`。

`check:frames` 会检查抽帧是否纯色/空白、深色内容是否贴边、纸张底色占比是否正常，输出 `out/frame-report.json`。

## 6. 人工复查清单

即使自动检查通过，也要打开 `out/frames/` 逐张看：

- 文字是否越界、被字幕遮挡、换行难看；
- 字幕与旁白是否同步（尤其长句、引文）；
- 人物是否穿模、手臂/冠帽是否可辨；
- 地图箭头是否指向正确、颜色是否统一；
- 引文与原稿是否逐字一致；
- 片尾是否出现“下集预告”和账号占位。

发现问题 → 改模板或分镜 → 重新渲染对应镜头/整片。

## 7. 给 DeepSeek 的提示词模板

```
你在项目 <repo> 中制作《资治通鉴》动画的新一集：<主题>。

先读：AGENTS.md、TASK.md、docs/NEW_EPISODE.md、
episodes/01-sanjia-fenjin/{script.md,sources.md,storyboard.json}。

任务：
1. 以《资治通鉴》原文（公有领域）为依据，写 episodes/<id>/script.md：
   850–1000 个汉字，分 8–9 节，口语化、有悬念；不得复制现代白话译本。
2. 在 sources.md 逐条列出引用的古文原句、卷名/段落、上下文与异文。
3. 写 storyboard.json：18–28 个镜头，7 种镜头类型至少覆盖 title/quote/
   map/dialogue/relation/timeline/narration 中合适的类型；每个镜头一段
   narration，拼接后必须与 script.md 正文完全一致；通过 src/schema.ts 校验。
4. 运行 typecheck/test/tts/render/verify/check:frames，修复问题；
   把需要人工看的静帧路径写进 docs/CHANGELOG.md。
5. 按阶段完成 TASK.md 打勾、CHANGELOG、git commit。

内容红线：史实准确；古文引文逐字准确；不确定的细节不讲；不使用外部图片。
```

## 8. 常见问题

- **pnpm 下 `--frame` 被忽略**：pnpm 会把 `--` 一起透传。用 `pnpm exec remotion still ... --frame=60`，或直接用 npm。
- **音频找不到**：先 `npm run tts -- <id>`；确认 `public/audio/` 有对应 mp3。
- **timeline 与分镜不一致**：改完旁白后必须重跑 `npm run tts -- <id>` 或至少 `npm run timeline`；`src/timeline.test.ts` 会检查镜头顺序和旁白。
- **首次渲染很慢**：Remotion 首次会下载 Chrome Headless Shell；之后有缓存。
- **成片比预期长**：edge-tts 实际语速比字数估算慢；调 `scripts/tts.py` 的 `RATE` 后重新生成。
- **片尾导致时长检查失败**：`verify` 会先减去 5 秒片尾再和 timeline 对比；新增片尾时长时同步改 `scripts/verify-render.ts` 的 `END_CARD_SECONDS`。
