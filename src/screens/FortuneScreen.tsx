// Fortune Calendar 占い結果画面 v1.5
import React, { useEffect, useState, useMemo, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, PanResponder, Animated, Dimensions } from 'react-native';
import { useAppStore } from '../store/useAppStore';
import { getPlugin, getAllPlugins } from '../fortunes';
import { FortuneResult } from '../config/types';
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
  const { selectedFortune, setSelectedFortune, selectedDate, setSelectedDate, userConfig, fortuneCache, setFortuneResult } = useAppStore();
  const [result, setResult] = useState<FortuneResult | null>(null);
  const enabledFortunes = userConfig.enabledFortunes || ['honDoubutsu'];
  const plugins = getAllPlugins().filter((p) => enabledFortunes.includes(p.id));
  const currentFortune = enabledFortunes.includes(selectedFortune) ? selectedFortune : enabledFortunes[0];

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

  useEffect(() => {
    generateFortune();
  }, [currentFortune, selectedDate, userConfig.userProfile]);

  const generateFortune = () => {
    const plugin = getPlugin(currentFortune);
    if (!plugin) return;

    const birthDate = userConfig.userProfile?.birthDate || 'default';
    const cacheKey = `${currentFortune}_${selectedDate}_${birthDate}`;
    if (fortuneCache[cacheKey]) {
      setResult(fortuneCache[cacheKey]);
      return;
    }

    const fortune = plugin.generate(selectedDate, userConfig.userProfile || undefined);
    setFortuneResult(cacheKey, fortune);
    setResult(fortune);
  };

  const dateDisplay = displayDateWithDay(parseDate(selectedDate));

  // アドバイス生成
  const dailyAdvice = useMemo(() => {
    if (!result) return '';
    const typeKey = extractTypeKey(
      currentFortune,
      result.details.total,
      result.character?.name,
      userConfig.userProfile?.bloodType
    );
    return generateDailyAdvice(currentFortune, typeKey, result.scores.total, selectedDate);
  }, [result, currentFortune, selectedDate, userConfig.userProfile?.bloodType]);

  // 日付移動
  const goToPrevDay = () => setSelectedDate(formatDate(addDays(parseDate(selectedDate), -1)));
  const goToNextDay = () => setSelectedDate(formatDate(addDays(parseDate(selectedDate), 1)));
  const goToToday = () => setSelectedDate(today());
  const isCurrentDay = selectedDate === today();

  if (!result) return <View style={s.container}><Text>読み込み中...</Text></View>;

  return (
    <Animated.View style={[s.container, { transform: [{ translateX }] }]} {...panResponder.panHandlers}>
      {/* スワイプヒント */}
      <View style={s.swipeHint}>
        <Text style={s.swipeHintText}>← 左右スワイプで日付移動 →</Text>
      </View>
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
        {plugins.length > 1 ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.tabs}>
            {plugins.map((p) => (
              <TouchableOpacity key={p.id} style={[s.tab, currentFortune === p.id && s.tabActive]} onPress={() => setSelectedFortune(p.id)}>
                <Text style={[s.tabText, currentFortune === p.id && s.tabTextActive]}>{p.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        ) : (
          <Text style={s.fortuneName}>{plugins[0]?.name || '動物占い'}</Text>
        )}

        {/* チャート */}
        <View style={s.chartWrap}>
          <HexChart scores={result.scores} size={220} />
        </View>

        {/* キャラクター・総合運 */}
        <View style={s.totalWrap}>
          <MyCharacter size={100} showName />
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
  swipeHint: { backgroundColor: '#FFE4EC', paddingVertical: 4, alignItems: 'center' },
  swipeHintText: { fontSize: 11, color: '#FF69B4' },
  content: { padding: 16 },
  dateNav: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  navBtn: { padding: 12 },
  navBtnText: { fontSize: 20, color: '#FF69B4' },
  dateCenter: { flex: 1, alignItems: 'center' },
  date: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  todayLink: { fontSize: 12, color: '#FF69B4', marginTop: 2 },
  fortuneName: { fontSize: 14, color: '#FF69B4', fontWeight: '600' },
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
  tabs: { flexDirection: 'row', marginTop: 8 },
  tab: { paddingHorizontal: 16, paddingVertical: 8, marginRight: 8, borderRadius: 16, backgroundColor: '#eee' },
  tabActive: { backgroundColor: '#FF69B4' },
  tabText: { fontSize: 14, color: '#666' },
  tabTextActive: { color: '#fff', fontWeight: 'bold' },
});

export default FortuneScreen;
