// Fortune Calendar 日別Todo型定義 v1.0

export type DailyTodoType = 'lucky' | 'user';

export interface DailyTodo {
  id: string;
  title: string;
  type: DailyTodoType;  // lucky: ラッキー情報から追加（日付変更で消える）, user: ユーザー追加（手動削除/完了まで残る）
  date: string;         // 作成日 YYYY-MM-DD
  completed: boolean;
  completedAt?: string; // 完了日時
}
