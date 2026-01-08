// マンダラチャートメイン画面
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal, TextInput, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppStore } from '../store/useAppStore';
import { MandalaChart, MandalaTimeframe, TIMEFRAME_LABELS, TIMEFRAME_COLORS } from '../types/mandala';
import {
  getAllMandalaCharts,
  createMandalaChart,
  getMandalaChart,
  updateMandalaChart,
  deleteMandalaChart,
  updateElementTitle,
  updateAction,
  addActionToTodo,
  calculateProgress,
} from '../services/mandalaService';
import { MandalaGrid } from '../components/mandala/MandalaGrid';
import { MandalaProgressBar } from '../components/mandala/MandalaProgress';

interface Props {
  onClose?: () => void;
}

export const MandalaScreen: React.FC<Props> = ({ onClose }) => {
  const insets = useSafeAreaInsets();
  const { userConfig } = useAppStore();
  const themeColor = userConfig.themeColor || '#FF69B4';

  const [charts, setCharts] = useState<MandalaChart[]>([]);
  const [selectedChart, setSelectedChart] = useState<MandalaChart | null>(null);
  const [selectedTimeframe, setSelectedTimeframe] = useState<MandalaTimeframe>('year');
  const [showNewModal, setShowNewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editType, setEditType] = useState<'center' | 'element' | 'action'>('action');
  const [editId, setEditId] = useState('');
  const [editContent, setEditContent] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newGoal, setNewGoal] = useState('');

  useEffect(() => {
    loadCharts();
  }, []);

  const loadCharts = async () => {
    const loaded = await getAllMandalaCharts();
    setCharts(loaded);
    if (loaded.length > 0) {
      setSelectedChart(loaded[0]);
      setSelectedTimeframe(loaded[0].timeframe);
    }
  };

  const handleCreate = async () => {
    if (!newTitle.trim() || !newGoal.trim()) {
      Alert.alert('入力エラー', 'タイトルと目標を入力してください');
      return;
    }
    const chart = await createMandalaChart(newTitle, newGoal, selectedTimeframe);
    setCharts((prev) => [...prev, chart]);
    setSelectedChart(chart);
    setShowNewModal(false);
    setNewTitle('');
    setNewGoal('');
  };

  const handleDelete = () => {
    if (!selectedChart) return;
    Alert.alert('削除確認', `「${selectedChart.title}」を削除しますか？`, [
      { text: 'キャンセル', style: 'cancel' },
      {
        text: '削除',
        style: 'destructive',
        onPress: async () => {
          await deleteMandalaChart(selectedChart.id);
          setCharts((prev) => prev.filter((c) => c.id !== selectedChart.id));
          setSelectedChart(null);
        },
      },
    ]);
  };

  const handleCellPress = (type: 'center' | 'element' | 'action', id: string, content: string) => {
    setEditType(type);
    setEditId(id);
    setEditContent(content);
    setShowEditModal(true);
  };

  const handleCellLongPress = (type: 'center' | 'element' | 'action', id: string, content: string) => {
    if (type === 'action' && content) {
      Alert.alert('Todoに追加', `「${content}」をTodoリストに追加しますか？`, [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: '追加',
          onPress: async () => {
            if (selectedChart) {
              await addActionToTodo(selectedChart.id, id, content);
              Alert.alert('完了', 'Todoリストに追加しました');
            }
          },
        },
      ]);
    }
  };

  const handleSaveEdit = async () => {
    if (!selectedChart) return;

    if (editType === 'center') {
      selectedChart.centerGoal = editContent;
      await updateMandalaChart(selectedChart);
    } else if (editType === 'element') {
      await updateElementTitle(selectedChart.id, editId, editContent);
    } else if (editType === 'action') {
      await updateAction(selectedChart.id, editId, { content: editContent });
    }

    // リロード
    const updated = await getMandalaChart(selectedChart.id);
    if (updated) {
      setSelectedChart(updated);
      setCharts((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
    }
    setShowEditModal(false);
  };

  const selectTimeframe = (tf: MandalaTimeframe) => {
    setSelectedTimeframe(tf);
    const found = charts.find((c) => c.timeframe === tf);
    setSelectedChart(found || null);
  };

  const progress = selectedChart ? calculateProgress(selectedChart) : null;

  return (
    <View style={[s.container, { paddingTop: insets.top }]}>
      <View style={s.header}>
        <TouchableOpacity onPress={onClose} style={s.backBtn}>
          <Text style={s.backText}>← 戻る</Text>
        </TouchableOpacity>
        <Text style={s.title}>マンダラチャート</Text>
        <TouchableOpacity onPress={() => setShowNewModal(true)} style={s.addBtn}>
          <Text style={[s.addText, { color: themeColor }]}>+ 新規</Text>
        </TouchableOpacity>
      </View>

      {/* 時間軸タブ */}
      <View style={s.tabBar}>
        {(Object.keys(TIMEFRAME_LABELS) as MandalaTimeframe[]).map((tf) => (
          <TouchableOpacity
            key={tf}
            style={[s.tab, selectedTimeframe === tf && { backgroundColor: TIMEFRAME_COLORS[tf] }]}
            onPress={() => selectTimeframe(tf)}
          >
            <Text style={[s.tabText, selectedTimeframe === tf && s.tabTextActive]}>
              {TIMEFRAME_LABELS[tf]}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={s.content}>
        {selectedChart ? (
          <>
            <View style={s.chartHeader}>
              <Text style={s.chartTitle}>{selectedChart.title}</Text>
              <TouchableOpacity onPress={handleDelete}>
                <Text style={s.deleteText}>削除</Text>
              </TouchableOpacity>
            </View>

            {progress && <MandalaProgressBar progress={progress} themeColor={TIMEFRAME_COLORS[selectedChart.timeframe]} />}

            <MandalaGrid
              chart={selectedChart}
              onCellPress={handleCellPress}
              onCellLongPress={handleCellLongPress}
            />
          </>
        ) : (
          <View style={s.empty}>
            <Text style={s.emptyText}>マンダラチャートがありません</Text>
            <TouchableOpacity style={[s.createBtn, { backgroundColor: themeColor }]} onPress={() => setShowNewModal(true)}>
              <Text style={s.createBtnText}>+ 新規作成</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* 新規作成モーダル */}
      <Modal visible={showNewModal} transparent animationType="fade">
        <View style={s.modal}>
          <View style={s.modalBox}>
            <Text style={s.modalTitle}>新規マンダラチャート</Text>
            <Text style={s.inputLabel}>タイトル</Text>
            <TextInput style={s.input} value={newTitle} onChangeText={setNewTitle} placeholder="例: 2025年の目標" />
            <Text style={s.inputLabel}>最終目標（中央）</Text>
            <TextInput style={s.input} value={newGoal} onChangeText={setNewGoal} placeholder="例: プロ野球選手になる" />
            <Text style={s.inputLabel}>時間軸</Text>
            <View style={s.tfRow}>
              {(Object.keys(TIMEFRAME_LABELS) as MandalaTimeframe[]).map((tf) => (
                <TouchableOpacity
                  key={tf}
                  style={[s.tfBtn, selectedTimeframe === tf && { backgroundColor: TIMEFRAME_COLORS[tf] }]}
                  onPress={() => setSelectedTimeframe(tf)}
                >
                  <Text style={[s.tfText, selectedTimeframe === tf && { color: '#fff' }]}>{TIMEFRAME_LABELS[tf]}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={s.btnRow}>
              <TouchableOpacity style={s.cancelBtn} onPress={() => setShowNewModal(false)}>
                <Text>キャンセル</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[s.saveBtn, { backgroundColor: themeColor }]} onPress={handleCreate}>
                <Text style={s.saveBtnText}>作成</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* 編集モーダル */}
      <Modal visible={showEditModal} transparent animationType="fade">
        <View style={s.modal}>
          <View style={s.modalBox}>
            <Text style={s.modalTitle}>
              {editType === 'center' ? '最終目標' : editType === 'element' ? '要素名' : 'アクション'}を編集
            </Text>
            <TextInput
              style={[s.input, s.editInput]}
              value={editContent}
              onChangeText={setEditContent}
              multiline
              placeholder="内容を入力..."
              autoFocus
            />
            <View style={s.btnRow}>
              <TouchableOpacity style={s.cancelBtn} onPress={() => setShowEditModal(false)}>
                <Text>キャンセル</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[s.saveBtn, { backgroundColor: themeColor }]} onPress={handleSaveEdit}>
                <Text style={s.saveBtnText}>保存</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, backgroundColor: '#fff', borderBottomWidth: 0.5, borderBottomColor: '#E5E5E5' },
  backBtn: { width: 60 },
  backText: { fontSize: 16, color: '#007AFF' },
  title: { fontSize: 18, fontWeight: '600', color: '#1C1C1E' },
  addBtn: { width: 60, alignItems: 'flex-end' },
  addText: { fontSize: 14, fontWeight: '600' },
  tabBar: { flexDirection: 'row', backgroundColor: '#fff', paddingVertical: 8, paddingHorizontal: 16, gap: 8 },
  tab: { flex: 1, paddingVertical: 8, borderRadius: 8, backgroundColor: '#E5E5E5', alignItems: 'center' },
  tabText: { fontSize: 12, color: '#666' },
  tabTextActive: { color: '#fff', fontWeight: '600' },
  content: { flex: 1, padding: 16 },
  chartHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  chartTitle: { fontSize: 18, fontWeight: '600', color: '#333' },
  deleteText: { fontSize: 14, color: '#DC2626' },
  empty: { alignItems: 'center', paddingTop: 80 },
  emptyText: { fontSize: 16, color: '#999', marginBottom: 24 },
  createBtn: { paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8 },
  createBtnText: { fontSize: 16, fontWeight: '600', color: '#fff' },
  modal: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalBox: { backgroundColor: '#fff', borderRadius: 12, padding: 24, width: 320 },
  modalTitle: { fontSize: 18, fontWeight: '600', textAlign: 'center', marginBottom: 16 },
  inputLabel: { fontSize: 14, color: '#666', marginTop: 12, marginBottom: 4 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, fontSize: 14 },
  editInput: { height: 80, textAlignVertical: 'top' },
  tfRow: { flexDirection: 'row', gap: 8, marginTop: 8 },
  tfBtn: { flex: 1, paddingVertical: 8, borderRadius: 8, backgroundColor: '#E5E5E5', alignItems: 'center' },
  tfText: { fontSize: 12, color: '#666' },
  btnRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 24, gap: 12 },
  cancelBtn: { flex: 1, padding: 12, borderRadius: 8, backgroundColor: '#E5E5E5', alignItems: 'center' },
  saveBtn: { flex: 1, padding: 12, borderRadius: 8, alignItems: 'center' },
  saveBtnText: { color: '#fff', fontWeight: '600' },
});

export default MandalaScreen;
