/**
 * 第一集出场人物。id 用于分镜引用与组件查找，name 用于字幕/台词气泡。
 * 阶段 8 会为这里的每个 id 提供皮影人物组件。
 */
export const CHARACTER_IDS = [
  'zhi-xuanzi',
  'zhi-yao',
  'zhi-guo',
  'zhao-jianzi',
  'zhao-xiangzi',
  'han-kangzi',
  'wei-huanzi',
  'zhang-mengtan',
  'chi-ci',
  'sima-guang',
] as const;

export type CharacterId = (typeof CHARACTER_IDS)[number];

export const CHARACTER_NAMES: Record<CharacterId, string> = {
  'zhi-xuanzi': '智宣子',
  'zhi-yao': '智瑶（智伯）',
  'zhi-guo': '智果',
  'zhao-jianzi': '赵简子',
  'zhao-xiangzi': '赵襄子',
  'han-kangzi': '韩康子',
  'wei-huanzi': '魏桓子',
  'zhang-mengtan': '张孟谈',
  'chi-ci': '絺疵',
  'sima-guang': '司马光',
};
