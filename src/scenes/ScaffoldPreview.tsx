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
import {palette} from '../theme';

const SERIF =
  '"Noto Serif SC", "Songti SC", "STSong", "SimSun", "Source Han Serif SC", serif';

/**
 * 阶段 1 的脚手架预览：验证 1920x1080 / 30fps 画布、宣纸底色、衬线标题与基础动效。
 * 真正的片头（书名 + 集名 + 年份）在阶段 6 用 TitleCard 模板实现，这里只做占位。
 */
export const ScaffoldPreview: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  // 克制的入场：整体淡入 + 轻微上浮，镜头不推拉。
  const intro = interpolate(frame, [0, 24], [0, 1], {
    easing: Easing.out(Easing.cubic),
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const lift = interpolate(frame, [0, 24], [18, 0], {
    easing: Easing.out(Easing.cubic),
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // 朱红横线自左向右展开。
  const rule = interpolate(frame, [18, 46], [0, 1], {
    easing: Easing.inOut(Easing.cubic),
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // 印章落下：轻微回弹，之后静止。
  const seal = spring({
    frame: frame - 26,
    fps,
    config: {damping: 200, mass: 0.6},
  });
  const sealScale = interpolate(seal, [0, 1], [0.7, 1]);
  const sealRotate = interpolate(seal, [0, 1], [-10, -4]);

  return (
    <PaperBackground>
      <AbsoluteFill
        style={{
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: SERIF,
          color: palette.ink,
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            transform: `translateY(${lift}px)`,
            opacity: intro,
          }}
        >
          <div
            style={{
              fontSize: 30,
              letterSpacing: 14,
              color: palette.ochre,
              marginBottom: 34,
            }}
          >
            资治通鉴 · 动画讲解
          </div>

          <div style={{display: 'flex', alignItems: 'center', gap: 44}}>
            <div
              style={{
                fontSize: 168,
                fontWeight: 700,
                letterSpacing: 16,
                lineHeight: 1.1,
                textShadow: '0 4px 0 rgba(138, 90, 43, 0.18)',
              }}
            >
              三家分晋
            </div>

            <div
              style={{
                width: 136,
                height: 136,
                backgroundColor: palette.vermilion,
                border: '5px solid #8f251f',
                borderRadius: 8,
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gridTemplateRows: '1fr 1fr',
                placeItems: 'center',
                color: palette.paper,
                fontSize: 40,
                fontWeight: 700,
                lineHeight: 1,
                transform: `scale(${sealScale}) rotate(${sealRotate}deg)`,
                boxShadow: '0 8px 18px rgba(90, 30, 20, 0.25)',
              }}
            >
              <span>通</span>
              <span>资</span>
              <span>鉴</span>
              <span>治</span>
            </div>
          </div>

          <div
            style={{
              height: 6,
              width: 620,
              marginTop: 28,
              backgroundColor: palette.vermilion,
              transform: `scaleX(${rule})`,
              transformOrigin: 'left center',
              opacity: 0.85,
            }}
          />

          <div
            style={{
              marginTop: 34,
              fontSize: 40,
              letterSpacing: 10,
              color: palette.ink,
              opacity: 0.78,
            }}
          >
            第一集 · 公元前 403 年
          </div>
        </div>
      </AbsoluteFill>

      <div
        style={{
          position: 'absolute',
          bottom: 46,
          width: '100%',
          textAlign: 'center',
          fontFamily: SERIF,
          fontSize: 22,
          letterSpacing: 4,
          color: palette.ink,
          opacity: 0.42,
        }}
      >
        脚手架预览 · 阶段 1 · 画面全部由代码绘制
      </div>
    </PaperBackground>
  );
};
