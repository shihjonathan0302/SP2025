import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function ComingSoonScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Coming soon</Text>
      <Text style={styles.text}>這個功能會在下一版實作。</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, backgroundColor: '#fff' },
  title: { fontSize: 20, fontWeight: '700', marginBottom: 8 },
  text: { color: '#666', textAlign: 'center' },
});