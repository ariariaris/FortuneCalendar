// Fortune Calendar 数秘術 v1.1
import { FortunePlugin, createFortuneResult, DETAIL_TEMPLATES } from './types';
import { DateInfo, getDateInfo, normalizeScore, calculateTotal, finalizeScores, pickRandom, LUCKY_COLORS, LUCKY_ITEMS, stringToSeed, seededRandom } from '../utils/fortuneLogic';
import { UserProfile, FortuneScores } from '../config/types';

/** 数字の意味（設計書5.2） */
interface NumberMeaning {
  number: number;
  keyword: string;
  strengths: string[];
  luckyColor: string;
}

const NUMBER_MEANINGS: Record<number, NumberMeaning> = {
  1: { number: 1, keyword: '始まり・リーダーシップ', strengths: ['独立心', '創造性'], luckyColor: '赤' },
  2: { number: 2, keyword: '調和・協力', strengths: ['外交力', '直感'], luckyColor: 'オレンジ' },
  3: { number: 3, keyword: '表現・創造', strengths: ['社交性', '楽観'], luckyColor: '黄色' },
  4: { number: 4, keyword: '安定・秩序', strengths: ['実直', '忍耐'], luckyColor: '緑' },
  5: { number: 5, keyword: '変化・自由', strengths: ['適応力', '冒険心'], luckyColor: '青' },
  6: { number: 6, keyword: '愛・責任', strengths: ['思いやり', '芸術性'], luckyColor: '藍' },
  7: { number: 7, keyword: '探求・精神性', strengths: ['分析力', '知性'], luckyColor: '紫' },
  8: { number: 8, keyword: '達成・権力', strengths: ['実行力', '野心'], luckyColor: 'ピンク' },
  9: { number: 9, keyword: '完成・博愛', strengths: ['理想主義', '寛大'], luckyColor: '白' },
  11: { number: 11, keyword: '直感・啓示', strengths: ['霊感', 'ビジョン'], luckyColor: 'シルバー' },
  22: { number: 22, keyword: '建設・実現', strengths: ['大志', '実践力'], luckyColor: 'ゴールド' },
  33: { number: 33, keyword: '奉仕・癒し', strengths: ['無私', '慈愛'], luckyColor: 'ターコイズ' },
};

/** 誕生数計算（設計書5.1） */
function calculateLifePathNumber(birthDate: string): number {
  const digits = birthDate.replace(/-/g, '').split('').map(Number);
  let sum = digits.reduce((a, b) => a + b, 0);
  while (sum > 9 && sum !== 11 && sum !== 22 && sum !== 33) {
    sum = sum.toString().split('').map(Number).reduce((a, b) => a + b, 0);
  }
  return sum;
}

/** 日運数計算（設計書5.1） */
function calculateDayNumber(dateStr: string): number {
  const digits = dateStr.replace(/-/g, '').split('').map(Number);
  let sum = digits.reduce((a, b) => a + b, 0);
  while (sum > 9) {
    sum = sum.toString().split('').map(Number).reduce((a, b) => a + b, 0);
  }
  return sum;
}

/** 個人年数計算（設計書5.1） */
function calculatePersonalYear(birthMonth: number, birthDay: number, year: number): number {
  let result = birthMonth + birthDay + year;
  while (result > 9 && result !== 11 && result !== 22) {
    result = result.toString().split('').map(Number).reduce((a, b) => a + b, 0);
  }
  return result;
}

/** 運勢アルゴリズム（設計書5.3） */
function calculateNumerologyScore(lifePathNumber: number, dayNumber: number, personalYear: number): number {
  const lifeNum = lifePathNumber > 9 ? (lifePathNumber % 10) || 9 : lifePathNumber;
  const compatibility = 100 - Math.abs(lifeNum - dayNumber) * 8;
  const yearBonus = personalYear === lifePathNumber ? 15 : Math.abs(personalYear - lifeNum) <= 2 ? 5 : 0;
  const masterBonus = [11, 22, 33].includes(lifePathNumber) ? 5 : 0;
  return Math.round(compatibility + yearBonus + masterBonus);
}

/** 6軸変換（設計書5.4） */
function numerologyToScores(lifePathNumber: number, dateInfo: DateInfo, birthMonth: number, birthDay: number): FortuneScores {
  const dayNumber = calculateDayNumber(`${dateInfo.year}-${String(dateInfo.month).padStart(2, '0')}-${String(dateInfo.day).padStart(2, '0')}`);
  const personalYear = calculatePersonalYear(birthMonth, birthDay, dateInfo.year);
  const base = calculateNumerologyScore(lifePathNumber, dayNumber, personalYear);

  const numberBonus: Record<number, Partial<FortuneScores>> = {
    1: { work: 10, love: -5 }, 2: { love: 10, social: 5 }, 3: { social: 10, money: 5 },
    4: { money: 10, health: 5 }, 5: { love: 5, social: 5 }, 6: { love: 10, health: 5 },
    7: { health: 10, work: 5 }, 8: { money: 10, work: 10 }, 9: { social: 10, health: 5 },
    11: { love: 8, health: 8 }, 22: { work: 12, money: 8 }, 33: { social: 12, love: 8 },
  };

  const bonus = numberBonus[lifePathNumber] ?? {};
  const scores: FortuneScores = {
    love: normalizeScore(base + (bonus.love ?? 0), 30, 120),
    work: normalizeScore(base + (bonus.work ?? 0), 30, 120),
    money: normalizeScore(base + (bonus.money ?? 0), 30, 120),
    health: normalizeScore(base + (bonus.health ?? 0), 30, 120),
    social: normalizeScore(base + (bonus.social ?? 0), 30, 120),
    total: 0
  };
  scores.total = calculateTotal(scores);
  return finalizeScores(scores);
}

/** 詳細テキスト生成 */
const getDetail = (key: keyof typeof DETAIL_TEMPLATES, score: number, rand: () => number): string => {
  const templates = DETAIL_TEMPLATES[key];
  if (score >= 70) return pickRandom(templates.high, rand);
  if (score >= 50) return pickRandom(templates.mid, rand);
  return pickRandom(templates.low, rand);
};

/** 数秘術プラグイン */
export const numerologyPlugin: FortunePlugin = {
  id: 'numerology',
  name: '数秘術',
  category: 'free',
  requiresInput: ['birthDate'],

  generate: (date: string, profile?: UserProfile) => {
    const birthDate = profile?.birthDate || '2000-01-01';
    const bd = new Date(birthDate);
    const birthMonth = bd.getMonth() + 1;
    const birthDay = bd.getDate();
    const lifeNumber = calculateLifePathNumber(birthDate);
    const dateInfo = getDateInfo(date);
    const dayNumber = calculateDayNumber(date);
    const scores = numerologyToScores(lifeNumber, dateInfo, birthMonth, birthDay);
    const meaning = NUMBER_MEANINGS[lifeNumber] ?? NUMBER_MEANINGS[lifeNumber % 10] ?? NUMBER_MEANINGS[1];
    const seed = stringToSeed(`numerology_${lifeNumber}_${dayNumber}_${date}`);
    const rand = seededRandom(seed);

    const details = {
      love: getDetail('love', scores.love, rand),
      work: getDetail('work', scores.work, rand),
      money: getDetail('money', scores.money, rand),
      health: getDetail('health', scores.health, rand),
      social: getDetail('social', scores.social, rand),
      total: `誕生数${lifeNumber}×日運数${dayNumber}【${meaning.keyword}】`,
    };

    const lucky = {
      color: meaning.luckyColor,
      item: pickRandom(LUCKY_ITEMS, rand),
      number: dayNumber
    };

    return createFortuneResult('numerology', date, scores, details, lucky);
  },
};

export default numerologyPlugin;
