#!/usr/bin/env node
/**
 * 一条命令渲染成片：
 *   npm run render -- 01-sanjia-fenjin
 *
 * 长片直接整段渲染时，Remotion 在这台机器上会卡在首帧；
 * 因此默认按 40 秒分段渲染，再用 ffmpeg 无损拼接。
 * 传 --single 可退回整段渲染。
 */
import {execFileSync} from 'node:child_process';
import {createRequire} from 'node:module';
import {existsSync, mkdirSync, readFileSync, rmSync, writeFileSync} from 'node:fs';
import {dirname, join, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(import.meta.url);
const COMPOSITIONS: Record<string, string> = {
  '01-sanjia-fenjin': 'Episode01',
};
const END_CARD_FRAMES = 150;
const CHUNK_FRAMES = 600;

const PLATFORM_PACKAGES: Record<string, string> = {
  'win32-x64': '@remotion/compositor-win32-x64-msvc',
  'darwin-arm64': '@remotion/compositor-darwin-arm64',
  'darwin-x64': '@remotion/compositor-darwin-x64',
  'linux-x64': '@remotion/compositor-linux-x64-gnu',
  'linux-arm64': '@remotion/compositor-linux-arm64-gnu',
};

function resolveFfmpeg(): string {
  try {
    execFileSync('ffmpeg', ['-version'], {stdio: 'ignore'});
    return 'ffmpeg';
  } catch {
    // 继续找 Remotion compositor
  }
  const packageName = PLATFORM_PACKAGES[`${process.platform}-${process.arch}`];
  if (!packageName) throw new Error(`没有为 ${process.platform}-${process.arch} 配置 ffmpeg`);
  const dirName = packageName.split('/')[1];
  const binaryName = process.platform === 'win32' ? 'ffmpeg.exe' : 'ffmpeg';
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
  throw new Error('找不到 ffmpeg。请安装 ffmpeg，或确认 Remotion compositor 已安装。');
}

const args = process.argv.slice(2);
const episode = args[0] ?? '01-sanjia-fenjin';
const single = args.includes('--single');
const extra = args.slice(1).filter((arg) => arg !== '--single');

const composition = COMPOSITIONS[episode];
if (!composition) {
  throw new Error(
    `没有为「${episode}」登记 Composition。可选：${Object.keys(COMPOSITIONS).join(', ')}`,
  );
}

const publicAudio = join(ROOT, 'public', 'audio');
if (!existsSync(join(publicAudio, 'full.mp3'))) {
  throw new Error('public/audio 缺少 full.mp3。请先运行 npm run tts -- ' + episode);
}

const timeline = JSON.parse(
  readFileSync(join(ROOT, 'episodes', episode, 'timeline.json'), 'utf8'),
) as {totalDurationInFrames: number};
const totalFrames = timeline.totalDurationInFrames + END_CARD_FRAMES;
const output = join(ROOT, 'out', `${episode}.mp4`);
const cli = join(ROOT, 'node_modules', '@remotion', 'cli', 'remotion-cli.js');

const render = (target: string, from: number, to: number) => {
  console.log(`渲染 ${from}–${to} 帧 → ${target}`);
  for (let attempt = 1; attempt <= 2; attempt += 1) {
    try {
      execFileSync(
        process.execPath,
        [
          cli,
          'render',
          composition,
          target,
          `--frames=${from}-${to}`,
          '--log=error',
          ...extra,
        ],
        {cwd: ROOT, stdio: 'inherit'},
      );
      return;
    } catch (error) {
      if (attempt === 2) throw error;
      console.warn(`分片渲染失败，重试一次：${from}–${to}`);
    }
  }
};

if (single) {
  render(output, 0, totalFrames - 1);
} else {
  const chunkDir = join(ROOT, 'out', 'chunks');
  rmSync(chunkDir, {recursive: true, force: true});
  mkdirSync(chunkDir, {recursive: true});
  const files: string[] = [];
  for (let start = 0; start < totalFrames; start += CHUNK_FRAMES) {
    const end = Math.min(totalFrames - 1, start + CHUNK_FRAMES - 1);
    const file = join(chunkDir, `${episode}-${String(start).padStart(5, '0')}.mp4`);
    render(file, start, end);
    files.push(file);
  }

  const listPath = join(chunkDir, `${episode}-concat.txt`);
  writeFileSync(
    listPath,
    `${files.map((file) => `file '${file.replace(/\\/g, '/')}'`).join('\n')}\n`,
    'utf8',
  );
  const ffmpeg = resolveFfmpeg();
  console.log(`拼接 ${files.length} 个分片 → ${output}`);
  execFileSync(
    ffmpeg,
    [
      '-hide_banner',
      '-loglevel',
      'error',
      '-y',
      '-f',
      'concat',
      '-safe',
      '0',
      '-i',
      listPath,
      '-c',
      'copy',
      output,
    ],
    {cwd: ROOT, stdio: 'inherit'},
  );
}

console.log(`完成：${output}`);
