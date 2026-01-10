// Fortune Calendar 夢リスト v1.2 (日付ピッカー対応)
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import { DateInput } from '../DateInput';
import { Dream } from '../../types/goalManagement';
import { saveDream, updateDream, deleteDream } from '../../services/goalService';
import { useAppStore } from '../../store/useAppStore';

interface Props {
  dreams: Dream[];
  onRefresh: () => void;
}

export const DreamList: React.FC<Props> = ({ dreams, onRefresh }) => {
  const { userConfig } = useAppStore();
  const [isAdding, setIsAdding] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [targetYear, setTargetYear] = useState(String(new Date().getFullYear() + 10));
  const [deadline, setDeadline] = useState('');
  const [category, setCategory] = useState('');

  // 誕生日から月日を取得
  const getBirthdayMonthDay = () => {
    const bd = userConfig.userProfile?.birthDate;
    if (!bd) return '01/01';
    const [, m, d] = bd.split('-');
    return `${m}/${d}`;
  };

  // 目標年が変わったらデフォルト期限を更新
  useEffect(() => {
    if (isAdding && !editId) {
      const mmdd = getBirthdayMonthDay();
      setDeadline(`${targetYear}/${mmdd}`);
    }
  }, [targetYear, isAdding, editId]);

  const resetForm = () => {
    setTitle(''); setDescription(''); setTargetYear(String(new Date().getFullYear() + 10)); setDeadline(''); setCategory('');
    setIsAdding(false); setEditId(null);
  };

  const handleSave = async () => {
    if (!title.trim()) { Alert.alert('エラー', '夢のタイトルを入力してください'); return; }
    const year = parseInt(targetYear, 10);
    if (isNaN(year) || year < new Date().getFullYear()) { Alert.alert('エラー', '有効な目標年を入力してください'); return; }
    if (editId) {
      await updateDream(editId, { title: title.trim(), description: description.trim() || undefined, targetYear: year, deadline: deadline || undefined, category: category.trim() || undefined });
    } else {
      await saveDream({ title: title.trim(), description: description.trim() || undefined, targetYear: year, deadline: deadline || undefined, category: category.trim() || undefined });
    }
    resetForm(); onRefresh();
  };

  const handleEdit = (dream: Dream) => {
    setEditId(dream.id); setTitle(dream.title); setDescription(dream.description || '');
    setTargetYear(String(dream.targetYear)); setDeadline(dream.deadline || ''); setCategory(dream.category || ''); setIsAdding(true);
  };

  const handleDelete = (id: string) => {
    Alert.alert('確認', 'この夢を削除しますか？', [
      { text: 'キャンセル', style: 'cancel' },
      { text: '削除', style: 'destructive', onPress: async () => { await deleteDream(id); onRefresh(); } },
    ]);
  };

  const yearsFromNow = (year: number) => {
    const diff = year - new Date().getFullYear();
    return diff <= 0 ? '今年' : `${diff}年後`;
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.sectionTitle}>■ 私の夢</Text>
      {dreams.length === 0 && !isAdding && (
        <Text style={styles.emptyText}>夢を追加して、ビジョンを描きましょう</Text>
      )}
      {dreams.map((dream) => (
        <View key={dream.id} style={styles.item}>
          <View style={styles.itemHeader}>
            <Text style={styles.itemTitle}>{dream.title}</Text>
            {dream.category && <Text style={styles.category}>{dream.category}</Text>}
          </View>
          {dream.description && <Text style={styles.description}>{dream.description}</Text>}
          <Text style={styles.deadline}>期限: {dream.deadline || `${dream.targetYear}年`} ({yearsFromNow(dream.targetYear)})</Text>
          <View style={styles.actions}>
            <TouchableOpacity onPress={() => handleEdit(dream)} style={styles.btn}><Text style={styles.btnText}>編集</Text></TouchableOpacity>
            <TouchableOpacity onPress={() => handleDelete(dream.id)} style={[styles.btn, styles.deleteBtn]}><Text style={styles.deleteBtnText}>削除</Text></TouchableOpacity>
          </View>
        </View>
      ))}
      {isAdding ? (
        <View style={styles.form}>
          <TextInput style={styles.input} placeholder="夢のタイトル" value={title} onChangeText={setTitle} />
          <TextInput style={[styles.input, styles.textArea]} placeholder="詳細（任意）" value={description} onChangeText={setDescription} multiline />
          <TextInput style={styles.input} placeholder="目標年（例: 2036）" value={targetYear} onChangeText={setTargetYear} keyboardType="numeric" />
          <DateInput value={deadline} onChange={setDeadline} style={styles.input} />
          <TextInput style={styles.input} placeholder="カテゴリ（任意: 仕事/プライベート等）" value={category} onChangeText={setCategory} />
          <View style={styles.formActions}>
            <TouchableOpacity onPress={resetForm} style={styles.cancelBtn}><Text style={styles.cancelBtnText}>キャンセル</Text></TouchableOpacity>
            <TouchableOpacity onPress={handleSave} style={styles.saveBtn}><Text style={styles.saveBtnText}>{editId ? '更新' : '追加'}</Text></TouchableOpacity>
          </View>
        </View>
      ) : (
        <TouchableOpacity onPress={() => setIsAdding(true)} style={styles.addBtn}>
          <Text style={styles.addBtnText}>+ 夢を追加</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 12, color: '#333' },
  emptyText: { color: '#999', textAlign: 'center', marginVertical: 20 },
  item: { backgroundColor: '#fff', borderRadius: 8, padding: 12, marginBottom: 10, borderLeftWidth: 4, borderLeftColor: '#FFD700' },
  itemHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  itemTitle: { fontSize: 15, fontWeight: '600', color: '#333', flex: 1 },
  category: { fontSize: 12, color: '#666', backgroundColor: '#f0f0f0', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  description: { fontSize: 13, color: '#666', marginBottom: 4 },
  deadline: { fontSize: 12, color: '#888', marginBottom: 8 },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8 },
  btn: { paddingHorizontal: 12, paddingVertical: 6, backgroundColor: '#f0f0f0', borderRadius: 4 },
  btnText: { fontSize: 12, color: '#666' },
  deleteBtn: { backgroundColor: '#fff0f0' },
  deleteBtnText: { fontSize: 12, color: '#d00' },
  form: { backgroundColor: '#f9f9f9', borderRadius: 8, padding: 12, marginTop: 10 },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#ddd', borderRadius: 6, padding: 10, marginBottom: 8, fontSize: 14 },
  textArea: { minHeight: 60, textAlignVertical: 'top' },
  formActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8, marginTop: 8 },
  cancelBtn: { paddingHorizontal: 16, paddingVertical: 8, backgroundColor: '#eee', borderRadius: 6 },
  cancelBtnText: { color: '#666' },
  saveBtn: { paddingHorizontal: 16, paddingVertical: 8, backgroundColor: '#FF69B4', borderRadius: 6 },
  saveBtnText: { color: '#fff', fontWeight: '600' },
  addBtn: { backgroundColor: '#FF69B4', borderRadius: 8, padding: 12, alignItems: 'center', marginTop: 10 },
  addBtnText: { color: '#fff', fontWeight: '600' },
});
