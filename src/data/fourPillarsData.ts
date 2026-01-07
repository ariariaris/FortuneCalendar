// Fortune Calendar 四柱推命マスタデータ v1.0

/** 天干（十干） */
export const HEAVENLY_STEMS = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'] as const;
export type HeavenlyStem = typeof HEAVENLY_STEMS[number];

/** 地支（十二支） */
export const EARTHLY_BRANCHES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'] as const;
export type EarthlyBranch = typeof EARTHLY_BRANCHES[number];

/** 五行 */
export const FIVE_ELEMENTS = ['木', '火', '土', '金', '水'] as const;
export type FiveElement = typeof FIVE_ELEMENTS[number];

/** 天干の五行 */
export const STEM_ELEMENTS: Record<HeavenlyStem, FiveElement> = {
  '甲': '木', '乙': '木', '丙': '火', '丁': '火', '戊': '土',
  '己': '土', '庚': '金', '辛': '金', '壬': '水', '癸': '水',
};

/** 天干の陰陽（0=陽、1=陰） */
export const STEM_YIN_YANG: Record<HeavenlyStem, 0 | 1> = {
  '甲': 0, '乙': 1, '丙': 0, '丁': 1, '戊': 0,
  '己': 1, '庚': 0, '辛': 1, '壬': 0, '癸': 1,
};

/** 地支の五行 */
export const BRANCH_ELEMENTS: Record<EarthlyBranch, FiveElement> = {
  '子': '水', '丑': '土', '寅': '木', '卯': '木', '辰': '土', '巳': '火',
  '午': '火', '未': '土', '申': '金', '酉': '金', '戌': '土', '亥': '水',
};

/** 通変星 */
export const TSUHENSEI = ['比肩', '劫財', '食神', '傷官', '偏財', '正財', '偏官', '正官', '偏印', '印綬'] as const;
export type Tsuhensei = typeof TSUHENSEI[number];

/** 十二運 */
export const TWELVE_STAGES = ['長生', '沐浴', '冠帯', '建禄', '帝旺', '衰', '病', '死', '墓', '絶', '胎', '養'] as const;
export type TwelveStage = typeof TWELVE_STAGES[number];

/** 日干の性格特徴 */
export const DAY_STEM_TRAITS: Record<HeavenlyStem, string> = {
  '甲': '正義感が強く、真っ直ぐな性格。リーダーシップがある。',
  '乙': '柔軟で適応力が高い。協調性があり、周囲と調和できる。',
  '丙': '明るく情熱的。社交的で人を惹きつける魅力がある。',
  '丁': '繊細で思慮深い。芸術的センスがあり、直感力に優れる。',
  '戊': '安定感があり、信頼される。忍耐強く、着実に物事を進める。',
  '己': '面倒見が良く、優しい。細やかな気配りができる。',
  '庚': '決断力があり、行動的。正義感が強く、困難に立ち向かう。',
  '辛': '美的感覚に優れ、繊細。完璧主義で、細部にこだわる。',
  '壬': '知性的で柔軟。大きな視野を持ち、変化を恐れない。',
  '癸': '直感力が鋭く、感受性が豊か。内面が深く、神秘的な魅力。',
};

/** 通変星の意味 */
export const TSUHENSEI_MEANINGS: Record<Tsuhensei, string> = {
  '比肩': '自立心・独立心が強い',
  '劫財': '積極的で行動力がある',
  '食神': '才能豊かで表現力がある',
  '傷官': '感性が鋭く創造的',
  '偏財': '社交的で人脈が広い',
  '正財': '堅実で安定志向',
  '偏官': 'リーダーシップがある',
  '正官': '責任感が強く信頼される',
  '偏印': '独創的で探究心がある',
  '印綬': '知性的で学問に優れる',
};

/** 十二運の意味 */
export const TWELVE_STAGE_MEANINGS: Record<TwelveStage, string> = {
  '長生': '発展・成長の運気',
  '沐浴': '変化・転機の時期',
  '冠帯': '活力・上昇の運気',
  '建禄': '安定・充実の時期',
  '帝旺': '最盛期・頂点の運気',
  '衰': '穏やかに過ごす時期',
  '病': '休息・充電の時期',
  '死': '終息・準備の時期',
  '墓': '蓄積・準備の時期',
  '絶': '転換期・新たな始まり',
  '胎': '計画・構想の時期',
  '養': '準備・育成の時期',
};

/** 節気データ（簡略版） */
export const SOLAR_TERMS: Array<{ month: number; day: number; name: string }> = [
  { month: 2, day: 4, name: '立春' },
  { month: 3, day: 6, name: '啓蟄' },
  { month: 4, day: 5, name: '清明' },
  { month: 5, day: 6, name: '立夏' },
  { month: 6, day: 6, name: '芒種' },
  { month: 7, day: 7, name: '小暑' },
  { month: 8, day: 8, name: '立秋' },
  { month: 9, day: 8, name: '白露' },
  { month: 10, day: 8, name: '寒露' },
  { month: 11, day: 7, name: '立冬' },
  { month: 12, day: 7, name: '大雪' },
  { month: 1, day: 6, name: '小寒' },
];
