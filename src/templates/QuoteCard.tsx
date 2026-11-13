import React from 'react';
import {
  AbsoluteFill,
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import {PaperBackground} from '../components/PaperBackground';
import {Seal} from '../components/Seal';
import {SERIF_FONT} from '../fonts';
import type {QuoteShot} from '../schema';
import {palette} from '../theme';

/** 竖排古文金句 + 朱红印章。 */
export const QuoteCard: React.FC<{shot: QuoteShot}> = ({shot}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const enter = interpolate(frame, [0, 28], [0, 1], {
    easing: Easing.out(Easing.cubic),
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const reveal = interpolate(frame, [4, 40], [0, 1], {
    easing: Easing.inOut(Easing.cubic),
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const sealIn = spring({
    frame: frame - 24,
    fps,
    config: {damping: 200, mass: 0.6},
  });

  const isVertical = shot.layout === 'vertical';

  return (
    <PaperBackground>
      <AbsoluteFill
        style={{
          fontFamily: SERIF_FONT,
          color: palette.ink,
          padding: '96px 140px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            position: 'absolute',
            left: 140,
            top: 96,
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
            opacity: enter,
          }}
        >
          <div
            style={{
              fontSize: 24,
              letterSpacing: 8,
              color: palette.ochre,
            }}
          >
            {shot.attribution ? `— ${shot.attribution}` : '古文金句'}
          </div>
          <div
            style={{
              fontSize: 22,
              letterSpacing: 2,
              color: palette.ochre,
              opacity: 0.75,
            }}
          >
            {shot.source}
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 70,
            opacity: enter,
          }}
        >
          <div
            style={{
              position: 'relative',
              maxWidth: isVertical ? 1050 : 1400,
              padding: isVertical ? '10px 30px' : '20px 40px',
              clipPath: isVertical
                ? `inset(0 0 ${(1 - reveal) * 100}% 0)`
                : `inset(0 ${(1 - reveal) * 100}% 0 0)`,
            }}
          >
            <div
              style={
                isVertical
                  ? {
                      writingMode: 'vertical-rl',
                      height: 700,
                      fontSize: 68,
                      lineHeight: 1.65,
                      letterSpacing: 10,
                      fontWeight: 600,
                      textShadow: '0 2px 0 rgba(138, 90, 43, 0.12)',
                    }
                  : {
                      fontSize: 64,
                      lineHeight: 1.7,
                      letterSpacing: 6,
                      fontWeight: 600,
                      textAlign: 'center',
                    }
              }
            >
              {shot.text}
            </div>
          </div>

          {shot.seal ? (
            <div style={{transform: `scale(${sealIn})`, transformOrigin: 'center'}}>
              <Seal size={116} rotate={-5} />
            </div>
          ) : null}
        </div>
      </AbsoluteFill>
    </PaperBackground>
  );
};
