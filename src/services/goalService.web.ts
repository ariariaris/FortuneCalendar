// Fortune Calendar 目標管理サービス Web版 v1.0
import { Dream, Purpose, Goal, MustDoItem, TodoItem, CalendarGoalItem } from '../types/goalManagement';

const WEB_KEYS = {
  dreams: '@goal_dreams',
  purposes: '@goal_purposes',
  goals: '@goal_goals',
  mustDo: '@goal_mustdo',
  todos: '@goal_todos',
};

const generateId = () => `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
const now = () => new Date().toISOString();

/** DB初期化（Web版は不要） */
export const initGoalService = async (): Promise<void> => {};

// =====================
// 夢リスト CRUD
// =====================

export const getDreams = async (): Promise<Dream[]> => {
  const data = localStorage.getItem(WEB_KEYS.dreams);
  return data ? JSON.parse(data) : [];
};

export const saveDream = async (dream: Omit<Dream, 'id' | 'createdAt' | 'updatedAt'>): Promise<Dream> => {
  const newDream: Dream = { ...dream, id: generateId(), createdAt: now(), updatedAt: now() };
  const dreams = await getDreams();
  dreams.push(newDream);
  localStorage.setItem(WEB_KEYS.dreams, JSON.stringify(dreams));
  return newDream;
};

export const updateDream = async (id: string, data: Partial<Dream>): Promise<void> => {
  const dreams = await getDreams();
  const idx = dreams.findIndex(d => d.id === id);
  if (idx >= 0) {
    dreams[idx] = { ...dreams[idx], ...data, updatedAt: now() };
    localStorage.setItem(WEB_KEYS.dreams, JSON.stringify(dreams));
  }
};

export const deleteDream = async (id: string): Promise<void> => {
  const dreams = (await getDreams()).filter(d => d.id !== id);
  localStorage.setItem(WEB_KEYS.dreams, JSON.stringify(dreams));
};

// =====================
// 目的 CRUD
// =====================

export const getPurposes = async (): Promise<Purpose[]> => {
  const data = localStorage.getItem(WEB_KEYS.purposes);
  return data ? JSON.parse(data) : [];
};

export const savePurpose = async (purpose: Omit<Purpose, 'id' | 'createdAt' | 'updatedAt'>): Promise<Purpose> => {
  const newPurpose: Purpose = { ...purpose, id: generateId(), createdAt: now(), updatedAt: now() };
  const purposes = await getPurposes();
  purposes.push(newPurpose);
  localStorage.setItem(WEB_KEYS.purposes, JSON.stringify(purposes));
  return newPurpose;
};

export const updatePurpose = async (id: string, data: Partial<Purpose>): Promise<void> => {
  const purposes = await getPurposes();
  const idx = purposes.findIndex(p => p.id === id);
  if (idx >= 0) {
    purposes[idx] = { ...purposes[idx], ...data, updatedAt: now() };
    localStorage.setItem(WEB_KEYS.purposes, JSON.stringify(purposes));
  }
};

export const deletePurpose = async (id: string): Promise<void> => {
  const purposes = (await getPurposes()).filter(p => p.id !== id);
  localStorage.setItem(WEB_KEYS.purposes, JSON.stringify(purposes));
};

// =====================
// 目標 CRUD
// =====================

export const getGoals = async (timeframe?: string): Promise<Goal[]> => {
  const data = localStorage.getItem(WEB_KEYS.goals);
  const goals: Goal[] = data ? JSON.parse(data) : [];
  return timeframe ? goals.filter(g => g.timeframe === timeframe) : goals;
};

export const saveGoal = async (goal: Omit<Goal, 'id' | 'createdAt' | 'updatedAt'>): Promise<Goal> => {
  const newGoal: Goal = { ...goal, id: generateId(), createdAt: now(), updatedAt: now() };
  const goals = await getGoals();
  goals.push(newGoal);
  localStorage.setItem(WEB_KEYS.goals, JSON.stringify(goals));
  return newGoal;
};

export const updateGoal = async (id: string, data: Partial<Goal>): Promise<void> => {
  const goals = await getGoals();
  const idx = goals.findIndex(g => g.id === id);
  if (idx >= 0) {
    goals[idx] = { ...goals[idx], ...data, updatedAt: now() };
    localStorage.setItem(WEB_KEYS.goals, JSON.stringify(goals));
  }
};

export const deleteGoal = async (id: string): Promise<void> => {
  const goals = (await getGoals()).filter(g => g.id !== id);
  localStorage.setItem(WEB_KEYS.goals, JSON.stringify(goals));
};

// =====================
// やるべきリスト CRUD
// =====================

export const getMustDoItems = async (timeframe?: string): Promise<MustDoItem[]> => {
  const data = localStorage.getItem(WEB_KEYS.mustDo);
  const items: MustDoItem[] = data ? JSON.parse(data) : [];
  return timeframe ? items.filter(i => i.timeframe === timeframe) : items;
};

export const saveMustDoItem = async (item: Omit<MustDoItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<MustDoItem> => {
  const newItem: MustDoItem = { ...item, id: generateId(), createdAt: now(), updatedAt: now() };
  const items = await getMustDoItems();
  items.push(newItem);
  localStorage.setItem(WEB_KEYS.mustDo, JSON.stringify(items));
  return newItem;
};

export const updateMustDoItem = async (id: string, data: Partial<MustDoItem>): Promise<void> => {
  const items = await getMustDoItems();
  const idx = items.findIndex(i => i.id === id);
  if (idx >= 0) {
    items[idx] = { ...items[idx], ...data, updatedAt: now() };
    localStorage.setItem(WEB_KEYS.mustDo, JSON.stringify(items));
  }
};

export const deleteMustDoItem = async (id: string): Promise<void> => {
  const items = (await getMustDoItems()).filter(i => i.id !== id);
  localStorage.setItem(WEB_KEYS.mustDo, JSON.stringify(items));
};

// =====================
// Todo CRUD
// =====================

export const getTodoItems = async (date?: string): Promise<TodoItem[]> => {
  const data = localStorage.getItem(WEB_KEYS.todos);
  const items: TodoItem[] = data ? JSON.parse(data) : [];
  return date ? items.filter(i => i.date === date) : items;
};

export const saveTodoItem = async (item: Omit<TodoItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<TodoItem> => {
  const newItem: TodoItem = { ...item, id: generateId(), createdAt: now(), updatedAt: now() };
  const items = await getTodoItems();
  items.push(newItem);
  localStorage.setItem(WEB_KEYS.todos, JSON.stringify(items));
  return newItem;
};

export const updateTodoItem = async (id: string, data: Partial<TodoItem>): Promise<void> => {
  const items = await getTodoItems();
  const idx = items.findIndex(i => i.id === id);
  if (idx >= 0) {
    items[idx] = { ...items[idx], ...data, updatedAt: now() };
    localStorage.setItem(WEB_KEYS.todos, JSON.stringify(items));
  }
};

export const deleteTodoItem = async (id: string): Promise<void> => {
  const items = (await getTodoItems()).filter(i => i.id !== id);
  localStorage.setItem(WEB_KEYS.todos, JSON.stringify(items));
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
