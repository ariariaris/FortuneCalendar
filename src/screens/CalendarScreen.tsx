// Fortune Calendar カレンダー画面 v3.3 (プルダウン更新)
import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, PanResponder, Animated, Dimensions, Modal, ScrollView, Platform, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useAppStore } from '../store/useAppStore';
import { CalendarDay } from '../components/CalendarDay';
import { getAllPlugins } from '../fortunes';
import { formatDate, getDaysInMonth, getFirstDayOfMonth, isToday as checkIsToday } from '../utils/dateUtils';
import { MyCharacter } from '../components/MyCharacter';
import { getSeasonImage } from '../utils/seasonImages';
import { fetchWeather, DayWeather, getWeatherForDate } from '../services/weatherService';
import { CalendarViewMode, FontSize } from '../config/types';
import { getFontSize } from '../utils/fontUtils';
import { generateMonthlyFortune, generateMonthlyAdvice } from '../services/periodFortuneService';
import { starsDisplay } from '../utils/fortuneUtils';
import { getExternalEvents, getBirthdayEntries } from '../services/storageService';
import { getTodosForCalendar } from '../services/mandalaService';
import { getTodoItems, getMustDoItems, getDreams, getGoals } from '../services/goalService';
import { ExternalCalendarEvent } from '../types/externalCalendar';
import { BirthdayEntry } from '../types/birthday';
import { MandalaTodo } from '../types/mandala';
import { TodoItem, MustDoItem, Dream, Goal } from '../types/goalManagement';
import { getDateIcons } from '../utils/calendarMerge';
import { getAreaByCode } from '../config/areaCode';
import { fetchNativeCalendarEvents } from '../services/nativeCalendarService';
import { EventCreateScreen } from './EventCreateScreen';

const SWIPE_THRESHOLD = 50;
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const WEEKDAYS = ['日', '月', '火', '水', '木', '金', '土'];

export const CalendarScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { selectedDate, setSelectedDate, userConfig, setUserConfig } = useAppStore();
  const colorful = userConfig.starColorMode === 'colorful';
  const wc = userConfig.weatherConfig || { enabled: false, showIcon: true, showTemp: true, showRain: true, areaCode: '130000' };
  const themeColor = userConfig.themeColor || '#FF69B4';
  const fs = userConfig.fontSize || 'md';
  const [viewDate, setViewDate] = useState(new Date());
  const [weather, setWeather] = useState<DayWeather[]>([]);
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [showEventCreate, setShowEventCreate] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const viewMode = userConfig.calendarViewMode || 'month';

  // スケジュール表示用データ
  const [localSelectedDate, setLocalSelectedDate] = useState(selectedDate || formatDate(new Date()));
  const [externalEvents, setExternalEvents] = useState<ExternalCalendarEvent[]>([]);
  const [birthdays, setBirthdays] = useState<BirthdayEntry[]>([]);
  const [mandalaTodos, setMandalaTodos] = useState<MandalaTodo[]>([]);
  const [goalTodos, setGoalTodos] = useState<TodoItem[]>([]);
  const [mustDoItems, setMustDoItems] = useState<MustDoItem[]>([]);
  const [dreams, setDreams] = useState<Dream[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);

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

  // 天気取得（Open-Meteo API対応）
  useEffect(() => {
    if (wc.enabled) {
      const area = getAreaByCode(wc.areaCode);
      fetchWeather(wc.areaCode, area?.lat, area?.lon).then(setWeather);
    }
  }, [wc.enabled, wc.areaCode]);

  // ネイティブカレンダー設定
  const nativeCalConfig = userConfig.nativeCalendar || { enabled: false, selectedCalendarIds: [] };

  // スケジュールデータ取得
  const loadScheduleData = useCallback(async () => {
    const [events, bdays, mTodos, gTodos, mItems, dList, gList] = await Promise.all([
      getExternalEvents(),
      getBirthdayEntries(),
      getTodosForCalendar(),
      getTodoItems(),
      getMustDoItems(),
      getDreams(),
      getGoals(),
    ]);
    // ネイティブカレンダー（Android/iOS）イベント取得
    let allEvents = events;
    if (nativeCalConfig.enabled && Platform.OS !== 'web') {
      const nativeEvents = await fetchNativeCalendarEvents(nativeCalConfig.selectedCalendarIds);
      allEvents = [...events, ...nativeEvents];
    }
    setExternalEvents(allEvents);
    setBirthdays(bdays);
    setMandalaTodos(mTodos);
    setGoalTodos(gTodos);
    setMustDoItems(mItems);
    setDreams(dList);
    setGoals(gList);
  }, [nativeCalConfig.enabled, nativeCalConfig.selectedCalendarIds]);

  useFocusEffect(useCallback(() => {
    loadScheduleData();
  }, [loadScheduleData]));

  // プルダウン更新
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadScheduleData();
    setRefreshing(false);
  }, [loadScheduleData]);

  // 選択日のスケジュールアイテム計算
  interface ScheduleItem {
    type: 'external' | 'birthday' | 'mandala' | 'goal' | 'mustdo';
    icon: string;
    title: string;
    time: string;
    color: string;
    sortKey: number;
  }

  const scheduleItems = useMemo((): ScheduleItem[] => {
    const items: ScheduleItem[] = [];
    const [, m, d] = localSelectedDate.split('-').map(Number);

    // 夢（期限がこの日のもの）
    dreams
      .filter(dr => dr.deadline?.startsWith(localSelectedDate))
      .forEach(dr => items.push({ type: 'external', icon: '🌟', title: `夢: ${dr.title}`, time: '終日', color: '#FFD700', sortKey: 0 }));

    // 目標（期限がこの日のもの）
    goals
      .filter(g => g.deadline?.startsWith(localSelectedDate) && g.status !== 'completed')
      .forEach(g => items.push({ type: 'external', icon: '🏆', title: `目標: ${g.title}`, time: '終日', color: '#FF69B4', sortKey: 0 }));

    // 外部カレンダーイベント
    externalEvents
      .filter(e => e.startTime.split('T')[0] === localSelectedDate)
      .forEach(e => {
        let time = '終日';
        let sortKey = 0;
        if (!e.isAllDay && e.startTime.includes('T')) {
          const dt = new Date(e.startTime);
          time = `${dt.getHours()}:${String(dt.getMinutes()).padStart(2, '0')}`;
          sortKey = dt.getHours() * 60 + dt.getMinutes();
        }
        items.push({ type: 'external', icon: '📅', title: e.title, time, color: e.calendarColor || '#4285F4', sortKey });
      });

    // 誕生日（重複排除：同姓同名は1つだけ表示）
    const addedNames = new Set<string>();
    // ユーザー自身の誕生日（設定プロフィールから）
    const userBirthDate = userConfig.userProfile?.birthDate;
    const userName = userConfig.userProfile?.name || 'あなた';
    if (userBirthDate) {
      const [, um, ud] = userBirthDate.split('-').map(Number);
      if (um === m && ud === d) {
        items.push({ type: 'birthday', icon: '🎂', title: `${userName}さんの誕生日`, time: '終日', color: '#FF69B4', sortKey: 0 });
        addedNames.add(userName);
      }
    }
    // 登録済み誕生日（重複スキップ）
    birthdays
      .filter(b => b.birthday.month === m && b.birthday.day === d && (b.showOnCalendar ?? true) && !addedNames.has(b.displayName))
      .forEach(b => { items.push({ type: 'birthday', icon: '🎂', title: `${b.displayName}さんの誕生日`, time: '終日', color: '#FF69B4', sortKey: 0 }); addedNames.add(b.displayName); });

    // マンダラTodo
    mandalaTodos
      .filter(t => t.deadline && t.deadline.startsWith(localSelectedDate) && !t.isCompleted)
      .forEach(t => items.push({ type: 'mandala', icon: '🎯', title: t.title, time: '終日', color: '#8B5CF6', sortKey: 0 }));

    // MustDo（期限がこの日のもの）
    mustDoItems
      .filter(mi => mi.deadline === localSelectedDate && mi.status !== 'completed')
      .forEach(mi => items.push({ type: 'mustdo', icon: '🔥', title: mi.title, time: '終日', color: '#FF9800', sortKey: 0 }));

    // 目標管理Todo
    goalTodos
      .filter(t => t.date === localSelectedDate && !t.isCompleted)
      .forEach(t => items.push({ type: 'goal', icon: '✅', title: t.title, time: '終日', color: '#2196F3', sortKey: 0 }));

    // ソート: 時間あり(sortKey>0)を先に、時間順。終日(sortKey=0)は後ろ
    items.sort((a, b) => {
      if (a.sortKey > 0 && b.sortKey > 0) return a.sortKey - b.sortKey;
      if (a.sortKey > 0) return -1;
      if (b.sortKey > 0) return 1;
      return 0;
    });

    return items;
  }, [localSelectedDate, externalEvents, birthdays, mandalaTodos, goalTodos, mustDoItems, dreams, goals]);

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
    setLocalSelectedDate(date);
  };

  const goToDay = () => {
    setSelectedDate(localSelectedDate);
    navigation.navigate('Day');
  };

  // 日付長押しで予定作成（Android/iOSのみ）
  const handleDayLongPress = (day: number, m?: number, y?: number) => {
    if (Platform.OS === 'web') return;
    const date = formatDate(new Date(y ?? year, m ?? month, day));
    setLocalSelectedDate(date);
    setShowEventCreate(true);
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
      const icons = getDateIcons(dateStr, externalEvents, birthdays, mandalaTodos, dreams, goals, mustDoItems, goalTodos, userConfig.userProfile?.birthDate, userConfig.userProfile?.name);
      week.push(
        <CalendarDay key={i} day={dayNum} dayOfWeek={i} isToday={checkIsToday(d)}
          isSelected={localSelectedDate === dateStr} score={score} colorful={colorful}
          weather={dayWeather} showWeatherIcon={wc.showIcon} showWeatherTemp={wc.showTemp} showWeatherRain={wc.showRain}
          hasBirthday={icons.hasBirthday} birthdayNames={icons.birthdayNames} hasExternal={icons.hasExternal} hasMandala={icons.hasMandala}
          hasDream={icons.hasDream} hasGoal={icons.hasGoal} hasMustDo={icons.hasMustDo} hasTodo={icons.hasTodo}
          onPress={() => handleDayPress(dayNum, m, y)} onLongPress={() => handleDayLongPress(dayNum, m, y)} isWeekView />
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
      const icons = getDateIcons(dateStr, externalEvents, birthdays, mandalaTodos, dreams, goals, mustDoItems, goalTodos, userConfig.userProfile?.birthDate, userConfig.userProfile?.name);
      week.push(
        <CalendarDay key={d} day={d} dayOfWeek={dayOfWeek} isToday={checkIsToday(date)}
          isSelected={localSelectedDate === dateStr} score={monthScores[d]} colorful={colorful}
          weather={dayWeather} showWeatherIcon={wc.showIcon} showWeatherTemp={wc.showTemp} showWeatherRain={wc.showRain}
          hasBirthday={icons.hasBirthday} birthdayNames={icons.birthdayNames} hasExternal={icons.hasExternal} hasMandala={icons.hasMandala}
          hasDream={icons.hasDream} hasGoal={icons.hasGoal} hasMustDo={icons.hasMustDo} hasTodo={icons.hasTodo}
          onPress={() => handleDayPress(d)} onLongPress={() => handleDayLongPress(d)} />
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
        <View style={s.titleButtons}>
          <TouchableOpacity style={[s.viewToggle, { backgroundColor: themeColor }]} onPress={toggleViewMode}>
            <Text style={s.viewToggleText}>{viewMode === 'month' ? '月' : '週'}</Text>
          </TouchableOpacity>
          {Platform.OS !== 'web' && (
            <TouchableOpacity style={[s.addBtn, { backgroundColor: themeColor }]} onPress={() => setShowEventCreate(true)}>
              <Text style={s.addBtnText}>＋</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
      {/* ナビ */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => viewMode === 'week' ? navigateWeek(-1) : setViewDate(new Date(year, month - 1, 1))} onLongPress={() => setShowMonthPicker(true)} style={s.navBtn}>
          <Text style={s.navIcon}>‹</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setViewDate(new Date())} style={s.dateCenter}>
          <Text style={[s.monthText, { fontSize: getFontSize(20, fs) }]}>{viewMode === 'week' ? `${viewDate.getMonth() + 1}/${viewDate.getDate()}週` : `${year}年 ${month + 1}月`}</Text>
          {(year !== new Date().getFullYear() || month !== new Date().getMonth()) && <Text style={[s.todayLink, { fontSize: getFontSize(12, fs) }]}>今月に戻る</Text>}
        </TouchableOpacity>
        <TouchableOpacity onPress={() => viewMode === 'week' ? navigateWeek(1) : setViewDate(new Date(year, month + 1, 1))} onLongPress={() => setShowMonthPicker(true)} style={s.navBtn}>
          <Text style={s.navIcon}>›</Text>
        </TouchableOpacity>
      </View>
      {/* 月運サマリー */}
      {monthlyFortune && (
        <View style={s.monthlyBox}>
          <View style={s.monthlyHeader}>
            <Text style={[s.monthlyTitle, { fontSize: getFontSize(14, fs) }]}>{month + 1}月の運勢</Text>
            <Text style={[s.monthlyScore, { fontSize: getFontSize(18, fs) }]}>{monthlyFortune.scores.total}点</Text>
            <Text style={[s.monthlyStars, { fontSize: getFontSize(14, fs) }]}>{starsDisplay(monthlyFortune.scores.total)}</Text>
          </View>
          <Text style={[s.monthlyAdvice, { fontSize: getFontSize(12, fs) }]}>{monthlyAdvice}</Text>
        </View>
      )}
      <ScrollView style={s.scrollContainer} showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={themeColor} colors={[themeColor]} />}>
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
        {/* 選択日のスケジュール */}
        <View style={s.scheduleSection}>
          <View style={s.scheduleHeader}>
            <Text style={[s.scheduleDate, { fontSize: getFontSize(16, fs) }]}>
              {parseInt(localSelectedDate.split('-')[1])}月{parseInt(localSelectedDate.split('-')[2])}日の予定
            </Text>
            <TouchableOpacity style={[s.detailBtn, { backgroundColor: themeColor }]} onPress={goToDay}>
              <Text style={[s.detailBtnText, { fontSize: getFontSize(12, fs) }]}>詳細 →</Text>
            </TouchableOpacity>
          </View>
          {scheduleItems.length === 0 ? (
            <TouchableOpacity onLongPress={() => Platform.OS !== 'web' && setShowEventCreate(true)} activeOpacity={1}>
              <Text style={[s.noSchedule, { fontSize: getFontSize(14, fs) }]}>予定はありません</Text>
            </TouchableOpacity>
          ) : (
            scheduleItems.map((item, idx) => (
              <View key={idx} style={s.scheduleItem}>
                <Text style={[s.scheduleTime, { color: item.color, fontSize: getFontSize(12, fs) }]}>{item.time}</Text>
                <Text style={[s.scheduleIcon, { fontSize: getFontSize(16, fs) }]}>{item.icon}</Text>
                <Text style={[s.scheduleTitle, { fontSize: getFontSize(14, fs) }]} numberOfLines={1}>{item.title}</Text>
              </View>
            ))
          )}
        </View>
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
    {/* 予定作成画面 */}
    <EventCreateScreen
      visible={showEventCreate}
      onClose={() => setShowEventCreate(false)}
      onSave={loadScheduleData}
      initialDate={localSelectedDate}
    />
    </View>
  );
};

const s = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  titleBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 8, backgroundColor: '#fff', borderBottomWidth: 0.5, borderBottomColor: '#E5E5E5' },
  title: { fontSize: 22, fontWeight: '700', color: '#1C1C1E', flex: 1, textAlign: 'center' },
  titleButtons: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  viewToggle: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  viewToggleText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  addBtn: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  addBtnText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
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
  // スケジュールセクション
  scheduleSection: { backgroundColor: '#fff', marginHorizontal: 12, marginTop: 12, marginBottom: 20, borderRadius: 12, padding: 12 },
  scheduleHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  scheduleDate: { fontSize: 16, fontWeight: '600', color: '#1C1C1E' },
  detailBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  detailBtnText: { fontSize: 12, fontWeight: '600', color: '#fff' },
  noSchedule: { fontSize: 14, color: '#999', textAlign: 'center', paddingVertical: 16 },
  scheduleItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 0.5, borderBottomColor: '#E5E5E5' },
  scheduleTime: { fontSize: 12, fontWeight: '600', width: 50 },
  scheduleIcon: { fontSize: 16, marginHorizontal: 8 },
  scheduleTitle: { flex: 1, fontSize: 14, color: '#333' },
});

export default CalendarScreen;
