// Fortune Calendar 星座占い v1.1
import { FortunePlugin, createFortuneResult, DETAIL_TEMPLATES } from './types';
import { DateInfo, getDateInfo, normalizeScore, calculateTotal, finalizeScores, pickRandom, LUCKY_COLORS, LUCKY_ITEMS, stringToSeed, seededRandom } from '../utils/fortuneLogic';
import { UserProfile, FortuneScores } from '../config/types';

/** 星座データ（設計書3.1） */
interface ZodiacSign {
  id: string;
  name: string;
  symbol: string;
  startMonth: number;
  startDay: number;
  endMonth: number;
  endDay: number;
  element: 'fire' | 'earth' | 'air' | 'water';
  quality: 'cardinal' | 'fixed' | 'mutable';
}

const ZODIAC_SIGNS: ZodiacSign[] = [
  { id: 'aries', name: '牡羊座', symbol: '♈', startMonth: 3, startDay: 21, endMonth: 4, endDay: 19, element: 'fire', quality: 'cardinal' },
  { id: 'taurus', name: '牡牛座', symbol: '♉', startMonth: 4, startDay: 20, endMonth: 5, endDay: 20, element: 'earth', quality: 'fixed' },
  { id: 'gemini', name: '双子座', symbol: '♊', startMonth: 5, startDay: 21, endMonth: 6, endDay: 21, element: 'air', quality: 'mutable' },
  { id: 'cancer', name: '蟹座', symbol: '♋', startMonth: 6, startDay: 22, endMonth: 7, endDay: 22, element: 'water', quality: 'cardinal' },
  { id: 'leo', name: '獅子座', symbol: '♌', startMonth: 7, startDay: 23, endMonth: 8, endDay: 22, element: 'fire', quality: 'fixed' },
  { id: 'virgo', name: '乙女座', symbol: '♍', startMonth: 8, startDay: 23, endMonth: 9, endDay: 22, element: 'earth', quality: 'mutable' },
  { id: 'libra', name: '天秤座', symbol: '♎', startMonth: 9, startDay: 23, endMonth: 10, endDay: 23, element: 'air', quality: 'cardinal' },
  { id: 'scorpio', name: '蠍座', symbol: '♏', startMonth: 10, startDay: 24, endMonth: 11, endDay: 22, element: 'water', quality: 'fixed' },
  { id: 'sagittarius', name: '射手座', symbol: '♐', startMonth: 11, startDay: 23, endMonth: 12, endDay: 21, element: 'fire', quality: 'mutable' },
  { id: 'capricorn', name: '山羊座', symbol: '♑', startMonth: 12, startDay: 22, endMonth: 1, endDay: 19, element: 'earth', quality: 'cardinal' },
  { id: 'aquarius', name: '水瓶座', symbol: '♒', startMonth: 1, startDay: 20, endMonth: 2, endDay: 18, element: 'air', quality: 'fixed' },
  { id: 'pisces', name: '魚座', symbol: '♓', startMonth: 2, startDay: 19, endMonth: 3, endDay: 20, element: 'water', quality: 'mutable' },
];

/** 生年月日から星座を取得 */
function getZodiacSign(birthMonth: number, birthDay: number): ZodiacSign {
  for (const sign of ZODIAC_SIGNS) {
    if (sign.startMonth > sign.endMonth) {
      // 山羊座（12月〜1月）
      if ((birthMonth === sign.startMonth && birthDay >= sign.startDay) ||
          (birthMonth === sign.endMonth && birthDay <= sign.endDay)) return sign;
    } else {
      if ((birthMonth === sign.startMonth && birthDay >= sign.startDay) ||
          (birthMonth === sign.endMonth && birthDay <= sign.endDay)) return sign;
    }
  }
  return ZODIAC_SIGNS[0];
}

/** 曜日ボーナス（設計書3.2） */
function getDayOfWeekBonus(element: string, dayOfWeek: number): number {
  const bonusMap: Record<string, Record<number, number>> = {
    fire: { 2: 10, 6: 5 },  // 火曜+10, 土曜+5
    earth: { 6: 10, 1: 5 }, // 土曜+10, 月曜+5
    air: { 3: 10, 5: 5 },   // 水曜+10, 金曜+5
    water: { 1: 10, 5: 5 }, // 月曜+10, 金曜+5
  };
  return bonusMap[element]?.[dayOfWeek] ?? 0;
}

/** 基礎スコア算出（設計書3.2） */
function calculateZodiacScore(sign: ZodiacSign, dateInfo: DateInfo): number {
  const zodiacIndex = ZODIAC_SIGNS.findIndex(s => s.id === sign.id);
  const dayCycle = (dateInfo.dayOfYear + zodiacIndex * 30) % 365;
  const cycleScore = Math.sin(dayCycle * Math.PI * 2 / 365) * 25 + 50;
  const dayOfWeekBonus = getDayOfWeekBonus(sign.element, dateInfo.dayOfWeek);
  const lunarBonus = sign.element === 'water'
    ? Math.cos(dateInfo.lunarPhase * Math.PI * 2 / 29.5) * 10
    : Math.cos(dateInfo.lunarPhase * Math.PI * 2 / 29.5) * 5;
  return Math.round(cycleScore + dayOfWeekBonus + lunarBonus);
}

/** 6軸変換（設計書3.3） */
function seizaToScores(sign: ZodiacSign, dateInfo: DateInfo): FortuneScores {
  const base = calculateZodiacScore(sign, dateInfo);
  const elementBonus: Record<string, Partial<FortuneScores>> = {
    fire: { work: 10, love: 5 }, earth: { money: 10, health: 5 },
    air: { social: 10, work: 5 }, water: { love: 10, health: 5 },
  };
  const qualityBonus: Record<string, Partial<FortuneScores>> = {
    cardinal: { work: 5 }, fixed: { money: 5 }, mutable: { social: 5 },
  };
  const eBonus = elementBonus[sign.element] ?? {};
  const qBonus = qualityBonus[sign.quality] ?? {};
  const scores: FortuneScores = {
    love: normalizeScore(base + (eBonus.love ?? 0), 20, 120),
    work: normalizeScore(base + (eBonus.work ?? 0) + (qBonus.work ?? 0), 20, 120),
    money: normalizeScore(base + (eBonus.money ?? 0) + (qBonus.money ?? 0), 20, 120),
    health: normalizeScore(base + (eBonus.health ?? 0), 20, 120),
    social: normalizeScore(base + (eBonus.social ?? 0) + (qBonus.social ?? 0), 20, 120),
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

/** 星座占いプラグイン */
export const seizaPlugin: FortunePlugin = {
  id: 'seiza',
  name: '星座占い',
  category: 'free',
  requiresInput: ['birthDate'],

  generate: (date: string, profile?: UserProfile) => {
    const birthDate = profile?.birthDate || '2000-01-01';
    const bd = new Date(birthDate);
    const sign = getZodiacSign(bd.getMonth() + 1, bd.getDate());
    const dateInfo = getDateInfo(date);
    const scores = seizaToScores(sign, dateInfo);
    const seed = stringToSeed(`seiza_${sign.id}_${date}`);
    const rand = seededRandom(seed);

    const details = {
      love: getDetail('love', scores.love, rand),
      work: getDetail('work', scores.work, rand),
      money: getDetail('money', scores.money, rand),
      health: getDetail('health', scores.health, rand),
      social: getDetail('social', scores.social, rand),
      total: `${sign.symbol}${sign.name}（${sign.element === 'fire' ? '火' : sign.element === 'earth' ? '地' : sign.element === 'air' ? '風' : '水'}の星座）`,
    };
    const lucky = { color: pickRandom(LUCKY_COLORS, rand), item: pickRandom(LUCKY_ITEMS, rand), number: Math.floor(rand() * 9) + 1 };
    return createFortuneResult('seiza', date, scores, details, lucky);
  },
};

export default seizaPlugin;
