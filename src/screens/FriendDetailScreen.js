// screens/FriendDetailScreen.js
import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image } from 'react-native';

export default function FriendDetailScreen({ route }) {
  const { friend } = route.params;

  // Example mock data — replace with API or shared context later
  const stats = {
    totalGoals: 8,
    completedGoals: 5,
    pendingGoals: 3,
    successRate: '62%',
  };

  return (
    <ScrollView style={styles.container}>
      {/* Profile Header */}
      <View style={styles.profileSection}>
        <Image
          source={{ uri: friend.avatar || 'https://via.placeholder.com/80' }}
          style={styles.avatar}
        />
        <Text style={styles.name}>{friend.name}</Text>
        <Text style={styles.joinDate}>Joined: Jan 2024</Text>
      </View>

      {/* Stats */}
      <Text style={styles.sectionTitle}>Performance</Text>
      <View style={styles.cardsContainer}>
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Total Goals</Text>
          <Text style={styles.cardValue}>{stats.totalGoals}</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Completed Goals</Text>
          <Text style={styles.cardValue}>{stats.completedGoals}</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Pending Goals</Text>
          <Text style={styles.cardValue}>{stats.pendingGoals}</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Success Rate</Text>
          <Text style={styles.cardValue}>{stats.successRate}</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 16 },
  profileSection: { alignItems: 'center', marginBottom: 24 },
  avatar: { width: 80, height: 80, borderRadius: 40, marginBottom: 8 },
  name: { fontSize: 22, fontWeight: '700' },
  joinDate: { color: '#666', fontSize: 14 },
  sectionTitle: { fontSize: 20, fontWeight: '700', marginBottom: 12 },
  cardsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    width: '47%',
    alignItems: 'center',
    marginBottom: 12,
    elevation: 2
  },
  cardLabel: { fontSize: 14, color: '#555', marginBottom: 4 },
  cardValue: { fontSize: 20, fontWeight: '700', color: '#333' }
});
