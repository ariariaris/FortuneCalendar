// Fortune Calendar 年間カレンダー v1.0
import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAppStore } from '../store/useAppStore';
import { getAllPlugins } from '../fortunes';
import { formatDate, getDaysInMonth, getFirstDayOfMonth } from '../utils/dateUtils';

const WEEKDAYS = ['日', '月', '火', '水', '木', '金', '土'];

export const YearCalendarScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { setSelectedDate, userConfig } = useAppStore();
  const [viewYear, setViewYear] = useState(new Date().getFullYear());
  const enabledFortunes = userConfig.enabledFortunes || ['honDoubutsu'];
  const profile = userConfig.userProfile || undefined;
  const bestCount = userConfig.yearCalendarBestCount || 3;

  // 各月のベスト3デー計算
  const yearBestDays = useMemo(() => {
    const plugins = getAllPlugins().filter((p) => enabledFortunes.includes(p.id));
    if (plugins.length === 0) return {};
    const result: Record<number, number[]> = {};
    for (let m = 0; m < 12; m++) {
      const days = getDaysInMonth(viewYear, m);
      const scores: { day: number; score: number }[] = [];
      for (let d = 1; d <= days; d++) {
        const date = formatDate(new Date(viewYear, m, d));
        const sum = plugins.reduce((acc, p) => acc + p.generate(date, profile).scores.total, 0);
        scores.push({ day: d, score: sum / plugins.length });
      }
      scores.sort((a, b) => b.score - a.score);
      result[m] = scores.slice(0, bestCount).map((s) => s.day);
    }
    return result;
  }, [viewYear, enabledFortunes, profile, bestCount]);

  const handleDayPress = (month: number, day: number) => {
    setSelectedDate(formatDate(new Date(viewYear, month, day)));
    navigation.navigate('Calendar');
  };

  const renderMiniMonth = (month: number) => {
    const days = getDaysInMonth(viewYear, month);
    const firstDay = getFirstDayOfMonth(viewYear, month);
    const bestDays = yearBestDays[month] || [];
    const cells: JSX.Element[] = [];
    for (let i = 0; i < firstDay; i++) cells.push(<View key={`e${i}`} style={s.miniCell} />);
    for (let d = 1; d <= days; d++) {
      const isBest = bestDays.includes(d);
      cells.push(
        <TouchableOpacity key={d} style={s.miniCell} onPress={() => handleDayPress(month, d)}>
          <Text style={[s.miniDay, isBest && s.bestDay]}>{isBest ? '★' : d}</Text>
        </TouchableOpacity>
      );
    }
    return (
      <View key={month} style={s.monthBox}>
        <Text style={s.monthTitle}>{month + 1}月</Text>
        <View style={s.weekRow}>{WEEKDAYS.map((w, i) => <Text key={i} style={[s.weekDay, i === 0 && s.sun, i === 6 && s.sat]}>{w}</Text>)}</View>
        <View style={s.daysGrid}>{cells}</View>
      </View>
    );
  };

  return (
    <View style={s.container}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => setViewYear(viewYear - 1)} style={s.navBtn}><Text style={s.navIcon}>‹</Text></TouchableOpacity>
        <TouchableOpacity onPress={() => setViewYear(new Date().getFullYear())}><Text style={s.yearText}>{viewYear}年</Text></TouchableOpacity>
        <TouchableOpacity onPress={() => setViewYear(viewYear + 1)} style={s.navBtn}><Text style={s.navIcon}>›</Text></TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={s.grid}>
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(renderMiniMonth)}
      </ScrollView>
    </View>
  );
};

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 12, backgroundColor: '#fff', borderBottomWidth: 0.5, borderBottomColor: '#E5E5E5' },
  navBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  navIcon: { fontSize: 28, color: '#007AFF' },
  yearText: { fontSize: 20, fontWeight: '600', color: '#1C1C1E' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', padding: 8 },
  monthBox: { width: '33%', padding: 4, marginBottom: 8 },
  monthTitle: { fontSize: 14, fontWeight: '600', color: '#333', textAlign: 'center', marginBottom: 4 },
  weekRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 2 },
  weekDay: { fontSize: 8, color: '#999', width: 14, textAlign: 'center' },
  sun: { color: '#FF3B30' },
  sat: { color: '#007AFF' },
  daysGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  miniCell: { width: '14.28%', aspectRatio: 1, alignItems: 'center', justifyContent: 'center' },
  miniDay: { fontSize: 9, color: '#666' },
  bestDay: { fontSize: 12, color: '#FFD700', fontWeight: 'bold' },
});

export default YearCalendarScreen;
