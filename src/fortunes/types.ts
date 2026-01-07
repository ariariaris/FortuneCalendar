// Fortune Calendar 占術インターフェース v1.0
import { FortuneResult, UserProfile, FortuneScores, FortuneDetails, LuckyInfo } from '../config/types';

/** 占術プラグインインターフェース */
export interface FortunePlugin {
  /** 占術ID */
  id: string;
  /** 表示名 */
  name: string;
  /** カテゴリ */
  category: 'free' | 'monthly' | 'premium';
  /** 価格（premium時） */
  price?: number;
  /** 必要な入力（生年月日、血液型など） */
  requiresInput: InputType[];
  /** 占い結果生成 */
  generate: (date: string, profile?: UserProfile) => FortuneResult;
}

/** 入力タイプ */
export type InputType = 'birthDate' | 'bloodType' | 'name' | 'none';

/** 占い結果生成ヘルパー */
export const createFortuneResult = (
  fortuneId: string,
  date: string,
  scores: FortuneScores,
  details: FortuneDetails,
  lucky: LuckyInfo,
): FortuneResult => ({
  fortuneId,
  date,
  scores,
  details,
  lucky,
});

/** 詳細テキストテンプレート */
export const DETAIL_TEMPLATES = {
  love: {
    high: ['素敵な出会いの予感', '恋愛運絶好調', '想いが通じやすい日'],
    mid: ['穏やかな恋愛運', '自然体でいるのが吉', 'コミュニケーションを大切に'],
    low: ['焦らず待つのが吉', '自分磨きの日', '内面を見つめ直して'],
  },
  work: {
    high: ['仕事運好調！', '成果が認められる', 'チャンスを掴める'],
    mid: ['コツコツ進める日', '準備に時間を使って', '周囲との協力が鍵'],
    low: ['無理は禁物', '確認を怠らずに', '休息も仕事のうち'],
  },
  money: {
    high: ['臨時収入の予感', '投資に良い日', '金運上昇中'],
    mid: ['堅実な金運', '計画的な支出を', '貯蓄を意識して'],
    low: ['衝動買いに注意', '大きな出費は控えて', '節約モードで'],
  },
  health: {
    high: ['エネルギー満タン', '運動に最適', '健康運絶好調'],
    mid: ['バランス良く過ごして', '規則正しい生活を', '適度な休息を'],
    low: ['無理は禁物', '睡眠を十分に', '体調管理に注意'],
  },
  social: {
    high: ['人間関係良好', '新しい出会いあり', '社交運アップ'],
    mid: ['穏やかな人間関係', '聞き役に回って', '感謝の気持ちを'],
    low: ['一人の時間も大切', '距離感を保って', 'トラブルに注意'],
  },
};
