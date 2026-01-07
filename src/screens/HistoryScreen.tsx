// Fortune Calendar 履歴画面 v1.0
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAppStore } from '../store/useAppStore';
import { getRecentHistory } from '../services/storageService';
import { FortuneResult } from '../config/types';
import { getPlugin } from '../fortunes';
import { displayDateWithDay, parseDate } from '../utils/dateUtils';
import { starsDisplay } from '../utils/fortuneUtils';
import { MyCharacter } from '../components/MyCharacter';

export const HistoryScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { setSelectedDate, setSelectedFortune } = useAppStore();
  const [history, setHistory] = useState<FortuneResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    setLoading(true);
    const results = await getRecentHistory(50);
    setHistory(results);
    setLoading(false);
  };

  const handleItemPress = (item: FortuneResult) => {
    setSelectedDate(item.date);
    setSelectedFortune(item.fortuneId);
    navigation.navigate('Fortune');
  };

  const renderItem = ({ item }: { item: FortuneResult }) => {
    const plugin = getPlugin(item.fortuneId);
    const dateStr = displayDateWithDay(parseDate(item.date));

    return (
      <TouchableOpacity style={s.item} onPress={() => handleItemPress(item)}>
        <View style={s.itemHeader}>
          <Text style={s.date}>{dateStr}</Text>
          <Text style={s.fortune}>{plugin?.name || item.fortuneId}</Text>
        </View>
        <View style={s.itemBody}>
          <Text style={s.score}>{item.scores.total}点</Text>
          <Text style={s.stars}>{starsDisplay(item.scores.total)}</Text>
        </View>
        <Text style={s.detail} numberOfLines={1}>{item.details.total}</Text>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={s.container}>
        <Text style={s.loading}>読み込み中...</Text>
      </View>
    );
  }

  if (history.length === 0) {
    return (
      <View style={s.container}>
        <View style={s.empty}>
          <Text style={s.emptyIcon}>📜</Text>
          <Text style={s.emptyText}>まだ履歴がありません</Text>
          <Text style={s.emptyHint}>占いを実行すると履歴に保存されます</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={s.container}>
      <View style={s.header}><MyCharacter size={40} showName /></View>
      <FlatList
        data={history}
        renderItem={renderItem}
        keyExtractor={(item, index) => `${item.date}_${item.fortuneId}_${index}`}
        contentContainerStyle={s.list}
        ItemSeparatorComponent={() => <View style={s.separator} />}
      />
    </View>
  );
};

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f8f8' },
  header: { backgroundColor: '#fff', padding: 12, alignItems: 'center', borderBottomWidth: 0.5, borderBottomColor: '#eee' },
  loading: { textAlign: 'center', marginTop: 40, color: '#999' },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyIcon: { fontSize: 48, marginBottom: 16 },
  emptyText: { fontSize: 16, color: '#666', marginBottom: 8 },
  emptyHint: { fontSize: 12, color: '#999' },
  list: { padding: 16 },
  item: { backgroundColor: '#fff', borderRadius: 8, padding: 12 },
  separator: { height: 8 },
  itemHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  date: { fontSize: 14, fontWeight: 'bold', color: '#333' },
  fortune: { fontSize: 12, color: '#FF69B4', fontWeight: '500' },
  itemBody: { flexDirection: 'row', alignItems: 'baseline', marginBottom: 4 },
  score: { fontSize: 24, fontWeight: 'bold', color: '#FF69B4', marginRight: 8 },
  stars: { fontSize: 14, color: '#FFD700' },
  detail: { fontSize: 12, color: '#666' },
});

export default HistoryScreen;
