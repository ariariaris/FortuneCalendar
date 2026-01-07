// Fortune Calendar 設定画面 v1.1
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal, Alert, Switch } from 'react-native';
import { useAppStore } from '../store/useAppStore';
import { DevSettingsScreen } from './DevSettingsScreen';
import { MyCharacter } from '../components/MyCharacter';
import { DEV_PASSCODE, APP_VERSION, FORTUNE_LIST } from '../config/defaultConfig';

export const SettingsScreen: React.FC = () => {
  const { userConfig, setUserConfig, setProfile } = useAppStore();
  const [tapCount, setTapCount] = useState(0);
  const [showPasscode, setShowPasscode] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [showDevSettings, setShowDevSettings] = useState(false);

  // プロフィール入力
  const [name, setName] = useState(userConfig.userProfile?.name || '');
  const birthStr = userConfig.userProfile?.birthDate || '1990-01-01';
  const [initY, initM, initD] = birthStr.split('-').map(Number);
  const [year, setYear] = useState(initY || 1990);
  const [month, setMonth] = useState(initM || 1);
  const [day, setDay] = useState(initD || 1);
  const [gender, setGender] = useState<'male' | 'female' | 'other'>(userConfig.userProfile?.gender || 'female');
  const [bloodType, setBloodType] = useState(userConfig.userProfile?.bloodType || 'A');
  const [showPicker, setShowPicker] = useState<'year' | 'month' | 'day' | null>(null);

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

  const saveProfile = () => {
    const birthDate = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    setProfile({ name: name || undefined, birthDate, gender, bloodType: bloodType as 'A' | 'B' | 'O' | 'AB' });
    Alert.alert('保存しました');
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
            <TextInput style={s.input} value={name} onChangeText={setName} placeholder="(任意)" />
          </View>
          <View style={s.row}>
            <Text style={s.label}>生年月日</Text>
            <View style={s.dateRow}>
              <TouchableOpacity style={s.dateBtn} onPress={() => setShowPicker('year')}><Text style={s.dateBtnText}>{year}年</Text></TouchableOpacity>
              <TouchableOpacity style={s.dateBtn} onPress={() => setShowPicker('month')}><Text style={s.dateBtnText}>{month}月</Text></TouchableOpacity>
              <TouchableOpacity style={s.dateBtn} onPress={() => setShowPicker('day')}><Text style={s.dateBtnText}>{day}日</Text></TouchableOpacity>
            </View>
          </View>
          <View style={s.row}>
            <Text style={s.label}>性別</Text>
            <View style={s.btnGroup}>
              {([['female', '女性'], ['male', '男性'], ['other', 'その他']] as const).map(([v, label]) => (
                <TouchableOpacity key={v} style={[s.btBtn, gender === v && s.btBtnActive]} onPress={() => setGender(v)}>
                  <Text style={[s.btText, gender === v && s.btTextActive]}>{label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          <View style={s.row}>
            <Text style={s.label}>血液型</Text>
            <View style={s.btnGroup}>
              {(['A', 'B', 'O', 'AB'] as const).map((bt) => (
                <TouchableOpacity key={bt} style={[s.btBtn, bloodType === bt && s.btBtnActive]} onPress={() => setBloodType(bt)}>
                  <Text style={[s.btText, bloodType === bt && s.btTextActive]}>{bt}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          <TouchableOpacity style={s.saveBtn} onPress={saveProfile}>
            <Text style={s.saveBtnText}>プロフィールを保存</Text>
          </TouchableOpacity>
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
      <Modal visible={showPicker !== null} transparent animationType="fade">
        <View style={s.modal}>
          <View style={s.pickerBox}>
            <Text style={s.pickerTitle}>{showPicker === 'year' ? '年' : showPicker === 'month' ? '月' : '日'}を選択</Text>
            <ScrollView style={s.pickerScroll}>
              {(showPicker === 'year' ? years : showPicker === 'month' ? months : days).map((v) => (
                <TouchableOpacity key={v} style={s.pickerItem} onPress={() => {
                  if (showPicker === 'year') setYear(v);
                  else if (showPicker === 'month') setMonth(v);
                  else setDay(v);
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
  saveBtn: { backgroundColor: '#FF69B4', padding: 12, borderRadius: 8, alignItems: 'center', marginTop: 16 },
  saveBtnText: { color: '#fff', fontWeight: 'bold' },
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
});

export default SettingsScreen;
