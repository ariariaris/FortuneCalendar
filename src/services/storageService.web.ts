// Fortune Calendar ストレージサービス Web版 v1.0
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FortuneResult } from '../config/types';

const HISTORY_KEY = '@fortune_history';

/** DB初期化（Web版はAsyncStorage使用） */
export const initDatabase = async (): Promise<void> => {
  // WebはAsyncStorageを使用、初期化不要
};

/** 履歴保存 */
export const saveHistory = async (result: FortuneResult): Promise<void> => {
  try {
    const data = await AsyncStorage.getItem(HISTORY_KEY);
    const history: FortuneResult[] = data ? JSON.parse(data) : [];
    history.unshift(result);
    await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, 100)));
  } catch (error) {
    console.error('Save history error:', error);
  }
};

/** 履歴取得（日付指定） */
export const getHistoryByDate = async (date: string): Promise<FortuneResult[]> => {
  try {
    const data = await AsyncStorage.getItem(HISTORY_KEY);
    const history: FortuneResult[] = data ? JSON.parse(data) : [];
    return history.filter((r) => r.date === date);
  } catch (error) {
    console.error('Get history error:', error);
    return [];
  }
};

/** 履歴取得（全件、最新N件） */
export const getRecentHistory = async (limit = 30): Promise<FortuneResult[]> => {
  try {
    const data = await AsyncStorage.getItem(HISTORY_KEY);
    const history: FortuneResult[] = data ? JSON.parse(data) : [];
    return history.slice(0, limit);
  } catch (error) {
    console.error('Get recent history error:', error);
    return [];
  }
};

/** 古い履歴削除 */
export const deleteOldHistory = async (daysToKeep: number): Promise<void> => {
  try {
    const data = await AsyncStorage.getItem(HISTORY_KEY);
    const history: FortuneResult[] = data ? JSON.parse(data) : [];
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
    const cutoff = cutoffDate.toISOString().split('T')[0];
    const filtered = history.filter((r) => r.date >= cutoff);
    await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('Delete old history error:', error);
  }
};

/** 全履歴削除 */
export const clearAllHistory = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(HISTORY_KEY);
  } catch (error) {
    console.error('Clear history error:', error);
  }
};
