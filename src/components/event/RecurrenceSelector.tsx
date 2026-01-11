// Fortune Calendar 繰り返し選択 v1.0
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { RecurrenceType } from '../../services/nativeCalendarService';

interface RecurrenceSelectorProps {
  value: RecurrenceType;
  onChange: (value: RecurrenceType) => void;
  themeColor?: string;
}

const RECURRENCE_OPTIONS: { key: RecurrenceType; label: string }[] = [
  { key: 'none', label: 'なし' },
  { key: 'daily', label: '毎日' },
  { key: 'weekly', label: '毎週' },
  { key: 'monthly', label: '毎月' },
  { key: 'yearly', label: '毎年' },
];

export const RecurrenceSelector: React.FC<RecurrenceSelectorProps> = ({
  value,
  onChange,
  themeColor = '#FF69B4',
}) => {
  return (
    <View style={s.container}>
      <Text style={s.label}>繰り返し</Text>
      <View style={s.options}>
        {RECURRENCE_OPTIONS.map(opt => (
          <TouchableOpacity
            key={opt.key}
            style={[s.option, value === opt.key && { backgroundColor: themeColor }]}
            onPress={() => onChange(opt.key)}
          >
            <Text style={[s.optionText, value === opt.key && s.optionTextActive]}>
              {opt.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
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
});

export default RecurrenceSelector;
