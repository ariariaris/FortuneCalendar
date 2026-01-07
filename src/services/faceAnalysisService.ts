// Fortune Calendar 顔相解析サービス v1.0
// 注: 現在はモック実装。将来的にMediaPipe Face Meshに置き換え予定
import { imageUriToSeed, seededRandom, pickRandom, normalizeScore, simulateAnalysisDelay } from '../utils/imageUtils';

/** 顔の部位結果 */
export interface FeatureResult {
  category: string;
  value: string;
  interpretation: string;
  score: number;
}

/** 顔相解析結果 */
export interface FaceReadingResult {
  imageUri: string;
  analyzedAt: Date;
  features: {
    forehead: FeatureResult;
    eyebrows: FeatureResult;
    eyes: FeatureResult;
    nose: FeatureResult;
    mouth: FeatureResult;
    ears: FeatureResult;
    chin: FeatureResult;
    cheeks: FeatureResult;
    nasolabialFolds: FeatureResult;
    philtrum: FeatureResult;
    glabella: FeatureResult;
    eyeCorners: FeatureResult;
    tearTrough: FeatureResult;
    faceShape: FeatureResult;
    skinQuality: FeatureResult;
    symmetry: FeatureResult;
  };
  overallScore: number;
  overallReading: string;
}

/** 部位別の判定データ */
const FEATURE_DATA: Record<string, { values: string[]; interpretations: Record<string, string> }> = {
  forehead: {
    values: ['広い', '狭い', '普通', '丸い', '角ばった'],
    interpretations: { '広い': '知性・計画性が高い', '狭い': '直感的・行動派', '普通': 'バランスの取れた思考', '丸い': '穏やかな性格', '角ばった': '論理的思考が得意' },
  },
  eyebrows: {
    values: ['濃い', '薄い', '太い', '細い', 'アーチ型', '直線型'],
    interpretations: { '濃い': '意志が強い', '薄い': '繊細な心の持ち主', '太い': 'リーダーシップがある', '細い': '美的感覚が鋭い', 'アーチ型': '社交的', '直線型': '合理的な判断力' },
  },
  eyes: {
    values: ['大きい', '小さい', '切れ長', '丸い', 'アーモンド型'],
    interpretations: { '大きい': '好奇心旺盛・直感力が高い', '小さい': '集中力が高い', '切れ長': '知的で洞察力がある', '丸い': '愛情深い性格', 'アーモンド型': 'バランスの取れた観察力' },
  },
  nose: {
    values: ['高い', '低い', 'まっすぐ', '鷲鼻', '団子鼻'],
    interpretations: { '高い': '自尊心が高く金運良好', '低い': '協調性がある', 'まっすぐ': '正直で誠実', '鷲鼻': 'ビジネスセンスがある', '団子鼻': '人懐っこい性格' },
  },
  mouth: {
    values: ['大きい', '小さい', '厚い唇', '薄い唇', '上向き'],
    interpretations: { '大きい': '表現力豊か・行動力がある', '小さい': '慎重で控えめ', '厚い唇': '愛情深い', '薄い唇': '知的で論理的', '上向き': 'ポジティブな性格' },
  },
  ears: {
    values: ['大きい', '小さい', '長い', '丸い', '尖った'],
    interpretations: { '大きい': '長寿・財運に恵まれる', '小さい': '繊細な感性', '長い': '知恵者', '丸い': '温厚な性格', '尖った': '直感が鋭い' },
  },
  chin: {
    values: ['しっかりした', '細い', '丸い', '角ばった', '尖った'],
    interpretations: { 'しっかりした': '意志力・行動力がある', '細い': '芸術的センスがある', '丸い': '穏やかで協調的', '角ばった': '決断力がある', '尖った': '繊細で感受性豊か' },
  },
  cheeks: {
    values: ['ふっくら', 'すっきり', '高い頬骨', '丸い'],
    interpretations: { 'ふっくら': '社交性があり人気者', 'すっきり': 'シャープな判断力', '高い頬骨': 'リーダーシップがある', '丸い': '愛嬌があり好かれやすい' },
  },
  nasolabialFolds: {
    values: ['深い', '浅い', '長い', '短い'],
    interpretations: { '深い': '統率力・威厳がある', '浅い': '若々しいエネルギー', '長い': '経験豊富', '短い': '純粋な心' },
  },
  philtrum: {
    values: ['深い', '浅い', '長い', '短い'],
    interpretations: { '深い': '生命力旺盛・子宝運あり', '浅い': '繊細な体質', '長い': '長寿の相', '短い': '行動的' },
  },
  glabella: {
    values: ['広い', '狭い', '平ら', 'くぼんだ'],
    interpretations: { '広い': '度量が大きい・器が大きい', '狭い': '集中力が高い', '平ら': '安定した性格', 'くぼんだ': '深く考える性格' },
  },
  eyeCorners: {
    values: ['上がり目', '下がり目', '平行'],
    interpretations: { '上がり目': '野心的・上昇志向', '下がり目': '優しく親しみやすい', '平行': 'バランスの取れた性格' },
  },
  tearTrough: {
    values: ['ある', 'ほとんどない', 'ふっくら'],
    interpretations: { 'ある': '子供運・愛嬌がある', 'ほとんどない': 'シャープな印象', 'ふっくら': '人気運が高い' },
  },
  faceShape: {
    values: ['丸顔', '面長', '四角顔', '逆三角', '卵型'],
    interpretations: { '丸顔': '社交的で明るい性格', '面長': '知的で落ち着いた性格', '四角顔': '意志が強く責任感がある', '逆三角': '感受性豊かで繊細', '卵型': 'バランスの取れた性格' },
  },
  skinQuality: {
    values: ['ツヤがある', '透明感がある', '健康的', '落ち着いた'],
    interpretations: { 'ツヤがある': '活力・健康運良好', '透明感がある': '精神的な清らかさ', '健康的': '体調が安定している', '落ち着いた': '内面の充実' },
  },
  symmetry: {
    values: ['対称的', 'やや非対称', '個性的'],
    interpretations: { '対称的': 'バランス・調和がとれている', 'やや非対称': '個性的な魅力', '個性的': 'ユニークな才能' },
  },
};

/** 顔相を解析（モック実装） */
export async function analyzeFace(imageUri: string): Promise<FaceReadingResult> {
  // 解析遅延シミュレーション
  await simulateAnalysisDelay(1500);

  const seed = imageUriToSeed(imageUri);
  const rand = seededRandom(seed);

  // 各部位を解析
  const analyzeFeature = (key: string): FeatureResult => {
    const data = FEATURE_DATA[key];
    const value = pickRandom(data.values, rand);
    const score = normalizeScore(40 + Math.floor(rand() * 50)); // 40-90
    return {
      category: key,
      value,
      interpretation: data.interpretations[value] || '判定中',
      score,
    };
  };

  const features = {
    forehead: analyzeFeature('forehead'),
    eyebrows: analyzeFeature('eyebrows'),
    eyes: analyzeFeature('eyes'),
    nose: analyzeFeature('nose'),
    mouth: analyzeFeature('mouth'),
    ears: analyzeFeature('ears'),
    chin: analyzeFeature('chin'),
    cheeks: analyzeFeature('cheeks'),
    nasolabialFolds: analyzeFeature('nasolabialFolds'),
    philtrum: analyzeFeature('philtrum'),
    glabella: analyzeFeature('glabella'),
    eyeCorners: analyzeFeature('eyeCorners'),
    tearTrough: analyzeFeature('tearTrough'),
    faceShape: analyzeFeature('faceShape'),
    skinQuality: analyzeFeature('skinQuality'),
    symmetry: analyzeFeature('symmetry'),
  };

  // 総合スコア計算
  const allScores = Object.values(features).map(f => f.score);
  const overallScore = Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length);

  // 総合診断文生成
  const overallReadings = [
    'バランスの取れた運勢の持ち主です。特に対人運に恵まれています。',
    '知性と行動力を兼ね備えた相です。チャンスを掴む力があります。',
    '穏やかで温かい人柄が表れています。周囲からの信頼が厚いでしょう。',
    '直感力に優れた相です。自分の感覚を信じることで道が開けます。',
    'リーダーシップの相が見られます。人を導く力があります。',
  ];

  return {
    imageUri,
    analyzedAt: new Date(),
    features,
    overallScore,
    overallReading: pickRandom(overallReadings, rand),
  };
}
