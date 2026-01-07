// 天気予報サービス v1.0 - 気象庁API
export interface DayWeather {
  date: string;        // YYYY-MM-DD
  weatherCode: string; // 気象庁天気コード
  icon: string;        // アイコン絵文字
  tempMax?: number;
  tempMin?: number;
  rainChance?: number; // 降水確率(%)
}

// 天気コード→アイコンマッピング
const WEATHER_ICONS: Record<string, string> = {
  '100': '☀️', '101': '🌤️', '102': '🌤️', '103': '🌤️', '104': '🌤️',
  '110': '🌤️', '111': '🌤️', '112': '🌤️', '113': '🌤️',
  '200': '☁️', '201': '☁️', '202': '☁️', '203': '☁️', '204': '☁️',
  '210': '☁️', '211': '☁️', '212': '☁️', '213': '☁️',
  '300': '🌧️', '301': '🌧️', '302': '🌧️', '303': '🌧️',
  '311': '🌧️', '313': '🌧️', '314': '🌧️',
  '400': '🌨️', '401': '🌨️', '402': '🌨️', '403': '🌨️',
  '411': '🌨️', '413': '🌨️', '414': '🌨️',
};
const getIcon = (code: string): string => WEATHER_ICONS[code] || '❓';

let weatherCache: { data: DayWeather[]; fetchedAt: number; areaCode: string } | null = null;
const CACHE_TTL = 3 * 60 * 60 * 1000; // 3時間

/** 天気予報取得（気象庁API） */
export const fetchWeather = async (areaCode: string): Promise<DayWeather[]> => {
  // キャッシュ有効なら返す
  if (weatherCache && weatherCache.areaCode === areaCode && Date.now() - weatherCache.fetchedAt < CACHE_TTL) {
    return weatherCache.data;
  }
  try {
    const res = await fetch(`https://www.jma.go.jp/bosai/forecast/data/forecast/${areaCode}.json`);
    if (!res.ok) throw new Error('API Error');
    const json = await res.json();
    const result = parseJmaResponse(json);
    weatherCache = { data: result, fetchedAt: Date.now(), areaCode };
    return result;
  } catch (e) {
    console.error('Weather fetch error:', e);
    return [];
  }
};

/** 気象庁JSONパース */
const parseJmaResponse = (json: any): DayWeather[] => {
  const results: DayWeather[] = [];
  const ts = json[0]?.timeSeries;
  if (!ts || ts.length < 2) return results;

  // 天気コード取得
  const weatherTs = ts[0];
  const dates = weatherTs.timeDefines?.map((d: string) => d.split('T')[0]) || [];
  const codes = weatherTs.areas?.[0]?.weatherCodes || [];

  // 気温取得（別timeSeries）
  const tempTs = ts[2];
  const tempDates = tempTs?.timeDefines?.map((d: string) => d.split('T')[0]) || [];
  const temps = tempTs?.areas?.[0]?.temps || [];

  // 降水確率取得
  const popTs = ts[1];
  const popDates = popTs?.timeDefines?.map((d: string) => d.split('T')[0]) || [];
  const pops = popTs?.areas?.[0]?.pops || [];

  for (let i = 0; i < dates.length && i < 3; i++) {
    const date = dates[i];
    const code = codes[i] || '100';
    const tempIdx = tempDates.indexOf(date);
    const popIdx = popDates.findIndex((d: string) => d === date);

    results.push({
      date,
      weatherCode: code,
      icon: getIcon(code),
      tempMax: tempIdx >= 0 && temps[tempIdx * 2 + 1] ? parseInt(temps[tempIdx * 2 + 1]) : undefined,
      tempMin: tempIdx >= 0 && temps[tempIdx * 2] ? parseInt(temps[tempIdx * 2]) : undefined,
      rainChance: popIdx >= 0 && pops[popIdx] ? parseInt(pops[popIdx]) : undefined,
    });
  }
  return results;
};

/** 日付で天気取得 */
export const getWeatherForDate = (weather: DayWeather[], date: string): DayWeather | undefined => {
  return weather.find((w) => w.date === date);
};
