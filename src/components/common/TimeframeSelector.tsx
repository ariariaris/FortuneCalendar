// Fortune Calendar 期間セレクター v1.0
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet, ScrollView } from 'react-native';

interface Option<T> {
  key: T;
  label: string;
}

interface Props<T> {
  label: string;
  value: T;
  options: readonly Option<T>[];
  onChange: (value: T) => void;
  accentColor?: string;
}

export function TimeframeSelector<T extends string | number>({ label, value, options, onChange, accentColor = '#FF69B4' }: Props<T>) {
  const [showModal, setShowModal] = useState(false);
  const currentLabel = options.find(o => o.key === value)?.label || '';

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity style={[styles.selector, { borderColor: accentColor }]} onPress={() => setShowModal(true)}>
        <Text style={[styles.selectorText, { color: accentColor }]}>{currentLabel}</Text>
        <Text style={styles.arrow}>▼</Text>
      </TouchableOpacity>

      <Modal visible={showModal} transparent animationType="fade" onRequestClose={() => setShowModal(false)}>
        <View style={styles.overlay}>
          <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={() => setShowModal(false)} />
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{label}</Text>
            <ScrollView style={styles.optionList}>
              {options.map(opt => (
                <TouchableOpacity
                  key={String(opt.key)}
                  style={[styles.option, value === opt.key && { backgroundColor: accentColor }]}
                  onPress={() => { onChange(opt.key); setShowModal(false); }}
                >
                  <Text style={[styles.optionText, value === opt.key && styles.optionTextActive]}>{opt.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity style={styles.closeBtn} onPress={() => setShowModal(false)}>
              <Text style={styles.closeBtnText}>閉じる</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 12 },
  label: { fontSize: 13, color: '#666', marginBottom: 4 },
  selector: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 2, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, backgroundColor: '#fff' },
  selectorText: { fontSize: 15, fontWeight: '600' },
  arrow: { fontSize: 10, color: '#999' },
  overlay: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  backdrop: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)' },
  modalContent: { backgroundColor: '#fff', borderRadius: 12, padding: 16, width: '80%', maxWidth: 300, maxHeight: '60%' },
  modalTitle: { fontSize: 16, fontWeight: '600', textAlign: 'center', marginBottom: 12 },
  optionList: { maxHeight: 250 },
  option: { paddingVertical: 12, paddingHorizontal: 16, borderRadius: 8, marginBottom: 6 },
  optionText: { fontSize: 15, color: '#333', textAlign: 'center' },
  optionTextActive: { color: '#fff', fontWeight: '600' },
  closeBtn: { marginTop: 12, paddingVertical: 10, backgroundColor: '#eee', borderRadius: 8, alignItems: 'center' },
  closeBtnText: { color: '#666', fontSize: 14 },
});
