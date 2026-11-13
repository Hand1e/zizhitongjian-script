import type {CharacterId} from './cast';
import {CHARACTER_NAMES} from './cast';
import {palette} from '../theme';

export type HatKind = 'crown' | 'helmet' | 'cloth' | 'official' | 'topknot';
export type BeardKind = 'long' | 'short' | 'goatee' | 'none';

export type CharacterDef = {
  id: CharacterId;
  name: string;
  hat: HatKind;
  beard: BeardKind;
  robe: string;
  accent: string;
  /** 用于让同一角色的动作有细微相位差 */
  seed: number;
};

export const CHARACTER_DEFS: Record<CharacterId, CharacterDef> = {
  'zhi-xuanzi': {
    id: 'zhi-xuanzi',
    name: CHARACTER_NAMES['zhi-xuanzi'],
    hat: 'crown',
    beard: 'long',
    robe: palette.ochre,
    accent: palette.paper,
    seed: 1,
  },
  'zhi-yao': {
    id: 'zhi-yao',
    name: CHARACTER_NAMES['zhi-yao'],
    hat: 'helmet',
    beard: 'short',
    robe: palette.vermilion,
    accent: '#e8c98a',
    seed: 2,
  },
  'zhi-guo': {
    id: 'zhi-guo',
    name: CHARACTER_NAMES['zhi-guo'],
    hat: 'cloth',
    beard: 'goatee',
    robe: palette.azurite,
    accent: palette.paper,
    seed: 3,
  },
  'zhao-jianzi': {
    id: 'zhao-jianzi',
    name: CHARACTER_NAMES['zhao-jianzi'],
    hat: 'crown',
    beard: 'long',
    robe: '#6b4a2f',
    accent: '#d8bd8a',
    seed: 4,
  },
  'zhao-xiangzi': {
    id: 'zhao-xiangzi',
    name: CHARACTER_NAMES['zhao-xiangzi'],
    hat: 'topknot',
    beard: 'short',
    robe: palette.azurite,
    accent: '#d8bd8a',
    seed: 5,
  },
  'han-kangzi': {
    id: 'han-kangzi',
    name: CHARACTER_NAMES['han-kangzi'],
    hat: 'crown',
    beard: 'short',
    robe: '#4f5a4a',
    accent: '#c9b78a',
    seed: 6,
  },
  'wei-huanzi': {
    id: 'wei-huanzi',
    name: CHARACTER_NAMES['wei-huanzi'],
    hat: 'cloth',
    beard: 'long',
    robe: '#7a5a2a',
    accent: '#e0c995',
    seed: 7,
  },
  'zhang-mengtan': {
    id: 'zhang-mengtan',
    name: CHARACTER_NAMES['zhang-mengtan'],
    hat: 'cloth',
    beard: 'none',
    robe: '#35505c',
    accent: '#cfd9cf',
    seed: 8,
  },
  'chi-ci': {
    id: 'chi-ci',
    name: CHARACTER_NAMES['chi-ci'],
    hat: 'crown',
    beard: 'goatee',
    robe: '#4a4138',
    accent: '#c9b78a',
    seed: 9,
  },
  'sima-guang': {
    id: 'sima-guang',
    name: CHARACTER_NAMES['sima-guang'],
    hat: 'official',
    beard: 'long',
    robe: '#7a2a24',
    accent: '#e8d3a0',
    seed: 10,
  },
};
