// マンダラ進捗バーコンポーネント
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MandalaProgress as ProgressType } from '../../types/mandala';

interface Props {
  progress: ProgressType;
  themeColor?: string;
}

export const MandalaProgressBar: React.FC<Props> = ({ progress, themeColor = '#FF69B4' }) => {
  const { filledCells, totalCells, completedActions, progressPercent } = progress;

  return (
    <View style={s.container}>
      <View style={s.barContainer}>
        <View style={[s.barFill, { width: `${progressPercent}%`, backgroundColor: themeColor }]} />
      </View>
      <View style={s.stats}>
        <Text style={s.text}>{filledCells}/{totalCells} ({progressPercent}%)</Text>
        <Text style={s.subText}>完了: {completedActions}件</Text>
      </View>
    </View>
  );
};

const s = StyleSheet.create({
  container: {
    marginVertical: 12,
  },
  barContainer: {
    height: 8,
    backgroundColor: '#E5E5E5',
    borderRadius: 4,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 4,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  text: {
    fontSize: 12,
    color: '#666',
  },
  subText: {
    fontSize: 12,
    color: '#999',
  },
});

export default MandalaProgressBar;
