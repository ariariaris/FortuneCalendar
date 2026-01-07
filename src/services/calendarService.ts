// Fortune Calendar カレンダー連携サービス v1.0
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CALENDAR_LINKED_KEY = '@fortune_calendar_linked';

/** カレンダー連携状態 */
export interface CalendarStatus {
  linked: boolean;
  provider: 'google' | 'apple' | 'android' | null;
  lastSync?: string;
}

/** カレンダー連携状態取得 */
export const getCalendarStatus = async (): Promise<CalendarStatus> => {
  try {
    const data = await AsyncStorage.getItem(CALENDAR_LINKED_KEY);
    if (data) return JSON.parse(data);
  } catch (error) {
    console.error('Get calendar status error:', error);
  }
  return { linked: false, provider: null };
};

/** カレンダー連携状態保存 */
export const setCalendarStatus = async (status: CalendarStatus): Promise<void> => {
  try {
    await AsyncStorage.setItem(CALENDAR_LINKED_KEY, JSON.stringify(status));
  } catch (error) {
    console.error('Set calendar status error:', error);
  }
};

/** Google Calendar OAuth URL生成（Web用） */
export const getGoogleAuthUrl = (): string => {
  // TODO: 実際のClient IDとリダイレクトURIを設定
  const clientId = 'YOUR_GOOGLE_CLIENT_ID';
  const redirectUri = encodeURIComponent(window?.location?.origin + '/auth/callback' || '');
  const scope = encodeURIComponent('https://www.googleapis.com/auth/calendar.readonly');
  return `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=token&scope=${scope}`;
};

/** カレンダー連携（プラットフォーム別） */
export const linkCalendar = async (): Promise<boolean> => {
  try {
    if (Platform.OS === 'web') {
      // Web: Google Calendar OAuth（モック）
      console.log('Google Calendar連携を開始...');
      // 実際の実装ではOAuthフローを実行
      await setCalendarStatus({ linked: true, provider: 'google', lastSync: new Date().toISOString() });
      return true;
    } else if (Platform.OS === 'ios') {
      // iOS: EventKit（要ネイティブモジュール）
      console.log('Apple Calendar連携（未実装）');
      return false;
    } else if (Platform.OS === 'android') {
      // Android: CalendarProvider（要ネイティブモジュール）
      console.log('Android Calendar連携（未実装）');
      return false;
    }
  } catch (error) {
    console.error('Link calendar error:', error);
  }
  return false;
};

/** カレンダー連携解除 */
export const unlinkCalendar = async (): Promise<void> => {
  await setCalendarStatus({ linked: false, provider: null });
};

/** カレンダーイベント取得（モック） */
export interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
}

export const getCalendarEvents = async (date: string): Promise<CalendarEvent[]> => {
  const status = await getCalendarStatus();
  if (!status.linked) return [];

  // モックデータ（実際はAPIから取得）
  return [
    { id: '1', title: 'ミーティング', start: `${date}T10:00:00`, end: `${date}T11:00:00` },
    { id: '2', title: '打ち合わせ', start: `${date}T14:00:00`, end: `${date}T15:00:00` },
  ];
};

/** ラッキーデーイベント追加（モック） */
export const addLuckyDayEvent = async (date: string, message: string): Promise<boolean> => {
  const status = await getCalendarStatus();
  if (!status.linked) return false;

  // 実際はカレンダーAPIを呼び出してイベント追加
  console.log(`ラッキーデー追加: ${date} - ${message}`);
  return true;
};

/** 権限チェック */
export const checkCalendarPermission = async (): Promise<boolean> => {
  if (Platform.OS === 'web') {
    const status = await getCalendarStatus();
    return status.linked;
  }
  // iOS/Androidは要ネイティブ実装
  return false;
};
