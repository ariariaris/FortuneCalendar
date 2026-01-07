// Fortune Calendar ストレージサービス v1.0
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FortuneResult } from '../config/types';

const HISTORY_KEY = '@fortune_history';
let db: any = null;

/** DB初期化 */
export const initDatabase = async (): Promise<void> => {
  if (Platform.OS === 'web') {
    // WebはAsyncStorageを使用
    return;
  }
  try {
    const SQLite = require('expo-sqlite');
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
