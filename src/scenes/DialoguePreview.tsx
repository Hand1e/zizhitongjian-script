import React from 'react';
import {AbsoluteFill, Sequence} from 'remotion';
import storyboardJson from '../../episodes/01-sanjia-fenjin/storyboard.json';
import {storyboardSchema, type DialogueShot} from '../schema';
import {DialogueScene} from '../templates/DialogueScene';

const board = storyboardSchema.parse(storyboardJson);

const dialogueShot = (id: string): DialogueShot => {
  const shot = board.shots.find((item) => item.id === id);
  if (!shot || shot.type !== 'dialogue') {
    throw new Error(`对话预览缺少镜头 ${id}`);
  }
  return shot;
};

const chici = dialogueShot('s19-chici');
const zhang = dialogueShot('s21-zhang');

/** 阶段 8 对话预览：絺疵谏智伯、张孟谈说韩魏。 */
export const DialoguePreview: React.FC = () => {
  return (
    <AbsoluteFill>
      <Sequence durationInFrames={200}>
        <DialogueScene shot={chici} durationInFrames={200} />
      </Sequence>
      <Sequence from={200} durationInFrames={220}>
        <DialogueScene shot={zhang} durationInFrames={220} />
      </Sequence>
    </AbsoluteFill>
  );
};
