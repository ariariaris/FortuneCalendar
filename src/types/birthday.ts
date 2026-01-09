// Fortune Calendar 誕生日型定義 v1.1

/** 誕生日エントリ */
export interface BirthdayEntry {
  id: string;
  contactId: string;
  displayName: string;
  birthday: {
    month: number;
    day: number;
    year?: number;
  };
  importedAt: string;
  showOnCalendar?: boolean;
}

/** 誕生日表示アイテム */
export interface BirthdayDisplayItem {
  date: string;
  entries: BirthdayEntry[];
  isThisMonth: boolean;
  daysUntil: number;
}

/** 連絡先から取得するフィールド */
export const CONTACT_FIELDS = ['name', 'birthday'] as const;
