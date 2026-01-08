// Fortune Calendar マンダラチャート型定義 v1.0

/** 時間軸 */
export type MandalaTimeframe = 'year' | '3year' | '5year' | '10year';

/** アクションステータス */
export type MandalaActionStatus = 'not_started' | 'in_progress' | 'completed';

/** マンダラチャート */
export interface MandalaChart {
  id: string;
  title: string;
  timeframe: MandalaTimeframe;
  centerGoal: string;
  elements: MandalaElement[];
  createdAt: string;
  updatedAt: string;
}

/** マンダラ要素（8つ） */
export interface MandalaElement {
  id: string;
  chartId: string;
  position: number;
  title: string;
  actions: MandalaAction[];
}

/** マンダラアクション（各要素に8つ） */
export interface MandalaAction {
  id: string;
  elementId: string;
  position: number;
  content: string;
  deadline?: string;
  status: MandalaActionStatus;
  linkedTodoId?: string;
  completedAt?: string;
}

/** マンダラTodo */
export interface MandalaTodo {
  id: string;
  mandalaId: string;
  actionId: string;
  title: string;
  deadline?: string;
  isCompleted: boolean;
  completedAt?: string;
  showOnCalendar: boolean;
}

/** 進捗情報 */
export interface MandalaProgress {
  chartId: string;
  totalCells: number;
  filledCells: number;
  completedActions: number;
  progressPercent: number;
}

/** 時間軸表示設定 */
export const TIMEFRAME_LABELS: Record<MandalaTimeframe, string> = {
  year: '今年',
  '3year': '3年後',
  '5year': '5年後',
  '10year': '10年後',
};

/** 時間軸カラー */
export const TIMEFRAME_COLORS: Record<MandalaTimeframe, string> = {
  year: '#3B82F6',
  '3year': '#10B981',
  '5year': '#F59E0B',
  '10year': '#8B5CF6',
};
