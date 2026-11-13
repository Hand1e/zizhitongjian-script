import React from 'react';
import {AbsoluteFill, Sequence} from 'remotion';
import storyboardJson from '../../episodes/01-sanjia-fenjin/storyboard.json';
import {storyboardSchema, type RelationShot} from '../schema';
import {RelationScene} from '../templates/RelationScene';

const board = storyboardSchema.parse(storyboardJson);

const shot = board.shots.find((item) => item.id === 's22b-alliance');
if (!shot || shot.type !== 'relation') {
  throw new Error('关系图预览缺少 s22b-alliance');
}
const relationShot = shot as RelationShot;

/** 阶段 9 关系图预览：韩魏由盟转敌。 */
export const RelationPreview: React.FC = () => {
  return (
    <AbsoluteFill>
      <Sequence durationInFrames={240}>
        <RelationScene shot={relationShot} durationInFrames={240} />
      </Sequence>
    </AbsoluteFill>
  );
};
