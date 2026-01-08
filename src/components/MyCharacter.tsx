// マイキャラクター表示コンポーネント v1.1 (名前表示削除)
import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { useAppStore } from '../store/useAppStore';
import { getCharacterImage } from '../utils/characterImages';

/** 九星計算 */
const calculateKyusei = (birthYear: number): number => {
  const diff = birthYear - 1900;
  return ((10 - (diff % 9)) % 9) || 9;
};

interface Props { size?: number; }

export const MyCharacter: React.FC<Props> = ({ size = 50 }) => {
  const userProfile = useAppStore((s) => s.userConfig.userProfile);
  const birthDate = userProfile?.birthDate || '2000-01-01';
  const birthYear = new Date(birthDate).getFullYear();
  const kyusei = calculateKyusei(birthYear);

  return (
    <View style={s.container}>
      <Image source={getCharacterImage(kyusei)} style={{ width: size, height: size }} resizeMode="contain" />
    </View>
  );
};

const s = StyleSheet.create({
  container: { alignItems: 'center' },
});

export default MyCharacter;
