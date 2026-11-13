import React from 'react';
import {AbsoluteFill, Easing, interpolate, useCurrentFrame} from 'remotion';
import {PaperBackground} from '../components/PaperBackground';
import {SERIF_FONT} from '../fonts';
import type {RelationShot, TerritoryId} from '../schema';
import {TERRITORY_NAMES} from '../schema';
import {palette} from '../theme';

type Props = {
  shot: RelationShot;
  durationInFrames?: number;
};

const NODE_POS: Record<TerritoryId, {x: number; y: number}> = {
  zhi: {x: 960, y: 280},
  han: {x: 470, y: 560},
  zhao: {x: 960, y: 780},
  wei: {x: 1450, y: 560},
};

const relationColor = (relation: 'ally' | 'enemy' | 'neutral'): string => {
  if (relation === 'ally') return palette.azurite;
  if (relation === 'enemy') return palette.vermilion;
  return palette.ochre;
};

/** 四家关系图：结盟 / 敌对连线，支持「韩魏倒戈」的变色动画。 */
export const RelationScene: React.FC<Props> = ({shot, durationInFrames}) => {
  const frame = useCurrentFrame();
  const total = durationInFrames ?? 240;
  const progress = Math.min(1, frame / Math.max(1, total));

  const enter = interpolate(frame, [0, 24], [0, 1], {
    easing: Easing.out(Easing.cubic),
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const draw = interpolate(frame, [6, 46], [0, 1], {
    easing: Easing.inOut(Easing.cubic),
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <PaperBackground>
      <AbsoluteFill style={{fontFamily: SERIF_FONT, color: palette.ink}}>
        <div
          style={{
            position: 'absolute',
            left: 120,
            top: 86,
            display: 'flex',
            alignItems: 'baseline',
            gap: 24,
            opacity: enter,
          }}
        >
          <div style={{fontSize: 44, fontWeight: 700, letterSpacing: 6}}>
            四家关系 · 晋阳之战
          </div>
          <div style={{fontSize: 24, letterSpacing: 4, color: palette.ochre}}>
            韩、魏倒戈
          </div>
        </div>

        <div
          style={{
            position: 'absolute',
            right: 150,
            top: 96,
            display: 'flex',
            gap: 26,
            fontSize: 22,
            color: palette.ink,
            opacity: 0.7 * enter,
          }}
        >
          <span>
            <span style={{color: palette.azurite}}>━</span> 盟
          </span>
          <span>
            <span style={{color: palette.vermilion}}>━</span> 敌
          </span>
        </div>

        <svg width={1920} height={1080} viewBox="0 0 1920 1080">
          {shot.edges.map((edge, index) => {
            const from = NODE_POS[edge.from];
            const to = NODE_POS[edge.to];
            const dx = to.x - from.x;
            const dy = to.y - from.y;
            const midX = (from.x + to.x) / 2 + dy * 0.1;
            const midY = (from.y + to.y) / 2 - dx * 0.1;
            const path = `M ${from.x} ${from.y} Q ${midX} ${midY} ${to.x} ${to.y}`;
            const changeAt = edge.changeAt ?? 1;
            const changeAmount =
              edge.changeTo === undefined
                ? 0
                : interpolate(progress, [changeAt, Math.min(1, changeAt + 0.16)], [0, 1], {
                    extrapolateLeft: 'clamp',
                    extrapolateRight: 'clamp',
                  });
            const baseColor = relationColor(edge.relation);
            const nextColor = relationColor(edge.changeTo ?? edge.relation);
            return (
              <g key={`${edge.from}-${edge.to}-${index}`}>
                <path
                  d={path}
                  fill="none"
                  stroke={baseColor}
                  strokeWidth={8}
                  strokeLinecap="round"
                  opacity={0.8 * (1 - changeAmount)}
                  pathLength={1}
                  strokeDasharray="1"
                  strokeDashoffset={1 - draw}
                />
                <path
                  d={path}
                  fill="none"
                  stroke={nextColor}
                  strokeWidth={8}
                  strokeLinecap="round"
                  opacity={0.9 * changeAmount}
                  pathLength={1}
                  strokeDasharray="1"
                  strokeDashoffset={1 - draw}
                />
              </g>
            );
          })}

          {shot.nodes.map((node, index) => {
            const pos = NODE_POS[node.id];
            const scale = interpolate(
              frame,
              [10 + index * 7, 30 + index * 7],
              [0.85, 1],
              {
                easing: Easing.out(Easing.cubic),
                extrapolateLeft: 'clamp',
                extrapolateRight: 'clamp',
              },
            );
            return (
              <g
                key={node.id}
                transform={`translate(${pos.x} ${pos.y}) scale(${scale})`}
                opacity={enter}
              >
                <circle
                  r={96}
                  fill={palette.paper}
                  stroke={node.emphasis ? palette.vermilion : palette.ink}
                  strokeWidth={node.emphasis ? 7 : 4}
                />
                <circle r={86} fill="none" stroke={palette.ink} strokeWidth={1} opacity={0.25} />
                <text
                  y={-6}
                  textAnchor="middle"
                  fontFamily={SERIF_FONT}
                  fontSize={54}
                  fontWeight={700}
                  fill={node.emphasis ? palette.vermilion : palette.ink}
                >
                  {TERRITORY_NAMES[node.id].replace('氏', '')}
                </text>
                <text
                  y={38}
                  textAnchor="middle"
                  fontFamily={SERIF_FONT}
                  fontSize={22}
                  fill={palette.ink}
                  opacity={0.65}
                >
                  {node.label ?? TERRITORY_NAMES[node.id]}
                </text>
              </g>
            );
          })}
        </svg>
      </AbsoluteFill>
    </PaperBackground>
  );
};
