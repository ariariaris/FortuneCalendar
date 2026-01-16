// Fortune Calendar カレンダー管理画面 v1.0
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, Alert, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getNativeCalendars, deleteNativeCalendar, NativeCalendar } from '../services/nativeCalendarService';

interface Props {
  visible: boolean;
  onClose: () => void;
}

export const CalendarManagementScreen: React.FC<Props> = ({ visible, onClose }) => {
  const insets = useSafeAreaInsets();
  const [calendars, setCalendars] = useState<NativeCalendar[]>([]);
  const [loading, setLoading] = useState(false);

  const loadCalendars = useCallback(async () => {
    setLoading(true);
    const cals = await getNativeCalendars();
    // FortuneCalendar関連のカレンダーを先頭に、その他は後ろに
    const sorted = cals.sort((a, b) => {
      const aFC = a.title.startsWith('FortuneCalendar');
      const bFC = b.title.startsWith('FortuneCalendar');
      if (aFC && !bFC) return -1;
      if (!aFC && bFC) return 1;
      return a.title.localeCompare(b.title);
    });
    setCalendars(sorted);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (visible) loadCalendars();
  }, [visible, loadCalendars]);

  const handleDelete = (cal: NativeCalendar) => {
    if (!cal.allowsModifications) {
      Alert.alert('削除不可', 'このカレンダーは削除できません');
      return;
    }
    Alert.alert(
      'カレンダー削除',
      `「${cal.title}」を削除しますか？\n関連するイベントも全て削除されます。`,
      [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: '削除',
          style: 'destructive',
          onPress: async () => {
            const success = await deleteNativeCalendar(cal.id);
            if (success) {
              loadCalendars();
            } else {
              Alert.alert('エラー', '削除に失敗しました');
            }
          },
        },
      ]
    );
  };

  if (Platform.OS === 'web') {
    return (
      <Modal visible={visible} animationType="slide">
        <View style={[s.container, { paddingTop: insets.top }]}>
          <View style={s.header}>
            <Text style={s.title}>カレンダー管理</Text>
            <TouchableOpacity onPress={onClose} style={s.closeBtn}>
              <Text style={s.closeBtnText}>閉じる</Text>
            </TouchableOpacity>
          </View>
          <View style={s.emptyBox}>
            <Text style={s.emptyText}>Web版では利用できません</Text>
          </View>
        </View>
      </Modal>
    );
  }

  const fortuneCalendars = calendars.filter(c => c.title.startsWith('FortuneCalendar'));
  const otherCalendars = calendars.filter(c => !c.title.startsWith('FortuneCalendar'));

  return (
    <Modal visible={visible} animationType="slide">
      <View style={[s.container, { paddingTop: insets.top }]}>
        <View style={s.header}>
          <Text style={s.title}>カレンダー管理</Text>
          <TouchableOpacity onPress={onClose} style={s.closeBtn}>
            <Text style={s.closeBtnText}>閉じる</Text>
          </TouchableOpacity>
        </View>
        <ScrollView style={s.scroll} contentContainerStyle={s.scrollContent}>
          {loading ? (
            <Text style={s.loadingText}>読み込み中...</Text>
          ) : calendars.length === 0 ? (
            <View style={s.emptyBox}>
              <Text style={s.emptyText}>カレンダーがありません</Text>
            </View>
          ) : (
            <>
              {/* FortuneCalendar関連 */}
              {fortuneCalendars.length > 0 && (
                <View style={s.section}>
                  <Text style={s.sectionTitle}>FortuneCalendar</Text>
                  {fortuneCalendars.map(cal => (
                    <View key={cal.id} style={s.calendarItem}>
                      <View style={[s.colorDot, { backgroundColor: cal.color }]} />
                      <View style={s.calendarInfo}>
                        <Text style={s.calendarTitle}>{cal.title.replace('FortuneCalendar - ', '')}</Text>
                        <Text style={s.calendarId}>ID: {cal.id.slice(0, 8)}...</Text>
                      </View>
                      {cal.allowsModifications && (
                        <TouchableOpacity style={s.deleteBtn} onPress={() => handleDelete(cal)}>
                          <Text style={s.deleteBtnText}>削除</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  ))}
                </View>
              )}
              {/* その他のカレンダー */}
              {otherCalendars.length > 0 && (
                <View style={s.section}>
                  <Text style={s.sectionTitle}>その他のカレンダー</Text>
                  {otherCalendars.map(cal => (
                    <View key={cal.id} style={s.calendarItem}>
                      <View style={[s.colorDot, { backgroundColor: cal.color }]} />
                      <View style={s.calendarInfo}>
                        <Text style={s.calendarTitle}>{cal.title}</Text>
                        {cal.isPrimary && <Text style={s.primaryBadge}>メイン</Text>}
                      </View>
                      {!cal.allowsModifications && <Text style={s.readOnly}>読取専用</Text>}
                    </View>
                  ))}
                </View>
              )}
            </>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
};

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F2F7' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, backgroundColor: '#fff', borderBottomWidth: 0.5, borderBottomColor: '#E5E5E5' },
  title: { fontSize: 18, fontWeight: 'bold', color: '#1C1C1E' },
  closeBtn: { paddingHorizontal: 12, paddingVertical: 6 },
  closeBtnText: { fontSize: 16, color: '#007AFF' },
  scroll: { flex: 1 },
  scrollContent: { padding: 16 },
  loadingText: { textAlign: 'center', color: '#999', marginTop: 40 },
  emptyBox: { padding: 40, alignItems: 'center' },
  emptyText: { color: '#999', fontSize: 14 },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 13, fontWeight: '600', color: '#666', marginBottom: 8, paddingLeft: 4 },
  calendarItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 12, borderRadius: 10, marginBottom: 8 },
  colorDot: { width: 16, height: 16, borderRadius: 8, marginRight: 12 },
  calendarInfo: { flex: 1 },
  calendarTitle: { fontSize: 15, fontWeight: '500', color: '#1C1C1E' },
  calendarId: { fontSize: 11, color: '#999', marginTop: 2 },
  primaryBadge: { fontSize: 11, color: '#FF69B4', marginTop: 2 },
  readOnly: { fontSize: 12, color: '#999' },
  deleteBtn: { backgroundColor: '#FF3B30', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
  deleteBtnText: { color: '#fff', fontSize: 13, fontWeight: '600' },
});

export default CalendarManagementScreen;
