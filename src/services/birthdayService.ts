// Fortune Calendar 誕生日サービス v1.0
import { Platform } from 'react-native';
import * as Contacts from 'expo-contacts';
import { BirthdayEntry, BirthdayDisplayItem, CONTACT_FIELDS } from '../types/birthday';

/** 連絡先アクセス権限リクエスト */
export const requestContactsPermission = async (): Promise<boolean> => {
  if (Platform.OS === 'web') {
    return false; // Webでは連絡先アクセス不可
  }
  const { status } = await Contacts.requestPermissionsAsync();
  return status === 'granted';
};

/** 権限状態確認 */
export const checkContactsPermission = async (): Promise<boolean> => {
  if (Platform.OS === 'web') return false;
  const { status } = await Contacts.getPermissionsAsync();
  return status === 'granted';
};

/** 連絡先から誕生日を取得 */
export const fetchBirthdays = async (): Promise<BirthdayEntry[]> => {
  if (Platform.OS === 'web') return [];

  const hasPermission = await checkContactsPermission();
  if (!hasPermission) return [];

  try {
    const { data } = await Contacts.getContactsAsync({
      fields: [Contacts.Fields.Name, Contacts.Fields.Birthday],
    });

    const entries: BirthdayEntry[] = [];
    const now = new Date();

    for (const contact of data) {
      if (!contact.birthday || !contact.name) continue;

      const { day, month, year } = contact.birthday;
      if (day === undefined || month === undefined) continue;

      entries.push({
        id: `birthday_${contact.id}`,
        contactId: contact.id || '',
        displayName: contact.name,
        birthday: {
          month: month + 1, // Contacts.jsは0始まり
          day,
          year: year !== undefined ? year : undefined,
        },
        importedAt: now.toISOString(),
      });
    }

    return entries;
  } catch (error) {
    console.error('Fetch birthdays error:', error);
    return [];
  }
};

/** 日付で誕生日をフィルタ */
export const getBirthdaysByDate = (entries: BirthdayEntry[], month: number, day: number): BirthdayEntry[] => {
  return entries.filter((e) => e.birthday.month === month && e.birthday.day === day);
};

/** 月で誕生日をフィルタ */
export const getBirthdaysByMonth = (entries: BirthdayEntry[], month: number): BirthdayEntry[] => {
  return entries.filter((e) => e.birthday.month === month);
};

/** 表示用アイテムに変換 */
export const toBirthdayDisplayItems = (entries: BirthdayEntry[]): BirthdayDisplayItem[] => {
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentDay = now.getDate();

  // 日付でグループ化
  const grouped = new Map<string, BirthdayEntry[]>();
  for (const entry of entries) {
    const key = `${String(entry.birthday.month).padStart(2, '0')}-${String(entry.birthday.day).padStart(2, '0')}`;
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key)!.push(entry);
  }

  const items: BirthdayDisplayItem[] = [];
  for (const [date, birthdayEntries] of grouped) {
    const [m, d] = date.split('-').map(Number);
    const isThisMonth = m === currentMonth;

    // 次の誕生日までの日数計算
    let daysUntil: number;
    const thisYearBirthday = new Date(now.getFullYear(), m - 1, d);
    if (thisYearBirthday >= now) {
      daysUntil = Math.ceil((thisYearBirthday.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    } else {
      const nextYearBirthday = new Date(now.getFullYear() + 1, m - 1, d);
      daysUntil = Math.ceil((nextYearBirthday.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    }

    items.push({
      date,
      entries: birthdayEntries,
      isThisMonth,
      daysUntil,
    });
  }

  // 日付順でソート
  items.sort((a, b) => a.daysUntil - b.daysUntil);
  return items;
};

/** 年齢計算 */
export const calculateAge = (birthYear: number | undefined): number | null => {
  if (birthYear === undefined) return null;
  const now = new Date();
  return now.getFullYear() - birthYear;
};
