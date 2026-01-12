// Fortune Calendar 夢への第一歩 v2.9 (Todoタブ非表示)
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Platform, Modal, TextInput, ScrollView, Alert } from 'react-native';
import { Dream, Goal, MustDoItem, TodoItem, MustDoPriority, GoalDeadlineDefault, DurationConfig, DurationUnit } from '../types/goalManagement';
import { getDreams, getGoals, getMustDoItems, getTodoItems, initGoalService,
  saveDream, updateDream, deleteDream, saveGoal, updateGoal, deleteGoal,
  saveMustDoItem, updateMustDoItem, deleteMustDoItem } from '../services/goalService';
import { GoalTreeView } from '../components/goals/GoalTreeView';
import { TodoList } from '../components/goals/TodoList';
import { DateInput } from '../components/DateInput';
import { DurationInput } from '../components/common/DurationInput';
import { ReminderInput } from '../components/common/ReminderInput';
import { useAppStore } from '../store/useAppStore';
import { getFontSize } from '../utils/fontUtils';
import { THEME_COLORS } from '../config/defaultConfig';

type TabType = 'tree' | 'todo';
type ModalType = 'dream' | 'goal' | 'mustdo' | null;

// DurationConfigから期限を算出
const getDeadlineFromDuration = (dur: DurationConfig, deadlineType: GoalDeadlineDefault, birthDate?: string): string => {
  const now = new Date();
  let targetDate = new Date(now);

  if (dur.unit === 'year') {
    targetDate.setFullYear(now.getFullYear() + dur.value);
  } else if (dur.unit === 'month') {
    targetDate.setMonth(now.getMonth() + dur.value);
  } else {
    targetDate.setDate(now.getDate() + dur.value * 7);
  }

  const targetYear = targetDate.getFullYear();
  if (deadlineType === 'today') {
    return `${targetYear}/${String(targetDate.getMonth() + 1).padStart(2, '0')}/${String(targetDate.getDate()).padStart(2, '0')}`;
  } else if (deadlineType === 'birthday' && birthDate) {
    const parts = birthDate.split('-');
    if (parts.length >= 3) return `${targetYear}/${parts[1]}/${parts[2]}`;
  }
  return `${targetYear}/12/31`;
};

// Todoタブは将来別の場所に移設予定のため非表示
const TABS: { key: TabType; label: string; color: string }[] = [
  { key: 'tree', label: '夢の木', color: '#FF69B4' },
];

export const GoalManagementScreen: React.FC = () => {
  const { userConfig } = useAppStore();
  const fs = userConfig.fontSize || 'md';
  const deadlineType = userConfig.goalDeadlineDefault || 'yearEnd';
  const birthDate = userConfig.userProfile?.birthDate;
  const defaultDreamDur = userConfig.dreamDefaultDuration || { value: 5, unit: 'year' as DurationUnit };
  const defaultGoalDur = userConfig.goalDefaultDuration || { value: 3, unit: 'month' as DurationUnit };
  const defaultMustdoDur = userConfig.mustdoDefaultDuration || { value: 1, unit: 'week' as DurationUnit };

  const [activeTab, setActiveTab] = useState<TabType>('tree');
  const [dreams, setDreams] = useState<Dream[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [mustDoItems, setMustDoItems] = useState<MustDoItem[]>([]);
  const [todoItems, setTodoItems] = useState<TodoItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [modalType, setModalType] = useState<ModalType>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [parentId, setParentId] = useState<string | undefined>();
  const [formTitle, setFormTitle] = useState('');
  const [formDeadline, setFormDeadline] = useState('');
  const [formDuration, setFormDuration] = useState<DurationConfig>(defaultDreamDur);
  const [formPriority, setFormPriority] = useState<MustDoPriority>('medium');
  const [formCategory, setFormCategory] = useState('');
  const [formColor, setFormColor] = useState('#FF69B4');
  const [formReminders, setFormReminders] = useState<number[]>([]);

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
    setFormTitle(''); setFormDeadline(''); setFormDuration(defaultDreamDur);
    setFormPriority('medium'); setFormCategory(''); setFormColor('#FF69B4');
    setFormReminders([]); setEditId(null); setParentId(undefined); setModalType(null);
  };

  const handleDurationChange = (dur: DurationConfig) => {
    setFormDuration(dur);
    setFormDeadline(getDeadlineFromDuration(dur, deadlineType, birthDate));
  };

  const getTargetYear = (dur: DurationConfig): number => {
    const now = new Date();
    if (dur.unit === 'year') return now.getFullYear() + dur.value;
    if (dur.unit === 'month') {
      const target = new Date(now); target.setMonth(now.getMonth() + dur.value);
      return target.getFullYear();
    }
    const target = new Date(now); target.setDate(now.getDate() + dur.value * 7);
    return target.getFullYear();
  };

  // 夢
  const openDreamModal = (dream?: Dream) => {
    if (dream) {
      setEditId(dream.id); setFormTitle(dream.title);
      const yearDiff = dream.targetYear - new Date().getFullYear();
      setFormDuration({ value: Math.max(1, yearDiff), unit: 'year' });
      setFormDeadline(dream.deadline || `${dream.targetYear}/12/31`);
      setFormCategory(dream.category || ''); setFormColor(dream.color || '#FF69B4');
      setFormReminders(dream.reminders || []);
    } else {
      setFormDuration(defaultDreamDur); setFormDeadline(getDeadlineFromDuration(defaultDreamDur, deadlineType, birthDate));
      setFormCategory(''); setFormColor('#FF69B4'); setFormReminders([]);
    }
    setModalType('dream');
  };

  const saveDreamHandler = async () => {
    if (!formTitle.trim()) { Alert.alert('エラー', 'タイトルを入力してください'); return; }
    const data = { title: formTitle.trim(), targetYear: getTargetYear(formDuration), deadline: formDeadline || undefined, category: formCategory || undefined, color: formColor, reminders: formReminders.length > 0 ? formReminders : undefined };
    if (editId) { await updateDream(editId, data); } else { await saveDream(data); }
    resetForm(); loadData();
  };

  const saveDreamAndAddGoal = async () => {
    if (!formTitle.trim()) { Alert.alert('エラー', 'タイトルを入力してください'); return; }
    const data = { title: formTitle.trim(), targetYear: getTargetYear(formDuration), deadline: formDeadline || undefined, category: formCategory || undefined, color: formColor, reminders: formReminders.length > 0 ? formReminders : undefined };
    let dreamId = editId;
    if (editId) { await updateDream(editId, data); } else { const newDream = await saveDream(data); dreamId = newDream?.id; }
    setFormTitle(''); setFormDuration(defaultGoalDur); setFormDeadline(getDeadlineFromDuration(defaultGoalDur, deadlineType, birthDate));
    setEditId(null); setParentId(dreamId || undefined); setFormCategory(''); setFormColor('#FF69B4'); setFormReminders([]); setModalType('goal');
  };

  // 目標
  const openGoalModal = (dreamId?: string, goal?: Goal) => {
    if (goal) {
      setEditId(goal.id); setFormTitle(goal.title); setFormDeadline(goal.deadline || ''); setParentId(goal.dreamId);
      // timeframeから推測
      const tf = goal.timeframe;
      if (tf === 'year') setFormDuration({ value: 0, unit: 'year' });
      else setFormDuration({ value: parseInt(tf) || 1, unit: 'year' });
    } else {
      setParentId(dreamId); setFormDuration(defaultGoalDur); setFormDeadline(getDeadlineFromDuration(defaultGoalDur, deadlineType, birthDate));
    }
    setModalType('goal');
  };

  const saveGoalHandler = async () => {
    if (!formTitle.trim()) { Alert.alert('エラー', 'タイトルを入力してください'); return; }
    const tf = formDuration.unit === 'year' ? (formDuration.value === 0 ? 'year' : `${formDuration.value}year`) : 'year';
    const data = { title: formTitle.trim(), timeframe: tf as any, deadline: formDeadline || undefined, dreamId: parentId, progress: 0, status: 'not_started' as const };
    if (editId) { await updateGoal(editId, data); } else { await saveGoal(data); }
    resetForm(); loadData();
  };

  const saveGoalAndAddMustDo = async () => {
    if (!formTitle.trim()) { Alert.alert('エラー', 'タイトルを入力してください'); return; }
    const tf = formDuration.unit === 'year' ? (formDuration.value === 0 ? 'year' : `${formDuration.value}year`) : 'year';
    const data = { title: formTitle.trim(), timeframe: tf as any, deadline: formDeadline || undefined, dreamId: parentId, progress: 0, status: 'not_started' as const };
    let goalId = editId;
    if (editId) { await updateGoal(editId, data); } else { const newGoal = await saveGoal(data); goalId = newGoal?.id; }
    setFormTitle(''); setFormDuration(defaultMustdoDur); setFormDeadline(getDeadlineFromDuration(defaultMustdoDur, deadlineType, birthDate));
    setFormPriority('medium'); setEditId(null); setParentId(goalId || undefined); setModalType('mustdo');
  };

  // やる事
  const openMustDoModal = (goalId?: string, item?: MustDoItem) => {
    if (item) {
      setEditId(item.id); setFormTitle(item.title); setFormDeadline(item.deadline); setFormPriority(item.priority); setParentId(item.goalId);
    } else {
      setParentId(goalId); setFormDuration(defaultMustdoDur); setFormDeadline(getDeadlineFromDuration(defaultMustdoDur, deadlineType, birthDate));
    }
    setModalType('mustdo');
  };

  const saveMustDoHandler = async () => {
    if (!formTitle.trim()) { Alert.alert('エラー', 'タイトルを入力してください'); return; }
    const data = { title: formTitle.trim(), deadline: formDeadline, priority: formPriority, timeframe: 'week' as const, status: 'pending' as const, goalId: parentId };
    if (editId) { await updateMustDoItem(editId, data); } else { await saveMustDoItem(data); }
    resetForm(); loadData();
  };

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

  const accentColor = modalType === 'dream' ? '#FFD700' : modalType === 'goal' ? '#FF69B4' : '#FF9800';

  const renderModal = () => (
    <Modal visible={modalType !== null} transparent animationType="fade" onRequestClose={resetForm}>
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={resetForm} />
        <ScrollView contentContainerStyle={styles.modalScroll}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{modalType === 'dream' ? '夢' : modalType === 'goal' ? '目標' : 'やる事'}を{editId ? '編集' : '追加'}</Text>
            <TextInput style={styles.input} placeholder="タイトル" value={formTitle} onChangeText={setFormTitle} />

            {modalType === 'dream' && (
              <>
                <TextInput style={styles.input} placeholder="カテゴリー（仕事、健康、趣味など）" value={formCategory} onChangeText={setFormCategory} />
                <Text style={styles.label}>色</Text>
                <View style={styles.colorRow}>
                  {THEME_COLORS.slice(0, 10).map(c => (
                    <TouchableOpacity key={c.id} style={[styles.colorChip, { backgroundColor: c.color }, formColor === c.color && styles.colorChipActive]} onPress={() => setFormColor(c.color)} />
                  ))}
                </View>
                <View style={styles.colorRow}>
                  {THEME_COLORS.slice(10, 20).map(c => (
                    <TouchableOpacity key={c.id} style={[styles.colorChip, { backgroundColor: c.color }, formColor === c.color && styles.colorChipActive]} onPress={() => setFormColor(c.color)} />
                  ))}
                </View>
                <ReminderInput label="リマインダー:" reminders={formReminders} onChange={setFormReminders} unitType="long" accentColor="#FFD700" />
              </>
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

            <DurationInput label="期間" value={formDuration} onChange={handleDurationChange} accentColor={accentColor} />

            <Text style={styles.label}>期限（直接入力）</Text>
            <DateInput value={formDeadline} onChange={setFormDeadline} />

            {modalType === 'dream' && (
              <TouchableOpacity onPress={saveDreamAndAddGoal} style={styles.addChildBtn}>
                <Text style={styles.addChildBtnText}>保存して目標を追加 →</Text>
              </TouchableOpacity>
            )}
            {modalType === 'goal' && (
              <TouchableOpacity onPress={saveGoalAndAddMustDo} style={styles.addChildBtn}>
                <Text style={styles.addChildBtnText}>保存してやる事を追加 →</Text>
              </TouchableOpacity>
            )}

            <View style={styles.modalActions}>
              <TouchableOpacity onPress={resetForm} style={styles.cancelBtn}><Text style={styles.cancelBtnText}>キャンセル</Text></TouchableOpacity>
              <TouchableOpacity onPress={modalType === 'dream' ? saveDreamHandler : modalType === 'goal' ? saveGoalHandler : saveMustDoHandler} style={styles.saveBtn}>
                <Text style={styles.saveBtnText}>{editId ? '更新' : '追加'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.title, { fontSize: getFontSize(20, fs) }]}>夢への第一歩</Text>
      </View>
      {/* タブが複数ある場合のみ表示 */}
      {TABS.length > 1 && (
        <View style={styles.tabs}>
          {TABS.map(tab => (
            <TouchableOpacity key={tab.key} onPress={() => setActiveTab(tab.key)} style={[styles.tab, activeTab === tab.key && { backgroundColor: tab.color }]}>
              <Text style={[styles.tabText, { fontSize: getFontSize(14, fs) }, activeTab === tab.key && styles.tabTextActive]}>{tab.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
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
  modalScroll: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 20 },
  modalContent: { backgroundColor: '#fff', borderRadius: 12, padding: 20, width: '90%', maxWidth: 400 },
  modalTitle: { fontSize: 18, fontWeight: '600', marginBottom: 16, textAlign: 'center' },
  input: { backgroundColor: '#f5f5f5', borderRadius: 8, padding: 12, marginBottom: 12, fontSize: 15 },
  label: { fontSize: 13, color: '#666', marginBottom: 6 },
  row: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  colorRow: { flexDirection: 'row', gap: 6, marginBottom: 8, flexWrap: 'wrap' },
  colorChip: { width: 28, height: 28, borderRadius: 14, borderWidth: 2, borderColor: 'transparent' },
  colorChipActive: { borderColor: '#333', borderWidth: 3 },
  chip: { flex: 1, paddingVertical: 8, alignItems: 'center', borderWidth: 2, borderColor: '#FF69B4', borderRadius: 6 },
  chipText: { fontSize: 13, color: '#666' },
  chipTextActive: { color: '#fff', fontWeight: '600' },
  addChildBtn: { marginTop: 8, paddingVertical: 10, paddingHorizontal: 16, backgroundColor: '#4CAF50', borderRadius: 8, alignItems: 'center' },
  addChildBtnText: { color: '#fff', fontWeight: '600', fontSize: 14 },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12, marginTop: 16 },
  cancelBtn: { paddingHorizontal: 20, paddingVertical: 10, backgroundColor: '#eee', borderRadius: 8 },
  cancelBtnText: { color: '#666' },
  saveBtn: { paddingHorizontal: 20, paddingVertical: 10, backgroundColor: '#FF69B4', borderRadius: 8 },
  saveBtnText: { color: '#fff', fontWeight: '600' },
});
