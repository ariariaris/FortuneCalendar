// Fortune Calendar 目標管理型定義 v1.5 (リマインダー追加)

/** 期間単位 */
export type DurationUnit = 'year' | 'month' | 'week';

/** 時間単位 */
export type TimeUnit = 'hour' | 'minute';

/** 期間設定（数値+単位） */
export interface DurationConfig {
  value: number;
  unit: DurationUnit;
}

/** 期限自動設定タイプ */
export type GoalDeadlineDefault = 'today' | 'birthday' | 'yearEnd';

/** 旧型（互換性維持） */
export type GoalTimeframe = 'year' | '1year' | '2year' | '3year' | '5year' | '10year';
export type MustDoDefaultWeeks = 1 | 2 | 4;

/** 目標ステータス */
export type GoalStatus = 'not_started' | 'in_progress' | 'completed' | 'cancelled';

/** やるべき優先度 */
export type MustDoPriority = 'high' | 'medium' | 'low';

/** やるべき時間軸 */
export type MustDoTimeframe = 'week' | 'month';

/** 夢 */
export interface Dream {
  id: string;
  title: string;
  description?: string;
  targetYear: number;
  deadline?: string;       // デフォルト: [targetYear]/[誕生月日]
  category?: string;       // カテゴリー名（旧：仕事、健康、趣味など）→ 廃止予定
  calendarId?: string;     // ネイティブカレンダーID
  color?: string;          // 表示色（#FF69B4など）
  imageUrl?: string;
  reminders?: number[];    // リマインダー（分単位）最大3個
  createdAt: string;
  updatedAt: string;
}

/** 目的 */
export interface Purpose {
  id: string;
  dreamId?: string;
  title: string;
  reasons: string[];
  createdAt: string;
  updatedAt: string;
}

/** 目標 */
export interface Goal {
  id: string;
  dreamId?: string;
  purposeId?: string;
  title: string;
  description?: string;
  timeframe: GoalTimeframe;
  deadline?: string;
  progress: number;
  status: GoalStatus;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

/** やるべきアイテム */
export interface MustDoItem {
  id: string;
  goalId?: string;
  title: string;
  description?: string;
  priority: MustDoPriority;
  deadline: string;
  timeframe: MustDoTimeframe;
  status: 'pending' | 'completed';
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

/** Todoアイテム */
export interface TodoItem {
  id: string;
  mustDoId?: string;
  title: string;
  date: string;
  durationMinutes: number;  // 所要時間（分）デフォルト60
  reminders?: number[];     // リマインダー（分単位）最大3個
  isCompleted: boolean;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

/** カレンダー表示用アイテム */
export interface CalendarGoalItem {
  id: string;
  type: 'todo' | 'mustdo' | 'goal' | 'dream';
  title: string;
  date: string;
  isCompleted?: boolean;
  priority?: MustDoPriority;
}
