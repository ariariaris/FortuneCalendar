// 天気予報サービス v2.0 - Open-Meteo API対応
export interface DayWeather {
  date: string;
  icon: string;
  tempMax?: number;
  tempMin?: number;
  rainChance?: number;
}

// WMOコード→アイコン
const WMO_ICONS: Record<number, string> = {
  0: '☀️', 1: '🌤️', 2: '⛅', 3: '☁️',
  45: '🌫️', 48: '🌫️',
  51: '🌧️', 53: '🌧️', 55: '🌧️',
  61: '🌧️', 63: '🌧️', 65: '🌧️',
  71: '🌨️', 73: '🌨️', 75: '🌨️',
  80: '🌧️', 81: '🌧️', 82: '🌧️',
  95: '⛈️', 96: '⛈️', 99: '⛈️',
};
const getIcon = (code: number): string => WMO_ICONS[code] || '❓';

let weatherCache: { data: DayWeather[]; fetchedAt: number; key: string } | null = null;
const CACHE_TTL = 60 * 60 * 1000; // 1時間

/** Open-Meteo API で天気取得 */
export const fetchWeather = async (areaCode: string, lat?: number, lon?: number): Promise<DayWeather[]> => {
  // 緯度経度が指定されていない場合はデフォルト（東京）
  const latitude = lat ?? 35.69;
  const longitude = lon ?? 139.69;
  const cacheKey = `${latitude.toFixed(2)}_${longitude.toFixed(2)}`;

  if (weatherCache && weatherCache.key === cacheKey && Date.now() - weatherCache.fetchedAt < CACHE_TTL) {
    return weatherCache.data;
  }

  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=Asia/Tokyo&forecast_days=7`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('API Error');
    const json = await res.json();
    const result = parseOpenMeteoResponse(json);
    weatherCache = { data: result, fetchedAt: Date.now(), key: cacheKey };
    return result;
  } catch (e) {
    console.error('Weather fetch error:', e);
    return [];
  }
};

const parseOpenMeteoResponse = (json: any): DayWeather[] => {
  const results: DayWeather[] = [];
  const daily = json.daily;
  if (!daily) return results;

  const dates = daily.time || [];
  const codes = daily.weather_code || [];
  const maxTemps = daily.temperature_2m_max || [];
  const minTemps = daily.temperature_2m_min || [];
  const rainProbs = daily.precipitation_probability_max || [];

  for (let i = 0; i < Math.min(dates.length, 7); i++) {
    results.push({
      date: dates[i],
      icon: getIcon(codes[i] ?? 0),
      tempMax: maxTemps[i] !== undefined ? Math.round(maxTemps[i]) : undefined,
      tempMin: minTemps[i] !== undefined ? Math.round(minTemps[i]) : undefined,
      rainChance: rainProbs[i] ?? undefined,
    });
  }
  return results;
};

/** 日付で天気取得 */
export const getWeatherForDate = (weather: DayWeather[], date: string): DayWeather | undefined => {
  return weather.find((w) => w.date === date);
};
