// Fortune Calendar 期間入力コンポーネント v3.0 (1-10ボタン+その他入力)
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet, TextInput } from 'react-native';
import { DurationConfig, DurationUnit } from '../../types/goalManagement';

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
  const safeValue = (value && typeof value.value === 'number') ? value.value : 1;
  const safeUnit: DurationUnit = (value && value.unit) ? value.unit : 'year';

  const [showPicker, setShowPicker] = useState(false);
  const [tempValue, setTempValue] = useState(safeValue);
  const [tempUnit, setTempUnit] = useState<DurationUnit>(safeUnit);
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customValue, setCustomValue] = useState('');

  const numberButtons = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  useEffect(() => {
    const newValue = (value && typeof value.value === 'number') ? value.value : 1;
    const newUnit: DurationUnit = (value && value.unit) ? value.unit : 'year';
    setTempValue(newValue);
    setTempUnit(newUnit);
  }, [value]);

  const unitLabel = UNITS.find(u => u.key === safeUnit)?.label || '年';
  const displayText = `${safeValue}${unitLabel}後`;

  const handleSelectNumber = (num: number) => {
    setTempValue(num);
    setShowCustomInput(false);
    setCustomValue('');
  };

  const handleCustomToggle = () => {
    setShowCustomInput(true);
    setCustomValue(tempValue > 10 ? String(tempValue) : '');
  };

  const handleCustomChange = (text: string) => {
    const num = text.replace(/[^0-9]/g, '');
    setCustomValue(num);
    if (num) setTempValue(parseInt(num, 10));
  };

  const handleConfirm = () => {
    const finalValue = showCustomInput && customValue ? parseInt(customValue, 10) : tempValue;
    if (!finalValue || finalValue < 1) return;
    onChange({ value: finalValue, unit: tempUnit });
    setShowPicker(false);
  };

  const handleCancel = () => {
    setTempValue(safeValue);
    setTempUnit(safeUnit);
    setShowCustomInput(safeValue > 10);
    setCustomValue(safeValue > 10 ? String(safeValue) : '');
    setShowPicker(false);
  };

  const openPicker = () => {
    setTempValue(safeValue);
    setTempUnit(safeUnit);
    if (safeValue > 10) {
      setShowCustomInput(true);
      setCustomValue(String(safeValue));
    } else {
      setShowCustomInput(false);
      setCustomValue('');
    }
    setShowPicker(true);
  };

  const renderPicker = () => (
    <Modal visible={showPicker} transparent animationType="fade" onRequestClose={handleCancel}>
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={handleCancel} />
        <View style={styles.content}>
          <Text style={styles.title}>期間を選択</Text>

          {/* 数値選択: 1-10 + その他 */}
          <Text style={styles.sectionLabel}>数値</Text>
          <View style={styles.numberRow}>
            {numberButtons.map(num => (
              <TouchableOpacity
                key={num}
                style={[styles.numBtn, !showCustomInput && tempValue === num && { backgroundColor: accentColor }]}
                onPress={() => handleSelectNumber(num)}
              >
                <Text style={[styles.numBtnText, !showCustomInput && tempValue === num && styles.numBtnTextActive]}>{num}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={[styles.otherBtn, showCustomInput && { backgroundColor: accentColor }]}
              onPress={handleCustomToggle}
            >
              <Text style={[styles.otherBtnText, showCustomInput && styles.numBtnTextActive]}>他</Text>
            </TouchableOpacity>
          </View>

          {/* その他入力欄 */}
          {showCustomInput && (
            <TextInput
              style={styles.customInput}
              placeholder="数値を入力"
              keyboardType="number-pad"
              value={customValue}
              onChangeText={handleCustomChange}
              autoFocus
            />
          )}

          {/* 単位選択 */}
          <Text style={styles.sectionLabel}>単位</Text>
          <View style={styles.unitRow}>
            {UNITS.map(u => (
              <TouchableOpacity
                key={u.key}
                style={[styles.unitBtn, tempUnit === u.key && { backgroundColor: accentColor }]}
                onPress={() => setTempUnit(u.key)}
              >
                <Text style={[styles.unitBtnText, tempUnit === u.key && styles.unitBtnTextActive]}>{u.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* アクションボタン */}
          <View style={styles.actions}>
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
  content: { backgroundColor: '#fff', borderRadius: 12, padding: 20, width: '90%', maxWidth: 360 },
  title: { fontSize: 18, fontWeight: '600', color: '#333', marginBottom: 16, textAlign: 'center' },
  sectionLabel: { fontSize: 13, color: '#666', marginBottom: 8 },
  numberRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 12 },
  numBtn: { width: 36, height: 36, borderRadius: 8, backgroundColor: '#f0f0f0', alignItems: 'center', justifyContent: 'center' },
  numBtnText: { fontSize: 15, color: '#333', fontWeight: '500' },
  numBtnTextActive: { color: '#fff', fontWeight: '700' },
  otherBtn: { width: 36, height: 36, borderRadius: 8, backgroundColor: '#e0e0e0', alignItems: 'center', justifyContent: 'center' },
  otherBtnText: { fontSize: 13, color: '#666', fontWeight: '500' },
  customInput: { backgroundColor: '#f5f5f5', borderRadius: 8, padding: 12, marginBottom: 12, fontSize: 16, textAlign: 'center' },
  unitRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  unitBtn: { flex: 1, paddingVertical: 10, borderRadius: 8, backgroundColor: '#f0f0f0', alignItems: 'center' },
  unitBtnText: { fontSize: 14, color: '#333', fontWeight: '500' },
  unitBtnTextActive: { color: '#fff', fontWeight: '700' },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12 },
  cancelBtn: { paddingHorizontal: 20, paddingVertical: 10, backgroundColor: '#eee', borderRadius: 8 },
  cancelBtnText: { color: '#666', fontSize: 14 },
  confirmBtn: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 },
  confirmBtnText: { color: '#fff', fontSize: 14, fontWeight: '600' },
});
