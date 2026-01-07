// Fortune Calendar 顔相結果表示コンポーネント v1.0
import React from 'react';
import { View, Text, Image, ScrollView, StyleSheet } from 'react-native';
import { FaceReadingResult } from '../../services/faceAnalysisService';
import { FeatureItem } from './FeatureItem';

interface FaceResultViewProps {
  result: FaceReadingResult;
}

const FEATURE_ORDER = [
  'faceShape', 'forehead', 'eyebrows', 'eyes', 'eyeCorners', 'tearTrough',
  'nose', 'mouth', 'cheeks', 'chin', 'ears', 'nasolabialFolds',
  'philtrum', 'glabella', 'skinQuality', 'symmetry',
];

export const FaceResultView: React.FC<FaceResultViewProps> = ({ result }) => {
  const scoreColor = result.overallScore >= 70 ? '#27ae60' : result.overallScore >= 50 ? '#f39c12' : '#e74c3c';

  return (
    <ScrollView style={s.container} contentContainerStyle={s.content}>
      {/* 画像プレビュー */}
      <View style={s.imageWrap}>
        <Image source={{ uri: result.imageUri }} style={s.image} />
      </View>

      {/* 総合スコア */}
      <View style={s.overallWrap}>
        <Text style={s.overallLabel}>総合スコア</Text>
        <Text style={[s.overallScore, { color: scoreColor }]}>{result.overallScore}点</Text>
        <Text style={s.overallReading}>{result.overallReading}</Text>
      </View>

      {/* 詳細結果 */}
      <Text style={s.sectionTitle}>詳細診断（16部位）</Text>
      {FEATURE_ORDER.map((key) => {
        const featureResult = result.features[key as keyof typeof result.features];
        if (!featureResult) return null;
        return <FeatureItem key={key} label={key} result={featureResult} />;
      })}

      {/* 解析日時 */}
      <Text style={s.timestamp}>
        解析日時: {result.analyzedAt.toLocaleString('ja-JP')}
      </Text>
    </ScrollView>
  );
};

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f8f8' },
  content: { padding: 16 },
  imageWrap: { alignItems: 'center', marginBottom: 16 },
  image: { width: 150, height: 150, borderRadius: 75, borderWidth: 3, borderColor: '#FF69B4' },
  overallWrap: { backgroundColor: '#fff', borderRadius: 12, padding: 20, alignItems: 'center', marginBottom: 16 },
  overallLabel: { fontSize: 14, color: '#999', marginBottom: 4 },
  overallScore: { fontSize: 48, fontWeight: 'bold' },
  overallReading: { fontSize: 14, color: '#333', textAlign: 'center', marginTop: 12, lineHeight: 22 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 12 },
  timestamp: { fontSize: 11, color: '#999', textAlign: 'center', marginTop: 16 },
});

export default FaceResultView;
