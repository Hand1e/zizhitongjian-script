import React from 'react';
import {palette} from '../theme';
import {SERIF_FONT} from '../fonts';

type SealProps = {
  text?: string;
  size?: number;
  rotate?: number;
};

/**
 * 朱红印章。四字按传统印面从右往左、从上往下读：
 * 资治 / 通鉴 的排布为「通 资 / 鉴 治」。
 */
export const Seal: React.FC<SealProps> = ({text = '资治通鉴', size = 132, rotate = -4}) => {
  const chars = [...text];
  const order =
    chars.length === 4 ? [chars[2], chars[0], chars[3], chars[1]] : chars;

  return (
    <div
      style={{
        width: size,
        height: size,
        flex: '0 0 auto',
        backgroundColor: palette.vermilion,
        border: `${Math.max(3, size * 0.035)}px solid #8f251f`,
        borderRadius: size * 0.06,
        display: 'grid',
        gridTemplateColumns: chars.length === 4 ? '1fr 1fr' : '1fr',
        placeItems: 'center',
        color: palette.paper,
        fontFamily: SERIF_FONT,
        fontSize: chars.length === 4 ? size * 0.3 : size * 0.45,
        fontWeight: 700,
        lineHeight: 1,
        transform: `rotate(${rotate}deg)`,
        boxShadow: '0 8px 18px rgba(90, 30, 20, 0.25)',
        userSelect: 'none',
      }}
    >
      {order.map((char, index) => (
        <span key={`${char}-${index}`}>{char}</span>
      ))}
    </div>
  );
};
