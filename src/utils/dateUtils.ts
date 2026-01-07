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
