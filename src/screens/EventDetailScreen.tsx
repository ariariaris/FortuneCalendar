// Fortune Calendar 予定詳細・編集画面 v1.0
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Platform, Switch, Modal } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppStore } from '../store/useAppStore';
import { DateInput } from '../components/DateInput';
import { TimePickerModal } from '../components/event/TimePickerModal';
import { RecurrenceSelector } from '../components/event/RecurrenceSelector';
import { ReminderSelector } from '../components/event/ReminderSelector';
import {
  updateNativeCalendarEvent,
  deleteNativeCalendarEvent,
  RecurrenceType,
  EventCreateData,
} from '../services/nativeCalendarService';
import { ExternalCalendarEvent } from '../types/externalCalendar';

interface EventDetailScreenProps {
  visible: boolean;
  event: ExternalCalendarEvent | null;
  onClose: () => void;
  onUpdate: () => void;
}

export const EventDetailScreen: React.FC<EventDetailScreenProps> = ({
  visible,
  event,
  onClose,
  onUpdate,
}) => {
  const { userConfig } = useAppStore();
  const themeColor = userConfig.themeColor || '#FF69B4';
  const insets = useSafeAreaInsets();

  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState('');
  const [isAllDay, setIsAllDay] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState({ hour: 0, minute: 0 });
  const [endDate, setEndDate] = useState('');
  const [endTime, setEndTime] = useState({ hour: 0, minute: 0 });
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [recurrence, setRecurrence] = useState<RecurrenceType>('none');
  const [reminders, setReminders] = useState<number[]>([]);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);
  const [saving, setSaving] = useState(false);

  // イベントデータをフォームにセット
  useEffect(() => {
    if (visible && event) {
      setTitle(event.title);
      setIsAllDay(event.isAllDay);
      setLocation(event.location || '');
      setNotes(event.description || '');
      setRecurrence('none');
      setReminders([]);
      setIsEditing(false);

      // 日時パース
      const startDt = new Date(event.startTime);
      const endDt = new Date(event.endTime);
      setStartDate(event.startTime.split('T')[0]);
      setEndDate(event.endTime.split('T')[0]);
      setStartTime({ hour: startDt.getHours(), minute: startDt.getMinutes() });
      setEndTime({ hour: endDt.getHours(), minute: endDt.getMinutes() });
    }
  }, [visible, event]);

  // ネイティブイベントID取得（native_プレフィックスを除去）
  const getNativeEventId = (): string | null => {
    if (!event) return null;
    if (event.id.startsWith('native_')) {
      return event.id.replace('native_', '');
    }
    return null;
  };

  const handleSave = async () => {
    const nativeId = getNativeEventId();
    if (!nativeId) {
      Alert.alert('エラー', 'この予定は編集できません');
      return;
    }
    if (!title.trim()) {
      Alert.alert('エラー', 'タイトルを入力してください');
      return;
    }

    const [sy, sm, sd] = startDate.split('-').map(Number);
    const [ey, em, ed] = endDate.split('-').map(Number);
    const start = new Date(sy, sm - 1, sd, isAllDay ? 0 : startTime.hour, isAllDay ? 0 : startTime.minute);
    const end = new Date(ey, em - 1, ed, isAllDay ? 23 : endTime.hour, isAllDay ? 59 : endTime.minute);

    if (start >= end) {
      Alert.alert('エラー', '終了日時は開始日時より後にしてください');
      return;
    }

    setSaving(true);
    const data: Partial<EventCreateData> = {
      title: title.trim(),
      startDate: start,
      endDate: end,
      isAllDay,
      location: location.trim() || undefined,
      notes: notes.trim() || undefined,
      recurrence,
      reminders: reminders.length > 0 ? reminders : undefined,
    };

    const success = await updateNativeCalendarEvent(nativeId, data);
    setSaving(false);

    if (success) {
      Alert.alert('完了', '予定を更新しました', [{ text: 'OK', onPress: () => { onUpdate(); onClose(); } }]);
    } else {
      Alert.alert('エラー', '予定の更新に失敗しました');
    }
  };

  const handleDelete = () => {
    const nativeId = getNativeEventId();
    if (!nativeId) {
      Alert.alert('エラー', 'この予定は削除できません');
      return;
    }

    Alert.alert('確認', 'この予定を削除しますか？', [
      { text: 'キャンセル', style: 'cancel' },
      {
        text: '削除', style: 'destructive', onPress: async () => {
          const success = await deleteNativeCalendarEvent(nativeId);
          if (success) {
            Alert.alert('完了', '予定を削除しました', [{ text: 'OK', onPress: () => { onUpdate(); onClose(); } }]);
          } else {
            Alert.alert('エラー', '予定の削除に失敗しました');
          }
        }
      },
    ]);
  };

  const formatTime = (h: number, m: number) => `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  const isNativeEvent = event?.id.startsWith('native_');

  if (Platform.OS === 'web' || !event) return null;

  return (
    <Modal visible={visible} animationType="slide">
      <View style={[s.container, { paddingTop: insets.top }]}>
        {/* ヘッダー */}
        <View style={s.header}>
          <TouchableOpacity onPress={onClose} style={s.headerBtn}>
            <Text style={s.cancelText}>{isEditing ? 'キャンセル' : '閉じる'}</Text>
          </TouchableOpacity>
          <Text style={s.headerTitle}>{isEditing ? '予定を編集' : '予定の詳細'}</Text>
          {isEditing ? (
            <TouchableOpacity onPress={handleSave} style={s.headerBtn} disabled={saving}>
              <Text style={[s.saveText, { color: themeColor }]}>{saving ? '保存中...' : '保存'}</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={() => setIsEditing(true)} style={s.headerBtn} disabled={!isNativeEvent}>
              <Text style={[s.saveText, { color: isNativeEvent ? themeColor : '#ccc' }]}>編集</Text>
            </TouchableOpacity>
          )}
        </View>

        <ScrollView style={s.scroll} showsVerticalScrollIndicator={false}>
          {/* タイトル */}
          <View style={s.section}>
            <Text style={s.label}>タイトル</Text>
            {isEditing ? (
              <TextInput style={s.input} value={title} onChangeText={setTitle} placeholder="イベント名" placeholderTextColor="#999" />
            ) : (
              <Text style={s.value}>{title}</Text>
            )}
          </View>

          {/* 終日 */}
          {isEditing && (
            <View style={s.section}>
              <View style={s.row}>
                <Text style={s.label}>終日</Text>
                <Switch value={isAllDay} onValueChange={setIsAllDay} />
              </View>
            </View>
          )}

          {/* 開始日時 */}
          <View style={s.section}>
            <Text style={s.label}>開始</Text>
            {isEditing ? (
              <View style={s.dateTimeRow}>
                <View style={s.dateInputWrap}><DateInput value={startDate} onChange={setStartDate} /></View>
                {!isAllDay && (
                  <TouchableOpacity style={s.timeBtn} onPress={() => setShowStartTimePicker(true)}>
                    <Text style={s.timeBtnText}>{formatTime(startTime.hour, startTime.minute)}</Text>
                  </TouchableOpacity>
                )}
              </View>
            ) : (
              <Text style={s.value}>{startDate} {!isAllDay && formatTime(startTime.hour, startTime.minute)}</Text>
            )}
          </View>

          {/* 終了日時 */}
          <View style={s.section}>
            <Text style={s.label}>終了</Text>
            {isEditing ? (
              <View style={s.dateTimeRow}>
                <View style={s.dateInputWrap}><DateInput value={endDate} onChange={setEndDate} /></View>
                {!isAllDay && (
                  <TouchableOpacity style={s.timeBtn} onPress={() => setShowEndTimePicker(true)}>
                    <Text style={s.timeBtnText}>{formatTime(endTime.hour, endTime.minute)}</Text>
                  </TouchableOpacity>
                )}
              </View>
            ) : (
              <Text style={s.value}>{endDate} {!isAllDay && formatTime(endTime.hour, endTime.minute)}</Text>
            )}
          </View>

          {/* 場所 */}
          <View style={s.section}>
            <Text style={s.label}>場所</Text>
            {isEditing ? (
              <TextInput style={s.input} value={location} onChangeText={setLocation} placeholder="場所（任意）" placeholderTextColor="#999" />
            ) : (
              <Text style={s.value}>{location || '未設定'}</Text>
            )}
          </View>

          {/* メモ */}
          <View style={s.section}>
            <Text style={s.label}>メモ</Text>
            {isEditing ? (
              <TextInput style={[s.input, s.textArea]} value={notes} onChangeText={setNotes} placeholder="メモ（任意）" placeholderTextColor="#999" multiline numberOfLines={3} />
            ) : (
              <Text style={s.value}>{notes || '未設定'}</Text>
            )}
          </View>

          {/* 繰り返し（編集時のみ） */}
          {isEditing && (
            <View style={s.section}>
              <RecurrenceSelector value={recurrence} onChange={setRecurrence} themeColor={themeColor} />
            </View>
          )}

          {/* 通知（編集時のみ） */}
          {isEditing && (
            <View style={s.section}>
              <ReminderSelector value={reminders} onChange={setReminders} themeColor={themeColor} />
            </View>
          )}

          {/* カレンダー名（表示のみ） */}
          {event.calendarName && (
            <View style={s.section}>
              <Text style={s.label}>カレンダー</Text>
              <View style={s.calendarInfo}>
                <View style={[s.calendarDot, { backgroundColor: event.calendarColor || '#4285F4' }]} />
                <Text style={s.value}>{event.calendarName}</Text>
              </View>
            </View>
          )}

          {/* 削除ボタン */}
          {isNativeEvent && (
            <TouchableOpacity style={s.deleteBtn} onPress={handleDelete}>
              <Text style={s.deleteBtnText}>この予定を削除</Text>
            </TouchableOpacity>
          )}

          <View style={{ height: 40 }} />
        </ScrollView>

        {/* 時刻ピッカー */}
        <TimePickerModal visible={showStartTimePicker} value={startTime} onSelect={(h, m) => setStartTime({ hour: h, minute: m })} onClose={() => setShowStartTimePicker(false)} themeColor={themeColor} />
        <TimePickerModal visible={showEndTimePicker} value={endTime} onSelect={(h, m) => setEndTime({ hour: h, minute: m })} onClose={() => setShowEndTimePicker(false)} themeColor={themeColor} />
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
  value: { fontSize: 16, color: '#333' },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 16, color: '#333', backgroundColor: '#fafafa' },
  textArea: { height: 80, textAlignVertical: 'top' },
  dateTimeRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  dateInputWrap: { flex: 1 },
  timeBtn: { backgroundColor: '#eee', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8 },
  timeBtnText: { fontSize: 16, fontWeight: '600', color: '#333' },
  calendarInfo: { flexDirection: 'row', alignItems: 'center' },
  calendarDot: { width: 12, height: 12, borderRadius: 6, marginRight: 10 },
  deleteBtn: { backgroundColor: '#fff', borderRadius: 10, padding: 16, marginTop: 8, alignItems: 'center' },
  deleteBtnText: { fontSize: 16, color: '#FF3B30', fontWeight: '600' },
});

export default EventDetailScreen;
