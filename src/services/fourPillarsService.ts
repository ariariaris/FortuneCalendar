// Fortune Calendar 四柱推命計算サービス v1.0
import {
  HEAVENLY_STEMS, EARTHLY_BRANCHES, STEM_ELEMENTS, STEM_YIN_YANG,
  BRANCH_ELEMENTS, TSUHENSEI, TWELVE_STAGES, DAY_STEM_TRAITS,
  TSUHENSEI_MEANINGS, TWELVE_STAGE_MEANINGS, SOLAR_TERMS,
  HeavenlyStem, EarthlyBranch, FiveElement, Tsuhensei, TwelveStage,
} from '../data/fourPillarsData';

/** 柱データ */
export interface Pillar {
  stem: HeavenlyStem;
  branch: EarthlyBranch;
  tsuhensei?: Tsuhensei;
  twelveStage?: TwelveStage;
}

/** 四柱推命結果 */
export interface FourPillarsResult {
  birthDateTime: Date;
  pillars: { year: Pillar; month: Pillar; day: Pillar; hour: Pillar };
  dayStem: HeavenlyStem;
  dayElement: FiveElement;
  fiveElements: Record<FiveElement, number>;
  interpretation: string;
  dayStemTrait: string;
}

/** 六十干支を生成 */
function generateSixtyJiazi(): Array<{ stem: HeavenlyStem; branch: EarthlyBranch }> {
  const result: Array<{ stem: HeavenlyStem; branch: EarthlyBranch }> = [];
  for (let i = 0; i < 60; i++) {
    result.push({
      stem: HEAVENLY_STEMS[i % 10],
      branch: EARTHLY_BRANCHES[i % 12],
    });
  }
  return result;
}
const SIXTY_JIAZI = generateSixtyJiazi();

/** 日柱計算（基準日からの日数で算出） */
function calculateDayPillar(year: number, month: number, day: number): Pillar {
  const baseDate = new Date(1900, 0, 31); // 1900年1月31日 = 甲子
  const targetDate = new Date(year, month - 1, day);
  const diffDays = Math.floor((targetDate.getTime() - baseDate.getTime()) / (1000 * 60 * 60 * 24));
  const index = ((diffDays % 60) + 60) % 60;
  return SIXTY_JIAZI[index];
}

/** 年柱計算（立春を年の境界とする） */
function calculateYearPillar(year: number, month: number, day: number): Pillar {
  let adjustedYear = year;
  // 立春前は前年として計算
  if (month < 2 || (month === 2 && day < 4)) {
    adjustedYear--;
  }
  const index = ((adjustedYear - 4) % 60 + 60) % 60;
  return SIXTY_JIAZI[index];
}

/** 月柱計算 */
function calculateMonthPillar(year: number, month: number, day: number): Pillar {
  // 節気による月の調整
  let lunarMonth = month;
  const term = SOLAR_TERMS.find(t => t.month === month);
  if (term && day < term.day) {
    lunarMonth = month === 1 ? 12 : month - 1;
  }

  const yearPillar = calculateYearPillar(year, month, day);
  const yearStemIndex = HEAVENLY_STEMS.indexOf(yearPillar.stem);

  // 月干の計算（年干から導出）
  const monthStemBase = (yearStemIndex % 5) * 2;
  const monthStemIndex = (monthStemBase + (lunarMonth - 1) + 2) % 10;
  const monthBranchIndex = (lunarMonth + 1) % 12;

  return {
    stem: HEAVENLY_STEMS[monthStemIndex],
    branch: EARTHLY_BRANCHES[monthBranchIndex],
  };
}

/** 時柱計算 */
function calculateHourPillar(dayStem: HeavenlyStem, hour: number): Pillar {
  const hourBranchIndex = Math.floor((hour + 1) / 2) % 12;
  const dayStemIndex = HEAVENLY_STEMS.indexOf(dayStem);
  const hourStemBase = (dayStemIndex % 5) * 2;
  const hourStemIndex = (hourStemBase + hourBranchIndex) % 10;

  return {
    stem: HEAVENLY_STEMS[hourStemIndex],
    branch: EARTHLY_BRANCHES[hourBranchIndex],
  };
}

/** 通変星を計算 */
function calculateTsuhensei(dayStem: HeavenlyStem, targetStem: HeavenlyStem): Tsuhensei {
  const dayElement = STEM_ELEMENTS[dayStem];
  const targetElement = STEM_ELEMENTS[targetStem];
  const dayYinYang = STEM_YIN_YANG[dayStem];
  const targetYinYang = STEM_YIN_YANG[targetStem];
  const sameYinYang = dayYinYang === targetYinYang;

  const elements: FiveElement[] = ['木', '火', '土', '金', '水'];
  const dayIndex = elements.indexOf(dayElement);
  const targetIndex = elements.indexOf(targetElement);
  const diff = (targetIndex - dayIndex + 5) % 5;

  const tsuhenseiMap: Record<number, [Tsuhensei, Tsuhensei]> = {
    0: ['比肩', '劫財'],
    1: ['食神', '傷官'],
    2: ['偏財', '正財'],
    3: ['偏官', '正官'],
    4: ['偏印', '印綬'],
  };

  return tsuhenseiMap[diff][sameYinYang ? 0 : 1];
}

/** 十二運を計算 */
function calculateTwelveStage(dayStem: HeavenlyStem, branch: EarthlyBranch): TwelveStage {
  const stemIndex = HEAVENLY_STEMS.indexOf(dayStem);
  const branchIndex = EARTHLY_BRANCHES.indexOf(branch);

  // 簡略化した十二運計算
  const baseOffset = [1, 6, 10, 9, 10, 9, 1, 6, 4, 3][stemIndex];
  const stageIndex = (branchIndex + baseOffset) % 12;

  return TWELVE_STAGES[stageIndex];
}

/** 五行バランスを計算 */
function calculateFiveElements(pillars: FourPillarsResult['pillars']): Record<FiveElement, number> {
  const counts: Record<FiveElement, number> = { '木': 0, '火': 0, '土': 0, '金': 0, '水': 0 };

  for (const pillar of Object.values(pillars)) {
    counts[STEM_ELEMENTS[pillar.stem]]++;
    counts[BRANCH_ELEMENTS[pillar.branch]]++;
  }

  // パーセンテージに変換
  const total = 8;
  for (const key of Object.keys(counts) as FiveElement[]) {
    counts[key] = Math.round((counts[key] / total) * 100);
  }

  return counts;
}

/** 四柱推命を計算 */
export function calculateFourPillars(birthDate: Date, birthHour: number = 12): FourPillarsResult {
  const year = birthDate.getFullYear();
  const month = birthDate.getMonth() + 1;
  const day = birthDate.getDate();

  const yearPillar = calculateYearPillar(year, month, day);
  const monthPillar = calculateMonthPillar(year, month, day);
  const dayPillar = calculateDayPillar(year, month, day);
  const hourPillar = calculateHourPillar(dayPillar.stem, birthHour);

  const dayStem = dayPillar.stem;

  // 通変星と十二運を追加
  yearPillar.tsuhensei = calculateTsuhensei(dayStem, yearPillar.stem);
  yearPillar.twelveStage = calculateTwelveStage(dayStem, yearPillar.branch);
  monthPillar.tsuhensei = calculateTsuhensei(dayStem, monthPillar.stem);
  monthPillar.twelveStage = calculateTwelveStage(dayStem, monthPillar.branch);
  dayPillar.twelveStage = calculateTwelveStage(dayStem, dayPillar.branch);
  hourPillar.tsuhensei = calculateTsuhensei(dayStem, hourPillar.stem);
  hourPillar.twelveStage = calculateTwelveStage(dayStem, hourPillar.branch);

  const pillars = { year: yearPillar, month: monthPillar, day: dayPillar, hour: hourPillar };
  const fiveElements = calculateFiveElements(pillars);

  const interpretations = [
    `日干「${dayStem}」は${STEM_ELEMENTS[dayStem]}の${STEM_YIN_YANG[dayStem] === 0 ? '陽' : '陰'}。`,
    DAY_STEM_TRAITS[dayStem],
    `月柱の通変星「${monthPillar.tsuhensei}」は${TSUHENSEI_MEANINGS[monthPillar.tsuhensei!]}を示します。`,
  ];

  return {
    birthDateTime: birthDate,
    pillars,
    dayStem,
    dayElement: STEM_ELEMENTS[dayStem],
    fiveElements,
    interpretation: interpretations.join(' '),
    dayStemTrait: DAY_STEM_TRAITS[dayStem],
  };
}
