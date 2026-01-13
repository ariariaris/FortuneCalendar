// Fortune Calendar 目標ツリービュー v1.4 (初期展開)
import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import { Dream, Goal, MustDoItem } from '../../types/goalManagement';

// 日付文字列を比較用に正規化
const normalizeDate = (d?: string): string => {
  if (!d) return '9999-99-99';
  return d.replace(/\//g, '-').split('T')[0];
};

interface Props {
  dreams: Dream[];
  goals: Goal[];
  mustDoItems: MustDoItem[];
  onRefresh: () => void;
  onAddDream: () => void;
  onAddGoal: (dreamId?: string) => void;
  onAddMustDo: (goalId?: string) => void;
  onEditDream: (dream: Dream) => void;
  onEditGoal: (goal: Goal) => void;
  onEditMustDo: (item: MustDoItem) => void;
  onDeleteDream: (id: string) => void;
  onDeleteGoal: (id: string) => void;
  onDeleteMustDo: (id: string) => void;
  onToggleMustDo: (item: MustDoItem) => void;
}

export const GoalTreeView: React.FC<Props> = ({
  dreams, goals, mustDoItems, onRefresh,
  onAddDream, onAddGoal, onAddMustDo,
  onEditDream, onEditGoal, onEditMustDo,
  onDeleteDream, onDeleteGoal, onDeleteMustDo, onToggleMustDo,
}) => {
  const [expandedDreams, setExpandedDreams] = useState<Set<string>>(new Set());
  const [expandedGoals, setExpandedGoals] = useState<Set<string>>(new Set());
  const [initialized, setInitialized] = useState(false);

  // 初回: 全ツリーを展開状態にする
  useEffect(() => {
    if (!initialized && dreams.length > 0) {
      setExpandedDreams(new Set(dreams.map(d => d.id)));
      setExpandedGoals(new Set(goals.map(g => g.id)));
      setInitialized(true);
    }
  }, [dreams, goals, initialized]);

  // 日付順でソート（昇順：近い日付が上）
  const sortedDreams = useMemo(() => [...dreams].sort((a, b) => a.targetYear - b.targetYear), [dreams]);
  const sortedGoals = useMemo(() => [...goals].sort((a, b) => normalizeDate(a.deadline).localeCompare(normalizeDate(b.deadline))), [goals]);
  const sortedMustDo = useMemo(() => [...mustDoItems].sort((a, b) => normalizeDate(a.deadline).localeCompare(normalizeDate(b.deadline))), [mustDoItems]);

  const toggleDream = (id: string) => {
    setExpandedDreams(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleGoal = (id: string) => {
    setExpandedGoals(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  // 夢に紐づく目標を取得（ソート済み）
  const getGoalsForDream = (dreamId: string) => sortedGoals.filter(g => g.dreamId === dreamId);
  // 目標に紐づくやる事を取得（ソート済み）
  const getMustDoForGoal = (goalId: string) => sortedMustDo.filter(m => m.goalId === goalId);
  // 紐づきなしの目標（ソート済み）
  const orphanGoals = sortedGoals.filter(g => !g.dreamId);
  // 紐づきなしのやる事（ソート済み）
  const orphanMustDo = sortedMustDo.filter(m => !m.goalId);

  const confirmDelete = (type: string, id: string, onDelete: (id: string) => void) => {
    Alert.alert('確認', `この${type}を削除しますか？`, [
      { text: 'キャンセル', style: 'cancel' },
      { text: '削除', style: 'destructive', onPress: () => onDelete(id) },
    ]);
  };

  const renderMustDoItem = (item: MustDoItem, indent: number) => (
    <View key={item.id} style={[styles.item, { marginLeft: indent }]}>
      <TouchableOpacity onPress={() => onToggleMustDo(item)} style={styles.checkbox}>
        <Text style={styles.checkboxText}>{item.status === 'completed' ? '☑' : '□'}</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.itemContent} onPress={() => onEditMustDo(item)}>
        <Text style={[styles.itemTitle, item.status === 'completed' && styles.completed]}>{item.title}</Text>
        <Text style={styles.deadline}>期限: {item.deadline}</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => confirmDelete('やる事', item.id, onDeleteMustDo)}><Text style={styles.deleteText}>削除</Text></TouchableOpacity>
    </View>
  );

  const renderGoal = (goal: Goal, indent: number) => {
    const isExpanded = expandedGoals.has(goal.id);
    const childItems = getMustDoForGoal(goal.id);
    return (
      <View key={goal.id}>
        <View style={[styles.item, styles.goalItem, { marginLeft: indent }]}>
          <TouchableOpacity onPress={() => toggleGoal(goal.id)} style={styles.expandBtn}>
            <Text style={styles.expandIcon}>{childItems.length > 0 ? (isExpanded ? '▼' : '▶') : '•'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.itemContent} onPress={() => onEditGoal(goal)}>
            <Text style={[styles.itemTitle, goal.status === 'completed' && styles.completed]}>📌 {goal.title}</Text>
            {goal.deadline && <Text style={styles.deadline}>期限: {goal.deadline.split('T')[0]}</Text>}
          </TouchableOpacity>
          <View style={styles.actions}>
            <TouchableOpacity onPress={() => onAddMustDo(goal.id)}><Text style={styles.addText}>+やる事</Text></TouchableOpacity>
            <TouchableOpacity onPress={() => confirmDelete('目標', goal.id, onDeleteGoal)}><Text style={styles.deleteText}>削除</Text></TouchableOpacity>
          </View>
        </View>
        {isExpanded && childItems.map(item => renderMustDoItem(item, indent + 24))}
      </View>
    );
  };

  const renderDream = (dream: Dream) => {
    const isExpanded = expandedDreams.has(dream.id);
    const childGoals = getGoalsForDream(dream.id);
    const colorStyle = dream.color ? { borderLeftColor: dream.color } : {};
    return (
      <View key={dream.id} style={styles.dreamContainer}>
        <View style={[styles.item, styles.dreamItem, colorStyle]}>
          <TouchableOpacity onPress={() => toggleDream(dream.id)} style={styles.expandBtn}>
            <Text style={styles.expandIcon}>{childGoals.length > 0 ? (isExpanded ? '▼' : '▶') : '•'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.itemContent} onPress={() => onEditDream(dream)}>
            <Text style={styles.dreamTitle}>{dream.color ? '⭐' : '🌟'} {dream.title}</Text>
            <Text style={styles.deadline}>{dream.targetYear}年 ({dream.targetYear - new Date().getFullYear()}年後){dream.category ? ` [${dream.category}]` : ''}</Text>
          </TouchableOpacity>
          <View style={styles.actions}>
            <TouchableOpacity onPress={() => onAddGoal(dream.id)}><Text style={styles.addText}>+目標</Text></TouchableOpacity>
            <TouchableOpacity onPress={() => confirmDelete('夢', dream.id, onDeleteDream)}><Text style={styles.deleteText}>削除</Text></TouchableOpacity>
          </View>
        </View>
        {isExpanded && childGoals.map(goal => renderGoal(goal, 24))}
      </View>
    );
  };

  return (
    <ScrollView style={styles.container}>
      {/* 夢とその配下（日付順） */}
      {sortedDreams.map(renderDream)}

      {/* 紐づきなしの目標 */}
      {orphanGoals.length > 0 && (
        <View style={styles.orphanSection}>
          <Text style={styles.orphanTitle}>■ 未分類の目標</Text>
          {orphanGoals.map(goal => renderGoal(goal, 0))}
        </View>
      )}

      {/* 紐づきなしのやる事 */}
      {orphanMustDo.length > 0 && (
        <View style={styles.orphanSection}>
          <Text style={styles.orphanTitle}>■ 未分類のやる事</Text>
          {orphanMustDo.map(item => renderMustDoItem(item, 0))}
        </View>
      )}

      {/* 追加ボタン */}
      <View style={styles.addButtons}>
        <TouchableOpacity onPress={onAddDream} style={[styles.addBtn, { backgroundColor: '#FFD700' }]}>
          <Text style={styles.addBtnText}>+ 夢を追加</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => onAddGoal()} style={[styles.addBtn, { backgroundColor: '#FF69B4' }]}>
          <Text style={styles.addBtnText}>+ 目標を追加</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => onAddMustDo()} style={[styles.addBtn, { backgroundColor: '#FF9800' }]}>
          <Text style={styles.addBtnText}>+ やる事を追加</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  dreamContainer: { marginBottom: 12 },
  item: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 8, padding: 10, marginBottom: 4 },
  dreamItem: { borderLeftWidth: 4, borderLeftColor: '#FFD700' },
  goalItem: { borderLeftWidth: 4, borderLeftColor: '#FF69B4' },
  expandBtn: { width: 24, alignItems: 'center' },
  expandIcon: { fontSize: 12, color: '#666' },
  checkbox: { width: 28, alignItems: 'center' },
  checkboxText: { fontSize: 18 },
  itemContent: { flex: 1, marginLeft: 4 },
  dreamTitle: { fontSize: 15, fontWeight: '700', color: '#333' },
  itemTitle: { fontSize: 14, fontWeight: '500', color: '#333' },
  completed: { textDecorationLine: 'line-through', color: '#999' },
  deadline: { fontSize: 11, color: '#888', marginTop: 2 },
  actions: { flexDirection: 'row', gap: 8 },
  actionText: { fontSize: 11, color: '#666' },
  addText: { fontSize: 11, color: '#4CAF50', fontWeight: '600' },
  deleteText: { fontSize: 11, color: '#d00' },
  orphanSection: { marginTop: 16, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#eee' },
  orphanTitle: { fontSize: 14, fontWeight: '600', color: '#666', marginBottom: 8 },
  addButtons: { flexDirection: 'row', gap: 8, marginTop: 20, marginBottom: 40 },
  addBtn: { flex: 1, paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
  addBtnText: { color: '#fff', fontWeight: '600', fontSize: 13 },
});
