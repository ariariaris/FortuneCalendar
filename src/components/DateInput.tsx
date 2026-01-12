// Fortune Calendar 日付入力 v3.0 (ネイティブDatePicker)
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet, Platform } from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';

interface Props {
  value: string;  // YYYY/MM/DD or YYYY-MM-DD
  onChange: (date: string) => void;
  label?: string;
  format?: 'slash' | 'hyphen';
  accentColor?: string;
}

export const DateInput: React.FC<Props> = ({ value, onChange, label, format = 'slash', accentColor = '#FF69B4' }) => {
  const [showPicker, setShowPicker] = useState(false);

  // 文字列からDateオブジェクトに変換
  const parseDate = (v: string): Date => {
    if (!v) return new Date();
    const normalized = v.replace(/\//g, '-');
    const date = new Date(normalized);
    return isNaN(date.getTime()) ? new Date() : date;
  };

  const currentDate = parseDate(value);

  // Dateオブジェクトを文字列に変換
  const formatDate = (date: Date): string => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    const sep = format === 'slash' ? '/' : '-';
    return `${y}${sep}${m}${sep}${d}`;
  };

  // 表示用フォーマット
  const displayDate = (): string => {
    const y = currentDate.getFullYear();
    const m = currentDate.getMonth() + 1;
    const d = currentDate.getDate();
    return `${y}年${m}月${d}日`;
  };

  const handleChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowPicker(false);
    }
    if (event.type === 'set' && selectedDate) {
      onChange(formatDate(selectedDate));
    }
    if (event.type === 'dismissed') {
      setShowPicker(false);
    }
  };

  const handleConfirm = () => {
    setShowPicker(false);
  };

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TouchableOpacity style={[styles.button, { borderColor: accentColor }]} onPress={() => setShowPicker(true)}>
        <Text style={[styles.buttonText, { color: accentColor }]}>{displayDate()}</Text>
        <Text style={styles.arrow}>▼</Text>
      </TouchableOpacity>

      {Platform.OS === 'android' && showPicker && (
        <DateTimePicker
          value={currentDate}
          mode="date"
          display="default"
          onChange={handleChange}
          locale="ja-JP"
        />
      )}

      {Platform.OS === 'ios' && (
        <Modal visible={showPicker} transparent animationType="slide" onRequestClose={() => setShowPicker(false)}>
          <View style={styles.modalOverlay}>
            <TouchableOpacity style={styles.backdrop} onPress={() => setShowPicker(false)} />
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <TouchableOpacity onPress={() => setShowPicker(false)}>
                  <Text style={styles.cancelText}>キャンセル</Text>
                </TouchableOpacity>
                <Text style={styles.modalTitle}>日付を選択</Text>
                <TouchableOpacity onPress={handleConfirm}>
                  <Text style={[styles.doneText, { color: accentColor }]}>完了</Text>
                </TouchableOpacity>
              </View>
              <DateTimePicker
                value={currentDate}
                mode="date"
                display="spinner"
                onChange={(e, d) => d && onChange(formatDate(d))}
                locale="ja-JP"
                style={styles.picker}
              />
            </View>
          </View>
        </Modal>
      )}

      {Platform.OS === 'web' && showPicker && (
        <Modal visible={showPicker} transparent animationType="fade" onRequestClose={() => setShowPicker(false)}>
          <View style={styles.modalOverlay}>
            <TouchableOpacity style={styles.backdrop} onPress={() => setShowPicker(false)} />
            <View style={styles.webPickerContent}>
              <Text style={styles.modalTitle}>日付を選択</Text>
              <input
                type="date"
                value={value.replace(/\//g, '-')}
                onChange={(e) => { onChange(e.target.value.replace(/-/g, format === 'slash' ? '/' : '-')); setShowPicker(false); }}
                style={{ fontSize: 18, padding: 12, borderRadius: 8, border: '1px solid #ddd' }}
              />
              <TouchableOpacity style={styles.closeBtn} onPress={() => setShowPicker(false)}>
                <Text style={styles.closeBtnText}>閉じる</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginBottom: 12 },
  label: { fontSize: 13, color: '#666', marginBottom: 6 },
  button: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 2, borderRadius: 8, paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#fff' },
  buttonText: { fontSize: 16, fontWeight: '600' },
  arrow: { fontSize: 12, color: '#999' },
  modalOverlay: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.4)' },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 16, borderTopRightRadius: 16, paddingBottom: 20 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#eee' },
  modalTitle: { fontSize: 16, fontWeight: '600', color: '#333' },
  cancelText: { fontSize: 16, color: '#666' },
  doneText: { fontSize: 16, fontWeight: '600' },
  picker: { height: 200 },
  webPickerContent: { backgroundColor: '#fff', borderRadius: 12, padding: 20, marginHorizontal: 20, alignItems: 'center' },
  closeBtn: { marginTop: 16, paddingVertical: 10, paddingHorizontal: 24, backgroundColor: '#eee', borderRadius: 8 },
  closeBtnText: { color: '#666', fontSize: 14 },
});

export default DateInput;
