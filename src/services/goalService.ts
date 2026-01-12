// Fortune Calendar 目標管理サービス v1.3 (リマインダー対応)
import { Platform } from 'react-native';
import { Dream, Purpose, Goal, MustDoItem, TodoItem, CalendarGoalItem } from '../types/goalManagement';

let db: any = null;
const WEB_KEYS = {
  dreams: '@goal_dreams',
  purposes: '@goal_purposes',
  goals: '@goal_goals',
  mustDo: '@goal_mustdo',
  todos: '@goal_todos',
};

const generateId = () => `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
const now = () => new Date().toISOString();

/** DB初期化 */
export const initGoalService = async (): Promise<void> => {
  if (Platform.OS === 'web') return;
  try {
    const SQLite = await import('expo-sqlite');
    db = await SQLite.openDatabaseAsync('fortune_calendar.db');
  } catch (error) {
    console.error('Goal service init error:', error);
  }
};

// =====================
// 夢リスト CRUD
// =====================

export const getDreams = async (): Promise<Dream[]> => {
  if (Platform.OS === 'web') {
    const data = localStorage.getItem(WEB_KEYS.dreams);
    return data ? JSON.parse(data) : [];
  }
  if (!db) return [];
  const rows = await db.getAllAsync<any>('SELECT * FROM dreams ORDER BY target_year');
  return rows.map((r: any) => ({
    id: r.id, title: r.title, description: r.description, targetYear: r.target_year,
    deadline: r.deadline, category: r.category, color: r.color, imageUrl: r.image_url,
    reminders: r.reminders ? JSON.parse(r.reminders) : undefined,
    createdAt: r.created_at, updatedAt: r.updated_at,
  }));
};

export const saveDream = async (dream: Omit<Dream, 'id' | 'createdAt' | 'updatedAt'>): Promise<Dream> => {
  const newDream: Dream = { ...dream, id: generateId(), createdAt: now(), updatedAt: now() };
  if (Platform.OS === 'web') {
    const dreams = await getDreams();
    dreams.push(newDream);
    localStorage.setItem(WEB_KEYS.dreams, JSON.stringify(dreams));
    return newDream;
  }
  if (!db) return newDream;
  await db.runAsync(
    'INSERT INTO dreams (id, title, description, target_year, deadline, category, color, image_url, reminders, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [newDream.id, newDream.title, newDream.description, newDream.targetYear, newDream.deadline, newDream.category, newDream.color, newDream.imageUrl, newDream.reminders ? JSON.stringify(newDream.reminders) : null, newDream.createdAt, newDream.updatedAt]
  );
  return newDream;
};

export const updateDream = async (id: string, data: Partial<Dream>): Promise<void> => {
  if (Platform.OS === 'web') {
    const dreams = await getDreams();
    const idx = dreams.findIndex(d => d.id === id);
    if (idx >= 0) { dreams[idx] = { ...dreams[idx], ...data, updatedAt: now() }; localStorage.setItem(WEB_KEYS.dreams, JSON.stringify(dreams)); }
    return;
  }
  if (!db) return;
  const fieldMap: Record<string, string> = { targetYear: 'target_year', imageUrl: 'image_url' };
  const updates = Object.entries(data).map(([k]) => `${fieldMap[k] || k} = ?`);
  await db.runAsync(`UPDATE dreams SET ${updates.join(', ')}, updated_at = ? WHERE id = ?`, [...Object.values(data), now(), id]);
};

export const deleteDream = async (id: string): Promise<void> => {
  if (Platform.OS === 'web') {
    const dreams = (await getDreams()).filter(d => d.id !== id);
    localStorage.setItem(WEB_KEYS.dreams, JSON.stringify(dreams));
    return;
  }
  if (!db) return;
  await db.runAsync('DELETE FROM dreams WHERE id = ?', [id]);
};

// =====================
// 目的 CRUD
// =====================

export const getPurposes = async (): Promise<Purpose[]> => {
  if (Platform.OS === 'web') {
    const data = localStorage.getItem(WEB_KEYS.purposes);
    return data ? JSON.parse(data) : [];
  }
  if (!db) return [];
  const rows = await db.getAllAsync<any>('SELECT * FROM purposes ORDER BY created_at DESC');
  return rows.map((r: any) => ({
    id: r.id, dreamId: r.dream_id, title: r.title, reasons: JSON.parse(r.reasons),
    createdAt: r.created_at, updatedAt: r.updated_at,
  }));
};

export const savePurpose = async (purpose: Omit<Purpose, 'id' | 'createdAt' | 'updatedAt'>): Promise<Purpose> => {
  const newPurpose: Purpose = { ...purpose, id: generateId(), createdAt: now(), updatedAt: now() };
  if (Platform.OS === 'web') {
    const purposes = await getPurposes();
    purposes.push(newPurpose);
    localStorage.setItem(WEB_KEYS.purposes, JSON.stringify(purposes));
    return newPurpose;
  }
  if (!db) return newPurpose;
  await db.runAsync(
    'INSERT INTO purposes (id, dream_id, title, reasons, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
    [newPurpose.id, newPurpose.dreamId, newPurpose.title, JSON.stringify(newPurpose.reasons), newPurpose.createdAt, newPurpose.updatedAt]
  );
  return newPurpose;
};

export const updatePurpose = async (id: string, data: Partial<Purpose>): Promise<void> => {
  if (Platform.OS === 'web') {
    const purposes = await getPurposes();
    const idx = purposes.findIndex(p => p.id === id);
    if (idx >= 0) { purposes[idx] = { ...purposes[idx], ...data, updatedAt: now() }; localStorage.setItem(WEB_KEYS.purposes, JSON.stringify(purposes)); }
    return;
  }
  if (!db) return;
  const updateData = { ...data, reasons: data.reasons ? JSON.stringify(data.reasons) : undefined };
  await db.runAsync(`UPDATE purposes SET title = COALESCE(?, title), dream_id = COALESCE(?, dream_id), reasons = COALESCE(?, reasons), updated_at = ? WHERE id = ?`,
    [updateData.title, updateData.dreamId, updateData.reasons, now(), id]);
};

export const deletePurpose = async (id: string): Promise<void> => {
  if (Platform.OS === 'web') {
    const purposes = (await getPurposes()).filter(p => p.id !== id);
    localStorage.setItem(WEB_KEYS.purposes, JSON.stringify(purposes));
    return;
  }
  if (!db) return;
  await db.runAsync('DELETE FROM purposes WHERE id = ?', [id]);
};

// =====================
// 目標 CRUD
// =====================

export const getGoals = async (timeframe?: string): Promise<Goal[]> => {
  if (Platform.OS === 'web') {
    const data = localStorage.getItem(WEB_KEYS.goals);
    const goals: Goal[] = data ? JSON.parse(data) : [];
    return timeframe ? goals.filter(g => g.timeframe === timeframe) : goals;
  }
  if (!db) return [];
  const query = timeframe ? 'SELECT * FROM goals WHERE timeframe = ? ORDER BY deadline' : 'SELECT * FROM goals ORDER BY deadline';
  const rows = await db.getAllAsync<any>(query, timeframe ? [timeframe] : []);
  return rows.map((r: any) => ({
    id: r.id, dreamId: r.dream_id, purposeId: r.purpose_id, title: r.title, description: r.description,
    timeframe: r.timeframe, deadline: r.deadline, progress: r.progress, status: r.status,
    completedAt: r.completed_at, createdAt: r.created_at, updatedAt: r.updated_at,
  }));
};

export const saveGoal = async (goal: Omit<Goal, 'id' | 'createdAt' | 'updatedAt'>): Promise<Goal> => {
  const newGoal: Goal = { ...goal, id: generateId(), createdAt: now(), updatedAt: now() };
  if (Platform.OS === 'web') {
    const goals = await getGoals();
    goals.push(newGoal);
    localStorage.setItem(WEB_KEYS.goals, JSON.stringify(goals));
    return newGoal;
  }
  if (!db) return newGoal;
  await db.runAsync(
    'INSERT INTO goals (id, dream_id, purpose_id, title, description, timeframe, deadline, progress, status, completed_at, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [newGoal.id, newGoal.dreamId, newGoal.purposeId, newGoal.title, newGoal.description, newGoal.timeframe, newGoal.deadline, newGoal.progress, newGoal.status, newGoal.completedAt, newGoal.createdAt, newGoal.updatedAt]
  );
  return newGoal;
};

export const updateGoal = async (id: string, data: Partial<Goal>): Promise<void> => {
  if (Platform.OS === 'web') {
    const goals = await getGoals();
    const idx = goals.findIndex(g => g.id === id);
    if (idx >= 0) { goals[idx] = { ...goals[idx], ...data, updatedAt: now() }; localStorage.setItem(WEB_KEYS.goals, JSON.stringify(goals)); }
    return;
  }
  if (!db) return;
  await db.runAsync(`UPDATE goals SET title = COALESCE(?, title), description = COALESCE(?, description), progress = COALESCE(?, progress), status = COALESCE(?, status), completed_at = COALESCE(?, completed_at), updated_at = ? WHERE id = ?`,
    [data.title, data.description, data.progress, data.status, data.completedAt, now(), id]);
};

export const deleteGoal = async (id: string): Promise<void> => {
  if (Platform.OS === 'web') {
    const goals = (await getGoals()).filter(g => g.id !== id);
    localStorage.setItem(WEB_KEYS.goals, JSON.stringify(goals));
    return;
  }
  if (!db) return;
  await db.runAsync('DELETE FROM goals WHERE id = ?', [id]);
};

// =====================
// やるべきリスト CRUD
// =====================

export const getMustDoItems = async (timeframe?: string): Promise<MustDoItem[]> => {
  if (Platform.OS === 'web') {
    const data = localStorage.getItem(WEB_KEYS.mustDo);
    const items: MustDoItem[] = data ? JSON.parse(data) : [];
    return timeframe ? items.filter(i => i.timeframe === timeframe) : items;
  }
  if (!db) return [];
  const query = timeframe ? 'SELECT * FROM must_do_items WHERE timeframe = ? ORDER BY priority, deadline' : 'SELECT * FROM must_do_items ORDER BY priority, deadline';
  const rows = await db.getAllAsync<any>(query, timeframe ? [timeframe] : []);
  return rows.map((r: any) => ({
    id: r.id, goalId: r.goal_id, title: r.title, description: r.description, priority: r.priority,
    deadline: r.deadline, timeframe: r.timeframe, status: r.status, completedAt: r.completed_at,
    createdAt: r.created_at, updatedAt: r.updated_at,
  }));
};

export const saveMustDoItem = async (item: Omit<MustDoItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<MustDoItem> => {
  const newItem: MustDoItem = { ...item, id: generateId(), createdAt: now(), updatedAt: now() };
  if (Platform.OS === 'web') {
    const items = await getMustDoItems();
    items.push(newItem);
    localStorage.setItem(WEB_KEYS.mustDo, JSON.stringify(items));
    return newItem;
  }
  if (!db) return newItem;
  await db.runAsync(
    'INSERT INTO must_do_items (id, goal_id, title, description, priority, deadline, timeframe, status, completed_at, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [newItem.id, newItem.goalId, newItem.title, newItem.description, newItem.priority, newItem.deadline, newItem.timeframe, newItem.status, newItem.completedAt, newItem.createdAt, newItem.updatedAt]
  );
  return newItem;
};

export const updateMustDoItem = async (id: string, data: Partial<MustDoItem>): Promise<void> => {
  if (Platform.OS === 'web') {
    const items = await getMustDoItems();
    const idx = items.findIndex(i => i.id === id);
    if (idx >= 0) { items[idx] = { ...items[idx], ...data, updatedAt: now() }; localStorage.setItem(WEB_KEYS.mustDo, JSON.stringify(items)); }
    return;
  }
  if (!db) return;
  await db.runAsync(`UPDATE must_do_items SET title = COALESCE(?, title), priority = COALESCE(?, priority), status = COALESCE(?, status), completed_at = COALESCE(?, completed_at), updated_at = ? WHERE id = ?`,
    [data.title, data.priority, data.status, data.completedAt, now(), id]);
};

export const deleteMustDoItem = async (id: string): Promise<void> => {
  if (Platform.OS === 'web') {
    const items = (await getMustDoItems()).filter(i => i.id !== id);
    localStorage.setItem(WEB_KEYS.mustDo, JSON.stringify(items));
    return;
  }
  if (!db) return;
  await db.runAsync('DELETE FROM must_do_items WHERE id = ?', [id]);
};

// =====================
// Todo CRUD
// =====================

export const getTodoItems = async (date?: string): Promise<TodoItem[]> => {
  if (Platform.OS === 'web') {
    const data = localStorage.getItem(WEB_KEYS.todos);
    const items: TodoItem[] = data ? JSON.parse(data) : [];
    return date ? items.filter(i => i.date === date) : items;
  }
  if (!db) return [];
  const query = date ? 'SELECT * FROM todo_items WHERE date = ? ORDER BY is_completed, created_at' : 'SELECT * FROM todo_items ORDER BY date, is_completed, created_at';
  const rows = await db.getAllAsync<any>(query, date ? [date] : []);
  return rows.map((r: any) => ({
    id: r.id, mustDoId: r.must_do_id, title: r.title, date: r.date,
    durationMinutes: r.duration_minutes ?? 60, reminders: r.reminders ? JSON.parse(r.reminders) : undefined,
    isCompleted: r.is_completed === 1, completedAt: r.completed_at, createdAt: r.created_at, updatedAt: r.updated_at,
  }));
};

export const saveTodoItem = async (item: Omit<TodoItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<TodoItem> => {
  const newItem: TodoItem = { ...item, durationMinutes: item.durationMinutes ?? 60, id: generateId(), createdAt: now(), updatedAt: now() };
  if (Platform.OS === 'web') {
    const items = await getTodoItems();
    items.push(newItem);
    localStorage.setItem(WEB_KEYS.todos, JSON.stringify(items));
    return newItem;
  }
  if (!db) return newItem;
  await db.runAsync(
    'INSERT INTO todo_items (id, must_do_id, title, date, duration_minutes, reminders, is_completed, completed_at, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [newItem.id, newItem.mustDoId, newItem.title, newItem.date, newItem.durationMinutes, newItem.reminders ? JSON.stringify(newItem.reminders) : null, newItem.isCompleted ? 1 : 0, newItem.completedAt, newItem.createdAt, newItem.updatedAt]
  );
  return newItem;
};

export const updateTodoItem = async (id: string, data: Partial<TodoItem>): Promise<void> => {
  if (Platform.OS === 'web') {
    const items = await getTodoItems();
    const idx = items.findIndex(i => i.id === id);
    if (idx >= 0) { items[idx] = { ...items[idx], ...data, updatedAt: now() }; localStorage.setItem(WEB_KEYS.todos, JSON.stringify(items)); }
    return;
  }
  if (!db) return;
  await db.runAsync(`UPDATE todo_items SET title = COALESCE(?, title), duration_minutes = COALESCE(?, duration_minutes), is_completed = COALESCE(?, is_completed), completed_at = COALESCE(?, completed_at), updated_at = ? WHERE id = ?`,
    [data.title, data.durationMinutes, data.isCompleted !== undefined ? (data.isCompleted ? 1 : 0) : null, data.completedAt, now(), id]);
};

export const deleteTodoItem = async (id: string): Promise<void> => {
  if (Platform.OS === 'web') {
    const items = (await getTodoItems()).filter(i => i.id !== id);
    localStorage.setItem(WEB_KEYS.todos, JSON.stringify(items));
    return;
  }
  if (!db) return;
  await db.runAsync('DELETE FROM todo_items WHERE id = ?', [id]);
};

// =====================
// カレンダー連携
// =====================

export const getCalendarGoalItems = async (date: string): Promise<CalendarGoalItem[]> => {
  const items: CalendarGoalItem[] = [];
  const todos = await getTodoItems(date);
  todos.forEach(t => items.push({ id: t.id, type: 'todo', title: t.title, date, isCompleted: t.isCompleted }));
  const mustDos = await getMustDoItems();
  mustDos.filter(m => m.deadline.startsWith(date)).forEach(m => items.push({ id: m.id, type: 'mustdo', title: m.title, date, priority: m.priority, isCompleted: m.status === 'completed' }));
  const goals = await getGoals();
  goals.filter(g => g.deadline?.startsWith(date)).forEach(g => items.push({ id: g.id, type: 'goal', title: g.title, date, isCompleted: g.status === 'completed' }));
  return items;
};
