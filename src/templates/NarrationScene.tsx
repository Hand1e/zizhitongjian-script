import React from 'react';
import {AbsoluteFill, Easing, interpolate, useCurrentFrame} from 'remotion';
import {PaperBackground} from '../components/PaperBackground';
import {SERIF_FONT} from '../fonts';
import type {NarrationShot} from '../schema';
import {palette} from '../theme';

/** 纯旁白镜头：水墨晕染背景缓动 + 关键词。 */
export const NarrationScene: React.FC<{shot: NarrationShot}> = ({shot}) => {
  const frame = useCurrentFrame();
  const dark = shot.background === 'ink';

  const enter = interpolate(frame, [0, 30], [0, 1], {
    easing: Easing.out(Easing.cubic),
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const drift = interpolate(frame, [0, 300], [0, 1], {
    easing: Easing.inOut(Easing.cubic),
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <PaperBackground>
      <AbsoluteFill style={{overflow: 'hidden'}}>
        <svg
          width="1920"
          height="1080"
          viewBox="0 0 1920 1080"
          style={{position: 'absolute', inset: 0, opacity: dark ? 0.9 : 0.55}}
        >
          <defs>
            <filter id="ink-blur" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="55" />
            </filter>
          </defs>
          <g filter="url(#ink-blur)" transform={`translate(${drift * -30} ${drift * 18})`}>
            <ellipse
              cx={470}
              cy={300}
              rx={360}
              ry={220}
              fill={palette.azurite}
              opacity={0.1}
            />
            <ellipse
              cx={1450}
              cy={760}
              rx={430}
              ry={260}
              fill={palette.ink}
              opacity={0.07}
            />
            <ellipse
              cx={1120}
              cy={240}
              rx={260}
              ry={150}
              fill={palette.ochre}
              opacity={0.06}
            />
          </g>
          <g transform={`translate(${drift * 24} ${drift * -14})`}>
            <path
              d="M 220 880 Q 520 760 760 860 T 1260 840 T 1720 900"
              fill="none"
              stroke={palette.ink}
              strokeWidth={5}
              opacity={0.06}
            />
            <path
              d="M 120 760 Q 430 690 690 760 T 1200 730 T 1700 790"
              fill="none"
              stroke={palette.azurite}
              strokeWidth={3}
              opacity={0.08}
            />
          </g>
        </svg>

        <AbsoluteFill
          style={{
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: SERIF_FONT,
            color: palette.ink,
            padding: 120,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 28,
              opacity: enter,
              transform: `translateY(${(1 - enter) * 18}px)`,
            }}
          >
            <div
              style={{
                width: 18,
                height: 88,
                backgroundColor: palette.vermilion,
                opacity: 0.85,
              }}
            />
            <div
              style={{
                fontSize: 92,
                fontWeight: 700,
                letterSpacing: 10,
                lineHeight: 1.2,
              }}
            >
              {shot.heading ?? ''}
            </div>
          </div>

          {shot.keywords.length > 0 ? (
            <div
              style={{
                marginTop: 44,
                display: 'flex',
                alignItems: 'center',
                gap: 22,
                fontSize: 32,
                letterSpacing: 6,
                color: palette.ochre,
                opacity: enter * 0.9,
              }}
            >
              {shot.keywords.map((keyword, index) => (
                <React.Fragment key={keyword}>
                  {index > 0 ? <span style={{opacity: 0.5}}>·</span> : null}
                  <span>{keyword}</span>
                </React.Fragment>
              ))}
            </div>
          ) : null}
        </AbsoluteFill>
      </AbsoluteFill>
    </PaperBackground>
  );
};
