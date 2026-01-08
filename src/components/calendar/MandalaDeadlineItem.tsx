// マンダラ期限表示コンポーネント
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MandalaTodo } from '../../types/mandala';

interface Props {
  todo: MandalaTodo;
}

export const MandalaDeadlineItem: React.FC<Props> = ({ todo }) => {
  return (
    <View style={s.container}>
      <Text style={s.icon}>🎯</Text>
      <View style={s.content}>
        <Text style={s.title} numberOfLines={1}>{todo.title}</Text>
        <Text style={s.label}>期限</Text>
      </View>
    </View>
  );
};

const s = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EDE9FE',
    borderLeftWidth: 3,
    borderLeftColor: '#8B5CF6',
    borderRadius: 6,
    padding: 8,
    marginVertical: 2,
  },
  icon: {
    fontSize: 16,
    marginRight: 8,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  label: {
    fontSize: 11,
    color: '#8B5CF6',
    marginLeft: 8,
  },
});

export default MandalaDeadlineItem;
