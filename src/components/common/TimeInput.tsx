// Fortune Calendar 時間入力コンポーネント v2.0 (ネイティブ風Picker)
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet, Platform, ScrollView } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { TimeUnit } from '../../types/goalManagement';

const MINUTE_VALUES = [5, 10, 15, 20, 30, 45, 60, 90, 120, 180, 240, 300, 360];
const HOUR_VALUES = [1, 2, 3, 4, 5, 6, 8, 10, 12, 24];

interface Props {
  label?: string;
  minutes: number;
  onChange: (minutes: number) => void;
  accentColor?: string;
}

export const TimeInput: React.FC<Props> = ({ label, minutes, onChange, accentColor = '#2196F3' }) => {
  const [showPicker, setShowPicker] = useState(false);
  const [tempMinutes, setTempMinutes] = useState(minutes);

  // 表示用フォーマット
  const formatDisplay = (m: number): string => {
    if (m >= 60 && m % 60 === 0) return `${m / 60}時間`;
    if (m >= 60) return `${Math.floor(m / 60)}時間${m % 60}分`;
    return `${m}分`;
  };

  const handleConfirm = () => {
    onChange(tempMinutes);
    setShowPicker(false);
  };

  const handleCancel = () => {
    setTempMinutes(minutes);
    setShowPicker(false);
  };

  // Web用のカスタムピッカー
  const renderWebPicker = () => (
    <Modal visible={showPicker} transparent animationType="fade" onRequestClose={handleCancel}>
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.backdrop} onPress={handleCancel} />
        <View style={styles.webContent}>
          <Text style={styles.title}>所要時間を選択</Text>
          <ScrollView style={styles.webList}>
            {[...MINUTE_VALUES, ...HOUR_VALUES.map(h => h * 60)].sort((a, b) => a - b).filter((v, i, arr) => arr.indexOf(v) === i).map(v => (
              <TouchableOpacity key={v} style={[styles.webItem, tempMinutes === v && { backgroundColor: accentColor }]} onPress={() => { onChange(v); setShowPicker(false); }}>
                <Text style={[styles.webItemText, tempMinutes === v && styles.webItemTextActive]}>{formatDisplay(v)}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <TouchableOpacity style={styles.closeBtn} onPress={handleCancel}>
            <Text style={styles.closeBtnText}>閉じる</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  // iOS用のアクションシート風ピッカー
  const renderIOSPicker = () => (
    <Modal visible={showPicker} transparent animationType="slide" onRequestClose={handleCancel}>
      <View style={styles.iosOverlay}>
        <TouchableOpacity style={styles.backdrop} onPress={handleCancel} />
        <View style={styles.iosContent}>
          <View style={styles.iosHeader}>
            <TouchableOpacity onPress={handleCancel}>
              <Text style={styles.cancelText}>キャンセル</Text>
            </TouchableOpacity>
            <Text style={styles.title}>所要時間</Text>
            <TouchableOpacity onPress={handleConfirm}>
              <Text style={[styles.doneText, { color: accentColor }]}>完了</Text>
            </TouchableOpacity>
          </View>
          <Picker selectedValue={tempMinutes} onValueChange={setTempMinutes} style={styles.picker}>
            {[5, 10, 15, 20, 30, 45].map(v => <Picker.Item key={v} label={`${v}分`} value={v} />)}
            {[1, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10, 12].map(h => <Picker.Item key={h * 60} label={h % 1 === 0 ? `${h}時間` : `${Math.floor(h)}時間${(h % 1) * 60}分`} value={h * 60} />)}
          </Picker>
        </View>
      </View>
    </Modal>
  );

  // Android用のダイアログ風ピッカー
  const renderAndroidPicker = () => (
    <Modal visible={showPicker} transparent animationType="fade" onRequestClose={handleCancel}>
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.backdrop} onPress={handleCancel} />
        <View style={styles.androidContent}>
          <Text style={styles.androidTitle}>所要時間を選択</Text>
          <Picker selectedValue={tempMinutes} onValueChange={(v) => { onChange(v); setShowPicker(false); }} style={styles.androidPicker}>
            {[5, 10, 15, 20, 30, 45].map(v => <Picker.Item key={v} label={`${v}分`} value={v} />)}
            {[1, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10, 12].map(h => <Picker.Item key={h * 60} label={h % 1 === 0 ? `${h}時間` : `${Math.floor(h)}時間${(h % 1) * 60}分`} value={h * 60} />)}
          </Picker>
          <View style={styles.androidActions}>
            <TouchableOpacity onPress={handleCancel} style={styles.androidBtn}>
              <Text style={styles.cancelText}>キャンセル</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TouchableOpacity style={[styles.button, { borderColor: accentColor }]} onPress={() => { setTempMinutes(minutes); setShowPicker(true); }}>
        <Text style={[styles.buttonText, { color: accentColor }]}>{formatDisplay(minutes)}</Text>
        <Text style={styles.arrow}>▼</Text>
      </TouchableOpacity>
      {Platform.OS === 'web' && renderWebPicker()}
      {Platform.OS === 'ios' && renderIOSPicker()}
      {Platform.OS === 'android' && renderAndroidPicker()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginBottom: 12 },
  label: { fontSize: 13, color: '#666', marginBottom: 6 },
  button: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 2, borderRadius: 8, paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#fff' },
  buttonText: { fontSize: 16, fontWeight: '600' },
  arrow: { fontSize: 12, color: '#999' },
  overlay: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  backdrop: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.4)' },
  iosOverlay: { flex: 1, justifyContent: 'flex-end' },
  iosContent: { backgroundColor: '#fff', borderTopLeftRadius: 16, borderTopRightRadius: 16, paddingBottom: 20 },
  iosHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#eee' },
  title: { fontSize: 16, fontWeight: '600', color: '#333' },
  cancelText: { fontSize: 16, color: '#666' },
  doneText: { fontSize: 16, fontWeight: '600' },
  picker: { height: 200 },
  androidContent: { backgroundColor: '#fff', borderRadius: 12, padding: 16, width: '80%', maxWidth: 300 },
  androidTitle: { fontSize: 18, fontWeight: '600', color: '#333', marginBottom: 8, textAlign: 'center' },
  androidPicker: { height: 150 },
  androidActions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 8 },
  androidBtn: { paddingHorizontal: 16, paddingVertical: 8 },
  webContent: { backgroundColor: '#fff', borderRadius: 12, padding: 16, width: '80%', maxWidth: 280 },
  webList: { maxHeight: 250 },
  webItem: { paddingVertical: 12, paddingHorizontal: 16, borderRadius: 8, backgroundColor: '#f5f5f5', marginBottom: 6, alignItems: 'center' },
  webItemText: { fontSize: 16, color: '#333' },
  webItemTextActive: { color: '#fff', fontWeight: '600' },
  closeBtn: { marginTop: 12, paddingVertical: 10, backgroundColor: '#eee', borderRadius: 8, alignItems: 'center' },
  closeBtnText: { color: '#666', fontSize: 14 },
});
