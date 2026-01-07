// Fortune Calendar カレンダー画面 v1.9
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, PanResponder, Animated, Dimensions, Platform, Modal, ScrollView } from 'react-native';
import Constants from 'expo-constants';
import { useNavigation } from '@react-navigation/native';
import { useAppStore } from '../store/useAppStore';
import { CalendarDay } from '../components/CalendarDay';
import { getAllPlugins } from '../fortunes';
import { formatDate, getDaysInMonth, getFirstDayOfMonth, isToday as checkIsToday } from '../utils/dateUtils';
import { MyCharacter } from '../components/MyCharacter';
import { getSeasonImage } from '../utils/seasonImages';
import { fetchWeather, DayWeather, getWeatherForDate } from '../services/weatherService';

const SWIPE_THRESHOLD = 50;
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const WEEKDAYS = ['日', '月', '火', '水', '木', '金', '土'];

export const CalendarScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { selectedDate, setSelectedDate, userConfig } = useAppStore();
  const colorful = userConfig.starColorMode === 'colorful';
  const wc = userConfig.weatherConfig || { enabled: false, showIcon: true, showTemp: true, showRain: true, areaCode: '130000' };
  const [viewDate, setViewDate] = useState(new Date());
  const [weather, setWeather] = useState<DayWeather[]>([]);
  const [showMonthPicker, setShowMonthPicker] = useState(false);

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

  const handleDayPress = (day: number) => {
    const date = formatDate(new Date(year, month, day));
    setSelectedDate(date);
    navigation.navigate('Fortune');
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

  const statusBarHeight = Platform.OS === 'ios' ? Constants.statusBarHeight : 0;

  return (
    <View style={[s.safeArea, { paddingTop: statusBarHeight }]}>
    <Animated.View style={[s.container, { transform: [{ translateX }] }]} {...panResponder.panHandlers}>
      {/* タイトル */}
      <View style={s.titleBar}>
        <Text style={s.title}>Fortune Calendar</Text>
      </View>
      {/* 月ナビ */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => setViewDate(new Date(year, month - 1, 1))} onLongPress={() => setShowMonthPicker(true)} style={s.navBtn}>
          <Text style={s.navIcon}>‹</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setViewDate(new Date())}>
          <Text style={s.monthText}>{year}年 {month + 1}月</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setViewDate(new Date(year, month + 1, 1))} onLongPress={() => setShowMonthPicker(true)} style={s.navBtn}>
          <Text style={s.navIcon}>›</Text>
        </TouchableOpacity>
      </View>
      {/* キャラ＆風物詩 */}
      <View style={s.seasonBox}>
        <MyCharacter size={80} showName />
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
      <View style={s.grid}>{renderWeeks()}</View>
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
  titleBar: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 8, backgroundColor: '#fff', borderBottomWidth: 0.5, borderBottomColor: '#E5E5E5' },
  title: { fontSize: 22, fontWeight: '700', color: '#1C1C1E' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 8, backgroundColor: '#fff' },
  seasonBox: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 24, paddingVertical: 12, backgroundColor: '#fff', borderBottomWidth: 0.5, borderBottomColor: '#E5E5E5' },
  seasonImg: { width: 80, height: 80 },
  navBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  navIcon: { fontSize: 32, color: '#007AFF', fontWeight: '300' },
  monthText: { fontSize: 20, fontWeight: '600', color: '#1C1C1E' },
  weekHeader: { flexDirection: 'row', backgroundColor: '#fff', paddingVertical: 8, borderBottomWidth: 0.5, borderBottomColor: '#E5E5E5' },
  weekCell: { flex: 1, alignItems: 'center' },
  weekText: { fontSize: 13, color: '#8E8E93', fontWeight: '600' },
  sun: { color: '#FF3B30' },
  sat: { color: '#007AFF' },
  grid: { backgroundColor: '#fff', borderTopWidth: 0.5, borderLeftWidth: 0.5, borderColor: '#E5E5E5' },
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
