import React from 'react';
import {AbsoluteFill} from 'remotion';
import {palette} from '../theme';

/**
 * 宣纸质感背景：纯 CSS 叠色 + 纤维纹理，不依赖任何图片素材。
 * 所有镜头都应该垫这一层，保证全片底色统一。
 */
export const PaperBackground: React.FC<{children?: React.ReactNode}> = ({
  children,
}) => {
  return (
    <AbsoluteFill
      style={{
        backgroundColor: palette.paper,
        backgroundImage: [
          // 纸面受光不均
          'radial-gradient(ellipse at 30% 20%, rgba(255,255,255,0.35), transparent 55%)',
          'radial-gradient(ellipse at 80% 85%, rgba(138,90,43,0.10), transparent 60%)',
          // 纸张纤维（极淡的斜向细线）
          'repeating-linear-gradient(92deg, rgba(33,28,23,0.035) 0 1px, transparent 1px 7px)',
          'repeating-linear-gradient(3deg, rgba(33,28,23,0.02) 0 1px, transparent 1px 11px)',
        ].join(','),
      }}
    >
      {/* 四周暗角，模拟旧纸边缘 */}
      <AbsoluteFill
        style={{
          boxShadow: 'inset 0 0 180px rgba(90, 62, 30, 0.28)',
          pointerEvents: 'none',
        }}
      />
      {children}
    </AbsoluteFill>
  );
};
