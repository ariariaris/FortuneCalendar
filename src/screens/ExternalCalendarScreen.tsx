// 外部カレンダー連携設定画面
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppStore } from '../store/useAppStore';
import { ExternalCalendarAccount } from '../types/externalCalendar';
import {
  startGoogleAuth,
  disconnectAccount,
  fetchGoogleCalendarEvents,
  handleCalendarError,
} from '../services/externalCalendarService';
import { saveExternalEvents, deleteExternalEventsByAccount } from '../services/storageService';

interface Props {
  onClose?: () => void;
}

export const ExternalCalendarScreen: React.FC<Props> = ({ onClose }) => {
  const insets = useSafeAreaInsets();
  const { userConfig, setUserConfig } = useAppStore();
  const [accounts, setAccounts] = useState<ExternalCalendarAccount[]>([]);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState<string | null>(null);
  const themeColor = userConfig.themeColor || '#FF69B4';

  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    // TODO: DBからアカウント一覧を読み込む
    // 現時点ではローカルステートのみ
  };

  const handleConnectGoogle = async () => {
    setLoading(true);
    try {
      const account = await startGoogleAuth();
      if (account) {
        setAccounts((prev) => [...prev, account]);
        Alert.alert('成功', 'Google Calendarと連携しました');
        syncEvents(account.id);
      }
    } catch (error) {
      Alert.alert('エラー', '連携に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = (accountId: string) => {
    Alert.alert(
      '連携解除',
      'このカレンダーとの連携を解除しますか？',
      [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: '解除',
          style: 'destructive',
          onPress: async () => {
            await disconnectAccount(accountId);
            await deleteExternalEventsByAccount(accountId);
            setAccounts((prev) => prev.filter((a) => a.id !== accountId));
          },
        },
      ]
    );
  };

  const syncEvents = async (accountId: string) => {
    setSyncing(accountId);
    try {
      const { events, error } = await fetchGoogleCalendarEvents(accountId);
      if (error) {
        const { message } = handleCalendarError(error);
        Alert.alert('同期エラー', message);
      } else {
        await saveExternalEvents(events);
        Alert.alert('同期完了', `${events.length}件のイベントを取得しました`);
      }
    } finally {
      setSyncing(null);
    }
  };

  return (
    <View style={[s.container, { paddingTop: insets.top }]}>
      <View style={s.header}>
        <TouchableOpacity onPress={onClose} style={s.backBtn}>
          <Text style={s.backText}>← 戻る</Text>
        </TouchableOpacity>
        <Text style={s.title}>カレンダー連携</Text>
        <View style={s.backBtn} />
      </View>

      <ScrollView style={s.content}>
        {/* 接続済みアカウント */}
        {accounts.length > 0 && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>接続済みカレンダー</Text>
            {accounts.map((account) => (
              <View key={account.id} style={s.accountCard}>
                <View style={s.accountInfo}>
                  <Text style={s.accountIcon}>📅</Text>
                  <View style={s.accountText}>
                    <Text style={s.accountName}>{account.displayName}</Text>
                    <Text style={s.accountEmail}>{account.email}</Text>
                    <Text style={s.readOnly}>読み取り専用</Text>
                  </View>
                </View>
                <View style={s.accountActions}>
                  {syncing === account.id ? (
                    <ActivityIndicator size="small" color={themeColor} />
                  ) : (
                    <TouchableOpacity onPress={() => syncEvents(account.id)} style={s.syncBtn}>
                      <Text style={s.syncText}>同期</Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity onPress={() => handleDisconnect(account.id)} style={s.disconnectBtn}>
                    <Text style={s.disconnectText}>解除</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* 新規連携 */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>新規連携</Text>
          <TouchableOpacity
            style={[s.connectBtn, { backgroundColor: themeColor }]}
            onPress={handleConnectGoogle}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={s.connectText}>+ Google Calendarと連携</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* 注意書き */}
        <View style={s.notice}>
          <Text style={s.noticeIcon}>⚠️</Text>
          <Text style={s.noticeText}>
            Fortune Calendarは予定の読み取りのみを行います。{'\n'}
            外部カレンダーへの書き込みは一切行いません。
          </Text>
        </View>
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
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 14, fontWeight: '600', color: '#666', marginBottom: 12 },
  accountCard: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  accountInfo: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  accountIcon: { fontSize: 24, marginRight: 12 },
  accountText: { flex: 1 },
  accountName: { fontSize: 16, fontWeight: '600', color: '#333' },
  accountEmail: { fontSize: 12, color: '#666', marginTop: 2 },
  readOnly: { fontSize: 11, color: '#999', marginTop: 2 },
  accountActions: { flexDirection: 'row', gap: 8 },
  syncBtn: { paddingHorizontal: 12, paddingVertical: 6, backgroundColor: '#E8F4FD', borderRadius: 6 },
  syncText: { fontSize: 12, color: '#007AFF' },
  disconnectBtn: { paddingHorizontal: 12, paddingVertical: 6, backgroundColor: '#FEE2E2', borderRadius: 6 },
  disconnectText: { fontSize: 12, color: '#DC2626' },
  connectBtn: { padding: 16, borderRadius: 12, alignItems: 'center' },
  connectText: { fontSize: 16, fontWeight: '600', color: '#fff' },
  notice: { flexDirection: 'row', backgroundColor: '#FEF3C7', borderRadius: 12, padding: 16, marginTop: 16 },
  noticeIcon: { fontSize: 16, marginRight: 8 },
  noticeText: { flex: 1, fontSize: 13, color: '#92400E', lineHeight: 20 },
});

export default ExternalCalendarScreen;
