// Fortune Calendar カレンダー統合表示 v1.2a (日付形式正規化対応)
import { ExternalCalendarEvent } from '../types/externalCalendar';
import { BirthdayEntry } from '../types/birthday';
import { MandalaTodo } from '../types/mandala';
import { Dream, Goal, MustDoItem, TodoItem } from '../types/goalManagement';

/** カレンダー表示用アイテム */
export interface CalendarDisplayItem {
  type: 'fortune' | 'external' | 'birthday' | 'mandala';
  icon: string;
  title: string;
  time?: string;
  color?: string;
  priority: number;
}

/** 優先度定数（小さいほど高優先） */
export const ITEM_PRIORITY = {
  mandala: 1,
  birthday: 2,
  external: 3,
  fortune: 4,
};

/** 日付のイベントを統合してソート */
export const mergeCalendarItems = (
  date: string,
  externalEvents: ExternalCalendarEvent[],
  birthdays: BirthdayEntry[],
  mandalaTodos: MandalaTodo[],
  fortuneScore?: number
): CalendarDisplayItem[] => {
  const items: CalendarDisplayItem[] = [];

  // マンダラTodo（期限がこの日のもの）
  const todosForDate = mandalaTodos.filter(
    (t) => t.deadline && t.deadline.startsWith(date) && !t.isCompleted
  );
  for (const todo of todosForDate) {
    items.push({
      type: 'mandala',
      icon: '🎯',
      title: todo.title,
      color: '#8B5CF6',
      priority: ITEM_PRIORITY.mandala,
    });
  }

  // 誕生日（showOnCalendarがtrueのもののみ）
  const [, m, d] = date.split('-').map(Number);
  const birthdaysForDate = birthdays.filter(
    (b) => b.birthday.month === m && b.birthday.day === d && (b.showOnCalendar ?? true)
  );
  for (const b of birthdaysForDate) {
    items.push({
      type: 'birthday',
      icon: '🎂',
      title: `${b.displayName}さんの誕生日`,
      color: '#FF69B4',
      priority: ITEM_PRIORITY.birthday,
    });
  }

  // 外部カレンダーイベント
  const eventsForDate = externalEvents.filter((e) => {
    const eventDate = e.startTime.split('T')[0];
    return eventDate === date;
  });
  for (const e of eventsForDate) {
    const time = e.isAllDay ? '終日' : formatTime(e.startTime);
    items.push({
      type: 'external',
      icon: '📅',
      title: e.title,
      time,
      color: e.calendarColor || '#4285F4',
      priority: ITEM_PRIORITY.external,
    });
  }

  // 運勢（スコアがある場合）
  if (fortuneScore !== undefined) {
    items.push({
      type: 'fortune',
      icon: '⭐',
      title: `運勢: ${getStars(fortuneScore)}`,
      priority: ITEM_PRIORITY.fortune,
    });
  }

  // 優先度でソート
  items.sort((a, b) => a.priority - b.priority);

  return items;
};

/** 日付アイコン結果 */
export interface DateIcons {
  hasExternal: boolean;
  hasBirthday: boolean;
  hasMandala: boolean;
  hasDream: boolean;
  hasGoal: boolean;
  hasMustDo: boolean;
  hasTodo: boolean;
  birthdayNames: string[];
}

/** 日付にアイコンがあるかチェック（目標管理対応・ユーザー誕生日対応） */
export const getDateIcons = (
  date: string,
  externalEvents: ExternalCalendarEvent[],
  birthdays: BirthdayEntry[],
  mandalaTodos: MandalaTodo[],
  dreams?: Dream[],
  goals?: Goal[],
  mustDoItems?: MustDoItem[],
  todoItems?: TodoItem[],
  userBirthDate?: string,
  userName?: string
): DateIcons => {
  const [, m, d] = date.split('-').map(Number);
  const addedNames = new Set<string>();
  const birthdayNames: string[] = [];

  // ユーザー自身の誕生日チェック
  if (userBirthDate) {
    const [, um, ud] = userBirthDate.split('-').map(Number);
    if (um === m && ud === d) {
      const name = userName || 'あなた';
      birthdayNames.push(name);
      addedNames.add(name);
    }
  }

  // 登録済み誕生日（重複スキップ）
  const birthdayEntries = birthdays.filter((b) => b.birthday.month === m && b.birthday.day === d && (b.showOnCalendar ?? true) && !addedNames.has(b.displayName));
  birthdayEntries.forEach((b) => { birthdayNames.push(b.displayName); addedNames.add(b.displayName); });

  const hasExternal = externalEvents.some((e) => e.startTime.split('T')[0] === date);
  const hasBirthday = birthdayNames.length > 0;
  const hasMandala = mandalaTodos.some((t) => t.deadline && t.deadline.replace(/\//g, '-').startsWith(date) && !t.isCompleted);

  // 目標管理アイテム（日付形式を正規化して比較）
  const hasDream = dreams?.some((dr) => dr.deadline?.replace(/\//g, '-').startsWith(date)) ?? false;
  const hasGoal = goals?.some((g) => g.deadline?.replace(/\//g, '-').startsWith(date) && g.status !== 'completed') ?? false;
  const hasMustDo = mustDoItems?.some((mi) => mi.deadline?.replace(/\//g, '-') === date && mi.status !== 'completed') ?? false;
  const hasTodo = todoItems?.some((t) => t.date === date && !t.isCompleted) ?? false;

  return { hasExternal, hasBirthday, hasMandala, hasDream, hasGoal, hasMustDo, hasTodo, birthdayNames };
};

const formatTime = (isoStr: string): string => {
  if (!isoStr.includes('T')) return '終日';
  const d = new Date(isoStr);
  return `${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`;
};

const getStars = (score: number): string => {
  const stars = Math.min(5, Math.max(1, Math.round(score / 20)));
  return '★'.repeat(stars) + '☆'.repeat(5 - stars);
};
