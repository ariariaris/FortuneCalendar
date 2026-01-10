// Fortune Calendar 設定画面 v2.4 (ピッカースクロール位置対応)
import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal, Alert, Switch, Platform } from 'react-native';
import { PREFECTURES, getAreaName, getAreaCodeFromCoords, getCurrentPosition, getPrefectureByCode, Prefecture } from '../config/areaCode';
import { useNavigation } from '@react-navigation/native';
import { useAppStore } from '../store/useAppStore';
import { DevSettingsScreen } from './DevSettingsScreen';
import { ExternalCalendarScreen } from './ExternalCalendarScreen';
import { BirthdayListScreen } from './BirthdayListScreen';
import { MandalaScreen } from './MandalaScreen';
import { MyCharacter } from '../components/MyCharacter';
import { DEV_PASSCODE, APP_VERSION, FORTUNE_LIST, THEME_COLORS, FONT_SIZES } from '../config/defaultConfig';
import { FontSize, DefaultTab } from '../config/types';

const TAB_OPTIONS: { key: DefaultTab; label: string }[] = [
  { key: 'Day', label: '日' },
  { key: 'Calendar', label: '月' },
  { key: 'Year', label: '年' },
];

export const SettingsScreen: React.FC = () => {
  const { userConfig, setUserConfig, setProfile } = useAppStore();
  const [tapCount, setTapCount] = useState(0);
  const [showPasscode, setShowPasscode] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [showDevSettings, setShowDevSettings] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showCalendarSettings, setShowCalendarSettings] = useState(false);
  const [showBirthdaySettings, setShowBirthdaySettings] = useState(false);
  const [showMandalaSettings, setShowMandalaSettings] = useState(false);
  const [showPrefPicker, setShowPrefPicker] = useState(false);
  const [showSubAreaPicker, setShowSubAreaPicker] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const currentPref = getPrefectureByCode(userConfig.weatherConfig?.areaCode || '130000');
  const currentArea = currentPref?.areas.find(a => a.code === userConfig.weatherConfig?.areaCode);

  // 隠し占いメニュー（名前に9999で表示、0000で非表示）
  const [showHiddenFortunes, setShowHiddenFortunes] = useState(false);

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

  // 名前変更ハンドラ（999で隠しメニュー表示、000で非表示）
  const handleNameChange = (v: string) => {
    if (v === '999') { setShowHiddenFortunes(true); return; }
    if (v === '000') { setShowHiddenFortunes(false); return; }
    updateProfile({ name: v || undefined });
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
  const defaultAge = 30;
  const years = Array.from({ length: 100 }, (_, i) => currentYear - defaultAge - 50 + i).reverse();
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  const yearScrollRef = useRef<ScrollView>(null);
  const prefScrollRef = useRef<ScrollView>(null);
  const targetYear = currentYear - defaultAge;
  const targetYearIndex = years.indexOf(targetYear);
  const targetPrefIndex = PREFECTURES.findIndex(p => p.code === (currentPref?.code || '13'));

  // Web対応: 年ピッカー開いたらsetTimeoutでスクロール
  useEffect(() => {
    if (showPicker === 'year') {
      setTimeout(() => {
        yearScrollRef.current?.scrollTo({ y: targetYearIndex * 49, animated: false });
      }, 50);
    }
  }, [showPicker, targetYearIndex]);

  // Web対応: 都道府県ピッカー開いたらsetTimeoutでスクロール
  useEffect(() => {
    if (showPrefPicker) {
      setTimeout(() => {
        prefScrollRef.current?.scrollTo({ y: targetPrefIndex * 49, animated: false });
      }, 50);
    }
  }, [showPrefPicker, targetPrefIndex]);

  // 現在地取得
  const handleGetLocation = async () => {
    setIsLocating(true);
    try {
      const { lat, lon } = await getCurrentPosition();
      const code = await getAreaCodeFromCoords(lat, lon);
      setUserConfig({ weatherConfig: { ...userConfig.weatherConfig, areaCode: code } });
      Alert.alert('位置情報', `${getAreaName(code)}に設定しました`);
    } catch (e) {
      Alert.alert('エラー', '位置情報を取得できませんでした');
    } finally {
      setIsLocating(false);
    }
  };

  const toggleFortune = (id: string) => {
    const enabled = userConfig.enabledFortunes || ['honDoubutsu'];
    const newEnabled = enabled.includes(id) ? enabled.filter((f) => f !== id) : [...enabled, id];
    if (newEnabled.length === 0) { Alert.alert('エラー', '最低1つは選択してください'); return; }
    setUserConfig({ enabledFortunes: newEnabled });
  };
  // 動物占いのみデフォルト表示、他は隠しメニュー
  const mainFortune = FORTUNE_LIST.find((f) => f.id === 'honDoubutsu');
  const hiddenFortunes = FORTUNE_LIST.filter((f) => f.category === 'free' && f.id !== 'honDoubutsu');

  return (
    <View style={s.container}>
      <View style={s.header}><MyCharacter size={40} /></View>
      <ScrollView style={s.scroll}>
        <Text style={s.section}>プロフィール</Text>
        <View style={s.card}>
          <View style={s.row}>
            <Text style={s.label}>お名前</Text>
            <TextInput style={s.input} value={profile?.name || ''} onChangeText={handleNameChange} placeholder="(任意)" />
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
          <View style={s.row}>
            <Text style={s.label}>起動スプラッシュ表示</Text>
            <Switch value={userConfig.showSplash ?? true} onValueChange={(v) => setUserConfig({ showSplash: v })} />
          </View>
          <View style={s.row}>
            <Text style={s.label}>起動時のタブ</Text>
            <View style={s.btnGroup}>
              {TAB_OPTIONS.map(({ key, label }) => (
                <TouchableOpacity key={key} style={[s.btBtn, (userConfig.defaultTab || 'Calendar') === key && s.btBtnActive]} onPress={() => setUserConfig({ defaultTab: key })}>
                  <Text style={[s.btText, (userConfig.defaultTab || 'Calendar') === key && s.btTextActive]}>{label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        <Text style={s.section}>天気予報</Text>
        <View style={s.card}>
          <View style={s.row}>
            <Text style={s.label}>天気を表示</Text>
            <Switch value={userConfig.weatherConfig?.enabled ?? true} onValueChange={(v) => setUserConfig({ weatherConfig: { ...userConfig.weatherConfig, enabled: v } })} />
          </View>
          <View style={s.row}>
            <Text style={s.label}>地域</Text>
            <View style={s.areaRow}>
              <TouchableOpacity style={s.areaBtn} onPress={() => setShowPrefPicker(true)}>
                <Text style={s.areaBtnText}>{currentPref?.name || '東京都'}</Text>
                <Text style={s.areaArrow}>▼</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.areaBtn} onPress={() => setShowSubAreaPicker(true)}>
                <Text style={s.areaBtnText}>{currentArea?.name || '東京地方'}</Text>
                <Text style={s.areaArrow}>▼</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[s.locationBtn, isLocating && s.locationBtnDisabled]} onPress={handleGetLocation} disabled={isLocating}>
                <Text style={s.locationBtnText}>{isLocating ? '...' : '📍'}</Text>
              </TouchableOpacity>
            </View>
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

        <Text style={s.section}>連携</Text>
        <View style={s.card}>
          <TouchableOpacity style={s.linkRow} onPress={() => setShowCalendarSettings(true)}>
            <Text style={s.label}>📅 外部カレンダー連携</Text>
            <Text style={s.linkArrow}>›</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.linkRow} onPress={() => setShowBirthdaySettings(true)}>
            <Text style={s.label}>🎂 誕生日表示</Text>
            <Text style={s.linkArrow}>›</Text>
          </TouchableOpacity>
        </View>

        <Text style={s.section}>占い</Text>
        <View style={s.card}>
          {mainFortune && (
            <View style={s.row}>
              <Text style={s.label}>{mainFortune.name}</Text>
              <Switch value={(userConfig.enabledFortunes || ['honDoubutsu']).includes(mainFortune.id)} onValueChange={() => toggleFortune(mainFortune.id)} />
            </View>
          )}
          {showHiddenFortunes && (
            <>
              {hiddenFortunes.map((f) => (
                <View key={f.id} style={s.row}>
                  <Text style={s.label}>{f.name}</Text>
                  <Switch value={(userConfig.enabledFortunes || ['honDoubutsu']).includes(f.id)} onValueChange={() => toggleFortune(f.id)} />
                </View>
              ))}
              <View style={s.divider} />
              <TouchableOpacity style={s.linkRow} onPress={() => setShowMandalaSettings(true)}>
                <Text style={s.label}>🎯 マンダラチャート</Text>
                <Text style={s.linkArrow}>›</Text>
              </TouchableOpacity>
              <View style={s.row}>
                <Text style={s.label}>手相</Text>
                <Text style={s.devLabel}>開発中</Text>
              </View>
              <View style={s.row}>
                <Text style={s.label}>顔相</Text>
                <Text style={s.devLabel}>開発中</Text>
              </View>
              <View style={s.row}>
                <Text style={s.label}>四柱推命</Text>
                <Text style={s.devLabel}>開発中</Text>
              </View>
            </>
          )}
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
      <Modal visible={showCalendarSettings} animationType="slide">
        <ExternalCalendarScreen onClose={() => setShowCalendarSettings(false)} />
      </Modal>
      <Modal visible={showBirthdaySettings} animationType="slide">
        <BirthdayListScreen onClose={() => setShowBirthdaySettings(false)} />
      </Modal>
      <Modal visible={showMandalaSettings} animationType="slide">
        <MandalaScreen onClose={() => setShowMandalaSettings(false)} />
      </Modal>
      <Modal visible={showPrefPicker} transparent animationType="fade">
        <View style={s.modal}>
          <View style={s.pickerBox}>
            <Text style={s.pickerTitle}>都道府県を選択</Text>
            <ScrollView style={s.pickerScroll} ref={prefScrollRef}>
              {PREFECTURES.map((pref) => (
                <TouchableOpacity key={pref.code} style={[s.pickerItem, currentPref?.code === pref.code && s.pickerItemActive]}
                  onPress={() => { setUserConfig({ weatherConfig: { ...userConfig.weatherConfig, areaCode: pref.areas[0].code } }); setShowPrefPicker(false); }}>
                  <Text style={[s.pickerItemText, currentPref?.code === pref.code && s.pickerItemTextActive]}>{pref.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity style={s.btn} onPress={() => setShowPrefPicker(false)}><Text>閉じる</Text></TouchableOpacity>
          </View>
        </View>
      </Modal>
      <Modal visible={showSubAreaPicker} transparent animationType="fade">
        <View style={s.modal}>
          <View style={s.pickerBox}>
            <Text style={s.pickerTitle}>{currentPref?.name || '東京都'} - エリア選択</Text>
            <ScrollView style={s.pickerScroll}>
              {(currentPref?.areas || []).map((area) => (
                <TouchableOpacity key={area.code} style={[s.pickerItem, userConfig.weatherConfig?.areaCode === area.code && s.pickerItemActive]}
                  onPress={() => { setUserConfig({ weatherConfig: { ...userConfig.weatherConfig, areaCode: area.code } }); setShowSubAreaPicker(false); }}>
                  <Text style={[s.pickerItemText, userConfig.weatherConfig?.areaCode === area.code && s.pickerItemTextActive]}>{area.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity style={s.btn} onPress={() => setShowSubAreaPicker(false)}><Text>閉じる</Text></TouchableOpacity>
          </View>
        </View>
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
            {showPicker && <Text style={s.pickerTitle}>{showPicker === 'year' ? '年' : showPicker === 'month' ? '月' : '日'}を選択</Text>}
            <ScrollView style={s.pickerScroll} ref={showPicker === 'year' ? yearScrollRef : undefined}>
              {(showPicker === 'year' ? years : showPicker === 'month' ? months : showPicker === 'day' ? days : []).map((v) => (
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
  colorBtn: { flexDirection: 'row', alignItems: 'center' },
  colorPreview: { width: 24, height: 24, borderRadius: 12, marginRight: 8, borderWidth: 1, borderColor: '#ddd' },
  colorName: { fontSize: 14, color: '#333' },
  colorPickerBox: { backgroundColor: '#fff', borderRadius: 12, width: 320, maxHeight: 500, padding: 16 },
  colorGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginVertical: 12 },
  colorItem: { width: '23%', alignItems: 'center', paddingVertical: 8, marginBottom: 8, borderRadius: 8 },
  colorItemActive: { backgroundColor: '#f0f0f0' },
  colorCircle: { width: 32, height: 32, borderRadius: 16, borderWidth: 1, borderColor: '#ddd', marginBottom: 4 },
  colorItemText: { fontSize: 10, color: '#666' },
  divider: { height: 1, backgroundColor: '#eee', marginVertical: 8 },
  devLabel: { fontSize: 12, color: '#999', backgroundColor: '#f0f0f0', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  linkRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12 },
  linkArrow: { fontSize: 20, color: '#ccc' },
  areaRow: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  areaBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f0f0f0', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
  areaBtnText: { fontSize: 14, color: '#333' },
  areaArrow: { fontSize: 10, color: '#999', marginLeft: 4 },
  locationBtn: { backgroundColor: '#4A90D9', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6 },
  locationBtnDisabled: { opacity: 0.5 },
  locationBtnText: { fontSize: 12, color: '#fff' },
  pickerItemActive: { backgroundColor: '#FF69B4' },
  pickerItemTextActive: { color: '#fff', fontWeight: 'bold' },
  pickerBtnRow: { flexDirection: 'row', justifyContent: 'space-between', padding: 12, gap: 8 },
});

export default SettingsScreen;
