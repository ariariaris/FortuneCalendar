// Fortune Calendar 時刻選択モーダル v1.0
import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView } from 'react-native';

interface TimePickerModalProps {
  visible: boolean;
  value: { hour: number; minute: number };
  onSelect: (hour: number, minute: number) => void;
  onClose: () => void;
  themeColor?: string;
}

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const MINUTES = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];

export const TimePickerModal: React.FC<TimePickerModalProps> = ({
  visible,
  value,
  onSelect,
  onClose,
  themeColor = '#FF69B4',
}) => {
  const [selectedHour, setSelectedHour] = useState(value.hour);
  const [selectedMinute, setSelectedMinute] = useState(value.minute);

  const handleConfirm = () => {
    onSelect(selectedHour, selectedMinute);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <TouchableOpacity style={s.overlay} activeOpacity={1} onPress={onClose}>
        <View style={s.container} onStartShouldSetResponder={() => true}>
          <Text style={s.title}>時刻を選択</Text>
          <View style={s.pickerRow}>
            {/* 時 */}
            <View style={s.pickerCol}>
              <Text style={s.colLabel}>時</Text>
              <ScrollView style={s.scroll} showsVerticalScrollIndicator={false}>
                {HOURS.map(h => (
                  <TouchableOpacity
                    key={h}
                    style={[s.item, selectedHour === h && { backgroundColor: themeColor }]}
                    onPress={() => setSelectedHour(h)}
                  >
                    <Text style={[s.itemText, selectedHour === h && s.itemTextActive]}>
                      {String(h).padStart(2, '0')}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
            {/* 分 */}
            <View style={s.pickerCol}>
              <Text style={s.colLabel}>分</Text>
              <ScrollView style={s.scroll} showsVerticalScrollIndicator={false}>
                {MINUTES.map(m => (
                  <TouchableOpacity
                    key={m}
                    style={[s.item, selectedMinute === m && { backgroundColor: themeColor }]}
                    onPress={() => setSelectedMinute(m)}
                  >
                    <Text style={[s.itemText, selectedMinute === m && s.itemTextActive]}>
                      {String(m).padStart(2, '0')}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
          <View style={s.preview}>
            <Text style={s.previewText}>
              {String(selectedHour).padStart(2, '0')}:{String(selectedMinute).padStart(2, '0')}
            </Text>
          </View>
          <View style={s.actions}>
            <TouchableOpacity style={s.btn} onPress={onClose}>
              <Text style={s.btnText}>キャンセル</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[s.btn, s.btnPrimary, { backgroundColor: themeColor }]} onPress={handleConfirm}>
              <Text style={s.btnPrimaryText}>決定</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const s = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  container: { backgroundColor: '#fff', borderRadius: 12, width: 280, padding: 16 },
  title: { fontSize: 16, fontWeight: 'bold', textAlign: 'center', marginBottom: 12 },
  pickerRow: { flexDirection: 'row', justifyContent: 'center', gap: 20 },
  pickerCol: { alignItems: 'center' },
  colLabel: { fontSize: 12, color: '#666', marginBottom: 8 },
  scroll: { height: 180 },
  item: { paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8, marginVertical: 2 },
  itemText: { fontSize: 18, textAlign: 'center', color: '#333' },
  itemTextActive: { color: '#fff', fontWeight: 'bold' },
  preview: { alignItems: 'center', marginVertical: 12, paddingVertical: 8, backgroundColor: '#f5f5f5', borderRadius: 8 },
  previewText: { fontSize: 24, fontWeight: 'bold', color: '#333' },
  actions: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  btn: { flex: 1, paddingVertical: 12, borderRadius: 8, marginHorizontal: 4, backgroundColor: '#eee' },
  btnText: { textAlign: 'center', fontSize: 14, color: '#666' },
  btnPrimary: { backgroundColor: '#FF69B4' },
  btnPrimaryText: { textAlign: 'center', fontSize: 14, color: '#fff', fontWeight: 'bold' },
});

export default TimePickerModal;
