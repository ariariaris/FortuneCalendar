// Fortune Calendar 日付処理 v1.1

/** Date→YYYY-MM-DD（ローカルタイム） */
export const formatDate = (date: Date): string => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

/** 今日の日付（YYYY-MM-DD） */
export const today = (): string => formatDate(new Date());

/** YYYY-MM-DD→Date */
export const parseDate = (str: string): Date => new Date(str + 'T00:00:00');

/** 曜日取得（0=日, 1=月, ...） */
export const getDayOfWeek = (date: Date): number => date.getDay();

/** 曜日名 */
export const DAY_NAMES = ['日', '月', '火', '水', '木', '金', '土'];
export const getDayName = (date: Date): string => DAY_NAMES[getDayOfWeek(date)];

/** 月の日数 */
export const getDaysInMonth = (year: number, month: number): number => {
  return new Date(year, month + 1, 0).getDate();
};

/** 月の最初の曜日（0=日） */
export const getFirstDayOfMonth = (year: number, month: number): number => {
  return new Date(year, month, 1).getDay();
};

/** 日付加算 */
export const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

/** 月加算 */
export const addMonths = (date: Date, months: number): Date => {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
};

/** 年齢計算 */
export const calcAge = (birthDate: string): number => {
  const birth = parseDate(birthDate);
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const m = now.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) {
    age--;
  }
  return age;
};

/** 日付表示（M月D日） */
export const displayDate = (date: Date): string => {
  return `${date.getMonth() + 1}月${date.getDate()}日`;
};

/** 日付表示（M月D日（曜）） */
export const displayDateWithDay = (date: Date): string => {
  return `${displayDate(date)}（${getDayName(date)}）`;
};

/** 日付が同じか */
export const isSameDate = (a: Date, b: Date): boolean => {
  return formatDate(a) === formatDate(b);
};

/** 日付が今日か */
export const isToday = (date: Date): boolean => {
  return formatDate(date) === today();
};

/** 六曜名 */
export const ROKUYO_NAMES = ['大安', '赤口', '先勝', '友引', '先負', '仏滅'];

/** 六曜計算（旧暦近似） */
export const getRokuyo = (date: Date): string => {
  // 旧暦を近似計算（Zeller's congruence風の簡易アルゴリズム）
  const y = date.getFullYear();
  const m = date.getMonth() + 1;
  const d = date.getDate();
  // 旧暦月日の近似（新月周期29.5日を使用）
  const jd = Math.floor(367 * y - Math.floor(7 * (y + Math.floor((m + 9) / 12)) / 4) + Math.floor(275 * m / 9) + d + 1721013.5);
  const lunarCycle = 29.530588853;
  const refNewMoon = 2451550.1; // 2000/1/6 18:14 UTC の新月（ユリウス日）
  const daysSinceNewMoon = (jd - refNewMoon) % lunarCycle;
  const lunarDay = Math.floor(daysSinceNewMoon) + 1;
  const lunarMonth = Math.floor((jd - refNewMoon) / lunarCycle) % 12 + 1;
  const rokuyoIndex = (lunarMonth + lunarDay) % 6;
  return ROKUYO_NAMES[rokuyoIndex];
};
