import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, Pressable, useWindowDimensions, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient'; 
// 如果你不是 Expo，改成 react-native-linear-gradient

export default function TotalGoalsScreen({ route, navigation }) {
  const totalGoals = route?.params?.totalGoals ?? 0;
  const { width, height } = useWindowDimensions();

  // 最長邊當作基準
  const L = Math.max(width, height);
  const digits = String(totalGoals).length;

  // 動態縮放比例：1位數→大；2位數→稍小；3位以上→更小
  const base = digits === 1 ? 0.68 : digits === 2 ? 0.48 : 0.40;
  const fontSize = Math.max(180, Math.min(L * base, 360));

  return (
    <SafeAreaView style={styles.safe}>
      <LinearGradient colors={['#696969', '#6D6858']} style={styles.gradient}>
        {/* 右上角關閉 */}
        <Pressable
          onPress={() => navigation.goBack()}
          style={({ pressed }) => [styles.closeBtn, pressed && { opacity: 0.7 }]}
          hitSlop={12}
        >
          <Text style={styles.closeText}>×</Text>
        </Pressable>

        {/* 內容 */}
        <View style={styles.body}>
          <Text style={styles.title}>Total Goals</Text>
          <Text style={styles.subtitle}>
            {`You've set ${totalGoals} goal${totalGoals === 1 ? '' : 's'} this week.`}
          </Text>
        </View>

        {/* 巨大水印數字（動態大小） */}
        <Text numberOfLines={1} style={[styles.watermark, { fontSize }]}>
          {totalGoals}
        </Text>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#696969' },
  gradient: { flex: 1, overflow: 'hidden' },

  closeBtn: {
    position: 'absolute',
    top: 10,
    right: 12,
    zIndex: 10,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  closeText: { color: '#fff', fontSize: 24, lineHeight: 24, fontWeight: '700' },

  body: {
    paddingTop: 56,
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 24,
    fontFamily: 'SFProDisplay-Bold',  // 👈 使用自訂字體
    color: '#FFFFFF',
    marginBottom: 6,
  },
  watermark: {
    position: 'absolute',
    bottom: -70,
    right: -10,
    fontSize: 360,
    fontFamily: 'SFProDisplay-Heavy', // 👈 超粗大字
    color: 'rgba(255,255,255,0.14)',
  },
});
