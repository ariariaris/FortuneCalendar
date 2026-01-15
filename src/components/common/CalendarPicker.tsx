// Fortune Calendar カレンダー選択 v1.0
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, Alert, Platform } from 'react-native';
import { NativeCalendar, getWritableCalendars, createNativeCalendar, requestCalendarPermission } from '../../services/nativeCalendarService';

interface Props {
  selectedCalendarId?: string;
  onSelect: (calendarId: string, calendarName: string) => void;
  accentColor?: string;
}

export const CalendarPicker: React.FC<Props> = ({ selectedCalendarId, onSelect, accentColor = '#FFD700' }) => {
  const [calendars, setCalendars] = useState<NativeCalendar[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showNewInput, setShowNewInput] = useState(false);
  const [newCalendarName, setNewCalendarName] = useState('');
  const [permissionDenied, setPermissionDenied] = useState(false);

  useEffect(() => {
    loadCalendars();
  }, []);

  const loadCalendars = async () => {
    setIsLoading(true);
    if (Platform.OS === 'web') {
      setPermissionDenied(true);
      setIsLoading(false);
      return;
    }
    const status = await requestCalendarPermission();
    if (status !== 'granted') {
      setPermissionDenied(true);
      setIsLoading(false);
      return;
    }
    const cals = await getWritableCalendars();
    setCalendars(cals);
    setIsLoading(false);
  };

  const handleCreateCalendar = async () => {
    if (!newCalendarName.trim()) {
      Alert.alert('エラー', 'カレンダー名を入力してください');
      return;
    }
    const calId = await createNativeCalendar(newCalendarName.trim());
    if (calId) {
      onSelect(calId, newCalendarName.trim());
      setNewCalendarName('');
      setShowNewInput(false);
      loadCalendars();
    } else {
      Alert.alert('エラー', 'カレンダーの作成に失敗しました');
    }
  };

  if (isLoading) {
    return <Text style={styles.loading}>カレンダー読込中...</Text>;
  }

  if (permissionDenied) {
    return (
      <View style={styles.container}>
        <Text style={styles.label}>カレンダー</Text>
        <Text style={styles.denied}>カレンダーへのアクセスが許可されていません</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>カレンダー</Text>
      <View style={styles.list}>
        {calendars.map(cal => (
          <TouchableOpacity
            key={cal.id}
            style={[styles.item, selectedCalendarId === cal.id && { backgroundColor: accentColor + '30', borderColor: accentColor }]}
            onPress={() => onSelect(cal.id, cal.title)}
          >
            <View style={[styles.colorDot, { backgroundColor: cal.color }]} />
            <Text style={[styles.itemText, selectedCalendarId === cal.id && { fontWeight: '600' }]}>{cal.title}</Text>
            {selectedCalendarId === cal.id && <Text style={styles.check}>✓</Text>}
          </TouchableOpacity>
        ))}
        {/* 新規作成 */}
        {showNewInput ? (
          <View style={styles.newInputRow}>
            <TextInput
              style={styles.newInput}
              placeholder="例: 夢・目標"
              value={newCalendarName}
              onChangeText={setNewCalendarName}
              autoFocus
            />
            <TouchableOpacity style={[styles.createBtn, { backgroundColor: accentColor }]} onPress={handleCreateCalendar}>
              <Text style={styles.createBtnText}>作成</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelBtn} onPress={() => { setShowNewInput(false); setNewCalendarName(''); }}>
              <Text style={styles.cancelBtnText}>×</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity style={styles.addItem} onPress={() => setShowNewInput(true)}>
            <Text style={[styles.addText, { color: accentColor }]}>+ 新規カレンダー作成</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginBottom: 12 },
  label: { fontSize: 13, color: '#666', marginBottom: 6 },
  loading: { fontSize: 13, color: '#999', padding: 8 },
  denied: { fontSize: 13, color: '#d00', padding: 8 },
  list: { gap: 4 },
  item: { flexDirection: 'row', alignItems: 'center', padding: 10, backgroundColor: '#f5f5f5', borderRadius: 8, borderWidth: 2, borderColor: 'transparent' },
  colorDot: { width: 12, height: 12, borderRadius: 6, marginRight: 8 },
  itemText: { flex: 1, fontSize: 14, color: '#333' },
  check: { fontSize: 16, color: '#4CAF50', fontWeight: '700' },
  addItem: { padding: 10, alignItems: 'center' },
  addText: { fontSize: 14, fontWeight: '600' },
  newInputRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  newInput: { flex: 1, backgroundColor: '#f5f5f5', borderRadius: 8, padding: 10, fontSize: 14 },
  createBtn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 6 },
  createBtnText: { color: '#fff', fontWeight: '600', fontSize: 13 },
  cancelBtn: { padding: 8 },
  cancelBtnText: { fontSize: 18, color: '#999' },
});
