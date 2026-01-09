// Fortune Calendar 目標管理ユーティリティ v1.0
import { CalendarGoalItem, MustDoPriority } from '../types/goalManagement';

/** 優先度アイコン取得 */
export const getPriorityIcon = (priority: MustDoPriority): string => {
  switch (priority) {
    case 'high': return '🔴';
    case 'medium': return '🟡';
    case 'low': return '🟢';
  }
};

/** カレンダーアイテムアイコン取得 */
export const getCalendarItemIcon = (type: CalendarGoalItem['type']): string => {
  switch (type) {
    case 'todo': return '☑';
    case 'mustdo': return '📝';
    case 'goal': return '🎯';
    case 'dream': return '💭';
  }
};

/** 時間軸から年数取得 */
export const timeframeToYears = (timeframe: string): number => {
  switch (timeframe) {
    case 'year': return 0;
    case '3year': return 3;
    case '5year': return 5;
    case '10year': return 10;
    default: return 0;
  }
};

/** 年数から時間軸ラベル取得 */
export const getTimeframeLabel = (timeframe: string): string => {
  switch (timeframe) {
    case 'year': return '今年';
    case '3year': return '3年後';
    case '5year': return '5年後';
    case '10year': return '10年後';
    case 'week': return '今週';
    case 'month': return '今月';
    default: return timeframe;
  }
};

/** 日付文字列をフォーマット */
export const formatDateString = (dateStr: string): string => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  return `${date.getMonth() + 1}/${date.getDate()}`;
};

/** 今日の日付文字列取得 (YYYY-MM-DD) */
export const getTodayString = (): string => {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

/** 進捗率から色取得 */
export const getProgressColor = (progress: number): string => {
  if (progress >= 100) return '#2196F3';
  if (progress >= 75) return '#4CAF50';
  if (progress >= 50) return '#ff9800';
  if (progress >= 25) return '#ff5722';
  return '#999';
};
