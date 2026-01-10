// Fortune Calendar 日付入力 v1.0
import React from 'react';
import { Platform, TextInput, StyleSheet, View, Text, TouchableOpacity } from 'react-native';

interface Props {
  value: string;  // YYYY-MM-DD or YYYY/MM/DD
  onChange: (date: string) => void;
  placeholder?: string;
  style?: any;
  format?: 'slash' | 'hyphen';  // 出力形式
}

export const DateInput: React.FC<Props> = ({ value, onChange, placeholder, style, format = 'slash' }) => {
  // 入力値をYYYY-MM-DD形式に正規化（input type="date"用）
  const normalizeToHyphen = (v: string): string => {
    if (!v) return '';
    return v.replace(/\//g, '-');
  };

  // 出力値を指定形式に変換
  const formatOutput = (v: string): string => {
    if (!v) return '';
    if (format === 'slash') return v.replace(/-/g, '/');
    return v;
  };

  const handleChange = (newValue: string) => {
    onChange(formatOutput(newValue));
  };

  if (Platform.OS === 'web') {
    return (
      <input
        type="date"
        value={normalizeToHyphen(value)}
        onChange={(e) => handleChange(e.target.value)}
        placeholder={placeholder}
        style={{
          ...webStyles.input,
          ...style,
        }}
      />
    );
  }

  // Native: TextInput fallback (将来的にDateTimePickerに置換可能)
  return (
    <TextInput
      style={[styles.input, style]}
      value={value}
      onChangeText={onChange}
      placeholder={placeholder || 'YYYY/MM/DD'}
    />
  );
};

const styles = StyleSheet.create({
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    padding: 10,
    fontSize: 14,
  },
});

const webStyles: Record<string, React.CSSProperties> = {
  input: {
    backgroundColor: '#fff',
    border: '1px solid #ddd',
    borderRadius: 6,
    padding: 10,
    fontSize: 14,
    width: '100%',
    boxSizing: 'border-box',
  },
};

export default DateInput;
