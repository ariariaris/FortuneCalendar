// Fortune Calendar 目標リスト v1.1 (年齢表示追加)
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import { Goal, GoalTimeframe, Dream, Purpose } from '../../types/goalManagement';
import { saveGoal, updateGoal, deleteGoal } from '../../services/goalService';
import { GoalProgress } from './GoalProgress';
import { GoalEditModal } from './GoalEditModal';
import { useAppStore } from '../../store/useAppStore';

interface Props {
  goals: Goal[];
  dreams: Dream[];
  purposes: Purpose[];
  onRefresh: () => void;
}

const TIMEFRAMES: GoalTimeframe[] = ['year', '3year', '5year', '10year'];
const TIMEFRAME_LABELS: Record<GoalTimeframe, string> = { year: '今年', '3year': '3年後', '5year': '5年後', '10year': '10年後' };
const STATUS_COLORS: Record<string, string> = { not_started: '#999', in_progress: '#4CAF50', completed: '#2196F3', cancelled: '#f44336' };

export const GoalList: React.FC<Props> = ({ goals, dreams, purposes, onRefresh }) => {
  const { userConfig } = useAppStore();
  const [selectedTimeframe, setSelectedTimeframe] = useState<GoalTimeframe>('year');
  const [modalVisible, setModalVisible] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | undefined>();

  // 年齢計算
  const birthDate = userConfig.userProfile?.birthDate;
  const birthYear = birthDate ? parseInt(birthDate.split('-')[0]) : null;
  const currentYear = new Date().getFullYear();
  const getAgeAtYear = (tf: GoalTimeframe): number | null => {
    if (!birthYear) return null;
    const targetYear = currentYear + (tf === 'year' ? 0 : parseInt(tf));
    return targetYear - birthYear;
  };

  const filteredGoals = goals.filter(g => g.timeframe === selectedTimeframe);

  const handleSave = async (data: Omit<Goal, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingGoal) {
      await updateGoal(editingGoal.id, data);
    } else {
      await saveGoal(data);
    }
    setEditingGoal(undefined);
    onRefresh();
  };

  const handleEdit = (goal: Goal) => { setEditingGoal(goal); setModalVisible(true); };
  const handleAdd = () => { setEditingGoal(undefined); setModalVisible(true); };

  const handleDelete = (id: string) => {
    Alert.alert('確認', 'この目標を削除しますか？', [
      { text: 'キャンセル', style: 'cancel' },
      { text: '削除', style: 'destructive', onPress: async () => { await deleteGoal(id); onRefresh(); } },
    ]);
  };

  const handleComplete = async (goal: Goal) => {
    const newStatus = goal.status === 'completed' ? 'in_progress' : 'completed';
    await updateGoal(goal.id, { status: newStatus, progress: newStatus === 'completed' ? 100 : goal.progress, completedAt: newStatus === 'completed' ? new Date().toISOString() : undefined });
    onRefresh();
  };

  const formatDate = (dateStr?: string) => dateStr ? dateStr.split('T')[0].replace(/-/g, '/') : '';

  return (
    <View style={styles.container}>
      <View style={styles.tabs}>
        {TIMEFRAMES.map(tf => {
          const age = getAgeAtYear(tf);
          return (
            <TouchableOpacity key={tf} onPress={() => setSelectedTimeframe(tf)} style={[styles.tab, selectedTimeframe === tf && styles.tabActive]}>
              <Text style={[styles.tabText, selectedTimeframe === tf && styles.tabTextActive]}>{TIMEFRAME_LABELS[tf]}</Text>
              {age !== null && <Text style={[styles.ageText, selectedTimeframe === tf && styles.ageTextActive]}>{age}才</Text>}
            </TouchableOpacity>
          );
        })}
      </View>
      <ScrollView style={styles.list}>
        <Text style={styles.sectionTitle}>■ {TIMEFRAME_LABELS[selectedTimeframe]}の目標 ({new Date().getFullYear() + (selectedTimeframe === 'year' ? 0 : parseInt(selectedTimeframe))}年)</Text>
        {filteredGoals.length === 0 && <Text style={styles.emptyText}>目標を追加しましょう</Text>}
        {filteredGoals.map((goal) => (
          <View key={goal.id} style={styles.item}>
            <TouchableOpacity onPress={() => handleComplete(goal)} style={styles.checkbox}>
              <Text style={styles.checkboxText}>{goal.status === 'completed' ? '☑' : '□'}</Text>
            </TouchableOpacity>
            <View style={styles.itemContent}>
              <Text style={[styles.itemTitle, goal.status === 'completed' && styles.completed]}>{goal.title}</Text>
              {goal.deadline && <Text style={styles.deadline}>期限: {formatDate(goal.deadline)}</Text>}
              {goal.completedAt && <Text style={styles.completedAt}>達成日: {formatDate(goal.completedAt)}</Text>}
              {goal.status !== 'completed' && (
                <View style={styles.progressContainer}>
                  <GoalProgress progress={goal.progress} color={STATUS_COLORS[goal.status]} />
                </View>
              )}
            </View>
            <View style={styles.actions}>
              <TouchableOpacity onPress={() => handleEdit(goal)} style={styles.actionBtn}><Text style={styles.actionText}>編集</Text></TouchableOpacity>
              <TouchableOpacity onPress={() => handleDelete(goal.id)} style={styles.actionBtn}><Text style={styles.deleteText}>削除</Text></TouchableOpacity>
            </View>
          </View>
        ))}
        <TouchableOpacity onPress={handleAdd} style={styles.addBtn}>
          <Text style={styles.addBtnText}>+ 目標を追加</Text>
        </TouchableOpacity>
      </ScrollView>
      <GoalEditModal visible={modalVisible} goal={editingGoal} dreams={dreams} purposes={purposes} timeframe={selectedTimeframe} onSave={handleSave} onClose={() => setModalVisible(false)} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  tabs: { flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 8, backgroundColor: '#f5f5f5' },
  tab: { flex: 1, paddingVertical: 6, alignItems: 'center', borderRadius: 6, marginHorizontal: 2 },
  tabActive: { backgroundColor: '#FF69B4' },
  tabText: { fontSize: 12, color: '#666' },
  tabTextActive: { color: '#fff', fontWeight: '600' },
  ageText: { fontSize: 10, color: '#999', marginTop: 1 },
  ageTextActive: { color: '#fff' },
  list: { flex: 1, padding: 16 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 12, color: '#333' },
  emptyText: { color: '#999', textAlign: 'center', marginVertical: 20 },
  item: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 8, padding: 12, marginBottom: 10, borderLeftWidth: 4, borderLeftColor: '#FF69B4' },
  checkbox: { marginRight: 10, justifyContent: 'center' },
  checkboxText: { fontSize: 20 },
  itemContent: { flex: 1 },
  itemTitle: { fontSize: 15, fontWeight: '600', color: '#333', marginBottom: 4 },
  completed: { textDecorationLine: 'line-through', color: '#999' },
  deadline: { fontSize: 12, color: '#888' },
  completedAt: { fontSize: 12, color: '#4CAF50' },
  progressContainer: { marginTop: 6 },
  actions: { justifyContent: 'center', gap: 4 },
  actionBtn: { paddingHorizontal: 8, paddingVertical: 4 },
  actionText: { fontSize: 11, color: '#666' },
  deleteText: { fontSize: 11, color: '#d00' },
  addBtn: { backgroundColor: '#FF69B4', borderRadius: 8, padding: 12, alignItems: 'center', marginTop: 10 },
  addBtnText: { color: '#fff', fontWeight: '600' },
});
