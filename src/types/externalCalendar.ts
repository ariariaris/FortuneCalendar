// Fortune Calendar 外部カレンダー型定義 v1.0

/** 外部カレンダーアカウント */
export interface ExternalCalendarAccount {
  id: string;
  provider: 'google' | 'apple';
  email?: string;
  displayName: string;
  accessToken: string;
  refreshToken?: string;
  expiresAt?: number;
  connectedAt: string;
  lastSyncAt?: string;
}

/** 外部カレンダーイベント */
export interface ExternalCalendarEvent {
  id: string;
  accountId: string;
  title: string;
  startTime: string;
  endTime: string;
  isAllDay: boolean;
  location?: string;
  description?: string;
  calendarName?: string;
  calendarColor?: string;
  syncedAt: string;
}

/** カレンダー同期状態 */
export interface CalendarSyncState {
  accountId: string;
  lastSyncAt: string;
  syncStatus: 'idle' | 'syncing' | 'error';
  errorMessage?: string;
  eventCount: number;
}

/** カレンダーエラー種別 */
export enum CalendarErrorType {
  AUTH_EXPIRED = 'AUTH_EXPIRED',
  NETWORK_ERROR = 'NETWORK_ERROR',
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  RATE_LIMITED = 'RATE_LIMITED',
  UNKNOWN = 'UNKNOWN',
}

/** OAuth設定 */
export const OAUTH_SCOPES = {
  google: [
    'https://www.googleapis.com/auth/calendar.readonly',
    'https://www.googleapis.com/auth/calendar.events.readonly',
  ],
};

/** 同期設定 */
export const SYNC_CONFIG = {
  pastMonths: 1,
  futureMonths: 3,
  autoSyncIntervalMinutes: 60,
  maxDescriptionLength: 100,
};
