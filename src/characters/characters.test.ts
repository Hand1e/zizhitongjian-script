import {describe, expect, it} from 'vitest';
import {CHARACTER_IDS} from './cast';
import {CHARACTER_DEFS} from './definitions';
import {CHARACTER_COMPONENTS} from './index';

describe('皮影人物', () => {
  it('10 个角色都有定义和组件', () => {
    expect(CHARACTER_IDS).toHaveLength(10);
    for (const id of CHARACTER_IDS) {
      expect(CHARACTER_DEFS[id]).toBeDefined();
      expect(CHARACTER_COMPONENTS[id]).toBeTypeOf('function');
    }
  });

  it('冠帽、胡须、袍色有足够区分度', () => {
    const hats = new Set(CHARACTER_IDS.map((id) => CHARACTER_DEFS[id].hat));
    const beards = new Set(CHARACTER_IDS.map((id) => CHARACTER_DEFS[id].beard));
    const robes = new Set(CHARACTER_IDS.map((id) => CHARACTER_DEFS[id].robe));
    expect(hats.size).toBeGreaterThanOrEqual(4);
    expect(beards.size).toBeGreaterThanOrEqual(3);
    expect(robes.size).toBeGreaterThanOrEqual(8);
  });
});
