// Fortune Calendar 設定画面 v1.5 (テーマカラー・文字サイズ追加)
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal, Alert, Switch } from 'react-native';
import { useAppStore } from '../store/useAppStore';
import { DevSettingsScreen } from './DevSettingsScreen';
import { MyCharacter } from '../components/MyCharacter';
import { DEV_PASSCODE, APP_VERSION, FORTUNE_LIST, THEME_COLORS, FONT_SIZES } from '../config/defaultConfig';
import { FontSize } from '../config/types';
import { FaceReadingScreen } from '../components/faceReading/FaceReadingScreen';
import { FourPillarsScreen } from '../components/fourPillars/FourPillarsScreen';
import { PalmReadingScreen } from '../components/palmReading/PalmReadingScreen';

export const SettingsScreen: React.FC = () => {
  const { userConfig, setUserConfig, setProfile } = useAppStore();
  const [tapCount, setTapCount] = useState(0);
  const [showPasscode, setShowPasscode] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [showDevSettings, setShowDevSettings] = useState(false);

  // AI占いモーダル
  const [showFaceReading, setShowFaceReading] = useState(false);
  const [showFourPillars, setShowFourPillars] = useState(false);
  const [showPalmReading, setShowPalmReading] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);

  const themeColor = userConfig.themeColor || '#FF69B4';
  const fontSize = userConfig.fontSize || 'md';

  // プロフィール
  const profile = userConfig.userProfile;
  const birthStr = profile?.birthDate || '1990-01-01';
  const [birthY, birthM, birthD] = birthStr.split('-').map(Number);
  const [showPicker, setShowPicker] = useState<'year' | 'month' | 'day' | null>(null);

  // 自動保存ヘルパー
  const updateProfile = (updates: { name?: string; birthDate?: string; gender?: 'male' | 'female' | 'other'; bloodType?: 'A' | 'B' | 'O' | 'AB' }) => {
    setProfile({ name: profile?.name, birthDate: birthStr, gender: profile?.gender || 'female', bloodType: profile?.bloodType || 'A', ...updates });
  };

  const handleTap = () => {
    const newCount = tapCount + 1;
    setTapCount(newCount);
    if (newCount >= 10) {
      setShowPasscode(true);
      setTapCount(0);
    }
    setTimeout(() => setTapCount(0), 2000);
  };

  const handlePasscodeSubmit = () => {
    if (passcode === DEV_PASSCODE) {
      setShowPasscode(false);
      setShowDevSettings(true);
      setPasscode('');
    } else {
      Alert.alert('エラー', 'パスコードが違います');
      setPasscode('');
    }
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 100 }, (_, i) => currentYear - i);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const days = Array.from({ length: 31 }, (_, i) => i + 1);

  const toggleFortune = (id: string) => {
    const enabled = userConfig.enabledFortunes || ['honDoubutsu'];
    const newEnabled = enabled.includes(id) ? enabled.filter((f) => f !== id) : [...enabled, id];
    if (newEnabled.length === 0) { Alert.alert('エラー', '最低1つは選択してください'); return; }
    setUserConfig({ enabledFortunes: newEnabled });
  };
  const freeFortunes = FORTUNE_LIST.filter((f) => f.category === 'free');

  return (
    <View style={s.container}>
      <View style={s.header}><MyCharacter size={40} showName /></View>
      <ScrollView style={s.scroll}>
        <Text style={s.section}>プロフィール</Text>
        <View style={s.card}>
          <View style={s.row}>
            <Text style={s.label}>お名前</Text>
            <TextInput style={s.input} value={profile?.name || ''} onChangeText={(v) => updateProfile({ name: v || undefined })} placeholder="(任意)" />
          </View>
          <View style={s.row}>
            <Text style={s.label}>生年月日</Text>
            <View style={s.dateRow}>
              <TouchableOpacity style={s.dateBtn} onPress={() => setShowPicker('year')}><Text style={s.dateBtnText}>{birthY}年</Text></TouchableOpacity>
              <TouchableOpacity style={s.dateBtn} onPress={() => setShowPicker('month')}><Text style={s.dateBtnText}>{birthM}月</Text></TouchableOpacity>
              <TouchableOpacity style={s.dateBtn} onPress={() => setShowPicker('day')}><Text style={s.dateBtnText}>{birthD}日</Text></TouchableOpacity>
            </View>
          </View>
          <View style={s.row}>
            <Text style={s.label}>性別</Text>
            <View style={s.btnGroup}>
              {([['female', '女性'], ['male', '男性'], ['other', 'その他']] as const).map(([v, label]) => (
                <TouchableOpacity key={v} style={[s.btBtn, (profile?.gender || 'female') === v && s.btBtnActive]} onPress={() => updateProfile({ gender: v })}>
                  <Text style={[s.btText, (profile?.gender || 'female') === v && s.btTextActive]}>{label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          <View style={s.row}>
            <Text style={s.label}>血液型</Text>
            <View style={s.btnGroup}>
              {(['A', 'B', 'O', 'AB'] as const).map((bt) => (
                <TouchableOpacity key={bt} style={[s.btBtn, (profile?.bloodType || 'A') === bt && s.btBtnActive]} onPress={() => updateProfile({ bloodType: bt })}>
                  <Text style={[s.btText, (profile?.bloodType || 'A') === bt && s.btTextActive]}>{bt}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        <Text style={s.section}>通知</Text>
        <View style={s.card}>
          <View style={s.row}>
            <Text style={s.label}>朝の占いリマインダー</Text>
            <Switch value={userConfig.notificationEnabled} onValueChange={(v) => setUserConfig({ notificationEnabled: v })} />
          </View>
        </View>

        <Text style={s.section}>表示</Text>
        <View style={s.card}>
          <View style={s.row}>
            <Text style={s.label}>ダークモード</Text>
            <Switch value={userConfig.themeMode === 'dark'} onValueChange={(v) => setUserConfig({ themeMode: v ? 'dark' : 'light' })} />
          </View>
          <View style={s.row}>
            <Text style={s.label}>テーマカラー</Text>
            <TouchableOpacity style={s.colorBtn} onPress={() => setShowColorPicker(true)}>
              <View style={[s.colorPreview, { backgroundColor: themeColor }]} />
              <Text style={s.colorName}>{THEME_COLORS.find(c => c.color === themeColor)?.name || 'ピンク'}</Text>
            </TouchableOpacity>
          </View>
          <View style={s.row}>
            <Text style={s.label}>文字サイズ</Text>
            <View style={s.btnGroup}>
              {(Object.keys(FONT_SIZES) as FontSize[]).map((key) => (
                <TouchableOpacity key={key} style={[s.btBtn, fontSize === key && { backgroundColor: themeColor }]} onPress={() => setUserConfig({ fontSize: key })}>
                  <Text style={[s.btText, fontSize === key && s.btTextActive]}>{FONT_SIZES[key].label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          <View style={s.row}>
            <Text style={s.label}>星をカラフルに表示</Text>
            <Switch value={userConfig.starColorMode === 'colorful'} onValueChange={(v) => setUserConfig({ starColorMode: v ? 'colorful' : 'simple' })} />
          </View>
        </View>

        <Text style={s.section}>天気予報</Text>
        <View style={s.card}>
          <View style={s.row}>
            <Text style={s.label}>天気を表示</Text>
            <Switch value={userConfig.weatherConfig?.enabled ?? true} onValueChange={(v) => setUserConfig({ weatherConfig: { ...userConfig.weatherConfig, enabled: v } })} />
          </View>
          <View style={s.row}>
            <Text style={s.label}>天気アイコン</Text>
            <Switch value={userConfig.weatherConfig?.showIcon ?? true} onValueChange={(v) => setUserConfig({ weatherConfig: { ...userConfig.weatherConfig, showIcon: v } })} />
          </View>
          <View style={s.row}>
            <Text style={s.label}>気温</Text>
            <Switch value={userConfig.weatherConfig?.showTemp ?? true} onValueChange={(v) => setUserConfig({ weatherConfig: { ...userConfig.weatherConfig, showTemp: v } })} />
          </View>
          <View style={s.row}>
            <Text style={s.label}>降水確率</Text>
            <Switch value={userConfig.weatherConfig?.showRain ?? true} onValueChange={(v) => setUserConfig({ weatherConfig: { ...userConfig.weatherConfig, showRain: v } })} />
          </View>
        </View>

        <Text style={s.section}>年間カレンダー</Text>
        <View style={s.card}>
          <View style={s.row}>
            <Text style={s.label}>年齢を表示</Text>
            <Switch value={userConfig.showAge ?? true} onValueChange={(v) => setUserConfig({ showAge: v })} />
          </View>
          <View style={s.row}>
            <Text style={s.label}>★表示数/月</Text>
            <View style={s.btnGroup}>
              {[1, 2, 3, 4, 5].map((n) => (
                <TouchableOpacity key={n} style={[s.btBtn, (userConfig.yearCalendarBestCount || 3) === n && s.btBtnActive]} onPress={() => setUserConfig({ yearCalendarBestCount: n })}>
                  <Text style={[s.btText, (userConfig.yearCalendarBestCount || 3) === n && s.btTextActive]}>{n}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        <Text style={s.section}>占い</Text>
        <View style={s.card}>
          {freeFortunes.map((f) => (
            <View key={f.id} style={s.row}>
              <Text style={s.label}>{f.name}</Text>
              <Switch value={(userConfig.enabledFortunes || ['honDoubutsu']).includes(f.id)} onValueChange={() => toggleFortune(f.id)} />
            </View>
          ))}
        </View>

        <Text style={s.section}>AI占い</Text>
        <View style={s.card}>
          <TouchableOpacity style={s.aiBtn} onPress={() => setShowFaceReading(true)}>
            <Text style={s.aiBtnIcon}>👤</Text>
            <View style={s.aiBtnContent}>
              <Text style={s.aiBtnTitle}>顔相AI</Text>
              <Text style={s.aiBtnDesc}>顔写真から18項目を診断</Text>
            </View>
            <Text style={s.aiBtnArrow}>→</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.aiBtn} onPress={() => setShowFourPillars(true)}>
            <Text style={s.aiBtnIcon}>🔮</Text>
            <View style={s.aiBtnContent}>
              <Text style={s.aiBtnTitle}>四柱推命</Text>
              <Text style={s.aiBtnDesc}>生年月日から命式を算出</Text>
            </View>
            <Text style={s.aiBtnArrow}>→</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.aiBtn} onPress={() => setShowPalmReading(true)}>
            <Text style={s.aiBtnIcon}>✋</Text>
            <View style={s.aiBtnContent}>
              <Text style={s.aiBtnTitle}>手相AI</Text>
              <Text style={s.aiBtnDesc}>手のひら写真から7項目を診断</Text>
            </View>
            <Text style={s.aiBtnArrow}>→</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={handleTap} style={s.version}>
          <Text style={s.versionText}>Fortune Calendar v{APP_VERSION}</Text>
        </TouchableOpacity>
      </ScrollView>

      <Modal visible={showPasscode} transparent animationType="fade">
        <View style={s.modal}>
          <View style={s.passcodeBox}>
            <Text style={s.passcodeTitle}>開発者パスコード</Text>
            <TextInput style={s.passcodeInput} keyboardType="numeric" secureTextEntry value={passcode} onChangeText={setPasscode} maxLength={6} autoFocus />
            <View style={s.btnRow}>
              <TouchableOpacity style={s.btn} onPress={() => setShowPasscode(false)}><Text>キャンセル</Text></TouchableOpacity>
              <TouchableOpacity style={[s.btn, s.primary]} onPress={handlePasscodeSubmit}><Text style={s.primaryText}>確認</Text></TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      <Modal visible={showDevSettings} animationType="slide">
        <DevSettingsScreen onClose={() => setShowDevSettings(false)} />
      </Modal>
      <Modal visible={showFaceReading} animationType="slide">
        <FaceReadingScreen />
        <TouchableOpacity style={s.closeBtn} onPress={() => setShowFaceReading(false)}><Text style={s.closeBtnText}>閉じる</Text></TouchableOpacity>
      </Modal>
      <Modal visible={showFourPillars} animationType="slide">
        <FourPillarsScreen />
        <TouchableOpacity style={s.closeBtn} onPress={() => setShowFourPillars(false)}><Text style={s.closeBtnText}>閉じる</Text></TouchableOpacity>
      </Modal>
      <Modal visible={showPalmReading} animationType="slide">
        <PalmReadingScreen />
        <TouchableOpacity style={s.closeBtn} onPress={() => setShowPalmReading(false)}><Text style={s.closeBtnText}>閉じる</Text></TouchableOpacity>
      </Modal>
      <Modal visible={showColorPicker} transparent animationType="fade">
        <View style={s.modal}>
          <View style={s.colorPickerBox}>
            <Text style={s.pickerTitle}>テーマカラー</Text>
            <View style={s.colorGrid}>
              {THEME_COLORS.map((c) => (
                <TouchableOpacity key={c.id} style={[s.colorItem, themeColor === c.color && s.colorItemActive]} onPress={() => { setUserConfig({ themeColor: c.color }); setShowColorPicker(false); }}>
                  <View style={[s.colorCircle, { backgroundColor: c.color }]} />
                  <Text style={s.colorItemText}>{c.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity style={s.btn} onPress={() => setShowColorPicker(false)}><Text>閉じる</Text></TouchableOpacity>
          </View>
        </View>
      </Modal>
      <Modal visible={showPicker !== null} transparent animationType="fade">
        <View style={s.modal}>
          <View style={s.pickerBox}>
            <Text style={s.pickerTitle}>{showPicker === 'year' ? '年' : showPicker === 'month' ? '月' : '日'}を選択</Text>
            <ScrollView style={s.pickerScroll}>
              {(showPicker === 'year' ? years : showPicker === 'month' ? months : days).map((v) => (
                <TouchableOpacity key={v} style={s.pickerItem} onPress={() => {
                  const newY = showPicker === 'year' ? v : birthY;
                  const newM = showPicker === 'month' ? v : birthM;
                  const newD = showPicker === 'day' ? v : birthD;
                  updateProfile({ birthDate: `${newY}-${String(newM).padStart(2, '0')}-${String(newD).padStart(2, '0')}` });
                  setShowPicker(null);
                }}>
                  <Text style={s.pickerItemText}>{v}{showPicker === 'year' ? '年' : showPicker === 'month' ? '月' : '日'}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity style={s.btn} onPress={() => setShowPicker(null)}><Text>閉じる</Text></TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f8f8' },
  header: { backgroundColor: '#fff', padding: 12, alignItems: 'center', borderBottomWidth: 0.5, borderBottomColor: '#eee' },
  scroll: { flex: 1, padding: 16 },
  section: { fontSize: 14, fontWeight: 'bold', color: '#666', marginTop: 16, marginBottom: 8 },
  card: { backgroundColor: '#fff', borderRadius: 8, padding: 16 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#eee' },
  label: { fontSize: 14, color: '#333' },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 4, paddingHorizontal: 8, paddingVertical: 4, width: 120, textAlign: 'right' },
  dateRow: { flexDirection: 'row' },
  dateBtn: { paddingHorizontal: 8, paddingVertical: 4, marginLeft: 4, borderWidth: 1, borderColor: '#ddd', borderRadius: 4, backgroundColor: '#fafafa' },
  dateBtnText: { fontSize: 14, color: '#333' },
  btnGroup: { flexDirection: 'row', flexWrap: 'wrap' },
  btBtn: { paddingHorizontal: 12, paddingVertical: 6, marginLeft: 4, borderRadius: 4, backgroundColor: '#eee' },
  btBtnActive: { backgroundColor: '#FF69B4' },
  btText: { fontSize: 14, color: '#666' },
  btTextActive: { color: '#fff', fontWeight: 'bold' },
  version: { alignItems: 'center', marginTop: 32, marginBottom: 16 },
  versionText: { color: '#ccc', fontSize: 12 },
  modal: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  passcodeBox: { backgroundColor: '#fff', padding: 24, borderRadius: 12, width: 280 },
  passcodeTitle: { fontSize: 16, fontWeight: 'bold', textAlign: 'center', marginBottom: 16 },
  passcodeInput: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, fontSize: 18, textAlign: 'center', letterSpacing: 8 },
  btnRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 16 },
  btn: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8, backgroundColor: '#eee' },
  primary: { backgroundColor: '#FF69B4' },
  primaryText: { color: '#fff' },
  pickerBox: { backgroundColor: '#fff', borderRadius: 12, width: 280, maxHeight: 400 },
  pickerTitle: { fontSize: 16, fontWeight: 'bold', textAlign: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#eee' },
  pickerScroll: { maxHeight: 280 },
  pickerItem: { padding: 14, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  pickerItemText: { fontSize: 16, textAlign: 'center' },
  aiBtn: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#eee' },
  aiBtnIcon: { fontSize: 24, width: 40, textAlign: 'center' },
  aiBtnContent: { flex: 1 },
  aiBtnTitle: { fontSize: 15, fontWeight: '600', color: '#333' },
  aiBtnDesc: { fontSize: 12, color: '#999', marginTop: 2 },
  aiBtnArrow: { fontSize: 16, color: '#ccc' },
  closeBtn: { backgroundColor: '#FF69B4', padding: 16, alignItems: 'center' },
  closeBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  colorBtn: { flexDirection: 'row', alignItems: 'center' },
  colorPreview: { width: 24, height: 24, borderRadius: 12, marginRight: 8, borderWidth: 1, borderColor: '#ddd' },
  colorName: { fontSize: 14, color: '#333' },
  colorPickerBox: { backgroundColor: '#fff', borderRadius: 12, width: 320, maxHeight: 500, padding: 16 },
  colorGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginVertical: 12 },
  colorItem: { width: '23%', alignItems: 'center', paddingVertical: 8, marginBottom: 8, borderRadius: 8 },
  colorItemActive: { backgroundColor: '#f0f0f0' },
  colorCircle: { width: 32, height: 32, borderRadius: 16, borderWidth: 1, borderColor: '#ddd', marginBottom: 4 },
  colorItemText: { fontSize: 10, color: '#666' },
});

export default SettingsScreen;
