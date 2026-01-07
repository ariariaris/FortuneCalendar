// Fortune Calendar 四柱推命メイン画面 v1.0
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { useAppStore } from '../../store/useAppStore';
import { calculateFourPillars, FourPillarsResult } from '../../services/fourPillarsService';
import { FIVE_ELEMENTS, STEM_ELEMENTS, TSUHENSEI_MEANINGS, TWELVE_STAGE_MEANINGS, FiveElement } from '../../data/fourPillarsData';

export const FourPillarsScreen: React.FC = () => {
  const { userConfig } = useAppStore();
  const [result, setResult] = useState<FourPillarsResult | null>(null);
  const [birthHour, setBirthHour] = useState(12);

  useEffect(() => {
    if (userConfig.userProfile?.birthDate) {
      const date = new Date(userConfig.userProfile.birthDate);
      setResult(calculateFourPillars(date, birthHour));
    }
  }, [userConfig.userProfile?.birthDate, birthHour]);

  if (!userConfig.userProfile?.birthDate) {
    return (
      <SafeAreaView style={s.container}>
        <View style={s.emptyWrap}>
          <Text style={s.emptyText}>生年月日を設定してください</Text>
          <Text style={s.emptySubText}>設定画面で生年月日を入力すると{'\n'}四柱推命の結果が表示されます</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!result) return null;

  return (
    <SafeAreaView style={s.container}>
      <ScrollView contentContainerStyle={s.content}>
        <Text style={s.title}>四柱推命</Text>

        {/* 命式表 */}
        <View style={s.pillarTable}>
          <View style={s.pillarRow}>
            <Text style={s.pillarHeader}>時柱</Text>
            <Text style={s.pillarHeader}>日柱</Text>
            <Text style={s.pillarHeader}>月柱</Text>
            <Text style={s.pillarHeader}>年柱</Text>
          </View>
          <View style={s.pillarRow}>
            <Text style={s.pillarCell}>{result.pillars.hour.stem}</Text>
            <Text style={[s.pillarCell, s.pillarCellMain]}>{result.pillars.day.stem}</Text>
            <Text style={s.pillarCell}>{result.pillars.month.stem}</Text>
            <Text style={s.pillarCell}>{result.pillars.year.stem}</Text>
          </View>
          <View style={s.pillarRow}>
            <Text style={s.pillarCell}>{result.pillars.hour.branch}</Text>
            <Text style={s.pillarCell}>{result.pillars.day.branch}</Text>
            <Text style={s.pillarCell}>{result.pillars.month.branch}</Text>
            <Text style={s.pillarCell}>{result.pillars.year.branch}</Text>
          </View>
          <View style={s.pillarRow}>
            <Text style={s.pillarSub}>{result.pillars.hour.tsuhensei || '-'}</Text>
            <Text style={s.pillarSub}>-</Text>
            <Text style={s.pillarSub}>{result.pillars.month.tsuhensei || '-'}</Text>
            <Text style={s.pillarSub}>{result.pillars.year.tsuhensei || '-'}</Text>
          </View>
          <View style={s.pillarRow}>
            <Text style={s.pillarSub}>{result.pillars.hour.twelveStage || '-'}</Text>
            <Text style={s.pillarSub}>{result.pillars.day.twelveStage || '-'}</Text>
            <Text style={s.pillarSub}>{result.pillars.month.twelveStage || '-'}</Text>
            <Text style={s.pillarSub}>{result.pillars.year.twelveStage || '-'}</Text>
          </View>
        </View>

        {/* 日干解説 */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>日干「{result.dayStem}」の性格</Text>
          <Text style={s.sectionText}>{result.dayStemTrait}</Text>
        </View>

        {/* 五行バランス */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>五行バランス</Text>
          {FIVE_ELEMENTS.map((element) => (
            <View key={element} style={s.elementRow}>
              <Text style={s.elementLabel}>{element}</Text>
              <View style={s.elementBarWrap}>
                <View style={[s.elementBar, { width: `${result.fiveElements[element]}%` }]} />
              </View>
              <Text style={s.elementValue}>{result.fiveElements[element]}%</Text>
            </View>
          ))}
        </View>

        {/* 総合解釈 */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>総合解釈</Text>
          <Text style={s.sectionText}>{result.interpretation}</Text>
        </View>

        {/* 時刻選択 */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>生まれた時刻（任意）</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.hourPicker}>
            {Array.from({ length: 24 }, (_, i) => (
              <TouchableOpacity key={i} style={[s.hourBtn, birthHour === i && s.hourBtnActive]} onPress={() => setBirthHour(i)}>
                <Text style={[s.hourText, birthHour === i && s.hourTextActive]}>{i}時</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f8f8' },
  content: { padding: 16 },
  title: { fontSize: 20, fontWeight: 'bold', color: '#FF69B4', textAlign: 'center', marginBottom: 16 },
  emptyWrap: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  emptyText: { fontSize: 18, fontWeight: 'bold', color: '#666', marginBottom: 8 },
  emptySubText: { fontSize: 14, color: '#999', textAlign: 'center', lineHeight: 22 },
  pillarTable: { backgroundColor: '#fff', borderRadius: 12, padding: 12, marginBottom: 16 },
  pillarRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 4 },
  pillarHeader: { flex: 1, textAlign: 'center', fontSize: 12, color: '#666', fontWeight: '600' },
  pillarCell: { flex: 1, textAlign: 'center', fontSize: 24, fontWeight: 'bold', color: '#333', paddingVertical: 8 },
  pillarCellMain: { color: '#FF69B4' },
  pillarSub: { flex: 1, textAlign: 'center', fontSize: 11, color: '#999' },
  section: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12 },
  sectionTitle: { fontSize: 14, fontWeight: 'bold', color: '#FF69B4', marginBottom: 8 },
  sectionText: { fontSize: 14, color: '#333', lineHeight: 22 },
  elementRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  elementLabel: { width: 30, fontSize: 14, fontWeight: '600', color: '#333' },
  elementBarWrap: { flex: 1, height: 12, backgroundColor: '#eee', borderRadius: 6, marginHorizontal: 8, overflow: 'hidden' },
  elementBar: { height: '100%', backgroundColor: '#FF69B4', borderRadius: 6 },
  elementValue: { width: 40, fontSize: 12, color: '#666', textAlign: 'right' },
  hourPicker: { flexDirection: 'row', marginTop: 8 },
  hourBtn: { paddingHorizontal: 12, paddingVertical: 8, marginRight: 8, backgroundColor: '#eee', borderRadius: 16 },
  hourBtnActive: { backgroundColor: '#FF69B4' },
  hourText: { fontSize: 12, color: '#666' },
  hourTextActive: { color: '#fff', fontWeight: 'bold' },
});

export default FourPillarsScreen;
