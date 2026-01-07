// Fortune Calendar 占い共通処理 v1.0
import { FortuneScores, FortuneResult } from '../config/types';

/** スコアから星数を計算（1-5） */
export const scoreToStars = (score: number): number => {
  if (score < 20) return 1;
  if (score < 40) return 2;
  if (score < 60) return 3;
  if (score < 80) return 4;
  return 5;
};

/** 星表示文字列 */
export const starsDisplay = (score: number): string => {
  const stars = scoreToStars(score);
  return '★'.repeat(stars) + '☆'.repeat(5 - stars);
};

/** ランダムスコア生成（min-max） */
export const randomScore = (min = 30, max = 100): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

/** シード付きランダム（日付ベースで固定結果） */
export const seededRandom = (seed: string): (() => number) => {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) - hash) + seed.charCodeAt(i);
    hash |= 0;
  }
  return () => {
    hash = (hash * 9301 + 49297) % 233280;
    return hash / 233280;
  };
};

/** シード付きランダムスコア */
export const seededScore = (rand: () => number, min = 30, max = 100): number => {
  return Math.floor(rand() * (max - min + 1)) + min;
};

/** 6軸スコア生成 */
export const generateScores = (rand: () => number): FortuneScores => {
  const love = seededScore(rand, 40, 100);
  const work = seededScore(rand, 40, 100);
  const money = seededScore(rand, 40, 100);
  const health = seededScore(rand, 40, 100);
  const social = seededScore(rand, 40, 100);
  const total = Math.round((love + work + money + health + social) / 5);
  return { love, work, money, health, social, total };
};

/** 配列からランダム選択 */
export const pickRandom = <T>(arr: T[], rand: () => number): T => {
  return arr[Math.floor(rand() * arr.length)];
};

/** キャッシュキー生成 */
export const cacheKey = (fortuneId: string, date: string, profileKey?: string): string => {
  return `${fortuneId}_${date}_${profileKey || 'default'}`;
};

/** 総合評価テキスト */
export const totalRating = (score: number): string => {
  if (score >= 90) return '最高の1日！';
  if (score >= 80) return 'とても良い日';
  if (score >= 70) return '良い日';
  if (score >= 60) return 'まずまずの日';
  if (score >= 50) return '普通の日';
  return '控えめな日';
};

/** ラッキーカラー候補 */
export const LUCKY_COLORS = [
  'ピンク', 'レッド', 'オレンジ', 'イエロー', 'グリーン',
  'ブルー', 'パープル', 'ホワイト', 'ブラック', 'ゴールド',
];

/** ラッキーアイテム候補 */
export const LUCKY_ITEMS = [
  'リップ', 'ハンカチ', 'ペン', '本', 'アクセサリー',
  'お花', 'コーヒー', 'スイーツ', '香水', 'カード',
];
