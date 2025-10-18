// src/components/CropperModal.native.js
import React from 'react';
import * as ImagePicker from 'expo-image-picker';
import { Platform } from 'react-native';

export default async function openCropper(onImagePicked) {
  try {
    // 要求權限
    const { granted } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!granted) {
      alert('Please allow access to photos.');
      return;
    }

    // 使用系統裁切器
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: Platform.OS !== 'web', // Web 不支援裁切
      aspect: [1, 1], // 方形
      quality: 1,
    });

    if (!result.canceled) {
      const imageUri = result.assets[0].uri;
      onImagePicked?.(imageUri); // 回傳選取結果
    }
  } catch (err) {
    console.error('Image picker error:', err);
  }
}