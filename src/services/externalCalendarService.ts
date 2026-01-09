// Fortune Calendar 外部カレンダーサービス v1.0
import { Platform } from 'react-native';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import * as SecureStore from 'expo-secure-store';
import {
  ExternalCalendarAccount,
  ExternalCalendarEvent,
  CalendarSyncState,
  CalendarErrorType,
  OAUTH_SCOPES,
  SYNC_CONFIG,
} from '../types/externalCalendar';

// WebブラウザをOAuthに登録
WebBrowser.maybeCompleteAuthSession();

// Google OAuth設定
const GOOGLE_CLIENT_ID_WEB = 'YOUR_WEB_CLIENT_ID.apps.googleusercontent.com';
const GOOGLE_CLIENT_ID_IOS = 'YOUR_IOS_CLIENT_ID.apps.googleusercontent.com';
const GOOGLE_CLIENT_ID_ANDROID = 'YOUR_ANDROID_CLIENT_ID.apps.googleusercontent.com';

const getGoogleClientId = (): string => {
  switch (Platform.OS) {
    case 'ios': return GOOGLE_CLIENT_ID_IOS;
    case 'android': return GOOGLE_CLIENT_ID_ANDROID;
    default: return GOOGLE_CLIENT_ID_WEB;
  }
};

// セキュアストレージキー
const TOKEN_STORAGE_KEY = '@calendar_tokens';

/** トークン暗号化保存 */
const saveToken = async (accountId: string, tokens: { accessToken: string; refreshToken?: string; expiresAt?: number }): Promise<void> => {
  if (Platform.OS === 'web') {
    localStorage.setItem(`${TOKEN_STORAGE_KEY}_${accountId}`, JSON.stringify(tokens));
    return;
  }
  await SecureStore.setItemAsync(`${TOKEN_STORAGE_KEY}_${accountId}`, JSON.stringify(tokens));
};

/** トークン取得 */
const getToken = async (accountId: string): Promise<{ accessToken: string; refreshToken?: string; expiresAt?: number } | null> => {
  try {
    if (Platform.OS === 'web') {
      const data = localStorage.getItem(`${TOKEN_STORAGE_KEY}_${accountId}`);
      return data ? JSON.parse(data) : null;
    }
    const data = await SecureStore.getItemAsync(`${TOKEN_STORAGE_KEY}_${accountId}`);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
};

/** トークン削除 */
const deleteToken = async (accountId: string): Promise<void> => {
  if (Platform.OS === 'web') {
    localStorage.removeItem(`${TOKEN_STORAGE_KEY}_${accountId}`);
    return;
  }
  await SecureStore.deleteItemAsync(`${TOKEN_STORAGE_KEY}_${accountId}`);
};

/** Google OAuth認証開始 */
export const startGoogleAuth = async (): Promise<ExternalCalendarAccount | null> => {
  const clientId = getGoogleClientId();
  const redirectUri = AuthSession.makeRedirectUri({ scheme: 'fortunecalendar' });

  const request = new AuthSession.AuthRequest({
    clientId,
    scopes: OAUTH_SCOPES.google,
    redirectUri,
    responseType: AuthSession.ResponseType.Code,
  });

  const result = await request.promptAsync({
    authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
  });

  if (result.type !== 'success' || !result.params.code) {
    return null;
  }

  // コードをトークンに交換
  const tokenResponse = await exchangeCodeForToken(result.params.code, redirectUri);
  if (!tokenResponse) return null;

  // ユーザー情報取得
  const userInfo = await fetchGoogleUserInfo(tokenResponse.accessToken);
  if (!userInfo) return null;

  const accountId = `google_${userInfo.email}`;
  const account: ExternalCalendarAccount = {
    id: accountId,
    provider: 'google',
    email: userInfo.email,
    displayName: userInfo.name || userInfo.email,
    accessToken: tokenResponse.accessToken,
    refreshToken: tokenResponse.refreshToken,
    expiresAt: tokenResponse.expiresAt,
    connectedAt: new Date().toISOString(),
  };

  await saveToken(accountId, {
    accessToken: tokenResponse.accessToken,
    refreshToken: tokenResponse.refreshToken,
    expiresAt: tokenResponse.expiresAt,
  });

  return account;
};

/** コードをトークンに交換 */
const exchangeCodeForToken = async (
  code: string,
  redirectUri: string
): Promise<{ accessToken: string; refreshToken?: string; expiresAt?: number } | null> => {
  try {
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: getGoogleClientId(),
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }).toString(),
    });

    if (!response.ok) return null;

    const data = await response.json();
    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresAt: Date.now() + (data.expires_in * 1000),
    };
  } catch {
    return null;
  }
};

/** トークンリフレッシュ */
export const refreshAccessToken = async (accountId: string): Promise<string | null> => {
  const tokens = await getToken(accountId);
  if (!tokens?.refreshToken) return null;

  try {
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        refresh_token: tokens.refreshToken,
        client_id: getGoogleClientId(),
        grant_type: 'refresh_token',
      }).toString(),
    });

    if (!response.ok) return null;

    const data = await response.json();
    const newTokens = {
      accessToken: data.access_token,
      refreshToken: tokens.refreshToken,
      expiresAt: Date.now() + (data.expires_in * 1000),
    };

    await saveToken(accountId, newTokens);
    return newTokens.accessToken;
  } catch {
    return null;
  }
};

/** Googleユーザー情報取得 */
const fetchGoogleUserInfo = async (accessToken: string): Promise<{ email: string; name?: string } | null> => {
  try {
    const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  }
};

/** 有効なアクセストークン取得（必要に応じてリフレッシュ） */
export const getValidAccessToken = async (accountId: string): Promise<string | null> => {
  const tokens = await getToken(accountId);
  if (!tokens) return null;

  // トークン有効期限チェック（5分前にリフレッシュ）
  if (tokens.expiresAt && tokens.expiresAt < Date.now() + 300000) {
    return await refreshAccessToken(accountId);
  }

  return tokens.accessToken;
};

/** アカウント連携解除 */
export const disconnectAccount = async (accountId: string): Promise<void> => {
  await deleteToken(accountId);
};

/** エラーハンドリング */
export const handleCalendarError = (error: CalendarErrorType): { message: string; action: 'reauth' | 'retry' | 'settings' | 'none' } => {
  switch (error) {
    case CalendarErrorType.AUTH_EXPIRED:
      return { message: '認証が期限切れです。再連携してください。', action: 'reauth' };
    case CalendarErrorType.NETWORK_ERROR:
      return { message: 'ネットワークエラーです。オフラインデータを表示します。', action: 'retry' };
    case CalendarErrorType.PERMISSION_DENIED:
      return { message: 'カレンダーへのアクセスが拒否されました。設定を確認してください。', action: 'settings' };
    case CalendarErrorType.RATE_LIMITED:
      return { message: 'リクエスト制限に達しました。しばらく待ってから再試行してください。', action: 'retry' };
    default:
      return { message: '予期しないエラーが発生しました。', action: 'none' };
  }
};

// =====================
// イベント取得・同期
// =====================

/** 同期範囲の日付を計算 */
const getSyncDateRange = (): { timeMin: string; timeMax: string } => {
  const now = new Date();
  const timeMin = new Date(now.getFullYear(), now.getMonth() - SYNC_CONFIG.pastMonths, 1);
  const timeMax = new Date(now.getFullYear(), now.getMonth() + SYNC_CONFIG.futureMonths + 1, 0);
  return {
    timeMin: timeMin.toISOString(),
    timeMax: timeMax.toISOString(),
  };
};

/** Google Calendarイベント取得 */
export const fetchGoogleCalendarEvents = async (
  accountId: string
): Promise<{ events: ExternalCalendarEvent[]; error?: CalendarErrorType }> => {
  const accessToken = await getValidAccessToken(accountId);
  if (!accessToken) {
    return { events: [], error: CalendarErrorType.AUTH_EXPIRED };
  }

  const { timeMin, timeMax } = getSyncDateRange();
  const events: ExternalCalendarEvent[] = [];

  try {
    // カレンダー一覧取得
    const calListRes = await fetch(
      'https://www.googleapis.com/calendar/v3/users/me/calendarList',
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    if (calListRes.status === 401) {
      return { events: [], error: CalendarErrorType.AUTH_EXPIRED };
    }
    if (calListRes.status === 429) {
      return { events: [], error: CalendarErrorType.RATE_LIMITED };
    }
    if (!calListRes.ok) {
      return { events: [], error: CalendarErrorType.UNKNOWN };
    }

    const calListData = await calListRes.json();
    const calendars = calListData.items || [];

    // 各カレンダーからイベント取得
    for (const cal of calendars) {
      const eventsRes = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(cal.id)}/events?` +
        new URLSearchParams({
          timeMin,
          timeMax,
          singleEvents: 'true',
          orderBy: 'startTime',
          maxResults: '250',
        }),
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );

      if (!eventsRes.ok) continue;

      const eventsData = await eventsRes.json();
      for (const item of eventsData.items || []) {
        if (!item.summary) continue;

        const startTime = item.start?.dateTime || item.start?.date;
        const endTime = item.end?.dateTime || item.end?.date;
        if (!startTime || !endTime) continue;

        events.push({
          id: item.id,
          accountId,
          title: item.summary,
          startTime,
          endTime,
          isAllDay: !item.start?.dateTime,
          location: item.location,
          description: item.description?.slice(0, SYNC_CONFIG.maxDescriptionLength),
          calendarName: cal.summary,
          calendarColor: cal.backgroundColor,
          syncedAt: new Date().toISOString(),
        });
      }
    }

    return { events };
  } catch {
    return { events: [], error: CalendarErrorType.NETWORK_ERROR };
  }
};

/** 日付でイベントをフィルタ */
export const getEventsByDate = (events: ExternalCalendarEvent[], date: string): ExternalCalendarEvent[] => {
  return events.filter((e) => {
    const eventDate = e.startTime.split('T')[0];
    return eventDate === date;
  });
};

/** 月でイベントをフィルタ */
export const getEventsByMonth = (events: ExternalCalendarEvent[], year: number, month: number): ExternalCalendarEvent[] => {
  const prefix = `${year}-${String(month).padStart(2, '0')}`;
  return events.filter((e) => e.startTime.startsWith(prefix));
};
