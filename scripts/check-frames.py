#!/usr/bin/env python3
"""对 out/frames/ 下的每个镜头中间帧做自动化画面检查。

检查项：
- 分辨率必须是 1920x1080
- 不能是纯色 / 近乎空白
- 深色内容不能贴边（左右上下至少 12px）
- 纸张底色应占画面 15% 以上
- 颜色数量足够（排除渲染失败只剩背景）

用法：python scripts/check-frames.py [frames_dir]
输出：out/frame-report.json
"""

from __future__ import annotations

import json
import sys
from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
FRAMES_DIR = Path(sys.argv[1]) if len(sys.argv) > 1 else ROOT / "out" / "frames"
REPORT = ROOT / "out" / "frame-report.json"
PAPER = np.array([239, 228, 200], dtype=np.int16)
MIN_MARGIN = 12


def analyse(path: Path) -> dict:
    image = Image.open(path).convert("RGB")
    width, height = image.size
    pixels = np.asarray(image, dtype=np.int16)

    # 抽样统计颜色与纸张占比，避免 200 万像素全量去重过慢
    sample = pixels[::4, ::4, :]
    quantized = (sample // 16).astype(np.uint8)
    unique_colors = len(np.unique(quantized.reshape(-1, 3), axis=0))

    diff = np.abs(pixels - PAPER).sum(axis=2)
    paper_ratio = float((diff <= 45).mean())
    nonpaper_ratio = float((diff > 60).mean())

    dark = pixels.sum(axis=2) < 210
    ys, xs = np.where(dark)
    if len(xs) == 0:
        bbox = None
        margin = 0
    else:
        bbox = [int(xs.min()), int(ys.min()), int(xs.max()), int(ys.max())]
        margin = min(bbox[0], bbox[1], width - 1 - bbox[2], height - 1 - bbox[3])

    issues: list[str] = []
    if (width, height) != (1920, 1080):
        issues.append(f"分辨率 {width}x{height} 不是 1920x1080")
    if unique_colors < 120:
        issues.append(f"颜色过少：{unique_colors}")
    if nonpaper_ratio < 0.004:
        issues.append(f"近乎空白：非纸色像素 {nonpaper_ratio:.3%}")
    if paper_ratio < 0.15:
        issues.append(f"纸色占比过低：{paper_ratio:.1%}")
    if margin < MIN_MARGIN:
        issues.append(f"深色内容贴边：留白 {margin}px")

    return {
        "file": str(path.relative_to(ROOT)).replace("\\", "/"),
        "size": f"{width}x{height}",
        "uniqueColors": unique_colors,
        "paperRatio": round(paper_ratio, 4),
        "nonPaperRatio": round(nonpaper_ratio, 4),
        "darkBBox": bbox,
        "margin": margin,
        "issues": issues,
    }


def main() -> int:
    if not FRAMES_DIR.exists():
        print(f"找不到帧目录：{FRAMES_DIR}", file=sys.stderr)
        return 1

    files = sorted(FRAMES_DIR.glob("*.png"))
    if not files:
        print(f"目录里没有 PNG：{FRAMES_DIR}", file=sys.stderr)
        return 1

    results = [analyse(path) for path in files]
    failed = [item for item in results if item["issues"]]
    REPORT.write_text(
        json.dumps({"frames": results, "failed": len(failed)}, ensure_ascii=False, indent=2)
        + "\n",
        encoding="utf-8",
    )

    for item in results:
        status = "FAIL" if item["issues"] else "ok"
        print(
            f"[{status}] {Path(item['file']).name:24s} "
            f"colors={item['uniqueColors']:4d} paper={item['paperRatio']:.2f} "
            f"margin={item['margin']:3d}px"
        )
        for issue in item["issues"]:
            print(f"        - {issue}")

    print(f"\n{len(results) - len(failed)}/{len(results)} 张通过，报告：{REPORT}")
    return 1 if failed else 0


if __name__ == "__main__":
    raise SystemExit(main())
