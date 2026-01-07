// Fortune Calendar 月運・年運計算サービス v1.1
import { FortuneScores, FortuneDetails, LuckyInfo, FortuneResult, UserProfile } from '../config/types';
import { getPlugin } from '../fortunes';
import { stringToSeed, seededRandom, pickRandom, LUCKY_COLORS, LUCKY_ITEMS, normalizeScore, calculateTotal, finalizeScores } from '../utils/fortuneLogic';
import { FortunePeriod } from '../components/common/PeriodTabs';

/** 月の相性マトリックス（誕生月と対象月の相性: -10〜+10） */
const MONTH_COMPATIBILITY: number[][] = [
  // 1月  2月  3月  4月  5月  6月  7月  8月  9月 10月 11月 12月
  [  10,   5,   0,  -5,  -5,   0,   5,  10,   5,   0,  -5,   0], // 1月生まれ
  [   5,  10,   5,   0,  -5,  -5,   0,   5,  10,   5,   0,  -5], // 2月生まれ
  [   0,   5,  10,   5,   0,  -5,  -5,   0,   5,  10,   5,   0], // 3月
  [  -5,   0,   5,  10,   5,   0,  -5,  -5,   0,   5,  10,   5], // 4月
  [  -5,  -5,   0,   5,  10,   5,   0,  -5,  -5,   0,   5,  10], // 5月
  [   0,  -5,  -5,   0,   5,  10,   5,   0,  -5,  -5,   0,   5], // 6月
  [   5,   0,  -5,  -5,   0,   5,  10,   5,   0,  -5,  -5,   0], // 7月
  [  10,   5,   0,  -5,  -5,   0,   5,  10,   5,   0,  -5,  -5], // 8月
  [   5,  10,   5,   0,  -5,  -5,   0,   5,  10,   5,   0,  -5], // 9月
  [   0,   5,  10,   5,   0,  -5,  -5,   0,   5,  10,   5,   0], // 10月
  [  -5,   0,   5,  10,   5,   0,  -5,  -5,   0,   5,  10,   5], // 11月
  [   0,  -5,   0,   5,  10,   5,   0,  -5,  -5,   0,   5,  10], // 12月
];

/** 月別の運勢傾向（各軸へのボーナス） */
const MONTHLY_TRENDS: Record<number, Partial<FortuneScores>> = {
  1: { work: 5, money: 5 },      // 新年：仕事・金運
  2: { love: 10 },               // バレンタイン：恋愛運
  3: { social: 5, health: 5 },   // 春：社交・健康
  4: { work: 10 },               // 新年度：仕事運
  5: { health: 10 },             // 初夏：健康運
  6: { love: 5, social: 5 },     // 梅雨：恋愛・社交
  7: { social: 10 },             // 夏：社交運
  8: { health: 5, social: 5 },   // 夏休み：健康・社交
  9: { work: 5, money: 5 },      // 秋：仕事・金運
  10: { love: 5 },               // 実りの秋：恋愛運
  11: { money: 10 },             // 年末準備：金運
  12: { love: 5, social: 5 },    // 年末：恋愛・社交
};

/** 月運アドバイステンプレート */
const MONTHLY_ADVICE: Record<'high' | 'mid' | 'low', string[]> = {
  high: [
    '今月は積極的に行動することで大きな成果が期待できます。',
    '運気が上昇中。新しいことを始めるのに最適な時期です。',
    '周囲のサポートを受けやすい月。チャンスを逃さないで。',
  ],
  mid: [
    '安定した運気の月。焦らず着実に進めましょう。',
    '準備と計画に時間を使うと良い結果につながります。',
    'バランスを意識して過ごすことで運気が安定します。',
  ],
  low: [
    '慎重に行動することで災いを避けられる月です。',
    '無理をせず、休息を大切にしましょう。',
    '来月に向けての準備期間と考えて過ごしましょう。',
  ],
};

/** 月運スコアを計算 */
export function calculateMonthlyScores(
  fortuneId: string,
  targetYear: number,
  targetMonth: number,
  profile?: UserProfile
): FortuneScores {
  // 日運の月初日スコアをベースに使用
  const baseDate = `${targetYear}-${String(targetMonth).padStart(2, '0')}-15`;
  const plugin = getPlugin(fortuneId);
  if (!plugin) {
    return { love: 50, work: 50, money: 50, health: 50, social: 50, total: 50 };
  }

  const baseResult = plugin.generate(baseDate, profile);
  const baseScores = { ...baseResult.scores };

  // 誕生月との相性補正
  const birthMonth = profile?.birthDate
    ? new Date(profile.birthDate).getMonth() + 1
    : 1;
  const compatibility = MONTH_COMPATIBILITY[birthMonth - 1][targetMonth - 1];

  // 月別トレンド補正
  const trend = MONTHLY_TRENDS[targetMonth] || {};

  // スコア補正を適用
  const scores: FortuneScores = {
    love: normalizeScore(baseScores.love + compatibility + (trend.love || 0), 0, 120),
    work: normalizeScore(baseScores.work + compatibility + (trend.work || 0), 0, 120),
    money: normalizeScore(baseScores.money + compatibility + (trend.money || 0), 0, 120),
    health: normalizeScore(baseScores.health + compatibility + (trend.health || 0), 0, 120),
    social: normalizeScore(baseScores.social + compatibility + (trend.social || 0), 0, 120),
    total: 0,
  };
  scores.total = calculateTotal(scores);
  return finalizeScores(scores);
}

/** 月運の詳細テキストを生成 */
function generateMonthlyDetails(scores: FortuneScores, month: number): FortuneDetails {
  const getLevel = (score: number) => score >= 70 ? 'high' : score >= 40 ? 'mid' : 'low';
  const monthNames = ['', '1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];

  return {
    love: scores.love >= 70 ? '恋愛運好調！積極的なアプローチが吉' : scores.love >= 40 ? '穏やかな恋愛運。自然体で過ごして' : '焦りは禁物。自分磨きの時期',
    work: scores.work >= 70 ? '仕事運絶好調！大きな成果が期待できる' : scores.work >= 40 ? 'コツコツ積み重ねが実を結ぶ月' : '無理は禁物。計画の見直しを',
    money: scores.money >= 70 ? '金運上昇中！投資や大きな買い物にも好機' : scores.money >= 40 ? '堅実な金運。計画的な支出を心がけて' : '節約モードで乗り切って',
    health: scores.health >= 70 ? '健康運良好！運動を始めるなら今月' : scores.health >= 40 ? '規則正しい生活で体調維持' : '無理をしないで十分な休息を',
    social: scores.social >= 70 ? '人間関係良好！新しい出会いにも期待' : scores.social >= 40 ? '穏やかな人間関係。感謝の気持ちを大切に' : '距離感を保ちつつ過ごして',
    total: `${monthNames[month]}の運勢`,
  };
}

/** 月運アドバイスを生成 */
function generateMonthlyAdvice(scores: FortuneScores, fortuneId: string, month: number): string {
  const seed = stringToSeed(`monthly_${fortuneId}_${month}`);
  const rand = seededRandom(seed);
  const level = scores.total >= 65 ? 'high' : scores.total >= 40 ? 'mid' : 'low';
  return pickRandom(MONTHLY_ADVICE[level], rand);
}

/** 月運ラッキー情報を生成 */
function generateMonthlyLucky(fortuneId: string, month: number): LuckyInfo {
  const seed = stringToSeed(`monthly_lucky_${fortuneId}_${month}`);
  const rand = seededRandom(seed);
  return {
    color: pickRandom(LUCKY_COLORS, rand),
    item: pickRandom(LUCKY_ITEMS, rand),
    number: Math.floor(rand() * 9) + 1,
  };
}

/** 月運結果を生成 */
export function generateMonthlyFortune(
  fortuneId: string,
  targetYear: number,
  targetMonth: number,
  profile?: UserProfile
): FortuneResult {
  const scores = calculateMonthlyScores(fortuneId, targetYear, targetMonth, profile);
  const details = generateMonthlyDetails(scores, targetMonth);
  const lucky = generateMonthlyLucky(fortuneId, targetMonth);

  return {
    fortuneId,
    date: `${targetYear}-${String(targetMonth).padStart(2, '0')}`,
    scores,
    details,
    lucky,
  };
}

/** 期間ラベルを生成 */
export function getPeriodLabel(period: FortunePeriod, date: Date): string {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;

  switch (period) {
    case 'daily':
      return `${year}年${month}月${date.getDate()}日`;
    case 'monthly':
      return `${year}年${month}月`;
    case 'yearly':
      return `${year}年`;
  }
}

// ========== 年運計算 ==========

/** 干支（十二支）の相性マトリックス */
const ZODIAC_COMPATIBILITY: number[] = [0, 5, -5, 10, -5, 5, 0, 5, -5, 10, -5, 5]; // 自分の干支からの距離

/** 9年周期の運勢（九星気学的） */
const NINE_YEAR_CYCLE = [60, 70, 80, 90, 100, 90, 80, 70, 60]; // 5年目がピーク

/** 年運アドバイステンプレート */
const YEARLY_ADVICE: Record<'high' | 'mid' | 'low', string[]> = {
  high: [
    '飛躍の年！大きな目標に挑戦するチャンスです。',
    '運気最高潮。積極的に行動することで大きな成果を得られます。',
    '人生の転機となる可能性あり。直感を信じて進みましょう。',
  ],
  mid: [
    '安定した運気の年。基盤固めに最適です。',
    '着実な成長が見込める年。コツコツ努力が報われます。',
    '準備と学びの年。来年への布石を打ちましょう。',
  ],
  low: [
    '充電の年。無理をせず自分を見つめ直す時期です。',
    '慎重に過ごすことで災いを避けられます。',
    '内省の年。心身のケアを優先しましょう。',
  ],
};

/** 年運スコアを計算 */
export function calculateYearlyScores(
  fortuneId: string,
  targetYear: number,
  profile?: UserProfile
): FortuneScores {
  const plugin = getPlugin(fortuneId);
  if (!plugin) {
    return { love: 50, work: 50, money: 50, health: 50, social: 50, total: 50 };
  }

  // 年の中間日をベースに
  const baseDate = `${targetYear}-06-15`;
  const baseResult = plugin.generate(baseDate, profile);
  const baseScores = { ...baseResult.scores };

  // 年齢による9年周期
  const birthYear = profile?.birthDate ? new Date(profile.birthDate).getFullYear() : 2000;
  const age = targetYear - birthYear;
  const cyclePosition = age % 9;
  const cycleModifier = ((NINE_YEAR_CYCLE[cyclePosition] - 60) / 40) * 15; // -15 ~ +15

  // 干支相性（12年周期）
  const zodiacPosition = (targetYear - birthYear) % 12;
  const zodiacModifier = ZODIAC_COMPATIBILITY[zodiacPosition];

  // スコア補正を適用
  const totalModifier = cycleModifier + zodiacModifier;
  const scores: FortuneScores = {
    love: normalizeScore(baseScores.love + totalModifier, 0, 120),
    work: normalizeScore(baseScores.work + totalModifier + (targetYear % 2 === 0 ? 5 : -5), 0, 120),
    money: normalizeScore(baseScores.money + totalModifier, 0, 120),
    health: normalizeScore(baseScores.health + totalModifier - Math.floor(age / 10), 0, 120),
    social: normalizeScore(baseScores.social + totalModifier, 0, 120),
    total: 0,
  };
  scores.total = calculateTotal(scores);
  return finalizeScores(scores);
}

/** 年運の詳細テキストを生成 */
function generateYearlyDetails(scores: FortuneScores, year: number): FortuneDetails {
  return {
    love: scores.love >= 70 ? '恋愛運好調の年！運命の出会いも' : scores.love >= 40 ? '穏やかな恋愛運。焦らず自然体で' : '自分磨きに集中する年',
    work: scores.work >= 70 ? '仕事で大きな飛躍が期待できる年' : scores.work >= 40 ? '着実にキャリアを積み上げる年' : '基盤を固める時期。無理は禁物',
    money: scores.money >= 70 ? '金運上昇！投資や副業にも好機' : scores.money >= 40 ? '堅実な金運。計画的な資産形成を' : '節約と貯蓄を心がけて',
    health: scores.health >= 70 ? '健康運良好！新しい健康習慣を始めよう' : scores.health >= 40 ? '体調管理を意識して過ごす年' : '健康第一。定期検診を忘れずに',
    social: scores.social >= 70 ? '人脈が広がる年！積極的に交流を' : scores.social >= 40 ? '信頼関係を深める年' : '質の高い人間関係を大切に',
    total: `${year}年の運勢`,
  };
}

/** 年運結果を生成 */
export function generateYearlyFortune(
  fortuneId: string,
  targetYear: number,
  profile?: UserProfile
): FortuneResult {
  const scores = calculateYearlyScores(fortuneId, targetYear, profile);
  const details = generateYearlyDetails(scores, targetYear);
  const seed = stringToSeed(`yearly_${fortuneId}_${targetYear}`);
  const rand = seededRandom(seed);
  const lucky: LuckyInfo = {
    color: pickRandom(LUCKY_COLORS, rand),
    item: pickRandom(LUCKY_ITEMS, rand),
    number: Math.floor(rand() * 9) + 1,
  };

  return {
    fortuneId,
    date: `${targetYear}`,
    scores,
    details,
    lucky,
  };
}
