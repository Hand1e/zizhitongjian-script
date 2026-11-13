#!/usr/bin/env node
/**
 * 汇总逐镜头配音，生成 timeline.json：
 * - 镜头起止帧（30fps）
 * - 每句字幕的相对起止帧
 * - 全片总时长
 *
 * 用法：tsx scripts/build-timeline.ts [episodeId]
 */
import {execFileSync} from 'node:child_process';
import {createRequire} from 'node:module';
import {existsSync, readFileSync, writeFileSync} from 'node:fs';
import {dirname, join, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const FPS = 30;
const WIDTH = 1920;
const HEIGHT = 1080;
/** 每个镜头尾部留一点静音，避免旁白首尾相撞 */
const TAIL_PADDING_FRAMES = 6;

const require = createRequire(import.meta.url);

type Boundary = {
  text: string;
  startSeconds: number;
  endSeconds: number;
};

type AudioMeta = {
  shotId: string;
  narration: string;
  voice: string;
  rate: string;
  durationSeconds: number;
  boundaries: Boundary[];
};

type Shot = {
  id: string;
  type: string;
  narration: string;
};

type Storyboard = {
  episodeId: string;
  title: string;
  shots: Shot[];
};

type Subtitle = {
  text: string;
  startFrame: number;
  endFrame: number;
};

type TimelineShot = {
  id: string;
  type: string;
  narration: string;
  startFrame: number;
  durationInFrames: number;
  endFrame: number;
  audio: string;
  subtitles: Subtitle[];
};

const PLATFORM_PACKAGES: Record<string, string> = {
  'win32-x64': '@remotion/compositor-win32-x64-msvc',
  'darwin-arm64': '@remotion/compositor-darwin-arm64',
  'darwin-x64': '@remotion/compositor-darwin-x64',
  'linux-x64': '@remotion/compositor-linux-x64-gnu',
  'linux-arm64': '@remotion/compositor-linux-arm64-gnu',
};

function resolveFfprobe(): string {
  try {
    execFileSync('ffprobe', ['-version'], {stdio: 'ignore'});
    return 'ffprobe';
  } catch {
    // 没有全局 ffprobe 时，退回 Remotion 自带的 compositor
  }

  const packageName = PLATFORM_PACKAGES[`${process.platform}-${process.arch}`];
  if (!packageName) {
    throw new Error(`没有为 ${process.platform}-${process.arch} 配置 ffprobe 路径`);
  }
  const dirName = packageName.split('/')[1];
  const binaryName = process.platform === 'win32' ? 'ffprobe.exe' : 'ffprobe';
  const candidates = [
    join(ROOT, 'node_modules', '.pnpm', 'node_modules', '@remotion', dirName, binaryName),
    join(ROOT, 'node_modules', '@remotion', dirName, binaryName),
  ];

  try {
    const pkgJson = require.resolve(`${packageName}/package.json`);
    candidates.push(join(dirname(pkgJson), binaryName));
  } catch {
    // package.json 可能被 exports 限制，忽略
  }

  for (const candidate of candidates) {
    if (existsSync(candidate)) {
      return candidate;
    }
  }
  throw new Error(
    `找不到 ffprobe。请安装 ffmpeg，或确认 Remotion compositor 已安装（${packageName}）。`,
  );
}

const ffprobe = resolveFfprobe();

function audioDurationSeconds(audioPath: string): number {
  const output = execFileSync(
    ffprobe,
    [
      '-v',
      'error',
      '-select_streams',
      'a:0',
      '-show_entries',
      'format=duration',
      '-of',
      'default=noprint_wrappers=1:nokey=1',
      audioPath,
    ],
    {encoding: 'utf8'},
  ).trim();
  const duration = Number.parseFloat(output);
  if (!Number.isFinite(duration) || duration <= 0) {
    throw new Error(`无法读取音频时长：${audioPath}`);
  }
  return duration;
}

function readJson<T>(path: string): T {
  return JSON.parse(readFileSync(path, 'utf8')) as T;
}

const episode = process.argv[2] ?? '01-sanjia-fenjin';
const episodeDir = join(ROOT, 'episodes', episode);
const storyboardPath = join(episodeDir, 'storyboard.json');
const audioDir = join(episodeDir, 'audio');
const outputPath = join(episodeDir, 'timeline.json');

if (!existsSync(storyboardPath)) {
  throw new Error(`找不到分镜：${storyboardPath}`);
}
if (!existsSync(audioDir)) {
  throw new Error(`找不到音频目录：${audioDir}。请先运行 npm run tts -- ${episode}`);
}

const storyboard = readJson<Storyboard>(storyboardPath);
let cursor = 0;
const timelineShots: TimelineShot[] = [];

for (const shot of storyboard.shots) {
  const audioPath = join(audioDir, `${shot.id}.mp3`);
  const metaPath = join(audioDir, `${shot.id}.json`);
  if (!existsSync(audioPath)) {
    throw new Error(`缺少配音：${audioPath}。请先运行 npm run tts -- ${episode}`);
  }

  const durationSeconds = audioDurationSeconds(audioPath);
  const audioFrames = Math.round(durationSeconds * FPS);
  const durationInFrames = audioFrames + TAIL_PADDING_FRAMES;

  const meta = existsSync(metaPath) ? readJson<AudioMeta>(metaPath) : undefined;
  const boundaries = meta?.boundaries?.filter((b) => b.text.trim() !== '') ?? [];

  let subtitles: Subtitle[];
  if (boundaries.length > 0) {
    subtitles = boundaries.map((boundary) => {
      const startFrame = Math.max(
        0,
        Math.min(audioFrames, Math.round(boundary.startSeconds * FPS)),
      );
      const endFrame = Math.max(
        startFrame + 1,
        Math.min(audioFrames, Math.round(boundary.endSeconds * FPS)),
      );
      return {text: boundary.text.trim(), startFrame, endFrame};
    });
  } else {
    subtitles = [
      {
        text: shot.narration,
        startFrame: 0,
        endFrame: Math.max(1, audioFrames),
      },
    ];
  }

  timelineShots.push({
    id: shot.id,
    type: shot.type,
    narration: shot.narration,
    startFrame: cursor,
    durationInFrames,
    endFrame: cursor + durationInFrames,
    audio: `audio/${shot.id}.mp3`,
    subtitles,
  });
  cursor += durationInFrames;
}

const timeline = {
  episodeId: storyboard.episodeId,
  title: storyboard.title,
  fps: FPS,
  width: WIDTH,
  height: HEIGHT,
  totalDurationInFrames: cursor,
  totalDurationSeconds: Number((cursor / FPS).toFixed(3)),
  shots: timelineShots,
};

writeFileSync(outputPath, `${JSON.stringify(timeline, null, 2)}\n`, 'utf8');

const totalAudio = timelineShots.reduce(
  (sum, shot) => sum + (shot.durationInFrames - TAIL_PADDING_FRAMES) / FPS,
  0,
);
console.log(
  `时间轴：${timelineShots.length} 个镜头，${timeline.totalDurationSeconds}s ` +
    `(${timeline.totalDurationInFrames} 帧)，配音 ${totalAudio.toFixed(1)}s → ${outputPath}`,
);
