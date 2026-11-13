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
