import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {describe, expect, it} from 'vitest';

const episodeDir = resolve(process.cwd(), 'episodes', '01-sanjia-fenjin');
const read = (file: string): string => readFileSync(resolve(episodeDir, file), 'utf8');

const script = read('script.md');
const marker = '\n---\n';
const markerIndex = script.indexOf(marker);
if (markerIndex === -1) {
  throw new Error('script.md 缺少元数据分隔线（---）');
}
const afterMeta = script.slice(markerIndex + marker.length);
/** 只统计口播正文：去掉小标题行和空行。 */
const narration = afterMeta
  .split('\n')
  .filter((line) => line.trim() !== '' && !line.startsWith('## '))
  .join('\n');

const hanCount = (text: string): number =>
  (text.match(/[\u4e00-\u9fff]/g) ?? []).length;

/** 去掉中文标点和空白，便于比对引文。 */
const normalize = (text: string): string =>
  text.replace(/[，。；：、“”‘’！？·—…\s]/g, '');

describe('第一集口播稿', () => {
  it('正文 750–900 字（按汉字计）', () => {
    expect(hanCount(narration)).toBeGreaterThanOrEqual(750);
    expect(hanCount(narration)).toBeLessThanOrEqual(900);
  });

  it('按 8 个故事要点分成 8 节', () => {
    const sections = afterMeta.match(/^## \d+\. /gm) ?? [];
    expect(sections).toHaveLength(8);
  });

  it('稿中每句古文引文都能在 sources.md 找到', () => {
    const sources = normalize(read('sources.md'));
    const quotes = narration.match(/“[^”]{4,}”/g) ?? [];
    expect(quotes.length).toBeGreaterThanOrEqual(5);
    for (const quote of quotes) {
      const text = normalize(quote);
      expect(text.length, `引文太短，无法核对：${quote}`).toBeGreaterThanOrEqual(4);
      expect(sources, `引文未在 sources.md 登记：${quote}`).toContain(text);
    }
  });

  it('sources.md 标明卷名、段落与关键系年', () => {
    const sources = read('sources.md');
    expect(sources).toContain('周纪一');
    expect(sources).toContain('威烈王二十三年');
    expect(sources).toContain('前 453');
    expect(sources).toContain('前 403');
  });
});
