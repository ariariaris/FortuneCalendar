// Fortune Calendar 時間入力コンポーネント v1.0
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, StyleSheet, ScrollView } from 'react-native';
import { TimeUnit } from '../../types/goalManagement';

const VALUE_PRESETS = [5, 10, 15, 20, 30, 45, 60, 90, 120, 180, 240];
const UNITS: { key: TimeUnit; label: string }[] = [
  { key: 'minute', label: '分' },
  { key: 'hour', label: '時間' },
];

interface Props {
  label?: string;
  minutes: number;  // 分単位で保存
  onChange: (minutes: number) => void;
  accentColor?: string;
}

export const TimeInput: React.FC<Props> = ({ label, minutes, onChange, accentColor = '#2196F3' }) => {
  // 時間/分に変換
  const isHour = minutes >= 60 && minutes % 60 === 0;
  const displayValue = isHour ? minutes / 60 : minutes;
  const displayUnit: TimeUnit = isHour ? 'hour' : 'minute';

  const [showValuePicker, setShowValuePicker] = useState(false);
  const [showUnitPicker, setShowUnitPicker] = useState(false);
  const [inputText, setInputText] = useState(String(displayValue));
  const [unit, setUnit] = useState<TimeUnit>(displayUnit);

  useEffect(() => {
    const isH = minutes >= 60 && minutes % 60 === 0;
    setInputText(String(isH ? minutes / 60 : minutes));
    setUnit(isH ? 'hour' : 'minute');
  }, [minutes]);

  const handleValueChange = (text: string) => {
    setInputText(text);
    const num = parseInt(text, 10);
    if (!isNaN(num) && num > 0 && num <= 999) {
      onChange(unit === 'hour' ? num * 60 : num);
    }
  };

  const handleValueSelect = (num: number) => {
    // プリセットは分単位なので、時間選択中は60で割る
    const val = unit === 'hour' ? Math.round(num / 60) || 1 : num;
    setInputText(String(val));
    onChange(unit === 'hour' ? val * 60 : val);
    setShowValuePicker(false);
  };

  const handleUnitSelect = (newUnit: TimeUnit) => {
    const currentMinutes = unit === 'hour' ? parseInt(inputText) * 60 : parseInt(inputText);
    setUnit(newUnit);
    if (newUnit === 'hour') {
      const hours = Math.max(1, Math.round(currentMinutes / 60));
      setInputText(String(hours));
      onChange(hours * 60);
    } else {
      setInputText(String(currentMinutes));
      onChange(currentMinutes);
    }
    setShowUnitPicker(false);
  };

  const unitLabel = UNITS.find(u => u.key === unit)?.label || '分';
  const presets = unit === 'hour' ? [1, 2, 3, 4, 5, 6, 8, 10, 12] : VALUE_PRESETS;

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={styles.row}>
        <View style={styles.valueContainer}>
          <TextInput
            style={[styles.valueInput, { borderColor: accentColor }]}
            value={inputText}
            onChangeText={handleValueChange}
            keyboardType="number-pad"
            maxLength={3}
          />
          <TouchableOpacity style={[styles.pickerBtn, { backgroundColor: accentColor }]} onPress={() => setShowValuePicker(true)}>
            <Text style={styles.pickerBtnText}>▼</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={[styles.unitBtn, { borderColor: accentColor }]} onPress={() => setShowUnitPicker(true)}>
          <Text style={[styles.unitText, { color: accentColor }]}>{unitLabel}</Text>
          <Text style={styles.unitArrow}>▼</Text>
        </TouchableOpacity>
      </View>

      <Modal visible={showValuePicker} transparent animationType="fade" onRequestClose={() => setShowValuePicker(false)}>
        <View style={styles.overlay}>
          <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={() => setShowValuePicker(false)} />
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{unit === 'hour' ? '時間' : '分'}を選択</Text>
            <ScrollView style={styles.optionList} contentContainerStyle={styles.optionGrid}>
              {presets.map(num => (
                <TouchableOpacity key={num} style={[styles.optionItem, parseInt(inputText) === num && { backgroundColor: accentColor }]} onPress={() => handleValueSelect(unit === 'hour' ? num * 60 : num)}>
                  <Text style={[styles.optionText, parseInt(inputText) === num && styles.optionTextActive]}>{num}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity style={styles.closeBtn} onPress={() => setShowValuePicker(false)}>
              <Text style={styles.closeBtnText}>閉じる</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={showUnitPicker} transparent animationType="fade" onRequestClose={() => setShowUnitPicker(false)}>
        <View style={styles.overlay}>
          <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={() => setShowUnitPicker(false)} />
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>単位を選択</Text>
            {UNITS.map(u => (
              <TouchableOpacity key={u.key} style={[styles.unitOption, unit === u.key && { backgroundColor: accentColor }]} onPress={() => handleUnitSelect(u.key)}>
                <Text style={[styles.unitOptionText, unit === u.key && styles.optionTextActive]}>{u.label}</Text>
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
  valueInput: { width: 60, borderWidth: 2, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 8, fontSize: 16, textAlign: 'center', backgroundColor: '#fff' },
  pickerBtn: { marginLeft: 4, paddingHorizontal: 8, paddingVertical: 10, borderRadius: 6 },
  pickerBtnText: { color: '#fff', fontSize: 10 },
  unitBtn: { flexDirection: 'row', alignItems: 'center', borderWidth: 2, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8, backgroundColor: '#fff' },
  unitText: { fontSize: 16, fontWeight: '600', marginRight: 4 },
  unitArrow: { fontSize: 10, color: '#999' },
  overlay: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  backdrop: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)' },
  modalContent: { backgroundColor: '#fff', borderRadius: 12, padding: 16, width: '80%', maxWidth: 280 },
  modalTitle: { fontSize: 16, fontWeight: '600', textAlign: 'center', marginBottom: 12 },
  optionList: { maxHeight: 200 },
  optionGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center' },
  optionItem: { width: 55, paddingVertical: 12, borderRadius: 8, backgroundColor: '#f0f0f0', alignItems: 'center' },
  optionText: { fontSize: 16, color: '#333' },
  optionTextActive: { color: '#fff', fontWeight: '600' },
  unitOption: { paddingVertical: 14, paddingHorizontal: 16, borderRadius: 8, backgroundColor: '#f0f0f0', marginBottom: 8, alignItems: 'center' },
  unitOptionText: { fontSize: 16, color: '#333' },
  closeBtn: { marginTop: 8, paddingVertical: 10, backgroundColor: '#eee', borderRadius: 8, alignItems: 'center' },
  closeBtnText: { color: '#666', fontSize: 14 },
});
