import React from 'react';
import {
  AbsoluteFill,
  Easing,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import {PaperBackground} from '../components/PaperBackground';
import {SERIF_FONT} from '../fonts';
import type {MapShot, TerritoryId} from '../schema';
import {TERRITORY_NAMES} from '../schema';
import {palette} from '../theme';

type Territory = {
  id: TerritoryId;
  short: string;
  color: string;
  points: string;
  labelX: number;
  labelY: number;
};

const TERRITORIES: Territory[] = [
  {
    id: 'zhao',
    short: '赵',
    color: palette.ochre,
    points: '120,190 520,110 610,320 540,420 300,400 140,330',
    labelX: 300,
    labelY: 265,
  },
  {
    id: 'zhi',
    short: '智',
    color: palette.vermilion,
    points: '620,120 1040,150 1090,360 800,410 610,320',
    labelX: 840,
    labelY: 270,
  },
  {
    id: 'han',
    short: '韩',
    color: palette.azurite,
    points: '200,390 520,430 570,650 280,690 170,540',
    labelX: 360,
    labelY: 555,
  },
  {
    id: 'wei',
    short: '魏',
    color: '#6b6b4a',
    points: '580,440 1060,410 1130,660 620,710 580,650',
    labelX: 850,
    labelY: 555,
  },
];

const CENTERS: Record<TerritoryId, {x: number; y: number}> = {
  zhao: {x: 300, y: 265},
  zhi: {x: 840, y: 270},
  han: {x: 360, y: 555},
  wei: {x: 850, y: 555},
};

const JINYANG = {x: 555, y: 330};

/** 晋国及四家领地简化地图。 */
export const MapScene: React.FC<{shot: MapShot; durationInFrames?: number}> = ({
  shot,
  durationInFrames,
}) => {
  const frame = useCurrentFrame();
  const {durationInFrames: compositionDuration} = useVideoConfig();
  const totalFrames = durationInFrames ?? compositionDuration;

  const enter = interpolate(frame, [0, 26], [0, 1], {
    easing: Easing.out(Easing.cubic),
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const zoom = interpolate(frame, [0, Math.max(1, totalFrames)], [1, 1.025], {
    easing: Easing.inOut(Easing.cubic),
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const focus = new Set(shot.focus);
  const floodLevel = shot.flood.active
    ? interpolate(frame, [8, 48], [0, shot.flood.level], {
        easing: Easing.out(Easing.cubic),
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      })
    : 0;

  return (
    <PaperBackground>
      <AbsoluteFill style={{fontFamily: SERIF_FONT, color: palette.ink}}>
        {shot.title ? (
          <div
            style={{
              position: 'absolute',
              left: 130,
              top: 72,
              display: 'flex',
              alignItems: 'baseline',
              gap: 24,
              opacity: enter,
            }}
          >
            <div style={{fontSize: 54, fontWeight: 700, letterSpacing: 6}}>
              {shot.title}
            </div>
            <div style={{fontSize: 24, letterSpacing: 4, color: palette.ochre}}>
              晋国 · 四家形势
            </div>
          </div>
        ) : null}

        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            paddingTop: 34,
            opacity: enter,
            transform: `scale(${zoom})`,
          }}
        >
          <svg width={1500} height={820} viewBox="0 0 1500 820">
            <defs>
              <marker
                id="map-arrow"
                markerWidth={12}
                markerHeight={12}
                refX={9}
                refY={6}
                orient="auto"
              >
                <path d="M0,0 L12,6 L0,12 z" fill={palette.ink} />
              </marker>
              <filter id="map-soft" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="8" />
              </filter>
            </defs>

            {/* 晋国大边界 */}
            <path
              d="M 95 160 Q 600 40 1080 120 Q 1230 330 1180 560 Q 1120 760 700 735 Q 240 720 120 520 Q 70 330 95 160 Z"
              fill="none"
              stroke={palette.ink}
              strokeWidth={3}
              strokeDasharray="10 12"
              opacity={0.25}
            />

            {TERRITORIES.map((territory) => {
              const dimmed = focus.size > 0 && !focus.has(territory.id);
              const conquest = shot.conquests.find(
                (item) => item.territory === territory.id,
              );
              const conqueror = conquest
                ? TERRITORIES.find((item) => item.id === conquest.by)
                : undefined;
              const fill = conqueror ? conqueror.color : territory.color;
              return (
                <g
                  key={territory.id}
                  opacity={dimmed ? 0.22 : 1}
                  style={{transition: 'opacity 0.4s'}}
                >
                  <polygon
                    points={territory.points}
                    fill={fill}
                    fillOpacity={0.2}
                    stroke={fill}
                    strokeWidth={dimmed ? 2 : 4}
                    strokeLinejoin="round"
                  />
                  <text
                    x={territory.labelX}
                    y={territory.labelY}
                    textAnchor="middle"
                    fontFamily={SERIF_FONT}
                    fontSize={46}
                    fontWeight={700}
                    fill={palette.ink}
                  >
                    {territory.short}
                  </text>
                  <text
                    x={territory.labelX}
                    y={territory.labelY + 34}
                    textAnchor="middle"
                    fontFamily={SERIF_FONT}
                    fontSize={22}
                    fill={palette.ink}
                    opacity={0.68}
                  >
                    {TERRITORY_NAMES[territory.id]}
                  </text>
                </g>
              );
            })}

            {/* 山川 */}
            <path
              d="M 760 70 Q 700 220 720 340 Q 748 480 690 780"
              fill="none"
              stroke={palette.azurite}
              strokeWidth={7}
              opacity={0.45}
            />
            <path
              d="M 555 330 Q 590 400 640 460 Q 690 540 690 640"
              fill="none"
              stroke={palette.azurite}
              strokeWidth={4}
              opacity={0.4}
            />
            <text
              x={742}
              y={600}
              fontFamily={SERIF_FONT}
              fontSize={22}
              fill={palette.azurite}
              opacity={0.75}
              writingMode="vertical-rl"
            >
              汾水
            </text>
            <text
              x={610}
              y={430}
              fontFamily={SERIF_FONT}
              fontSize={20}
              fill={palette.azurite}
              opacity={0.7}
            >
              晋水
            </text>

            {/* 晋阳城 */}
            <g transform={`translate(${JINYANG.x} ${JINYANG.y})`}>
              <rect
                x={-42}
                y={-26}
                width={84}
                height={48}
                fill={palette.paper}
                stroke={palette.ink}
                strokeWidth={4}
              />
              <path
                d="M -42 -26 L -42 -34 L -30 -34 L -30 -26 M -14 -26 L -14 -34 L -2 -34 L -2 -26 M 14 -26 L 14 -34 L 26 -34 L 26 -26"
                fill="none"
                stroke={palette.ink}
                strokeWidth={3}
              />
              <text
                x={0}
                y={-44}
                textAnchor="middle"
                fontFamily={SERIF_FONT}
                fontSize={26}
                fontWeight={700}
                fill={palette.ink}
              >
                晋阳
              </text>
            </g>

            {/* 水淹晋阳 */}
            {floodLevel > 0 ? (
              <g opacity={0.55}>
                <ellipse
                  cx={JINYANG.x}
                  cy={JINYANG.y + 70}
                  rx={150 + floodLevel * 230}
                  ry={45 + floodLevel * 150}
                  fill={palette.azurite}
                  opacity={0.35}
                />
                <path
                  d={`M ${JINYANG.x - 210 - floodLevel * 90} ${JINYANG.y + 36}
                      Q ${JINYANG.x - 60} ${JINYANG.y + 8 - floodLevel * 30}
                      ${JINYANG.x + 130} ${JINYANG.y + 34}
                      T ${JINYANG.x + 360} ${JINYANG.y + 30}`}
                  fill="none"
                  stroke={palette.azurite}
                  strokeWidth={4}
                  opacity={0.65}
                />
                <text
                  x={JINYANG.x + 250}
                  y={JINYANG.y + 155}
                  fontFamily={SERIF_FONT}
                  fontSize={24}
                  fill={palette.azurite}
                  opacity={0.85}
                >
                  水灌晋阳
                </text>
              </g>
            ) : null}

            {/* 行军箭头 */}
            {shot.arrows.map((arrow, index) => {
              const from = CENTERS[arrow.from];
              const to = CENTERS[arrow.to];
              // 箭头停在目标中心外一点，多个箭头指向同一家时不会叠成一团。
              const dx = from.x - to.x;
              const dy = from.y - to.y;
              const distance = Math.max(1, Math.hypot(dx, dy));
              const endX = to.x + (dx / distance) * 74;
              const endY = to.y + (dy / distance) * 74;
              const midX = (from.x + endX) / 2 + (index % 2 === 0 ? -26 : 26);
              const midY = (from.y + endY) / 2 - 70 - index * 16;
              const progress = interpolate(
                frame,
                [12 + index * 9, 48 + index * 9],
                [0, arrow.progress],
                {
                  easing: Easing.out(Easing.cubic),
                  extrapolateLeft: 'clamp',
                  extrapolateRight: 'clamp',
                },
              );
              const path = `M ${from.x} ${from.y} Q ${midX} ${midY} ${endX} ${endY}`;
              return (
                <g key={`${arrow.from}-${arrow.to}-${index}`}>
                  <path
                    d={path}
                    fill="none"
                    stroke={palette.ink}
                    strokeWidth={5}
                    strokeLinecap="round"
                    markerEnd="url(#map-arrow)"
                    pathLength={1}
                    strokeDasharray="1"
                    strokeDashoffset={1 - progress}
                    opacity={0.85}
                  />
                  {arrow.label ? (
                    <text
                      x={midX}
                      y={midY - 14}
                      textAnchor="middle"
                      fontFamily={SERIF_FONT}
                      fontSize={24}
                      fill={palette.ink}
                      opacity={0.85}
                      style={{paintOrder: 'stroke'}}
                      stroke={palette.paper}
                      strokeWidth={6}
                    >
                      {arrow.label}
                    </text>
                  ) : null}
                </g>
              );
            })}

            <text
              x={1390}
              y={790}
              textAnchor="end"
              fontFamily={SERIF_FONT}
              fontSize={22}
              fill={palette.ink}
              opacity={0.5}
            >
              示意图
            </text>
          </svg>
        </div>
      </AbsoluteFill>
    </PaperBackground>
  );
};
