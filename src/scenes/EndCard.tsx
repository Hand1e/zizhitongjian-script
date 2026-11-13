import React from 'react';
import {AbsoluteFill, Easing, interpolate, useCurrentFrame} from 'remotion';
import {PaperBackground} from '../components/PaperBackground';
import {Seal} from '../components/Seal';
import {SERIF_FONT} from '../fonts';
import {palette} from '../theme';

export const END_CARD_FRAMES = 150;

/** 片尾占位：下集预告 + 账号名。 */
export const EndCard: React.FC = () => {
  const frame = useCurrentFrame();
  const enter = interpolate(frame, [0, 26], [0, 1], {
    easing: Easing.out(Easing.cubic),
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const lift = interpolate(frame, [0, 26], [20, 0], {
    easing: Easing.out(Easing.cubic),
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <PaperBackground>
      <AbsoluteFill
        style={{
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: SERIF_FONT,
          color: palette.ink,
          opacity: enter,
          transform: `translateY(${lift}px)`,
        }}
      >
        <div style={{display: 'flex', alignItems: 'center', gap: 36}}>
          <div style={{fontSize: 90, fontWeight: 700, letterSpacing: 12}}>
            下集预告
          </div>
          <Seal text="战国" size={110} rotate={-6} />
        </div>
        <div
          style={{
            marginTop: 34,
            fontSize: 36,
            letterSpacing: 8,
            color: palette.ochre,
          }}
        >
          战国序幕 · 敬请期待
        </div>
        <div
          style={{
            marginTop: 120,
            fontSize: 26,
            letterSpacing: 6,
            opacity: 0.5,
          }}
        >
          本账号名称（占位）
        </div>
      </AbsoluteFill>
    </PaperBackground>
  );
};
