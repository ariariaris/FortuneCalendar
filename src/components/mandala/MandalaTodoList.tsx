// マンダラTodo一覧コンポーネント
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MandalaTodo } from '../../types/mandala';

interface Props {
  todos: MandalaTodo[];
  onComplete?: (todoId: string) => void;
  themeColor?: string;
}

export const MandalaTodoList: React.FC<Props> = ({ todos, onComplete, themeColor = '#FF69B4' }) => {
  const pending = todos.filter((t) => !t.isCompleted);
  const completed = todos.filter((t) => t.isCompleted);

  if (todos.length === 0) {
    return (
      <View style={s.empty}>
        <Text style={s.emptyText}>Todoはありません</Text>
        <Text style={s.emptyHint}>セルを長押しでTodoに追加できます</Text>
      </View>
    );
  }

  return (
    <View style={s.container}>
      {pending.length > 0 && (
        <View style={s.section}>
          <Text style={s.sectionTitle}>未完了 ({pending.length})</Text>
          {pending.map((todo) => (
            <TouchableOpacity
              key={todo.id}
              style={s.todoItem}
              onPress={() => onComplete?.(todo.id)}
            >
              <View style={[s.checkbox, { borderColor: themeColor }]} />
              <View style={s.todoContent}>
                <Text style={s.todoTitle}>{todo.title}</Text>
                {todo.deadline && <Text style={s.todoDeadline}>期限: {todo.deadline.split('T')[0]}</Text>}
              </View>
              <Text style={s.icon}>🎯</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {completed.length > 0 && (
        <View style={s.section}>
          <Text style={s.sectionTitle}>完了 ({completed.length})</Text>
          {completed.slice(0, 5).map((todo) => (
            <View key={todo.id} style={[s.todoItem, s.todoCompleted]}>
              <View style={[s.checkbox, s.checkboxChecked, { backgroundColor: themeColor, borderColor: themeColor }]}>
                <Text style={s.checkmark}>✓</Text>
              </View>
              <Text style={[s.todoTitle, s.todoTitleCompleted]}>{todo.title}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

const s = StyleSheet.create({
  container: {
    marginTop: 16,
  },
  empty: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
  },
  emptyHint: {
    fontSize: 12,
    color: '#ccc',
    marginTop: 4,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  todoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 4,
  },
  todoCompleted: {
    opacity: 0.6,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    borderWidth: 0,
  },
  checkmark: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  todoContent: {
    flex: 1,
  },
  todoTitle: {
    fontSize: 14,
    color: '#333',
  },
  todoTitleCompleted: {
    textDecorationLine: 'line-through',
    color: '#999',
  },
  todoDeadline: {
    fontSize: 11,
    color: '#999',
    marginTop: 2,
  },
  icon: {
    fontSize: 14,
    marginLeft: 8,
  },
});

export default MandalaTodoList;
