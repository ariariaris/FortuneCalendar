// Fortune Calendar 地域コード v2.0 (緯度経度ベース・23区対応)

export interface Area {
  code: string;
  name: string;
  lat: number;
  lon: number;
}

export interface Prefecture {
  code: string;
  name: string;
  areas: Area[];
}

/** 都道府県→エリア（緯度経度付き） */
export const PREFECTURES: Prefecture[] = [
  { code: '01', name: '北海道', areas: [
    { code: '01-sapporo', name: '札幌', lat: 43.06, lon: 141.35 },
    { code: '01-hakodate', name: '函館', lat: 41.77, lon: 140.73 },
    { code: '01-asahikawa', name: '旭川', lat: 43.77, lon: 142.37 },
  ]},
  { code: '02', name: '青森県', areas: [{ code: '02', name: '青森', lat: 40.82, lon: 140.74 }]},
  { code: '03', name: '岩手県', areas: [{ code: '03', name: '盛岡', lat: 39.70, lon: 141.15 }]},
  { code: '04', name: '宮城県', areas: [{ code: '04', name: '仙台', lat: 38.27, lon: 140.87 }]},
  { code: '05', name: '秋田県', areas: [{ code: '05', name: '秋田', lat: 39.72, lon: 140.10 }]},
  { code: '06', name: '山形県', areas: [{ code: '06', name: '山形', lat: 38.24, lon: 140.34 }]},
  { code: '07', name: '福島県', areas: [{ code: '07', name: '福島', lat: 37.75, lon: 140.47 }]},
  { code: '08', name: '茨城県', areas: [{ code: '08', name: '水戸', lat: 36.34, lon: 140.45 }]},
  { code: '09', name: '栃木県', areas: [{ code: '09', name: '宇都宮', lat: 36.57, lon: 139.88 }]},
  { code: '10', name: '群馬県', areas: [{ code: '10', name: '前橋', lat: 36.39, lon: 139.06 }]},
  { code: '11', name: '埼玉県', areas: [
    { code: '11-saitama', name: 'さいたま', lat: 35.86, lon: 139.65 },
    { code: '11-kawagoe', name: '川越', lat: 35.93, lon: 139.49 },
  ]},
  { code: '12', name: '千葉県', areas: [
    { code: '12-chiba', name: '千葉', lat: 35.61, lon: 140.12 },
    { code: '12-funabashi', name: '船橋', lat: 35.69, lon: 139.98 },
  ]},
  { code: '13', name: '東京都', areas: [
    { code: '13-chiyoda', name: '千代田区', lat: 35.694, lon: 139.754 },
    { code: '13-chuo', name: '中央区', lat: 35.671, lon: 139.772 },
    { code: '13-minato', name: '港区', lat: 35.658, lon: 139.752 },
    { code: '13-shinjuku', name: '新宿区', lat: 35.694, lon: 139.703 },
    { code: '13-bunkyo', name: '文京区', lat: 35.708, lon: 139.752 },
    { code: '13-taito', name: '台東区', lat: 35.713, lon: 139.780 },
    { code: '13-sumida', name: '墨田区', lat: 35.711, lon: 139.801 },
    { code: '13-koto', name: '江東区', lat: 35.673, lon: 139.817 },
    { code: '13-shinagawa', name: '品川区', lat: 35.609, lon: 139.730 },
    { code: '13-meguro', name: '目黒区', lat: 35.641, lon: 139.698 },
    { code: '13-ota', name: '大田区', lat: 35.561, lon: 139.716 },
    { code: '13-setagaya', name: '世田谷区', lat: 35.646, lon: 139.653 },
    { code: '13-shibuya', name: '渋谷区', lat: 35.664, lon: 139.698 },
    { code: '13-nakano', name: '中野区', lat: 35.707, lon: 139.664 },
    { code: '13-suginami', name: '杉並区', lat: 35.700, lon: 139.636 },
    { code: '13-toshima', name: '豊島区', lat: 35.726, lon: 139.717 },
    { code: '13-kita', name: '北区', lat: 35.753, lon: 139.734 },
    { code: '13-arakawa', name: '荒川区', lat: 35.736, lon: 139.783 },
    { code: '13-itabashi', name: '板橋区', lat: 35.751, lon: 139.709 },
    { code: '13-nerima', name: '練馬区', lat: 35.736, lon: 139.652 },
    { code: '13-adachi', name: '足立区', lat: 35.775, lon: 139.805 },
    { code: '13-katsushika', name: '葛飾区', lat: 35.743, lon: 139.847 },
    { code: '13-edogawa', name: '江戸川区', lat: 35.707, lon: 139.868 },
    { code: '13-hachioji', name: '八王子', lat: 35.666, lon: 139.316 },
    { code: '13-tachikawa', name: '立川', lat: 35.714, lon: 139.410 },
  ]},
  { code: '14', name: '神奈川県', areas: [
    { code: '14-yokohama', name: '横浜', lat: 35.45, lon: 139.64 },
    { code: '14-kawasaki', name: '川崎', lat: 35.53, lon: 139.70 },
  ]},
  { code: '15', name: '新潟県', areas: [{ code: '15', name: '新潟', lat: 37.90, lon: 139.02 }]},
  { code: '16', name: '富山県', areas: [{ code: '16', name: '富山', lat: 36.70, lon: 137.21 }]},
  { code: '17', name: '石川県', areas: [{ code: '17', name: '金沢', lat: 36.59, lon: 136.63 }]},
  { code: '18', name: '福井県', areas: [{ code: '18', name: '福井', lat: 36.07, lon: 136.22 }]},
  { code: '19', name: '山梨県', areas: [{ code: '19', name: '甲府', lat: 35.66, lon: 138.57 }]},
  { code: '20', name: '長野県', areas: [{ code: '20', name: '長野', lat: 36.65, lon: 138.18 }]},
  { code: '21', name: '岐阜県', areas: [{ code: '21', name: '岐阜', lat: 35.39, lon: 136.72 }]},
  { code: '22', name: '静岡県', areas: [{ code: '22', name: '静岡', lat: 34.98, lon: 138.38 }]},
  { code: '23', name: '愛知県', areas: [
    { code: '23-nagoya', name: '名古屋', lat: 35.18, lon: 136.91 },
  ]},
  { code: '24', name: '三重県', areas: [{ code: '24', name: '津', lat: 34.73, lon: 136.51 }]},
  { code: '25', name: '滋賀県', areas: [{ code: '25', name: '大津', lat: 35.00, lon: 135.87 }]},
  { code: '26', name: '京都府', areas: [{ code: '26', name: '京都', lat: 35.02, lon: 135.76 }]},
  { code: '27', name: '大阪府', areas: [{ code: '27', name: '大阪', lat: 34.69, lon: 135.52 }]},
  { code: '28', name: '兵庫県', areas: [
    { code: '28-kobe', name: '神戸', lat: 34.69, lon: 135.18 },
  ]},
  { code: '29', name: '奈良県', areas: [{ code: '29', name: '奈良', lat: 34.69, lon: 135.83 }]},
  { code: '30', name: '和歌山県', areas: [{ code: '30', name: '和歌山', lat: 34.23, lon: 135.17 }]},
  { code: '31', name: '鳥取県', areas: [{ code: '31', name: '鳥取', lat: 35.50, lon: 134.24 }]},
  { code: '32', name: '島根県', areas: [{ code: '32', name: '松江', lat: 35.47, lon: 133.05 }]},
  { code: '33', name: '岡山県', areas: [{ code: '33', name: '岡山', lat: 34.66, lon: 133.93 }]},
  { code: '34', name: '広島県', areas: [{ code: '34', name: '広島', lat: 34.40, lon: 132.46 }]},
  { code: '35', name: '山口県', areas: [{ code: '35', name: '山口', lat: 34.19, lon: 131.47 }]},
  { code: '36', name: '徳島県', areas: [{ code: '36', name: '徳島', lat: 34.07, lon: 134.56 }]},
  { code: '37', name: '香川県', areas: [{ code: '37', name: '高松', lat: 34.34, lon: 134.04 }]},
  { code: '38', name: '愛媛県', areas: [{ code: '38', name: '松山', lat: 33.84, lon: 132.77 }]},
  { code: '39', name: '高知県', areas: [{ code: '39', name: '高知', lat: 33.56, lon: 133.53 }]},
  { code: '40', name: '福岡県', areas: [{ code: '40', name: '福岡', lat: 33.61, lon: 130.42 }]},
  { code: '41', name: '佐賀県', areas: [{ code: '41', name: '佐賀', lat: 33.25, lon: 130.30 }]},
  { code: '42', name: '長崎県', areas: [{ code: '42', name: '長崎', lat: 32.74, lon: 129.87 }]},
  { code: '43', name: '熊本県', areas: [{ code: '43', name: '熊本', lat: 32.79, lon: 130.74 }]},
  { code: '44', name: '大分県', areas: [{ code: '44', name: '大分', lat: 33.24, lon: 131.61 }]},
  { code: '45', name: '宮崎県', areas: [{ code: '45', name: '宮崎', lat: 31.91, lon: 131.42 }]},
  { code: '46', name: '鹿児島県', areas: [{ code: '46', name: '鹿児島', lat: 31.56, lon: 130.56 }]},
  { code: '47', name: '沖縄県', areas: [
    { code: '47-naha', name: '那覇', lat: 26.21, lon: 127.68 },
    { code: '47-miyako', name: '宮古島', lat: 24.81, lon: 125.28 },
    { code: '47-ishigaki', name: '石垣島', lat: 24.34, lon: 124.16 },
  ]},
];

/** コードからエリア情報取得 */
export const getAreaByCode = (code: string): Area | undefined => {
  for (const pref of PREFECTURES) {
    const area = pref.areas.find(a => a.code === code);
    if (area) return area;
  }
  return undefined;
};

/** コードから地域名取得 */
export const getAreaName = (code: string): string => {
  const area = getAreaByCode(code);
  if (!area) return '東京都';
  const pref = PREFECTURES.find(p => p.areas.some(a => a.code === code));
  return `${pref?.name || ''} ${area.name}`;
};

/** コードから都道府県取得 */
export const getPrefectureByCode = (code: string): Prefecture | undefined => {
  return PREFECTURES.find(p => p.areas.some(a => a.code === code));
};

/** GPS位置取得 */
export const getCurrentPosition = (): Promise<{ lat: number; lon: number }> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) { reject(new Error('Geolocation not supported')); return; }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
      (err) => reject(err),
      { timeout: 10000 }
    );
  });
};

/** 緯度経度から最寄りエリアコード取得 */
export const getAreaCodeFromCoords = async (lat: number, lon: number): Promise<string> => {
  let minDist = Infinity, nearestCode = '13-chiyoda';
  for (const pref of PREFECTURES) {
    for (const area of pref.areas) {
      const dist = Math.sqrt(Math.pow(lat - area.lat, 2) + Math.pow(lon - area.lon, 2));
      if (dist < minDist) { minDist = dist; nearestCode = area.code; }
    }
  }
  return nearestCode;
};
