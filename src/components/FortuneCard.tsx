// Fortune Calendar 占い結果カード v1.0
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { FortuneDetails } from '../config/types';
import { starsDisplay } from '../utils/fortuneUtils';

interface Props {
  title: string;
  score: number;
  detail: string;
  showStars?: boolean;
}

export const FortuneCard: React.FC<Props> = ({ title, score, detail, showStars = true }) => {
  return (
    <View style={s.card}>
      <View style={s.header}>
        <Text style={s.title}>{title}</Text>
        <View style={s.scoreWrap}>
          <Text style={s.score}>{score}点</Text>
          {showStars && <Text style={s.stars}>{starsDisplay(score)}</Text>}
        </View>
      </View>
      <Text style={s.detail}>{detail}</Text>
    </View>
  );
};

/** 詳細カード一覧 */
export const FortuneDetailCards: React.FC<{ scores: Record<string, number>; details: FortuneDetails }> = ({
  scores,
  details,
}) => {
  const items = [
    { key: 'love', label: '恋愛運' },
    { key: 'work', label: '仕事運' },
    { key: 'money', label: '金運' },
    { key: 'health', label: '健康運' },
    { key: 'social', label: '対人運' },
  ];

  return (
    <View>
      {items.map((item) => (
        <FortuneCard
          key={item.key}
          title={item.label}
          score={scores[item.key]}
          detail={details[item.key as keyof FortuneDetails]}
        />
      ))}
    </View>
  );
};

const s = StyleSheet.create({
  card: { backgroundColor: '#fff', borderRadius: 8, padding: 12, marginBottom: 8, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  title: { fontSize: 14, fontWeight: 'bold', color: '#333' },
  scoreWrap: { flexDirection: 'row', alignItems: 'center' },
  score: { fontSize: 16, fontWeight: 'bold', color: '#FF69B4', marginRight: 8 },
  stars: { fontSize: 12, color: '#FFD700' },
  detail: { fontSize: 13, color: '#666', lineHeight: 18 },
});

export default FortuneCard;
