// Fortune Calendar カレンダー日付 v3.1 (動的予定表示数)
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const isTablet = SCREEN_WIDTH >= 768;
const SCALE = isTablet ? 1.6 : 1.2;
const BASE_MAX_EVENTS = 5;  // ベース表示数

interface WeatherInfo {
  icon?: string;
  tempMax?: number;
  tempMin?: number;
  rainChance?: number;
}

interface EventTitle {
  title: string;
  color?: string;
}

interface Props {
  day: number;
  dayOfWeek: number;
  isToday: boolean;
  isSelected: boolean;
  score?: number;
  colorful?: boolean;
  weather?: WeatherInfo;
  showWeatherIcon?: boolean;
  showWeatherTemp?: boolean;
  showWeatherRain?: boolean;
  onPress: () => void;
  onLongPress?: () => void;
  isWeekView?: boolean;
  // イベント表示
  eventTitles?: EventTitle[];
  // 誕生日
  hasBirthday?: boolean;
  birthdayNames?: string[];
  // 六曜
  rokuyo?: string;
}

const getColorfulStars = (score: number): { count: number; color: string } => {
  if (score >= 80) return { count: 5, color: '#FFD700' };
  if (score >= 60) return { count: 4, color: '#FFA500' };
  if (score >= 40) return { count: 3, color: '#FF69B4' };
  if (score >= 20) return { count: 2, color: '#87CEEB' };
  return { count: 1, color: '#D3D3D3' };
};

const getSimpleStars = (score: number): { count: number; color: string } => {
  const count = score >= 80 ? 5 : score >= 60 ? 4 : score >= 40 ? 3 : score >= 20 ? 2 : 1;
  return { count, color: '#FFD700' };
};

export const CalendarDay: React.FC<Props> = ({
  day, dayOfWeek, isToday, isSelected, score, colorful, weather,
  showWeatherIcon = true, showWeatherTemp = true, showWeatherRain = true,
  onPress, onLongPress, isWeekView, eventTitles, hasBirthday, birthdayNames, rokuyo,
}) => {
  if (day === 0) return <View style={s.cell} />;

  const textColor = dayOfWeek === 0 ? '#FF3B30' : dayOfWeek === 6 ? '#007AFF' : '#1C1C1E';
  const stars = score !== undefined ? (colorful ? getColorfulStars(score) : getSimpleStars(score)) : null;
  const weekScale = isWeekView ? 1.3 : 1;

  // 表示可能な予定数を動的計算（天気・誕生日で使用するスロットを減算）
  const hasWeather = showWeatherIcon && weather?.icon;
  const hasBday = hasBirthday && birthdayNames && birthdayNames.length > 0;
  let maxEvents = BASE_MAX_EVENTS;
  if (hasWeather) maxEvents -= 1;
  if (hasBday) maxEvents -= 1;
  if (isWeekView) maxEvents = Math.max(2, maxEvents - 1);  // 週表示は少し減らす

  const visibleEvents = eventTitles?.slice(0, maxEvents) || [];
  const remainingCount = (eventTitles?.length || 0) - maxEvents;

  return (
    <TouchableOpacity style={[s.cell, isWeekView && s.weekCell]} onPress={onPress} onLongPress={onLongPress} activeOpacity={0.6}>
      {/* 日付と運勢 */}
      <View style={s.topRow}>
        <View style={[s.dayWrap, isToday && s.today, isSelected && !isToday && s.selected]}>
          <Text style={[s.dayText, { color: isToday || isSelected ? '#fff' : textColor, fontSize: 12 * SCALE * weekScale }]}>{day}</Text>
        </View>
        {stars && <Text style={[s.stars, { color: stars.color, fontSize: 5 * SCALE * weekScale }]}>{'★'.repeat(stars.count)}</Text>}
      </View>
      {/* 六曜 */}
      {rokuyo && <Text style={s.rokuyoText}>{rokuyo}</Text>}

      {/* 天気 */}
      {showWeatherIcon && weather?.icon && (
        <View style={s.weatherRow}>
          <Text style={{ fontSize: 12 * SCALE * weekScale }}>{weather.icon}</Text>
          {showWeatherTemp && weather.tempMax !== undefined && (
            <Text style={[s.temp, { fontSize: 8 * SCALE * weekScale }]}>{weather.tempMax}°</Text>
          )}
          {showWeatherRain && weather.rainChance !== undefined && weather.rainChance > 0 && (
            <Text style={[s.rain, { fontSize: 8 * SCALE * weekScale }]}>{weather.rainChance}%</Text>
          )}
        </View>
      )}

      {/* 誕生日 */}
      {hasBirthday && birthdayNames && birthdayNames.length > 0 && (
        <View style={s.eventRow}>
          <Text style={s.eventIcon}>🎂</Text>
          <Text style={[s.eventText, { color: '#FF69B4' }]} numberOfLines={1}>
            {birthdayNames[0]}
          </Text>
        </View>
      )}

      {/* 予定テキスト表示 */}
      {visibleEvents.map((ev, idx) => (
        <View key={idx} style={s.eventRow}>
          <View style={[s.eventDot, { backgroundColor: ev.color || '#4285F4' }]} />
          <Text style={s.eventText} numberOfLines={1}>{ev.title}</Text>
        </View>
      ))}

      {/* 他X件 */}
      {remainingCount > 0 && (
        <Text style={s.moreText}>他{remainingCount}件</Text>
      )}
    </TouchableOpacity>
  );
};

const s = StyleSheet.create({
  cell: { flex: 1, aspectRatio: 0.45, paddingTop: 3, paddingHorizontal: 2, borderRightWidth: 0.5, borderBottomWidth: 0.5, borderColor: '#E5E5E5' },
  weekCell: { aspectRatio: 0.40, paddingTop: 6 },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 },
  dayWrap: { width: 20 * SCALE, height: 20 * SCALE, borderRadius: 10 * SCALE, alignItems: 'center', justifyContent: 'center' },
  today: { backgroundColor: '#FF2D55' },
  selected: { backgroundColor: '#007AFF' },
  dayText: { fontSize: 12 * SCALE, fontWeight: '500' },
  stars: { fontSize: 5 * SCALE, letterSpacing: -1 },
  rokuyoText: { fontSize: 8, color: '#888', textAlign: 'center', marginBottom: 1 },
  weatherRow: { flexDirection: 'row', alignItems: 'center', gap: 2, marginBottom: 2 },
  temp: { color: '#FF6B6B', fontWeight: '600' },
  rain: { color: '#4A90D9' },
  eventRow: { flexDirection: 'row', alignItems: 'center', marginTop: 1 },
  eventDot: { width: 6, height: 6, borderRadius: 3, marginRight: 3 },
  eventIcon: { fontSize: 8, marginRight: 2 },
  eventText: { fontSize: 9, color: '#333', flex: 1 },
  moreText: { fontSize: 8, color: '#999', marginTop: 1 },
});

export default CalendarDay;
