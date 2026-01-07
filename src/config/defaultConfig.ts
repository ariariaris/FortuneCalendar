// Fortune Calendar デフォルト設定 v1.0
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
};

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
export const APP_VERSION = '1.4.0c';
