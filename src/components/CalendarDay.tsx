// Fortune Calendar カレンダー日付 v2.1 (誕生日名前表示)
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
  birthdayNames?: string[];
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
  hasBirthday, birthdayNames, hasExternal, hasMandala,
}) => {
  if (day === 0) return <View style={s.cell} />;

  const textColor = dayOfWeek === 0 ? '#FF3B30' : dayOfWeek === 6 ? '#007AFF' : '#1C1C1E';
  const stars = score !== undefined ? (colorful ? getColorfulStars(score) : getSimpleStars(score)) : null;
  const weekScale = isWeekView ? 1.3 : 1;
  const hasEvents = hasBirthday || hasExternal || hasMandala;

  return (
    <TouchableOpacity style={[s.cell, isWeekView && s.weekCell]} onPress={onPress} activeOpacity={0.6}>
      <View style={[s.dayWrap, isToday && s.today, isSelected && !isToday && s.selected, isWeekView && { width: 28 * SCALE, height: 28 * SCALE, borderRadius: 14 * SCALE }]}>
        <Text style={[s.dayText, { color: isToday || isSelected ? '#fff' : textColor, fontSize: 12 * SCALE * weekScale }]}>{day}</Text>
      </View>
      {stars && <Text style={[s.stars, { color: stars.color, fontSize: 8 * SCALE * weekScale }]}>{'★'.repeat(stars.count)}</Text>}
      {hasBirthday && birthdayNames && birthdayNames.length > 0 && (
        <View style={s.birthdayBox}>
          <Text style={s.birthdayName} numberOfLines={2}>{birthdayNames.join('\n')}</Text>
          <Text style={s.eventIcon}>🎂</Text>
        </View>
      )}
      {(hasExternal || hasMandala) && (
        <View style={s.eventIcons}>
          {hasExternal && <Text style={s.eventIcon}>📅</Text>}
          {hasMandala && <Text style={s.eventIcon}>🎯</Text>}
        </View>
      )}
      {showWeatherIcon && weather?.icon && <Text style={[s.weatherIcon, { fontSize: 16 * SCALE * weekScale }]}>{weather.icon}</Text>}
      {showWeatherTemp && weather?.tempMax !== undefined && (
        <Text style={[s.temp, { fontSize: 9 * SCALE * weekScale }]}>{weather.tempMax}°</Text>
      )}
      {showWeatherRain && weather?.rainChance !== undefined && weather.rainChance > 0 && (
        <Text style={[s.rain, { fontSize: 9 * SCALE * weekScale }]}>{weather.rainChance}%</Text>
      )}
    </TouchableOpacity>
  );
};

const s = StyleSheet.create({
  cell: { flex: 1, aspectRatio: 0.62, alignItems: 'center', paddingTop: 4 * SCALE, borderRightWidth: 0.5, borderBottomWidth: 0.5, borderColor: '#E5E5E5' },
  weekCell: { aspectRatio: 0.50, paddingTop: 8 * SCALE },
  dayWrap: { width: 20 * SCALE, height: 20 * SCALE, borderRadius: 10 * SCALE, alignItems: 'center', justifyContent: 'center' },
  today: { backgroundColor: '#FF2D55' },
  selected: { backgroundColor: '#007AFF' },
  dayText: { fontSize: 12 * SCALE, fontWeight: '500' },
  stars: { fontSize: 7 * SCALE, marginTop: 2, letterSpacing: -1 },
  birthdayBox: { alignItems: 'center', marginTop: 2 },
  birthdayName: { fontSize: 7 * SCALE, color: '#FF69B4', textAlign: 'center' },
  eventIcons: { flexDirection: 'row', marginTop: 2 },
  eventIcon: { fontSize: 9 * SCALE },
  weatherIcon: { fontSize: 16 * SCALE, marginTop: 3 },
  temp: { fontSize: 9 * SCALE, color: '#FF6B6B', fontWeight: '600', marginTop: 1 },
  rain: { fontSize: 9 * SCALE, color: '#4A90D9', marginTop: 1 },
});

export default CalendarDay;
