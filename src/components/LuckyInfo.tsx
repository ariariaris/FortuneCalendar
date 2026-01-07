// Fortune Calendar ラッキー情報 v1.0
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LuckyInfo as LuckyInfoType } from '../config/types';

interface Props {
  lucky: LuckyInfoType;
}

export const LuckyInfo: React.FC<Props> = ({ lucky }) => {
  return (
    <View style={s.container}>
      <Text style={s.title}>Lucky Info</Text>
      <View style={s.row}>
        <LuckyItem label="カラー" value={lucky.color} icon="🎨" />
        <LuckyItem label="アイテム" value={lucky.item} icon="🎁" />
      </View>
      <View style={s.row}>
        {lucky.direction && <LuckyItem label="方位" value={lucky.direction} icon="🧭" />}
        {lucky.number && <LuckyItem label="ナンバー" value={String(lucky.number)} icon="🔢" />}
      </View>
    </View>
  );
};

const LuckyItem: React.FC<{ label: string; value: string; icon: string }> = ({ label, value, icon }) => (
  <View style={s.item}>
    <Text style={s.icon}>{icon}</Text>
    <View>
      <Text style={s.label}>{label}</Text>
      <Text style={s.value}>{value}</Text>
    </View>
  </View>
);

const s = StyleSheet.create({
  container: { backgroundColor: '#FFF0F5', borderRadius: 12, padding: 16, marginVertical: 8 },
  title: { fontSize: 14, fontWeight: 'bold', color: '#FF69B4', marginBottom: 12, textAlign: 'center' },
  row: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 8 },
  item: { flexDirection: 'row', alignItems: 'center' },
  icon: { fontSize: 20, marginRight: 8 },
  label: { fontSize: 11, color: '#999' },
  value: { fontSize: 14, fontWeight: 'bold', color: '#333' },
});

export default LuckyInfo;
