import {describe, expect, it} from 'vitest';
import {storyboardSchema} from './schema';

const board = (shots: unknown[]) => ({
  episodeId: '01-sanjia-fenjin',
  title: '三家分晋',
  shots,
});

const base = (id: string) => ({
  id,
  narration: `${id} 的旁白`,
});

/** 覆盖全部 7 种镜头类型的最小合法分镜。 */
const validShots = [
  {
    ...base('s01-open'),
    type: 'title',
    title: '三家分晋',
    subtitle: '第一集',
    yearLabel: '公元前 403 年',
    transition: {type: 'none', durationInFrames: 0},
  },
  {
    ...base('s02-quote'),
    type: 'quote',
    text: '智伯之亡也，才胜德也。',
    source: '《资治通鉴》卷第一·周纪一',
    attribution: '司马光',
  },
  {
    ...base('s03-map'),
    type: 'map',
    focus: ['zhi', 'zhao'],
    arrows: [{from: 'zhi', to: 'zhao', label: '攻赵'}],
    conquests: [{territory: 'zhi', by: 'zhao'}],
  },
  {
    ...base('s04-dialogue'),
    type: 'dialogue',
    speakers: ['zhi-yao', 'chi-ci'],
    lines: [{speaker: 'chi-ci', text: '韩、魏必反。', gesture: 'raise'}],
  },
  {
    ...base('s05-relation'),
    type: 'relation',
    nodes: [{id: 'zhi'}, {id: 'han'}, {id: 'zhao'}, {id: 'wei'}],
    edges: [
      {from: 'zhi', to: 'han', relation: 'enemy'},
      {from: 'han', to: 'zhao', relation: 'ally', changeAt: 0.5, changeTo: 'enemy'},
    ],
  },
  {
    ...base('s06-timeline'),
    type: 'timeline',
    events: [
      {year: -453, label: '三家灭智'},
      {year: -403, label: '三家封侯'},
    ],
  },
  {
    ...base('s07-narration'),
    type: 'narration',
    heading: '才德之辨',
    keywords: ['才', '德'],
  },
];

const expectIssue = (shots: unknown[], message: string) => {
  const result = storyboardSchema.safeParse(board(shots));
  expect(result.success).toBe(false);
  if (!result.success) {
    expect(
      result.error.issues.some((issue) => issue.message.includes(message)),
      `期望出现包含「${message}」的错误，实际为：${result.error.issues
        .map((issue) => issue.message)
        .join(' / ')}`,
    ).toBe(true);
  }
};

describe('分镜 schema', () => {
  it('接受全部 7 种镜头并应用默认值', () => {
    const result = storyboardSchema.safeParse(board(validShots));
    expect(result.success).toBe(true);
    if (!result.success) {
      return;
    }
    expect(result.data.shots).toHaveLength(7);

    const [title, quote, map, dialogue, relation, timeline, narration] =
      result.data.shots;

    expect(title.type).toBe('title');
    expect(title.transition.type).toBe('none');

    expect(quote.type).toBe('quote');
    if (quote.type === 'quote') {
      expect(quote.layout).toBe('vertical');
      expect(quote.seal).toBe(true);
      expect(quote.transition).toEqual({type: 'fade', durationInFrames: 12});
    }

    expect(map.type).toBe('map');
    if (map.type === 'map') {
      expect(map.flood).toEqual({active: false, level: 0});
      expect(map.arrows[0].kind).toBe('march');
    }

    expect(dialogue.type).toBe('dialogue');
    if (dialogue.type === 'dialogue') {
      expect(dialogue.bubbles).toBe(true);
      expect(dialogue.lines[0].gesture).toBe('raise');
    }

    expect(relation.type).toBe('relation');
    expect(timeline.type).toBe('timeline');
    expect(narration.type).toBe('narration');
    if (narration.type === 'narration') {
      expect(narration.background).toBe('ink');
    }
  });

  it('只有旁白的镜头也能通过', () => {
    const result = storyboardSchema.safeParse(
      board([{id: 's01-plain', type: 'narration', narration: '只有旁白。'}]),
    );
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.shots[0].transition).toEqual({
        type: 'fade',
        durationInFrames: 12,
      });
    }
  });

  it('拒绝未知的镜头类型和缺失的旁白', () => {
    const unknown = storyboardSchema.safeParse(
      board([{...base('s01-bad'), type: 'slideshow'}]),
    );
    expect(unknown.success).toBe(false);

    const noNarration = storyboardSchema.safeParse(
      board([{id: 's01-no-narration', type: 'title', title: '三家分晋'}]),
    );
    expect(noNarration.success).toBe(false);
  });

  it('拒绝不合法的镜头 id 与重复 id', () => {
    expectIssue(
      [{...base('S01-Upper'), type: 'narration'}],
      '小写字母、数字和连字符',
    );

    expectIssue(
      [
        {...base('s01-dup'), type: 'narration'},
        {...base('s01-dup'), type: 'narration'},
      ],
      '镜头 id 重复',
    );
  });

  it('拒绝说话人不在 speakers 里的台词', () => {
    expectIssue(
      [
        {
          ...base('s01-dialogue'),
          type: 'dialogue',
          speakers: ['zhi-yao'],
          lines: [{speaker: 'chi-ci', text: '韩、魏必反。'}],
        },
      ],
      '不在 speakers 列表里',
    );
  });

  it('校验关系图节点与连线', () => {
    expectIssue(
      [
        {
          ...base('s01-relation'),
          type: 'relation',
          nodes: [{id: 'zhi'}, {id: 'han'}],
          edges: [{from: 'zhi', to: 'zhao', relation: 'enemy'}],
        },
      ],
      '不存在的节点',
    );

    expectIssue(
      [
        {
          ...base('s01-relation'),
          type: 'relation',
          nodes: [{id: 'zhi'}, {id: 'han'}],
          edges: [{from: 'zhi', to: 'han', changeTo: 'ally'}],
        },
      ],
      '必须同时给出 changeAt',
    );
  });

  it('时间轴必须按年份升序且 activeIndex 在范围内', () => {
    expectIssue(
      [
        {
          ...base('s01-timeline'),
          type: 'timeline',
          events: [
            {year: -403, label: '三家封侯'},
            {year: -453, label: '三家灭智'},
          ],
        },
      ],
      '从早到晚',
    );

    expectIssue(
      [
        {
          ...base('s01-timeline'),
          type: 'timeline',
          events: [
            {year: -453, label: '三家灭智'},
            {year: -403, label: '三家封侯'},
          ],
          activeIndex: 5,
        },
      ],
      'activeIndex',
    );
  });

  it('拒绝原地打转的行军箭头和自己吞并自己', () => {
    expectIssue(
      [
        {
          ...base('s01-map'),
          type: 'map',
          arrows: [{from: 'zhi', to: 'zhi'}],
        },
      ],
      '原地打转',
    );
    expectIssue(
      [
        {
          ...base('s01-map'),
          type: 'map',
          conquests: [{territory: 'zhi', by: 'zhi'}],
        },
      ],
      '自己吞并',
    );
  });

  it('拒绝未知字段和越界的转场/预估时长', () => {
    expectIssue(
      [{...base('s01-extra'), type: 'narration', soundtrack: 'music.mp3'}],
      'Unrecognized key',
    );
    expectIssue(
      [
        {
          ...base('s01-transition'),
          type: 'narration',
          transition: {type: 'fade', durationInFrames: 61},
        },
      ],
      'Too big',
    );
    expectIssue(
      [
        {
          ...base('s01-duration'),
          type: 'narration',
          estimatedDurationInFrames: 10,
        },
      ],
      'Too small',
    );
  });
});
