// Fortune Calendar デフォルト設定 v1.1 (MMP拡張対応)
import { DevConfig, UserConfig } from './types';

export const DEFAULT_DEV_CONFIG: DevConfig = {
  ui: {
    chartAxes: ['恋愛運', '仕事運', '金運', '健康運', '対人運', '総合運'],
    defaultFortune: 'honDoubutsu',
    themeColor: '#FF69B4',
  },
  fortune: {
    updateHour: 5,
    historyDays: 7,
    enabledFortunes: [
      'honDoubutsu', 'seiza', 'tarot', 'bloodType', 'numerology', 'omikuji',
    ],
  },
  payment: {
    monthlyPrice: 380,
    lifetimePrice: 1480,
    showAds: true,
  },
  system: {
    debugLog: false,
    mockResults: false,
  },
};

export const DEFAULT_USER_CONFIG: UserConfig = {
  userProfile: null,
  selectedFortune: 'honDoubutsu',
  enabledFortunes: ['honDoubutsu'],
  calendarLinked: false,
  notificationEnabled: true,
  notificationTime: '07:00',
  themeMode: 'light',
  themeColor: '#FF69B4',  // デフォルト: ピンク
  fontSize: 'md',  // デフォルト: 中
  calendarViewMode: 'month',  // デフォルト: 月表示
  starColorMode: 'simple',
  purchaseState: {
    plan: 'free',
    premiumFortunes: [],
  },
  weatherConfig: {
    enabled: true,
    showIcon: true,
    showTemp: true,
    showRain: true,
    areaCode: '130000',  // 東京
  },
  yearCalendarBestCount: 3,
  showAge: true,
  defaultTab: 'Calendar',  // 起動時デフォルト: 月タブ
  // MMP拡張設定
  externalCalendar: {
    enabled: false,
    syncInterval: 60,
    showEventDetails: true,
  },
  birthday: {
    enabled: false,
    showAge: true,
    notifyDaysBefore: 0,
  },
  mandala: {
    enabled: false,
    showOnCalendar: true,
    defaultTimeframe: 'year',
  },
  showSplash: true,  // 起動スプラッシュ表示
};

/** テーマカラー20色 */
export const THEME_COLORS = [
  { id: 'pink', name: 'ピンク', color: '#FF69B4' },
  { id: 'rose', name: 'ローズ', color: '#E91E63' },
  { id: 'red', name: 'レッド', color: '#F44336' },
  { id: 'orange', name: 'オレンジ', color: '#FF9800' },
  { id: 'amber', name: 'アンバー', color: '#FFC107' },
  { id: 'yellow', name: 'イエロー', color: '#FFEB3B' },
  { id: 'lime', name: 'ライム', color: '#CDDC39' },
  { id: 'green', name: 'グリーン', color: '#4CAF50' },
  { id: 'teal', name: 'ティール', color: '#009688' },
  { id: 'cyan', name: 'シアン', color: '#00BCD4' },
  { id: 'lightblue', name: 'ライトブルー', color: '#03A9F4' },
  { id: 'blue', name: 'ブルー', color: '#2196F3' },
  { id: 'indigo', name: 'インディゴ', color: '#3F51B5' },
  { id: 'purple', name: 'パープル', color: '#9C27B0' },
  { id: 'deeppurple', name: 'ディープパープル', color: '#673AB7' },
  { id: 'brown', name: 'ブラウン', color: '#795548' },
  { id: 'grey', name: 'グレー', color: '#9E9E9E' },
  { id: 'bluegrey', name: 'ブルーグレー', color: '#607D8B' },
  { id: 'black', name: 'ブラック', color: '#212121' },
  { id: 'white', name: 'ホワイト', color: '#FAFAFA' },
] as const;

/** フォントサイズ設定 */
export const FONT_SIZES = {
  xs: { label: '極小', base: 10, scale: 0.8 },
  sm: { label: '小', base: 12, scale: 0.9 },
  md: { label: '中', base: 14, scale: 1.0 },
  lg: { label: '大', base: 16, scale: 1.1 },
  xl: { label: '特大', base: 18, scale: 1.2 },
} as const;

/** 占術一覧（動物占いをメインに） */
export const FORTUNE_LIST = [
  { id: 'honDoubutsu', name: '動物占い', category: 'free' as const },
  { id: 'seiza', name: '星座占い', category: 'free' as const },
  { id: 'tarot', name: 'タロット', category: 'free' as const },
  { id: 'bloodType', name: '血液型占い', category: 'free' as const },
  { id: 'numerology', name: '数秘術', category: 'free' as const },
  { id: 'omikuji', name: 'おみくじ', category: 'free' as const },
  { id: 'aishou', name: '相性診断', category: 'monthly' as const },
  { id: 'moonSign', name: '月星座', category: 'monthly' as const },
  { id: 'birthday', name: '誕生日占い', category: 'monthly' as const },
  { id: 'doubutsu', name: '動物占い', category: 'monthly' as const },
  { id: 'seimei', name: '姓名判断', category: 'monthly' as const },
  { id: 'tesou', name: '手相AI', category: 'premium' as const, price: 480 },
  { id: 'aura', name: 'オーラ診断', category: 'premium' as const, price: 480 },
  { id: 'zensei', name: '前世占い', category: 'premium' as const, price: 480 },
  { id: 'yume', name: '夢占い', category: 'premium' as const, price: 480 },
  { id: 'hana', name: '花占い', category: 'premium' as const, price: 320 },
  { id: 'iro', name: '色占い', category: 'premium' as const, price: 320 },
] as const;

export const DEV_PASSCODE = '123456';
export const APP_VERSION = '1.6.0';
