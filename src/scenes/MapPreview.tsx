import React from 'react';
import {AbsoluteFill, Sequence} from 'remotion';
import storyboardJson from '../../episodes/01-sanjia-fenjin/storyboard.json';
import {storyboardSchema, type MapShot} from '../schema';
import {MapScene} from '../templates/MapScene';

const board = storyboardSchema.parse(storyboardJson);

const mapShot = (id: string): MapShot => {
  const shot = board.shots.find((item) => item.id === id);
  if (!shot || shot.type !== 'map') {
    throw new Error(`地图预览缺少镜头 ${id}`);
  }
  return shot;
};

const attack = mapShot('s15-refuse');
const flood = mapShot('s17-flood');

/** 阶段 7 地图预览：行军箭头与水淹晋阳各 5 秒。 */
export const MapPreview: React.FC = () => {
  return (
    <AbsoluteFill>
      <Sequence durationInFrames={150}>
        <MapScene shot={attack} durationInFrames={150} />
      </Sequence>
      <Sequence from={150} durationInFrames={150}>
        <MapScene shot={flood} durationInFrames={150} />
      </Sequence>
    </AbsoluteFill>
  );
};
