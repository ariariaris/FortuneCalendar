// キャラクター画像マッピング v1.0
import { ImageSourcePropType } from 'react-native';

/** 九星キャラクター画像 */
export const CHARACTER_IMAGES: Record<number, ImageSourcePropType> = {
  1: require('../../assets/characters/character_1.png'),
  2: require('../../assets/characters/character_2.png'),
  3: require('../../assets/characters/character_3.png'),
  4: require('../../assets/characters/character_4.png'),
  5: require('../../assets/characters/character_5.png'),
  6: require('../../assets/characters/character_6.png'),
  7: require('../../assets/characters/character_7.png'),
  8: require('../../assets/characters/character_8.png'),
  9: require('../../assets/characters/character_9.png'),
};

/** 九星番号からキャラクター画像を取得 */
export const getCharacterImage = (kyuseiNumber: number): ImageSourcePropType => {
  return CHARACTER_IMAGES[kyuseiNumber] || CHARACTER_IMAGES[1];
};
