// Fortune Calendar スプラッシュスクリーン v1.0
import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Image, Dimensions } from 'react-native';
import { CHARACTER_IMAGES } from '../utils/characterImages';

const { width } = Dimensions.get('window');
const CENTER = width / 2;
const RADIUS = width * 0.38;

/** キャラクター配置（円形） */
const getPosition = (index: number, total: number) => {
  const angle = (index / total) * Math.PI * 2 - Math.PI / 2;
  return { x: Math.cos(angle) * RADIUS, y: Math.sin(angle) * RADIUS };
};

interface Props { onFinish: () => void; }

export const SplashScreen: React.FC<Props> = ({ onFinish }) => {
  const fadeAnims = useRef([...Array(9)].map(() => new Animated.Value(0))).current;
  const logoAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // キャラを順番にフェードイン（ゆっくり）
    const charAnimations = fadeAnims.map((anim, i) =>
      Animated.timing(anim, { toValue: 1, duration: 300, delay: i * 150, useNativeDriver: true })
    );
    // ロゴフェードイン
    const logoAnimation = Animated.timing(logoAnim, { toValue: 1, duration: 600, useNativeDriver: true });

    Animated.sequence([
      Animated.stagger(120, charAnimations),
      logoAnimation,
      Animated.delay(1000),
    ]).start(() => onFinish());
  }, []);

  return (
    <View style={s.container}>
      {/* 9キャラクター */}
      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num, i) => {
        const pos = getPosition(i, 9);
        return (
          <Animated.Image
            key={num}
            source={CHARACTER_IMAGES[num]}
            style={[s.character, { opacity: fadeAnims[i], transform: [{ translateX: pos.x }, { translateY: pos.y }] }]}
            resizeMode="contain"
          />
        );
      })}
      {/* ロゴ */}
      <Animated.View style={[s.logoWrap, { opacity: logoAnim }]}>
        <Text style={s.title}>Fortune</Text>
        <Text style={s.subtitle}>Calendar</Text>
      </Animated.View>
    </View>
  );
};

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF5F8', alignItems: 'center', justifyContent: 'center' },
  character: { position: 'absolute', width: 110, height: 110 },
  logoWrap: { alignItems: 'center' },
  title: { fontSize: 32, fontWeight: 'bold', color: '#FF69B4' },
  subtitle: { fontSize: 24, fontWeight: '600', color: '#FF69B4', marginTop: -4 },
});

export default SplashScreen;
