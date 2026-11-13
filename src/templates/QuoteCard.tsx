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

const VERTICAL_PUNCTUATION: Record<string, string> = {
  '，': '︐',
  '。': '︒',
  '；': '︔',
  '：': '︓',
  '？': '︖',
  '！': '︕',
  '、': '︑',
};

/** 把引文按标点切成语义块，再按每列最多 9 字排成竖列。 */
const splitColumns = (text: string, maxChars = 9): string[] => {
  const segments = text.match(/[^，。；：？！、]+[，。；：？！、]?/g) ?? [text];
  const columns: string[] = [];
  let current = '';

  const push = () => {
    if (current) {
      columns.push(current);
      current = '';
    }
  };

  for (const segment of segments) {
    if ([...segment].length > maxChars) {
      push();
      const chars = [...segment];
      for (let index = 0; index < chars.length; index += maxChars) {
        columns.push(chars.slice(index, index + maxChars).join(''));
      }
      continue;
    }
    if ([...current, ...segment].length > maxChars) {
      push();
    }
    current += segment;
  }
  push();
  return columns.filter(Boolean);
};

const verticalize = (text: string): string =>
  [...text].map((char) => VERTICAL_PUNCTUATION[char] ?? char).join('');

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
  const columns = isVertical ? splitColumns(shot.text) : [];

  return (
    <PaperBackground>
      <AbsoluteFill
        style={{
          fontFamily: SERIF_FONT,
          color: palette.ink,
          padding: '96px 140px',
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
          <div style={{fontSize: 24, letterSpacing: 8, color: palette.ochre}}>
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

        <AbsoluteFill
          style={{
            alignItems: 'center',
            justifyContent: 'center',
            paddingTop: 20,
            opacity: enter,
          }}
        >
          {isVertical ? (
            <div
              style={{
                display: 'flex',
                flexDirection: 'row-reverse',
                alignItems: 'flex-start',
                gap: 22,
                clipPath: `inset(0 0 ${(1 - reveal) * 100}% 0)`,
              }}
            >
              {columns.map((column, index) => (
                <div
                  key={`${column}-${index}`}
                  style={{
                    writingMode: 'vertical-rl',
                    fontSize: 74,
                    lineHeight: 1.5,
                    letterSpacing: 9,
                    fontWeight: 600,
                    whiteSpace: 'nowrap',
                    textShadow: '0 2px 0 rgba(138, 90, 43, 0.12)',
                  }}
                >
                  {verticalize(column)}
                </div>
              ))}
            </div>
          ) : (
            <div
              style={{
                maxWidth: 1400,
                fontSize: 64,
                lineHeight: 1.7,
                letterSpacing: 6,
                fontWeight: 600,
                textAlign: 'center',
                clipPath: `inset(0 ${(1 - reveal) * 100}% 0 0)`,
              }}
            >
              {shot.text}
            </div>
          )}
        </AbsoluteFill>

        {shot.seal ? (
          <div
            style={{
              position: 'absolute',
              right: 210,
              top: '50%',
              marginTop: -58,
              transform: `scale(${sealIn})`,
            }}
          >
            <Seal size={116} rotate={-5} />
          </div>
        ) : null}
      </AbsoluteFill>
    </PaperBackground>
  );
};
