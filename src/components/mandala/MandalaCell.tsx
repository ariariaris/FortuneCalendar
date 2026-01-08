// マンダラセルコンポーネント
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MandalaActionStatus } from '../../types/mandala';

interface Props {
  content: string;
  status?: MandalaActionStatus;
  isCenter?: boolean;
  isElementCenter?: boolean;
  elementColor?: string;
  onPress?: () => void;
  onLongPress?: () => void;
  size: number;
}

export const MandalaCell: React.FC<Props> = ({
  content,
  status = 'not_started',
  isCenter = false,
  isElementCenter = false,
  elementColor = '#E5E5E5',
  onPress,
  onLongPress,
  size,
}) => {
  const getBgColor = () => {
    if (isCenter) return '#FFD700';
    if (isElementCenter) return elementColor;
    if (status === 'completed') return '#D1FAE5';
    if (status === 'in_progress') return '#FEF3C7';
    return '#fff';
  };

  const getTextColor = () => {
    if (isCenter || isElementCenter) return '#fff';
    return '#333';
  };

  const getStatusIcon = () => {
    if (status === 'completed') return '✓';
    if (status === 'in_progress') return '●';
    return '';
  };

  return (
    <TouchableOpacity
      style={[s.cell, { width: size, height: size, backgroundColor: getBgColor() }]}
      onPress={onPress}
      onLongPress={onLongPress}
      activeOpacity={0.7}
    >
      <Text style={[s.text, { color: getTextColor() }]} numberOfLines={2}>
        {content || (isCenter ? '🎯' : isElementCenter ? '' : '')}
      </Text>
      {status !== 'not_started' && !isCenter && !isElementCenter && (
        <Text style={s.status}>{getStatusIcon()}</Text>
      )}
    </TouchableOpacity>
  );
};

const s = StyleSheet.create({
  cell: {
    borderWidth: 0.5,
    borderColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 2,
  },
  text: {
    fontSize: 9,
    textAlign: 'center',
  },
  status: {
    position: 'absolute',
    bottom: 1,
    right: 1,
    fontSize: 8,
    color: '#22C55E',
  },
});

export default MandalaCell;
