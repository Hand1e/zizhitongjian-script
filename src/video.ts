/**
 * 视频基础参数：全项目唯一来源，任何地方需要画布尺寸/帧率都从这里取。
 */
export const VIDEO = {
  width: 1920,
  height: 1080,
  fps: 30,
} as const;

/** 秒 → 帧（四舍五入，避免浮点误差导致差一帧）。 */
export const secondsToFrames = (seconds: number): number =>
  Math.round(seconds * VIDEO.fps);

/** 帧 → 秒。 */
export const framesToSeconds = (frames: number): number => frames / VIDEO.fps;
