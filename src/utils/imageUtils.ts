// Fortune Calendar 画像処理ユーティリティ v1.0

/** 画像URIからシード値を生成（解析結果の再現性用） */
export function imageUriToSeed(uri: string): number {
  let hash = 0;
  for (let i = 0; i < uri.length; i++) {
    const char = uri.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

/** シード付き乱数生成器 */
export function seededRandom(seed: number): () => number {
  return function() {
    let t = seed += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

/** ランダムに配列から選択 */
export function pickRandom<T>(arr: T[], rand: () => number): T {
  return arr[Math.floor(rand() * arr.length)];
}

/** スコアを0-100の範囲に正規化 */
export function normalizeScore(value: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, Math.round(value)));
}

/** 解析結果のレベル判定 */
export function getScoreLevel(score: number): 'high' | 'mid' | 'low' {
  if (score >= 70) return 'high';
  if (score >= 40) return 'mid';
  return 'low';
}

/** 画像サイズ情報（将来の拡張用） */
export interface ImageInfo {
  uri: string;
  width?: number;
  height?: number;
}

/** 解析遅延シミュレーション */
export function simulateAnalysisDelay(ms: number = 1500): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
