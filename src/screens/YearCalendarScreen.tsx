// Fortune Calendar 年間カレンダー v1.8 (今年に戻る追加)
import React, { useMemo, useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, PanResponder, Animated, Dimensions, Modal } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useAppStore } from '../store/useAppStore';
import { getAllPlugins } from '../fortunes';
import { formatDate, getDaysInMonth, getFirstDayOfMonth } from '../utils/dateUtils';
import { generateYearlyFortune, generateYearlyAdvice } from '../services/periodFortuneService';
import { starsDisplay } from '../utils/fortuneUtils';

const SWIPE_THRESHOLD = 50;
const { width: SCREEN_WIDTH } = Dimensions.get('window');

const WEEKDAYS = ['日', '月', '火', '水', '木', '金', '土'];

export const YearCalendarScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { setSelectedDate, userConfig } = useAppStore();
  const [viewYear, setViewYear] = useState(new Date().getFullYear());
  const [showYearPicker, setShowYearPicker] = useState(false);
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 41 }, (_, i) => currentYear - 20 + i); // ±20年
  const enabledFortunes = userConfig.enabledFortunes || ['honDoubutsu'];
  const currentFortune = enabledFortunes[0] || 'honDoubutsu';
  const profile = userConfig.userProfile || undefined;
  const bestCount = userConfig.yearCalendarBestCount || 3;
  const showAge = userConfig.showAge ?? true;

  // 年運サマリー計算（複数占術の平均）
  const yearlyFortune = useMemo(() => {
    const fortunes = enabledFortunes.filter(id => id !== 'omikuji');
    if (fortunes.length === 0) return null;
    const results = fortunes.map(id => generateYearlyFortune(id, viewYear, profile));
    const avgScores = {
      love: Math.round(results.reduce((sum, r) => sum + r.scores.love, 0) / results.length),
      work: Math.round(results.reduce((sum, r) => sum + r.scores.work, 0) / results.length),
      money: Math.round(results.reduce((sum, r) => sum + r.scores.money, 0) / results.length),
      health: Math.round(results.reduce((sum, r) => sum + r.scores.health, 0) / results.length),
      social: Math.round(results.reduce((sum, r) => sum + r.scores.social, 0) / results.length),
      total: Math.round(results.reduce((sum, r) => sum + r.scores.total, 0) / results.length),
    };
    return { ...results[0], scores: avgScores };
  }, [enabledFortunes, viewYear, profile]);

  // 今年のアドバイス
  const yearlyAdvice = useMemo(() => {
    if (!yearlyFortune) return '';
    return generateYearlyAdvice(yearlyFortune.scores, currentFortune, viewYear);
  }, [yearlyFortune, currentFortune, viewYear]);

  // 年齢計算
  const getAge = (): number | null => {
    if (!profile?.birthDate) return null;
    const [birthYear] = profile.birthDate.split('-').map(Number);
    return viewYear - birthYear;
  };
  const age = getAge();

  // スワイプアニメーション
  const yearRef = useRef(viewYear);
  yearRef.current = viewYear;
  const translateX = useRef(new Animated.Value(0)).current;
  const panResponder = useMemo(() =>
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gs) => Math.abs(gs.dx) > 15 && Math.abs(gs.dy) < 30,
      onPanResponderMove: (_, gs) => translateX.setValue(gs.dx * 0.3),
      onPanResponderRelease: (_, gs) => {
        if (gs.dx > SWIPE_THRESHOLD) {
          Animated.timing(translateX, { toValue: SCREEN_WIDTH, duration: 150, useNativeDriver: true }).start(() => {
            setViewYear(yearRef.current - 1);
            translateX.setValue(0);
          });
        } else if (gs.dx < -SWIPE_THRESHOLD) {
          Animated.timing(translateX, { toValue: -SCREEN_WIDTH, duration: 150, useNativeDriver: true }).start(() => {
            setViewYear(yearRef.current + 1);
            translateX.setValue(0);
          });
        } else {
          Animated.spring(translateX, { toValue: 0, useNativeDriver: true }).start();
        }
      },
    }), []);

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

  const insets = useSafeAreaInsets();

  return (
    <View style={[s.safeArea, { paddingTop: insets.top }]}>
    <Animated.View style={[s.container, { transform: [{ translateX }] }]} {...panResponder.panHandlers}>
      {/* タイトル */}
      <View style={s.titleBar}>
        <Text style={s.title}>Fortune Calendar</Text>
      </View>
      {/* 年ナビ */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => setViewYear(viewYear - 1)} onLongPress={() => setShowYearPicker(true)} style={s.navBtn}><Text style={s.navIcon}>‹</Text></TouchableOpacity>
        <TouchableOpacity onPress={() => setViewYear(new Date().getFullYear())} style={s.dateCenter}>
          <Text style={s.yearText}>{viewYear}年{showAge && age !== null ? `（${age}歳）` : ''}</Text>
          {viewYear !== new Date().getFullYear() && <Text style={s.todayLink}>今年に戻る</Text>}
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setViewYear(viewYear + 1)} onLongPress={() => setShowYearPicker(true)} style={s.navBtn}><Text style={s.navIcon}>›</Text></TouchableOpacity>
      </View>
      {/* 年運サマリー */}
      {yearlyFortune && (
        <View style={s.yearlyBox}>
          <View style={s.yearlyHeader}>
            <Text style={s.yearlyTitle}>{viewYear}年の運勢</Text>
            <Text style={s.yearlyScore}>{yearlyFortune.scores.total}点</Text>
            <Text style={s.yearlyStars}>{starsDisplay(yearlyFortune.scores.total)}</Text>
          </View>
          <Text style={s.yearlyAdvice}>{yearlyAdvice}</Text>
        </View>
      )}
      <ScrollView contentContainerStyle={s.grid}>
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(renderMiniMonth)}
      </ScrollView>
    </Animated.View>
    {/* 年選択モーダル */}
    <Modal visible={showYearPicker} transparent animationType="fade">
      <TouchableOpacity style={s.modalBg} activeOpacity={1} onPress={() => setShowYearPicker(false)}>
        <View style={s.pickerBox}>
          <Text style={s.pickerTitle}>年を選択</Text>
          <ScrollView style={s.pickerScroll}>
            <View style={s.yearGrid}>
              {years.map((y) => (
                <TouchableOpacity key={y} style={[s.yearBtn, viewYear === y && s.yearBtnActive]}
                  onPress={() => { setViewYear(y); setShowYearPicker(false); }}>
                  <Text style={[s.yearBtnText, viewYear === y && s.yearBtnTextActive]}>{y}</Text>
                </TouchableOpacity>
              ))}
            </View>
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
  dateCenter: { flex: 1, alignItems: 'center' },
  todayLink: { fontSize: 12, color: '#FF69B4', marginTop: 2 },
  yearlyBox: { backgroundColor: '#FFF5F8', marginHorizontal: 12, marginVertical: 8, borderRadius: 12, padding: 12, borderLeftWidth: 4, borderLeftColor: '#FF69B4' },
  yearlyHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  yearlyTitle: { fontSize: 14, fontWeight: 'bold', color: '#FF69B4' },
  yearlyScore: { fontSize: 18, fontWeight: 'bold', color: '#FF69B4' },
  yearlyStars: { fontSize: 14, color: '#FFD700' },
  yearlyAdvice: { fontSize: 12, color: '#666', marginTop: 4 },
  navBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  navIcon: { fontSize: 32, color: '#007AFF', fontWeight: '300' },
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
  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  pickerBox: { backgroundColor: '#fff', borderRadius: 12, width: 280, maxHeight: 400 },
  pickerTitle: { fontSize: 16, fontWeight: 'bold', textAlign: 'center', padding: 12, borderBottomWidth: 1, borderBottomColor: '#eee' },
  pickerScroll: { maxHeight: 320 },
  yearGrid: { flexDirection: 'row', flexWrap: 'wrap', padding: 8 },
  yearBtn: { width: '25%', padding: 12, alignItems: 'center' },
  yearBtnActive: { backgroundColor: '#FF69B4', borderRadius: 8 },
  yearBtnText: { fontSize: 14, color: '#333' },
  yearBtnTextActive: { color: '#fff', fontWeight: 'bold' },
});

export default YearCalendarScreen;
