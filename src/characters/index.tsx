import React from 'react';
import type {CharacterId} from './cast';
import {Puppet} from './Puppet';

type Props = {
  gesture?: 'stand' | 'raise' | 'nod' | 'walk';
  speaking?: boolean;
  width?: number;
  flip?: boolean;
  delay?: number;
};

const make = (id: CharacterId): React.FC<Props> => {
  const Component: React.FC<Props> = (props) => <Puppet id={id} {...props} />;
  Component.displayName = `Puppet(${id})`;
  return Component;
};

/** 10 个具名皮影人物组件，Composition 可按 id 取用。 */
export const ZhiXuanzi = make('zhi-xuanzi');
export const ZhiYao = make('zhi-yao');
export const ZhiGuo = make('zhi-guo');
export const ZhaoJianzi = make('zhao-jianzi');
export const ZhaoXiangzi = make('zhao-xiangzi');
export const HanKangzi = make('han-kangzi');
export const WeiHuanzi = make('wei-huanzi');
export const ZhangMengtan = make('zhang-mengtan');
export const ChiCi = make('chi-ci');
export const SimaGuang = make('sima-guang');

export const CHARACTER_COMPONENTS: Record<CharacterId, React.FC<Props>> = {
  'zhi-xuanzi': ZhiXuanzi,
  'zhi-yao': ZhiYao,
  'zhi-guo': ZhiGuo,
  'zhao-jianzi': ZhaoJianzi,
  'zhao-xiangzi': ZhaoXiangzi,
  'han-kangzi': HanKangzi,
  'wei-huanzi': WeiHuanzi,
  'zhang-mengtan': ZhangMengtan,
  'chi-ci': ChiCi,
  'sima-guang': SimaGuang,
};
