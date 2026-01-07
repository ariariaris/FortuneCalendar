// Fortune Calendar カレンダー画面 v1.5
import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAppStore } from '../store/useAppStore';
import { CalendarDay } from '../components/CalendarDay';
import { getAllPlugins } from '../fortunes';
import { formatDate, getDaysInMonth, getFirstDayOfMonth, isToday as checkIsToday } from '../utils/dateUtils';
import { MyCharacter } from '../components/MyCharacter';
import { getSeasonImage } from '../utils/seasonImages';
import { fetchWeather, DayWeather, getWeatherForDate } from '../services/weatherService';

const WEEKDAYS = ['日', '月', '火', '水', '木', '金', '土'];

export const CalendarScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { selectedDate, setSelectedDate, userConfig } = useAppStore();
  const colorful = userConfig.starColorMode === 'colorful';
  const wc = userConfig.weatherConfig || { enabled: false, showIcon: true, showTemp: true, showRain: true, areaCode: '130000' };
  const [viewDate, setViewDate] = useState(new Date());
  const [weather, setWeather] = useState<DayWeather[]>([]);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
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

  const reload = () => { setViewDate(new Date(year, month, 1)); };

  return (
    <View style={s.container}>
      {/* タイトル */}
      <View style={s.titleBar}>
        <Text style={s.title}>Fortune Calendar</Text>
        <TouchableOpacity onPress={reload} style={s.reloadBtn}><Text style={s.reloadIcon}>↻</Text></TouchableOpacity>
      </View>
      {/* 月ナビ */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => setViewDate(new Date(year, month - 1, 1))} style={s.navBtn}>
          <Text style={s.navIcon}>‹</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setViewDate(new Date())}>
          <Text style={s.monthText}>{year}年 {month + 1}月</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setViewDate(new Date(year, month + 1, 1))} style={s.navBtn}>
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
    </View>
  );
};

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  titleBar: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 8, backgroundColor: '#fff', borderBottomWidth: 0.5, borderBottomColor: '#E5E5E5' },
  title: { fontSize: 22, fontWeight: '700', color: '#1C1C1E' },
  reloadBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  reloadIcon: { fontSize: 22, color: '#007AFF' },
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
  grid: { flex: 1, backgroundColor: '#fff', borderTopWidth: 0.5, borderLeftWidth: 0.5, borderColor: '#E5E5E5' },
  week: { flexDirection: 'row' },
});

export default CalendarScreen;
