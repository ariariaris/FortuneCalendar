// Fortune Calendar ストレージサービス v1.1 (MMP拡張対応)
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FortuneResult } from '../config/types';
import { ExternalCalendarAccount, ExternalCalendarEvent } from '../types/externalCalendar';
import { BirthdayEntry } from '../types/birthday';
import { MandalaChart, MandalaElement, MandalaAction, MandalaTodo } from '../types/mandala';

const HISTORY_KEY = '@fortune_history';
let db: any = null;

/** DB初期化 */
export const initDatabase = async (): Promise<void> => {
  if (Platform.OS === 'web') {
    // WebはAsyncStorageを使用
    return;
  }
  try {
    const SQLite = await import('expo-sqlite');
    db = await SQLite.openDatabaseAsync('fortune_calendar.db');
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS fortune_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date TEXT NOT NULL,
        fortune_id TEXT NOT NULL,
        result_json TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_history_date ON fortune_history(date);
      CREATE INDEX IF NOT EXISTS idx_history_fortune ON fortune_history(fortune_id);
    `);
    // MMP拡張テーブル
    await createMMPTables();
  } catch (error) {
    console.error('Database init error:', error);
  }
};

/** 履歴保存 */
export const saveHistory = async (result: FortuneResult): Promise<void> => {
  if (Platform.OS === 'web') {
    // WebはAsyncStorage
    try {
      const data = await AsyncStorage.getItem(HISTORY_KEY);
      const history: FortuneResult[] = data ? JSON.parse(data) : [];
      history.unshift(result);
      await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, 100)));
    } catch (error) {
      console.error('Save history error:', error);
    }
    return;
  }
  if (!db) return;
  try {
    await db.runAsync(
      'INSERT INTO fortune_history (date, fortune_id, result_json) VALUES (?, ?, ?)',
      [result.date, result.fortuneId, JSON.stringify(result)]
    );
  } catch (error) {
    console.error('Save history error:', error);
  }
};

/** 履歴取得（日付指定） */
export const getHistoryByDate = async (date: string): Promise<FortuneResult[]> => {
  if (Platform.OS === 'web') {
    try {
      const data = await AsyncStorage.getItem(HISTORY_KEY);
      const history: FortuneResult[] = data ? JSON.parse(data) : [];
      return history.filter((r) => r.date === date);
    } catch (error) {
      console.error('Get history error:', error);
      return [];
    }
  }
  if (!db) return [];
  try {
    const rows = await db.getAllAsync<{ result_json: string }>(
      'SELECT result_json FROM fortune_history WHERE date = ? ORDER BY created_at DESC',
      [date]
    );
    return rows.map((r: any) => JSON.parse(r.result_json));
  } catch (error) {
    console.error('Get history error:', error);
    return [];
  }
};

/** 履歴取得（全件、最新N件） */
export const getRecentHistory = async (limit = 30): Promise<FortuneResult[]> => {
  if (Platform.OS === 'web') {
    try {
      const data = await AsyncStorage.getItem(HISTORY_KEY);
      const history: FortuneResult[] = data ? JSON.parse(data) : [];
      return history.slice(0, limit);
    } catch (error) {
      console.error('Get recent history error:', error);
      return [];
    }
  }
  if (!db) return [];
  try {
    const rows = await db.getAllAsync<{ result_json: string }>(
      'SELECT result_json FROM fortune_history ORDER BY created_at DESC LIMIT ?',
      [limit]
    );
    return rows.map((r: any) => JSON.parse(r.result_json));
  } catch (error) {
    console.error('Get recent history error:', error);
    return [];
  }
};

/** 古い履歴削除 */
export const deleteOldHistory = async (daysToKeep: number): Promise<void> => {
  if (!db) await initDatabase();
  if (!db) return;

  try {
    await db.runAsync(
      "DELETE FROM fortune_history WHERE date < date('now', ? || ' days')",
      [`-${daysToKeep}`]
    );
  } catch (error) {
    console.error('Delete old history error:', error);
  }
};

/** 全履歴削除 */
export const clearAllHistory = async (): Promise<void> => {
  if (!db) await initDatabase();
  if (!db) return;

  try {
    await db.runAsync('DELETE FROM fortune_history');
  } catch (error) {
    console.error('Clear history error:', error);
  }
};

// =====================
// MMP拡張: テーブル作成
// =====================

/** MMP拡張テーブル作成 */
const createMMPTables = async (): Promise<void> => {
  if (!db) return;
  await db.execAsync(`
    -- 外部カレンダーアカウント
    CREATE TABLE IF NOT EXISTS external_calendar_accounts (
      id TEXT PRIMARY KEY,
      provider TEXT NOT NULL,
      email TEXT,
      display_name TEXT NOT NULL,
      access_token_encrypted TEXT NOT NULL,
      refresh_token_encrypted TEXT,
      expires_at INTEGER,
      connected_at TEXT DEFAULT CURRENT_TIMESTAMP,
      last_sync_at TEXT
    );
    -- 外部カレンダーイベント（キャッシュ）
    CREATE TABLE IF NOT EXISTS external_calendar_events (
      id TEXT PRIMARY KEY,
      account_id TEXT NOT NULL,
      title TEXT NOT NULL,
      start_time TEXT NOT NULL,
      end_time TEXT NOT NULL,
      is_all_day INTEGER DEFAULT 0,
      location TEXT,
      description TEXT,
      calendar_name TEXT,
      calendar_color TEXT,
      synced_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (account_id) REFERENCES external_calendar_accounts(id)
    );
    CREATE INDEX IF NOT EXISTS idx_events_date ON external_calendar_events(start_time);
    CREATE INDEX IF NOT EXISTS idx_events_account ON external_calendar_events(account_id);
    -- 誕生日エントリ
    CREATE TABLE IF NOT EXISTS birthday_entries (
      id TEXT PRIMARY KEY,
      contact_id TEXT NOT NULL,
      display_name TEXT NOT NULL,
      birthday_month INTEGER NOT NULL,
      birthday_day INTEGER NOT NULL,
      birthday_year INTEGER,
      imported_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
    CREATE INDEX IF NOT EXISTS idx_birthday_date ON birthday_entries(birthday_month, birthday_day);
    -- マンダラチャート
    CREATE TABLE IF NOT EXISTS mandala_charts (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      timeframe TEXT NOT NULL,
      center_goal TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
    -- マンダラ要素
    CREATE TABLE IF NOT EXISTS mandala_elements (
      id TEXT PRIMARY KEY,
      chart_id TEXT NOT NULL,
      position INTEGER NOT NULL,
      title TEXT NOT NULL,
      FOREIGN KEY (chart_id) REFERENCES mandala_charts(id)
    );
    -- マンダラアクション
    CREATE TABLE IF NOT EXISTS mandala_actions (
      id TEXT PRIMARY KEY,
      element_id TEXT NOT NULL,
      position INTEGER NOT NULL,
      content TEXT NOT NULL,
      deadline TEXT,
      status TEXT DEFAULT 'not_started',
      linked_todo_id TEXT,
      completed_at TEXT,
      FOREIGN KEY (element_id) REFERENCES mandala_elements(id)
    );
    CREATE INDEX IF NOT EXISTS idx_actions_deadline ON mandala_actions(deadline);
    CREATE INDEX IF NOT EXISTS idx_actions_status ON mandala_actions(status);
    -- マンダラTodo
    CREATE TABLE IF NOT EXISTS mandala_todos (
      id TEXT PRIMARY KEY,
      mandala_id TEXT NOT NULL,
      action_id TEXT NOT NULL,
      title TEXT NOT NULL,
      deadline TEXT,
      is_completed INTEGER DEFAULT 0,
      completed_at TEXT,
      show_on_calendar INTEGER DEFAULT 1,
      FOREIGN KEY (mandala_id) REFERENCES mandala_charts(id),
      FOREIGN KEY (action_id) REFERENCES mandala_actions(id)
    );
    CREATE INDEX IF NOT EXISTS idx_todos_calendar ON mandala_todos(show_on_calendar, deadline);
  `);
};
