// Fortune Calendar 六角形チャート v1.0
import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import Svg, { Polygon, Line, Text as SvgText } from 'react-native-svg';
import { FortuneScores } from '../config/types';
import { DEFAULT_DEV_CONFIG } from '../config/defaultConfig';

interface Props {
  scores: FortuneScores;
  size?: number;
  animated?: boolean;
}

const AXIS_KEYS: (keyof FortuneScores)[] = ['love', 'work', 'money', 'health', 'social', 'total'];

export const HexChart: React.FC<Props> = ({ scores, size = 200, animated = true }) => {
  const animValue = useRef(new Animated.Value(0)).current;
  const axes = DEFAULT_DEV_CONFIG.ui.chartAxes;
  const center = size / 2;
  const radius = size * 0.35;

  useEffect(() => {
    if (animated) {
      animValue.setValue(0);
      Animated.timing(animValue, { toValue: 1, duration: 800, useNativeDriver: false }).start();
    } else {
      animValue.setValue(1);
    }
  }, [scores, animated]);

  // 六角形の頂点を計算（上から時計回り）
  const getPoint = (index: number, value: number) => {
    const angle = (Math.PI * 2 * index) / 6 - Math.PI / 2;
    const r = (value / 100) * radius;
    return { x: center + r * Math.cos(angle), y: center + r * Math.sin(angle) };
  };

  // 外枠の頂点
  const outerPoints = Array.from({ length: 6 }, (_, i) => getPoint(i, 100));
  const outerPath = outerPoints.map((p) => `${p.x},${p.y}`).join(' ');

  // スコアの頂点
  const scorePoints = AXIS_KEYS.map((key, i) => getPoint(i, scores[key]));
  const scorePath = scorePoints.map((p) => `${p.x},${p.y}`).join(' ');

  // ラベル位置
  const labelPoints = Array.from({ length: 6 }, (_, i) => {
    const angle = (Math.PI * 2 * i) / 6 - Math.PI / 2;
    const r = radius + 24;
    return { x: center + r * Math.cos(angle), y: center + r * Math.sin(angle) };
  });

  return (
    <View style={[s.container, { width: size, height: size }]}>
      <Svg width={size} height={size}>
        {/* 外枠 */}
        <Polygon points={outerPath} fill="none" stroke="#ddd" strokeWidth={1} />
        {/* 軸線 */}
        {outerPoints.map((p, i) => (
          <Line key={i} x1={center} y1={center} x2={p.x} y2={p.y} stroke="#eee" strokeWidth={1} />
        ))}
        {/* スコア領域 */}
        <Polygon points={scorePath} fill="rgba(255,105,180,0.3)" stroke="#FF69B4" strokeWidth={2} />
        {/* ラベル */}
        {labelPoints.map((p, i) => (
          <SvgText key={i} x={p.x} y={p.y} fontSize={11} fill="#666" textAnchor="middle" dy={4}>
            {axes[i]}
          </SvgText>
        ))}
      </Svg>
      {/* スコア表示 */}
      {scorePoints.map((p, i) => (
        <View key={i} style={[s.score, { left: p.x - 12, top: p.y - 10 }]}>
          <Text style={s.scoreText}>{scores[AXIS_KEYS[i]]}</Text>
        </View>
      ))}
    </View>
  );
};

const s = StyleSheet.create({
  container: { position: 'relative' },
  score: { position: 'absolute', backgroundColor: '#fff', borderRadius: 4, paddingHorizontal: 4 },
  scoreText: { fontSize: 10, fontWeight: 'bold', color: '#FF69B4' },
});

export default HexChart;
