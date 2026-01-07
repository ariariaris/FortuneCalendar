// Fortune Calendar 手相解析サービス v1.0
// 注: 現在はモック実装。将来的にTensorFlow.js Hand Poseに置き換え予定
import { imageUriToSeed, seededRandom, pickRandom, normalizeScore, simulateAnalysisDelay } from '../utils/imageUtils';

/** 線の結果 */
export interface LineResult {
  exists: boolean;
  length: 'short' | 'medium' | 'long';
  depth: 'shallow' | 'normal' | 'deep';
  characteristics: string[];
  interpretation: string;
  score: number;
}

/** 手相解析結果 */
export interface PalmReadingResult {
  imageUri: string;
  handSide: 'left' | 'right';
  analyzedAt: Date;
  lines: {
    lifeLine: LineResult;
    headLine: LineResult;
    heartLine: LineResult;
    fateLine: LineResult;
    sunLine: LineResult;
    marriageLine: LineResult;
  };
  overallScore: number;
  overallReading: string;
}

/** 線の判定データ */
const LINE_DATA: Record<string, {
  lengths: Array<'short' | 'medium' | 'long'>;
  depths: Array<'shallow' | 'normal' | 'deep'>;
  interpretations: Record<string, string>;
}> = {
  lifeLine: {
    lengths: ['short', 'medium', 'long'],
    depths: ['shallow', 'normal', 'deep'],
    interpretations: {
      'long-deep': '生命力旺盛！健康運に恵まれ、長寿の相です',
      'long-normal': '安定した健康運。規則正しい生活が吉',
      'long-shallow': '繊細な体質。休息を大切に',
      'medium-deep': 'バランスの取れた健康運',
      'medium-normal': '平均的な生命力。体調管理を意識して',
      'medium-shallow': '無理をしない生活を心がけて',
      'short-deep': '集中力のある生命力',
      'short-normal': '効率的なエネルギーの使い方ができる',
      'short-shallow': '自分のペースを大切に',
    },
  },
  headLine: {
    lengths: ['short', 'medium', 'long'],
    depths: ['shallow', 'normal', 'deep'],
    interpretations: {
      'long-deep': '優れた知性と深い思考力の持ち主',
      'long-normal': '論理的で分析力がある',
      'long-shallow': '柔軟な発想ができる',
      'medium-deep': '実践的な知恵がある',
      'medium-normal': 'バランスの取れた思考力',
      'medium-shallow': '直感的な判断力がある',
      'short-deep': '集中力が高く、専門分野に強い',
      'short-normal': '即断即決タイプ',
      'short-shallow': '行動派で実践的',
    },
  },
  heartLine: {
    lengths: ['short', 'medium', 'long'],
    depths: ['shallow', 'normal', 'deep'],
    interpretations: {
      'long-deep': '情熱的で愛情深い。深い絆を築ける',
      'long-normal': '安定した恋愛運。誠実な関係を築ける',
      'long-shallow': '繊細な感性。相手の気持ちに敏感',
      'medium-deep': '情熱と理性のバランスが良い',
      'medium-normal': '穏やかな愛情表現ができる',
      'medium-shallow': '控えめな愛情表現',
      'short-deep': '一途で情熱的',
      'short-normal': '現実的な恋愛観',
      'short-shallow': '独立心が強い',
    },
  },
  fateLine: {
    lengths: ['short', 'medium', 'long'],
    depths: ['shallow', 'normal', 'deep'],
    interpretations: {
      'long-deep': '強い運命線！人生の目標が明確',
      'long-normal': '着実なキャリアを築ける',
      'long-shallow': '柔軟なキャリアパス',
      'medium-deep': '中年期に運気上昇',
      'medium-normal': '安定した仕事運',
      'medium-shallow': '自由なキャリア選択',
      'short-deep': '短期集中で成果を出す',
      'short-normal': '変化に富んだキャリア',
      'short-shallow': '自分らしい道を歩む',
    },
  },
  sunLine: {
    lengths: ['short', 'medium', 'long'],
    depths: ['shallow', 'normal', 'deep'],
    interpretations: {
      'long-deep': '大きな成功と名声を得られる相',
      'long-normal': '着実に評価を得られる',
      'long-shallow': '内面的な充実感',
      'medium-deep': '専門分野で認められる',
      'medium-normal': '周囲から信頼される',
      'medium-shallow': '穏やかな幸福感',
      'short-deep': '短期間での成功の可能性',
      'short-normal': '小さな成功を積み重ねる',
      'short-shallow': '自分なりの満足感',
    },
  },
  marriageLine: {
    lengths: ['short', 'medium', 'long'],
    depths: ['shallow', 'normal', 'deep'],
    interpretations: {
      'long-deep': '深い愛情で結ばれる。長い結婚生活',
      'long-normal': '安定した結婚運',
      'long-shallow': '穏やかなパートナーシップ',
      'medium-deep': '情熱的な結婚',
      'medium-normal': 'バランスの取れた結婚生活',
      'medium-shallow': '自由を大切にする関係',
      'short-deep': '強い絆で結ばれる',
      'short-normal': '現実的な結婚観',
      'short-shallow': '独立心を保った関係',
    },
  },
};

/** 手相を解析（モック実装） */
export async function analyzePalm(imageUri: string, handSide: 'left' | 'right' = 'right'): Promise<PalmReadingResult> {
  await simulateAnalysisDelay(1500);

  const seed = imageUriToSeed(imageUri);
  const rand = seededRandom(seed);

  const analyzeLine = (key: string): LineResult => {
    const data = LINE_DATA[key];
    const length = pickRandom(data.lengths, rand);
    const depth = pickRandom(data.depths, rand);
    const interpretationKey = `${length}-${depth}`;
    const score = normalizeScore(40 + Math.floor(rand() * 50));

    return {
      exists: true,
      length,
      depth,
      characteristics: [length === 'long' ? '長い' : length === 'short' ? '短い' : '中程度', depth === 'deep' ? '深い' : depth === 'shallow' ? '浅い' : '普通'],
      interpretation: data.interpretations[interpretationKey] || '判定中',
      score,
    };
  };

  const lines = {
    lifeLine: analyzeLine('lifeLine'),
    headLine: analyzeLine('headLine'),
    heartLine: analyzeLine('heartLine'),
    fateLine: analyzeLine('fateLine'),
    sunLine: analyzeLine('sunLine'),
    marriageLine: analyzeLine('marriageLine'),
  };

  const allScores = Object.values(lines).map(l => l.score);
  const overallScore = Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length);

  const overallReadings = [
    'バランスの取れた手相です。各方面で安定した運気があります。',
    '生命力と知性のバランスが良い手相です。健康に恵まれるでしょう。',
    '感情豊かで愛情深い手相です。人間関係に恵まれます。',
    'キャリア運が強い手相です。仕事で成功を収められるでしょう。',
    '創造性に富んだ手相です。芸術的な才能があります。',
  ];

  return {
    imageUri,
    handSide,
    analyzedAt: new Date(),
    lines,
    overallScore,
    overallReading: pickRandom(overallReadings, rand),
  };
}
