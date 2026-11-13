import React from 'react';
import {AbsoluteFill, Easing, interpolate, useCurrentFrame} from 'remotion';
import {PaperBackground} from '../components/PaperBackground';
import {Seal} from '../components/Seal';
import {SERIF_FONT} from '../fonts';
import type {TitleShot} from '../schema';
import {palette} from '../theme';

/** 片头：书名 + 集名 + 年份，宣纸底 + 朱红印章。 */
export const TitleCard: React.FC<{shot: TitleShot}> = ({shot}) => {
  const frame = useCurrentFrame();
  const enter = interpolate(frame, [0, 24], [0, 1], {
    easing: Easing.out(Easing.cubic),
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const lift = interpolate(frame, [0, 24], [22, 0], {
    easing: Easing.out(Easing.cubic),
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const rule = interpolate(frame, [16, 44], [0, 1], {
    easing: Easing.inOut(Easing.cubic),
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
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            transform: `translateY(${lift}px)`,
            opacity: enter,
          }}
        >
          <div
            style={{
              fontSize: 28,
              letterSpacing: 14,
              color: palette.ochre,
              marginBottom: 32,
            }}
          >
            资治通鉴 · 动画讲解
          </div>

          <div style={{display: 'flex', alignItems: 'center', gap: 48}}>
            <div
              style={{
                fontSize: 168,
                fontWeight: 700,
                letterSpacing: 16,
                lineHeight: 1.08,
                textShadow: '0 4px 0 rgba(138, 90, 43, 0.18)',
              }}
            >
              {shot.title}
            </div>
            <Seal />
          </div>

          <div
            style={{
              height: 6,
              width: 640,
              marginTop: 26,
              backgroundColor: palette.vermilion,
              transform: `scaleX(${rule})`,
              transformOrigin: 'left center',
              opacity: 0.85,
            }}
          />

          {shot.subtitle ? (
            <div
              style={{
                marginTop: 32,
                fontSize: 42,
                letterSpacing: 8,
                opacity: 0.82,
              }}
            >
              {shot.subtitle}
            </div>
          ) : null}

          {shot.yearLabel ? (
            <div
              style={{
                marginTop: 18,
                fontSize: 30,
                letterSpacing: 6,
                color: palette.ochre,
              }}
            >
              {shot.yearLabel}
            </div>
          ) : null}
        </div>
      </AbsoluteFill>
    </PaperBackground>
  );
};
