// Fortune Calendar 目標管理設定セクション v1.1 (期間入力統一)
import React from 'react';
import { View, Text, Switch, StyleSheet } from 'react-native';
import { GoalDeadlineDefault, DurationConfig } from '../../types/goalManagement';
import { DurationInput } from '../common/DurationInput';
import { TimeframeSelector } from '../common/TimeframeSelector';
import { getFontSize } from '../../utils/fontUtils';
import { FontSize } from '../../config/types';

const DEADLINE_OPTIONS: { key: GoalDeadlineDefault; label: string }[] = [
  { key: 'today', label: '本日' },
  { key: 'birthday', label: '誕生日' },
  { key: 'yearEnd', label: '年末' },
];

interface Props {
  fontSize: FontSize;
  themeColor: string;
  goalDeadlineDefault: GoalDeadlineDefault;
  showGoalsOnCalendar: boolean;
  dreamDefaultDuration: DurationConfig;
  goalDefaultDuration: DurationConfig;
  mustdoDefaultDuration: DurationConfig;
  onGoalDeadlineDefaultChange: (value: GoalDeadlineDefault) => void;
  onShowGoalsOnCalendarChange: (value: boolean) => void;
  onDreamDefaultDurationChange: (value: DurationConfig) => void;
  onGoalDefaultDurationChange: (value: DurationConfig) => void;
  onMustdoDefaultDurationChange: (value: DurationConfig) => void;
}

export const GoalSettingsSection: React.FC<Props> = ({
  fontSize, themeColor,
  goalDeadlineDefault, showGoalsOnCalendar,
  dreamDefaultDuration, goalDefaultDuration, mustdoDefaultDuration,
  onGoalDeadlineDefaultChange, onShowGoalsOnCalendarChange,
  onDreamDefaultDurationChange, onGoalDefaultDurationChange, onMustdoDefaultDurationChange,
}) => {
  const fs = fontSize;

  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { fontSize: getFontSize(16, fs) }]}>目標管理</Text>

      <View style={styles.row}>
        <Text style={[styles.label, { fontSize: getFontSize(14, fs) }]}>カレンダーに表示</Text>
        <Switch value={showGoalsOnCalendar} onValueChange={onShowGoalsOnCalendarChange} trackColor={{ true: themeColor }} />
      </View>

      <TimeframeSelector
        label="期限自動設定"
        value={goalDeadlineDefault}
        options={DEADLINE_OPTIONS}
        onChange={onGoalDeadlineDefaultChange}
        accentColor={themeColor}
      />

      <DurationInput label="夢のデフォルト" value={dreamDefaultDuration} onChange={onDreamDefaultDurationChange} accentColor="#FFD700" />
      <DurationInput label="目標のデフォルト" value={goalDefaultDuration} onChange={onGoalDefaultDurationChange} accentColor="#FF69B4" />
      <DurationInput label="やる事のデフォルト" value={mustdoDefaultDuration} onChange={onMustdoDefaultDurationChange} accentColor="#FF9800" />
    </View>
  );
};

const styles = StyleSheet.create({
  section: { backgroundColor: '#fff', marginBottom: 16, padding: 16, borderRadius: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#333', marginBottom: 12 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8, marginBottom: 8 },
  label: { fontSize: 14, color: '#333' },
});
