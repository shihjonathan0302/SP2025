// src/screens/settings/LinkedAccountsScreen.js
import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../lib/supabaseClient';

export default function LinkedAccountsScreen() {
  const [loading, setLoading] = useState(true);
  const [linking, setLinking] = useState(false);
  const [user, setUser] = useState(null);
  const [primaryProvider, setPrimaryProvider] = useState(null); // ← 從 profiles 讀/寫

  // 讀目前使用者
  const getUser = async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error) throw error;
    return data?.user ?? null;
  };

  // 讀/寫 profiles.primary_provider
  const fetchPrimaryProvider = async (uid) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('primary_provider')
      .eq('id', uid)
      .single();
    if (error) throw error;
    return data?.primary_provider ?? null;
  };

  const setPrimaryProviderIfEmpty = async (uid, providerGuess) => {
    // 只有在目前是 null 的時候，才初始化一次
    const { data, error } = await supabase
      .from('profiles')
      .update({ primary_provider: providerGuess, updated_at: new Date().toISOString() })
      .eq('id', uid)
      .is('primary_provider', null)
      .select('primary_provider')
      .single();
    if (error && error.code !== 'PGRST116') throw error; // 空結果不視為錯
    return data?.primary_provider ?? providerGuess;
  };

  const updatePrimaryProvider = async (uid, nextProvider) => {
    const { error } = await supabase
      .from('profiles')
      .update({ primary_provider: nextProvider, updated_at: new Date().toISOString() })
      .eq('id', uid);
    if (error) throw error;
    setPrimaryProvider(nextProvider);
  };

  // 刷新整體狀態（包含 user、primary_provider）
  const refreshAll = async () => {
    try {
      const u = await getUser();
      setUser(u);

      if (!u) {
        setPrimaryProvider(null);
        return;
      }

      // 先讀 profiles 的 primary_provider
      let pp = await fetchPrimaryProvider(u.id);

      // 若還沒設定：依「第一次登入」規則初始化一次
      if (!pp) {
        // 優先用 app_metadata.provider；退而求其次 identities[0]
        const first =
          u?.app_metadata?.provider ||
          (u?.identities?.length ? u.identities[0].provider : 'email');
        pp = await setPrimaryProviderIfEmpty(u.id, first);
      }

      setPrimaryProvider(pp);
    } catch (e) {
      Alert.alert('Error', String(e?.message || e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshAll();
  }, []);

  const identities = useMemo(() => user?.identities ?? [], [user]);
  const providers  = useMemo(() => identities.map(i => i.provider), [identities]);
  const isLinked   = (p) => providers.includes(p);
  const getIdentityId = (p) => identities.find(i => i.provider === p)?.identity_id;
  const isLastIdentity = identities.length <= 1;

  // ===== Link Google =====
  const linkGoogle = async () => {
    if (Platform.OS !== 'web') {
      Alert.alert('Link on Web', 'Google linking/unlinking currently only supported on Web.');
      return;
    }
    try {
      setLinking(true);
      const { error } = await supabase.auth.linkIdentity({
        provider: 'google',
        options: {
          redirectTo: typeof window !== 'undefined' ? window.location.origin : undefined,
        },
      });
      if (error) throw error;

      // 大多數情況會跳轉 OAuth；保險 1.5s 後再刷新（若瀏覽器沒跳）
      setTimeout(refreshAll, 1500);
    } catch (e) {
      Alert.alert('Link failed', String(e?.message || e));
    } finally {
      setLinking(false);
    }
  };

  // ===== Unlink Google =====
  const unlinkGoogle = async () => {
    if (isLastIdentity) {
      Alert.alert('Blocked', 'You must keep at least one sign-in method.');
      return;
    }
    const identityId = getIdentityId('google');
    if (!identityId) {
      Alert.alert('Not linked', 'Google is not linked on this account.');
      return;
    }

    // 確認對話
    const confirm = async () => {
      try {
        setLinking(true);
        const { error } = await supabase.auth.unlinkIdentity({ identity_id: identityId });
        if (error) throw error;

        // 重新讀 user（拿到剩下的 identities）
        const u2 = await getUser();

        // 如果剛好把 Primary 拔掉了 → 指定新的 Primary
        if (primaryProvider === 'google') {
          // 優先選 email，其次第一個剩餘 provider
          const next =
            (u2?.identities?.some(i => i.provider === 'email') ? 'email' : (u2?.identities?.[0]?.provider || 'email'));
          await updatePrimaryProvider(u2.id, next);
        }

        setUser(u2);
        Alert.alert('Unlinked', 'Google account has been unlinked.');
      } catch (e) {
        const msg = String(e?.message || e);
        if (msg.toLowerCase().includes('manual linking is disabled')) {
          Alert.alert('Unlink blocked',
            'Enable manual linking in Supabase → Authentication → Providers.');
        } else {
          Alert.alert('Unlink failed', msg);
        }
      } finally {
        setLinking(false);
      }
    };

    if (Platform.OS === 'web') {
      const ok = window.confirm('Are you sure you want to unlink your Google account?');
      if (ok) await confirm();
    } else {
      Alert.alert(
        'Confirm unlink',
        'Are you sure you want to unlink your Google account?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Unlink', style: 'destructive', onPress: confirm },
        ]
      );
    }
  };

  // ===== 其他 provider（灰階）=====
  const comingSoon = (label) => {
    Alert.alert('Coming Soon', `${label} linking is coming soon.`);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
      </View>
    );
  }

  const email = user?.email ?? '';
  const uid   = user?.id ?? '';

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Linked Accounts</Text>
      <Text style={styles.caption}>Manage how you sign in to your Futra account.</Text>

      {/* Email（顯示 Primary 與 email） */}
      <Row
        icon="mail-outline"
        label="Email"
        detail={email || '—'}
        status={primaryProvider === 'email' ? 'Primary' : (isLinked('email') ? 'Linked' : null)}
        primary={primaryProvider === 'email'}
        disabled
      />

      {/* Google（會標記 Primary 或 Linked） */}
      <Row
        icon="logo-google"
        label="Google"
        detail={isLinked('google') ? 'Linked' : 'Not linked'}
        status={primaryProvider === 'google' ? 'Primary' : (isLinked('google') ? 'Linked' : null)}
        actionLabel={isLinked('google') ? 'Unlink' : 'Link'}
        onPress={isLinked('google') ? unlinkGoogle : linkGoogle}
        loading={linking}
        primary={primaryProvider === 'google'}
      />

      {/* 其他 provider（灰階） */}
      <Row icon="logo-apple"    label="Apple"      detail="Coming soon" dim disabled onPress={() => comingSoon('Apple')} />
      <Row icon="call-outline"  label="Phone"      detail="Coming soon" dim disabled onPress={() => comingSoon('Phone')} />
      <Row icon="logo-facebook" label="Facebook"   detail="Coming soon" dim disabled onPress={() => comingSoon('Facebook')} />
      <Row icon="logo-twitter"  label="X (Twitter)" detail="Coming soon" dim disabled onPress={() => comingSoon('X')} />

      <View style={{ height: 10 }} />
      <Text style={styles.smallNote}>Primary = the method you first signed up with. You must keep at least one sign-in method.</Text>
      <Text style={styles.smallNote}>User ID: {uid}</Text>
    </View>
  );
}

/* ---------- Row（整條可點；右側按鈕也可點） ---------- */
function Row({
  icon,
  label,
  detail,
  status,
  actionLabel,
  onPress,
  disabled,
  dim,
  loading,
  primary,
}) {
  const disabledAll = !!disabled || !!loading || !onPress;

  const handlePress = () => {
    if (disabledAll) return;
    onPress?.();
  };

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={handlePress}
      disabled={disabledAll}
      style={[styles.row, dim && { opacity: 0.5 }]}
    >
      <View style={styles.rowLeft}>
        <View style={[styles.ic, primary && styles.icPrimary]}>
          <Ionicons name={icon} size={18} color={primary ? '#fff' : '#111'} />
        </View>
        <View>
          <Text style={styles.rowLabel}>{label}</Text>
          {!!detail && <Text style={styles.rowDetail}>{detail}</Text>}
        </View>
      </View>

      <View style={styles.rowRight}>
        {!!status && <Text style={styles.badge}>{status}</Text>}
        {!!actionLabel && (
          <TouchableOpacity
            onPress={handlePress}
            disabled={disabledAll}
            activeOpacity={0.8}
            style={[styles.actionBtn, (disabledAll) && { opacity: 0.5 }]}
          >
            <Text style={styles.actionTxt}>
              {loading ? 'Please wait…' : actionLabel}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
}

/* ---------- Styles ---------- */
const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff' },
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },
  title: { fontSize: 20, fontWeight: '700', marginTop: 6 },
  caption: { color: '#6B7280', marginTop: 4, marginBottom: 14 },

  row: {
    minHeight: 64,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#eee',
    backgroundColor: '#fff',
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  rowLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  ic: {
    width: 36,
    height: 36,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#eee',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F9FAFB',
  },
  icPrimary: { backgroundColor: '#111', borderColor: '#111' },

  rowLabel: { fontSize: 16, fontWeight: '600', color: '#111' },
  rowDetail: { fontSize: 13, color: '#6B7280', marginTop: 2 },

  rowRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  badge: {
    backgroundColor: '#EEF2FF',
    color: '#4338CA',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    fontSize: 12,
    overflow: 'hidden',
    marginRight: 6,
  },

  actionBtn: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#111827',
  },
  actionTxt: { color: '#fff', fontWeight: '600' },

  smallNote: { color: '#6B7280', fontSize: 12, marginTop: 4 },
});