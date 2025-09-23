// src/screens/settings/LinkedAccountsScreen.js
import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity, ActivityIndicator, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../lib/supabaseClient';

export default function LinkedAccountsScreen() {
  const [user, setUser] = useState(null);
  const [linking, setLinking] = useState(false);

  useEffect(() => {
    refreshUser();
    const { data: sub } = supabase.auth.onAuthStateChange((_evt, session) => {
      setUser(session?.user ?? null);
    });
    return () => sub?.subscription?.unsubscribe?.();
  }, []);

  const refreshUser = async () => {
    const { data } = await supabase.auth.getUser();
    setUser(data?.user ?? null);
  };

  const identities = useMemo(() => user?.identities ?? [], [user]);
  const providers = useMemo(() => identities.map(i => i.provider), [identities]);

  // 有 email → email 為 primary；否則第一個 identity 的 provider 為 primary
  const primaryProvider = user?.email ? 'email' : (identities[0]?.provider ?? null);
  const isPrimary = (p) => p === primaryProvider;
  const isLinked = (p) => providers.includes(p);
  const isLastIdentity = identities.length <= 1;

  // 兼容 identity_id / id
  const getIdentityId = (p) => {
    const found = identities.find(i => i.provider === p);
    if (!found) return null;
    return found.identity_id || found.id || null;
  };

  // ---- Google ----
  const linkGoogle = async () => {
    try {
      setLinking(true);
      const { data, error } = await supabase.auth.linkIdentity({ provider: 'google' });
      if (error) throw error;
      // Web 會彈窗；完成後 onAuthStateChange 會更新
      if (Platform.OS === 'web') {
        Alert.alert('Continue', 'Finish the Google link flow in the popup window.');
      }
    } catch (e) {
      console.log('[link google]', e);
      Alert.alert('Link failed', String(e?.message || e));
    } finally {
      // 稍等一下再刷新，避免剛完成還沒回寫
      setTimeout(refreshUser, 1500);
      setLinking(false);
    }
  };

  const unlinkGoogle = async () => {
    if (isPrimary('google')) {
      return Alert.alert('Blocked', 'Google is your primary sign-in method. Please add another method before unlinking.');
    }
    if (isLastIdentity && !user?.email) {
      // 沒 email 且只剩一個 identity → 不能拔
      return Alert.alert('Blocked', 'You must keep at least one sign-in method.');
    }
    try {
      setLinking(true);
      const identityId = getIdentityId('google');
      if (!identityId) return Alert.alert('Not linked', 'Google is not linked on this account.');
      const { error } = await supabase.auth.unlinkIdentity({ identity_id: identityId });
      if (error) throw error;
      await refreshUser();
      Alert.alert('Unlinked', 'Google account has been unlinked.');
    } catch (e) {
      console.log('[unlink google]', e);
      Alert.alert('Unlink failed', String(e?.message || e));
    } finally {
      setLinking(false);
    }
  };

  // ---- UI ----
  const Row = ({ icon, label, detail, status, actionLabel, disabled, onPress, primary, loading, comingSoon }) => {
    return (
      <View style={[styles.row, comingSoon && { opacity: 0.5 }]}>
        <View style={styles.rowLeft}>
          <Ionicons name={icon} size={20} color="#111" style={{ marginRight: 10 }} />
          <View>
            <Text style={styles.rowTitle}>{label}</Text>
            {!!detail && <Text style={styles.rowDetail}>{detail}</Text>}
          </View>
        </View>
        <View style={styles.rowRight}>
          {!!status && (
            <View style={[styles.badge, primary ? styles.badgePrimary : styles.badgeLinked]}>
              <Text style={[styles.badgeText, primary ? styles.badgeTextPrimary : styles.badgeTextLinked]}>
                {status}
              </Text>
            </View>
          )}
          {comingSoon ? (
            <View style={[styles.badge, styles.badgeSoon]}>
              <Text style={[styles.badgeText, styles.badgeTextSoon]}>Coming soon</Text>
            </View>
          ) : (
            <TouchableOpacity
              style={[styles.actionBtn, disabled && { opacity: 0.4 }]}
              onPress={onPress}
              disabled={disabled || loading}
            >
              {loading ? <ActivityIndicator size="small" color="#111" /> : <Text style={styles.actionText}>{actionLabel}</Text>}
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Email（有 email 就是 Primary；不可 unlink） */}
      <Row
        icon="mail-outline"
        label="Email"
        detail={user?.email ? user.email : 'Not set'}
        status={user?.email ? 'Primary' : null}
        primary={!!user?.email}
        actionLabel="Manage"
        disabled
        onPress={() => {}}
      />

      {/* Google */}
      <Row
        icon="logo-google"
        label="Google"
        detail={isLinked('google') ? 'Linked' : 'Not linked'}
        status={isPrimary('google') ? 'Primary' : (isLinked('google') ? 'Linked' : null)}
        actionLabel={isLinked('google') ? 'Unlink' : 'Link'}
        disabled={isPrimary('google')}
        loading={linking}
        onPress={isLinked('google') ? unlinkGoogle : linkGoogle}
      />

      {/* 其他先灰掉 */}
      <Row icon="logo-apple" label="Apple" detail="Not linked" actionLabel="Link" comingSoon />
      <Row icon="logo-facebook" label="Facebook" detail="Not linked" actionLabel="Link" comingSoon />
      <Row icon="logo-twitter" label="X" detail="Not linked" actionLabel="Link" comingSoon />
      <Row icon="call-outline" label="Phone" detail="Not linked" actionLabel="Link" comingSoon />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },
  row: {
    minHeight: 64,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rowLeft: { flexDirection: 'row', alignItems: 'center' },
  rowRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  rowTitle: { fontSize: 16, color: '#111', fontWeight: '600' },
  rowDetail: { fontSize: 12, color: '#6B7280', marginTop: 2 },

  actionBtn: {
    paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8,
    borderWidth: 1, borderColor: '#ddd', backgroundColor: '#f9f9f9',
  },
  actionText: { color: '#111', fontWeight: '600' },

  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, marginRight: 6 },
  badgePrimary: { backgroundColor: '#111' },
  badgeLinked: { backgroundColor: '#E5E7EB' },
  badgeSoon: { backgroundColor: '#F3F4F6' },

  badgeText: { fontSize: 12, fontWeight: '700' },
  badgeTextPrimary: { color: '#fff' },
  badgeTextLinked: { color: '#111' },
  badgeTextSoon: { color: '#6B7280' },
});