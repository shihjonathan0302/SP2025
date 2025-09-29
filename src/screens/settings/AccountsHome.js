import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function AccountsHome({ navigation }) {
  const go = (name) => navigation.navigate(name);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Account</Text>
      <Text style={styles.caption}>Manage your profile and sign-in methods.</Text>

      <Row icon="create-outline"  title="Edit Profile"         onPress={() => go('EditProfile')} />
      <Row icon="link-outline"    title="Linked Accounts"       onPress={() => go('LinkedAccounts')} />
      <Row icon="lock-closed-outline" title="Password & Security" onPress={() => go('PasswordSecurity')} />
      <Row icon="card-outline"    title="Subscriptions"         onPress={() => go('Subscriptions')} />

      <View style={{ height: 8 }} />

      {/* 危險操作：Delete Account（導到 DeleteAccount 畫面） */}
      <Row
        danger
        icon="trash-outline"
        title="Delete Account"
        onPress={() => go('DeleteAccount')}
      />
    </View>
  );
}

function Row({ icon, title, onPress, danger }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.row, danger && styles.rowDanger]}
      activeOpacity={0.85}
    >
      <View style={styles.rowLeft}>
        <View style={[styles.ic, danger && styles.icDanger]}>
          <Ionicons name={icon} size={18} color={danger ? '#fff' : '#111'} />
        </View>
        <Text style={[styles.rowTitle, danger && { color: '#B91C1C' }]}>{title}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={danger ? '#B91C1C' : '#9CA3AF'} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 12 },
  title: { fontSize: 20, fontWeight: '700', marginTop: 6 },
  caption: { color: '#6B7280', marginTop: 4, marginBottom: 14 },

  row: {
    minHeight: 60, paddingHorizontal: 12, paddingVertical: 10,
    borderWidth: 1, borderColor: '#eee', borderRadius: 12, backgroundColor: '#fff',
    marginBottom: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  rowLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  ic: {
    width: 36, height: 36, borderRadius: 10, borderWidth: 1, borderColor: '#eee',
    alignItems: 'center', justifyContent: 'center', backgroundColor: '#F9FAFB',
  },
  icDanger: { backgroundColor: '#DC2626', borderColor: '#DC2626' },
  rowTitle: { fontSize: 16, fontWeight: '600', color: '#111' },
  rowDanger: { borderColor: '#FECACA', backgroundColor: '#FEF2F2' },
});