import {describe, expect, it} from 'vitest';
import {framesToSeconds, secondsToFrames, VIDEO} from './video';

describe('视频基础参数', () => {
  it('是 16:9 的 1920x1080、30fps', () => {
    expect(VIDEO.width).toBe(1920);
    expect(VIDEO.height).toBe(1080);
    expect(VIDEO.width / VIDEO.height).toBeCloseTo(16 / 9, 5);
    expect(VIDEO.fps).toBe(30);
  });

  it('秒与帧互转', () => {
    expect(secondsToFrames(1)).toBe(30);
    expect(secondsToFrames(3)).toBe(90);
    expect(framesToSeconds(90)).toBe(3);
  });

  it('对半帧做四舍五入，避免累计差一帧', () => {
    expect(secondsToFrames(0.5)).toBe(15);
    expect(secondsToFrames(2.02)).toBe(61); // 60.6 → 61
    expect(secondsToFrames(2.01)).toBe(60); // 60.3 → 60
  });
});
