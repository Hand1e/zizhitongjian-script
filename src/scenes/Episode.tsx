import React from 'react';
import storyboardJson from '../../episodes/01-sanjia-fenjin/storyboard.json';
import timelineJson from '../../episodes/01-sanjia-fenjin/timeline.json';
import {storyboardSchema, type Shot} from '../schema';
import {Audio, AbsoluteFill, Sequence, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {SANS_FONT, SERIF_FONT} from '../fonts';
import {palette} from '../theme';
import {DialogueScene} from '../templates/DialogueScene';
import {MapScene} from '../templates/MapScene';
import {NarrationScene} from '../templates/NarrationScene';
import {QuoteCard} from '../templates/QuoteCard';
import {RelationScene} from '../templates/RelationScene';
import {TimelineScene} from '../templates/TimelineScene';
import {TitleCard} from '../templates/TitleCard';
import {EndCard, END_CARD_FRAMES} from './EndCard';

const board = storyboardSchema.parse(storyboardJson);
const shotById = new Map(board.shots.map((shot) => [shot.id, shot]));

const ShotView: React.FC<{shot: Shot; durationInFrames: number}> = ({
  shot,
  durationInFrames,
}) => {
  switch (shot.type) {
    case 'title':
      return <TitleCard shot={shot} />;
    case 'quote':
      return <QuoteCard shot={shot} />;
    case 'map':
      return <MapScene shot={shot} durationInFrames={durationInFrames} />;
    case 'dialogue':
      return <DialogueScene shot={shot} durationInFrames={durationInFrames} />;
    case 'relation':
      return <RelationScene shot={shot} durationInFrames={durationInFrames} />;
    case 'timeline':
      return <TimelineScene shot={shot} />;
    case 'narration':
      return <NarrationScene shot={shot} />;
    default:
      return null;
  }
};

const ShotTransition: React.FC<{
  shot: Shot;
  durationInFrames: number;
  children: React.ReactNode;
}> = ({shot, durationInFrames, children}) => {
  const frame = useCurrentFrame();
  const transitionFrames = Math.max(1, shot.transition.durationInFrames);
  const fadeIn = interpolate(frame, [0, transitionFrames], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const fadeOutFrames = Math.min(10, Math.max(1, Math.floor(durationInFrames / 3)));
  const fadeOut = interpolate(
    frame,
    [durationInFrames - fadeOutFrames, durationInFrames],
    [1, 0],
    {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'},
  );

  if (shot.transition.type === 'none') {
    return <AbsoluteFill style={{opacity: fadeOut}}>{children}</AbsoluteFill>;
  }
  if (shot.transition.type === 'scroll') {
    return (
      <AbsoluteFill
        style={{
          opacity: fadeOut,
          clipPath: `inset(0 ${(1 - fadeIn) * 100}% 0 0)`,
          transform: `translateX(${(1 - fadeIn) * -26}px)`,
        }}
      >
        {children}
      </AbsoluteFill>
    );
  }
  return (
    <AbsoluteFill style={{opacity: Math.min(fadeIn, fadeOut)}}>
      {children}
    </AbsoluteFill>
  );
};

const Subtitles: React.FC = () => {
  const frame = useCurrentFrame();
  const active = timelineJson.shots.find(
    (shot) => frame >= shot.startFrame && frame < shot.endFrame,
  );
  if (!active) {
    return null;
  }
  const local = frame - active.startFrame;
  const subtitle = [...active.subtitles]
    .reverse()
    .find((item) => local >= item.startFrame && local < item.endFrame);
  if (!subtitle) {
    return null;
  }
  const fadeFrames = 4;
  const opacity = interpolate(
    local,
    [
      subtitle.startFrame,
      subtitle.startFrame + fadeFrames,
      subtitle.endFrame - fadeFrames,
      subtitle.endFrame,
    ],
    [0, 1, 1, 0],
    {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'},
  );

  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 24,
        display: 'flex',
        justifyContent: 'center',
        padding: '0 100px',
        opacity,
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          maxWidth: 1720,
          fontFamily: SANS_FONT,
          fontSize: 40,
          fontWeight: 700,
          lineHeight: 1.36,
          textAlign: 'center',
          color: '#ffffff',
          WebkitTextStroke: '5px rgba(0, 0, 0, 0.9)',
          paintOrder: 'stroke fill',
          textShadow: '0 2px 6px rgba(0, 0, 0, 0.45)',
        }}
      >
        {subtitle.text}
      </div>
    </div>
  );
};

const HeaderMark: React.FC = () => (
  <div
    style={{
      position: 'absolute',
      right: 60,
      top: 44,
      fontFamily: SERIF_FONT,
      fontSize: 20,
      letterSpacing: 4,
      color: palette.ink,
      opacity: 0.35,
      pointerEvents: 'none',
    }}
  >
    资治通鉴 · 三家分晋
  </div>
);

/** 成片主 Composition：画面 + 配音 + 句级字幕 + 转场 + 片尾。 */
export const Episode01: React.FC = () => {
  return (
    <AbsoluteFill style={{backgroundColor: palette.paper}}>
      <Audio src={staticFile('audio/full.mp3')} />
      {timelineJson.shots.map((timelineShot) => {
        const shot = shotById.get(timelineShot.id);
        if (!shot) {
          return null;
        }
        return (
          <Sequence
            key={timelineShot.id}
            from={timelineShot.startFrame}
            durationInFrames={timelineShot.durationInFrames}
          >
            <ShotTransition
              shot={shot}
              durationInFrames={timelineShot.durationInFrames}
            >
              <ShotView shot={shot} durationInFrames={timelineShot.durationInFrames} />
            </ShotTransition>
          </Sequence>
        );
      })}

      <Sequence
        from={timelineJson.totalDurationInFrames}
        durationInFrames={END_CARD_FRAMES}
      >
        <EndCard />
      </Sequence>

      <HeaderMark />
      <Subtitles />
    </AbsoluteFill>
  );
};
