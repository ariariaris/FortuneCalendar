// Fortune Calendar ラッキー情報 v1.2 (Todo追加機能)
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LuckyInfo as LuckyInfoType, FontSize } from '../config/types';
import { getFontSize } from '../utils/fontUtils';

interface Props {
  lucky: LuckyInfoType;
  fontSize?: FontSize;
  onAddLuckyTodo?: (title: string) => void;
}

export const LuckyInfo: React.FC<Props> = ({ lucky, fontSize: fs = 'md', onAddLuckyTodo }) => {
  return (
    <View style={s.container}>
      <Text style={[s.title, { fontSize: getFontSize(14, fs) }]}>Lucky Info</Text>
      <View style={s.row}>
        <LuckyItem label="カラー" value={lucky.color} icon="🎨" fs={fs} onAdd={onAddLuckyTodo} />
        <LuckyItem label="アイテム" value={lucky.item} icon="🎁" fs={fs} onAdd={onAddLuckyTodo} />
      </View>
      <View style={s.row}>
        {lucky.direction && <LuckyItem label="方位" value={lucky.direction} icon="🧭" fs={fs} onAdd={onAddLuckyTodo} />}
        {lucky.number && <LuckyItem label="ナンバー" value={String(lucky.number)} icon="🔢" fs={fs} onAdd={onAddLuckyTodo} />}
      </View>
    </View>
  );
};

interface LuckyItemProps {
  label: string;
  value: string;
  icon: string;
  fs: FontSize;
  onAdd?: (title: string) => void;
}

const LuckyItem: React.FC<LuckyItemProps> = ({ label, value, icon, fs, onAdd }) => {
  const handleAdd = () => {
    if (onAdd) onAdd(`ラッキー${label}は${value}`);
  };

  return (
    <View style={s.item}>
      <Text style={[s.icon, { fontSize: getFontSize(20, fs) }]}>{icon}</Text>
      <View style={s.itemContent}>
        <Text style={[s.label, { fontSize: getFontSize(11, fs) }]}>{label}</Text>
        <Text style={[s.value, { fontSize: getFontSize(14, fs) }]}>{value}</Text>
      </View>
      {onAdd && (
        <TouchableOpacity onPress={handleAdd} style={s.addBtn}>
          <Text style={s.addBtnText}>+</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const s = StyleSheet.create({
  container: { backgroundColor: '#FFF0F5', borderRadius: 12, padding: 16, marginVertical: 8 },
  title: { fontSize: 14, fontWeight: 'bold', color: '#FF69B4', marginBottom: 12, textAlign: 'center' },
  row: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 8 },
  item: { flexDirection: 'row', alignItems: 'center' },
  itemContent: { marginRight: 4 },
  icon: { fontSize: 20, marginRight: 8 },
  label: { fontSize: 11, color: '#999' },
  value: { fontSize: 14, fontWeight: 'bold', color: '#333' },
  addBtn: { width: 22, height: 22, borderRadius: 11, backgroundColor: '#FF69B4', alignItems: 'center', justifyContent: 'center', marginLeft: 4 },
  addBtnText: { color: '#fff', fontSize: 14, fontWeight: 'bold', marginTop: -1 },
});

export default LuckyInfo;
