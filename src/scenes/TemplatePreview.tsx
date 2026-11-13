import React from 'react';
import {AbsoluteFill, Sequence} from 'remotion';
import storyboardJson from '../../episodes/01-sanjia-fenjin/storyboard.json';
import {
  storyboardSchema,
  type NarrationShot,
  type QuoteShot,
  type TimelineShot,
  type TitleShot,
} from '../schema';
import {NarrationScene} from '../templates/NarrationScene';
import {QuoteCard} from '../templates/QuoteCard';
import {TimelineScene} from '../templates/TimelineScene';
import {TitleCard} from '../templates/TitleCard';

const board = storyboardSchema.parse(storyboardJson);

const byType = <T extends {type: string}>(type: string): T => {
  const shot = board.shots.find((item) => item.type === type);
  if (!shot) {
    throw new Error(`预览缺少 ${type} 镜头`);
  }
  return shot as unknown as T;
};

const title = byType<TitleShot>('title');
const quote = byType<QuoteShot>('quote');
const timeline = byType<TimelineShot>('timeline');
const narration = byType<NarrationShot>('narration');

/** 阶段 6 的模板预览：4 段 × 5 秒，用 still 分别抽查每一帧。 */
export const TemplatePreview: React.FC = () => {
  return (
    <AbsoluteFill>
      <Sequence durationInFrames={150}>
        <TitleCard shot={title} />
      </Sequence>
      <Sequence from={150} durationInFrames={150}>
        <QuoteCard shot={quote} />
      </Sequence>
      <Sequence from={300} durationInFrames={150}>
        <TimelineScene shot={timeline} />
      </Sequence>
      <Sequence from={450} durationInFrames={150}>
        <NarrationScene shot={narration} />
      </Sequence>
    </AbsoluteFill>
  );
};
