// Fortune Calendar 占術プラグイン登録 v1.0
import { FortunePlugin } from './types';
import { seizaPlugin } from './seiza';
import { bloodTypePlugin } from './bloodType';
import { omikujiPlugin } from './omikuji';
import { tarotPlugin } from './tarot';
import { numerologyPlugin } from './numerology';
import { honDoubutsuPlugin } from './honDoubutsu';

// 占術プラグイン配列（6種MVP）- 動物占いをメインに
const plugins: FortunePlugin[] = [
  honDoubutsuPlugin, seizaPlugin, tarotPlugin, bloodTypePlugin, numerologyPlugin, omikujiPlugin,
];

/** プラグイン登録 */
export const registerPlugin = (plugin: FortunePlugin): void => {
  const exists = plugins.find((p) => p.id === plugin.id);
  if (!exists) plugins.push(plugin);
};

/** プラグイン取得 */
export const getPlugin = (id: string): FortunePlugin | undefined => {
  return plugins.find((p) => p.id === id);
};

/** 全プラグイン取得 */
export const getAllPlugins = (): FortunePlugin[] => [...plugins];

/** カテゴリ別プラグイン取得 */
export const getPluginsByCategory = (category: 'free' | 'monthly' | 'premium'): FortunePlugin[] => {
  return plugins.filter((p) => p.category === category);
};

/** 無料プラグイン取得 */
export const getFreePlugins = (): FortunePlugin[] => getPluginsByCategory('free');

export { FortunePlugin };
