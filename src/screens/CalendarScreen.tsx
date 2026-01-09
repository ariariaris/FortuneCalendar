// Fortune Calendar カレンダー画面 v2.4 (今月に戻る追加)
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, PanResponder, Animated, Dimensions, Modal, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useAppStore } from '../store/useAppStore';
import { CalendarDay } from '../components/CalendarDay';
import { getAllPlugins } from '../fortunes';
import { formatDate, getDaysInMonth, getFirstDayOfMonth, isToday as checkIsToday } from '../utils/dateUtils';
import { MyCharacter } from '../components/MyCharacter';
import { getSeasonImage } from '../utils/seasonImages';
import { fetchWeather, DayWeather, getWeatherForDate } from '../services/weatherService';
import { CalendarViewMode } from '../config/types';
import { generateMonthlyFortune, generateMonthlyAdvice } from '../services/periodFortuneService';
import { starsDisplay } from '../utils/fortuneUtils';

const SWIPE_THRESHOLD = 50;
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const WEEKDAYS = ['日', '月', '火', '水', '木', '金', '土'];

export const CalendarScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { selectedDate, setSelectedDate, userConfig, setUserConfig } = useAppStore();
  const colorful = userConfig.starColorMode === 'colorful';
  const wc = userConfig.weatherConfig || { enabled: false, showIcon: true, showTemp: true, showRain: true, areaCode: '130000' };
  const themeColor = userConfig.themeColor || '#FF69B4';
  const [viewDate, setViewDate] = useState(new Date());
  const [weather, setWeather] = useState<DayWeather[]>([]);
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const viewMode = userConfig.calendarViewMode || 'month';

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 21 }, (_, i) => currentYear - 10 + i); // ±10年

  // スワイプアニメーション
  const viewDateRef = useRef(viewDate);
  viewDateRef.current = viewDate;
  const translateX = useRef(new Animated.Value(0)).current;
  const panResponder = useMemo(() =>
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gs) => Math.abs(gs.dx) > 15 && Math.abs(gs.dy) < 30,
      onPanResponderMove: (_, gs) => translateX.setValue(gs.dx * 0.3),
      onPanResponderRelease: (_, gs) => {
        const d = viewDateRef.current;
        if (gs.dx > SWIPE_THRESHOLD) {
          Animated.timing(translateX, { toValue: SCREEN_WIDTH, duration: 150, useNativeDriver: true }).start(() => {
            setViewDate(new Date(d.getFullYear(), d.getMonth() - 1, 1));
            translateX.setValue(0);
          });
        } else if (gs.dx < -SWIPE_THRESHOLD) {
          Animated.timing(translateX, { toValue: -SCREEN_WIDTH, duration: 150, useNativeDriver: true }).start(() => {
            setViewDate(new Date(d.getFullYear(), d.getMonth() + 1, 1));
            translateX.setValue(0);
          });
        } else {
          Animated.spring(translateX, { toValue: 0, useNativeDriver: true }).start();
        }
      },
    }), []);
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  // 天気取得
  useEffect(() => {
    if (wc.enabled) fetchWeather(wc.areaCode).then(setWeather);
  }, [wc.enabled, wc.areaCode]);

  // 有効な占いの平均スコア計算
  const enabledFortunes = userConfig.enabledFortunes || ['honDoubutsu'];
  const currentFortune = enabledFortunes[0] || 'honDoubutsu';
  const profile = userConfig.userProfile || undefined;

  // 月運サマリー計算（複数占術の平均）
  const monthlyFortune = useMemo(() => {
    const fortunes = enabledFortunes.filter(id => id !== 'omikuji');
    if (fortunes.length === 0) return null;
    const results = fortunes.map(id => generateMonthlyFortune(id, year, month + 1, profile));
    const avgScores = {
      love: Math.round(results.reduce((sum, r) => sum + r.scores.love, 0) / results.length),
      work: Math.round(results.reduce((sum, r) => sum + r.scores.work, 0) / results.length),
      money: Math.round(results.reduce((sum, r) => sum + r.scores.money, 0) / results.length),
      health: Math.round(results.reduce((sum, r) => sum + r.scores.health, 0) / results.length),
      social: Math.round(results.reduce((sum, r) => sum + r.scores.social, 0) / results.length),
      total: Math.round(results.reduce((sum, r) => sum + r.scores.total, 0) / results.length),
    };
    return { ...results[0], scores: avgScores };
  }, [enabledFortunes, year, month, profile]);

  // 今月のアドバイス
  const monthlyAdvice = useMemo(() => {
    if (!monthlyFortune) return '';
    return generateMonthlyAdvice(monthlyFortune.scores, currentFortune, year, month + 1);
  }, [monthlyFortune, currentFortune, year, month]);

  const monthScores = useMemo(() => {
    const scores: Record<number, number> = {};
    const plugins = getAllPlugins().filter((p) => enabledFortunes.includes(p.id));
    if (plugins.length === 0) return scores;
    const profile = userConfig.userProfile || undefined;
    for (let d = 1; d <= daysInMonth; d++) {
      const date = formatDate(new Date(year, month, d));
      const sum = plugins.reduce((acc, p) => acc + p.generate(date, profile).scores.total, 0);
      scores[d] = Math.round(sum / plugins.length);
    }
    return scores;
  }, [year, month, daysInMonth, userConfig.userProfile, enabledFortunes]);

  const handleDayPress = (day: number, m?: number, y?: number) => {
    const date = formatDate(new Date(y ?? year, m ?? month, day));
    setSelectedDate(date);
    navigation.navigate('Day');
  };

  // 週の開始日を取得（日曜始まり）
  const getWeekStart = (d: Date) => {
    const date = new Date(d);
    date.setDate(date.getDate() - date.getDay());
    return date;
  };

  // 週表示のレンダリング
  const renderWeekView = () => {
    const weekStart = getWeekStart(viewDate);
    const week: JSX.Element[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(weekStart);
      d.setDate(d.getDate() + i);
      const dateStr = formatDate(d);
      const dayWeather = wc.enabled ? getWeatherForDate(weather, dateStr) : undefined;
      const dayNum = d.getDate();
      const m = d.getMonth();
      const y = d.getFullYear();
      // 週表示用スコア計算
      const plugins = getAllPlugins().filter((p) => enabledFortunes.includes(p.id));
      const profile = userConfig.userProfile || undefined;
      const score = plugins.length > 0 ? Math.round(plugins.reduce((acc, p) => acc + p.generate(dateStr, profile).scores.total, 0) / plugins.length) : undefined;
      week.push(
        <CalendarDay key={i} day={dayNum} dayOfWeek={i} isToday={checkIsToday(d)}
          isSelected={selectedDate === dateStr} score={score} colorful={colorful}
          weather={dayWeather} showWeatherIcon={wc.showIcon} showWeatherTemp={wc.showTemp} showWeatherRain={wc.showRain}
          onPress={() => handleDayPress(dayNum, m, y)} isWeekView />
      );
    }
    return <View style={s.week}>{week}</View>;
  };

  const toggleViewMode = () => {
    const modes: CalendarViewMode[] = ['month', 'week'];
    const idx = modes.indexOf(viewMode);
    setUserConfig({ calendarViewMode: modes[(idx + 1) % modes.length] });
  };

  const navigateWeek = (dir: number) => {
    const d = new Date(viewDate);
    d.setDate(d.getDate() + dir * 7);
    setViewDate(d);
  };

  const renderWeeks = () => {
    const weeks: JSX.Element[] = [];
    let week: JSX.Element[] = [];
    for (let i = 0; i < firstDay; i++) {
      week.push(<CalendarDay key={`e${i}`} day={0} dayOfWeek={i} isToday={false} isSelected={false} onPress={() => {}} />);
    }
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, month, d);
      const dateStr = formatDate(date);
      const dayOfWeek = (firstDay + d - 1) % 7;
      const dayWeather = wc.enabled ? getWeatherForDate(weather, dateStr) : undefined;
      week.push(
        <CalendarDay key={d} day={d} dayOfWeek={dayOfWeek} isToday={checkIsToday(date)}
          isSelected={selectedDate === dateStr} score={monthScores[d]} colorful={colorful}
          weather={dayWeather} showWeatherIcon={wc.showIcon} showWeatherTemp={wc.showTemp} showWeatherRain={wc.showRain}
          onPress={() => handleDayPress(d)} />
      );
      if (week.length === 7) { weeks.push(<View key={`w${weeks.length}`} style={s.week}>{week}</View>); week = []; }
    }
    if (week.length > 0) {
      while (week.length < 7) week.push(<CalendarDay key={`ee${week.length}`} day={0} dayOfWeek={week.length} isToday={false} isSelected={false} onPress={() => {}} />);
      weeks.push(<View key={`w${weeks.length}`} style={s.week}>{week}</View>);
    }
    return weeks;
  };

  const insets = useSafeAreaInsets();

  return (
    <View style={[s.safeArea, { paddingTop: insets.top }]}>
    <Animated.View style={[s.container, { transform: [{ translateX }] }]} {...panResponder.panHandlers}>
      {/* タイトル */}
      <View style={s.titleBar}>
        <Text style={s.title}>Fortune Calendar</Text>
        <TouchableOpacity style={[s.viewToggle, { backgroundColor: themeColor }]} onPress={toggleViewMode}>
          <Text style={s.viewToggleText}>{viewMode === 'month' ? '月' : '週'}</Text>
        </TouchableOpacity>
      </View>
      {/* ナビ */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => viewMode === 'week' ? navigateWeek(-1) : setViewDate(new Date(year, month - 1, 1))} onLongPress={() => setShowMonthPicker(true)} style={s.navBtn}>
          <Text style={s.navIcon}>‹</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setViewDate(new Date())} style={s.dateCenter}>
          <Text style={s.monthText}>{viewMode === 'week' ? `${viewDate.getMonth() + 1}/${viewDate.getDate()}週` : `${year}年 ${month + 1}月`}</Text>
          {(year !== new Date().getFullYear() || month !== new Date().getMonth()) && <Text style={s.todayLink}>今月に戻る</Text>}
        </TouchableOpacity>
        <TouchableOpacity onPress={() => viewMode === 'week' ? navigateWeek(1) : setViewDate(new Date(year, month + 1, 1))} onLongPress={() => setShowMonthPicker(true)} style={s.navBtn}>
          <Text style={s.navIcon}>›</Text>
        </TouchableOpacity>
      </View>
      {/* 月運サマリー */}
      {monthlyFortune && (
        <View style={s.monthlyBox}>
          <View style={s.monthlyHeader}>
            <Text style={s.monthlyTitle}>{month + 1}月の運勢</Text>
            <Text style={s.monthlyScore}>{monthlyFortune.scores.total}点</Text>
            <Text style={s.monthlyStars}>{starsDisplay(monthlyFortune.scores.total)}</Text>
          </View>
          <Text style={s.monthlyAdvice}>{monthlyAdvice}</Text>
        </View>
      )}
      <ScrollView style={s.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* キャラ＆風物詩 */}
        <View style={s.seasonBox}>
          <MyCharacter size={80} />
          <Image source={getSeasonImage(month + 1)} style={s.seasonImg} resizeMode="contain" />
        </View>
        {/* 曜日 */}
        <View style={s.weekHeader}>
          {WEEKDAYS.map((d, i) => (
            <View key={i} style={s.weekCell}>
              <Text style={[s.weekText, i === 0 && s.sun, i === 6 && s.sat]}>{d}</Text>
            </View>
          ))}
        </View>
        {/* グリッド */}
        <View style={s.grid}>{viewMode === 'week' ? renderWeekView() : renderWeeks()}</View>
      </ScrollView>
    </Animated.View>
    {/* 月選択モーダル */}
    <Modal visible={showMonthPicker} transparent animationType="fade">
      <TouchableOpacity style={s.modalBg} activeOpacity={1} onPress={() => setShowMonthPicker(false)}>
        <View style={s.pickerBox}>
          <Text style={s.pickerTitle}>年月を選択</Text>
          <ScrollView style={s.pickerScroll}>
            {years.map((y) => (
              <View key={y}>
                <Text style={s.yearLabel}>{y}年</Text>
                <View style={s.monthGrid}>
                  {[...Array(12)].map((_, m) => (
                    <TouchableOpacity key={m} style={[s.monthBtn, year === y && month === m && s.monthBtnActive]}
                      onPress={() => { setViewDate(new Date(y, m, 1)); setShowMonthPicker(false); }}>
                      <Text style={[s.monthBtnText, year === y && month === m && s.monthBtnTextActive]}>{m + 1}月</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            ))}
          </ScrollView>
        </View>
      </TouchableOpacity>
    </Modal>
    </View>
  );
};

const s = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  titleBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 8, backgroundColor: '#fff', borderBottomWidth: 0.5, borderBottomColor: '#E5E5E5' },
  title: { fontSize: 22, fontWeight: '700', color: '#1C1C1E', flex: 1, textAlign: 'center' },
  viewToggle: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  viewToggleText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 8, backgroundColor: '#fff' },
  dateCenter: { flex: 1, alignItems: 'center' },
  todayLink: { fontSize: 12, color: '#FF69B4', marginTop: 2 },
  monthlyBox: { backgroundColor: '#FFF5F8', marginHorizontal: 12, marginTop: 8, borderRadius: 12, padding: 12, borderLeftWidth: 4, borderLeftColor: '#FF69B4' },
  monthlyHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  monthlyTitle: { fontSize: 14, fontWeight: 'bold', color: '#FF69B4' },
  monthlyScore: { fontSize: 18, fontWeight: 'bold', color: '#FF69B4' },
  monthlyStars: { fontSize: 14, color: '#FFD700' },
  monthlyAdvice: { fontSize: 12, color: '#666', marginTop: 4 },
  scrollContainer: { flex: 1 },
  seasonBox: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 24, paddingVertical: 12, backgroundColor: '#fff' },
  seasonImg: { width: 80, height: 80 },
  navBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  navIcon: { fontSize: 32, color: '#007AFF', fontWeight: '300' },
  monthText: { fontSize: 20, fontWeight: '600', color: '#1C1C1E' },
  weekHeader: { flexDirection: 'row', backgroundColor: '#fff', paddingVertical: 10, borderBottomWidth: 0.5, borderBottomColor: '#E5E5E5' },
  weekCell: { flex: 1, alignItems: 'center' },
  weekText: { fontSize: 15, color: '#8E8E93', fontWeight: '600' },
  sun: { color: '#FF3B30' },
  sat: { color: '#007AFF' },
  grid: { backgroundColor: '#fff', borderTopWidth: 0.5, borderLeftWidth: 0.5, borderColor: '#E5E5E5', paddingBottom: 20 },
  week: { flexDirection: 'row' },
  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  pickerBox: { backgroundColor: '#fff', borderRadius: 12, width: 300, maxHeight: 400 },
  pickerTitle: { fontSize: 16, fontWeight: 'bold', textAlign: 'center', padding: 12, borderBottomWidth: 1, borderBottomColor: '#eee' },
  pickerScroll: { maxHeight: 320 },
  yearLabel: { fontSize: 14, fontWeight: '600', color: '#666', paddingHorizontal: 12, paddingTop: 12, paddingBottom: 4 },
  monthGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 8 },
  monthBtn: { width: '25%', padding: 10, alignItems: 'center' },
  monthBtnActive: { backgroundColor: '#FF69B4', borderRadius: 8 },
  monthBtnText: { fontSize: 14, color: '#333' },
  monthBtnTextActive: { color: '#fff', fontWeight: 'bold' },
});

export default CalendarScreen;
