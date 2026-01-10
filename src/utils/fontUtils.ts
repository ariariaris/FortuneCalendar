// フォントサイズユーティリティ v1.0
import { FONT_SIZES } from '../config/defaultConfig';
import { FontSize } from '../config/types';

/** ベースサイズにスケールを適用 */
export const getFontSize = (base: number, fontSize: FontSize = 'md'): number => {
  return Math.round(base * FONT_SIZES[fontSize].scale);
};
