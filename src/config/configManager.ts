// Fortune Calendar 設定管理 v1.0
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DevConfig, UserConfig, ConfigExport } from './types';
import { DEFAULT_DEV_CONFIG, DEFAULT_USER_CONFIG, APP_VERSION } from './defaultConfig';

const STORAGE_KEYS = {
  DEV_CONFIG: '@fortune_dev_config',
  USER_CONFIG: '@fortune_user_config',
};

class ConfigManager {
  private devConfig: DevConfig = { ...DEFAULT_DEV_CONFIG };
  private userConfig: UserConfig = { ...DEFAULT_USER_CONFIG };

  /** 初期化：ストレージから設定を読み込み */
  async init(): Promise<void> {
    try {
      const [devJson, userJson] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.DEV_CONFIG),
        AsyncStorage.getItem(STORAGE_KEYS.USER_CONFIG),
      ]);
      if (devJson) this.devConfig = { ...DEFAULT_DEV_CONFIG, ...JSON.parse(devJson) };
      if (userJson) this.userConfig = { ...DEFAULT_USER_CONFIG, ...JSON.parse(userJson) };
    } catch (e) {
      console.error('Config load error:', e);
    }
  }

  /** 開発者設定取得 */
  getDevConfig(): DevConfig {
    return { ...this.devConfig };
  }

  /** 開発者設定更新 */
  async setDevConfig(config: Partial<DevConfig>): Promise<void> {
    this.devConfig = this.deepMerge(this.devConfig, config);
    await AsyncStorage.setItem(STORAGE_KEYS.DEV_CONFIG, JSON.stringify(this.devConfig));
  }

  /** ユーザー設定取得 */
  getUserConfig(): UserConfig {
    return { ...this.userConfig };
  }

  /** ユーザー設定更新 */
  async setUserConfig(config: Partial<UserConfig>): Promise<void> {
    this.userConfig = { ...this.userConfig, ...config };
    await AsyncStorage.setItem(STORAGE_KEYS.USER_CONFIG, JSON.stringify(this.userConfig));
  }

  /** 設定エクスポート */
  exportConfig(): ConfigExport {
    return {
      version: APP_VERSION,
      exportedAt: new Date().toISOString(),
      devConfig: this.devConfig,
    };
  }

  /** 設定インポート */
  async importConfig(data: ConfigExport): Promise<boolean> {
    try {
      if (!data.version || !data.devConfig) return false;
      await this.setDevConfig(data.devConfig);
      return true;
    } catch {
      return false;
    }
  }

  /** 開発者設定を初期値に戻す */
  async resetDevConfig(): Promise<void> {
    this.devConfig = { ...DEFAULT_DEV_CONFIG };
    await AsyncStorage.setItem(STORAGE_KEYS.DEV_CONFIG, JSON.stringify(this.devConfig));
  }

  /** ユーザー設定を初期値に戻す */
  async resetUserConfig(): Promise<void> {
    this.userConfig = { ...DEFAULT_USER_CONFIG };
    await AsyncStorage.setItem(STORAGE_KEYS.USER_CONFIG, JSON.stringify(this.userConfig));
  }

  /** ディープマージ */
  private deepMerge<T extends object>(target: T, source: Partial<T>): T {
    const result = { ...target };
    for (const key in source) {
      const val = source[key];
      if (val && typeof val === 'object' && !Array.isArray(val)) {
        result[key] = this.deepMerge(result[key] as object, val as object) as T[typeof key];
      } else if (val !== undefined) {
        result[key] = val as T[typeof key];
      }
    }
    return result;
  }
}

export const configManager = new ConfigManager();
