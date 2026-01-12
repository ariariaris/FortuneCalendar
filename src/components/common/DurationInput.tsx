// Fortune Calendar 期間入力コンポーネント v2.2 (シンプル化・Web統一)
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet, ScrollView } from 'react-native';
import { DurationConfig, DurationUnit } from '../../types/goalManagement';

const VALUE_PRESETS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 15, 20, 30];
const UNITS: { key: DurationUnit; label: string }[] = [
  { key: 'year', label: '年' },
  { key: 'month', label: 'ヶ月' },
  { key: 'week', label: '週間' },
];

interface Props {
  label?: string;
  value: DurationConfig;
  onChange: (config: DurationConfig) => void;
  accentColor?: string;
}

export const DurationInput: React.FC<Props> = ({ label, value, onChange, accentColor = '#FF69B4' }) => {
  // デフォルト値を設定（確実にfallback）
  const safeValue = (value && typeof value.value === 'number') ? value.value : 1;
  const safeUnit: DurationUnit = (value && value.unit) ? value.unit : 'year';

  const [showPicker, setShowPicker] = useState(false);
  const [tempValue, setTempValue] = useState(safeValue);
  const [tempUnit, setTempUnit] = useState<DurationUnit>(safeUnit);

  // prop変更時に同期
  useEffect(() => {
    const newValue = (value && typeof value.value === 'number') ? value.value : 1;
    const newUnit: DurationUnit = (value && value.unit) ? value.unit : 'year';
    setTempValue(newValue);
    setTempUnit(newUnit);
  }, [value]);

  const unitLabel = UNITS.find(u => u.key === safeUnit)?.label || '年';
  const displayText = `${safeValue}${unitLabel}後`;

  const handleConfirm = () => {
    onChange({ value: tempValue, unit: tempUnit });
    setShowPicker(false);
  };

  const handleCancel = () => {
    setTempValue(safeValue);
    setTempUnit(safeUnit);
    setShowPicker(false);
  };

  const openPicker = () => {
    setTempValue(safeValue);
    setTempUnit(safeUnit);
    setShowPicker(true);
  };

  // 全プラットフォーム共通のピッカー（シンプルで確実に動作）
  const renderPicker = () => (
    <Modal visible={showPicker} transparent animationType="fade" onRequestClose={handleCancel}>
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={handleCancel} />
        <View style={styles.pickerContent}>
          <Text style={styles.title}>期間を選択</Text>
          <View style={styles.pickerRow}>
            <ScrollView style={styles.pickerColumn}>
              {VALUE_PRESETS.map(v => (
                <TouchableOpacity key={v} style={[styles.pickerItem, tempValue === v && { backgroundColor: accentColor }]} onPress={() => setTempValue(v)}>
                  <Text style={[styles.pickerItemText, tempValue === v && styles.pickerItemTextActive]}>{v}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <ScrollView style={styles.pickerColumn}>
              {UNITS.map(u => (
                <TouchableOpacity key={u.key} style={[styles.pickerItem, tempUnit === u.key && { backgroundColor: accentColor }]} onPress={() => setTempUnit(u.key)}>
                  <Text style={[styles.pickerItemText, tempUnit === u.key && styles.pickerItemTextActive]}>{u.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
          <View style={styles.pickerActions}>
            <TouchableOpacity style={styles.cancelBtn} onPress={handleCancel}>
              <Text style={styles.cancelBtnText}>キャンセル</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.confirmBtn, { backgroundColor: accentColor }]} onPress={handleConfirm}>
              <Text style={styles.confirmBtnText}>完了</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TouchableOpacity style={[styles.button, { borderColor: accentColor }]} onPress={openPicker} activeOpacity={0.7}>
        <Text style={[styles.buttonText, { color: accentColor }]}>{displayText}</Text>
        <Text style={styles.arrow}>▼</Text>
      </TouchableOpacity>
      {renderPicker()}
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
  title: { fontSize: 16, fontWeight: '600', color: '#333', marginBottom: 12, textAlign: 'center' },
  // ピッカー
  pickerContent: { backgroundColor: '#fff', borderRadius: 12, padding: 16, width: '85%', maxWidth: 320 },
  pickerRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  pickerColumn: { flex: 1, maxHeight: 200 },
  pickerItem: { paddingVertical: 10, paddingHorizontal: 12, borderRadius: 8, backgroundColor: '#f5f5f5', marginBottom: 6, alignItems: 'center' },
  pickerItemText: { fontSize: 15, color: '#333' },
  pickerItemTextActive: { color: '#fff', fontWeight: '600' },
  pickerActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12 },
  cancelBtn: { paddingHorizontal: 20, paddingVertical: 10, backgroundColor: '#eee', borderRadius: 8 },
  cancelBtnText: { color: '#666', fontSize: 14 },
  confirmBtn: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 },
  confirmBtnText: { color: '#fff', fontSize: 14, fontWeight: '600' },
});
