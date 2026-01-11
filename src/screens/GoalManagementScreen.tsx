// Fortune Calendar 目標管理画面 v2.1 (期限自動反映)
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Platform, Modal, TextInput, ScrollView, Alert } from 'react-native';
import { Dream, Goal, MustDoItem, TodoItem, GoalTimeframe, MustDoPriority } from '../types/goalManagement';
import { getDreams, getGoals, getMustDoItems, getTodoItems, initGoalService,
  saveDream, updateDream, deleteDream, saveGoal, updateGoal, deleteGoal,
  saveMustDoItem, updateMustDoItem, deleteMustDoItem, saveTodoItem, updateTodoItem, deleteTodoItem } from '../services/goalService';
import { GoalTreeView } from '../components/goals/GoalTreeView';
import { TodoList } from '../components/goals/TodoList';
import { DateInput } from '../components/DateInput';
import { useAppStore } from '../store/useAppStore';
import { getFontSize } from '../utils/fontUtils';

type TabType = 'tree' | 'todo';
type ModalType = 'dream' | 'goal' | 'mustdo' | null;

// 時間軸から期限を算出
const getDeadlineFromTimeframe = (tf: GoalTimeframe): string => {
  const now = new Date();
  const year = now.getFullYear() + (tf === 'year' ? 0 : parseInt(tf));
  return `${year}/12/31`;
};

const TABS: { key: TabType; label: string; color: string }[] = [
  { key: 'tree', label: '夢の木', color: '#FF69B4' },
  { key: 'todo', label: 'Todo', color: '#2196F3' },
];

export const GoalManagementScreen: React.FC = () => {
  const { userConfig } = useAppStore();
  const fs = userConfig.fontSize || 'md';
  const [activeTab, setActiveTab] = useState<TabType>('tree');
  const [dreams, setDreams] = useState<Dream[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [mustDoItems, setMustDoItems] = useState<MustDoItem[]>([]);
  const [todoItems, setTodoItems] = useState<TodoItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // モーダル状態
  const [modalType, setModalType] = useState<ModalType>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [parentId, setParentId] = useState<string | undefined>();
  const [formTitle, setFormTitle] = useState('');
  const [formDeadline, setFormDeadline] = useState('');
  const [formYear, setFormYear] = useState(String(new Date().getFullYear() + 5));
  const [formPriority, setFormPriority] = useState<MustDoPriority>('medium');
  const [formTimeframe, setFormTimeframe] = useState<GoalTimeframe>('year');

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      await initGoalService();
      const [d, g, m, t] = await Promise.all([getDreams(), getGoals(), getMustDoItems(), getTodoItems()]);
      setDreams(d); setGoals(g); setMustDoItems(m); setTodoItems(t);
    } catch (error) { console.error('Goal data load error:', error); }
    setIsLoading(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const resetForm = () => {
    setFormTitle(''); setFormDeadline(''); setFormYear(String(new Date().getFullYear() + 5));
    setFormPriority('medium'); setFormTimeframe('year'); setEditId(null); setParentId(undefined); setModalType(null);
  };

  // 夢の追加・編集
  const openDreamModal = (dream?: Dream) => {
    if (dream) {
      setEditId(dream.id); setFormTitle(dream.title); setFormYear(String(dream.targetYear)); setFormDeadline(dream.deadline || `${dream.targetYear}/12/31`);
    } else {
      const defaultYear = new Date().getFullYear() + 10;
      setFormYear(String(defaultYear)); setFormDeadline(`${defaultYear}/12/31`);
    }
    setModalType('dream');
  };

  const saveDreamHandler = async () => {
    if (!formTitle.trim()) { Alert.alert('エラー', 'タイトルを入力してください'); return; }
    const year = parseInt(formYear, 10);
    if (isNaN(year)) { Alert.alert('エラー', '有効な年を入力してください'); return; }
    if (editId) {
      await updateDream(editId, { title: formTitle.trim(), targetYear: year, deadline: formDeadline || undefined });
    } else {
      await saveDream({ title: formTitle.trim(), targetYear: year, deadline: formDeadline || undefined });
    }
    resetForm(); loadData();
  };

  // 目標の追加・編集
  const openGoalModal = (dreamId?: string, goal?: Goal) => {
    if (goal) {
      setEditId(goal.id); setFormTitle(goal.title); setFormDeadline(goal.deadline || ''); setFormTimeframe(goal.timeframe); setParentId(goal.dreamId);
    } else {
      setParentId(dreamId); setFormTimeframe('year'); setFormDeadline(getDeadlineFromTimeframe('year'));
    }
    setModalType('goal');
  };

  const saveGoalHandler = async () => {
    if (!formTitle.trim()) { Alert.alert('エラー', 'タイトルを入力してください'); return; }
    const data = { title: formTitle.trim(), timeframe: formTimeframe, deadline: formDeadline || undefined, dreamId: parentId, progress: 0, status: 'not_started' as const };
    if (editId) { await updateGoal(editId, data); } else { await saveGoal(data); }
    resetForm(); loadData();
  };

  // やる事の追加・編集
  const openMustDoModal = (goalId?: string, item?: MustDoItem) => {
    if (item) {
      setEditId(item.id); setFormTitle(item.title); setFormDeadline(item.deadline); setFormPriority(item.priority); setParentId(item.goalId);
    } else {
      setParentId(goalId); setFormDeadline(`${new Date().getFullYear()}/${String(new Date().getMonth() + 1).padStart(2, '0')}/${String(new Date().getDate()).padStart(2, '0')}`);
    }
    setModalType('mustdo');
  };

  const saveMustDoHandler = async () => {
    if (!formTitle.trim()) { Alert.alert('エラー', 'タイトルを入力してください'); return; }
    const data = { title: formTitle.trim(), deadline: formDeadline, priority: formPriority, timeframe: 'week' as const, status: 'pending' as const, goalId: parentId };
    if (editId) { await updateMustDoItem(editId, data); } else { await saveMustDoItem(data); }
    resetForm(); loadData();
  };

  // 削除ハンドラ
  const handleDeleteDream = async (id: string) => { await deleteDream(id); loadData(); };
  const handleDeleteGoal = async (id: string) => { await deleteGoal(id); loadData(); };
  const handleDeleteMustDo = async (id: string) => { await deleteMustDoItem(id); loadData(); };
  const handleToggleMustDo = async (item: MustDoItem) => {
    const newStatus = item.status === 'completed' ? 'pending' : 'completed';
    await updateMustDoItem(item.id, { status: newStatus, completedAt: newStatus === 'completed' ? new Date().toISOString() : undefined });
    loadData();
  };

  const renderContent = () => {
    if (isLoading) return <View style={styles.loading}><Text>読み込み中...</Text></View>;
    if (activeTab === 'tree') {
      return (
        <GoalTreeView
          dreams={dreams} goals={goals} mustDoItems={mustDoItems} onRefresh={loadData}
          onAddDream={() => openDreamModal()} onAddGoal={(dreamId) => openGoalModal(dreamId)} onAddMustDo={(goalId) => openMustDoModal(goalId)}
          onEditDream={openDreamModal} onEditGoal={(g) => openGoalModal(g.dreamId, g)} onEditMustDo={(m) => openMustDoModal(m.goalId, m)}
          onDeleteDream={handleDeleteDream} onDeleteGoal={handleDeleteGoal} onDeleteMustDo={handleDeleteMustDo} onToggleMustDo={handleToggleMustDo}
        />
      );
    }
    return <TodoList todoItems={todoItems} onRefresh={loadData} />;
  };

  const renderModal = () => (
    <Modal visible={modalType !== null} transparent animationType="fade" onRequestClose={resetForm}>
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={resetForm} />
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>{modalType === 'dream' ? '夢' : modalType === 'goal' ? '目標' : 'やる事'}を{editId ? '編集' : '追加'}</Text>
          <TextInput style={styles.input} placeholder="タイトル" value={formTitle} onChangeText={setFormTitle} />
          {modalType === 'dream' && (
            <View style={styles.row}>
              {(['year', '3year', '5year', '10year'] as GoalTimeframe[]).map(tf => {
                const targetY = new Date().getFullYear() + (tf === 'year' ? 0 : parseInt(tf));
                return (
                  <TouchableOpacity key={tf} style={[styles.chip, formYear === String(targetY) && styles.chipActive]} onPress={() => { setFormYear(String(targetY)); setFormDeadline(`${targetY}/12/31`); }}>
                    <Text style={[styles.chipText, formYear === String(targetY) && styles.chipTextActive]}>{tf === 'year' ? '今年' : tf.replace('year', '年後')}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
          {modalType === 'mustdo' && (
            <View style={styles.row}>
              {(['high', 'medium', 'low'] as MustDoPriority[]).map(p => (
                <TouchableOpacity key={p} style={[styles.chip, { borderColor: p === 'high' ? '#f44336' : p === 'medium' ? '#ff9800' : '#4CAF50' }, formPriority === p && { backgroundColor: p === 'high' ? '#f44336' : p === 'medium' ? '#ff9800' : '#4CAF50' }]} onPress={() => setFormPriority(p)}>
                  <Text style={[styles.chipText, formPriority === p && styles.chipTextActive]}>{p === 'high' ? '高' : p === 'medium' ? '中' : '低'}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
          <Text style={styles.label}>期限</Text>
          <DateInput value={formDeadline} onChange={setFormDeadline} />
          <View style={styles.modalActions}>
            <TouchableOpacity onPress={resetForm} style={styles.cancelBtn}><Text style={styles.cancelBtnText}>キャンセル</Text></TouchableOpacity>
            <TouchableOpacity onPress={modalType === 'dream' ? saveDreamHandler : modalType === 'goal' ? saveGoalHandler : saveMustDoHandler} style={styles.saveBtn}>
              <Text style={styles.saveBtnText}>{editId ? '更新' : '追加'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.title, { fontSize: getFontSize(20, fs) }]}>目標管理</Text>
      </View>
      <View style={styles.tabs}>
        {TABS.map(tab => (
          <TouchableOpacity key={tab.key} onPress={() => setActiveTab(tab.key)} style={[styles.tab, activeTab === tab.key && { backgroundColor: tab.color }]}>
            <Text style={[styles.tabText, { fontSize: getFontSize(14, fs) }, activeTab === tab.key && styles.tabTextActive]}>{tab.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <View style={styles.content}>{renderContent()}</View>
      {renderModal()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { paddingTop: Platform.OS === 'web' ? 20 : 0, paddingHorizontal: 16, paddingBottom: 8, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#eee' },
  title: { fontSize: 20, fontWeight: 'bold', color: '#333' },
  tabs: { flexDirection: 'row', backgroundColor: '#fff', paddingHorizontal: 8, paddingVertical: 8 },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 8, marginHorizontal: 4 },
  tabText: { fontSize: 14, color: '#666', fontWeight: '500' },
  tabTextActive: { color: '#fff', fontWeight: '700' },
  content: { flex: 1 },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  overlay: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  backdrop: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)' },
  modalContent: { backgroundColor: '#fff', borderRadius: 12, padding: 20, width: '90%', maxWidth: 400, zIndex: 1 },
  modalTitle: { fontSize: 18, fontWeight: '600', marginBottom: 16, textAlign: 'center' },
  input: { backgroundColor: '#f5f5f5', borderRadius: 8, padding: 12, marginBottom: 12, fontSize: 15 },
  label: { fontSize: 13, color: '#666', marginBottom: 6 },
  row: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  chip: { flex: 1, paddingVertical: 8, alignItems: 'center', borderWidth: 2, borderColor: '#FF69B4', borderRadius: 6 },
  chipActive: { backgroundColor: '#FF69B4' },
  chipText: { fontSize: 13, color: '#666' },
  chipTextActive: { color: '#fff', fontWeight: '600' },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12, marginTop: 16 },
  cancelBtn: { paddingHorizontal: 20, paddingVertical: 10, backgroundColor: '#eee', borderRadius: 8 },
  cancelBtnText: { color: '#666' },
  saveBtn: { paddingHorizontal: 20, paddingVertical: 10, backgroundColor: '#FF69B4', borderRadius: 8 },
  saveBtnText: { color: '#fff', fontWeight: '600' },
});
