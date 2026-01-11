// Fortune Calendar 日付入力 v2.0 (年/月/日ボタン式)
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Modal, StyleSheet, Dimensions } from 'react-native';

interface Props {
  value: string;  // YYYY-MM-DD or YYYY/MM/DD
  onChange: (date: string) => void;
  placeholder?: string;
  style?: any;
  format?: 'slash' | 'hyphen';  // 出力形式
}

export const DateInput: React.FC<Props> = ({ value, onChange, placeholder, style, format = 'slash' }) => {
  const [showPicker, setShowPicker] = useState<'year' | 'month' | 'day' | null>(null);

  // 入力値をパース
  const parseDate = (v: string): { y: number; m: number; d: number } => {
    if (!v) {
      const now = new Date();
      return { y: now.getFullYear(), m: now.getMonth() + 1, d: now.getDate() };
    }
    const normalized = v.replace(/\//g, '-');
    const [y, m, d] = normalized.split('-').map(Number);
    return { y: y || new Date().getFullYear(), m: m || 1, d: d || 1 };
  };

  const { y, m, d } = parseDate(value);

  // 出力形式に変換
  const formatOutput = (year: number, month: number, day: number): string => {
    const sep = format === 'slash' ? '/' : '-';
    return `${year}${sep}${String(month).padStart(2, '0')}${sep}${String(day).padStart(2, '0')}`;
  };

  // 選択値リスト
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 50 }, (_, i) => currentYear - 10 + i);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const daysInMonth = new Date(y, m, 0).getDate();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const handleSelect = (v: number) => {
    const newY = showPicker === 'year' ? v : y;
    const newM = showPicker === 'month' ? v : m;
    let newD = showPicker === 'day' ? v : d;
    // 月変更時に日が範囲外なら調整
    const maxDay = new Date(newY, newM, 0).getDate();
    if (newD > maxDay) newD = maxDay;
    onChange(formatOutput(newY, newM, newD));
    setShowPicker(null);
  };

  const getPickerItems = () => {
    if (showPicker === 'year') return years;
    if (showPicker === 'month') return months;
    if (showPicker === 'day') return days;
    return [];
  };

  const getLabel = (v: number) => {
    if (showPicker === 'year') return `${v}年`;
    if (showPicker === 'month') return `${v}月`;
    return `${v}日`;
  };

  return (
    <View style={[styles.container, style]}>
      <TouchableOpacity style={styles.btn} onPress={() => setShowPicker('year')}>
        <Text style={styles.btnText}>{y}年</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.btn} onPress={() => setShowPicker('month')}>
        <Text style={styles.btnText}>{m}月</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.btn} onPress={() => setShowPicker('day')}>
        <Text style={styles.btnText}>{d}日</Text>
      </TouchableOpacity>

      <Modal visible={showPicker !== null} transparent animationType="fade" onRequestClose={() => setShowPicker(null)}>
        <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={() => setShowPicker(null)}>
          <View style={styles.pickerContainer}>
            <Text style={styles.pickerTitle}>
              {showPicker === 'year' ? '年を選択' : showPicker === 'month' ? '月を選択' : '日を選択'}
            </Text>
            <ScrollView style={styles.pickerScroll} contentContainerStyle={styles.pickerContent}>
              {getPickerItems().map((v) => (
                <TouchableOpacity
                  key={v}
                  style={[styles.pickerItem, (showPicker === 'year' && v === y) || (showPicker === 'month' && v === m) || (showPicker === 'day' && v === d) ? styles.pickerItemActive : null]}
                  onPress={() => handleSelect(v)}
                >
                  <Text style={[styles.pickerItemText, (showPicker === 'year' && v === y) || (showPicker === 'month' && v === m) || (showPicker === 'day' && v === d) ? styles.pickerItemTextActive : null]}>
                    {getLabel(v)}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 8,
  },
  btn: {
    flex: 1,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    paddingVertical: 10,
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  btnText: {
    fontSize: 14,
    color: '#333',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pickerContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    width: Dimensions.get('window').width * 0.8,
    maxHeight: Dimensions.get('window').height * 0.6,
    padding: 16,
  },
  pickerTitle: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 12,
    color: '#333',
  },
  pickerScroll: {
    maxHeight: 300,
  },
  pickerContent: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
  },
  pickerItem: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    minWidth: 70,
    alignItems: 'center',
  },
  pickerItemActive: {
    backgroundColor: '#FF69B4',
  },
  pickerItemText: {
    fontSize: 15,
    color: '#333',
  },
  pickerItemTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
});

export default DateInput;
