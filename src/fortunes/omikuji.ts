// Fortune Calendar おみくじ v1.1
import { FortunePlugin, createFortuneResult } from './types';
import { normalizeScore, calculateTotal, finalizeScores, pickRandom, LUCKY_COLORS, LUCKY_ITEMS, DIRECTIONS, generateSeed, seededRandom } from '../utils/fortuneLogic';
import { UserProfile, FortuneScores } from '../config/types';

/** おみくじ種類（設計書8.1） */
interface OmikujiType {
  id: string;
  name: string;
  rank: number;
  probability: number;
  baseScore: number;
}

const OMIKUJI_TYPES: OmikujiType[] = [
  { id: 'daikichi', name: '大吉', rank: 1, probability: 0.10, baseScore: 95 },
  { id: 'chukichi', name: '中吉', rank: 2, probability: 0.15, baseScore: 80 },
  { id: 'shokichi', name: '小吉', rank: 3, probability: 0.20, baseScore: 70 },
  { id: 'kichi', name: '吉', rank: 4, probability: 0.25, baseScore: 60 },
  { id: 'suekichi', name: '末吉', rank: 5, probability: 0.15, baseScore: 50 },
  { id: 'kyo', name: '凶', rank: 6, probability: 0.10, baseScore: 35 },
  { id: 'daikyo', name: '大凶', rank: 7, probability: 0.05, baseScore: 20 },
];

/** おみくじテキスト（設計書8.3） */
const OMIKUJI_TEXTS: Record<string, Record<number, string[]>> = {
  love: {
    1: ['素晴らしい出会いの予感', '積極的に行動を', '最高の恋愛運'],
    2: ['良縁あり', '誠実な態度が吉', '心通う相手現る'],
    3: ['ゆっくり進展', '焦らず着実に', '小さな幸せ'],
    4: ['平穏', '現状維持で吉', '安定した関係'],
    5: ['待つが吉', '時機を見て', '我慢の時'],
    6: ['慎重に', '誤解に注意', '焦りは禁物'],
    7: ['控えめに', '無理は禁物', '時を待て'],
  },
  work: {
    1: ['大きな成功', '昇進・栄転の兆し', '努力が実る'],
    2: ['順調に進む', '協力者現る', '信頼を得る'],
    3: ['着実に前進', 'コツコツと', '小さな成果'],
    4: ['安定', '現状を維持', '基盤固め'],
    5: ['じっくり取り組む', '準備期間', '学びの時'],
    6: ['注意深く', 'ミスに気をつけて', '確認を怠らず'],
    7: ['休息を', '無理せず', '態勢を整えて'],
  },
  money: {
    1: ['金運絶好調', '臨時収入の予感', '投資吉'],
    2: ['収入増', '貯蓄吉', '計画的に'],
    3: ['まずまず', '堅実に', '無駄遣い注意'],
    4: ['安定', '現状維持', '収支バランス良好'],
    5: ['節約を', '出費に注意', '貯める時'],
    6: ['出費増', '財布の紐を締めて', '衝動買い注意'],
    7: ['大きな出費注意', '投資控えて', '守りの姿勢'],
  },
  health: {
    1: ['絶好調', '活力みなぎる', '新しい運動吉'],
    2: ['好調', '体調良好', '適度な運動を'],
    3: ['おおむね良好', '規則正しく', '休息も大切'],
    4: ['普通', '無理せず', '生活習慣を見直して'],
    5: ['やや疲れ気味', '休息を', 'ストレス注意'],
    6: ['要注意', '養生を', '無理は禁物'],
    7: ['休息第一', '体を労わって', '検診のすすめ'],
  },
  social: {
    1: ['最高の出会い', '人脈拡大', '信頼関係深まる'],
    2: ['交友関係好調', '新しい友人', 'コミュニケーション吉'],
    3: ['良好', '周囲との調和', '感謝を忘れず'],
    4: ['安定', '穏やかな関係', '現状維持'],
    5: ['静かに過ごす', '深入り注意', '観察の時'],
    6: ['トラブル注意', '言葉遣いに気をつけて', '距離を保って'],
    7: ['一人の時間を', '無理に交流せず', '内省の時'],
  },
};

/** おみくじドロー（設計書8.2） */
function drawOmikuji(seed: number): OmikujiType {
  const random = seededRandom(seed);
  const roll = random();
  let cumulative = 0;
  for (const omikuji of OMIKUJI_TYPES) {
    cumulative += omikuji.probability;
    if (roll < cumulative) return omikuji;
  }
  return OMIKUJI_TYPES[3];
}

/** テキスト取得 */
function getOmikujiText(category: string, rank: number, rand: () => number): string {
  const texts = OMIKUJI_TEXTS[category]?.[rank] ?? ['吉凶混合'];
  return pickRandom(texts, rand);
}

/** 6軸変換（設計書8.4） */
function omikujiToScores(omikuji: OmikujiType, seed: number): FortuneScores {
  const random = seededRandom(seed + 2000);
  const base = omikuji.baseScore;
  const variance = () => (random() - 0.5) * 20;
  const scores: FortuneScores = {
    love: normalizeScore(base + variance(), 0, 100),
    work: normalizeScore(base + variance(), 0, 100),
    money: normalizeScore(base + variance(), 0, 100),
    health: normalizeScore(base + variance(), 0, 100),
    social: normalizeScore(base + variance(), 0, 100),
    total: 0
  };
  scores.total = calculateTotal(scores);
  return finalizeScores(scores);
}

/** おみくじプラグイン */
export const omikujiPlugin: FortunePlugin = {
  id: 'omikuji',
  name: 'おみくじ',
  category: 'free',
  requiresInput: [],

  generate: (date: string, profile?: UserProfile) => {
    const userId = profile?.birthDate || 'anonymous';
    const seed = generateSeed(date, userId);
    const omikuji = drawOmikuji(seed);
    const scores = omikujiToScores(omikuji, seed);
    const rand = seededRandom(seed + 1000);

    const details = {
      love: `恋愛: ${getOmikujiText('love', omikuji.rank, rand)}`,
      work: `仕事: ${getOmikujiText('work', omikuji.rank, rand)}`,
      money: `金運: ${getOmikujiText('money', omikuji.rank, rand)}`,
      health: `健康: ${getOmikujiText('health', omikuji.rank, rand)}`,
      social: `対人: ${getOmikujiText('social', omikuji.rank, rand)}`,
      total: `【${omikuji.name}】`,
    };

    const lucky = {
      color: pickRandom(LUCKY_COLORS, rand),
      item: pickRandom(LUCKY_ITEMS, rand),
      direction: pickRandom(DIRECTIONS, rand),
    };

    return createFortuneResult('omikuji', date, scores, details, lucky);
  },
};

export default omikujiPlugin;
