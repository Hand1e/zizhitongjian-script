#!/usr/bin/env bash
# 用 DeepSeek 驱动 Claude Code 启动本项目
# 用法：
#   export DEEPSEEK_API_KEY=sk-xxxx
#   export DEEPSEEK_MODEL=<DeepSeek 控制台/文档里的准确模型 ID>
#   ./run-deepseek.sh            # 交互模式
#   ./run-deepseek.sh auto       # 自动推进 TASK.md（无人值守，自动接受文件编辑）
set -euo pipefail
cd "$(dirname "$0")"

: "${DEEPSEEK_API_KEY:?请先 export DEEPSEEK_API_KEY=你的key}"
: "${DEEPSEEK_MODEL:?请先 export DEEPSEEK_MODEL=模型ID（以 DeepSeek 文档为准）}"

export ANTHROPIC_BASE_URL="${DEEPSEEK_BASE_URL:-https://api.deepseek.com/anthropic}"
export ANTHROPIC_AUTH_TOKEN="$DEEPSEEK_API_KEY"
export ANTHROPIC_MODEL="$DEEPSEEK_MODEL"
# 后台小任务也走同一个模型，避免请求 Claude 的模型名
export ANTHROPIC_SMALL_FAST_MODEL="$DEEPSEEK_MODEL"
export ANTHROPIC_DEFAULT_HAIKU_MODEL="$DEEPSEEK_MODEL"
export ANTHROPIC_DEFAULT_SONNET_MODEL="$DEEPSEEK_MODEL"
export ANTHROPIC_DEFAULT_OPUS_MODEL="$DEEPSEEK_MODEL"
export API_TIMEOUT_MS=600000
export CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC=1

if [[ "${1:-}" == "auto" ]]; then
  # 循环推进：每轮完成 TASK.md 中下一个未完成阶段，直到全部打勾
  for i in $(seq 1 "${MAX_ROUNDS:-30}"); do
    if ! grep -q '^- \[ \]' TASK.md; then echo "全部阶段已完成"; break; fi
    echo "===== 第 $i 轮 ====="
    claude -p "阅读 CLAUDE.md 和 TASK.md，完成下一个未打勾的阶段：实现、写测试、运行测试和静帧渲染直到全部通过，然后在 TASK.md 中打勾、更新 docs/CHANGELOG.md 并 git commit。只做一个阶段。" \
      --permission-mode acceptEdits \
      --allowedTools "Bash(npm *)" "Bash(npx *)" "Bash(node *)" "Bash(git *)" "Bash(ls *)" "Bash(cat *)" "Bash(mkdir *)" \
      "Bash(python *)" "Bash(pip *)" "Bash(edge-tts *)" "Bash(ffmpeg *)" "Bash(ffprobe *)" \
      || echo "本轮异常退出，继续下一轮"
  done
else
  exec claude
fi
