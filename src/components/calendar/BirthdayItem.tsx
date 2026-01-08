// 誕生日表示コンポーネント
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { BirthdayEntry } from '../../types/birthday';
import { calculateAge } from '../../services/birthdayService';

interface Props {
  entry: BirthdayEntry;
  showAge?: boolean;
}

export const BirthdayItem: React.FC<Props> = ({ entry, showAge = true }) => {
  const age = showAge ? calculateAge(entry.birthday.year) : null;

  return (
    <View style={s.container}>
      <Text style={s.icon}>🎂</Text>
      <View style={s.content}>
        <Text style={s.name}>{entry.displayName}さんの誕生日</Text>
        {age !== null && <Text style={s.age}>{age}歳</Text>}
      </View>
    </View>
  );
};

const s = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF0F5',
    borderLeftWidth: 3,
    borderLeftColor: '#FF69B4',
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
  name: {
    fontSize: 14,
    color: '#333',
  },
  age: {
    fontSize: 12,
    color: '#666',
  },
});

export default BirthdayItem;
