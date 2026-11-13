# 变更记录

## 2026-11-13 — 阶段 1：脚手架

### 新增

- Remotion 4.0.543 + React 19 + TypeScript 5.9 + vitest 5 项目；画布固定 1920×1080、30fps，参数集中在 `src/video.ts`
- 入口 `src/index.ts`、Composition 注册表 `src/Root.tsx`
- 宣纸质感背景组件 `src/components/PaperBackground.tsx`（纯 CSS，无图片素材）与全片色板 `src/theme.ts`
- 脚手架预览镜头 `ScaffoldPreview`（5 秒）：验证宣纸底色、衬线标题、朱红印章与克制的淡入动效
- 单元测试：画布参数、秒/帧换算、色板亮度与对比度
- `requirements.txt`（edge-tts 7.3.1，阶段 5 用）、`README.md`（从零跑出成片的完整步骤）、`pnpm-workspace.yaml`（放行 esbuild 安装脚本）
- `.gitignore` 补充 `.remotion/`、`.venv/`、`__pycache__/`、`*.tsbuildinfo`

### 验证

- `npm run typecheck` 通过
- `npm test` 通过：2 个测试文件、6 个用例
- 静帧：`out/stills/scaffold-preview.png`（第 60 帧），1920×1080，10952 种颜色（非纯色）；墨色元素包围盒 `[508,444]–[1215,719]`，四边最窄留白 360px，无越界；朱红元素（印章 + 横线）正常出现
- 视频：`out/scaffold-preview.mp4`，ffprobe 确认 1920×1080、30fps、5.000s、150 帧
- 需人工查看的静帧/视频：`out/stills/scaffold-preview.png`、`out/scaffold-preview.mp4`（检查标题与印章排版、入场动效）

### 已知限制

- 片头仍是占位版；正式 TitleCard（书名 + 集名 + 年份）在阶段 6 实现
- 标题字体暂用系统宋体回退；阶段 6 起用 `@remotion/google-fonts` 加载 Noto Serif SC
- `npm run still` 通过 npm 追加参数时正常；用 pnpm 时请直接 `pnpm exec remotion still ...`，不要在 `--` 后传参（pnpm 会把 `--` 一并透传，导致 `--frame` 被忽略）

## 2026-11-13 — 阶段 2：口播稿与史料出处

### 新增

- `episodes/01-sanjia-fenjin/script.md`：8 节口播稿，按 TASK 的 8 个故事要点组织；正文 826 字（含年份数字 832 字符），每节标注预计时长，合计 180 秒
- `episodes/01-sanjia-fenjin/sources.md`：7 条逐字引文 + 7 条化用依据，标明卷名与段落；附原文上下文、异文处理（沈灶/沉灶、城不浸/城不没等）、未采用内容和参考链接
- `src/content.test.ts`：自动校验正文 750–900 字、8 节结构、稿中引文均能在 `sources.md` 找到、史料文件标明卷名/段落/关键系年

### 验证

- `npm run typecheck` 通过
- `npm test` 通过：3 个测试文件、10 个用例
- 字数：826 个汉字（含年份数字 832 字符），落在 750–900 区间
- 引文：7 条逐字引文与胡三省音注本、通行整理本核对；“沈灶/沉灶”“城不浸/城不没”“脣/唇”等异文已在 `sources.md` 说明
- 本阶段无新增画面；重跑 `npx remotion still ScaffoldPreview ... --frame=60` 成功，既有静帧 `out/stills/scaffold-preview.png` 正常

### 说明

- 《通鉴》把前 453 年灭智的旧事追叙在前 403 年条目中；稿件按事件时间顺序讲述，结尾回扣两个年份
- 晋阳被围的开始年份史说不一，稿中只说“围住晋阳、引水灌城”，不写具体起兵年份
- 未使用任何现代白话译本；古文均为公有领域原文，旁白为原创表述

## 2026-11-13 — 阶段 2b：修订口播稿（新增礼论）

### 改动

- 开篇拆成 `1` 与 `1b` 两节：第 1 节抛出“一纸册封，为什么被看作天下大乱的开始”的悬念；新增 1b 礼论，引用“天子之职莫大于礼，礼莫大于分，分莫大于名”，讲清“天子自坏名分”，并用“这三家是怎么做大的”转入倒叙
- 第 8 节结尾增加回扣：“开篇讲名分，结尾讲才德，说到底是一回事……先问该不该，再问能不能；先立德，再长才”，与开篇礼论首尾呼应
- 第 2–7 节保持原样，未改事实与措辞
- 正文由 826 字增至 951 字（含年份数字 957 字符）；目标时长由约 3 分钟调整为约 3.5 分钟（210 秒），各节时长重新分配
- `sources.md` 新增礼论逐字引文与上下文，删除“只取其意、未逐句引用”的旧说明；补充“天子自坏名分”“以智力相雄长”的原文依据，并注明未展开“名器不可假人”等段落
- `src/content.test.ts`：字数范围改为 850–1000，节数改为 9（含 1b），并校验礼论小节和结尾回扣句

### 验证

- `npm run typecheck` 通过
- `npm test` 通过：4 个测试文件、19 个用例（内容测试 4 个，另有工作区中尚未提交的阶段 3 schema 测试 9 个）
- 礼论引文与胡三省音注本“臣光曰”逐字核对
- 本阶段无画面改动，未渲染新静帧

### 说明

- 阶段 3 的 schema 只约束分镜结构，不依赖具体文案；2b 无需调整 schema，等新稿确认后继续完成阶段 3 的收尾与提交

## 2026-11-13 — 阶段 3：分镜 schema

### 新增

- `src/schema.ts`：用 zod 定义 7 种镜头（title / quote / map / dialogue / relation / timeline / narration），统一包含旁白、预估时长与进入转场（none / fade / scroll）
- `src/characters/cast.ts`：第一集 10 个角色的 id 与中文名，供对话镜头和阶段 8 的人物组件共用
- `src/schema.test.ts`：9 个用例覆盖全部镜头类型、默认值、id 唯一性、说话人、关系图节点、时间轴顺序、地图箭头/吞并、未知字段和越界值

### 设计

- 时间字段：`estimatedDurationInFrames` 仅供 studio 预览；成片时长由阶段 5 配音时间轴决定
- 地图参数：`focus` 高亮领地、`arrows` 行军箭头、`flood` 涨水、`conquests` 领地易主
- 关系图：4 个领地节点，连线支持 `changeAt` / `changeTo`，用于“韩魏倒戈”
- 时间轴：`year` 负数表示公元前，事件必须从早到晚排列
- 全部对象使用严格模式，拼错的字段会直接报错

### 验证

- `npm run typecheck` 通过
- `npm test` 通过：4 个测试文件、19 个用例（内容测试已按 2b 新稿更新）
- schema 不参与渲染；既有静帧 `out/stills/scaffold-preview.png` 已复跑成功

## 2026-11-13 — 阶段 4：分镜

### 新增

- `episodes/01-sanjia-fenjin/storyboard.json`：27 个镜头，覆盖 9 节口播稿的全部内容；每个镜头一段旁白，拼接后与 `script.md` 完全一致
- `src/storyboard.test.ts`：校验镜头数 18–28、7 种镜头类型齐全、旁白无遗漏/重复、预估总时长 3–4 分钟、首镜头无转场且存在卷轴转场

### 分镜结构

- 片头 → 悬念 → 礼论 quote → 三家分晋 map → 倒叙过渡
- 智氏：narration + 智果 quote + 智宣子/智果 dialogue
- 赵氏：narration + 赵简子/赵襄子 dialogue
- 索地：4 个 map 镜头（韩献地、赵拒绝、退守晋阳、水灌晋阳）
- 晋阳：三版 quote、絺疵/智伯 dialogue、智伯不信 narration
- 反攻：张孟谈/韩/魏 dialogue、决水 map、韩魏倒戈 relation
- 收束：公元前 453→403 timeline、才德 quote、两段现代启示 narration
- 预告时长合计 206.8 秒（约 3 分 27 秒），真实时长待阶段 5 配音决定

### 验证

- `npm run typecheck` 通过
- `npm test` 通过：5 个测试文件、24 个用例
- `storyboard.json` 通过 `storyboardSchema` 严格校验

## 2026-11-13 — 阶段 5：配音与时间轴

### 新增

- `scripts/tts.py`：读取 `storyboard.json`，逐镜头调用 edge-tts（`zh-CN-YunjianNeural`，`+8%`，SentenceBoundary），生成 `episodes/<id>/audio/<shot>.mp3` 与同名 json 时间戳；3 并发、失败重试、已有音频自动跳过、完成后自动调用时间轴脚本
- `scripts/build-timeline.ts`：用 ffprobe 读取每个 mp3 的实际时长，生成 `timeline.json`；包含镜头起止帧、句级字幕、全片总时长；每个镜头尾部留 6 帧静音
- `npm run tts -- 01-sanjia-fenjin` 一条命令完成「配音 + 时间轴」
- `src/timeline.test.ts`：校验镜头顺序、帧号连续、总时长与帧率一致、字幕都在镜头范围内

### 生成结果

- 27 个镜头全部生成，配音总长 247.3 秒，成片时间轴 252.733 秒（7582 帧，4 分 12 秒）
- 音频在 `episodes/01-sanjia-fenjin/audio/`，按约定不提交；`timeline.json` 提交，供 Composition 直接读取
- 实际语速比预估慢，成片比 3.5 分钟长约 40 秒；阶段 12 复查时再决定是否调整 rate

### 验证

- `npm run typecheck` 通过
- `npm test` 通过：6 个测试文件、28 个用例
- ffprobe（Remotion 自带）可读取全部 mp3 时长；时间轴帧号连续、无空洞
