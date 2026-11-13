import React from 'react';
import {Composition} from 'remotion';
import {CharacterPreview} from './scenes/CharacterPreview';
import {DialoguePreview} from './scenes/DialoguePreview';
import {MapPreview} from './scenes/MapPreview';
import {RelationPreview} from './scenes/RelationPreview';
import {ScaffoldPreview} from './scenes/ScaffoldPreview';
import {TemplatePreview} from './scenes/TemplatePreview';
import {VIDEO, secondsToFrames} from './video';

/**
 * 全片 Composition 注册表。
 * Episode01（主 Composition）在阶段 10 加入。
 */
export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="ScaffoldPreview"
        component={ScaffoldPreview}
        durationInFrames={secondsToFrames(5)}
        fps={VIDEO.fps}
        width={VIDEO.width}
        height={VIDEO.height}
      />
      <Composition
        id="TemplatePreview"
        component={TemplatePreview}
        durationInFrames={secondsToFrames(20)}
        fps={VIDEO.fps}
        width={VIDEO.width}
        height={VIDEO.height}
      />
      <Composition
        id="MapPreview"
        component={MapPreview}
        durationInFrames={secondsToFrames(10)}
        fps={VIDEO.fps}
        width={VIDEO.width}
        height={VIDEO.height}
      />
      <Composition
        id="CharacterPreview"
        component={CharacterPreview}
        durationInFrames={secondsToFrames(6)}
        fps={VIDEO.fps}
        width={VIDEO.width}
        height={VIDEO.height}
      />
      <Composition
        id="DialoguePreview"
        component={DialoguePreview}
        durationInFrames={secondsToFrames(14)}
        fps={VIDEO.fps}
        width={VIDEO.width}
        height={VIDEO.height}
      />
      <Composition
        id="RelationPreview"
        component={RelationPreview}
        durationInFrames={secondsToFrames(8)}
        fps={VIDEO.fps}
        width={VIDEO.width}
        height={VIDEO.height}
      />
    </>
  );
};
