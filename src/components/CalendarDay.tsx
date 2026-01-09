// Fortune Calendar カレンダー日付 v1.9 (イベントアイコン追加)
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const isTablet = SCREEN_WIDTH >= 768;
const SCALE = isTablet ? 1.6 : 1.2;

interface WeatherInfo {
  icon?: string;
  tempMax?: number;
  tempMin?: number;
  rainChance?: number;
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
  isWeekView?: boolean;
  // イベントアイコン
  hasBirthday?: boolean;
  hasExternal?: boolean;
  hasMandala?: boolean;
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
  showWeatherIcon = true, showWeatherTemp = true, showWeatherRain = true, onPress, isWeekView,
  hasBirthday, hasExternal, hasMandala,
}) => {
  if (day === 0) return <View style={s.cell} />;

  const textColor = dayOfWeek === 0 ? '#FF3B30' : dayOfWeek === 6 ? '#007AFF' : '#1C1C1E';
  const stars = score !== undefined ? (colorful ? getColorfulStars(score) : getSimpleStars(score)) : null;
  const weekScale = isWeekView ? 1.3 : 1;
  const hasEvents = hasBirthday || hasExternal || hasMandala;

  return (
    <TouchableOpacity style={[s.cell, isWeekView && s.weekCell]} onPress={onPress} activeOpacity={0.6}>
      <View style={[s.dayWrap, isToday && s.today, isSelected && !isToday && s.selected, isWeekView && { width: 40 * SCALE, height: 40 * SCALE, borderRadius: 20 * SCALE }]}>
        <Text style={[s.dayText, { color: isToday || isSelected ? '#fff' : textColor, fontSize: 17 * SCALE * weekScale }]}>{day}</Text>
      </View>
      {stars && <Text style={[s.stars, { color: stars.color, fontSize: 10 * SCALE * weekScale }]}>{'★'.repeat(stars.count)}</Text>}
      {hasEvents && (
        <View style={s.eventIcons}>
          {hasBirthday && <Text style={[s.eventIcon, { fontSize: 10 * SCALE }]}>🎂</Text>}
          {hasExternal && <Text style={[s.eventIcon, { fontSize: 10 * SCALE }]}>📅</Text>}
          {hasMandala && <Text style={[s.eventIcon, { fontSize: 10 * SCALE }]}>🎯</Text>}
        </View>
      )}
      {showWeatherIcon && weather?.icon && <Text style={[s.weatherIcon, { fontSize: 18 * SCALE * weekScale }]}>{weather.icon}</Text>}
      {showWeatherTemp && weather?.tempMax !== undefined && (
        <Text style={[s.temp, { fontSize: 12 * SCALE * weekScale }]}>{weather.tempMax}°</Text>
      )}
      {showWeatherRain && weather?.rainChance !== undefined && weather.rainChance > 0 && (
        <Text style={[s.rain, { fontSize: 11 * SCALE * weekScale }]}>{weather.rainChance}%</Text>
      )}
    </TouchableOpacity>
  );
};

const s = StyleSheet.create({
  cell: { flex: 1, aspectRatio: 0.85, alignItems: 'center', paddingTop: 6 * SCALE, borderRightWidth: 0.5, borderBottomWidth: 0.5, borderColor: '#E5E5E5' },
  weekCell: { aspectRatio: 0.6, paddingTop: 12 * SCALE },
  dayWrap: { width: 32 * SCALE, height: 32 * SCALE, borderRadius: 16 * SCALE, alignItems: 'center', justifyContent: 'center' },
  today: { backgroundColor: '#FF2D55' },
  selected: { backgroundColor: '#007AFF' },
  dayText: { fontSize: 17 * SCALE, fontWeight: '500' },
  stars: { fontSize: 8 * SCALE, marginTop: 2, letterSpacing: -1 },
  eventIcons: { flexDirection: 'row', marginTop: 1 },
  eventIcon: { fontSize: 10 * SCALE },
  weatherIcon: { fontSize: 18 * SCALE, marginTop: 2 },
  temp: { fontSize: 12 * SCALE, color: '#FF6B6B', fontWeight: '600' },
  rain: { fontSize: 11 * SCALE, color: '#4A90D9' },
});

export default CalendarDay;
