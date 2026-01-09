// Fortune Calendar 目標編集モーダル v1.0
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, StyleSheet, ScrollView, Alert } from 'react-native';
import { Goal, GoalTimeframe, Dream, Purpose } from '../../types/goalManagement';
import { GoalProgress } from './GoalProgress';

interface Props {
  visible: boolean;
  goal?: Goal;
  dreams: Dream[];
  purposes: Purpose[];
  timeframe: GoalTimeframe;
  onSave: (data: Omit<Goal, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onClose: () => void;
}

const TIMEFRAME_LABELS: Record<GoalTimeframe, string> = { year: '今年', '3year': '3年後', '5year': '5年後', '10year': '10年後' };

export const GoalEditModal: React.FC<Props> = ({ visible, goal, dreams, purposes, timeframe, onSave, onClose }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState('');
  const [progress, setProgress] = useState(0);
  const [dreamId, setDreamId] = useState<string | undefined>();
  const [purposeId, setPurposeId] = useState<string | undefined>();

  useEffect(() => {
    if (goal) {
      setTitle(goal.title); setDescription(goal.description || ''); setDeadline(goal.deadline || '');
      setProgress(goal.progress); setDreamId(goal.dreamId); setPurposeId(goal.purposeId);
    } else {
      setTitle(''); setDescription(''); setDeadline(''); setProgress(0); setDreamId(undefined); setPurposeId(undefined);
    }
  }, [goal, visible]);

  const handleSave = () => {
    if (!title.trim()) { Alert.alert('エラー', '目標タイトルを入力してください'); return; }
    onSave({
      title: title.trim(), description: description.trim() || undefined, timeframe, deadline: deadline || undefined,
      progress, status: progress >= 100 ? 'completed' : progress > 0 ? 'in_progress' : 'not_started',
      dreamId, purposeId, completedAt: progress >= 100 ? new Date().toISOString() : undefined,
    });
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.modalTitle}>{goal ? '目標を編集' : '目標を追加'} ({TIMEFRAME_LABELS[timeframe]})</Text>
          <ScrollView style={styles.form}>
            <TextInput style={styles.input} placeholder="目標タイトル" value={title} onChangeText={setTitle} />
            <TextInput style={[styles.input, styles.textArea]} placeholder="詳細（任意）" value={description} onChangeText={setDescription} multiline />
            <TextInput style={styles.input} placeholder="期限 (YYYY/MM/DD)" value={deadline} onChangeText={setDeadline} />
            <Text style={styles.label}>進捗: {progress}%</Text>
            <View style={styles.progressRow}>
              <GoalProgress progress={progress} showLabel={false} />
            </View>
            <View style={styles.progressButtons}>
              {[0, 25, 50, 75, 100].map(v => (
                <TouchableOpacity key={v} onPress={() => setProgress(v)} style={[styles.progressBtn, progress === v && styles.progressBtnActive]}>
                  <Text style={[styles.progressBtnText, progress === v && styles.progressBtnTextActive]}>{v}%</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.label}>紐づける夢（任意）:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.picker}>
              <TouchableOpacity onPress={() => setDreamId(undefined)} style={[styles.option, !dreamId && styles.optionSelected]}>
                <Text style={[styles.optionText, !dreamId && styles.optionTextSelected]}>なし</Text>
              </TouchableOpacity>
              {dreams.map(d => (
                <TouchableOpacity key={d.id} onPress={() => setDreamId(d.id)} style={[styles.option, dreamId === d.id && styles.optionSelected]}>
                  <Text style={[styles.optionText, dreamId === d.id && styles.optionTextSelected]}>{d.title}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </ScrollView>
          <View style={styles.actions}>
            <TouchableOpacity onPress={onClose} style={styles.cancelBtn}><Text style={styles.cancelBtnText}>キャンセル</Text></TouchableOpacity>
            <TouchableOpacity onPress={handleSave} style={styles.saveBtn}><Text style={styles.saveBtnText}>{goal ? '更新' : '追加'}</Text></TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modal: { width: '90%', maxHeight: '80%', backgroundColor: '#fff', borderRadius: 12, padding: 16 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 16, textAlign: 'center' },
  form: { maxHeight: 400 },
  input: { backgroundColor: '#f5f5f5', borderRadius: 6, padding: 10, marginBottom: 10, fontSize: 14 },
  textArea: { minHeight: 60, textAlignVertical: 'top' },
  label: { fontSize: 12, color: '#666', marginBottom: 6 },
  progressRow: { marginBottom: 8 },
  progressButtons: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  progressBtn: { paddingHorizontal: 10, paddingVertical: 6, backgroundColor: '#f0f0f0', borderRadius: 4 },
  progressBtnActive: { backgroundColor: '#4CAF50' },
  progressBtnText: { fontSize: 12, color: '#666' },
  progressBtnTextActive: { color: '#fff' },
  picker: { marginBottom: 12 },
  option: { paddingHorizontal: 12, paddingVertical: 6, backgroundColor: '#eee', borderRadius: 16, marginRight: 8 },
  optionSelected: { backgroundColor: '#FF69B4' },
  optionText: { fontSize: 12, color: '#666' },
  optionTextSelected: { color: '#fff' },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8, marginTop: 16 },
  cancelBtn: { paddingHorizontal: 20, paddingVertical: 10, backgroundColor: '#eee', borderRadius: 6 },
  cancelBtnText: { color: '#666' },
  saveBtn: { paddingHorizontal: 20, paddingVertical: 10, backgroundColor: '#FF69B4', borderRadius: 6 },
  saveBtnText: { color: '#fff', fontWeight: '600' },
});
