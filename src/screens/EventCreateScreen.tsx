// Fortune Calendar 予定作成画面 v1.0
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Platform, Switch, Modal } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppStore } from '../store/useAppStore';
import { DateInput } from '../components/DateInput';
import { TimePickerModal } from '../components/event/TimePickerModal';
import { RecurrenceSelector } from '../components/event/RecurrenceSelector';
import { ReminderSelector } from '../components/event/ReminderSelector';
import {
  getWritableCalendars,
  createNativeCalendarEvent,
  NativeCalendar,
  RecurrenceType,
  EventCreateData,
} from '../services/nativeCalendarService';

interface EventCreateScreenProps {
  visible: boolean;
  onClose: () => void;
  onSave: () => void;
  initialDate?: string; // YYYY-MM-DD
}

export const EventCreateScreen: React.FC<EventCreateScreenProps> = ({
  visible,
  onClose,
  onSave,
  initialDate,
}) => {
  const { userConfig } = useAppStore();
  const themeColor = userConfig.themeColor || '#FF69B4';
  const insets = useSafeAreaInsets();

  // フォーム状態
  const [title, setTitle] = useState('');
  const [isAllDay, setIsAllDay] = useState(false);
  const [startDate, setStartDate] = useState(initialDate || new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState({ hour: new Date().getHours(), minute: 0 });
  const [endDate, setEndDate] = useState(initialDate || new Date().toISOString().split('T')[0]);
  const [endTime, setEndTime] = useState({ hour: new Date().getHours() + 1, minute: 0 });
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [recurrence, setRecurrence] = useState<RecurrenceType>('none');
  const [reminders, setReminders] = useState<number[]>([]);
  const [calendarId, setCalendarId] = useState('');
  const [calendars, setCalendars] = useState<NativeCalendar[]>([]);
  const [showCalendarPicker, setShowCalendarPicker] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);
  const [saving, setSaving] = useState(false);

  // カレンダー一覧取得
  useEffect(() => {
    if (visible && Platform.OS !== 'web') {
      getWritableCalendars().then(cals => {
        setCalendars(cals);
        if (cals.length > 0 && !calendarId) {
          const primary = cals.find(c => c.isPrimary) || cals[0];
          setCalendarId(primary.id);
        }
      });
    }
  }, [visible]);

  // フォームリセット
  useEffect(() => {
    if (visible) {
      setTitle('');
      setIsAllDay(false);
      setStartDate(initialDate || new Date().toISOString().split('T')[0]);
      setStartTime({ hour: new Date().getHours(), minute: 0 });
      setEndDate(initialDate || new Date().toISOString().split('T')[0]);
      setEndTime({ hour: new Date().getHours() + 1, minute: 0 });
      setLocation('');
      setNotes('');
      setRecurrence('none');
      setReminders([]);
    }
  }, [visible, initialDate]);

  const selectedCalendar = calendars.find(c => c.id === calendarId);

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('エラー', 'タイトルを入力してください');
      return;
    }
    if (!calendarId) {
      Alert.alert('エラー', 'カレンダーを選択してください');
      return;
    }

    // 日時の組み立て
    const [sy, sm, sd] = startDate.split('-').map(Number);
    const [ey, em, ed] = endDate.split('-').map(Number);
    const start = new Date(sy, sm - 1, sd, isAllDay ? 0 : startTime.hour, isAllDay ? 0 : startTime.minute);
    const end = new Date(ey, em - 1, ed, isAllDay ? 23 : endTime.hour, isAllDay ? 59 : endTime.minute);

    if (start >= end) {
      Alert.alert('エラー', '終了日時は開始日時より後にしてください');
      return;
    }

    setSaving(true);
    const data: EventCreateData = {
      title: title.trim(),
      startDate: start,
      endDate: end,
      isAllDay,
      location: location.trim() || undefined,
      notes: notes.trim() || undefined,
      calendarId,
      recurrence,
      reminders: reminders.length > 0 ? reminders : undefined,
    };

    const eventId = await createNativeCalendarEvent(data);
    setSaving(false);

    if (eventId) {
      Alert.alert('完了', '予定を作成しました', [{ text: 'OK', onPress: () => { onSave(); onClose(); } }]);
    } else {
      Alert.alert('エラー', '予定の作成に失敗しました');
    }
  };

  const formatTime = (h: number, m: number) => `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;

  if (Platform.OS === 'web') {
    return null;
  }

  return (
    <Modal visible={visible} animationType="slide">
      <View style={[s.container, { paddingTop: insets.top }]}>
        {/* ヘッダー */}
        <View style={s.header}>
          <TouchableOpacity onPress={onClose} style={s.headerBtn}>
            <Text style={s.cancelText}>キャンセル</Text>
          </TouchableOpacity>
          <Text style={s.headerTitle}>新規予定</Text>
          <TouchableOpacity onPress={handleSave} style={s.headerBtn} disabled={saving}>
            <Text style={[s.saveText, { color: themeColor }]}>{saving ? '保存中...' : '保存'}</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={s.scroll} showsVerticalScrollIndicator={false}>
          {/* タイトル */}
          <View style={s.section}>
            <Text style={s.label}>タイトル</Text>
            <TextInput
              style={s.input}
              value={title}
              onChangeText={setTitle}
              placeholder="イベント名を入力"
              placeholderTextColor="#999"
            />
          </View>

          {/* 終日トグル */}
          <View style={s.section}>
            <View style={s.row}>
              <Text style={s.label}>終日</Text>
              <Switch value={isAllDay} onValueChange={setIsAllDay} />
            </View>
          </View>

          {/* 開始日時 */}
          <View style={s.section}>
            <Text style={s.label}>開始</Text>
            <View style={s.dateTimeRow}>
              <View style={s.dateInputWrap}>
                <DateInput value={startDate} onChange={setStartDate} />
              </View>
              {!isAllDay && (
                <TouchableOpacity style={s.timeBtn} onPress={() => setShowStartTimePicker(true)}>
                  <Text style={s.timeBtnText}>{formatTime(startTime.hour, startTime.minute)}</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* 終了日時 */}
          <View style={s.section}>
            <Text style={s.label}>終了</Text>
            <View style={s.dateTimeRow}>
              <View style={s.dateInputWrap}>
                <DateInput value={endDate} onChange={setEndDate} />
              </View>
              {!isAllDay && (
                <TouchableOpacity style={s.timeBtn} onPress={() => setShowEndTimePicker(true)}>
                  <Text style={s.timeBtnText}>{formatTime(endTime.hour, endTime.minute)}</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* 場所 */}
          <View style={s.section}>
            <Text style={s.label}>場所</Text>
            <TextInput
              style={s.input}
              value={location}
              onChangeText={setLocation}
              placeholder="場所を入力（任意）"
              placeholderTextColor="#999"
            />
          </View>

          {/* メモ */}
          <View style={s.section}>
            <Text style={s.label}>メモ</Text>
            <TextInput
              style={[s.input, s.textArea]}
              value={notes}
              onChangeText={setNotes}
              placeholder="メモを入力（任意）"
              placeholderTextColor="#999"
              multiline
              numberOfLines={3}
            />
          </View>

          {/* 繰り返し */}
          <View style={s.section}>
            <RecurrenceSelector value={recurrence} onChange={setRecurrence} themeColor={themeColor} />
          </View>

          {/* 通知 */}
          <View style={s.section}>
            <ReminderSelector value={reminders} onChange={setReminders} themeColor={themeColor} />
          </View>

          {/* カレンダー選択 */}
          <View style={s.section}>
            <Text style={s.label}>カレンダー</Text>
            <TouchableOpacity style={s.calendarBtn} onPress={() => setShowCalendarPicker(true)}>
              <View style={[s.calendarDot, { backgroundColor: selectedCalendar?.color || '#ccc' }]} />
              <Text style={s.calendarBtnText}>{selectedCalendar?.title || 'カレンダーを選択'}</Text>
              <Text style={s.arrow}>▼</Text>
            </TouchableOpacity>
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>

        {/* 時刻ピッカー */}
        <TimePickerModal
          visible={showStartTimePicker}
          value={startTime}
          onSelect={(h, m) => setStartTime({ hour: h, minute: m })}
          onClose={() => setShowStartTimePicker(false)}
          themeColor={themeColor}
        />
        <TimePickerModal
          visible={showEndTimePicker}
          value={endTime}
          onSelect={(h, m) => setEndTime({ hour: h, minute: m })}
          onClose={() => setShowEndTimePicker(false)}
          themeColor={themeColor}
        />

        {/* カレンダー選択モーダル */}
        <Modal visible={showCalendarPicker} transparent animationType="fade">
          <TouchableOpacity style={s.pickerOverlay} activeOpacity={1} onPress={() => setShowCalendarPicker(false)}>
            <View style={s.pickerBox}>
              <Text style={s.pickerTitle}>カレンダーを選択</Text>
              <ScrollView style={s.pickerScroll}>
                {calendars.map(cal => (
                  <TouchableOpacity
                    key={cal.id}
                    style={[s.pickerItem, calendarId === cal.id && { backgroundColor: themeColor + '20' }]}
                    onPress={() => { setCalendarId(cal.id); setShowCalendarPicker(false); }}
                  >
                    <View style={[s.calendarDot, { backgroundColor: cal.color }]} />
                    <Text style={s.pickerItemText}>{cal.title}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </TouchableOpacity>
        </Modal>
      </View>
    </Modal>
  );
};

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f8f8' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#fff', borderBottomWidth: 0.5, borderBottomColor: '#ddd' },
  headerBtn: { minWidth: 70 },
  headerTitle: { fontSize: 17, fontWeight: '600', color: '#333' },
  cancelText: { fontSize: 16, color: '#666' },
  saveText: { fontSize: 16, fontWeight: '600', textAlign: 'right' },
  scroll: { flex: 1, padding: 16 },
  section: { backgroundColor: '#fff', borderRadius: 10, padding: 16, marginBottom: 12 },
  label: { fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 8 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 16, color: '#333', backgroundColor: '#fafafa' },
  textArea: { height: 80, textAlignVertical: 'top' },
  dateTimeRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  dateInputWrap: { flex: 1 },
  timeBtn: { backgroundColor: '#eee', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8 },
  timeBtnText: { fontSize: 16, fontWeight: '600', color: '#333' },
  calendarBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fafafa', borderWidth: 1, borderColor: '#ddd', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10 },
  calendarDot: { width: 12, height: 12, borderRadius: 6, marginRight: 10 },
  calendarBtnText: { flex: 1, fontSize: 16, color: '#333' },
  arrow: { fontSize: 10, color: '#999' },
  pickerOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  pickerBox: { backgroundColor: '#fff', borderRadius: 12, width: 300, maxHeight: 400 },
  pickerTitle: { fontSize: 16, fontWeight: 'bold', textAlign: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#eee' },
  pickerScroll: { maxHeight: 300 },
  pickerItem: { flexDirection: 'row', alignItems: 'center', padding: 14, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  pickerItemText: { fontSize: 16, color: '#333' },
});

export default EventCreateScreen;
