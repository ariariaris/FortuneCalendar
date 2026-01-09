// Fortune Calendar 目標管理型定義 v1.0

/** 時間軸 */
export type GoalTimeframe = 'year' | '3year' | '5year' | '10year';

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
  category?: string;
  imageUrl?: string;
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
