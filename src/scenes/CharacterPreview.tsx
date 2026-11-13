import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Puppet} from '../characters/Puppet';
import {CHARACTER_IDS, CHARACTER_NAMES} from '../characters/cast';
import {PaperBackground} from '../components/PaperBackground';
import {SERIF_FONT} from '../fonts';
import {palette} from '../theme';

/** 阶段 8 人物预览：10 个角色排成两排，检查剪影与辨识度。 */
export const CharacterPreview: React.FC = () => {
  return (
    <PaperBackground>
      <AbsoluteFill style={{fontFamily: SERIF_FONT, color: palette.ink}}>
        <div
          style={{
            position: 'absolute',
            top: 44,
            left: 90,
            fontSize: 38,
            letterSpacing: 8,
          }}
        >
          皮影人物 · 十角
        </div>
        <div
          style={{
            position: 'absolute',
            top: 100,
            left: 92,
            fontSize: 22,
            letterSpacing: 4,
            color: palette.ochre,
          }}
        >
          侧面剪影 / 冠帽 / 胡须 / 袍色
        </div>

        <div
          style={{
            position: 'absolute',
            inset: '130px 60px 40px',
            display: 'grid',
            gridTemplateColumns: 'repeat(5, 1fr)',
            gridTemplateRows: 'repeat(2, 1fr)',
            alignItems: 'end',
            justifyItems: 'center',
          }}
        >
          {CHARACTER_IDS.map((id, index) => (
            <div
              key={id}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                transform: `translateY(${index % 2 === 0 ? 8 : 0}px)`,
              }}
            >
              <Puppet id={id} width={250} flip={index % 2 === 1} delay={index * 2} />
              <div
                style={{
                  marginTop: -4,
                  fontSize: 24,
                  letterSpacing: 3,
                  color: palette.ink,
                  opacity: 0.8,
                }}
              >
                {CHARACTER_NAMES[id]}
              </div>
            </div>
          ))}
        </div>
      </AbsoluteFill>
    </PaperBackground>
  );
};
