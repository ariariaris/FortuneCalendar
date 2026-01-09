// Fortune Calendar やるべきリスト v1.0
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import { MustDoItem, MustDoTimeframe, MustDoPriority, Goal } from '../../types/goalManagement';
import { saveMustDoItem, updateMustDoItem, deleteMustDoItem } from '../../services/goalService';

interface Props {
  mustDoItems: MustDoItem[];
  goals: Goal[];
  onRefresh: () => void;
}

const PRIORITY_COLORS: Record<MustDoPriority, string> = { high: '#f44336', medium: '#ff9800', low: '#4CAF50' };
const PRIORITY_LABELS: Record<MustDoPriority, string> = { high: '高', medium: '中', low: '低' };
const TIMEFRAME_LABELS: Record<MustDoTimeframe, string> = { week: '今週', month: '今月' };

export const MustDoList: React.FC<Props> = ({ mustDoItems, goals, onRefresh }) => {
  const [selectedTimeframe, setSelectedTimeframe] = useState<MustDoTimeframe>('week');
  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState('');
  const [deadline, setDeadline] = useState('');
  const [priority, setPriority] = useState<MustDoPriority>('medium');
  const [goalId, setGoalId] = useState<string | undefined>();

  const filteredItems = mustDoItems.filter(i => i.timeframe === selectedTimeframe);
  const sortedItems = [...filteredItems].sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });

  const resetForm = () => { setTitle(''); setDeadline(''); setPriority('medium'); setGoalId(undefined); setIsAdding(false); };

  const handleSave = async () => {
    if (!title.trim()) { Alert.alert('エラー', 'タスク名を入力してください'); return; }
    if (!deadline.trim()) { Alert.alert('エラー', '期限を入力してください'); return; }
    await saveMustDoItem({ title: title.trim(), deadline, priority, timeframe: selectedTimeframe, status: 'pending', goalId });
    resetForm(); onRefresh();
  };

  const handleToggle = async (item: MustDoItem) => {
    const newStatus = item.status === 'completed' ? 'pending' : 'completed';
    await updateMustDoItem(item.id, { status: newStatus, completedAt: newStatus === 'completed' ? new Date().toISOString() : undefined });
    onRefresh();
  };

  const handleDelete = (id: string) => {
    Alert.alert('確認', 'このタスクを削除しますか？', [
      { text: 'キャンセル', style: 'cancel' },
      { text: '削除', style: 'destructive', onPress: async () => { await deleteMustDoItem(id); onRefresh(); } },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.tabs}>
        {(['week', 'month'] as MustDoTimeframe[]).map(tf => (
          <TouchableOpacity key={tf} onPress={() => setSelectedTimeframe(tf)} style={[styles.tab, selectedTimeframe === tf && styles.tabActive]}>
            <Text style={[styles.tabText, selectedTimeframe === tf && styles.tabTextActive]}>{TIMEFRAME_LABELS[tf]}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <ScrollView style={styles.list}>
        <Text style={styles.sectionTitle}>■ {TIMEFRAME_LABELS[selectedTimeframe]}やるべきこと</Text>
        {sortedItems.length === 0 && !isAdding && <Text style={styles.emptyText}>やるべきことを追加しましょう</Text>}
        {sortedItems.map((item) => (
          <TouchableOpacity key={item.id} onPress={() => handleToggle(item)} onLongPress={() => handleDelete(item.id)} style={styles.item}>
            <View style={[styles.priorityBadge, { backgroundColor: PRIORITY_COLORS[item.priority] }]}>
              <Text style={styles.priorityText}>{PRIORITY_LABELS[item.priority]}</Text>
            </View>
            <View style={styles.itemContent}>
              <Text style={[styles.itemTitle, item.status === 'completed' && styles.completed]}>{item.title}</Text>
              <Text style={styles.deadline}>期限: {item.deadline}</Text>
            </View>
            <Text style={styles.checkbox}>{item.status === 'completed' ? '☑' : '□'}</Text>
          </TouchableOpacity>
        ))}
        {isAdding ? (
          <View style={styles.form}>
            <TextInput style={styles.input} placeholder="タスク名" value={title} onChangeText={setTitle} />
            <TextInput style={styles.input} placeholder="期限 (例: 1/10)" value={deadline} onChangeText={setDeadline} />
            <Text style={styles.label}>優先度:</Text>
            <View style={styles.priorityRow}>
              {(['high', 'medium', 'low'] as MustDoPriority[]).map(p => (
                <TouchableOpacity key={p} onPress={() => setPriority(p)} style={[styles.priorityBtn, { borderColor: PRIORITY_COLORS[p] }, priority === p && { backgroundColor: PRIORITY_COLORS[p] }]}>
                  <Text style={[styles.priorityBtnText, priority === p && styles.priorityBtnTextActive]}>{PRIORITY_LABELS[p]}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.formActions}>
              <TouchableOpacity onPress={resetForm} style={styles.cancelBtn}><Text style={styles.cancelBtnText}>キャンセル</Text></TouchableOpacity>
              <TouchableOpacity onPress={handleSave} style={styles.saveBtn}><Text style={styles.saveBtnText}>追加</Text></TouchableOpacity>
            </View>
          </View>
        ) : (
          <TouchableOpacity onPress={() => setIsAdding(true)} style={styles.addBtn}>
            <Text style={styles.addBtnText}>+ タスクを追加</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  tabs: { flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 8, backgroundColor: '#f5f5f5' },
  tab: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 6, marginHorizontal: 4 },
  tabActive: { backgroundColor: '#FF9800' },
  tabText: { fontSize: 14, color: '#666' },
  tabTextActive: { color: '#fff', fontWeight: '600' },
  list: { flex: 1, padding: 16 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 12, color: '#333' },
  emptyText: { color: '#999', textAlign: 'center', marginVertical: 20 },
  item: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 8, padding: 12, marginBottom: 8 },
  priorityBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4, marginRight: 10 },
  priorityText: { fontSize: 11, color: '#fff', fontWeight: '600' },
  itemContent: { flex: 1 },
  itemTitle: { fontSize: 14, fontWeight: '500', color: '#333' },
  completed: { textDecorationLine: 'line-through', color: '#999' },
  deadline: { fontSize: 12, color: '#888', marginTop: 2 },
  checkbox: { fontSize: 20, color: '#666' },
  form: { backgroundColor: '#f9f9f9', borderRadius: 8, padding: 12, marginTop: 10 },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#ddd', borderRadius: 6, padding: 10, marginBottom: 8, fontSize: 14 },
  label: { fontSize: 12, color: '#666', marginBottom: 6 },
  priorityRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  priorityBtn: { flex: 1, paddingVertical: 8, alignItems: 'center', borderWidth: 2, borderRadius: 6 },
  priorityBtnText: { fontSize: 13, fontWeight: '600' },
  priorityBtnTextActive: { color: '#fff' },
  formActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8 },
  cancelBtn: { paddingHorizontal: 16, paddingVertical: 8, backgroundColor: '#eee', borderRadius: 6 },
  cancelBtnText: { color: '#666' },
  saveBtn: { paddingHorizontal: 16, paddingVertical: 8, backgroundColor: '#FF9800', borderRadius: 6 },
  saveBtnText: { color: '#fff', fontWeight: '600' },
  addBtn: { backgroundColor: '#FF9800', borderRadius: 8, padding: 12, alignItems: 'center', marginTop: 10 },
  addBtnText: { color: '#fff', fontWeight: '600' },
});
