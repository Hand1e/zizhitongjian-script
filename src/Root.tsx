import React from 'react';
import {Composition} from 'remotion';
import {ScaffoldPreview} from './scenes/ScaffoldPreview';
import {VIDEO, secondsToFrames} from './video';

/**
 * 全片 Composition 注册表。
 * 目前只有一个脚手架预览；阶段 6 起会加入真正的镜头模板与主 Composition。
 */
export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="ScaffoldPreview"
      component={ScaffoldPreview}
      durationInFrames={secondsToFrames(5)}
      fps={VIDEO.fps}
      width={VIDEO.width}
      height={VIDEO.height}
    />
  );
};
