// Fortune Calendar 占い結果画面 v2.3 (月画面レイアウト統一)
import React, { useMemo, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, PanResponder, Animated, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppStore } from '../store/useAppStore';
import { getAllPlugins } from '../fortunes';
import { FortuneScores } from '../config/types';
import { HexChart } from '../components/HexChart';
import { LuckyInfo } from '../components/LuckyInfo';
import { FortuneDetailCards } from '../components/FortuneCard';
import { displayDateWithDay, parseDate, addDays, formatDate, today } from '../utils/dateUtils';
import { starsDisplay } from '../utils/fortuneUtils';
import { MyCharacter } from '../components/MyCharacter';
import { generateDailyAdvice, extractTypeKey } from '../data/adviceParts';
import { getSeasonImage } from '../utils/seasonImages';
import { Image } from 'react-native';

const SWIPE_THRESHOLD = 50;
const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const FortuneScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { selectedDate, setSelectedDate, userConfig } = useAppStore();
  const enabledFortunes = userConfig.enabledFortunes || ['honDoubutsu'];
  const profile = userConfig.userProfile || undefined;

  // 日付refで最新値を追跡
  const dateRef = useRef(selectedDate);
  dateRef.current = selectedDate;

  // スワイプアニメーション
  const translateX = useRef(new Animated.Value(0)).current;
  const panResponder = useMemo(() =>
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gs) => Math.abs(gs.dx) > 15 && Math.abs(gs.dy) < 30,
      onPanResponderMove: (_, gs) => translateX.setValue(gs.dx * 0.3),
      onPanResponderRelease: (_, gs) => {
        if (gs.dx > SWIPE_THRESHOLD) {
          Animated.timing(translateX, { toValue: SCREEN_WIDTH, duration: 150, useNativeDriver: true }).start(() => {
            setSelectedDate(formatDate(addDays(parseDate(dateRef.current), -1)));
            translateX.setValue(0);
          });
        } else if (gs.dx < -SWIPE_THRESHOLD) {
          Animated.timing(translateX, { toValue: -SCREEN_WIDTH, duration: 150, useNativeDriver: true }).start(() => {
            setSelectedDate(formatDate(addDays(parseDate(dateRef.current), 1)));
            translateX.setValue(0);
          });
        } else {
          Animated.spring(translateX, { toValue: 0, useNativeDriver: true }).start();
        }
      },
    }), []);

  // 複数占術の平均スコア計算
  const result = useMemo(() => {
    const plugins = getAllPlugins().filter((p) => enabledFortunes.includes(p.id));
    if (plugins.length === 0) return null;

    const results = plugins.map((p) => p.generate(selectedDate, profile));
    const avgScores: FortuneScores = {
      love: Math.round(results.reduce((sum, r) => sum + r.scores.love, 0) / results.length),
      work: Math.round(results.reduce((sum, r) => sum + r.scores.work, 0) / results.length),
      money: Math.round(results.reduce((sum, r) => sum + r.scores.money, 0) / results.length),
      health: Math.round(results.reduce((sum, r) => sum + r.scores.health, 0) / results.length),
      social: Math.round(results.reduce((sum, r) => sum + r.scores.social, 0) / results.length),
      total: Math.round(results.reduce((sum, r) => sum + r.scores.total, 0) / results.length),
    };

    // 詳細テキストは最初の占術のものを使用
    const baseResult = results[0];
    return {
      scores: avgScores,
      details: baseResult.details,
      lucky: baseResult.lucky,
      character: baseResult.character,
    };
  }, [enabledFortunes, selectedDate, profile]);

  const dateDisplay = displayDateWithDay(parseDate(selectedDate));

  // アドバイス生成
  const dailyAdvice = useMemo(() => {
    if (!result) return '';
    const mainFortune = enabledFortunes[0] || 'honDoubutsu';
    const typeKey = extractTypeKey(
      mainFortune,
      result.details.total,
      result.character?.name,
      userConfig.userProfile?.bloodType
    );
    return generateDailyAdvice(mainFortune, typeKey, result.scores.total, selectedDate);
  }, [result, enabledFortunes, selectedDate, userConfig.userProfile?.bloodType]);

  // 日付移動
  const goToPrevDay = () => setSelectedDate(formatDate(addDays(parseDate(selectedDate), -1)));
  const goToNextDay = () => setSelectedDate(formatDate(addDays(parseDate(selectedDate), 1)));
  const goToToday = () => setSelectedDate(today());
  const isCurrentDay = selectedDate === today();

  const currentMonth = parseDate(selectedDate).getMonth() + 1;

  if (!result) return <View style={s.container}><Text>読み込み中...</Text></View>;

  return (
    <View style={[s.safeArea, { paddingTop: insets.top }]}>
      <Animated.View style={[s.container, { transform: [{ translateX }] }]} {...panResponder.panHandlers}>
        {/* タイトルバー */}
        <View style={s.titleBar}>
          <Text style={s.title}>Fortune Calendar</Text>
        </View>
        {/* 日付ナビ */}
        <View style={s.header}>
          <TouchableOpacity onPress={goToPrevDay} style={s.navBtn}>
            <Text style={s.navIcon}>‹</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={goToToday} style={s.dateCenter}>
            <Text style={s.dateText}>{dateDisplay}</Text>
            {!isCurrentDay && <Text style={s.todayLink}>今日に戻る</Text>}
          </TouchableOpacity>
          <TouchableOpacity onPress={goToNextDay} style={s.navBtn}>
            <Text style={s.navIcon}>›</Text>
          </TouchableOpacity>
        </View>
        {/* 日運サマリー */}
        <View style={s.dailyBox}>
          <View style={s.dailyHeader}>
            <Text style={s.dailyTitle}>今日の運勢</Text>
            <Text style={s.dailyScore}>{result.scores.total}点</Text>
            <Text style={s.dailyStars}>{starsDisplay(result.scores.total)}</Text>
          </View>
          <Text style={s.dailyAdvice}>{dailyAdvice}</Text>
        </View>
        {/* キャラ＆風物詩 */}
        <View style={s.seasonBox}>
          <MyCharacter size={80} />
          <Image source={getSeasonImage(currentMonth)} style={s.seasonImg} resizeMode="contain" />
        </View>
        <ScrollView contentContainerStyle={s.content}>
          {/* チャート */}
          <View style={s.chartWrap}>
            <HexChart scores={result.scores} size={200} />
          </View>
          {/* 総合運詳細 */}
          <View style={s.totalWrap}>
            <Text style={s.totalLabel}>総合運</Text>
            <Text style={s.totalDetail}>{result.details.total}</Text>
          </View>
          {/* ラッキー情報 */}
          <LuckyInfo lucky={result.lucky} />
          {/* 詳細 */}
          <Text style={s.sectionTitle}>詳細</Text>
          <FortuneDetailCards scores={result.scores} details={result.details} />
        </ScrollView>
      </Animated.View>
    </View>
  );
};

const s = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  titleBar: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 8, backgroundColor: '#fff', borderBottomWidth: 0.5, borderBottomColor: '#E5E5E5' },
  title: { fontSize: 22, fontWeight: '700', color: '#1C1C1E' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 8, backgroundColor: '#fff' },
  navBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  navIcon: { fontSize: 32, color: '#007AFF', fontWeight: '300' },
  dateCenter: { flex: 1, alignItems: 'center' },
  dateText: { fontSize: 20, fontWeight: '600', color: '#1C1C1E' },
  todayLink: { fontSize: 12, color: '#FF69B4', marginTop: 2 },
  dailyBox: { backgroundColor: '#FFF5F8', marginHorizontal: 12, marginTop: 8, borderRadius: 12, padding: 12, borderLeftWidth: 4, borderLeftColor: '#FF69B4' },
  dailyHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dailyTitle: { fontSize: 14, fontWeight: 'bold', color: '#FF69B4' },
  dailyScore: { fontSize: 18, fontWeight: 'bold', color: '#FF69B4' },
  dailyStars: { fontSize: 14, color: '#FFD700' },
  dailyAdvice: { fontSize: 12, color: '#666', marginTop: 4 },
  seasonBox: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 24, paddingVertical: 12, backgroundColor: '#fff', borderBottomWidth: 0.5, borderBottomColor: '#E5E5E5' },
  seasonImg: { width: 80, height: 80 },
  content: { padding: 16 },
  chartWrap: { alignItems: 'center', marginBottom: 16 },
  totalWrap: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 16 },
  totalLabel: { fontSize: 12, color: '#999', marginBottom: 4 },
  totalDetail: { fontSize: 14, color: '#333', lineHeight: 22 },
  sectionTitle: { fontSize: 14, fontWeight: 'bold', color: '#666', marginBottom: 8 },
});

export default FortuneScreen;
