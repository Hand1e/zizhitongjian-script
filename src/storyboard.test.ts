import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {describe, expect, it} from 'vitest';
import storyboardJson from '../episodes/01-sanjia-fenjin/storyboard.json';
import {storyboardSchema} from './schema';

const normalize = (text: string): string => text.replace(/\s+/g, '');
const hanCount = (text: string): number =>
  (text.match(/[\u4e00-\u9fff]/g) ?? []).length;

const scriptText = readFileSync(
  resolve(process.cwd(), 'episodes/01-sanjia-fenjin/script.md'),
  'utf8',
);
const scriptBody = scriptText.split('\n---\n')[1] ?? '';
const scriptNarration = scriptBody
  .split('\n')
  .filter((line) => line.trim() !== '' && !line.startsWith('## '))
  .join('');

describe('第一集分镜', () => {
  const board = storyboardSchema.parse(storyboardJson);

  it('镜头数在 18–28 之间，共 7 种镜头类型', () => {
    expect(board.shots.length).toBeGreaterThanOrEqual(18);
    expect(board.shots.length).toBeLessThanOrEqual(28);
    const types = new Set(board.shots.map((shot) => shot.type));
    expect([...types].sort()).toEqual(
      ['dialogue', 'map', 'narration', 'quote', 'relation', 'timeline', 'title'].sort(),
    );
  });

  it('每个镜头一段旁白，拼起来与口播稿完全一致', () => {
    const fromShots = board.shots.map((shot) => shot.narration).join('');
    expect(normalize(fromShots)).toBe(normalize(scriptNarration));
  });

  it('预估总时长在 3–4 分钟之间', () => {
    const frames = board.shots.reduce(
      (sum, shot) => sum + (shot.estimatedDurationInFrames ?? 0),
      0,
    );
    expect(frames / 30).toBeGreaterThan(180);
    expect(frames / 30).toBeLessThan(240);
  });

  it('第一个镜头不转场，且至少有一个卷轴转场', () => {
    expect(board.shots[0].transition.type).toBe('none');
    expect(board.shots.some((shot) => shot.transition.type === 'scroll')).toBe(true);
  });

  it('旁白总字数与口播稿一致（约 950 字）', () => {
    const total = board.shots.reduce((sum, shot) => sum + hanCount(shot.narration), 0);
    expect(total).toBe(hanCount(scriptNarration));
    expect(total).toBeGreaterThan(900);
  });
});
