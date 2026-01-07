// マイキャラクター表示コンポーネント v1.0
import React from 'react';
import { View, Image, Text, StyleSheet } from 'react-native';
import { useAppStore } from '../store/useAppStore';
import { getCharacterImage } from '../utils/characterImages';

/** 九星計算 */
const calculateKyusei = (birthYear: number): number => {
  const diff = birthYear - 1900;
  return ((10 - (diff % 9)) % 9) || 9;
};

/** 九星名 */
const KYUSEI_NAMES: Record<number, string> = {
  1: '一白水星', 2: '二黒土星', 3: '三碧木星', 4: '四緑木星', 5: '五黄土星',
  6: '六白金星', 7: '七赤金星', 8: '八白土星', 9: '九紫火星',
};

interface Props { size?: number; showName?: boolean; }

export const MyCharacter: React.FC<Props> = ({ size = 50, showName = false }) => {
  const userProfile = useAppStore((s) => s.userConfig.userProfile);
  const birthDate = userProfile?.birthDate || '2000-01-01';
  const birthYear = new Date(birthDate).getFullYear();
  const kyusei = calculateKyusei(birthYear);

  return (
    <View style={s.container}>
      <Image source={getCharacterImage(kyusei)} style={{ width: size, height: size }} resizeMode="contain" />
      {showName && <Text style={s.name}>{KYUSEI_NAMES[kyusei]}</Text>}
    </View>
  );
};

const s = StyleSheet.create({
  container: { alignItems: 'center' },
  name: { fontSize: 10, color: '#666', marginTop: 2 },
});

export default MyCharacter;
