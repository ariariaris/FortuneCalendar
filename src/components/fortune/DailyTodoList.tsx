// Fortune Calendar 日別Todoリスト v1.0
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert } from 'react-native';
import { DailyTodo } from '../../types/dailyTodo';
import { FontSize } from '../../config/types';
import { getFontSize } from '../../utils/fontUtils';

interface Props {
  todos: DailyTodo[];
  currentDate: string;
  fontSize?: FontSize;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onAdd: (title: string) => void;
}

export const DailyTodoList: React.FC<Props> = ({ todos, currentDate, fontSize: fs = 'md', onToggle, onDelete, onAdd }) => {
  const [newTodo, setNewTodo] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  // 今日表示するTodo: lucky(今日のみ) + user(全て)
  const visibleTodos = todos.filter(t => t.type === 'user' || t.date === currentDate);

  const handleAdd = () => {
    if (!newTodo.trim()) return;
    onAdd(newTodo.trim());
    setNewTodo('');
    setIsAdding(false);
  };

  const handleDelete = (item: DailyTodo) => {
    Alert.alert('削除確認', `「${item.title}」を削除しますか？`, [
      { text: 'キャンセル', style: 'cancel' },
      { text: '削除', style: 'destructive', onPress: () => onDelete(item.id) },
    ]);
  };

  return (
    <View style={s.container}>
      <View style={s.header}>
        <Text style={[s.title, { fontSize: getFontSize(14, fs) }]}>今日のやること</Text>
        {!isAdding && (
          <TouchableOpacity onPress={() => setIsAdding(true)} style={s.addBtn}>
            <Text style={s.addBtnText}>+</Text>
          </TouchableOpacity>
        )}
      </View>

      {visibleTodos.length === 0 && !isAdding && (
        <Text style={[s.empty, { fontSize: getFontSize(12, fs) }]}>ラッキー情報の[+]か、右上の[+]で追加</Text>
      )}

      {visibleTodos.map(item => (
        <TouchableOpacity key={item.id} style={s.item} onPress={() => onToggle(item.id)} onLongPress={() => handleDelete(item)}>
          <Text style={[s.checkbox, { fontSize: getFontSize(18, fs) }]}>{item.completed ? '☑️' : '☐'}</Text>
          <Text style={[s.itemText, { fontSize: getFontSize(14, fs) }, item.completed && s.itemTextDone]}>{item.title}</Text>
          {item.type === 'lucky' && <Text style={[s.luckyBadge, { fontSize: getFontSize(10, fs) }]}>Lucky</Text>}
        </TouchableOpacity>
      ))}

      {isAdding && (
        <View style={s.addRow}>
          <TextInput
            style={[s.input, { fontSize: getFontSize(14, fs) }]}
            placeholder="やることを入力..."
            value={newTodo}
            onChangeText={setNewTodo}
            autoFocus
            onSubmitEditing={handleAdd}
          />
          <TouchableOpacity onPress={handleAdd} style={s.confirmBtn}>
            <Text style={s.confirmBtnText}>追加</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => { setIsAdding(false); setNewTodo(''); }} style={s.cancelBtn}>
            <Text style={s.cancelBtnText}>×</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const s = StyleSheet.create({
  container: { backgroundColor: '#F0F8FF', borderRadius: 12, padding: 12, marginVertical: 8 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  title: { fontSize: 14, fontWeight: 'bold', color: '#4A90D9' },
  addBtn: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#4A90D9', alignItems: 'center', justifyContent: 'center' },
  addBtnText: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginTop: -2 },
  empty: { fontSize: 12, color: '#999', textAlign: 'center', paddingVertical: 12 },
  item: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#E0E8F0' },
  checkbox: { fontSize: 18, marginRight: 8 },
  itemText: { fontSize: 14, color: '#333', flex: 1 },
  itemTextDone: { textDecorationLine: 'line-through', color: '#999' },
  luckyBadge: { fontSize: 10, color: '#FF69B4', backgroundColor: '#FFF0F5', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8 },
  addRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8, gap: 8 },
  input: { flex: 1, backgroundColor: '#fff', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8, fontSize: 14, borderWidth: 1, borderColor: '#ddd' },
  confirmBtn: { backgroundColor: '#4A90D9', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  confirmBtnText: { color: '#fff', fontWeight: 'bold' },
  cancelBtn: { paddingHorizontal: 8 },
  cancelBtnText: { color: '#999', fontSize: 20 },
});

export default DailyTodoList;
