// Fortune Calendar 占術選択画面 v1.0
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useAppStore } from '../store/useAppStore';
import { getAllPlugins } from '../fortunes';

interface Props {
  onClose: () => void;
}

export const FortuneSelectScreen: React.FC<Props> = ({ onClose }) => {
  const { selectedFortune, setSelectedFortune, userConfig } = useAppStore();
  const plugins = getAllPlugins();

  const freePlugins = plugins.filter((p) => p.category === 'free');
  const monthlyPlugins = plugins.filter((p) => p.category === 'monthly');
  const premiumPlugins = plugins.filter((p) => p.category === 'premium');

  const isUnlocked = (id: string, category: string) => {
    if (category === 'free') return true;
    if (userConfig.purchaseState.plan === 'lifetime') return true;
    if (userConfig.purchaseState.plan === 'monthly' && category === 'monthly') return true;
    return userConfig.purchaseState.premiumFortunes.includes(id);
  };

  const handleSelect = (id: string, category: string) => {
    if (!isUnlocked(id, category)) return;
    setSelectedFortune(id);
    onClose();
  };

  const renderPlugin = (p: typeof plugins[0]) => {
    const unlocked = isUnlocked(p.id, p.category);
    const selected = selectedFortune === p.id;

    return (
      <TouchableOpacity
        key={p.id}
        style={[s.item, selected && s.itemSelected, !unlocked && s.itemLocked]}
        onPress={() => handleSelect(p.id, p.category)}
        disabled={!unlocked}
      >
        <Text style={[s.itemText, selected && s.itemTextSelected, !unlocked && s.itemTextLocked]}>
          {p.name}
        </Text>
        {!unlocked && <Text style={s.lock}>🔒</Text>}
        {selected && <Text style={s.check}>✓</Text>}
      </TouchableOpacity>
    );
  };

  return (
    <View style={s.container}>
      <View style={s.header}>
        <Text style={s.title}>占術を選ぶ</Text>
        <TouchableOpacity onPress={onClose}><Text style={s.close}>×</Text></TouchableOpacity>
      </View>
      <ScrollView style={s.scroll}>
        <Text style={s.section}>無料（6種）</Text>
        <View style={s.grid}>{freePlugins.map(renderPlugin)}</View>

        {monthlyPlugins.length > 0 && (
          <>
            <Text style={s.section}>月額プラン 🔒</Text>
            <View style={s.grid}>{monthlyPlugins.map(renderPlugin)}</View>
          </>
        )}

        {premiumPlugins.length > 0 && (
          <>
            <Text style={s.section}>プレミアム（単品購入）</Text>
            <View style={s.grid}>{premiumPlugins.map(renderPlugin)}</View>
          </>
        )}

        <View style={s.plans}>
          <TouchableOpacity style={s.planBtn}>
            <Text style={s.planText}>月額プランに登録 ¥380/月</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[s.planBtn, s.planBtnSecondary]}>
            <Text style={s.planTextSecondary}>買い切りプラン ¥1,480</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f8f8' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#eee' },
  title: { fontSize: 18, fontWeight: 'bold' },
  close: { fontSize: 24, color: '#666' },
  scroll: { flex: 1, padding: 16 },
  section: { fontSize: 14, fontWeight: 'bold', color: '#666', marginTop: 16, marginBottom: 8 },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  item: { width: '48%', margin: '1%', padding: 12, backgroundColor: '#fff', borderRadius: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  itemSelected: { backgroundColor: '#FF69B4' },
  itemLocked: { opacity: 0.5 },
  itemText: { fontSize: 14, color: '#333' },
  itemTextSelected: { color: '#fff', fontWeight: 'bold' },
  itemTextLocked: { color: '#999' },
  lock: { fontSize: 12 },
  check: { fontSize: 14, color: '#fff', fontWeight: 'bold' },
  plans: { marginTop: 24 },
  planBtn: { backgroundColor: '#FF69B4', padding: 16, borderRadius: 8, alignItems: 'center', marginBottom: 8 },
  planBtnSecondary: { backgroundColor: '#fff', borderWidth: 2, borderColor: '#FF69B4' },
  planText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  planTextSecondary: { color: '#FF69B4', fontWeight: 'bold', fontSize: 16 },
});

export default FortuneSelectScreen;
