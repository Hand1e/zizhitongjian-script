import {describe, expect, it} from 'vitest';
import storyboardJson from '../episodes/01-sanjia-fenjin/storyboard.json';
import timelineJson from '../episodes/01-sanjia-fenjin/timeline.json';
import {storyboardSchema} from './schema';

const board = storyboardSchema.parse(storyboardJson);

describe('配音时间轴', () => {
  it('覆盖全部镜头，顺序与分镜一致', () => {
    expect(timelineJson.shots).toHaveLength(board.shots.length);
    timelineJson.shots.forEach((shot, index) => {
      const source = board.shots[index];
      expect(shot.id).toBe(source.id);
      expect(shot.type).toBe(source.type);
      expect(shot.narration).toBe(source.narration);
    });
  });

  it('帧号连续，没有空隙或重叠', () => {
    let cursor = 0;
    for (const shot of timelineJson.shots) {
      expect(shot.startFrame).toBe(cursor);
      expect(shot.durationInFrames).toBeGreaterThan(0);
      expect(shot.endFrame).toBe(shot.startFrame + shot.durationInFrames);
      cursor = shot.endFrame;
    }
    expect(timelineJson.totalDurationInFrames).toBe(cursor);
  });

  it('总时长与帧率一致', () => {
    expect(timelineJson.fps).toBe(30);
    expect(timelineJson.width).toBe(1920);
    expect(timelineJson.height).toBe(1080);
    expect(timelineJson.totalDurationSeconds).toBeCloseTo(
      timelineJson.totalDurationInFrames / 30,
      2,
    );
    expect(timelineJson.totalDurationSeconds).toBeGreaterThan(180);
    expect(timelineJson.totalDurationSeconds).toBeLessThan(300);
  });

  it('句级字幕都落在镜头内且按时间排序', () => {
    for (const shot of timelineJson.shots) {
      expect(shot.subtitles.length).toBeGreaterThan(0);
      let previousStart = -1;
      for (const subtitle of shot.subtitles) {
        expect(subtitle.text.length).toBeGreaterThan(0);
        expect(subtitle.startFrame).toBeGreaterThanOrEqual(previousStart);
        expect(subtitle.endFrame).toBeLessThanOrEqual(shot.durationInFrames);
        expect(subtitle.endFrame).toBeGreaterThan(subtitle.startFrame);
        previousStart = subtitle.startFrame;
      }
    }
  });
});
