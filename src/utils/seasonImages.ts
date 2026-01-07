// 月別風物詩イラスト v1.0
import { ImageSourcePropType } from 'react-native';

export const SEASON_IMAGES: Record<number, ImageSourcePropType> = {
  1: require('../../assets/seasons/month_01.png'),   // 門松
  2: require('../../assets/seasons/month_02.png'),   // 豆まき
  3: require('../../assets/seasons/month_03.png'),   // ひな祭り
  4: require('../../assets/seasons/month_04.png'),   // お花見
  5: require('../../assets/seasons/month_05.png'),   // こいのぼり
  6: require('../../assets/seasons/month_06.png'),   // 紫陽花
  7: require('../../assets/seasons/month_07.png'),   // 七夕
  8: require('../../assets/seasons/month_08.png'),   // 花火
  9: require('../../assets/seasons/month_09.png'),   // お月見
  10: require('../../assets/seasons/month_10.png'),  // 紅葉
  11: require('../../assets/seasons/month_11.png'),  // 七五三
  12: require('../../assets/seasons/month_12.png'),  // クリスマス
};

/** 月番号(1-12)から風物詩画像を取得 */
export const getSeasonImage = (month: number): ImageSourcePropType => {
  return SEASON_IMAGES[month] || SEASON_IMAGES[1];
};
