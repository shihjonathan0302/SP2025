// src/components/CropperModal.native.js
import React from 'react';
import {
  Modal,
  View,
  Text,
  Pressable,
  StyleSheet,
} from 'react-native';

export default function CropperModal({ visible, imageUri, onClose, onSave }) {
  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      {/* 點背景關閉 */}
      <Pressable style={styles.backdrop} onPress={onClose}>
        {/* 阻擋冒泡，避免點內容也關閉 */}
        <Pressable style={styles.card} onPress={() => {}}>
          <Text style={styles.title}>Crop on device (Expo Go)</Text>
          <Text style={styles.desc}>
            Expo Go 尚不支援客製化拖曳裁切 UI。請用
            <Text style={styles.mono}>「Choose new photo」</Text>
            搭配系統內建裁切（allowsEditing），或直接使用目前圖片。
          </Text>

          <View style={styles.row}>
            <Pressable style={[styles.btn, styles.ghost]} onPress={onClose}>
              <Text style={styles.btnGhostText}>Cancel</Text>
            </Pressable>

            <Pressable
              style={[styles.btn, styles.primary]}
              onPress={() => {
                // 直接回傳傳入的 imageUri，等同「不再額外裁切」
                onSave?.(imageUri);
              }}
            >
              <Text style={styles.btnPrimaryText}>Use as is</Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 440,
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  title: { fontSize: 16, fontWeight: '700', marginBottom: 8, color: '#111827' },
  desc: { fontSize: 14, color: '#4B5563', lineHeight: 20 },
  mono: { fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace' }), color: '#111827' },
  row: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10, marginTop: 16 },
  btn: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 10 },
  ghost: { backgroundColor: '#F3F4F6' },
  primary: { backgroundColor: '#111827' },
  btnGhostText: { color: '#111827', fontWeight: '600' },
  btnPrimaryText: { color: '#fff', fontWeight: '700' },
});