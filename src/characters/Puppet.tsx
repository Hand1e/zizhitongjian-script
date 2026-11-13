import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import type {Gesture} from '../schema';
import {palette} from '../theme';
import {CHARACTER_DEFS, type CharacterDef} from './definitions';
import type {CharacterId} from './cast';

type PuppetProps = {
  id: CharacterId;
  gesture?: Gesture;
  speaking?: boolean;
  width?: number;
  flip?: boolean;
  delay?: number;
};

const Hat: React.FC<{def: CharacterDef}> = ({def}) => {
  const ink = palette.ink;
  const accent = def.accent;
  switch (def.hat) {
    case 'helmet':
      return (
        <g>
          <path d="M118 118 Q118 48 170 48 Q222 48 222 118 Z" fill={ink} />
          <rect x={112} y={104} width={116} height={18} rx={6} fill={ink} />
          <path
            d="M170 50 Q178 16 208 8"
            fill="none"
            stroke={accent}
            strokeWidth={6}
            strokeLinecap="round"
          />
          <circle cx={210} cy={8} r={7} fill={accent} />
        </g>
      );
    case 'cloth':
      return (
        <g>
          <path d="M120 112 Q146 34 196 52 L220 112 Z" fill={ink} />
          <path
            d="M122 108 Q150 88 214 108"
            fill="none"
            stroke={accent}
            strokeWidth={5}
            opacity={0.75}
          />
          <path d="M196 54 L220 34 L226 52 Z" fill={ink} />
        </g>
      );
    case 'official':
      return (
        <g>
          <rect x={124} y={76} width={92} height={38} rx={6} fill={ink} />
          <rect x={60} y={88} width={70} height={12} rx={4} fill={ink} />
          <rect x={210} y={88} width={70} height={12} rx={4} fill={ink} />
          <rect x={140} y={70} width={58} height={10} rx={3} fill={accent} opacity={0.55} />
        </g>
      );
    case 'topknot':
      return (
        <g>
          <circle cx={170} cy={82} r={26} fill={ink} />
          <path
            d="M148 88 Q170 72 194 90"
            fill="none"
            stroke={accent}
            strokeWidth={5}
          />
          <path d="M196 82 Q218 70 224 88 Q208 96 196 92 Z" fill={ink} />
        </g>
      );
    default:
      return (
        <g>
          <rect x={130} y={62} width={70} height={50} rx={7} fill={ink} />
          <rect x={116} y={50} width={98} height={16} rx={5} fill={ink} />
          <line
            x1={165}
            y1={50}
            x2={165}
            y2={28}
            stroke={accent}
            strokeWidth={5}
            strokeLinecap="round"
          />
          <circle cx={165} cy={24} r={5} fill={accent} />
        </g>
      );
  }
};

const Beard: React.FC<{def: CharacterDef}> = ({def}) => {
  if (def.beard === 'none') {
    return null;
  }
  const ink = palette.ink;
  if (def.beard === 'long') {
    return (
      <g fill={ink}>
        <path d="M158 190 Q144 270 168 318 Q184 270 190 196 Z" opacity={0.95} />
        <path d="M184 186 Q200 204 205 188 Q194 178 184 186 Z" opacity={0.8} />
      </g>
    );
  }
  if (def.beard === 'short') {
    return (
      <g fill={ink}>
        <path d="M160 192 Q154 238 172 262 Q186 232 188 196 Z" opacity={0.95} />
        <path d="M184 186 Q198 200 203 186 Q193 178 184 186 Z" opacity={0.8} />
      </g>
    );
  }
  return (
    <g fill={ink}>
      <path d="M166 196 Q162 236 174 252 Q182 228 182 198 Z" opacity={0.95} />
      <path d="M184 188 Q198 200 202 186 Q192 178 184 188 Z" opacity={0.8} />
    </g>
  );
};

/** 侧身皮影人物，通过冠帽、胡须、袍色区分身份。 */
export const Puppet: React.FC<PuppetProps> = ({
  id,
  gesture = 'stand',
  speaking = false,
  width = 360,
  flip = false,
  delay = 0,
}) => {
  const frame = useCurrentFrame();
  const def = CHARACTER_DEFS[id];
  const phase = frame + def.seed * 9;

  const enter = interpolate(frame, [delay, delay + 22], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const bob = Math.sin(phase / 18) * 2.2 + (speaking ? Math.sin(phase / 7) * 0.8 : 0);
  const walkLift = gesture === 'walk' ? Math.abs(Math.sin(phase / 9)) * 4 : 0;

  let armAngle = 6 + Math.sin(phase / 24) * 2;
  if (gesture === 'raise') {
    armAngle = -108 + Math.sin(phase / 8) * 2.5;
  } else if (gesture === 'nod') {
    armAngle = 2;
  } else if (gesture === 'walk') {
    armAngle = Math.sin(phase / 9) * 11;
  }

  const nod =
    gesture === 'nod' ? Math.sin(phase / 6) * 3.5 : speaking ? Math.sin(phase / 9) * 1.6 : 0;

  return (
    <svg
      viewBox="0 0 320 560"
      width={width}
      height={(width * 560) / 320}
      style={{
        overflow: 'visible',
        transform: flip ? 'scaleX(-1)' : undefined,
        opacity: enter,
      }}
    >
      <ellipse cx={160} cy={522} rx={94} ry={13} fill={palette.ink} opacity={0.12} />

      <g transform={`translate(0 ${bob - walkLift})`}>
        {/* 后侧手臂 */}
        <path
          d="M118 258 Q96 306 102 344"
          fill="none"
          stroke={palette.ink}
          strokeWidth={20}
          strokeLinecap="round"
          opacity={0.55}
        />

        {/* 袍身 */}
        <path
          d="M108 236 L212 236 L242 514 L78 514 Z"
          fill={def.robe}
          stroke={palette.ink}
          strokeWidth={4}
          strokeLinejoin="round"
        />
        <path
          d="M160 240 L186 240 L202 510 L166 510 Z"
          fill={palette.ink}
          opacity={0.12}
        />
        <path
          d="M100 472 L238 472 L242 514 L78 514 Z"
          fill={def.accent}
          opacity={0.32}
        />
        <rect x={98} y={300} width={132} height={16} rx={3} fill={def.accent} opacity={0.8} />
        <circle cx={160} cy={348} r={14} fill="none" stroke={def.accent} strokeWidth={3} opacity={0.5} />

        {/* 脖子与头 */}
        <rect x={150} y={196} width={30} height={38} fill={palette.ink} />
        <g transform={`rotate(${nod} 164 206)`}>
          <ellipse cx={170} cy={152} rx={48} ry={56} fill={palette.ink} />
          <path d="M210 144 L236 162 L207 178 Z" fill={palette.ink} />
          <circle cx={202} cy={143} r={3.4} fill={palette.paper} opacity={0.8} />
          <Beard def={def} />
          <Hat def={def} />
        </g>

        {/* 前侧手臂 */}
        <g transform={`rotate(${armAngle} 202 258)`}>
          <path
            d="M202 258 Q232 292 238 338"
            fill="none"
            stroke={def.robe}
            strokeWidth={24}
            strokeLinecap="round"
          />
          <path
            d="M202 258 Q232 292 238 338"
            fill="none"
            stroke={palette.ink}
            strokeWidth={3}
            strokeLinecap="round"
            opacity={0.5}
          />
          <circle cx={238} cy={340} r={12} fill={palette.ink} />
        </g>

        {/* 脚 */}
        <ellipse cx={120} cy={514} rx={26} ry={10} fill={palette.ink} />
        <ellipse cx={200} cy={514} rx={26} ry={10} fill={palette.ink} />
      </g>
    </svg>
  );
};
