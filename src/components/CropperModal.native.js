// src/components/CropperModal.native.js
import React from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet } from 'react-native';

export default function CropperModal({ visible, imageUri, onClose, onSave }) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.container}>
        <View style={styles.box}>
          <Text style={styles.title}>裁切功能 (Coming Soon)</Text>
          <Text style={styles.desc}>目前原生端請直接用 ImagePicker 的內建裁切</Text>
          <View style={styles.row}>
            <TouchableOpacity onPress={onClose} style={styles.btn}><Text>Cancel</Text></TouchableOpacity>
            <TouchableOpacity onPress={() => { onSave(imageUri); }} style={styles.btn}><Text>OK</Text></TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', alignItems: 'center', justifyContent: 'center' },
  box: { backgroundColor: '#fff', borderRadius: 12, padding: 20, width: '80%' },
  title: { fontSize: 16, fontWeight: '700', marginBottom: 8 },
  desc: { fontSize: 14, color: '#666', marginBottom: 16 },
  row: { flexDirection: 'row', justifyContent: 'flex-end', gap: 16 },
  btn: { padding: 10 },
});