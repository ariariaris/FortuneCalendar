// Fortune Calendar ラッキー情報 v1.1 (文字サイズ対応)
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LuckyInfo as LuckyInfoType, FontSize } from '../config/types';
import { getFontSize } from '../utils/fontUtils';

interface Props {
  lucky: LuckyInfoType;
  fontSize?: FontSize;
}

export const LuckyInfo: React.FC<Props> = ({ lucky, fontSize: fs = 'md' }) => {
  return (
    <View style={s.container}>
      <Text style={[s.title, { fontSize: getFontSize(14, fs) }]}>Lucky Info</Text>
      <View style={s.row}>
        <LuckyItem label="カラー" value={lucky.color} icon="🎨" fs={fs} />
        <LuckyItem label="アイテム" value={lucky.item} icon="🎁" fs={fs} />
      </View>
      <View style={s.row}>
        {lucky.direction && <LuckyItem label="方位" value={lucky.direction} icon="🧭" fs={fs} />}
        {lucky.number && <LuckyItem label="ナンバー" value={String(lucky.number)} icon="🔢" fs={fs} />}
      </View>
    </View>
  );
};

const LuckyItem: React.FC<{ label: string; value: string; icon: string; fs: FontSize }> = ({ label, value, icon, fs }) => (
  <View style={s.item}>
    <Text style={[s.icon, { fontSize: getFontSize(20, fs) }]}>{icon}</Text>
    <View>
      <Text style={[s.label, { fontSize: getFontSize(11, fs) }]}>{label}</Text>
      <Text style={[s.value, { fontSize: getFontSize(14, fs) }]}>{value}</Text>
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
