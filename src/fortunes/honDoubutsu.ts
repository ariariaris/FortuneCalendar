// Fortune Calendar 動物占い v1.1（九星気学・六曜ベース）
import { FortunePlugin, createFortuneResult, DETAIL_TEMPLATES } from './types';
import { DateInfo, getDateInfo, normalizeScore, calculateTotal, finalizeScores, pickRandom, LUCKY_COLORS, LUCKY_ITEMS, stringToSeed, seededRandom } from '../utils/fortuneLogic';
import { UserProfile, FortuneScores } from '../config/types';

/** 九星プロフィール（設計書7.1） */
interface KyuseiProfile {
  number: number;
  name: string;
  character: string;
  element: string;
  direction: string;
  luckyColor: string;
  traits: string[];
}

const KYUSEI_PROFILES: KyuseiProfile[] = [
  { number: 1, name: '一白水星', character: 'ドルフィン', element: '水', direction: '北', luckyColor: '白・黒', traits: ['柔軟', '知性', '交際上手'] },
  { number: 2, name: '二黒土星', character: 'ベア', element: '土', direction: '南西', luckyColor: '黄・茶', traits: ['堅実', '包容力', '努力家'] },
  { number: 3, name: '三碧木星', character: 'ラビット', element: '木', direction: '東', luckyColor: '青・緑', traits: ['行動的', '若々しい', '正直'] },
  { number: 4, name: '四緑木星', character: 'バタフライ', element: '木', direction: '南東', luckyColor: '緑・青', traits: ['調和', '社交的', '優柔不断'] },
  { number: 5, name: '五黄土星', character: 'ドラゴン', element: '土', direction: '中央', luckyColor: '黄・金', traits: ['支配力', 'カリスマ', '頑固'] },
  { number: 6, name: '六白金星', character: 'イーグル', element: '金', direction: '北西', luckyColor: '白・銀', traits: ['高貴', '理想主義', '完璧主義'] },
  { number: 7, name: '七赤金星', character: 'キツネ', element: '金', direction: '西', luckyColor: 'ピンク・赤', traits: ['社交的', '魅力的', '享楽的'] },
  { number: 8, name: '八白土星', character: 'タイガー', element: '土', direction: '北東', luckyColor: '白・黄', traits: ['変革', '意志強固', '蓄財'] },
  { number: 9, name: '九紫火星', character: 'フェニックス', element: '火', direction: '南', luckyColor: '赤・紫', traits: ['情熱', '直感', '華やか'] },
];

/** 六曜（設計書7.2） */
type Rokuyo = '大安' | '赤口' | '先勝' | '友引' | '先負' | '仏滅';
const ROKUYO_LIST: Rokuyo[] = ['大安', '赤口', '先勝', '友引', '先負', '仏滅'];
const ROKUYO_SCORES: Record<Rokuyo, number> = { '大安': 20, '友引': 10, '先勝': 5, '先負': 0, '赤口': -5, '仏滅': -10 };

/** 九星計算（設計書7.1） */
function calculateKyusei(birthYear: number): number {
  const base = 1900;
  const diff = birthYear - base;
  const kyusei = ((10 - (diff % 9)) % 9) || 9;
  return kyusei;
}

/** 六曜計算（設計書7.2 簡易版） */
function calculateRokuyo(year: number, month: number, day: number): Rokuyo {
  const rokuyoIndex = (month + day) % 6;
  return ROKUYO_LIST[rokuyoIndex];
}

/** 方位吉凶（設計書7.3） */
function calculateLuckyDirection(kyusei: number, dateInfo: DateInfo): string {
  const dayKyusei = ((dateInfo.dayOfYear + 4) % 9) || 9;
  const directionMap: Record<number, string> = {
    1: '北', 2: '南西', 3: '東', 4: '南東', 5: '中央', 6: '北西', 7: '西', 8: '北東', 9: '南'
  };
  const luckyIndex = ((kyusei + dayKyusei) % 9) || 9;
  return directionMap[luckyIndex];
}

/** 運勢アルゴリズム（設計書7.4） */
function calculateHonDoubutsuScore(kyusei: number, dateInfo: DateInfo): number {
  const profile = KYUSEI_PROFILES.find(k => k.number === kyusei)!;
  const rokuyo = calculateRokuyo(dateInfo.year, dateInfo.month, dateInfo.day);
  let score = 60;
  score += ROKUYO_SCORES[rokuyo];
  const dayKyusei = ((dateInfo.dayOfYear + 4) % 9) || 9;
  const kyuseiDiff = Math.abs(kyusei - dayKyusei);
  if (kyuseiDiff === 0) { score += 15; }
  else if (kyuseiDiff === 3 || kyuseiDiff === 6) { score += 10; }
  else if (kyuseiDiff === 4 || kyuseiDiff === 5) { score -= 5; }
  if (profile.element === '水') { score += Math.cos(dateInfo.lunarPhase * Math.PI * 2 / 29.5) * 8; }
  else if (profile.element === '火') { score += Math.sin(dateInfo.lunarPhase * Math.PI * 2 / 29.5) * 5; }
  return Math.round(score);
}

/** 6軸変換（設計書7.5） */
function honDoubutsuToScores(kyusei: number, dateInfo: DateInfo): FortuneScores {
  const base = calculateHonDoubutsuScore(kyusei, dateInfo);
  const profile = KYUSEI_PROFILES.find(k => k.number === kyusei)!;
  const elementBonus: Record<string, Partial<FortuneScores>> = {
    '水': { love: 8, social: 5, health: 5 }, '木': { work: 8, health: 8, social: 3 },
    '火': { love: 10, work: 5, social: 5 }, '土': { money: 10, health: 5, work: 5 },
    '金': { money: 8, work: 8, social: 5 },
  };
  const bonus = elementBonus[profile.element] ?? {};
  const scores: FortuneScores = {
    love: normalizeScore(base + (bonus.love ?? 0), 30, 110),
    work: normalizeScore(base + (bonus.work ?? 0), 30, 110),
    money: normalizeScore(base + (bonus.money ?? 0), 30, 110),
    health: normalizeScore(base + (bonus.health ?? 0), 30, 110),
    social: normalizeScore(base + (bonus.social ?? 0), 30, 110),
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

/** 動物占いプラグイン */
export const honDoubutsuPlugin: FortunePlugin = {
  id: 'honDoubutsu',
  name: '動物占い',
  category: 'free',
  requiresInput: ['birthDate'],

  generate: (date: string, profile?: UserProfile) => {
    const birthDate = profile?.birthDate || '2000-01-01';
    const birthYear = new Date(birthDate).getFullYear();
    const kyusei = calculateKyusei(birthYear);
    const dateInfo = getDateInfo(date);
    const kyuseiProfile = KYUSEI_PROFILES.find(k => k.number === kyusei)!;
    const rokuyo = calculateRokuyo(dateInfo.year, dateInfo.month, dateInfo.day);
    const luckyDirection = calculateLuckyDirection(kyusei, dateInfo);
    const scores = honDoubutsuToScores(kyusei, dateInfo);
    const seed = stringToSeed(`honDoubutsu_${kyusei}_${date}`);
    const rand = seededRandom(seed);

    const details = {
      love: getDetail('love', scores.love, rand),
      work: getDetail('work', scores.work, rand),
      money: getDetail('money', scores.money, rand),
      health: getDetail('health', scores.health, rand),
      social: getDetail('social', scores.social, rand),
      total: `【${kyuseiProfile.character}】${kyuseiProfile.name}（${rokuyo}）`,
    };

    const lucky = { color: kyuseiProfile.luckyColor, item: pickRandom(LUCKY_ITEMS, rand), direction: luckyDirection, number: kyusei };
    const result = createFortuneResult('honDoubutsu', date, scores, details, lucky);
    result.character = { name: kyuseiProfile.character, image: `character_${kyusei}.png` };
    return result;
  },
};

export default honDoubutsuPlugin;
