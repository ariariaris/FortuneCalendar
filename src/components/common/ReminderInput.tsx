// Fortune Calendar リマインダー入力コンポーネント v2.0 (ネイティブ風Picker)
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet, Platform, ScrollView } from 'react-native';
import { Picker } from '@react-native-picker/picker';

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

const SHORT_VALUES = [5, 10, 15, 30, 45, 60, 90, 120];
const LONG_VALUES = [1, 2, 3, 5, 7, 14, 30];

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
  const [tempValue, setTempValue] = useState(15);
  const [tempUnit, setTempUnit] = useState(unitType === 'short' ? 'minute' : 'day');

  const units = unitType === 'short' ? SHORT_UNITS : LONG_UNITS;
  const values = unitType === 'short' ? SHORT_VALUES : LONG_VALUES;

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
    setTempValue(unitType === 'short' ? 15 : 1);
    setTempUnit(unitType === 'short' ? 'minute' : 'day');
    setShowPicker(true);
  };

  const openEdit = (index: number) => {
    const minutes = reminders[index];
    setEditIndex(index);
    const unit = units.find(u => minutes >= u.multiplier && minutes % u.multiplier === 0);
    if (unit) { setTempValue(minutes / unit.multiplier); setTempUnit(unit.key); }
    else { setTempValue(minutes); setTempUnit(units[0].key); }
    setShowPicker(true);
  };

  const handleDelete = (index: number) => {
    onChange(reminders.filter((_, i) => i !== index));
  };

  const handleConfirm = () => {
    const unit = units.find(u => u.key === tempUnit);
    const minutes = tempValue * (unit?.multiplier || 1);
    let newReminders: number[];
    if (editIndex >= 0) { newReminders = [...reminders]; newReminders[editIndex] = minutes; }
    else { newReminders = [...reminders, minutes]; }
    onChange(newReminders.sort((a, b) => a - b));
    setShowPicker(false);
  };

  const handleCancel = () => setShowPicker(false);

  // iOS用ピッカー
  const renderIOSPicker = () => (
    <Modal visible={showPicker} transparent animationType="slide" onRequestClose={handleCancel}>
      <View style={styles.iosOverlay}>
        <TouchableOpacity style={styles.backdrop} onPress={handleCancel} />
        <View style={styles.iosContent}>
          <View style={styles.iosHeader}>
            <TouchableOpacity onPress={handleCancel}><Text style={styles.cancelText}>キャンセル</Text></TouchableOpacity>
            <Text style={styles.title}>{editIndex >= 0 ? '編集' : '追加'}</Text>
            <TouchableOpacity onPress={handleConfirm}><Text style={[styles.doneText, { color: accentColor }]}>完了</Text></TouchableOpacity>
          </View>
          <View style={styles.iosPickerRow}>
            <Picker selectedValue={tempValue} onValueChange={setTempValue} style={styles.iosPicker}>
              {values.map(v => <Picker.Item key={v} label={`${v}`} value={v} />)}
            </Picker>
            <Picker selectedValue={tempUnit} onValueChange={setTempUnit} style={styles.iosPicker}>
              {units.map(u => <Picker.Item key={u.key} label={u.label} value={u.key} />)}
            </Picker>
          </View>
        </View>
      </View>
    </Modal>
  );

  // Android用ピッカー
  const renderAndroidPicker = () => (
    <Modal visible={showPicker} transparent animationType="fade" onRequestClose={handleCancel}>
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.backdrop} onPress={handleCancel} />
        <View style={styles.androidContent}>
          <Text style={styles.androidTitle}>{editIndex >= 0 ? '編集' : '追加'}</Text>
          <View style={styles.androidPickerRow}>
            <Picker selectedValue={tempValue} onValueChange={setTempValue} style={styles.androidPicker}>
              {values.map(v => <Picker.Item key={v} label={`${v}`} value={v} />)}
            </Picker>
            <Picker selectedValue={tempUnit} onValueChange={setTempUnit} style={styles.androidPicker}>
              {units.map(u => <Picker.Item key={u.key} label={u.label} value={u.key} />)}
            </Picker>
          </View>
          <View style={styles.androidActions}>
            <TouchableOpacity onPress={handleCancel} style={styles.androidBtn}><Text style={styles.cancelText}>キャンセル</Text></TouchableOpacity>
            <TouchableOpacity onPress={handleConfirm} style={styles.androidBtn}><Text style={[styles.doneText, { color: accentColor }]}>OK</Text></TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  // Web用ピッカー
  const renderWebPicker = () => (
    <Modal visible={showPicker} transparent animationType="fade" onRequestClose={handleCancel}>
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.backdrop} onPress={handleCancel} />
        <View style={styles.webContent}>
          <Text style={styles.title}>{editIndex >= 0 ? '編集' : '追加'}</Text>
          <View style={styles.webRow}>
            <ScrollView style={styles.webColumn}>
              {values.map(v => (
                <TouchableOpacity key={v} style={[styles.webItem, tempValue === v && { backgroundColor: accentColor }]} onPress={() => setTempValue(v)}>
                  <Text style={[styles.webItemText, tempValue === v && styles.webItemTextActive]}>{v}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <ScrollView style={styles.webColumn}>
              {units.map(u => (
                <TouchableOpacity key={u.key} style={[styles.webItem, tempUnit === u.key && { backgroundColor: accentColor }]} onPress={() => setTempUnit(u.key)}>
                  <Text style={[styles.webItemText, tempUnit === u.key && styles.webItemTextActive]}>{u.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
          <View style={styles.webActions}>
            <TouchableOpacity style={styles.cancelBtn} onPress={handleCancel}><Text style={styles.cancelBtnText}>キャンセル</Text></TouchableOpacity>
            <TouchableOpacity style={[styles.confirmBtn, { backgroundColor: accentColor }]} onPress={handleConfirm}><Text style={styles.confirmBtnText}>完了</Text></TouchableOpacity>
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
      {Platform.OS === 'ios' && renderIOSPicker()}
      {Platform.OS === 'android' && renderAndroidPicker()}
      {Platform.OS === 'web' && renderWebPicker()}
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
  title: { fontSize: 16, fontWeight: '600', color: '#333', marginBottom: 12, textAlign: 'center' },
  cancelText: { fontSize: 16, color: '#666' },
  doneText: { fontSize: 16, fontWeight: '600' },
  // iOS
  iosOverlay: { flex: 1, justifyContent: 'flex-end' },
  iosContent: { backgroundColor: '#fff', borderTopLeftRadius: 16, borderTopRightRadius: 16, paddingBottom: 20 },
  iosHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#eee' },
  iosPickerRow: { flexDirection: 'row' },
  iosPicker: { flex: 1, height: 200 },
  // Android
  androidContent: { backgroundColor: '#fff', borderRadius: 12, padding: 16, width: '80%', maxWidth: 300 },
  androidTitle: { fontSize: 18, fontWeight: '600', color: '#333', marginBottom: 8, textAlign: 'center' },
  androidPickerRow: { flexDirection: 'row' },
  androidPicker: { flex: 1, height: 150 },
  androidActions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 8, gap: 16 },
  androidBtn: { paddingHorizontal: 16, paddingVertical: 8 },
  // Web
  webContent: { backgroundColor: '#fff', borderRadius: 12, padding: 16, width: '80%', maxWidth: 300 },
  webRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  webColumn: { flex: 1, maxHeight: 180 },
  webItem: { paddingVertical: 10, paddingHorizontal: 12, borderRadius: 8, backgroundColor: '#f5f5f5', marginBottom: 6, alignItems: 'center' },
  webItemText: { fontSize: 15, color: '#333' },
  webItemTextActive: { color: '#fff', fontWeight: '600' },
  webActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12 },
  cancelBtn: { paddingHorizontal: 20, paddingVertical: 10, backgroundColor: '#eee', borderRadius: 8 },
  cancelBtnText: { color: '#666', fontSize: 14 },
  confirmBtn: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 },
  confirmBtnText: { color: '#fff', fontSize: 14, fontWeight: '600' },
});
