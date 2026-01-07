// Fortune Calendar ストア v1.0
import { create } from 'zustand';
import { UserConfig, FortuneResult, UserProfile } from '../config/types';
import { DEFAULT_USER_CONFIG } from '../config/defaultConfig';
import { configManager } from '../config/configManager';
import { initDatabase, saveHistory } from '../services/storageService';

interface AppState {
  // ユーザー設定
  userConfig: UserConfig;
  setUserConfig: (config: Partial<UserConfig>) => void;

  // プロフィール
  setProfile: (profile: UserProfile) => void;

  // 選択中の占術
  selectedFortune: string;
  setSelectedFortune: (id: string) => void;

  // 選択中の日付
  selectedDate: string;
  setSelectedDate: (date: string) => void;

  // 占い結果キャッシュ
  fortuneCache: Record<string, FortuneResult>;
  setFortuneResult: (key: string, result: FortuneResult) => void;

  // ローディング
  loading: boolean;
  setLoading: (loading: boolean) => void;

  // 初期化
  init: () => Promise<void>;
}

const today = () => new Date().toISOString().split('T')[0];

export const useAppStore = create<AppState>((set, get) => ({
  userConfig: DEFAULT_USER_CONFIG,
  setUserConfig: async (config) => {
    const newConfig = { ...get().userConfig, ...config };
    set({ userConfig: newConfig });
    await configManager.setUserConfig(newConfig);
  },

  setProfile: async (profile) => {
    const newConfig = { ...get().userConfig, userProfile: profile };
    set({ userConfig: newConfig, fortuneCache: {} }); // キャッシュクリア
    await configManager.setUserConfig(newConfig);
  },

  selectedFortune: DEFAULT_USER_CONFIG.selectedFortune,
  setSelectedFortune: (id) => {
    set({ selectedFortune: id });
    get().setUserConfig({ selectedFortune: id });
  },

  selectedDate: today(),
  setSelectedDate: (date) => set({ selectedDate: date }),

  fortuneCache: {},
  setFortuneResult: (key, result) => {
    set((state) => ({
      fortuneCache: { ...state.fortuneCache, [key]: result },
    }));
    // 履歴に保存
    saveHistory(result).catch(console.error);
  },

  loading: false,
  setLoading: (loading) => set({ loading }),

  init: async () => {
    set({ loading: true });
    await Promise.all([configManager.init(), initDatabase()]);
    const userConfig = configManager.getUserConfig();
    set({
      userConfig,
      selectedFortune: userConfig.selectedFortune,
      loading: false,
    });
  },
}));
