// Fortune Calendar リマインダー入力コンポーネント v3.0 (1-10ボタン+その他入力)
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet, TextInput, ScrollView } from 'react-native';

type UnitType = 'short' | 'long';

const SHORT_UNITS = [
  { key: 'minute', label: '分前', multiplier: 1 },
  { key: 'hour', label: '時間前', multiplier: 60 },
  { key: 'day', label: '日前', multiplier: 1440 },
];

const LONG_UNITS = [
  { key: 'day', label: '日前', multiplier: 1440 },
  { key: 'week', label: '週間前', multiplier: 10080 },
  { key: 'month', label: 'ヶ月前', multiplier: 43200 },
];

interface Props {
  label?: string;
  reminders: number[];
  onChange: (reminders: number[]) => void;
  maxCount?: number;
  unitType?: UnitType;
  accentColor?: string;
}

export const ReminderInput: React.FC<Props> = ({
  label = 'リマインダー', reminders, onChange, maxCount = 3, unitType = 'short', accentColor = '#2196F3',
}) => {
  const [showPicker, setShowPicker] = useState(false);
  const [editIndex, setEditIndex] = useState(-1);
  const [tempValue, setTempValue] = useState(1);
  const [tempUnit, setTempUnit] = useState(unitType === 'short' ? 'minute' : 'day');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customValue, setCustomValue] = useState('');

  const units = unitType === 'short' ? SHORT_UNITS : LONG_UNITS;
  const numberButtons = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  const formatReminder = (minutes: number): string => {
    if (unitType === 'long') {
      if (minutes >= 43200) return `${Math.round(minutes / 43200)}ヶ月前`;
      if (minutes >= 10080) return `${Math.round(minutes / 10080)}週間前`;
      return `${Math.round(minutes / 1440)}日前`;
    }
    if (minutes >= 1440) return `${Math.round(minutes / 1440)}日前`;
    if (minutes >= 60) return `${Math.round(minutes / 60)}時間前`;
    return `${minutes}分前`;
  };

  const openAdd = () => {
    setEditIndex(-1);
    setTempValue(1);
    setTempUnit(unitType === 'short' ? 'minute' : 'day');
    setShowCustomInput(false);
    setCustomValue('');
    setShowPicker(true);
  };

  const openEdit = (index: number) => {
    const minutes = reminders[index];
    setEditIndex(index);
    const unit = units.find(u => minutes >= u.multiplier && minutes % u.multiplier === 0);
    if (unit) {
      const val = minutes / unit.multiplier;
      setTempValue(val);
      setTempUnit(unit.key);
      if (val > 10) {
        setShowCustomInput(true);
        setCustomValue(String(val));
      } else {
        setShowCustomInput(false);
        setCustomValue('');
      }
    } else {
      setTempValue(minutes);
      setTempUnit(units[0].key);
      setShowCustomInput(false);
    }
    setShowPicker(true);
  };

  const handleDelete = (index: number) => {
    onChange(reminders.filter((_, i) => i !== index));
  };

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
    const unit = units.find(u => u.key === tempUnit);
    const minutes = finalValue * (unit?.multiplier || 1);
    let newReminders: number[];
    if (editIndex >= 0) { newReminders = [...reminders]; newReminders[editIndex] = minutes; }
    else { newReminders = [...reminders, minutes]; }
    onChange(newReminders.sort((a, b) => a - b));
    setShowPicker(false);
  };

  const handleCancel = () => setShowPicker(false);

  const renderPicker = () => (
    <Modal visible={showPicker} transparent animationType="fade" onRequestClose={handleCancel}>
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.backdrop} onPress={handleCancel} />
        <View style={styles.content}>
          <Text style={styles.title}>{editIndex >= 0 ? '編集' : '追加'}</Text>

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
            {units.map(u => (
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
      {reminders.map((minutes, index) => (
        <View key={index} style={styles.reminderRow}>
          <TouchableOpacity style={[styles.reminderItem, { borderColor: accentColor }]} onPress={() => openEdit(index)}>
            <Text style={[styles.reminderText, { color: accentColor }]}>{formatReminder(minutes)}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(index)}>
            <Text style={styles.deleteBtnText}>×</Text>
          </TouchableOpacity>
        </View>
      ))}
      {reminders.length < maxCount && (
        <TouchableOpacity style={[styles.addBtn, { borderColor: accentColor }]} onPress={openAdd}>
          <Text style={[styles.addBtnText, { color: accentColor }]}>+ 追加</Text>
        </TouchableOpacity>
      )}
      {renderPicker()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginBottom: 12 },
  label: { fontSize: 13, color: '#666', marginBottom: 6 },
  reminderRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  reminderItem: { flex: 1, borderWidth: 2, borderRadius: 8, paddingHorizontal: 16, paddingVertical: 10, backgroundColor: '#fff' },
  reminderText: { fontSize: 15, fontWeight: '500' },
  deleteBtn: { marginLeft: 8, width: 32, height: 32, borderRadius: 16, backgroundColor: '#ff5252', alignItems: 'center', justifyContent: 'center' },
  deleteBtnText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  addBtn: { borderWidth: 2, borderStyle: 'dashed', borderRadius: 8, paddingVertical: 10, alignItems: 'center' },
  addBtnText: { fontSize: 14, fontWeight: '600' },
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
