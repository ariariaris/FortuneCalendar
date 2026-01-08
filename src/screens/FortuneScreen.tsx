// Fortune Calendar 占い結果画面 v2.2 (複数占術平均点・占術タブ削除)
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

  if (!result) return <View style={s.container}><Text>読み込み中...</Text></View>;

  return (
    <Animated.View style={[s.container, { paddingTop: insets.top, transform: [{ translateX }] }]} {...panResponder.panHandlers}>
      <ScrollView contentContainerStyle={s.content}>
        {/* 日付ナビ */}
        <View style={s.dateNav}>
          <TouchableOpacity onPress={goToPrevDay} style={s.navBtn} hitSlop={{top:10,bottom:10,left:10,right:10}}>
            <Text style={s.navBtnText}>◀</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={goToToday} style={s.dateCenter}>
            <Text style={s.date}>{dateDisplay}の運勢</Text>
            {!isCurrentDay && <Text style={s.todayLink}>今日に戻る</Text>}
          </TouchableOpacity>
          <TouchableOpacity onPress={goToNextDay} style={s.navBtn} hitSlop={{top:10,bottom:10,left:10,right:10}}>
            <Text style={s.navBtnText}>▶</Text>
          </TouchableOpacity>
        </View>

        {/* チャート */}
        <View style={s.chartWrap}>
          <HexChart scores={result.scores} size={220} />
        </View>

        {/* キャラクター・総合運 */}
        <View style={s.totalWrap}>
          <MyCharacter size={100} />
          <Text style={s.totalLabel}>総合運</Text>
          <Text style={s.totalScore}>{result.scores.total}点</Text>
          <Text style={s.totalStars}>{starsDisplay(result.scores.total)}</Text>
          <Text style={s.totalDetail}>{result.details.total}</Text>
        </View>

        {/* 今日のアドバイス */}
        <View style={s.adviceWrap}>
          <Text style={s.adviceLabel}>今日のアドバイス</Text>
          <Text style={s.adviceText}>{dailyAdvice}</Text>
        </View>

        {/* ラッキー情報 */}
        <LuckyInfo lucky={result.lucky} />

        {/* 詳細 */}
        <Text style={s.sectionTitle}>詳細</Text>
        <FortuneDetailCards scores={result.scores} details={result.details} />
      </ScrollView>
    </Animated.View>
  );
};

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f8f8' },
  content: { padding: 16 },
  dateNav: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  navBtn: { padding: 12 },
  navBtnText: { fontSize: 20, color: '#FF69B4' },
  dateCenter: { flex: 1, alignItems: 'center' },
  date: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  todayLink: { fontSize: 12, color: '#FF69B4', marginTop: 2 },
  chartWrap: { alignItems: 'center', marginVertical: 16 },
  totalWrap: { backgroundColor: '#fff', borderRadius: 12, padding: 16, alignItems: 'center', marginBottom: 16 },
  totalLabel: { fontSize: 12, color: '#999' },
  totalScore: { fontSize: 48, fontWeight: 'bold', color: '#FF69B4' },
  totalStars: { fontSize: 20, color: '#FFD700', marginVertical: 4 },
  totalDetail: { fontSize: 14, color: '#333', textAlign: 'center', marginTop: 8 },
  adviceWrap: { backgroundColor: '#FFF5F8', borderRadius: 12, padding: 16, marginBottom: 16, borderLeftWidth: 4, borderLeftColor: '#FF69B4' },
  adviceLabel: { fontSize: 12, color: '#FF69B4', fontWeight: 'bold', marginBottom: 8 },
  adviceText: { fontSize: 14, color: '#333', lineHeight: 22 },
  sectionTitle: { fontSize: 14, fontWeight: 'bold', color: '#666', marginBottom: 8 },
});

export default FortuneScreen;
