#!/usr/bin/env node
/**
 * 成片检查：
 *   tsx scripts/verify-render.ts 01-sanjia-fenjin
 *
 * - ffprobe 检查分辨率 / 帧率 / 时长 / 音视频流
 * - 正片时长与 timeline 总时长对比（误差 < 0.5 秒）
 * - 抽取每个镜头中间帧到 out/frames/
 * - 写 out/render-report.json
 */
import {execFileSync} from 'node:child_process';
import {createRequire} from 'node:module';
import {existsSync, mkdirSync, readFileSync, statSync, writeFileSync} from 'node:fs';
import {dirname, join, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(import.meta.url);
const END_CARD_SECONDS = 5;

const PLATFORM_PACKAGES: Record<string, string> = {
  'win32-x64': '@remotion/compositor-win32-x64-msvc',
  'darwin-arm64': '@remotion/compositor-darwin-arm64',
  'darwin-x64': '@remotion/compositor-darwin-x64',
  'linux-x64': '@remotion/compositor-linux-x64-gnu',
  'linux-arm64': '@remotion/compositor-linux-arm64-gnu',
};

function resolveTool(name: 'ffprobe' | 'ffmpeg'): string {
  try {
    execFileSync(name, ['-version'], {stdio: 'ignore'});
    return name;
  } catch {
    // 继续找 Remotion compositor
  }
  const packageName = PLATFORM_PACKAGES[`${process.platform}-${process.arch}`];
  if (!packageName) {
    throw new Error(`没有为 ${process.platform}-${process.arch} 配置 ${name}`);
  }
  const dirName = packageName.split('/')[1];
  const binaryName = process.platform === 'win32' ? `${name}.exe` : name;
  const candidates = [
    join(ROOT, 'node_modules', '.pnpm', 'node_modules', '@remotion', dirName, binaryName),
    join(ROOT, 'node_modules', '@remotion', dirName, binaryName),
  ];
  try {
    const pkgJson = require.resolve(`${packageName}/package.json`);
    candidates.push(join(dirname(pkgJson), binaryName));
  } catch {
    // ignore
  }
  for (const candidate of candidates) {
    if (existsSync(candidate)) return candidate;
  }
  throw new Error(`找不到 ${name}。请安装 ffmpeg。`);
}

type Probe = {
  streams: Array<{
    codec_type: string;
    codec_name?: string;
    width?: number;
    height?: number;
    r_frame_rate?: string;
    duration?: string;
  }>;
  format: {duration?: string; size?: string};
};

const episode = process.argv[2] ?? '01-sanjia-fenjin';
const videoPath = join(ROOT, 'out', `${episode}.mp4`);
const timelinePath = join(ROOT, 'episodes', episode, 'timeline.json');
const framesDir = join(ROOT, 'out', 'frames');
const reportPath = join(ROOT, 'out', 'render-report.json');

if (!existsSync(videoPath)) {
  throw new Error(`找不到成片：${videoPath}。请先运行 npm run render -- ${episode}`);
}
if (!existsSync(timelinePath)) {
  throw new Error(`找不到时间轴：${timelinePath}`);
}

const timeline = JSON.parse(readFileSync(timelinePath, 'utf8')) as {
  totalDurationInFrames: number;
  totalDurationSeconds: number;
  fps: number;
  shots: Array<{id: string; startFrame: number; durationInFrames: number}>;
};

const ffprobe = resolveTool('ffprobe');
const ffmpeg = resolveTool('ffmpeg');

const probe = JSON.parse(
  execFileSync(
    ffprobe,
    [
      '-v',
      'error',
      '-show_entries',
      'stream=codec_type,codec_name,width,height,r_frame_rate,duration',
      '-show_entries',
      'format=duration,size',
      '-of',
      'json',
      videoPath,
    ],
    {encoding: 'utf8'},
  ),
) as Probe;

const video = probe.streams.find((stream) => stream.codec_type === 'video');
const audio = probe.streams.find((stream) => stream.codec_type === 'audio');
if (!video || !audio) {
  throw new Error('成片缺少视频流或音频流');
}

const duration = Number.parseFloat(probe.format.duration ?? '0');
const contentDuration = duration - END_CARD_SECONDS;
const audioDelta = Math.abs(contentDuration - timeline.totalDurationSeconds);
const fps = video.r_frame_rate === '30/1' ? 30 : Number(video.r_frame_rate?.split('/')[0]);
const resolutionOk = video.width === 1920 && video.height === 1080;
const fpsOk = Math.abs(fps - 30) < 0.01;
const durationOk = audioDelta < 0.5;

mkdirSync(framesDir, {recursive: true});
const extracted: Array<{shot: string; frame: number; file: string; bytes: number}> = [];
for (const shot of timeline.shots) {
  const frame = shot.startFrame + Math.floor(shot.durationInFrames / 2);
  const seconds = frame / timeline.fps;
  const file = join(framesDir, `${shot.id}.png`);
  execFileSync(
    ffmpeg,
    [
      '-hide_banner',
      '-loglevel',
      'error',
      '-ss',
      seconds.toFixed(3),
      '-i',
      videoPath,
      '-frames:v',
      '1',
      '-y',
      file,
    ],
    {stdio: 'ignore'},
  );
  extracted.push({shot: shot.id, frame, file: `out/frames/${shot.id}.png`, bytes: statSync(file).size});
}

const endCardSecond = duration - END_CARD_SECONDS / 2;
const endCardFile = join(framesDir, 'zz-endcard.png');
execFileSync(
  ffmpeg,
  [
    '-hide_banner',
    '-loglevel',
    'error',
    '-ss',
    endCardSecond.toFixed(3),
    '-i',
    videoPath,
    '-frames:v',
    '1',
    '-y',
    endCardFile,
  ],
  {stdio: 'ignore'},
);
extracted.push({
  shot: 'end-card',
  frame: Math.round(endCardSecond * timeline.fps),
  file: 'out/frames/zz-endcard.png',
  bytes: statSync(endCardFile).size,
});

const report = {
  episode,
  video: videoPath,
  durationSeconds: duration,
  contentDurationSeconds: Number(contentDuration.toFixed(3)),
  endCardSeconds: END_CARD_SECONDS,
  expectedContentDurationSeconds: timeline.totalDurationSeconds,
  audioDeltaSeconds: Number(audioDelta.toFixed(3)),
  resolution: `${video.width}x${video.height}`,
  fps,
  videoCodec: video.codec_name,
  audioCodec: audio.codec_name,
  checks: {resolutionOk, fpsOk, durationOk},
  frames: extracted,
};
writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');

console.log(
  [
    `成片：${duration.toFixed(3)}s（正片 ${contentDuration.toFixed(3)}s + 片尾 ${END_CARD_SECONDS}s）`,
    `画面：${video.width}x${video.height} @ ${fps}fps，${video.codec_name} / ${audio.codec_name}`,
    `时长误差：${audioDelta.toFixed(3)}s（阈值 0.5s）`,
    `抽帧：${extracted.length} 张 → out/frames/`,
    `报告：${reportPath}`,
  ].join('\n'),
);

if (!resolutionOk || !fpsOk || !durationOk) {
  console.error('成片检查未通过');
  process.exit(1);
}
