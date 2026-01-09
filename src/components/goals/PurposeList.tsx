// Fortune Calendar 目的リスト v1.0
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import { Purpose, Dream } from '../../types/goalManagement';
import { savePurpose, updatePurpose, deletePurpose } from '../../services/goalService';

interface Props {
  purposes: Purpose[];
  dreams: Dream[];
  onRefresh: () => void;
}

export const PurposeList: React.FC<Props> = ({ purposes, dreams, onRefresh }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [reasons, setReasons] = useState('');
  const [dreamId, setDreamId] = useState<string | undefined>(undefined);

  const resetForm = () => { setTitle(''); setReasons(''); setDreamId(undefined); setIsAdding(false); setEditId(null); };

  const handleSave = async () => {
    if (!title.trim()) { Alert.alert('エラー', '目的のタイトルを入力してください'); return; }
    const reasonList = reasons.split('\n').filter(r => r.trim());
    if (editId) {
      await updatePurpose(editId, { title: title.trim(), reasons: reasonList, dreamId });
    } else {
      await savePurpose({ title: title.trim(), reasons: reasonList, dreamId });
    }
    resetForm(); onRefresh();
  };

  const handleEdit = (purpose: Purpose) => {
    setEditId(purpose.id); setTitle(purpose.title);
    setReasons(purpose.reasons.join('\n')); setDreamId(purpose.dreamId); setIsAdding(true);
  };

  const handleDelete = (id: string) => {
    Alert.alert('確認', 'この目的を削除しますか？', [
      { text: 'キャンセル', style: 'cancel' },
      { text: '削除', style: 'destructive', onPress: async () => { await deletePurpose(id); onRefresh(); } },
    ]);
  };

  const getDreamTitle = (id?: string) => dreams.find(d => d.id === id)?.title || '未設定';

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.sectionTitle}>■ 夢を叶えたい理由</Text>
      {purposes.length === 0 && !isAdding && (
        <Text style={styles.emptyText}>なぜその夢を達成したいのか、理由を書き出しましょう</Text>
      )}
      {purposes.map((purpose) => (
        <View key={purpose.id} style={styles.item}>
          {purpose.dreamId && <Text style={styles.dreamLabel}>夢: {getDreamTitle(purpose.dreamId)}</Text>}
          <Text style={styles.itemTitle}>{purpose.title}</Text>
          <View style={styles.reasonsContainer}>
            <Text style={styles.reasonsLabel}>目的:</Text>
            {purpose.reasons.map((r, i) => (
              <Text key={i} style={styles.reason}>・{r}</Text>
            ))}
          </View>
          <View style={styles.actions}>
            <TouchableOpacity onPress={() => handleEdit(purpose)} style={styles.btn}><Text style={styles.btnText}>編集</Text></TouchableOpacity>
            <TouchableOpacity onPress={() => handleDelete(purpose.id)} style={[styles.btn, styles.deleteBtn]}><Text style={styles.deleteBtnText}>削除</Text></TouchableOpacity>
          </View>
        </View>
      ))}
      {isAdding ? (
        <View style={styles.form}>
          <TextInput style={styles.input} placeholder="目的のタイトル" value={title} onChangeText={setTitle} />
          <Text style={styles.label}>紐づける夢（任意）:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dreamPicker}>
            <TouchableOpacity onPress={() => setDreamId(undefined)} style={[styles.dreamOption, !dreamId && styles.dreamSelected]}>
              <Text style={[styles.dreamOptionText, !dreamId && styles.dreamSelectedText]}>なし</Text>
            </TouchableOpacity>
            {dreams.map(d => (
              <TouchableOpacity key={d.id} onPress={() => setDreamId(d.id)} style={[styles.dreamOption, dreamId === d.id && styles.dreamSelected]}>
                <Text style={[styles.dreamOptionText, dreamId === d.id && styles.dreamSelectedText]}>{d.title}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <TextInput style={[styles.input, styles.textArea]} placeholder="理由（1行に1つ）" value={reasons} onChangeText={setReasons} multiline />
          <View style={styles.formActions}>
            <TouchableOpacity onPress={resetForm} style={styles.cancelBtn}><Text style={styles.cancelBtnText}>キャンセル</Text></TouchableOpacity>
            <TouchableOpacity onPress={handleSave} style={styles.saveBtn}><Text style={styles.saveBtnText}>{editId ? '更新' : '追加'}</Text></TouchableOpacity>
          </View>
        </View>
      ) : (
        <TouchableOpacity onPress={() => setIsAdding(true)} style={styles.addBtn}>
          <Text style={styles.addBtnText}>+ 目的を追加</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 12, color: '#333' },
  emptyText: { color: '#999', textAlign: 'center', marginVertical: 20 },
  item: { backgroundColor: '#fff', borderRadius: 8, padding: 12, marginBottom: 10, borderLeftWidth: 4, borderLeftColor: '#9370DB' },
  dreamLabel: { fontSize: 11, color: '#9370DB', marginBottom: 4 },
  itemTitle: { fontSize: 15, fontWeight: '600', color: '#333', marginBottom: 8 },
  reasonsContainer: { marginBottom: 8 },
  reasonsLabel: { fontSize: 12, color: '#666', marginBottom: 4 },
  reason: { fontSize: 13, color: '#555', marginLeft: 8, marginBottom: 2 },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8 },
  btn: { paddingHorizontal: 12, paddingVertical: 6, backgroundColor: '#f0f0f0', borderRadius: 4 },
  btnText: { fontSize: 12, color: '#666' },
  deleteBtn: { backgroundColor: '#fff0f0' },
  deleteBtnText: { fontSize: 12, color: '#d00' },
  form: { backgroundColor: '#f9f9f9', borderRadius: 8, padding: 12, marginTop: 10 },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#ddd', borderRadius: 6, padding: 10, marginBottom: 8, fontSize: 14 },
  textArea: { minHeight: 80, textAlignVertical: 'top' },
  label: { fontSize: 12, color: '#666', marginBottom: 4 },
  dreamPicker: { marginBottom: 8 },
  dreamOption: { paddingHorizontal: 12, paddingVertical: 6, backgroundColor: '#eee', borderRadius: 16, marginRight: 8 },
  dreamSelected: { backgroundColor: '#9370DB' },
  dreamOptionText: { fontSize: 12, color: '#666' },
  dreamSelectedText: { color: '#fff' },
  formActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8, marginTop: 8 },
  cancelBtn: { paddingHorizontal: 16, paddingVertical: 8, backgroundColor: '#eee', borderRadius: 6 },
  cancelBtnText: { color: '#666' },
  saveBtn: { paddingHorizontal: 16, paddingVertical: 8, backgroundColor: '#9370DB', borderRadius: 6 },
  saveBtnText: { color: '#fff', fontWeight: '600' },
  addBtn: { backgroundColor: '#9370DB', borderRadius: 8, padding: 12, alignItems: 'center', marginTop: 10 },
  addBtnText: { color: '#fff', fontWeight: '600' },
});
