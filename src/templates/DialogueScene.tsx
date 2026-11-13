import React from 'react';
import {AbsoluteFill, Easing, interpolate, useCurrentFrame} from 'remotion';
import {Puppet} from '../characters/Puppet';
import {CHARACTER_NAMES} from '../characters/cast';
import {PaperBackground} from '../components/PaperBackground';
import {SERIF_FONT} from '../fonts';
import type {DialogueShot} from '../schema';
import {palette} from '../theme';

type Props = {
  shot: DialogueShot;
  durationInFrames?: number;
};

const positions = (count: number): number[] => {
  if (count <= 1) return [960];
  if (count === 2) return [570, 1350];
  return [400, 960, 1520];
};

/** 两三人对话，说话人抬手/点头，台词以纸色气泡呈现。 */
export const DialogueScene: React.FC<Props> = ({shot, durationInFrames}) => {
  const frame = useCurrentFrame();
  const totalFrames = durationInFrames ?? 240;
  const progress = Math.min(1, Math.max(0, frame / Math.max(1, totalFrames)));

  const lineTimes = shot.lines.map((line, index) => ({
    line,
    at: line.startProgress ?? index / Math.max(1, shot.lines.length),
  }));
  let activeIndex = 0;
  for (let index = 0; index < lineTimes.length; index += 1) {
    if (progress >= lineTimes[index].at) {
      activeIndex = index;
    }
  }
  const activeLine = lineTimes[activeIndex].line;
  const activeSpeaker = shot.speakers.indexOf(activeLine.speaker);
  const coords = positions(shot.speakers.length);

  const enter = interpolate(frame, [0, 22], [0, 1], {
    easing: Easing.out(Easing.cubic),
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const bubbleX = coords[Math.max(0, activeSpeaker)] ?? 960;

  return (
    <PaperBackground>
      <AbsoluteFill style={{fontFamily: SERIF_FONT, color: palette.ink}}>
        <div
          style={{
            position: 'absolute',
            left: 120,
            top: 86,
            fontSize: 24,
            letterSpacing: 6,
            color: palette.ochre,
            opacity: 0.8 * enter,
          }}
        >
          晋阳 · 对话
        </div>

        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 110,
            height: 2,
            background: `linear-gradient(90deg, transparent, ${palette.ink}88, transparent)`,
            opacity: enter,
          }}
        />

        {shot.speakers.map((speaker, index) => {
          const isActive = index === activeSpeaker;
          return (
            <div
              key={speaker}
              style={{
                position: 'absolute',
                left: coords[index] ?? 960,
                bottom: 96,
                transform: `translateX(-50%) scale(${isActive ? 1.02 : 0.98})`,
                transformOrigin: 'bottom center',
                opacity: enter,
                filter: isActive ? 'none' : 'saturate(0.82)',
              }}
            >
              <Puppet
                id={speaker}
                gesture={isActive ? activeLine.gesture : 'stand'}
                speaking={isActive}
                width={330}
                flip={index % 2 === 1}
                delay={index * 4}
              />
              <div
                style={{
                  marginTop: -6,
                  textAlign: 'center',
                  fontSize: 28,
                  letterSpacing: 4,
                  color: isActive ? palette.vermilion : palette.ink,
                  opacity: isActive ? 1 : 0.65,
                }}
              >
                {CHARACTER_NAMES[speaker]}
              </div>
            </div>
          );
        })}

        {shot.bubbles ? (
          <div
            style={{
              position: 'absolute',
              left: bubbleX,
              top: 190,
              transform: 'translateX(-50%)',
              maxWidth: 580,
              minWidth: 220,
              padding: '20px 30px',
              backgroundColor: palette.paper,
              border: `3px solid ${palette.ink}`,
              borderRadius: 10,
              boxShadow: '0 10px 22px rgba(60, 40, 20, 0.18)',
              fontSize: 30,
              lineHeight: 1.55,
              textAlign: 'center',
              opacity: enter,
            }}
          >
            {activeLine.text}
            <div
              style={{
                position: 'absolute',
                left: '50%',
                bottom: -16,
                width: 22,
                height: 16,
                marginLeft: -11,
                backgroundColor: palette.paper,
                borderRight: `3px solid ${palette.ink}`,
                borderBottom: `3px solid ${palette.ink}`,
                transform: 'rotate(45deg)',
              }}
            />
          </div>
        ) : null}
      </AbsoluteFill>
    </PaperBackground>
  );
};
