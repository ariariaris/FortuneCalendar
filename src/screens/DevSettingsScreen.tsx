// Fortune Calendar 開発者設定画面 v1.0
import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput, Switch,
  TouchableOpacity, Alert, Share, Platform,
} from 'react-native';
import { DevConfig } from '../config/types';
import { configManager } from '../config/configManager';
import { DEFAULT_DEV_CONFIG, FORTUNE_LIST, APP_VERSION } from '../config/defaultConfig';

interface Props {
  onClose: () => void;
}

export const DevSettingsScreen: React.FC<Props> = ({ onClose }) => {
  const [config, setConfig] = useState<DevConfig>(DEFAULT_DEV_CONFIG);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    await configManager.init();
    setConfig(configManager.getDevConfig());
    setLoading(false);
  };

  const saveConfig = async (newConfig: Partial<DevConfig>) => {
    const merged = { ...config, ...newConfig };
    setConfig(merged);
    await configManager.setDevConfig(merged);
  };

  const handleExport = async () => {
    const data = configManager.exportConfig();
    const json = JSON.stringify(data, null, 2);
    if (Platform.OS === 'web') {
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `fortune_config_${Date.now()}.json`;
      a.click();
    } else {
      await Share.share({ message: json, title: 'Fortune Calendar設定' });
    }
  };

  const handleReset = () => {
    Alert.alert('確認', '設定を初期値に戻しますか？', [
      { text: 'キャンセル', style: 'cancel' },
      { text: 'リセット', style: 'destructive', onPress: async () => {
        await configManager.resetDevConfig();
        setConfig(DEFAULT_DEV_CONFIG);
      }},
    ]);
  };

  if (loading) return <View style={s.container}><Text>読み込み中...</Text></View>;

  return (
    <View style={s.container}>
      <View style={s.header}>
        <Text style={s.title}>🔧 開発者設定</Text>
        <TouchableOpacity onPress={onClose}><Text style={s.close}>×</Text></TouchableOpacity>
      </View>
      <ScrollView style={s.scroll}>
        <Section title="UI設定">
          <Row label="デフォルト占術">
            <Text style={s.value}>{FORTUNE_LIST.find(f => f.id === config.ui.defaultFortune)?.name}</Text>
          </Row>
          <Row label="テーマカラー">
            <TextInput style={s.input} value={config.ui.themeColor}
              onChangeText={v => saveConfig({ ui: { ...config.ui, themeColor: v } })} />
          </Row>
        </Section>
        <Section title="占術設定">
          <Row label="更新時刻">
            <TextInput style={s.input} keyboardType="numeric" value={String(config.fortune.updateHour)}
              onChangeText={v => saveConfig({ fortune: { ...config.fortune, updateHour: Number(v) || 5 } })} />
          </Row>
          <Row label="履歴保持日数">
            <TextInput style={s.input} keyboardType="numeric" value={String(config.fortune.historyDays)}
              onChangeText={v => saveConfig({ fortune: { ...config.fortune, historyDays: Number(v) || 7 } })} />
          </Row>
        </Section>
        <Section title="課金設定">
          <Row label="月額価格">
            <TextInput style={s.input} keyboardType="numeric" value={String(config.payment.monthlyPrice)}
              onChangeText={v => saveConfig({ payment: { ...config.payment, monthlyPrice: Number(v) || 380 } })} />
          </Row>
          <Row label="買切価格">
            <TextInput style={s.input} keyboardType="numeric" value={String(config.payment.lifetimePrice)}
              onChangeText={v => saveConfig({ payment: { ...config.payment, lifetimePrice: Number(v) || 1480 } })} />
          </Row>
          <Row label="広告表示">
            <Switch value={config.payment.showAds}
              onValueChange={v => saveConfig({ payment: { ...config.payment, showAds: v } })} />
          </Row>
        </Section>
        <Section title="システム">
          <Row label="デバッグログ">
            <Switch value={config.system.debugLog}
              onValueChange={v => saveConfig({ system: { ...config.system, debugLog: v } })} />
          </Row>
          <Row label="モック占い結果">
            <Switch value={config.system.mockResults}
              onValueChange={v => saveConfig({ system: { ...config.system, mockResults: v } })} />
          </Row>
        </Section>
        <View style={s.buttons}>
          <TouchableOpacity style={s.btn} onPress={handleExport}><Text>設定エクスポート</Text></TouchableOpacity>
          <TouchableOpacity style={s.btn} onPress={handleReset}><Text>初期値に戻す</Text></TouchableOpacity>
        </View>
        <Text style={s.version}>Fortune Calendar v{APP_VERSION}</Text>
      </ScrollView>
    </View>
  );
};

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <View style={s.section}><Text style={s.sectionTitle}>{title}</Text>{children}</View>
);

const Row: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <View style={s.row}><Text style={s.label}>{label}</Text>{children}</View>
);

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#ddd' },
  title: { fontSize: 18, fontWeight: 'bold' },
  close: { fontSize: 24, color: '#666' },
  scroll: { flex: 1 },
  section: { backgroundColor: '#fff', marginTop: 16, paddingHorizontal: 16 },
  sectionTitle: { fontSize: 14, fontWeight: 'bold', color: '#666', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#eee' },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#eee' },
  label: { fontSize: 14 },
  value: { fontSize: 14, color: '#666' },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 4, paddingHorizontal: 8, paddingVertical: 4, width: 100, textAlign: 'right' },
  buttons: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 24 },
  btn: { backgroundColor: '#ddd', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8 },
  version: { textAlign: 'center', color: '#999', paddingBottom: 24 },
});

export default DevSettingsScreen;
