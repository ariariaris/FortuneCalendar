// Fortune Calendar 画像選択ボタンコンポーネント v1.0
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

interface ImagePickerButtonProps {
  onImageSelected: (uri: string) => void;
  currentImage?: string | null;
  placeholder?: string;
  showCameraOption?: boolean;
}

export const ImagePickerButton: React.FC<ImagePickerButtonProps> = ({
  onImageSelected,
  currentImage,
  placeholder = '写真を選択',
  showCameraOption = true,
}) => {
  const [loading, setLoading] = useState(false);

  const requestPermission = async (type: 'library' | 'camera') => {
    if (type === 'library') {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      return status === 'granted';
    } else {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      return status === 'granted';
    }
  };

  const pickImage = async () => {
    const hasPermission = await requestPermission('library');
    if (!hasPermission) {
      Alert.alert('権限が必要です', '写真へのアクセスを許可してください');
      return;
    }

    setLoading(true);
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        onImageSelected(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('エラー', '画像の選択に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const takePhoto = async () => {
    const hasPermission = await requestPermission('camera');
    if (!hasPermission) {
      Alert.alert('権限が必要です', 'カメラへのアクセスを許可してください');
      return;
    }

    setLoading(true);
    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        onImageSelected(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('エラー', '撮影に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={s.container}>
      <TouchableOpacity style={s.imageArea} onPress={pickImage} disabled={loading}>
        {currentImage ? (
          <Image source={{ uri: currentImage }} style={s.image} />
        ) : (
          <View style={s.placeholder}>
            <Text style={s.placeholderIcon}>📷</Text>
            <Text style={s.placeholderText}>{placeholder}</Text>
          </View>
        )}
      </TouchableOpacity>

      <View style={s.buttons}>
        <TouchableOpacity style={s.button} onPress={pickImage} disabled={loading}>
          <Text style={s.buttonText}>写真を選択</Text>
        </TouchableOpacity>
        {showCameraOption && (
          <TouchableOpacity style={[s.button, s.buttonSecondary]} onPress={takePhoto} disabled={loading}>
            <Text style={[s.buttonText, s.buttonTextSecondary]}>カメラで撮影</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const s = StyleSheet.create({
  container: { alignItems: 'center' },
  imageArea: { width: 200, height: 200, borderRadius: 12, overflow: 'hidden', backgroundColor: '#f0f0f0', marginBottom: 16 },
  image: { width: '100%', height: '100%' },
  placeholder: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  placeholderIcon: { fontSize: 48, marginBottom: 8 },
  placeholderText: { fontSize: 14, color: '#999' },
  buttons: { flexDirection: 'row', gap: 12 },
  button: { paddingHorizontal: 20, paddingVertical: 12, backgroundColor: '#FF69B4', borderRadius: 8 },
  buttonSecondary: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#FF69B4' },
  buttonText: { color: '#fff', fontWeight: '600' },
  buttonTextSecondary: { color: '#FF69B4' },
});

export default ImagePickerButton;
