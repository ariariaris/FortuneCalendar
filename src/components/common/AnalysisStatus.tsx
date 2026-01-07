// Fortune Calendar 解析状態表示コンポーネント v1.0
import React from 'react';
import { View, Text, ActivityIndicator, TouchableOpacity, StyleSheet } from 'react-native';

export type AnalysisState = 'idle' | 'loading' | 'success' | 'error';

interface AnalysisStatusProps {
  status: AnalysisState;
  progress?: number;
  error?: string;
  onRetry?: () => void;
}

export const AnalysisStatus: React.FC<AnalysisStatusProps> = ({
  status,
  progress = 0,
  error,
  onRetry,
}) => {
  if (status === 'idle') return null;

  if (status === 'loading') {
    return (
      <View style={s.container}>
        <ActivityIndicator size="large" color="#FF69B4" />
        <Text style={s.loadingText}>解析中...</Text>
        {progress > 0 && (
          <View style={s.progressWrap}>
            <View style={[s.progressBar, { width: `${progress}%` }]} />
          </View>
        )}
        {progress > 0 && <Text style={s.progressText}>{progress}%</Text>}
      </View>
    );
  }

  if (status === 'error') {
    return (
      <View style={s.container}>
        <Text style={s.errorIcon}>⚠️</Text>
        <Text style={s.errorText}>{error || 'エラーが発生しました'}</Text>
        {onRetry && (
          <TouchableOpacity style={s.retryButton} onPress={onRetry}>
            <Text style={s.retryText}>再試行</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  if (status === 'success') {
    return (
      <View style={s.container}>
        <Text style={s.successIcon}>✅</Text>
        <Text style={s.successText}>解析完了</Text>
      </View>
    );
  }

  return null;
};

const s = StyleSheet.create({
  container: { alignItems: 'center', padding: 24, backgroundColor: '#fff', borderRadius: 12, marginVertical: 16 },
  loadingText: { marginTop: 12, fontSize: 16, color: '#666' },
  progressWrap: { width: '80%', height: 8, backgroundColor: '#eee', borderRadius: 4, marginTop: 12, overflow: 'hidden' },
  progressBar: { height: '100%', backgroundColor: '#FF69B4', borderRadius: 4 },
  progressText: { marginTop: 8, fontSize: 14, color: '#FF69B4', fontWeight: '600' },
  errorIcon: { fontSize: 48, marginBottom: 8 },
  errorText: { fontSize: 14, color: '#e74c3c', textAlign: 'center', marginBottom: 12 },
  retryButton: { paddingHorizontal: 24, paddingVertical: 10, backgroundColor: '#FF69B4', borderRadius: 8 },
  retryText: { color: '#fff', fontWeight: '600' },
  successIcon: { fontSize: 48, marginBottom: 8 },
  successText: { fontSize: 16, color: '#27ae60', fontWeight: '600' },
});

export default AnalysisStatus;
