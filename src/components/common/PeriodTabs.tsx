// Fortune Calendar 期間タブコンポーネント v1.0
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export type FortunePeriod = 'daily' | 'monthly' | 'yearly';

interface PeriodTabsProps {
  selectedPeriod: FortunePeriod;
  onPeriodChange: (period: FortunePeriod) => void;
  disabled?: boolean;
}

const PERIODS: { key: FortunePeriod; label: string }[] = [
  { key: 'daily', label: '日運' },
  { key: 'monthly', label: '月運' },
  { key: 'yearly', label: '年運' },
];

export const PeriodTabs: React.FC<PeriodTabsProps> = ({
  selectedPeriod,
  onPeriodChange,
  disabled = false,
}) => {
  return (
    <View style={s.container}>
      {PERIODS.map(({ key, label }) => {
        const isSelected = selectedPeriod === key;
        return (
          <TouchableOpacity
            key={key}
            style={[s.tab, isSelected && s.tabActive]}
            onPress={() => !disabled && onPeriodChange(key)}
            disabled={disabled}
            activeOpacity={0.7}
          >
            <Text style={[s.tabText, isSelected && s.tabTextActive]}>
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const s = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    padding: 4,
    marginBottom: 12,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: '#FF69B4',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  tabTextActive: {
    color: '#fff',
  },
});

export default PeriodTabs;
