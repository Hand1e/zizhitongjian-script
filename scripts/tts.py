#!/usr/bin/env python3
"""逐镜头生成配音 mp3 与句级时间戳。

用法：
    python scripts/tts.py 01-sanjia-fenjin
    python scripts/tts.py 01-sanjia-fenjin --force

生成物：
    episodes/<id>/audio/<shot-id>.mp3
    episodes/<id>/audio/<shot-id>.json   # SentenceBoundary 时间戳

完成后会自动调用 scripts/build-timeline.ts 汇总 timeline.json。
"""

from __future__ import annotations

import argparse
import asyncio
import json
import shutil
import subprocess
import sys
import time
from pathlib import Path

import edge_tts

ROOT = Path(__file__).resolve().parents[1]
VOICE = "zh-CN-YunjianNeural"
RATE = "+8%"
CONCURRENCY = 3
MAX_RETRIES = 4
TICKS_PER_SECOND = 10_000_000


def load_storyboard(episode: str) -> dict:
    path = ROOT / "episodes" / episode / "storyboard.json"
    if not path.exists():
        raise SystemExit(f"找不到分镜：{path}")
    data = json.loads(path.read_text(encoding="utf-8"))
    if not data.get("shots"):
        raise SystemExit(f"分镜没有镜头：{path}")
    return data


def is_fresh(audio_path: Path, meta_path: Path) -> bool:
    if not audio_path.exists() or not meta_path.exists():
        return False
    if audio_path.stat().st_size < 1024:
        return False
    try:
        meta = json.loads(meta_path.read_text(encoding="utf-8"))
    except json.JSONDecodeError:
        return False
    return meta.get("voice") == VOICE and meta.get("rate") == RATE


async def synthesize(shot: dict, audio_dir: Path, force: bool, sem: asyncio.Semaphore) -> bool:
    shot_id = shot["id"]
    narration = shot["narration"].strip()
    audio_path = audio_dir / f"{shot_id}.mp3"
    meta_path = audio_dir / f"{shot_id}.json"

    if not force and is_fresh(audio_path, meta_path):
        print(f"[skip] {shot_id}")
        return True

    async with sem:
        for attempt in range(1, MAX_RETRIES + 1):
            try:
                communicate = edge_tts.Communicate(
                    narration,
                    VOICE,
                    rate=RATE,
                    boundary="SentenceBoundary",
                )
                audio = bytearray()
                boundaries: list[dict] = []
                async for chunk in communicate.stream():
                    if chunk["type"] == "audio":
                        audio.extend(chunk["data"])
                    elif chunk["type"] == "SentenceBoundary":
                        start = chunk["offset"] / TICKS_PER_SECOND
                        end = (chunk["offset"] + chunk["duration"]) / TICKS_PER_SECOND
                        boundaries.append(
                            {
                                "text": chunk["text"],
                                "startSeconds": round(start, 3),
                                "endSeconds": round(end, 3),
                            }
                        )

                if len(audio) < 1024:
                    raise RuntimeError(f"音频太小：{len(audio)} bytes")

                audio_path.write_bytes(audio)
                duration = max((b["endSeconds"] for b in boundaries), default=0.0)
                meta_path.write_text(
                    json.dumps(
                        {
                            "shotId": shot_id,
                            "narration": narration,
                            "voice": VOICE,
                            "rate": RATE,
                            "durationSeconds": round(duration, 3),
                            "boundaries": boundaries,
                        },
                        ensure_ascii=False,
                        indent=2,
                    )
                    + "\n",
                    encoding="utf-8",
                )
                print(
                    f"[ok]   {shot_id}  {len(audio)//1024} KiB  "
                    f"{duration:.1f}s  {len(boundaries)} 句"
                )
                return True
            except Exception as exc:  # noqa: BLE001 - 网络错误需要重试
                if attempt == MAX_RETRIES:
                    print(f"[fail] {shot_id}: {exc}", file=sys.stderr)
                    return False
                wait = 2**attempt
                print(f"[retry {attempt}/{MAX_RETRIES}] {shot_id}: {exc}（{wait}s 后重试）")
                await asyncio.sleep(wait)
    return False


def build_timeline(episode: str) -> None:
    tsx = ROOT / "node_modules" / "tsx" / "dist" / "cli.mjs"
    node = shutil.which("node")
    if not node or not tsx.exists():
        print(
            "未找到 node/tsx，跳过 timeline 生成；请手动运行 npm run timeline -- "
            f"{episode}",
            file=sys.stderr,
        )
        return
    subprocess.run(
        [node, str(tsx), str(ROOT / "scripts" / "build-timeline.ts"), episode],
        cwd=ROOT,
        check=True,
    )


async def main_async(args: argparse.Namespace) -> int:
    episode = args.episode
    storyboard = load_storyboard(episode)
    audio_dir = ROOT / "episodes" / episode / "audio"
    audio_dir.mkdir(parents=True, exist_ok=True)

    sem = asyncio.Semaphore(CONCURRENCY)
    started = time.time()
    results = await asyncio.gather(
        *[
            synthesize(shot, audio_dir, args.force, sem)
            for shot in storyboard["shots"]
        ]
    )
    failed = [shot["id"] for shot, ok in zip(storyboard["shots"], results) if not ok]
    print(
        f"\n完成 {len(results) - len(failed)}/{len(results)} 个镜头，"
        f"用时 {time.time() - started:.1f}s"
    )
    if failed:
        print("失败镜头：" + ", ".join(failed), file=sys.stderr)
        return 1

    if not args.no_timeline:
        build_timeline(episode)
    return 0


def main() -> int:
    parser = argparse.ArgumentParser(description="逐镜头生成 edge-tts 配音")
    parser.add_argument("episode", nargs="?", default="01-sanjia-fenjin")
    parser.add_argument("--force", action="store_true", help="忽略已有音频，全部重新生成")
    parser.add_argument("--no-timeline", action="store_true", help="只生成配音，不汇总时间轴")
    args = parser.parse_args()
    return asyncio.run(main_async(args))


if __name__ == "__main__":
    raise SystemExit(main())
