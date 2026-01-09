// Fortune Calendar Todoリスト v1.0
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import { TodoItem } from '../../types/goalManagement';
import { saveTodoItem, updateTodoItem, deleteTodoItem } from '../../services/goalService';

interface Props {
  todoItems: TodoItem[];
  onRefresh: () => void;
}

const formatDate = (date: Date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const getDateLabel = (dateStr: string) => {
  const today = formatDate(new Date());
  const tomorrow = formatDate(new Date(Date.now() + 86400000));
  if (dateStr === today) return '今日';
  if (dateStr === tomorrow) return '明日';
  const date = new Date(dateStr);
  return `${date.getMonth() + 1}月${date.getDate()}日`;
};

export const TodoList: React.FC<Props> = ({ todoItems, onRefresh }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(formatDate(new Date()));

  const today = formatDate(new Date());
  const tomorrow = formatDate(new Date(Date.now() + 86400000));
  const todayItems = todoItems.filter(i => i.date === today);
  const tomorrowItems = todoItems.filter(i => i.date === tomorrow);
  const completedToday = todayItems.filter(i => i.isCompleted).length;

  const resetForm = () => { setTitle(''); setDate(formatDate(new Date())); setIsAdding(false); };

  const handleSave = async () => {
    if (!title.trim()) { Alert.alert('エラー', 'Todoを入力してください'); return; }
    await saveTodoItem({ title: title.trim(), date, isCompleted: false });
    resetForm(); onRefresh();
  };

  const handleToggle = async (item: TodoItem) => {
    await updateTodoItem(item.id, { isCompleted: !item.isCompleted, completedAt: !item.isCompleted ? new Date().toISOString() : undefined });
    onRefresh();
  };

  const handleDelete = (id: string) => {
    Alert.alert('確認', 'このTodoを削除しますか？', [
      { text: 'キャンセル', style: 'cancel' },
      { text: '削除', style: 'destructive', onPress: async () => { await deleteTodoItem(id); onRefresh(); } },
    ]);
  };

  const renderTodoSection = (items: TodoItem[], dateStr: string) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>■ {getDateLabel(dateStr)} ({dateStr.slice(5).replace('-', '/')})</Text>
      {items.length === 0 ? (
        <Text style={styles.emptyText}>Todoはありません</Text>
      ) : (
        items.map((item) => (
          <TouchableOpacity key={item.id} onPress={() => handleToggle(item)} onLongPress={() => handleDelete(item.id)} style={styles.item}>
            <Text style={styles.checkbox}>{item.isCompleted ? '☑' : '□'}</Text>
            <Text style={[styles.itemTitle, item.isCompleted && styles.completed]}>{item.title}</Text>
          </TouchableOpacity>
        ))
      )}
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      {renderTodoSection(todayItems, today)}
      {todayItems.length > 0 && (
        <View style={styles.progressInfo}>
          <Text style={styles.progressText}>完了: {completedToday}/{todayItems.length} ({todayItems.length > 0 ? Math.round(completedToday / todayItems.length * 100) : 0}%)</Text>
        </View>
      )}
      {isAdding ? (
        <View style={styles.form}>
          <TextInput style={styles.input} placeholder="Todo" value={title} onChangeText={setTitle} autoFocus />
          <Text style={styles.label}>日付:</Text>
          <View style={styles.dateRow}>
            <TouchableOpacity onPress={() => setDate(today)} style={[styles.dateBtn, date === today && styles.dateBtnActive]}>
              <Text style={[styles.dateBtnText, date === today && styles.dateBtnTextActive]}>今日</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setDate(tomorrow)} style={[styles.dateBtn, date === tomorrow && styles.dateBtnActive]}>
              <Text style={[styles.dateBtnText, date === tomorrow && styles.dateBtnTextActive]}>明日</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.formActions}>
            <TouchableOpacity onPress={resetForm} style={styles.cancelBtn}><Text style={styles.cancelBtnText}>キャンセル</Text></TouchableOpacity>
            <TouchableOpacity onPress={handleSave} style={styles.saveBtn}><Text style={styles.saveBtnText}>追加</Text></TouchableOpacity>
          </View>
        </View>
      ) : (
        <TouchableOpacity onPress={() => setIsAdding(true)} style={styles.addBtn}>
          <Text style={styles.addBtnText}>+ Todoを追加</Text>
        </TouchableOpacity>
      )}
      {tomorrowItems.length > 0 && renderTodoSection(tomorrowItems, tomorrow)}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  section: { marginBottom: 16 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 8, color: '#333' },
  emptyText: { color: '#999', textAlign: 'center', marginVertical: 10 },
  item: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 8, padding: 12, marginBottom: 6 },
  checkbox: { fontSize: 20, marginRight: 10, color: '#666' },
  itemTitle: { flex: 1, fontSize: 14, color: '#333' },
  completed: { textDecorationLine: 'line-through', color: '#999' },
  progressInfo: { backgroundColor: '#e8f5e9', borderRadius: 8, padding: 10, marginBottom: 16, alignItems: 'center' },
  progressText: { fontSize: 14, color: '#4CAF50', fontWeight: '600' },
  form: { backgroundColor: '#f9f9f9', borderRadius: 8, padding: 12, marginBottom: 16 },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#ddd', borderRadius: 6, padding: 10, marginBottom: 10, fontSize: 14 },
  label: { fontSize: 12, color: '#666', marginBottom: 6 },
  dateRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  dateBtn: { flex: 1, paddingVertical: 8, alignItems: 'center', backgroundColor: '#eee', borderRadius: 6 },
  dateBtnActive: { backgroundColor: '#2196F3' },
  dateBtnText: { fontSize: 13, color: '#666' },
  dateBtnTextActive: { color: '#fff', fontWeight: '600' },
  formActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8 },
  cancelBtn: { paddingHorizontal: 16, paddingVertical: 8, backgroundColor: '#eee', borderRadius: 6 },
  cancelBtnText: { color: '#666' },
  saveBtn: { paddingHorizontal: 16, paddingVertical: 8, backgroundColor: '#2196F3', borderRadius: 6 },
  saveBtnText: { color: '#fff', fontWeight: '600' },
  addBtn: { backgroundColor: '#2196F3', borderRadius: 8, padding: 12, alignItems: 'center', marginBottom: 16 },
  addBtnText: { color: '#fff', fontWeight: '600' },
});
