// Fortune Calendar 型定義 v1.1 (MMP拡張対応)

import { MandalaTimeframe } from '../types/mandala';

/** 開発者設定 */
export interface DevConfig {
  ui: {
    chartAxes: string[];        // 6軸名
    defaultFortune: string;     // デフォルト占術ID
    themeColor: string;         // テーマカラー
  };
  fortune: {
    updateHour: number;         // 更新時刻（0-23）
    historyDays: number;        // 履歴保持日数
    enabledFortunes: string[];  // 有効な占術ID配列
  };
  payment: {
    monthlyPrice: number;
    lifetimePrice: number;
    showAds: boolean;
  };
  system: {
    debugLog: boolean;
    mockResults: boolean;
  };
}

/** 天気表示設定 */
export interface WeatherConfig {
  enabled: boolean;
  showIcon: boolean;
  showTemp: boolean;
  showRain: boolean;
  areaCode: string;  // 気象庁地域コード（東京:130000）
}

/** フォントサイズ */
export type FontSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

/** カレンダー表示モード */
export type CalendarViewMode = 'month' | 'week' | 'day';

/** 起動時デフォルトタブ */
export type DefaultTab = 'Day' | 'Calendar' | 'Year';

/** 外部カレンダー設定 */
export interface ExternalCalendarConfig {
  enabled: boolean;
  syncInterval: number;
  showEventDetails: boolean;
}

/** 誕生日設定 */
export interface BirthdayConfig {
  enabled: boolean;
  showAge: boolean;
  notifyDaysBefore: number;
}

/** マンダラ設定 */
export interface MandalaConfig {
  enabled: boolean;
  showOnCalendar: boolean;
  defaultTimeframe: MandalaTimeframe;
}

/** ユーザー設定 */
export interface UserConfig {
  userProfile: UserProfile | null;
  selectedFortune: string;
  enabledFortunes: string[];
  calendarLinked: boolean;
  notificationEnabled: boolean;
  notificationTime: string;
  themeMode: 'light' | 'dark';
  themeColor: string;  // テーマカラー (20色から選択)
  fontSize: FontSize;  // 文字サイズ (5段階)
  calendarViewMode: CalendarViewMode;  // カレンダー表示モード
  starColorMode: 'simple' | 'colorful';
  purchaseState: PurchaseState;
  weatherConfig: WeatherConfig;
  yearCalendarBestCount: number;  // 年間カレンダーの★表示数(1-5)
  showAge: boolean;  // 年齢を表示
  defaultTab: DefaultTab;  // 起動時デフォルトタブ
  // MMP拡張設定
  externalCalendar: ExternalCalendarConfig;
  birthday: BirthdayConfig;
  mandala: MandalaConfig;
  showSplash: boolean;  // 起動スプラッシュ表示
}

/** ユーザープロフィール */
export interface UserProfile {
  birthDate: string;      // YYYY-MM-DD
  bloodType?: 'A' | 'B' | 'O' | 'AB';
  gender?: 'male' | 'female' | 'other';
  name?: string;
}

/** 購入状態 */
export interface PurchaseState {
  plan: 'free' | 'monthly' | 'lifetime';
  premiumFortunes: string[];
  expiresAt?: string;
}

/** 占い結果 */
export interface FortuneResult {
  fortuneId: string;
  date: string;
  scores: FortuneScores;
  details: FortuneDetails;
  lucky: LuckyInfo;
  character?: CharacterInfo;
}

/** 6軸スコア */
export interface FortuneScores {
  love: number;
  work: number;
  money: number;
  health: number;
  social: number;
  total: number;
}

/** 6軸詳細テキスト */
export interface FortuneDetails {
  love: string;
  work: string;
  money: string;
  health: string;
  social: string;
  total: string;
}

/** ラッキー情報 */
export interface LuckyInfo {
  color: string;
  item: string;
  direction?: string;
  number?: number;
}

/** キャラクター情報（動物占い用） */
export interface CharacterInfo {
  name: string;
  image: string;
}

/** 占術プラグインインターフェース */
export interface FortunePlugin {
  id: string;
  name: string;
  category: 'free' | 'monthly' | 'premium';
  price?: number;
  requiresInput: string[];
  generate: (date: string, profile?: UserProfile) => FortuneResult;
}

/** 設定エクスポート形式 */
export interface ConfigExport {
  version: string;
  exportedAt: string;
  devConfig: DevConfig;
}
