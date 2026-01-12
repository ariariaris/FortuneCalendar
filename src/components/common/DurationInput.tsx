// Fortune Calendar 期間入力コンポーネント v1.1
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, StyleSheet, ScrollView } from 'react-native';
import { DurationConfig, DurationUnit } from '../../types/goalManagement';

const VALUE_PRESETS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 15, 20, 30];
const UNITS: { key: DurationUnit; label: string }[] = [
  { key: 'year', label: '年' },
  { key: 'month', label: '月' },
  { key: 'week', label: '週' },
];

interface Props {
  label?: string;
  value: DurationConfig;
  onChange: (config: DurationConfig) => void;
  accentColor?: string;
}

export const DurationInput: React.FC<Props> = ({ label, value, onChange, accentColor = '#FF69B4' }) => {
  const [showValuePicker, setShowValuePicker] = useState(false);
  const [showUnitPicker, setShowUnitPicker] = useState(false);
  const [inputText, setInputText] = useState(String(value.value));

  // value propが変わったらinputTextを同期
  useEffect(() => {
    setInputText(String(value.value));
  }, [value.value]);

  const handleValueChange = (text: string) => {
    setInputText(text);
    const num = parseInt(text, 10);
    if (!isNaN(num) && num > 0 && num <= 99) {
      onChange({ ...value, value: num });
    }
  };

  const handleValueSelect = (num: number) => {
    setInputText(String(num));
    onChange({ ...value, value: num });
    setShowValuePicker(false);
  };

  const handleUnitSelect = (unit: DurationUnit) => {
    onChange({ ...value, unit });
    setShowUnitPicker(false);
  };

  const unitLabel = UNITS.find(u => u.key === value.unit)?.label || '年';

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={styles.row}>
        {/* 数値入力 */}
        <View style={styles.valueContainer}>
          <TextInput
            style={[styles.valueInput, { borderColor: accentColor }]}
            value={inputText}
            onChangeText={handleValueChange}
            keyboardType="number-pad"
            maxLength={2}
          />
          <TouchableOpacity style={[styles.pickerBtn, { backgroundColor: accentColor }]} onPress={() => setShowValuePicker(true)}>
            <Text style={styles.pickerBtnText}>▼</Text>
          </TouchableOpacity>
        </View>

        {/* 単位セレクター */}
        <TouchableOpacity style={[styles.unitBtn, { borderColor: accentColor }]} onPress={() => setShowUnitPicker(true)}>
          <Text style={[styles.unitText, { color: accentColor }]}>{unitLabel}</Text>
          <Text style={styles.unitArrow}>▼</Text>
        </TouchableOpacity>

        <Text style={styles.suffix}>後</Text>
      </View>

      {/* 数値ピッカーモーダル */}
      <Modal visible={showValuePicker} transparent animationType="fade" onRequestClose={() => setShowValuePicker(false)}>
        <View style={styles.overlay}>
          <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={() => setShowValuePicker(false)} />
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>数値を選択</Text>
            <ScrollView style={styles.optionList} contentContainerStyle={styles.optionGrid}>
              {VALUE_PRESETS.map(num => (
                <TouchableOpacity key={num} style={[styles.optionItem, value.value === num && { backgroundColor: accentColor }]} onPress={() => handleValueSelect(num)}>
                  <Text style={[styles.optionText, value.value === num && styles.optionTextActive]}>{num}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity style={styles.closeBtn} onPress={() => setShowValuePicker(false)}>
              <Text style={styles.closeBtnText}>閉じる</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* 単位ピッカーモーダル */}
      <Modal visible={showUnitPicker} transparent animationType="fade" onRequestClose={() => setShowUnitPicker(false)}>
        <View style={styles.overlay}>
          <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={() => setShowUnitPicker(false)} />
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>単位を選択</Text>
            {UNITS.map(u => (
              <TouchableOpacity key={u.key} style={[styles.unitOption, value.unit === u.key && { backgroundColor: accentColor }]} onPress={() => handleUnitSelect(u.key)}>
                <Text style={[styles.unitOptionText, value.unit === u.key && styles.optionTextActive]}>{u.label}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={styles.closeBtn} onPress={() => setShowUnitPicker(false)}>
              <Text style={styles.closeBtnText}>閉じる</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginBottom: 12 },
  label: { fontSize: 13, color: '#666', marginBottom: 6 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  valueContainer: { flexDirection: 'row', alignItems: 'center' },
  valueInput: { width: 50, borderWidth: 2, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 8, fontSize: 16, textAlign: 'center', backgroundColor: '#fff' },
  pickerBtn: { marginLeft: 4, paddingHorizontal: 8, paddingVertical: 10, borderRadius: 6 },
  pickerBtnText: { color: '#fff', fontSize: 10 },
  unitBtn: { flexDirection: 'row', alignItems: 'center', borderWidth: 2, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8, backgroundColor: '#fff' },
  unitText: { fontSize: 16, fontWeight: '600', marginRight: 4 },
  unitArrow: { fontSize: 10, color: '#999' },
  suffix: { fontSize: 14, color: '#666' },
  overlay: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  backdrop: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)' },
  modalContent: { backgroundColor: '#fff', borderRadius: 12, padding: 16, width: '80%', maxWidth: 280 },
  modalTitle: { fontSize: 16, fontWeight: '600', textAlign: 'center', marginBottom: 12 },
  optionList: { maxHeight: 200 },
  optionGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center' },
  optionItem: { width: 50, paddingVertical: 12, borderRadius: 8, backgroundColor: '#f0f0f0', alignItems: 'center' },
  optionText: { fontSize: 16, color: '#333' },
  optionTextActive: { color: '#fff', fontWeight: '600' },
  unitOption: { paddingVertical: 14, paddingHorizontal: 16, borderRadius: 8, backgroundColor: '#f0f0f0', marginBottom: 8, alignItems: 'center' },
  unitOptionText: { fontSize: 16, color: '#333' },
  closeBtn: { marginTop: 8, paddingVertical: 10, backgroundColor: '#eee', borderRadius: 8, alignItems: 'center' },
  closeBtnText: { color: '#666', fontSize: 14 },
});
