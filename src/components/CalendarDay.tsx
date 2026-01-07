// Fortune Calendar カレンダー日付 v1.5
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

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
  showWeatherIcon = true, showWeatherTemp = true, showWeatherRain = true, onPress,
}) => {
  if (day === 0) return <View style={s.cell} />;

  const textColor = dayOfWeek === 0 ? '#FF3B30' : dayOfWeek === 6 ? '#007AFF' : '#1C1C1E';
  const stars = score !== undefined ? (colorful ? getColorfulStars(score) : getSimpleStars(score)) : null;

  return (
    <TouchableOpacity style={s.cell} onPress={onPress} activeOpacity={0.6}>
      <View style={[s.dayWrap, isToday && s.today, isSelected && !isToday && s.selected]}>
        <Text style={[s.dayText, { color: isToday || isSelected ? '#fff' : textColor }]}>{day}</Text>
      </View>
      {showWeatherIcon && weather?.icon && <Text style={s.weatherIcon}>{weather.icon}</Text>}
      {showWeatherTemp && weather?.tempMax !== undefined && (
        <Text style={s.temp}>{weather.tempMax}°</Text>
      )}
      {showWeatherRain && weather?.rainChance !== undefined && weather.rainChance > 0 && (
        <Text style={s.rain}>{weather.rainChance}%</Text>
      )}
      {stars && <Text style={[s.stars, { color: stars.color }]}>{'★'.repeat(stars.count)}</Text>}
    </TouchableOpacity>
  );
};

const s = StyleSheet.create({
  cell: { flex: 1, aspectRatio: 1, alignItems: 'center', paddingTop: 4, borderRightWidth: 0.5, borderBottomWidth: 0.5, borderColor: '#E5E5E5' },
  dayWrap: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  today: { backgroundColor: '#FF2D55' },
  selected: { backgroundColor: '#007AFF' },
  dayText: { fontSize: 15, fontWeight: '400' },
  weatherIcon: { fontSize: 16, marginTop: 1 },
  temp: { fontSize: 10, color: '#FF6B6B', fontWeight: '600' },
  rain: { fontSize: 9, color: '#4A90D9' },
  stars: { fontSize: 6, marginTop: 1, letterSpacing: -1 },
});

export default CalendarDay;
