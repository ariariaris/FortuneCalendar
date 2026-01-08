// Fortune Calendar マンダラサービス v1.0
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  MandalaChart,
  MandalaElement,
  MandalaAction,
  MandalaTodo,
  MandalaProgress,
  MandalaTimeframe,
  MandalaActionStatus,
} from '../types/mandala';

const MANDALA_KEY = '@mandala_charts';
const MANDALA_TODOS_KEY = '@mandala_todos';

const generateId = (): string => `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

// =====================
// マンダラチャート CRUD
// =====================

/** マンダラチャート作成 */
export const createMandalaChart = async (
  title: string,
  centerGoal: string,
  timeframe: MandalaTimeframe
): Promise<MandalaChart> => {
  const now = new Date().toISOString();
  const chartId = generateId();

  // 8要素を初期化
  const elements: MandalaElement[] = [];
  for (let i = 0; i < 8; i++) {
    const elementId = `${chartId}_elem_${i}`;
    const actions: MandalaAction[] = [];
    for (let j = 0; j < 8; j++) {
      actions.push({
        id: `${elementId}_act_${j}`,
        elementId,
        position: j,
        content: '',
        status: 'not_started',
      });
    }
    elements.push({
      id: elementId,
      chartId,
      position: i,
      title: '',
      actions,
    });
  }

  const chart: MandalaChart = {
    id: chartId,
    title,
    timeframe,
    centerGoal,
    elements,
    createdAt: now,
    updatedAt: now,
  };

  const charts = await getAllMandalaCharts();
  charts.push(chart);
  await saveCharts(charts);

  return chart;
};

/** マンダラチャート取得（ID指定） */
export const getMandalaChart = async (chartId: string): Promise<MandalaChart | null> => {
  const charts = await getAllMandalaCharts();
  return charts.find((c) => c.id === chartId) || null;
};

/** マンダラチャート全件取得 */
export const getAllMandalaCharts = async (): Promise<MandalaChart[]> => {
  try {
    const data = await AsyncStorage.getItem(MANDALA_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

/** マンダラチャート更新 */
export const updateMandalaChart = async (chart: MandalaChart): Promise<void> => {
  chart.updatedAt = new Date().toISOString();
  const charts = await getAllMandalaCharts();
  const idx = charts.findIndex((c) => c.id === chart.id);
  if (idx !== -1) {
    charts[idx] = chart;
    await saveCharts(charts);
  }
};

/** マンダラチャート削除 */
export const deleteMandalaChart = async (chartId: string): Promise<void> => {
  const charts = await getAllMandalaCharts();
  const filtered = charts.filter((c) => c.id !== chartId);
  await saveCharts(filtered);
  // 関連Todoも削除
  await deleteTodosByMandala(chartId);
};

const saveCharts = async (charts: MandalaChart[]): Promise<void> => {
  await AsyncStorage.setItem(MANDALA_KEY, JSON.stringify(charts));
};

// =====================
// 要素・アクション操作
// =====================

/** 要素タイトル更新 */
export const updateElementTitle = async (chartId: string, elementId: string, title: string): Promise<void> => {
  const chart = await getMandalaChart(chartId);
  if (!chart) return;

  const element = chart.elements.find((e) => e.id === elementId);
  if (element) {
    element.title = title;
    await updateMandalaChart(chart);
  }
};

/** アクション更新 */
export const updateAction = async (
  chartId: string,
  actionId: string,
  updates: { content?: string; deadline?: string; status?: MandalaActionStatus }
): Promise<void> => {
  const chart = await getMandalaChart(chartId);
  if (!chart) return;

  for (const elem of chart.elements) {
    const action = elem.actions.find((a) => a.id === actionId);
    if (action) {
      if (updates.content !== undefined) action.content = updates.content;
      if (updates.deadline !== undefined) action.deadline = updates.deadline;
      if (updates.status !== undefined) {
        action.status = updates.status;
        if (updates.status === 'completed') {
          action.completedAt = new Date().toISOString();
        }
      }
      await updateMandalaChart(chart);
      return;
    }
  }
};

// =====================
// Todo連携
// =====================

/** アクションをTodoに追加 */
export const addActionToTodo = async (chartId: string, actionId: string, title: string, deadline?: string): Promise<MandalaTodo> => {
  const todoId = generateId();
  const todo: MandalaTodo = {
    id: todoId,
    mandalaId: chartId,
    actionId,
    title,
    deadline,
    isCompleted: false,
    showOnCalendar: true,
  };

  const todos = await getAllMandalaTodos();
  todos.push(todo);
  await saveTodos(todos);

  // アクションにTodoID紐付け
  const chart = await getMandalaChart(chartId);
  if (chart) {
    for (const elem of chart.elements) {
      const action = elem.actions.find((a) => a.id === actionId);
      if (action) {
        action.linkedTodoId = todoId;
        await updateMandalaChart(chart);
        break;
      }
    }
  }

  return todo;
};

/** Todo完了 */
export const completeTodo = async (todoId: string): Promise<void> => {
  const todos = await getAllMandalaTodos();
  const todo = todos.find((t) => t.id === todoId);
  if (todo) {
    todo.isCompleted = true;
    todo.completedAt = new Date().toISOString();
    await saveTodos(todos);

    // 元のアクションも完了に
    const chart = await getMandalaChart(todo.mandalaId);
    if (chart) {
      for (const elem of chart.elements) {
        const action = elem.actions.find((a) => a.id === todo.actionId);
        if (action) {
          action.status = 'completed';
          action.completedAt = todo.completedAt;
          await updateMandalaChart(chart);
          break;
        }
      }
    }
  }
};

/** Todo全件取得 */
export const getAllMandalaTodos = async (): Promise<MandalaTodo[]> => {
  try {
    const data = await AsyncStorage.getItem(MANDALA_TODOS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

/** カレンダー表示用Todo取得 */
export const getTodosForCalendar = async (): Promise<MandalaTodo[]> => {
  const todos = await getAllMandalaTodos();
  return todos.filter((t) => t.showOnCalendar && !t.isCompleted);
};

/** 日付でTodoフィルタ */
export const getTodosByDate = (todos: MandalaTodo[], date: string): MandalaTodo[] => {
  return todos.filter((t) => t.deadline && t.deadline.startsWith(date));
};

const saveTodos = async (todos: MandalaTodo[]): Promise<void> => {
  await AsyncStorage.setItem(MANDALA_TODOS_KEY, JSON.stringify(todos));
};

const deleteTodosByMandala = async (mandalaId: string): Promise<void> => {
  const todos = await getAllMandalaTodos();
  const filtered = todos.filter((t) => t.mandalaId !== mandalaId);
  await saveTodos(filtered);
};

// =====================
// 進捗計算
// =====================

/** 進捗計算 */
export const calculateProgress = (chart: MandalaChart): MandalaProgress => {
  let filledCells = 1; // 中央の目標は常にカウント
  let completedActions = 0;

  for (const elem of chart.elements) {
    if (elem.title) filledCells++;
    for (const action of elem.actions) {
      if (action.content) filledCells++;
      if (action.status === 'completed') completedActions++;
    }
  }

  return {
    chartId: chart.id,
    totalCells: 81,
    filledCells,
    completedActions,
    progressPercent: Math.round((filledCells / 81) * 100),
  };
};
