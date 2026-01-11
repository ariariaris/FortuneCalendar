// Fortune Calendar ネイティブカレンダーサービス v2.0
// Android/iOSシステムカレンダーの読み書き
import { Platform } from 'react-native';
import * as Calendar from 'expo-calendar';
import { ExternalCalendarEvent, SYNC_CONFIG } from '../types/externalCalendar';

/** ネイティブカレンダー情報 */
export interface NativeCalendar {
  id: string;
  title: string;
  color: string;
  isPrimary: boolean;
  isEnabled: boolean;
  allowsModifications?: boolean;
}

/** パーミッション状態 */
export type PermissionStatus = 'granted' | 'denied' | 'undetermined';

/** 繰り返しタイプ */
export type RecurrenceType = 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly';

/** イベント作成データ */
export interface EventCreateData {
  title: string;
  startDate: Date;
  endDate: Date;
  isAllDay: boolean;
  location?: string;
  notes?: string;
  calendarId: string;
  recurrence?: RecurrenceType;
  reminders?: number[]; // 分単位（負の値：5分前=-5）
}

const NATIVE_ACCOUNT_ID = 'native_device_calendar';

/** カレンダーパーミッション要求 */
export const requestCalendarPermission = async (): Promise<PermissionStatus> => {
  if (Platform.OS === 'web') {
    return 'denied';
  }

  const { status } = await Calendar.requestCalendarPermissionsAsync();
  return status as PermissionStatus;
};

/** カレンダーパーミッション確認 */
export const checkCalendarPermission = async (): Promise<PermissionStatus> => {
  if (Platform.OS === 'web') {
    return 'denied';
  }

  const { status } = await Calendar.getCalendarPermissionsAsync();
  return status as PermissionStatus;
};

/** 利用可能なカレンダー一覧取得 */
export const getNativeCalendars = async (): Promise<NativeCalendar[]> => {
  if (Platform.OS === 'web') {
    return [];
  }

  try {
    const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
    return calendars.map((cal, index) => ({
      id: cal.id,
      title: cal.title || `カレンダー${index + 1}`,
      color: cal.color || '#4285F4',
      isPrimary: cal.isPrimary || false,
      isEnabled: true,
      allowsModifications: cal.allowsModifications ?? true,
    }));
  } catch {
    return [];
  }
};

/** 書き込み可能なカレンダー一覧取得 */
export const getWritableCalendars = async (): Promise<NativeCalendar[]> => {
  const calendars = await getNativeCalendars();
  return calendars.filter(c => c.allowsModifications !== false);
};

/** 同期範囲の日付を計算 */
const getSyncDateRange = (): { startDate: Date; endDate: Date } => {
  const now = new Date();
  const startDate = new Date(now.getFullYear(), now.getMonth() - SYNC_CONFIG.pastMonths, 1);
  const endDate = new Date(now.getFullYear(), now.getMonth() + SYNC_CONFIG.futureMonths + 1, 0, 23, 59, 59);
  return { startDate, endDate };
};

/** ネイティブカレンダーからイベント取得 */
export const fetchNativeCalendarEvents = async (
  calendarIds?: string[]
): Promise<ExternalCalendarEvent[]> => {
  if (Platform.OS === 'web') {
    return [];
  }

  try {
    // パーミッション確認
    const status = await checkCalendarPermission();
    if (status !== 'granted') {
      return [];
    }

    // カレンダーID指定がない場合は全カレンダー取得
    let targetCalendarIds = calendarIds;
    if (!targetCalendarIds || targetCalendarIds.length === 0) {
      const calendars = await getNativeCalendars();
      targetCalendarIds = calendars.map(c => c.id);
    }

    if (targetCalendarIds.length === 0) {
      return [];
    }

    const { startDate, endDate } = getSyncDateRange();
    const events = await Calendar.getEventsAsync(targetCalendarIds, startDate, endDate);

    // カレンダー情報をマップ化
    const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
    const calendarMap = new Map(calendars.map(c => [c.id, c]));

    // ExternalCalendarEvent形式に変換
    return events.map(event => {
      const calendar = calendarMap.get(event.calendarId);
      return convertToExternalEvent(event, calendar);
    });
  } catch {
    return [];
  }
};

/** expo-calendarイベントをExternalCalendarEvent形式に変換 */
const convertToExternalEvent = (
  event: Calendar.Event,
  calendar?: Calendar.Calendar
): ExternalCalendarEvent => {
  // 開始時刻
  let startTime: string;
  if (event.allDay) {
    startTime = new Date(event.startDate).toISOString().split('T')[0];
  } else {
    startTime = new Date(event.startDate).toISOString();
  }

  // 終了時刻
  let endTime: string;
  if (event.allDay) {
    endTime = new Date(event.endDate).toISOString().split('T')[0];
  } else {
    endTime = new Date(event.endDate).toISOString();
  }

  return {
    id: `native_${event.id}`,
    accountId: NATIVE_ACCOUNT_ID,
    title: event.title || '(タイトルなし)',
    startTime,
    endTime,
    isAllDay: event.allDay || false,
    location: event.location || undefined,
    description: event.notes?.slice(0, SYNC_CONFIG.maxDescriptionLength) || undefined,
    calendarName: calendar?.title || undefined,
    calendarColor: calendar?.color || '#4285F4',
    syncedAt: new Date().toISOString(),
  };
};

/** 日付でイベントをフィルタ */
export const getNativeEventsByDate = (
  events: ExternalCalendarEvent[],
  date: string
): ExternalCalendarEvent[] => {
  return events.filter(e => {
    const eventDate = e.startTime.split('T')[0];
    return eventDate === date;
  });
};

/** 月でイベントをフィルタ */
export const getNativeEventsByMonth = (
  events: ExternalCalendarEvent[],
  year: number,
  month: number
): ExternalCalendarEvent[] => {
  const prefix = `${year}-${String(month).padStart(2, '0')}`;
  return events.filter(e => e.startTime.startsWith(prefix));
};

// =====================
// イベント作成
// =====================

/** 繰り返しルール生成 */
const buildRecurrenceRule = (recurrence: RecurrenceType): Calendar.RecurrenceRule | undefined => {
  if (recurrence === 'none') return undefined;
  const frequencyMap: Record<RecurrenceType, Calendar.Frequency> = {
    none: Calendar.Frequency.DAILY,
    daily: Calendar.Frequency.DAILY,
    weekly: Calendar.Frequency.WEEKLY,
    monthly: Calendar.Frequency.MONTHLY,
    yearly: Calendar.Frequency.YEARLY,
  };
  return { frequency: frequencyMap[recurrence] };
};

/** イベント作成 */
export const createNativeCalendarEvent = async (
  data: EventCreateData
): Promise<string | null> => {
  if (Platform.OS === 'web') {
    return null;
  }

  try {
    const status = await checkCalendarPermission();
    if (status !== 'granted') {
      return null;
    }

    const eventDetails: Calendar.EventDetails = {
      title: data.title,
      startDate: data.startDate,
      endDate: data.endDate,
      allDay: data.isAllDay,
      location: data.location,
      notes: data.notes,
    };

    // 繰り返し設定
    if (data.recurrence && data.recurrence !== 'none') {
      eventDetails.recurrenceRule = buildRecurrenceRule(data.recurrence);
    }

    // リマインダー設定
    if (data.reminders && data.reminders.length > 0) {
      eventDetails.alarms = data.reminders.map(minutes => ({
        relativeOffset: minutes,
      }));
    }

    const eventId = await Calendar.createEventAsync(data.calendarId, eventDetails);
    return eventId;
  } catch (error) {
    console.error('イベント作成エラー:', error);
    return null;
  }
};
