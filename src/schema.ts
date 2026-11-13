import {z} from 'zod';
import {CHARACTER_IDS, CHARACTER_NAMES, type CharacterId} from './characters/cast';

/**
 * 分镜 schema（第一集及后续各集共用）。
 *
 * 时间约定：
 * - `estimatedDurationInFrames` 只是写分镜时的预估，供 studio 预览；
 * - 成片时长以阶段 5 由配音生成的时间轴 `timeline.json` 为准；
 * - `transition` 表示「进入本镜头」的转场，第一个镜头通常写 `none`。
 */

export const TRANSITION_TYPES = ['none', 'fade', 'scroll'] as const;
export type TransitionType = (typeof TRANSITION_TYPES)[number];

export const transitionSchema = z
  .object({
    type: z.enum(TRANSITION_TYPES).default('fade'),
    durationInFrames: z.number().int().min(0).max(60).default(12),
  })
  .strict();

export const TERRITORY_IDS = ['zhi', 'han', 'zhao', 'wei'] as const;
export type TerritoryId = (typeof TERRITORY_IDS)[number];

export const TERRITORY_NAMES: Record<TerritoryId, string> = {
  zhi: '智氏',
  han: '韩氏',
  zhao: '赵氏',
  wei: '魏氏',
};

export const characterIdSchema = z.enum(CHARACTER_IDS);
export const territorySchema = z.enum(TERRITORY_IDS);

export const GESTURES = ['stand', 'raise', 'nod', 'walk'] as const;
export type Gesture = (typeof GESTURES)[number];

const shotBase = {
  /** 镜头 id：小写字母/数字/连字符，如 s07-jinyang */
  id: z
    .string()
    .trim()
    .min(2)
    .max(60)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, '镜头 id 只能用小写字母、数字和连字符'),
  /** 这一段镜头的旁白；一个镜头只对应一段旁白 */
  narration: z.string().trim().min(1).max(500),
  /** 仅用于分镜预览的预估时长；真实时长由配音决定 */
  estimatedDurationInFrames: z.number().int().min(30).max(1800).optional(),
  transition: transitionSchema.default({type: 'fade', durationInFrames: 12}),
};

/* ------------------------------------------------------------------ */
/* 1. 片头 / 标题                                                      */
/* ------------------------------------------------------------------ */

export const titleShotSchema = z
  .object({
    ...shotBase,
    type: z.literal('title'),
    title: z.string().trim().min(1).max(30),
    subtitle: z.string().trim().max(60).optional(),
    /** 如「公元前 403 年」 */
    yearLabel: z.string().trim().max(20).optional(),
  })
  .strict();

/* ------------------------------------------------------------------ */
/* 2. 古文金句                                                        */
/* ------------------------------------------------------------------ */

export const quoteShotSchema = z
  .object({
    ...shotBase,
    type: z.literal('quote'),
    /** 古文原文，必须与 sources.md 逐字一致 */
    text: z.string().trim().min(1).max(160),
    /** 出处，如「《资治通鉴》卷第一·周纪一」 */
    source: z.string().trim().min(1).max(80),
    /** 引用者，如「司马光」 */
    attribution: z.string().trim().max(30).optional(),
    layout: z.enum(['vertical', 'horizontal']).default('vertical'),
    seal: z.boolean().default(true),
  })
  .strict();

/* ------------------------------------------------------------------ */
/* 3. 地图                                                            */
/* ------------------------------------------------------------------ */

const mapArrowSchema = z
  .object({
    from: territorySchema,
    to: territorySchema,
    label: z.string().trim().max(20).optional(),
    kind: z.enum(['march', 'attack', 'retreat']).default('march'),
    /** 箭头推进进度 0–1，用于行军动画 */
    progress: z.number().min(0).max(1).default(1),
  })
  .strict();

const floodSchema = z
  .object({
    active: z.boolean().default(false),
    /** 水位 0–1，用于水淹晋阳的涨水动画 */
    level: z.number().min(0).max(1).default(0),
  })
  .strict();

const conquestSchema = z
  .object({
    territory: territorySchema,
    by: territorySchema,
    progress: z.number().min(0).max(1).default(1),
  })
  .strict();

export const mapShotSchema = z
  .object({
    ...shotBase,
    type: z.literal('map'),
    title: z.string().trim().max(40).optional(),
    /** 高亮的领地 */
    focus: z.array(territorySchema).max(4).default([]),
    arrows: z.array(mapArrowSchema).max(8).default([]),
    flood: floodSchema.default({active: false, level: 0}),
    /** 领地被吞并 / 易主的颜色变化 */
    conquests: z.array(conquestSchema).max(6).default([]),
  })
  .strict();

/* ------------------------------------------------------------------ */
/* 4. 对话                                                            */
/* ------------------------------------------------------------------ */

const dialogueLineSchema = z
  .object({
    speaker: characterIdSchema,
    text: z.string().trim().min(1).max(120),
    gesture: z.enum(GESTURES).default('stand'),
    /** 在本镜头内的相对开始时间 0–1 */
    startProgress: z.number().min(0).max(1).optional(),
  })
  .strict();

export const dialogueShotSchema = z
  .object({
    ...shotBase,
    type: z.literal('dialogue'),
    speakers: z.array(characterIdSchema).min(1).max(3),
    lines: z.array(dialogueLineSchema).min(1).max(6),
    /** 台词气泡是否显示；默认 true */
    bubbles: z.boolean().default(true),
  })
  .strict();

/* ------------------------------------------------------------------ */
/* 5. 关系图                                                          */
/* ------------------------------------------------------------------ */

const relationNodeSchema = z
  .object({
    id: territorySchema,
    label: z.string().trim().max(20).optional(),
    emphasis: z.boolean().default(false),
  })
  .strict();

const relationEdgeSchema = z
  .object({
    from: territorySchema,
    to: territorySchema,
    relation: z.enum(['ally', 'enemy', 'neutral']).default('neutral'),
    /** 关系变化发生的相对时间 0–1；省略则整段保持 relation */
    changeAt: z.number().min(0).max(1).optional(),
    /** 变化后的关系，用于「韩魏倒戈」 */
    changeTo: z.enum(['ally', 'enemy', 'neutral']).optional(),
  })
  .strict();

export const relationShotSchema = z
  .object({
    ...shotBase,
    type: z.literal('relation'),
    nodes: z.array(relationNodeSchema).min(2).max(4),
    edges: z.array(relationEdgeSchema).max(8).default([]),
  })
  .strict();

/* ------------------------------------------------------------------ */
/* 6. 时间轴                                                          */
/* ------------------------------------------------------------------ */

const timelineEventSchema = z
  .object({
    /** 负数表示公元前，如 -453、-403 */
    year: z.number().int().min(-3000).max(3000),
    label: z.string().trim().min(1).max(30),
    detail: z.string().trim().max(60).optional(),
    emphasis: z.boolean().default(false),
  })
  .strict();

export const timelineShotSchema = z
  .object({
    ...shotBase,
    type: z.literal('timeline'),
    events: z.array(timelineEventSchema).min(2).max(8),
    /** 当前高亮的事件下标 */
    activeIndex: z.number().int().min(0).max(7).optional(),
  })
  .strict();

/* ------------------------------------------------------------------ */
/* 7. 纯旁白                                                          */
/* ------------------------------------------------------------------ */

export const narrationShotSchema = z
  .object({
    ...shotBase,
    type: z.literal('narration'),
    heading: z.string().trim().max(40).optional(),
    keywords: z.array(z.string().trim().min(1).max(12)).max(6).default([]),
    background: z.enum(['ink', 'paper']).default('ink'),
  })
  .strict();

/* ------------------------------------------------------------------ */
/* 联合类型与整份分镜                                                 */
/* ------------------------------------------------------------------ */

export const shotSchema = z.discriminatedUnion('type', [
  titleShotSchema,
  quoteShotSchema,
  mapShotSchema,
  dialogueShotSchema,
  relationShotSchema,
  timelineShotSchema,
  narrationShotSchema,
]);

export type Shot = z.infer<typeof shotSchema>;
export type ShotType = Shot['type'];
export type TitleShot = z.infer<typeof titleShotSchema>;
export type QuoteShot = z.infer<typeof quoteShotSchema>;
export type MapShot = z.infer<typeof mapShotSchema>;
export type DialogueShot = z.infer<typeof dialogueShotSchema>;
export type RelationShot = z.infer<typeof relationShotSchema>;
export type TimelineShot = z.infer<typeof timelineShotSchema>;
export type NarrationShot = z.infer<typeof narrationShotSchema>;

export const storyboardSchema = z
  .object({
    /** 与 episodes/ 下的目录名一致，如 01-sanjia-fenjin */
    episodeId: z
      .string()
      .regex(/^\d{2}-[a-z0-9]+(?:-[a-z0-9]+)*$/, 'episodeId 形如 01-sanjia-fenjin'),
    title: z.string().trim().min(1).max(40),
    shots: z.array(shotSchema).min(1).max(60),
  })
  .strict()
  .superRefine((board, ctx) => {
    const seenIds = new Set<string>();

    board.shots.forEach((shot, index) => {
      if (seenIds.has(shot.id)) {
        ctx.addIssue({
          code: 'custom',
          message: `镜头 id 重复：${shot.id}`,
          path: ['shots', index, 'id'],
        });
      }
      seenIds.add(shot.id);

      if (shot.type === 'dialogue') {
        const speakers = new Set<CharacterId>(shot.speakers);
        shot.lines.forEach((line, lineIndex) => {
          if (!speakers.has(line.speaker)) {
            ctx.addIssue({
              code: 'custom',
              message: `台词说话人 ${CHARACTER_NAMES[line.speaker]} 不在 speakers 列表里`,
              path: ['shots', index, 'lines', lineIndex, 'speaker'],
            });
          }
        });
      }

      if (shot.type === 'relation') {
        const nodeIds = new Set<string>();
        shot.nodes.forEach((node, nodeIndex) => {
          if (nodeIds.has(node.id)) {
            ctx.addIssue({
              code: 'custom',
              message: `关系图节点重复：${node.id}`,
              path: ['shots', index, 'nodes', nodeIndex, 'id'],
            });
          }
          nodeIds.add(node.id);
        });

        shot.edges.forEach((edge, edgeIndex) => {
          for (const end of ['from', 'to'] as const) {
            if (!nodeIds.has(edge[end])) {
              ctx.addIssue({
                code: 'custom',
                message: `关系图连线引用了不存在的节点：${edge[end]}`,
                path: ['shots', index, 'edges', edgeIndex, end],
              });
            }
          }
          if (edge.from === edge.to) {
            ctx.addIssue({
              code: 'custom',
              message: '关系图连线不能自己指向自己',
              path: ['shots', index, 'edges', edgeIndex],
            });
          }
          if (edge.changeTo !== undefined && edge.changeAt === undefined) {
            ctx.addIssue({
              code: 'custom',
              message: '设置 changeTo 时必须同时给出 changeAt',
              path: ['shots', index, 'edges', edgeIndex, 'changeAt'],
            });
          }
        });
      }

      if (shot.type === 'timeline') {
        shot.events.forEach((event, eventIndex) => {
          if (eventIndex > 0 && event.year <= shot.events[eventIndex - 1].year) {
            ctx.addIssue({
              code: 'custom',
              message: '时间轴事件必须按年份从早到晚排列',
              path: ['shots', index, 'events', eventIndex, 'year'],
            });
          }
        });
        if (shot.activeIndex !== undefined && shot.activeIndex >= shot.events.length) {
          ctx.addIssue({
            code: 'custom',
            message: 'activeIndex 超出 events 范围',
            path: ['shots', index, 'activeIndex'],
          });
        }
      }

      if (shot.type === 'map') {
        shot.arrows.forEach((arrow, arrowIndex) => {
          if (arrow.from === arrow.to) {
            ctx.addIssue({
              code: 'custom',
              message: '行军箭头不能原地打转',
              path: ['shots', index, 'arrows', arrowIndex],
            });
          }
        });
        shot.conquests.forEach((conquest, conquestIndex) => {
          if (conquest.territory === conquest.by) {
            ctx.addIssue({
              code: 'custom',
              message: '领地不能被自己吞并',
              path: ['shots', index, 'conquests', conquestIndex],
            });
          }
        });
      }
    });
  });

export type Storyboard = z.infer<typeof storyboardSchema>;
