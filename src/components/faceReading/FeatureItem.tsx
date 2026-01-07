// Fortune Calendar 顔相部位結果コンポーネント v1.0
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { FeatureResult } from '../../services/faceAnalysisService';

interface FeatureItemProps {
  label: string;
  result: FeatureResult;
}

const FEATURE_LABELS: Record<string, string> = {
  forehead: '額',
  eyebrows: '眉',
  eyes: '目',
  nose: '鼻',
  mouth: '口',
  ears: '耳',
  chin: '顎',
  cheeks: '頬',
  nasolabialFolds: '法令線',
  philtrum: '人中',
  glabella: '眉間',
  eyeCorners: '目尻',
  tearTrough: '涙袋',
  faceShape: '輪郭',
  skinQuality: '肌質',
  symmetry: '左右対称',
};

export const FeatureItem: React.FC<FeatureItemProps> = ({ label, result }) => {
  const displayLabel = FEATURE_LABELS[label] || label;
  const scoreColor = result.score >= 70 ? '#27ae60' : result.score >= 50 ? '#f39c12' : '#e74c3c';

  return (
    <View style={s.container}>
      <View style={s.header}>
        <Text style={s.label}>{displayLabel}</Text>
        <Text style={[s.score, { color: scoreColor }]}>{result.score}点</Text>
      </View>
      <Text style={s.value}>{result.value}</Text>
      <Text style={s.interpretation}>{result.interpretation}</Text>
    </View>
  );
};

const s = StyleSheet.create({
  container: { backgroundColor: '#fff', borderRadius: 8, padding: 12, marginBottom: 8 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  label: { fontSize: 14, fontWeight: '600', color: '#333' },
  score: { fontSize: 14, fontWeight: 'bold' },
  value: { fontSize: 13, color: '#FF69B4', marginBottom: 4 },
  interpretation: { fontSize: 12, color: '#666', lineHeight: 18 },
});

export default FeatureItem;
