// Fortune Calendar ハプティックフィードバック v1.0
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

// ボタンタップ時の軽いフィードバック
export const tapFeedback = () => {
  if (Platform.OS !== 'web') {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }
};

// 重要なアクション（保存・削除など）の中程度フィードバック
export const actionFeedback = () => {
  if (Platform.OS !== 'web') {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }
};

// 成功時のフィードバック
export const successFeedback = () => {
  if (Platform.OS !== 'web') {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }
};

// エラー時のフィードバック
export const errorFeedback = () => {
  if (Platform.OS !== 'web') {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  }
};
