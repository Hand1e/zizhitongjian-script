# 项目：资治通鉴动画（代码生成历史讲解动画）

## 目标
用代码把资治通鉴故事做成 16:9（1920x1080, 30fps）讲解动画短片。第一集：三家分晋。
需求与进度见 TASK.md，按阶段推进。

## 技术栈
- 视频：Remotion（React + TypeScript），所有画面用 SVG/CSS/代码绘制，不使用外部图片素材
- 配音：edge-tts（Python），中文男声，推荐 `zh-CN-YunjianNeural` 或 `zh-CN-YunxiNeural`
- 字幕：由 edge-tts 的 WordBoundary/SentenceBoundary 时间戳生成
- 后期：ffmpeg（已安装）

## 目录约定
- `episodes/<id>/script.md`：口播稿
- `episodes/<id>/storyboard.json`：分镜（zod schema 校验，见 `src/schema.ts`）
- `episodes/<id>/audio/`：每个镜头的配音 mp3 + 时间戳 json（生成物，不提交）
- `src/templates/`：可复用镜头模板
- `src/characters/`：皮影风格人物组件
- `out/`：渲染结果（不提交）

## 美术风格
- 整体：古风、皮影戏/剪纸风格。宣纸米黄底色（约 #efe4c8），墨黑、朱红（约 #b0302a）、赭石、石青点缀
- 人物：侧面剪影，用帽冠、胡须、服饰纹样、配色区分身份；关节分段，可做简单的抬手、点头、行走动画
- 地图：简化示意图（右下角标注"示意图"），山川河流用水墨线条，各家势力用不同颜色
- 文字：标题和金句用衬线字体（如 "Noto Serif SC"，用 @remotion/google-fonts 加载）
- 动效克制、流畅：缓入缓出、淡入淡出、轻微镜头推拉，不要花哨闪烁

## 内容规则（重要）
- 讲述以《资治通鉴》古文原文（公有领域）为依据，旁白必须是本项目自己的原创表述
- 柏杨白话版等现代译本受版权保护：可以作为理解参考，但不得复制或近似改写其文字
- 引用的古文金句必须准确，并在 `episodes/<id>/sources.md` 列出出处（卷名、段落）
- 史实要准确；不确定的细节宁可不讲，不要编造

## 工作规则
- 每个阶段完成标准：`npm run typecheck` 通过、`npm test` 通过、相关镜头能用 `npx remotion still` 渲染出静帧
- 你可能无法直接看图：用自动化检查验证画面（静帧非纯色、元素不越界、时长与配音一致等），并把需要人工看的静帧路径写进 `docs/CHANGELOG.md`
- 每完成一个阶段：在 TASK.md 打勾，在 `docs/CHANGELOG.md` 追加说明，然后 `git commit`
- 不要删测试来让它通过；不要提交 node_modules、out/、audio/ 生成物
