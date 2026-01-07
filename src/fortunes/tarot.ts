// Fortune Calendar タロット占い v1.1
import { FortunePlugin, createFortuneResult } from './types';
import { normalizeScore, calculateTotal, finalizeScores, pickRandom, LUCKY_COLORS, LUCKY_ITEMS, generateSeed, seededRandom } from '../utils/fortuneLogic';
import { UserProfile, FortuneScores } from '../config/types';

/** タロットカード（設計書6.1） */
interface TarotCard {
  id: number;
  name: string;
  nameJa: string;
  upright: string;
  reversed: string;
  scores: { love: number; work: number; money: number; health: number; social: number };
}

const MAJOR_ARCANA: TarotCard[] = [
  { id: 0, name: 'The Fool', nameJa: '愚者', upright: '自由・冒険', reversed: '無謀・軽率', scores: { love: 5, work: -5, money: -10, health: 0, social: 10 } },
  { id: 1, name: 'The Magician', nameJa: '魔術師', upright: '創造・意志', reversed: '詐欺・未熟', scores: { love: 5, work: 15, money: 10, health: 5, social: 5 } },
  { id: 2, name: 'The High Priestess', nameJa: '女教皇', upright: '直感・神秘', reversed: '秘密・冷淡', scores: { love: 10, work: 5, money: 0, health: 10, social: -5 } },
  { id: 3, name: 'The Empress', nameJa: '女帝', upright: '豊穣・愛情', reversed: '過保護・虚栄', scores: { love: 20, work: 5, money: 15, health: 10, social: 10 } },
  { id: 4, name: 'The Emperor', nameJa: '皇帝', upright: '権威・安定', reversed: '支配・横暴', scores: { love: 0, work: 20, money: 15, health: 5, social: 5 } },
  { id: 5, name: 'The Hierophant', nameJa: '教皇', upright: '伝統・教え', reversed: '独善・形式', scores: { love: 5, work: 10, money: 5, health: 5, social: 15 } },
  { id: 6, name: 'The Lovers', nameJa: '恋人', upright: '愛・選択', reversed: '不和・誘惑', scores: { love: 20, work: 0, money: 0, health: 5, social: 15 } },
  { id: 7, name: 'The Chariot', nameJa: '戦車', upright: '勝利・前進', reversed: '暴走・挫折', scores: { love: 5, work: 20, money: 10, health: 10, social: 5 } },
  { id: 8, name: 'Strength', nameJa: '力', upright: '勇気・忍耐', reversed: '弱気・強制', scores: { love: 10, work: 15, money: 5, health: 20, social: 5 } },
  { id: 9, name: 'The Hermit', nameJa: '隠者', upright: '内省・知恵', reversed: '孤立・頑固', scores: { love: -10, work: 10, money: 0, health: 15, social: -10 } },
  { id: 10, name: 'Wheel of Fortune', nameJa: '運命の輪', upright: '転機・幸運', reversed: '不運・停滞', scores: { love: 10, work: 10, money: 15, health: 5, social: 10 } },
  { id: 11, name: 'Justice', nameJa: '正義', upright: '公正・均衡', reversed: '不正・偏見', scores: { love: 5, work: 15, money: 10, health: 5, social: 10 } },
  { id: 12, name: 'The Hanged Man', nameJa: '吊るされた男', upright: '試練・忍耐', reversed: '無駄・利己', scores: { love: 0, work: -5, money: -10, health: 5, social: 0 } },
  { id: 13, name: 'Death', nameJa: '死神', upright: '終焉・変容', reversed: '停滞・執着', scores: { love: -5, work: 5, money: -5, health: 0, social: -5 } },
  { id: 14, name: 'Temperance', nameJa: '節制', upright: '調和・節度', reversed: '不調和・浪費', scores: { love: 10, work: 10, money: 5, health: 15, social: 10 } },
  { id: 15, name: 'The Devil', nameJa: '悪魔', upright: '欲望・束縛', reversed: '解放・覚醒', scores: { love: -10, work: 5, money: 10, health: -15, social: -10 } },
  { id: 16, name: 'The Tower', nameJa: '塔', upright: '崩壊・衝撃', reversed: '変化回避・破壊', scores: { love: -15, work: -10, money: -15, health: -10, social: -10 } },
  { id: 17, name: 'The Star', nameJa: '星', upright: '希望・癒し', reversed: '失望・悲観', scores: { love: 15, work: 10, money: 10, health: 15, social: 15 } },
  { id: 18, name: 'The Moon', nameJa: '月', upright: '不安・直感', reversed: '混乱・欺瞞', scores: { love: 0, work: -5, money: -5, health: 5, social: -5 } },
  { id: 19, name: 'The Sun', nameJa: '太陽', upright: '成功・喜び', reversed: '延期・傲慢', scores: { love: 20, work: 20, money: 15, health: 20, social: 20 } },
  { id: 20, name: 'Judgement', nameJa: '審判', upright: '復活・決断', reversed: '後悔・優柔', scores: { love: 10, work: 15, money: 5, health: 10, social: 10 } },
  { id: 21, name: 'The World', nameJa: '世界', upright: '完成・達成', reversed: '未完・停滞', scores: { love: 15, work: 20, money: 15, health: 15, social: 15 } },
];

/** ドロー結果（設計書6.2） */
interface TarotDraw { card: TarotCard; isReversed: boolean; position: string; }

/** 3枚ドロー（設計書6.2） */
function drawTarotCards(seed: number): TarotDraw[] {
  const random = seededRandom(seed);
  const deck = [...MAJOR_ARCANA];
  const draws: TarotDraw[] = [];
  const positions = ['現在', 'アドバイス', '結末'];
  for (let i = 0; i < 3 && deck.length > 0; i++) {
    const index = Math.floor(random() * deck.length);
    const card = deck.splice(index, 1)[0];
    draws.push({ card, isReversed: random() < 0.3, position: positions[i] });
  }
  return draws;
}

/** 6軸変換（設計書6.3） */
function tarotToScores(draws: TarotDraw[]): FortuneScores {
  const scores: FortuneScores = { love: 60, work: 60, money: 60, health: 60, social: 60, total: 0 };
  for (const draw of draws) {
    const multiplier = draw.isReversed ? -0.5 : 1;
    const positionWeight = draw.position === '現在' ? 1.2 : draw.position === '結末' ? 1.0 : 0.8;
    for (const key of ['love', 'work', 'money', 'health', 'social'] as const) {
      scores[key] += draw.card.scores[key] * multiplier * positionWeight;
    }
  }
  for (const key of ['love', 'work', 'money', 'health', 'social'] as const) {
    scores[key] = normalizeScore(scores[key], 0, 120);
  }
  scores.total = calculateTotal(scores);
  return finalizeScores(scores);
}

/** タロット占いプラグイン */
export const tarotPlugin: FortunePlugin = {
  id: 'tarot',
  name: 'タロット',
  category: 'free',
  requiresInput: [],

  generate: (date: string, profile?: UserProfile) => {
    const userId = profile?.birthDate || 'anonymous';
    const seed = generateSeed(date, userId);
    const draws = drawTarotCards(seed);
    const scores = tarotToScores(draws);
    const rand = seededRandom(seed + 1000);

    const mainCard = draws[0];
    const position = mainCard.isReversed ? '逆位置' : '正位置';
    const meaning = mainCard.isReversed ? mainCard.card.reversed : mainCard.card.upright;

    const details = {
      love: `${draws.find(d => d.position === '現在')?.card.nameJa}が導く恋愛運`,
      work: `${draws.find(d => d.position === 'アドバイス')?.card.nameJa}からの仕事のアドバイス`,
      money: `金運: ${mainCard.isReversed ? '慎重に' : '良い流れ'}`,
      health: `健康: ${scores.health >= 60 ? '良好' : '休息を'}`,
      social: `対人: ${meaning}を意識して`,
      total: `【${mainCard.card.nameJa}】${position} - ${meaning}`,
    };

    const lucky = { color: pickRandom(LUCKY_COLORS, rand), item: pickRandom(LUCKY_ITEMS, rand) };
    return createFortuneResult('tarot', date, scores, details, lucky);
  },
};

export default tarotPlugin;
