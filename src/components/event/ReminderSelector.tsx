// Fortune Calendar 通知選択 v1.0
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface ReminderSelectorProps {
  value: number[]; // 分単位（負の値）
  onChange: (value: number[]) => void;
  themeColor?: string;
}

const REMINDER_OPTIONS: { minutes: number; label: string }[] = [
  { minutes: -5, label: '5分前' },
  { minutes: -15, label: '15分前' },
  { minutes: -30, label: '30分前' },
  { minutes: -60, label: '1時間前' },
  { minutes: -1440, label: '1日前' },
];

export const ReminderSelector: React.FC<ReminderSelectorProps> = ({
  value,
  onChange,
  themeColor = '#FF69B4',
}) => {
  const toggleReminder = (minutes: number) => {
    if (value.includes(minutes)) {
      onChange(value.filter(m => m !== minutes));
    } else {
      onChange([...value, minutes].sort((a, b) => b - a));
    }
  };

  return (
    <View style={s.container}>
      <Text style={s.label}>通知</Text>
      <View style={s.options}>
        {REMINDER_OPTIONS.map(opt => {
          const isSelected = value.includes(opt.minutes);
          return (
            <TouchableOpacity
              key={opt.minutes}
              style={[s.option, isSelected && { backgroundColor: themeColor }]}
              onPress={() => toggleReminder(opt.minutes)}
            >
              <Text style={[s.optionText, isSelected && s.optionTextActive]}>
                {opt.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
      {value.length === 0 && <Text style={s.hint}>タップして選択（複数可）</Text>}
    </View>
  );
};

const s = StyleSheet.create({
  container: { marginVertical: 8 },
  label: { fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 8 },
  options: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  option: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 16, backgroundColor: '#eee' },
  optionText: { fontSize: 14, color: '#666' },
  optionTextActive: { color: '#fff', fontWeight: 'bold' },
  hint: { fontSize: 12, color: '#999', marginTop: 4 },
});

export default ReminderSelector;
