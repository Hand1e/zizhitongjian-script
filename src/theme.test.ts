import {describe, expect, it} from 'vitest';
import {palette} from './theme';

const hexToRgb = (hex: string): [number, number, number] => {
  const value = hex.replace('#', '');
  return [
    parseInt(value.slice(0, 2), 16),
    parseInt(value.slice(2, 4), 16),
    parseInt(value.slice(4, 6), 16),
  ];
};

/** 相对亮度（sRGB，0–1），用来检查底色够亮、墨色够深。 */
const luminance = (hex: string): number => {
  const [r, g, b] = hexToRgb(hex).map((c) => {
    const s = c / 255;
    return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

describe('美术色板', () => {
  it('所有颜色都是合六位十六进制', () => {
    for (const [name, value] of Object.entries(palette)) {
      expect(value, name).toMatch(/^#[0-9a-f]{6}$/i);
    }
  });

  it('宣纸底色亮、墨色暗，保证字幕可读', () => {
    expect(luminance(palette.paper)).toBeGreaterThan(0.7);
    expect(luminance(palette.ink)).toBeLessThan(0.03);
  });

  it('朱红比底色暗得多，用于强调时对比明显', () => {
    expect(luminance(palette.paper) - luminance(palette.vermilion)).toBeGreaterThan(
      0.35,
    );
  });
});
