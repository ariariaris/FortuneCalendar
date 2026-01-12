// Fortune Calendar リマインダー入力コンポーネント v1.0
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, StyleSheet, ScrollView } from 'react-native';

type UnitType = 'short' | 'long';  // short: 分/時間/日, long: 日/週/月

const SHORT_UNITS = [
  { key: 'minute', label: '分', multiplier: 1 },
  { key: 'hour', label: '時間', multiplier: 60 },
  { key: 'day', label: '日', multiplier: 1440 },
];

const LONG_UNITS = [
  { key: 'day', label: '日', multiplier: 1440 },
  { key: 'week', label: '週', multiplier: 10080 },
  { key: 'month', label: '月', multiplier: 43200 },
];

const SHORT_PRESETS = [5, 10, 15, 30, 60, 120, 1440];  // 分単位
const LONG_PRESETS = [1440, 2880, 10080, 21600, 43200];  // 1日, 2日, 1週, 15日, 1月

interface Props {
  label?: string;
  reminders: number[];  // 分単位で保存
  onChange: (reminders: number[]) => void;
  maxCount?: number;
  unitType?: UnitType;
  accentColor?: string;
}

export const ReminderInput: React.FC<Props> = ({
  label = 'リマインダー',
  reminders,
  onChange,
  maxCount = 3,
  unitType = 'short',
  accentColor = '#2196F3',
}) => {
  const [showPicker, setShowPicker] = useState(false);
  const [editIndex, setEditIndex] = useState(-1);
  const [inputValue, setInputValue] = useState('15');
  const [selectedUnit, setSelectedUnit] = useState(unitType === 'short' ? 'minute' : 'day');

  const units = unitType === 'short' ? SHORT_UNITS : LONG_UNITS;
  const presets = unitType === 'short' ? SHORT_PRESETS : LONG_PRESETS;

  const formatReminder = (minutes: number) => {
    if (unitType === 'long') {
      if (minutes >= 43200) return `${Math.round(minutes / 43200)}ヶ月前`;
      if (minutes >= 10080) return `${Math.round(minutes / 10080)}週間前`;
      return `${Math.round(minutes / 1440)}日前`;
    }
    if (minutes >= 1440) return `${Math.round(minutes / 1440)}日前`;
    if (minutes >= 60) return `${Math.round(minutes / 60)}時間前`;
    return `${minutes}分前`;
  };

  const handleAdd = () => {
    if (reminders.length >= maxCount) return;
    setEditIndex(-1);
    setInputValue(unitType === 'short' ? '15' : '1');
    setSelectedUnit(unitType === 'short' ? 'minute' : 'day');
    setShowPicker(true);
  };

  const handleEdit = (index: number) => {
    const minutes = reminders[index];
    setEditIndex(index);
    // 逆算して値と単位を設定
    const unit = units.find(u => minutes >= u.multiplier && minutes % u.multiplier === 0);
    if (unit) {
      setInputValue(String(minutes / unit.multiplier));
      setSelectedUnit(unit.key);
    } else {
      setInputValue(String(minutes));
      setSelectedUnit(units[0].key);
    }
    setShowPicker(true);
  };

  const handleDelete = (index: number) => {
    const newReminders = reminders.filter((_, i) => i !== index);
    onChange(newReminders);
  };

  const handleSave = () => {
    const num = parseInt(inputValue, 10);
    if (isNaN(num) || num <= 0) return;
    const unit = units.find(u => u.key === selectedUnit);
    const minutes = num * (unit?.multiplier || 1);

    let newReminders: number[];
    if (editIndex >= 0) {
      newReminders = [...reminders];
      newReminders[editIndex] = minutes;
    } else {
      newReminders = [...reminders, minutes];
    }
    onChange(newReminders.sort((a, b) => a - b));
    setShowPicker(false);
  };

  const handlePresetSelect = (preset: number) => {
    let newReminders: number[];
    if (editIndex >= 0) {
      newReminders = [...reminders];
      newReminders[editIndex] = preset;
    } else {
      newReminders = [...reminders, preset];
    }
    onChange(newReminders.sort((a, b) => a - b));
    setShowPicker(false);
  };

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}

      {reminders.map((minutes, index) => (
        <View key={index} style={styles.reminderRow}>
          <TouchableOpacity style={[styles.reminderItem, { borderColor: accentColor }]} onPress={() => handleEdit(index)}>
            <Text style={[styles.reminderText, { color: accentColor }]}>{formatReminder(minutes)}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(index)}>
            <Text style={styles.deleteBtnText}>×</Text>
          </TouchableOpacity>
        </View>
      ))}

      {reminders.length < maxCount && (
        <TouchableOpacity style={[styles.addBtn, { borderColor: accentColor }]} onPress={handleAdd}>
          <Text style={[styles.addBtnText, { color: accentColor }]}>+ 追加</Text>
        </TouchableOpacity>
      )}

      <Modal visible={showPicker} transparent animationType="fade" onRequestClose={() => setShowPicker(false)}>
        <View style={styles.overlay}>
          <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={() => setShowPicker(false)} />
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{editIndex >= 0 ? '編集' : '追加'}</Text>

            <View style={styles.inputRow}>
              <TextInput
                style={[styles.valueInput, { borderColor: accentColor }]}
                value={inputValue}
                onChangeText={setInputValue}
                keyboardType="number-pad"
                maxLength={3}
              />
              <View style={styles.unitSelector}>
                {units.map(u => (
                  <TouchableOpacity
                    key={u.key}
                    style={[styles.unitBtn, selectedUnit === u.key && { backgroundColor: accentColor }]}
                    onPress={() => setSelectedUnit(u.key)}
                  >
                    <Text style={[styles.unitBtnText, selectedUnit === u.key && styles.unitBtnTextActive]}>{u.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={styles.suffix}>前</Text>
            </View>

            <Text style={styles.presetLabel}>プリセット:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.presetScroll}>
              {presets.map(p => (
                <TouchableOpacity key={p} style={styles.presetBtn} onPress={() => handlePresetSelect(p)}>
                  <Text style={styles.presetBtnText}>{formatReminder(p)}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowPicker(false)}>
                <Text style={styles.cancelBtnText}>キャンセル</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.saveBtn, { backgroundColor: accentColor }]} onPress={handleSave}>
                <Text style={styles.saveBtnText}>保存</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginBottom: 12 },
  label: { fontSize: 13, color: '#666', marginBottom: 6 },
  reminderRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  reminderItem: { flex: 1, borderWidth: 2, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8, backgroundColor: '#fff' },
  reminderText: { fontSize: 14, fontWeight: '500' },
  deleteBtn: { marginLeft: 8, width: 32, height: 32, borderRadius: 16, backgroundColor: '#ff5252', alignItems: 'center', justifyContent: 'center' },
  deleteBtnText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  addBtn: { borderWidth: 2, borderStyle: 'dashed', borderRadius: 8, paddingVertical: 10, alignItems: 'center' },
  addBtnText: { fontSize: 14, fontWeight: '600' },
  overlay: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  backdrop: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)' },
  modalContent: { backgroundColor: '#fff', borderRadius: 12, padding: 16, width: '85%', maxWidth: 320 },
  modalTitle: { fontSize: 16, fontWeight: '600', textAlign: 'center', marginBottom: 16 },
  inputRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  valueInput: { width: 60, borderWidth: 2, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 8, fontSize: 16, textAlign: 'center', backgroundColor: '#fff' },
  unitSelector: { flexDirection: 'row', marginLeft: 8, gap: 4 },
  unitBtn: { paddingHorizontal: 10, paddingVertical: 8, borderRadius: 6, backgroundColor: '#f0f0f0' },
  unitBtnText: { fontSize: 14, color: '#333' },
  unitBtnTextActive: { color: '#fff', fontWeight: '600' },
  suffix: { fontSize: 14, color: '#666', marginLeft: 6 },
  presetLabel: { fontSize: 12, color: '#666', marginBottom: 6 },
  presetScroll: { marginBottom: 16 },
  presetBtn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 16, backgroundColor: '#f0f0f0', marginRight: 8 },
  presetBtnText: { fontSize: 13, color: '#333' },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8 },
  cancelBtn: { paddingHorizontal: 16, paddingVertical: 10, backgroundColor: '#eee', borderRadius: 8 },
  cancelBtnText: { color: '#666', fontSize: 14 },
  saveBtn: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8 },
  saveBtnText: { color: '#fff', fontSize: 14, fontWeight: '600' },
});
