import React from 'react';
import {AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {PaperBackground} from '../components/PaperBackground';
import {SERIF_FONT} from '../fonts';
import type {TimelineShot} from '../schema';
import {palette} from '../theme';

const formatYear = (year: number): string =>
  year < 0 ? `前 ${Math.abs(year)}` : `${year}`;

/** 公元前 453 → 403 的事件轴，节点逐个亮起。 */
export const TimelineScene: React.FC<{shot: TimelineShot}> = ({shot}) => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();

  const enter = interpolate(frame, [0, 24], [0, 1], {
    easing: Easing.out(Easing.cubic),
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const years = shot.events.map((event) => event.year);
  const minYear = Math.min(...years) - 24;
  const maxYear = Math.max(...years) + 24;

  const width = 1560;
  const height = 560;
  const axisY = 300;
  const xOf = (year: number): number =>
    130 + ((year - minYear) / Math.max(1, maxYear - minYear)) * (width - 260);

  const axisProgress = interpolate(frame, [6, 40], [0, 1], {
    easing: Easing.inOut(Easing.cubic),
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const activeIndex = shot.activeIndex ?? shot.events.length - 1;

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
            position: 'absolute',
            top: 120,
            left: 180,
            display: 'flex',
            alignItems: 'baseline',
            gap: 26,
            opacity: enter,
          }}
        >
          <div style={{fontSize: 44, letterSpacing: 6}}>公元前 453 → 403</div>
          <div style={{fontSize: 26, letterSpacing: 4, color: palette.ochre}}>
            五十年间
          </div>
        </div>

        <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
          <line
            x1={130}
            y1={axisY}
            x2={width - 130}
            y2={axisY}
            stroke={palette.ink}
            strokeWidth={3}
            strokeOpacity={0.55}
            strokeDasharray={width - 260}
            strokeDashoffset={(width - 260) * (1 - axisProgress)}
          />

          {shot.events.map((event, index) => {
            const x = xOf(event.year);
            const isActive = index === activeIndex;
            const nodeIn = spring({
              frame: frame - 20 - index * 12,
              fps,
              config: {damping: 200, mass: 0.7},
            });
            const above = index % 2 === 0;
            const labelY = above ? axisY - 92 : axisY + 92;
            const yearY = above ? axisY - 40 : axisY + 54;

            return (
              <g key={`${event.year}-${event.label}`} opacity={nodeIn}>
                <circle
                  cx={x}
                  cy={axisY}
                  r={isActive ? 16 : 11}
                  fill={isActive ? palette.vermilion : palette.paper}
                  stroke={isActive ? palette.vermilion : palette.ink}
                  strokeWidth={4}
                />
                {isActive ? (
                  <circle
                    cx={x}
                    cy={axisY}
                    r={26}
                    fill="none"
                    stroke={palette.vermilion}
                    strokeWidth={2}
                    opacity={0.35}
                  />
                ) : null}
                <text
                  x={x}
                  y={yearY}
                  textAnchor="middle"
                  fontFamily={SERIF_FONT}
                  fontSize={30}
                  fill={isActive ? palette.vermilion : palette.ochre}
                >
                  {formatYear(event.year)}
                </text>
                <text
                  x={x}
                  y={labelY}
                  textAnchor="middle"
                  fontFamily={SERIF_FONT}
                  fontSize={40}
                  fontWeight={700}
                  fill={palette.ink}
                >
                  {event.label}
                </text>
                {event.detail ? (
                  <text
                    x={x}
                    y={labelY + (above ? -46 : 44)}
                    textAnchor="middle"
                    fontFamily={SERIF_FONT}
                    fontSize={24}
                    fill={palette.ink}
                    opacity={0.6}
                  >
                    {event.detail}
                  </text>
                ) : null}
              </g>
            );
          })}
        </svg>

        <div
          style={{
            position: 'absolute',
            bottom: 100,
            fontSize: 24,
            letterSpacing: 4,
            color: palette.ochre,
            opacity: 0.7 * enter,
          }}
        >
          距今约两千四百年 · 示意图
        </div>
      </AbsoluteFill>
    </PaperBackground>
  );
};
