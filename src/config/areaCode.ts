// Fortune Calendar 気象庁地域コード v1.1 (エリア階層対応)

export interface SubArea {
  code: string;
  name: string;
}

export interface Prefecture {
  code: string;
  name: string;
  areas: SubArea[];
}

/** 都道府県→エリア階層 */
export const PREFECTURES: Prefecture[] = [
  { code: '01', name: '北海道', areas: [
    { code: '011000', name: '宗谷地方' }, { code: '012000', name: '上川・留萌地方' },
    { code: '013000', name: '網走・北見・紋別地方' }, { code: '014030', name: '十勝地方' },
    { code: '015000', name: '釧路・根室地方' }, { code: '016000', name: '石狩・空知・後志地方' },
    { code: '017000', name: '渡島・檜山地方' }, { code: '014100', name: '胆振・日高地方' },
  ]},
  { code: '02', name: '青森県', areas: [{ code: '020000', name: '青森県' }]},
  { code: '03', name: '岩手県', areas: [{ code: '030000', name: '岩手県' }]},
  { code: '04', name: '宮城県', areas: [{ code: '040000', name: '宮城県' }]},
  { code: '05', name: '秋田県', areas: [{ code: '050000', name: '秋田県' }]},
  { code: '06', name: '山形県', areas: [{ code: '060000', name: '山形県' }]},
  { code: '07', name: '福島県', areas: [{ code: '070000', name: '福島県' }]},
  { code: '08', name: '茨城県', areas: [{ code: '080000', name: '茨城県' }]},
  { code: '09', name: '栃木県', areas: [{ code: '090000', name: '栃木県' }]},
  { code: '10', name: '群馬県', areas: [{ code: '100000', name: '群馬県' }]},
  { code: '11', name: '埼玉県', areas: [{ code: '110000', name: '埼玉県' }]},
  { code: '12', name: '千葉県', areas: [{ code: '120000', name: '千葉県' }]},
  { code: '13', name: '東京都', areas: [
    { code: '130000', name: '東京地方' }, { code: '130010', name: '伊豆諸島北部' },
    { code: '130020', name: '伊豆諸島南部' }, { code: '130030', name: '小笠原諸島' },
  ]},
  { code: '14', name: '神奈川県', areas: [{ code: '140000', name: '神奈川県' }]},
  { code: '15', name: '新潟県', areas: [{ code: '150000', name: '新潟県' }]},
  { code: '16', name: '富山県', areas: [{ code: '160000', name: '富山県' }]},
  { code: '17', name: '石川県', areas: [{ code: '170000', name: '石川県' }]},
  { code: '18', name: '福井県', areas: [{ code: '180000', name: '福井県' }]},
  { code: '19', name: '山梨県', areas: [{ code: '190000', name: '山梨県' }]},
  { code: '20', name: '長野県', areas: [{ code: '200000', name: '長野県' }]},
  { code: '21', name: '岐阜県', areas: [{ code: '210000', name: '岐阜県' }]},
  { code: '22', name: '静岡県', areas: [{ code: '220000', name: '静岡県' }]},
  { code: '23', name: '愛知県', areas: [{ code: '230000', name: '愛知県' }]},
  { code: '24', name: '三重県', areas: [{ code: '240000', name: '三重県' }]},
  { code: '25', name: '滋賀県', areas: [{ code: '250000', name: '滋賀県' }]},
  { code: '26', name: '京都府', areas: [{ code: '260000', name: '京都府' }]},
  { code: '27', name: '大阪府', areas: [{ code: '270000', name: '大阪府' }]},
  { code: '28', name: '兵庫県', areas: [{ code: '280000', name: '兵庫県' }]},
  { code: '29', name: '奈良県', areas: [{ code: '290000', name: '奈良県' }]},
  { code: '30', name: '和歌山県', areas: [{ code: '300000', name: '和歌山県' }]},
  { code: '31', name: '鳥取県', areas: [{ code: '310000', name: '鳥取県' }]},
  { code: '32', name: '島根県', areas: [{ code: '320000', name: '島根県' }]},
  { code: '33', name: '岡山県', areas: [{ code: '330000', name: '岡山県' }]},
  { code: '34', name: '広島県', areas: [{ code: '340000', name: '広島県' }]},
  { code: '35', name: '山口県', areas: [{ code: '350000', name: '山口県' }]},
  { code: '36', name: '徳島県', areas: [{ code: '360000', name: '徳島県' }]},
  { code: '37', name: '香川県', areas: [{ code: '370000', name: '香川県' }]},
  { code: '38', name: '愛媛県', areas: [{ code: '380000', name: '愛媛県' }]},
  { code: '39', name: '高知県', areas: [{ code: '390000', name: '高知県' }]},
  { code: '40', name: '福岡県', areas: [{ code: '400000', name: '福岡県' }]},
  { code: '41', name: '佐賀県', areas: [{ code: '410000', name: '佐賀県' }]},
  { code: '42', name: '長崎県', areas: [{ code: '420000', name: '長崎県' }]},
  { code: '43', name: '熊本県', areas: [{ code: '430000', name: '熊本県' }]},
  { code: '44', name: '大分県', areas: [{ code: '440000', name: '大分県' }]},
  { code: '45', name: '宮崎県', areas: [{ code: '450000', name: '宮崎県' }]},
  { code: '46', name: '鹿児島県', areas: [
    { code: '460100', name: '鹿児島県（本土）' }, { code: '460040', name: '奄美地方' },
  ]},
  { code: '47', name: '沖縄県', areas: [
    { code: '471000', name: '沖縄本島地方' }, { code: '472000', name: '大東島地方' },
    { code: '473000', name: '宮古島地方' }, { code: '474000', name: '八重山地方' },
  ]},
];

/** コードから地域名取得 */
export const getAreaName = (code: string): string => {
  for (const pref of PREFECTURES) {
    const area = pref.areas.find(a => a.code === code);
    if (area) return `${pref.name} ${area.name}`;
  }
  return '東京都';
};

/** コードから都道府県取得 */
export const getPrefectureByCode = (code: string): Prefecture | undefined => {
  return PREFECTURES.find(p => p.areas.some(a => a.code === code));
};

/** 緯度経度から最寄りの地域コード取得 */
export const getAreaCodeFromCoords = async (lat: number, lon: number): Promise<string> => {
  const prefCoords: { code: string; lat: number; lon: number }[] = [
    { code: '016000', lat: 43.06, lon: 141.35 },
    { code: '020000', lat: 40.82, lon: 140.74 },
    { code: '030000', lat: 39.70, lon: 141.15 },
    { code: '040000', lat: 38.27, lon: 140.87 },
    { code: '050000', lat: 39.72, lon: 140.10 },
    { code: '060000', lat: 38.24, lon: 140.34 },
    { code: '070000', lat: 37.75, lon: 140.47 },
    { code: '080000', lat: 36.34, lon: 140.45 },
    { code: '090000', lat: 36.57, lon: 139.88 },
    { code: '100000', lat: 36.39, lon: 139.06 },
    { code: '110000', lat: 35.86, lon: 139.65 },
    { code: '120000', lat: 35.61, lon: 140.12 },
    { code: '130000', lat: 35.69, lon: 139.69 },
    { code: '140000', lat: 35.45, lon: 139.64 },
    { code: '150000', lat: 37.90, lon: 139.02 },
    { code: '160000', lat: 36.70, lon: 137.21 },
    { code: '170000', lat: 36.59, lon: 136.63 },
    { code: '180000', lat: 36.07, lon: 136.22 },
    { code: '190000', lat: 35.66, lon: 138.57 },
    { code: '200000', lat: 36.65, lon: 138.18 },
    { code: '210000', lat: 35.39, lon: 136.72 },
    { code: '220000', lat: 34.98, lon: 138.38 },
    { code: '230000', lat: 35.18, lon: 136.91 },
    { code: '240000', lat: 34.73, lon: 136.51 },
    { code: '250000', lat: 35.00, lon: 135.87 },
    { code: '260000', lat: 35.02, lon: 135.76 },
    { code: '270000', lat: 34.69, lon: 135.52 },
    { code: '280000', lat: 34.69, lon: 135.18 },
    { code: '290000', lat: 34.69, lon: 135.83 },
    { code: '300000', lat: 34.23, lon: 135.17 },
    { code: '310000', lat: 35.50, lon: 134.24 },
    { code: '320000', lat: 35.47, lon: 133.05 },
    { code: '330000', lat: 34.66, lon: 133.93 },
    { code: '340000', lat: 34.40, lon: 132.46 },
    { code: '350000', lat: 34.19, lon: 131.47 },
    { code: '360000', lat: 34.07, lon: 134.56 },
    { code: '370000', lat: 34.34, lon: 134.04 },
    { code: '380000', lat: 33.84, lon: 132.77 },
    { code: '390000', lat: 33.56, lon: 133.53 },
    { code: '400000', lat: 33.61, lon: 130.42 },
    { code: '410000', lat: 33.25, lon: 130.30 },
    { code: '420000', lat: 32.74, lon: 129.87 },
    { code: '430000', lat: 32.79, lon: 130.74 },
    { code: '440000', lat: 33.24, lon: 131.61 },
    { code: '450000', lat: 31.91, lon: 131.42 },
    { code: '460100', lat: 31.56, lon: 130.56 },
    { code: '471000', lat: 26.21, lon: 127.68 },
  ];
  let minDist = Infinity, nearestCode = '130000';
  for (const p of prefCoords) {
    const dist = Math.sqrt(Math.pow(lat - p.lat, 2) + Math.pow(lon - p.lon, 2));
    if (dist < minDist) { minDist = dist; nearestCode = p.code; }
  }
  return nearestCode;
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
