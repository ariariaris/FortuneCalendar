// Fortune Calendar 目標進捗バー v1.0
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface Props {
  progress: number;
  showLabel?: boolean;
  color?: string;
}

export const GoalProgress: React.FC<Props> = ({ progress, showLabel = true, color = '#4CAF50' }) => {
  const clampedProgress = Math.min(100, Math.max(0, progress));

  return (
    <View style={styles.container}>
      <View style={styles.barBackground}>
        <View style={[styles.barFill, { width: `${clampedProgress}%`, backgroundColor: color }]} />
      </View>
      {showLabel && <Text style={styles.label}>{clampedProgress}%</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  barBackground: { flex: 1, height: 8, backgroundColor: '#e0e0e0', borderRadius: 4, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 4 },
  label: { fontSize: 12, color: '#666', minWidth: 35, textAlign: 'right' },
});
