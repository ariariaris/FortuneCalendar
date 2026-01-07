// Fortune Calendar 血液型占い v1.1
import { FortunePlugin, createFortuneResult, DETAIL_TEMPLATES } from './types';
import { DateInfo, getDateInfo, normalizeScore, calculateTotal, finalizeScores, pickRandom, LUCKY_COLORS, LUCKY_ITEMS, stringToSeed, seededRandom } from '../utils/fortuneLogic';
import { UserProfile, FortuneScores } from '../config/types';

/** 血液型プロフィール（設計書4.1） */
interface BloodTypeProfile {
  id: string;
  name: string;
  traits: string[];
  compatibility: Record<string, number>;
}

const BLOOD_TYPES: Record<string, BloodTypeProfile> = {
  A: { id: 'A', name: 'A型', traits: ['几帳面', '慎重', '気配り上手'], compatibility: { A: 80, B: 60, O: 90, AB: 70 } },
  B: { id: 'B', name: 'B型', traits: ['マイペース', '好奇心旺盛', '自由奔放'], compatibility: { A: 60, B: 85, O: 75, AB: 80 } },
  O: { id: 'O', name: 'O型', traits: ['おおらか', 'リーダー気質', '情熱的'], compatibility: { A: 90, B: 75, O: 70, AB: 65 } },
  AB: { id: 'AB', name: 'AB型', traits: ['二面性', '冷静', 'クリエイティブ'], compatibility: { A: 70, B: 80, O: 65, AB: 75 } }
};

/** 曜日ベーススコア（設計書4.2） */
const DAY_SCORES: Record<string, number[]> = {
  //        日   月   火   水   木   金   土
  A:  [   70,  85,  75,  80,  70,  90,  65 ],
  B:  [   80,  70,  85,  75,  90,  70,  85 ],
  O:  [   85,  75,  70,  85,  75,  80,  90 ],
  AB: [   75,  80,  90,  70,  85,  75,  80 ],
};

/** 月オフセット */
function getBloodTypeMonthOffset(bloodType: string): number {
  const offsets: Record<string, number> = { A: 0, B: 3, O: 6, AB: 9 };
  return offsets[bloodType] ?? 0;
}

/** 基礎スコア算出（設計書4.2） */
function calculateBloodTypeScore(bloodType: string, dateInfo: DateInfo): number {
  const baseScore = DAY_SCORES[bloodType]?.[dateInfo.dayOfWeek] ?? 75;
  const monthBonus = Math.sin((dateInfo.month + getBloodTypeMonthOffset(bloodType)) * Math.PI / 6) * 10;
  const dayBonus = Math.cos(dateInfo.day * Math.PI / 15) * 5;
  return Math.round(baseScore + monthBonus + dayBonus);
}

/** 6軸変換（設計書4.3） */
function bloodTypeToScores(bloodType: string, dateInfo: DateInfo): FortuneScores {
  const base = calculateBloodTypeScore(bloodType, dateInfo);
  const typeBonus: Record<string, Partial<FortuneScores>> = {
    A: { work: 8, health: 5, social: -3 },
    B: { love: 5, social: 8, work: -3 },
    O: { work: 5, money: 5, love: 5 },
    AB: { social: 5, health: 8, money: -3 },
  };
  const bonus = typeBonus[bloodType] ?? {};

  const scores: FortuneScores = {
    love: normalizeScore(base + (bonus.love ?? 0), 40, 110),
    work: normalizeScore(base + (bonus.work ?? 0), 40, 110),
    money: normalizeScore(base + (bonus.money ?? 0), 40, 110),
    health: normalizeScore(base + (bonus.health ?? 0), 40, 110),
    social: normalizeScore(base + (bonus.social ?? 0), 40, 110),
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

/** 血液型占いプラグイン */
export const bloodTypePlugin: FortunePlugin = {
  id: 'bloodType',
  name: '血液型占い',
  category: 'free',
  requiresInput: ['bloodType'],

  generate: (date: string, profile?: UserProfile) => {
    const bloodType = profile?.bloodType || 'A';
    const dateInfo = getDateInfo(date);
    const scores = bloodTypeToScores(bloodType, dateInfo);
    const typeProfile = BLOOD_TYPES[bloodType];
    const seed = stringToSeed(`blood_${bloodType}_${date}`);
    const rand = seededRandom(seed);

    const details = {
      love: getDetail('love', scores.love, rand),
      work: getDetail('work', scores.work, rand),
      money: getDetail('money', scores.money, rand),
      health: getDetail('health', scores.health, rand),
      social: getDetail('social', scores.social, rand),
      total: `${typeProfile.name}の特徴: ${typeProfile.traits.join('・')}`,
    };

    const lucky = {
      color: pickRandom(LUCKY_COLORS, rand),
      item: pickRandom(LUCKY_ITEMS, rand),
      number: Math.floor(rand() * 9) + 1
    };

    return createFortuneResult('bloodType', date, scores, details, lucky);
  },
};

export default bloodTypePlugin;
