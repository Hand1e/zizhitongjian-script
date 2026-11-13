import {Easing, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';

/** 0 → 1 的缓入进度，所有模板共用，保证动效节奏一致。 */
export const useEnter = (delay = 0, duration = 22): number => {
  const frame = useCurrentFrame();
  return interpolate(frame, [delay, delay + duration], [0, 1], {
    easing: Easing.out(Easing.cubic),
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
};

/** 缓慢推近，用于纯旁白、地图等长镜头。 */
export const useSlowZoom = (amount = 0.02): number => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  return 1 + (frame / Math.max(1, durationInFrames)) * amount;
};
