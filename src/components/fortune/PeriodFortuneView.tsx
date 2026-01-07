// Fortune Calendar 期間別運勢表示コンポーネント v1.0
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { HexChart } from '../HexChart';
import { FortuneScores, FortuneDetails, LuckyInfo } from '../../config/types';
import { starsDisplay } from '../../utils/fortuneUtils';
import { LuckyInfo as LuckyInfoComponent } from '../LuckyInfo';
import { FortunePeriod } from '../common/PeriodTabs';

interface PeriodFortuneViewProps {
  period: FortunePeriod;
  scores: FortuneScores;
  details: FortuneDetails;
  lucky: LuckyInfo;
  advice: string;
  periodLabel: string; // 例: "2025年1月" or "2025年"
}

const PERIOD_TITLES: Record<FortunePeriod, string> = {
  daily: '今日の運勢',
  monthly: '今月の運勢',
  yearly: '今年の運勢',
};

const ADVICE_LABELS: Record<FortunePeriod, string> = {
  daily: '今日のアドバイス',
  monthly: '今月のアドバイス',
  yearly: '今年のアドバイス',
};

export const PeriodFortuneView: React.FC<PeriodFortuneViewProps> = ({
  period,
  scores,
  details,
  lucky,
  advice,
  periodLabel,
}) => {
  return (
    <View style={s.container}>
      {/* 期間ラベル */}
      <Text style={s.periodLabel}>{periodLabel}</Text>
      <Text style={s.periodTitle}>{PERIOD_TITLES[period]}</Text>

      {/* 6軸チャート */}
      <View style={s.chartWrap}>
        <HexChart scores={scores} size={200} />
      </View>

      {/* 総合運 */}
      <View style={s.totalWrap}>
        <Text style={s.totalLabel}>総合運</Text>
        <Text style={s.totalScore}>{scores.total}点</Text>
        <Text style={s.totalStars}>{starsDisplay(scores.total)}</Text>
        <Text style={s.totalDetail}>{details.total}</Text>
      </View>

      {/* アドバイス */}
      <View style={s.adviceWrap}>
        <Text style={s.adviceLabel}>{ADVICE_LABELS[period]}</Text>
        <Text style={s.adviceText}>{advice}</Text>
      </View>

      {/* ラッキー情報 */}
      <LuckyInfoComponent lucky={lucky} />

      {/* 詳細スコア */}
      <View style={s.detailsWrap}>
        <DetailRow label="恋愛運" score={scores.love} detail={details.love} />
        <DetailRow label="仕事運" score={scores.work} detail={details.work} />
        <DetailRow label="金運" score={scores.money} detail={details.money} />
        <DetailRow label="健康運" score={scores.health} detail={details.health} />
        <DetailRow label="対人運" score={scores.social} detail={details.social} />
      </View>
    </View>
  );
};

const DetailRow: React.FC<{ label: string; score: number; detail: string }> = ({
  label,
  score,
  detail,
}) => (
  <View style={s.detailRow}>
    <Text style={s.detailLabel}>{label}</Text>
    <Text style={s.detailScore}>{starsDisplay(score)}</Text>
    <Text style={s.detailText}>{detail}</Text>
  </View>
);

const s = StyleSheet.create({
  container: { paddingVertical: 8 },
  periodLabel: { fontSize: 14, color: '#666', textAlign: 'center' },
  periodTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', textAlign: 'center', marginBottom: 12 },
  chartWrap: { alignItems: 'center', marginVertical: 16 },
  totalWrap: { backgroundColor: '#fff', borderRadius: 12, padding: 16, alignItems: 'center', marginBottom: 16 },
  totalLabel: { fontSize: 12, color: '#999' },
  totalScore: { fontSize: 48, fontWeight: 'bold', color: '#FF69B4' },
  totalStars: { fontSize: 20, color: '#FFD700', marginVertical: 4 },
  totalDetail: { fontSize: 14, color: '#333', textAlign: 'center', marginTop: 8 },
  adviceWrap: { backgroundColor: '#FFF5F8', borderRadius: 12, padding: 16, marginBottom: 16, borderLeftWidth: 4, borderLeftColor: '#FF69B4' },
  adviceLabel: { fontSize: 12, color: '#FF69B4', fontWeight: 'bold', marginBottom: 8 },
  adviceText: { fontSize: 14, color: '#333', lineHeight: 22 },
  detailsWrap: { backgroundColor: '#fff', borderRadius: 12, padding: 12 },
  detailRow: { paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  detailLabel: { fontSize: 12, color: '#666', marginBottom: 2 },
  detailScore: { fontSize: 14, color: '#FFD700' },
  detailText: { fontSize: 13, color: '#333', marginTop: 4 },
});

export default PeriodFortuneView;
