// Fortune Calendar 目標管理画面 v1.2 (文字サイズ対応)
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Platform } from 'react-native';
import { Dream, Purpose, Goal, MustDoItem, TodoItem } from '../types/goalManagement';
import { getDreams, getPurposes, getGoals, getMustDoItems, getTodoItems, initGoalService } from '../services/goalService';
import { DreamList } from '../components/goals/DreamList';
import { GoalList } from '../components/goals/GoalList';
import { MustDoList } from '../components/goals/MustDoList';
import { TodoList } from '../components/goals/TodoList';
import { useAppStore } from '../store/useAppStore';
import { getFontSize } from '../utils/fontUtils';

type TabType = 'dream' | 'goal' | 'mustdo' | 'todo';

const TABS: { key: TabType; label: string; color: string }[] = [
  { key: 'dream', label: '夢', color: '#FFD700' },
  { key: 'goal', label: '目標', color: '#FF69B4' },
  { key: 'mustdo', label: 'やる', color: '#FF9800' },
  { key: 'todo', label: 'Todo', color: '#2196F3' },
];

export const GoalManagementScreen: React.FC = () => {
  const { userConfig } = useAppStore();
  const fs = userConfig.fontSize || 'md';
  const [activeTab, setActiveTab] = useState<TabType>('goal');
  const [dreams, setDreams] = useState<Dream[]>([]);
  const [purposes, setPurposes] = useState<Purpose[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [mustDoItems, setMustDoItems] = useState<MustDoItem[]>([]);
  const [todoItems, setTodoItems] = useState<TodoItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      await initGoalService();
      const [d, p, g, m, t] = await Promise.all([getDreams(), getPurposes(), getGoals(), getMustDoItems(), getTodoItems()]);
      setDreams(d); setPurposes(p); setGoals(g); setMustDoItems(m); setTodoItems(t);
    } catch (error) {
      console.error('Goal data load error:', error);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const renderContent = () => {
    if (isLoading) return <View style={styles.loading}><Text>読み込み中...</Text></View>;
    switch (activeTab) {
      case 'dream': return <DreamList dreams={dreams} onRefresh={loadData} />;
      case 'goal': return <GoalList goals={goals} dreams={dreams} purposes={purposes} onRefresh={loadData} />;
      case 'mustdo': return <MustDoList mustDoItems={mustDoItems} goals={goals} onRefresh={loadData} />;
      case 'todo': return <TodoList todoItems={todoItems} onRefresh={loadData} />;
    }
  };

  const activeTabInfo = TABS.find(t => t.key === activeTab)!;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.title, { fontSize: getFontSize(20, fs) }]}>目標管理</Text>
      </View>
      <View style={styles.tabs}>
        {TABS.map(tab => (
          <TouchableOpacity
            key={tab.key}
            onPress={() => setActiveTab(tab.key)}
            style={[styles.tab, activeTab === tab.key && { backgroundColor: tab.color }]}
          >
            <Text style={[styles.tabText, { fontSize: getFontSize(13, fs) }, activeTab === tab.key && styles.tabTextActive]}>{tab.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <View style={[styles.content, { borderTopColor: activeTabInfo.color }]}>
        {renderContent()}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { paddingTop: Platform.OS === 'web' ? 20 : 0, paddingHorizontal: 16, paddingBottom: 8, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#eee' },
  title: { fontSize: 20, fontWeight: 'bold', color: '#333' },
  tabs: { flexDirection: 'row', backgroundColor: '#fff', paddingHorizontal: 8, paddingVertical: 8 },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 8, marginHorizontal: 2 },
  tabText: { fontSize: 13, color: '#666', fontWeight: '500' },
  tabTextActive: { color: '#fff', fontWeight: '700' },
  content: { flex: 1, borderTopWidth: 3 },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
