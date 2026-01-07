// Fortune Calendar 共通占いロジック v1.1
// 設計書: FortuneCalendar_占いロジック設計書_v1.0

import { FortuneScores } from '../config/types';

/** 日付情報 */
export interface DateInfo {
  year: number;
  month: number;        // 1-12
  day: number;          // 1-31
  dayOfWeek: number;    // 0=日, 1=月, ..., 6=土
  dayOfYear: number;    // 1-366
  lunarPhase: number;   // 0-29（月齢概算）
}

/** 日付からDateInfoを取得 */
export function getDateInfo(dateStr: string): DateInfo {
  const d = new Date(dateStr);
  const start = new Date(d.getFullYear(), 0, 0);
  const diff = d.getTime() - start.getTime();
  const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));

  // 月齢概算（新月からの日数）
  const lunarCycle = 29.53059;
  const knownNewMoon = new Date('2000-01-06').getTime();
  const lunarPhase = Math.floor(((d.getTime() - knownNewMoon) / (1000 * 60 * 60 * 24)) % lunarCycle);

  return {
    year: d.getFullYear(),
    month: d.getMonth() + 1,
    day: d.getDate(),
    dayOfWeek: d.getDay(),
    dayOfYear,
    lunarPhase
  };
}

/** シード生成 */
export function generateSeed(date: string, userId: string): number {
  const combined = `${date}-${userId}`;
  let hash = 0;
  for (let i = 0; i < combined.length; i++) {
    const char = combined.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

/** シード付き乱数生成器（Mulberry32） */
export function seededRandom(seed: number): () => number {
  return function() {
    let t = seed += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

/** 文字列からシード生成 */
export function stringToSeed(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

/** スコア正規化（0-100） */
export function normalizeScore(value: number, min: number, max: number): number {
  const normalized = ((value - min) / (max - min)) * 100;
  return Math.max(0, Math.min(100, Math.round(normalized)));
}

/** 総合運を算出 */
export function calculateTotal(scores: Omit<FortuneScores, 'total'>): number {
  const weights = { love: 0.20, work: 0.25, money: 0.20, health: 0.15, social: 0.20 };
  let total = 0;
  for (const [key, weight] of Object.entries(weights)) {
    total += (scores[key as keyof typeof scores] ?? 0) * weight;
  }
  return Math.round(total);
}

/** スコア最終処理（範囲保証） */
export function finalizeScores(scores: FortuneScores): FortuneScores {
  const keys = ['love', 'work', 'money', 'health', 'social', 'total'] as const;
  for (const key of keys) {
    scores[key] = Math.max(0, Math.min(100, Math.round(scores[key])));
  }
  // totalが他の平均から大きく外れていないか確認
  const avg = (scores.love + scores.work + scores.money + scores.health + scores.social) / 5;
  if (Math.abs(scores.total - avg) > 15) {
    scores.total = Math.round(avg);
  }
  return scores;
}

/** 配列からランダム選択 */
export function pickRandom<T>(arr: T[], rand: () => number): T {
  return arr[Math.floor(rand() * arr.length)];
}

/** ラッキーカラー */
export const LUCKY_COLORS = [
  '赤', '青', '緑', '黄', '紫', 'ピンク', 'オレンジ', '白', '黒', 'ゴールド',
  'シルバー', '茶', '水色', 'エメラルド', 'ターコイズ'
];

/** ラッキーアイテム */
export const LUCKY_ITEMS = [
  'ハンカチ', '時計', 'アクセサリー', '本', 'コーヒー', 'お茶', '花', '香水',
  'ペン', 'ノート', 'キャンドル', 'お守り', '写真', '音楽', '傘'
];

/** 方位 */
export const DIRECTIONS = ['北', '北東', '東', '南東', '南', '南西', '西', '北西'];
