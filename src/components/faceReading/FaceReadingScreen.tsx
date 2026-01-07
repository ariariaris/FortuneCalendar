// Fortune Calendar 顔相占いメイン画面 v1.0
import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { ImagePickerButton } from '../common/ImagePickerButton';
import { AnalysisStatus, AnalysisState } from '../common/AnalysisStatus';
import { FaceResultView } from './FaceResultView';
import { analyzeFace, FaceReadingResult } from '../../services/faceAnalysisService';

export const FaceReadingScreen: React.FC = () => {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [status, setStatus] = useState<AnalysisState>('idle');
  const [result, setResult] = useState<FaceReadingResult | null>(null);
  const [error, setError] = useState<string>('');

  const handleImageSelected = async (uri: string) => {
    setImageUri(uri);
    setStatus('loading');
    setError('');

    try {
      const analysisResult = await analyzeFace(uri);
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
    return (
      <SafeAreaView style={s.container}>
        <View style={s.header}>
          <Text style={s.title}>顔相占い結果</Text>
          <Text style={s.resetBtn} onPress={handleRetry}>別の写真で占う</Text>
        </View>
        <FaceResultView result={result} />
      </SafeAreaView>
    );
  }

  // 入力・解析画面
  return (
    <SafeAreaView style={s.container}>
      <View style={s.content}>
        <Text style={s.title}>顔相占い</Text>
        <Text style={s.description}>
          顔写真から18種目の人相を診断します。{'\n'}
          正面を向いた明るい写真をお選びください。
        </Text>

        <ImagePickerButton
          onImageSelected={handleImageSelected}
          currentImage={imageUri}
          placeholder="顔写真を選択"
        />

        <AnalysisStatus
          status={status}
          error={error}
          onRetry={handleRetry}
        />

        <View style={s.tips}>
          <Text style={s.tipsTitle}>撮影のコツ</Text>
          <Text style={s.tipsText}>・正面を向いて撮影</Text>
          <Text style={s.tipsText}>・明るい場所で撮影</Text>
          <Text style={s.tipsText}>・髪で顔が隠れないように</Text>
          <Text style={s.tipsText}>・メガネは外して撮影推奨</Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f8f8' },
  content: { flex: 1, padding: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#eee' },
  title: { fontSize: 20, fontWeight: 'bold', color: '#FF69B4', textAlign: 'center', marginBottom: 8 },
  resetBtn: { fontSize: 14, color: '#FF69B4' },
  description: { fontSize: 14, color: '#666', textAlign: 'center', marginBottom: 24, lineHeight: 22 },
  tips: { backgroundColor: '#FFF5F8', borderRadius: 12, padding: 16, marginTop: 24 },
  tipsTitle: { fontSize: 14, fontWeight: 'bold', color: '#FF69B4', marginBottom: 8 },
  tipsText: { fontSize: 13, color: '#666', marginBottom: 4 },
});

export default FaceReadingScreen;
