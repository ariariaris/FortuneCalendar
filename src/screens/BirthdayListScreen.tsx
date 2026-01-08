// 誕生日一覧画面
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppStore } from '../store/useAppStore';
import { BirthdayEntry, BirthdayDisplayItem } from '../types/birthday';
import {
  requestContactsPermission,
  checkContactsPermission,
  fetchBirthdays,
  toBirthdayDisplayItems,
  calculateAge,
} from '../services/birthdayService';
import { saveBirthdayEntries, getBirthdayEntries, clearBirthdayEntries } from '../services/storageService';

interface Props {
  onClose?: () => void;
}

export const BirthdayListScreen: React.FC<Props> = ({ onClose }) => {
  const insets = useSafeAreaInsets();
  const { userConfig } = useAppStore();
  const [entries, setEntries] = useState<BirthdayEntry[]>([]);
  const [displayItems, setDisplayItems] = useState<BirthdayDisplayItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const themeColor = userConfig.themeColor || '#FF69B4';
  const showAge = userConfig.birthday?.showAge ?? true;

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const perm = await checkContactsPermission();
    setHasPermission(perm);
    const saved = await getBirthdayEntries();
    setEntries(saved);
    setDisplayItems(toBirthdayDisplayItems(saved));
  };

  const handleRequestPermission = async () => {
    setLoading(true);
    const granted = await requestContactsPermission();
    setHasPermission(granted);
    if (granted) {
      await handleSync();
    } else {
      Alert.alert('アクセス拒否', '連絡先へのアクセスが許可されませんでした。');
    }
    setLoading(false);
  };

  const handleSync = async () => {
    setLoading(true);
    try {
      const fetched = await fetchBirthdays();
      await saveBirthdayEntries(fetched);
      setEntries(fetched);
      setDisplayItems(toBirthdayDisplayItems(fetched));
      Alert.alert('取り込み完了', `${fetched.length}件の誕生日を取り込みました`);
    } catch (error) {
      Alert.alert('エラー', '誕生日の取り込みに失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const now = new Date();
  const currentMonth = now.getMonth() + 1;

  return (
    <View style={[s.container, { paddingTop: insets.top }]}>
      <View style={s.header}>
        <TouchableOpacity onPress={onClose} style={s.backBtn}>
          <Text style={s.backText}>← 戻る</Text>
        </TouchableOpacity>
        <Text style={s.title}>誕生日一覧</Text>
        <View style={s.backBtn} />
      </View>

      <ScrollView style={s.content}>
        {/* 権限未許可時 */}
        {hasPermission === false && (
          <View style={s.permissionBox}>
            <Text style={s.permIcon}>🎂</Text>
            <Text style={s.permTitle}>友人や家族の誕生日をカレンダーに表示できます。</Text>
            <Text style={s.permDesc}>Fortune Calendarは以下のデータのみ読み取ります:</Text>
            <Text style={s.permItem}>✅ 名前</Text>
            <Text style={s.permItem}>✅ 誕生日</Text>
            <Text style={s.permDesc}>以下のデータは読み取りません:</Text>
            <Text style={s.permItemNo}>❌ 電話番号</Text>
            <Text style={s.permItemNo}>❌ メールアドレス</Text>
            <Text style={s.permItemNo}>❌ 住所</Text>
            <TouchableOpacity style={[s.permBtn, { backgroundColor: themeColor }]} onPress={handleRequestPermission} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.permBtnText}>連絡先へのアクセスを許可</Text>}
            </TouchableOpacity>
          </View>
        )}

        {/* 誕生日一覧 */}
        {hasPermission && (
          <>
            {displayItems.filter((i) => i.isThisMonth).length > 0 && (
              <View style={s.section}>
                <Text style={s.sectionTitle}>今月</Text>
                {displayItems.filter((i) => i.isThisMonth).map((item) => (
                  <View key={item.date} style={s.dateGroup}>
                    <Text style={s.dateLabel}>{parseInt(item.date.split('-')[0])}月{parseInt(item.date.split('-')[1])}日</Text>
                    {item.entries.map((e) => (
                      <View key={e.id} style={s.entryRow}>
                        <Text style={s.entryIcon}>🎂</Text>
                        <Text style={s.entryName}>{e.displayName}</Text>
                        {showAge && e.birthday.year && <Text style={s.entryAge}>{calculateAge(e.birthday.year)}歳</Text>}
                      </View>
                    ))}
                  </View>
                ))}
              </View>
            )}

            {displayItems.filter((i) => !i.isThisMonth).length > 0 && (
              <View style={s.section}>
                <Text style={s.sectionTitle}>その他</Text>
                {displayItems.filter((i) => !i.isThisMonth).slice(0, 20).map((item) => (
                  <View key={item.date} style={s.dateGroup}>
                    <Text style={s.dateLabel}>{parseInt(item.date.split('-')[0])}月{parseInt(item.date.split('-')[1])}日 (あと{item.daysUntil}日)</Text>
                    {item.entries.map((e) => (
                      <View key={e.id} style={s.entryRow}>
                        <Text style={s.entryIcon}>🎂</Text>
                        <Text style={s.entryName}>{e.displayName}</Text>
                        {showAge && e.birthday.year && <Text style={s.entryAge}>{calculateAge(e.birthday.year)}歳</Text>}
                      </View>
                    ))}
                  </View>
                ))}
              </View>
            )}

            <View style={s.footer}>
              <Text style={s.footerText}>全 {entries.length} 件</Text>
              <TouchableOpacity style={s.syncBtn} onPress={handleSync} disabled={loading}>
                {loading ? <ActivityIndicator size="small" color={themeColor} /> : <Text style={[s.syncText, { color: themeColor }]}>🔄 連絡先を再読み込み</Text>}
              </TouchableOpacity>
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
};

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, backgroundColor: '#fff', borderBottomWidth: 0.5, borderBottomColor: '#E5E5E5' },
  backBtn: { width: 60 },
  backText: { fontSize: 16, color: '#007AFF' },
  title: { fontSize: 18, fontWeight: '600', color: '#1C1C1E' },
  content: { flex: 1, padding: 16 },
  permissionBox: { backgroundColor: '#fff', borderRadius: 12, padding: 24, alignItems: 'center' },
  permIcon: { fontSize: 48, marginBottom: 16 },
  permTitle: { fontSize: 16, fontWeight: '600', color: '#333', textAlign: 'center', marginBottom: 16 },
  permDesc: { fontSize: 14, color: '#666', marginTop: 8, marginBottom: 4 },
  permItem: { fontSize: 14, color: '#22C55E' },
  permItemNo: { fontSize: 14, color: '#999' },
  permBtn: { marginTop: 24, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8 },
  permBtnText: { fontSize: 16, fontWeight: '600', color: '#fff' },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 14, fontWeight: '600', color: '#666', marginBottom: 12 },
  dateGroup: { backgroundColor: '#fff', borderRadius: 8, padding: 12, marginBottom: 8 },
  dateLabel: { fontSize: 12, color: '#666', marginBottom: 4 },
  entryRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 4 },
  entryIcon: { fontSize: 14, marginRight: 8 },
  entryName: { flex: 1, fontSize: 14, color: '#333' },
  entryAge: { fontSize: 12, color: '#666' },
  footer: { alignItems: 'center', paddingVertical: 16 },
  footerText: { fontSize: 12, color: '#999', marginBottom: 12 },
  syncBtn: { padding: 12 },
  syncText: { fontSize: 14, fontWeight: '600' },
});

export default BirthdayListScreen;
