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

/** 月運アドバイステンプレート（約150文字×6パターン・語尾全て異なる） */
const MONTHLY_ADVICE: Record<'high' | 'mid' | 'low', string[]> = {
  high: [
    '今月は運気が高まっています。積極的に行動することで幸運が舞い込む可能性大。仕事では新しい提案が吉、恋愛面でも出会いのチャンスが増えそう。周囲のサポートも得やすいので、遠慮せず助けを求めてみてください。',
    '運気上昇中！新しいことを始めるのに最適な時期です。温めていたアイデアがあれば実行に移すタイミング。人間関係も良好で、新しい出会いや関係の深まりが期待できます。自分を信じて一歩踏み出しましょう。',
    '周囲のサポートを受けやすい月です。困ったことがあれば素直に相談を。チームワークを大切にすることで大きな成果を出せます。これまでの努力が認められやすい時期なので、感謝の気持ちを伝えることが大切ですね。',
    '絶好調の運気！やりたかったことに挑戦する絶好のチャンス。仕事でもプライベートでも積極性が吉と出ます。新しい人脈も広がりやすい時期。直感を信じて行動することで、予想以上の成果が得られるでしょう。',
    '幸運の波に乗れる月。チャンスは待っているだけでは来ません、自ら掴みに行くことが重要です。コミュニケーションが活発になり、良い情報が入りやすい時期。前向きな姿勢が周囲にも良い影響を与えます。',
    '運気好調で何事もスムーズに進みやすい月。長期的な目標に向けて大きな一歩を踏み出すのに最適な時期と言えるでしょう。周囲からの信頼も高まり、リーダーシップを発揮できそうですよ。',
  ],
  mid: [
    '安定した運気が続く月です。大きな変化は少ないですが、地道な努力が実を結びやすい時期。焦らず着実に進めることで確実な成果を積み重ねられるでしょう。後回しにしていたことを片付けるのもおすすめですね。',
    '準備と計画に時間を使うと良い結果につながる月。今すぐ結果を求めるより、来月以降を見据えた行動を心がけてください。情報収集や人脈づくりに力を入れると後で大きなリターンがあります。',
    'バランスを意識して過ごすことで運気が安定します。仕事とプライベートのメリハリをつけることが大切。人間関係では相手の立場に立って考えると良いコミュニケーションが取れるでしょう。',
    '堅実に過ごすことで運気が安定する月。派手さはなくても、着実に前進できます。小さな目標を立ててクリアしていくことで達成感を得られますよ。日常の中に小さな幸せを見つけてみましょう。',
    '学びと成長の月。新しい知識やスキルを身につけるのに適した時期です。焦って結果を求めず、プロセスを楽しむ姿勢が大切ですね。人との交流から得られるヒントも多いので、会話を楽しんでください。',
    '現状維持がベストな月。無理に変化を求めるより、今あるものを大切にすることで運気が安定します。感謝の気持ちを忘れずに過ごすことで、小さな幸せに気づけるはずです。',
  ],
  low: [
    '慎重に行動することで災いを避けられる時期。大きな決断は少し待ったほうが良いかもしれません。今ある環境や人間関係を大切にしながら、体調管理にも気を配ってください。運気は必ず上向きになります。',
    '無理をせず休息を大切にすべき月。エネルギーを蓄える時期と考えて心身のリフレッシュを優先しましょう。趣味や好きなことに時間を使い、次の飛躍に向けた準備をしておくと良いですね。',
    '来月に向けての準備期間と考えて過ごすのがおすすめです。派手な活動より静かに力を蓄える時期。読書や学習など自己投資に時間を使うと吉。身の回りの整理整頓で気持ちもスッキリするでしょう。',
    '守りの姿勢が大切な月。新しい挑戦は控えめにして、足元を固めることに集中してください。信頼できる人との時間を大切にすることで心が安らぎます。この時期の我慢が、後の成果につながりますよ。',
    '静かに過ごすことで運気の回復を待つ月。焦りは禁物、今は力を蓄える時期です。健康管理を特に意識して、規則正しい生活を心がけることが大切ですね。来月以降の好転に備えておきましょう。',
    '内省の時期として過ごすと良い月です。外に向かうエネルギーより、自分を見つめ直すことに時間を使ってみてください。日記をつけたり、瞑想したりすることで心が落ち着くでしょう。',
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
export function generateMonthlyAdvice(scores: FortuneScores, fortuneId: string, year: number, month: number): string {
  const seed = stringToSeed(`monthly_${fortuneId}_${year}_${month}`);
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

/** 年運アドバイステンプレート（約225文字×6パターン・語尾全て異なる） */
const YEARLY_ADVICE: Record<'high' | 'mid' | 'low', string[]> = {
  high: [
    '飛躍の年！大きな目標に挑戦する絶好のチャンスです。キャリアアップや新しい挑戦を実行に移す時期。恋愛面でも良縁に恵まれやすく、出会いが増えるでしょう。周囲の応援も得やすいので、夢を語り協力を求めてみてください。特に春から夏にかけてが勝負の時期。迷ったら行動を優先することで道が開けます。',
    '運気最高潮！積極的に行動することで大きな成果を得られます。仕事では昇進やプロジェクト成功が期待でき、金運も好調。信頼できる仲間との絆も深まりますよ。好調な時こそ適度な休息を忘れずに。年の後半は特に金運に恵まれやすいので、投資や貯蓄の見直しにも最適な時期と言えます。',
    '人生の転機となる可能性を秘めた年。直感を信じて進むことで幸運が舞い込みます。これまでの努力が実を結び、新しいステージへ進めるでしょう。変化を恐れず受け入れることが大切ですね。年間を通じてアンテナを張り、訪れるチャンスを逃さないように。人との縁が新しい扉を開く鍵になります。',
    '最高の運気に恵まれた年！長年の夢を実現するチャンスが訪れます。行動力と決断力が成功を引き寄せるでしょう。人間関係も充実し、生涯の友や運命の人との出会いも期待できます。この勢いを活かして、年の前半に大きな決断をすると良い結果につながりやすいです。自分の可能性を信じて挑戦を。',
    '願いが叶いやすい年。目標を明確にして行動することで、驚くほどの成果が得られますよ。周囲からの評価も高まり、責任ある立場を任される可能性も。自信を持って前に進みましょう。特に対人運が好調なので、新しいコミュニティへの参加や人脈拡大が幸運を引き寄せる鍵になります。',
    'チャンスの年！新しいことへの挑戦が吉と出ます。起業や転職、結婚など大きな決断にも最適な時期です。あなたの魅力が最大限に発揮され、多くの人を惹きつけることができるはずです。年間を通して運気が安定しているので、計画的に物事を進めることで確実に成果を積み上げていけます。',
  ],
  mid: [
    '安定した運気に恵まれ、基盤固めに最適な年。派手な成功より着実な成長を目指しましょう。スキルアップや資格取得が将来への投資になります。既存の人間関係を大切にすることで信頼が深まるでしょう。焦らず一歩一歩進むことで、来年以降の大きな飛躍につながる土台を築けます。',
    '着実な成長が見込める年。コツコツとした努力が報われますよ。日々の積み重ねが大きな力に。新しいスキル習得や人脈拡大など自己投資がおすすめ。良い習慣を身につけるチャンスでもありますね。健康面にも気を配り、規則正しい生活を心がけることで、年間を通じて安定したパフォーマンスを発揮できます。',
    '準備と学びの年として、来年への布石を打ってください。興味のある分野の勉強や人脈づくりで将来のチャンスが広がります。自分自身と向き合い、本当にやりたいことを見つめ直す良い機会です。今年蒔いた種は必ず芽を出します。目先の結果に一喜一憂せず、長期的な視点で行動することが重要です。',
    '地に足のついた成長ができる年。華やかさより実力を蓄える時期ですね。読書や勉強、健康習慣の改善など、自分を高める活動が実を結ぶでしょう。周囲との信頼関係も着実に築いていけます。特に秋以降は学びの成果が出やすい時期。資格試験やスキルアップに挑戦するなら後半がおすすめです。',
    'バランスの取れた一年になりそう。仕事とプライベート、活動と休息のメリハリを意識して過ごすことが大切です。中長期的な計画を立てて行動することで、来年以降の飛躍につながるでしょう。年の中盤で一度立ち止まり、目標の見直しや軌道修正をすることで、より充実した後半を過ごせます。',
    '種まきの年。今すぐ結果を求めるより、将来に向けた準備に力を入れると吉。人脈づくりやスキルアップに時間を投資することで、後に大きなリターンが得られるはずですよ。新しい趣味や学びを始めるのにも最適な時期。視野を広げることで、思わぬところから幸運が訪れることもあります。',
  ],
  low: [
    '充電の年。無理をせず自分を見つめ直す時期として過ごしてください。大きな挑戦は控えめに、今ある環境で力を蓄えましょう。心身の健康を優先し、趣味でリフレッシュすると良いですね。この時期に十分な休息を取ることで、来年以降のエネルギーが満たされます。焦らず自分のペースで過ごしましょう。',
    '慎重に過ごすことで災いを避けられる年。大きな決断は控えめに、リスクを最小限に抑えることが大切です。本当に大切な人との関係を深めることに集中しましょう。守りに徹すれば着実に乗り越えられます。年の後半から徐々に運気が回復してくるので、それまでは無理をせず穏やかに過ごすことを心がけて。',
    '内省の年として心身のケアを優先してください。自分の内面と向き合う時間を大切に。瞑想や日記など心を落ち着ける習慣がおすすめですよ。この時期の気づきは将来の糧になるでしょう。自分自身を深く理解することで、次のステップへの準備が整います。一人の時間を大切にしてみてください。',
    '休息と回復の年。頑張りすぎず、自分を労わることが大切ですね。健康診断や生活習慣の見直しなど、体のメンテナンスに時間を使いましょう。エネルギーを蓄えることで来年の飛躍につながります。睡眠や食事など基本的な生活習慣を整えることが、心身のバランスを保つ鍵になります。',
    '静かに力を蓄える年。外向きの活動より内面の充実を意識して過ごすと良いでしょう。本を読んだり、資格の勉強をしたりと自己投資の時期です。この時期の学びが将来の大きな武器になりますよ。今は目立った成果が出なくても、コツコツと積み重ねたものは必ず将来報われます。',
    '守りの姿勢が吉の年。新しい挑戦より現状の維持・改善に力を注いでください。大切な人との絆を深め、感謝の気持ちを伝えることで心が満たされるでしょう。焦らずこの時期を乗り越えれば光が見えてきます。家族や親しい友人との時間を大切にすることで、心の安定を得られます。',
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

/** 年運アドバイスを生成 */
export function generateYearlyAdvice(scores: FortuneScores, fortuneId: string, year: number): string {
  const seed = stringToSeed(`yearly_advice_${fortuneId}_${year}`);
  const rand = seededRandom(seed);
  const level = scores.total >= 65 ? 'high' : scores.total >= 40 ? 'mid' : 'low';
  return pickRandom(YEARLY_ADVICE[level], rand);
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
