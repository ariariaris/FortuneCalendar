// Fortune Calendar 手相占いメイン画面 v1.0
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, SafeAreaView } from 'react-native';
import { ImagePickerButton } from '../common/ImagePickerButton';
import { AnalysisStatus, AnalysisState } from '../common/AnalysisStatus';
import { analyzePalm, PalmReadingResult, LineResult } from '../../services/palmAnalysisService';

const LINE_LABELS: Record<string, string> = {
  lifeLine: '生命線',
  headLine: '知能線',
  heartLine: '感情線',
  fateLine: '運命線',
  sunLine: '太陽線',
  marriageLine: '結婚線',
};

const LineItem: React.FC<{ label: string; result: LineResult }> = ({ label, result }) => {
  const scoreColor = result.score >= 70 ? '#27ae60' : result.score >= 50 ? '#f39c12' : '#e74c3c';
  const lengthBar = result.length === 'long' ? '━━━━━━━━━' : result.length === 'medium' ? '━━━━━━' : '━━━';

  return (
    <View style={s.lineItem}>
      <View style={s.lineHeader}>
        <Text style={s.lineLabel}>{label}</Text>
        <Text style={[s.lineScore, { color: scoreColor }]}>{result.score}点</Text>
      </View>
      <Text style={s.lineBar}>{lengthBar} {result.length === 'long' ? '長い' : result.length === 'short' ? '短い' : '中程度'}</Text>
      <Text style={s.lineInterpretation}>{result.interpretation}</Text>
    </View>
  );
};

export const PalmReadingScreen: React.FC = () => {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [status, setStatus] = useState<AnalysisState>('idle');
  const [result, setResult] = useState<PalmReadingResult | null>(null);
  const [error, setError] = useState<string>('');

  const handleImageSelected = async (uri: string) => {
    setImageUri(uri);
    setStatus('loading');
    setError('');

    try {
      const analysisResult = await analyzePalm(uri, 'right');
      setResult(analysisResult);
      setStatus('success');
    } catch (e) {
      setError(e instanceof Error ? e.message : '解析に失敗しました');
      setStatus('error');
    }
  };

  const handleRetry = () => {
    setStatus('idle');
    setResult(null);
    setImageUri(null);
  };

  // 結果表示
  if (result && status === 'success') {
    const scoreColor = result.overallScore >= 70 ? '#27ae60' : result.overallScore >= 50 ? '#f39c12' : '#e74c3c';

    return (
      <SafeAreaView style={s.container}>
        <View style={s.header}>
          <Text style={s.title}>手相占い結果</Text>
          <Text style={s.resetBtn} onPress={handleRetry}>別の写真で占う</Text>
        </View>
        <ScrollView contentContainerStyle={s.content}>
          <View style={s.imageWrap}>
            <Image source={{ uri: result.imageUri }} style={s.image} />
          </View>

          <View style={s.overallWrap}>
            <Text style={s.overallLabel}>総合スコア</Text>
            <Text style={[s.overallScore, { color: scoreColor }]}>{result.overallScore}点</Text>
            <Text style={s.overallReading}>{result.overallReading}</Text>
          </View>

          <Text style={s.sectionTitle}>線別診断（6項目）</Text>
          {Object.entries(result.lines).map(([key, lineResult]) => (
            <LineItem key={key} label={LINE_LABELS[key]} result={lineResult} />
          ))}

          <Text style={s.timestamp}>解析日時: {result.analyzedAt.toLocaleString('ja-JP')}</Text>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // 入力・解析画面
  return (
    <SafeAreaView style={s.container}>
      <ScrollView contentContainerStyle={s.content}>
        <Text style={s.title}>手相AI</Text>
        <Text style={s.description}>
          手のひらの写真から7項目の手相を診断します。{'\n'}
          明るい場所で手のひらを開いて撮影してください。
        </Text>

        <ImagePickerButton
          onImageSelected={handleImageSelected}
          currentImage={imageUri}
          placeholder="手のひら写真を選択"
        />

        <AnalysisStatus status={status} error={error} onRetry={handleRetry} />

        <View style={s.tips}>
          <Text style={s.tipsTitle}>撮影のコツ</Text>
          <Text style={s.tipsText}>・明るい場所で撮影</Text>
          <Text style={s.tipsText}>・手のひらを平らに開く</Text>
          <Text style={s.tipsText}>・指先から手首まで入れる</Text>
          <Text style={s.tipsText}>・右手（利き手）推奨</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f8f8' },
  content: { padding: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#eee' },
  title: { fontSize: 20, fontWeight: 'bold', color: '#FF69B4', textAlign: 'center', marginBottom: 8 },
  resetBtn: { fontSize: 14, color: '#FF69B4' },
  description: { fontSize: 14, color: '#666', textAlign: 'center', marginBottom: 24, lineHeight: 22 },
  imageWrap: { alignItems: 'center', marginBottom: 16 },
  image: { width: 120, height: 120, borderRadius: 12, borderWidth: 2, borderColor: '#FF69B4' },
  overallWrap: { backgroundColor: '#fff', borderRadius: 12, padding: 20, alignItems: 'center', marginBottom: 16 },
  overallLabel: { fontSize: 14, color: '#999', marginBottom: 4 },
  overallScore: { fontSize: 48, fontWeight: 'bold' },
  overallReading: { fontSize: 14, color: '#333', textAlign: 'center', marginTop: 12, lineHeight: 22 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 12 },
  lineItem: { backgroundColor: '#fff', borderRadius: 8, padding: 12, marginBottom: 8 },
  lineHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  lineLabel: { fontSize: 14, fontWeight: '600', color: '#333' },
  lineScore: { fontSize: 14, fontWeight: 'bold' },
  lineBar: { fontSize: 12, color: '#FF69B4', marginBottom: 4 },
  lineInterpretation: { fontSize: 12, color: '#666', lineHeight: 18 },
  timestamp: { fontSize: 11, color: '#999', textAlign: 'center', marginTop: 16 },
  tips: { backgroundColor: '#FFF5F8', borderRadius: 12, padding: 16, marginTop: 24 },
  tipsTitle: { fontSize: 14, fontWeight: 'bold', color: '#FF69B4', marginBottom: 8 },
  tipsText: { fontSize: 13, color: '#666', marginBottom: 4 },
});

export default PalmReadingScreen;
