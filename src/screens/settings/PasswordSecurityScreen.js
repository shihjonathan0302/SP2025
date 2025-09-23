// src/screens/settings/PasswordSecurityScreen.js
import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Platform,
  Modal,
  TextInput,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../lib/supabaseClient';

export default function PasswordSecurityScreen({ navigation }) {
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  // modal state
  const [pwdOpen, setPwdOpen] = useState(false);
  const [working, setWorking] = useState(false);
  const [currentPwd, setCurrentPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const { data, error } = await supabase.auth.getUser();
        if (error) throw error;
        if (!alive) return;
        setUser(data?.user ?? null);
      } catch (e) {
        Alert.alert('Error', String(e?.message || e));
      } finally {
        setLoadingUser(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  const identities = useMemo(() => user?.identities ?? [], [user]);
  const hasEmailPassword = useMemo(
    () => identities.some(i => i.provider === 'email'),
    [identities]
  );

  const handleOpenChangePassword = () => {
    if (!hasEmailPassword) {
      // 引導去 Linked Accounts 先連結 Email
      if (Platform.OS === 'web') {
        const go = window.confirm('This account doesn’t have an email/password method yet. Link your email first in Linked Accounts?');
        if (go) navigation.navigate('LinkedAccounts');
      } else {
        Alert.alert(
          'Email not linked',
          'This account doesn’t have an email/password method yet. Link your email first in Linked Accounts.',
          [{ text: 'Cancel', style: 'cancel' }, { text: 'Open Linked Accounts', onPress: () => navigation.navigate('LinkedAccounts') }]
        );
      }
      return;
    }
    setCurrentPwd('');
    setNewPwd('');
    setConfirmPwd('');
    setPwdOpen(true);
  };

  const validateNewPassword = (pwd) => {
    // 你可以按需求加強規則；先用最基本的
    if (!pwd || pwd.length < 8) return 'Password must be at least 8 characters.';
    return null;
  };

  const doChangePassword = async () => {
    const email = user?.email || '';
    if (!email) {
      Alert.alert('Error', 'Email not found on this account.');
      return;
    }
    // 基礎檢查
    if (!currentPwd) { Alert.alert('Invalid', 'Please enter your current password.'); return; }
    const ruleErr = validateNewPassword(newPwd);
    if (ruleErr) { Alert.alert('Invalid', ruleErr); return; }
    if (newPwd !== confirmPwd) { Alert.alert('Invalid', 'New password and confirmation do not match.'); return; }

    try {
      setWorking(true);
      // 1) 先以舊密碼 reauth（避免別人拿到解鎖中的裝置就改密碼）
      const { error: reauthErr } = await supabase.auth.signInWithPassword({ email, password: currentPwd });
      if (reauthErr) throw reauthErr;

      // 2) 更新密碼
      const { error: updErr } = await supabase.auth.updateUser({ password: newPwd });
      if (updErr) throw updErr;

      setPwdOpen(false);
      if (Platform.OS === 'web') window.alert?.('Password changed successfully.');
      else Alert.alert('Success', 'Password changed successfully.');
    } catch (e) {
      const msg = String(e?.message || e);
      if (Platform.OS === 'web') window.alert?.(`Change failed: ${msg}`);
      else Alert.alert('Change failed', msg);
    } finally {
      setWorking(false);
    }
  };

  const handleTwoFactor = () => {
    Alert.alert('Coming Soon', 'Two-Factor Authentication is not yet available.');
  };

  const handleDevices = () => {
    Alert.alert('Coming Soon', 'Device management is not yet available.');
  };

  if (loadingUser) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Password & Security</Text>
      <Text style={styles.caption}>Manage how you secure your Futra account.</Text>

      {/* Section: Password（保留你原本的卡片/列樣式） */}
      <View style={styles.card}>
        <Row
          icon="lock-closed-outline"
          label="Change Password"
          onPress={handleOpenChangePassword}
          danger
        />
      </View>

      {/* Section: 2FA */}
      <View style={styles.card}>
        <Row
          icon="shield-checkmark-outline"
          label="Two-Factor Authentication"
          detail="Coming soon"
          dim
          onPress={handleTwoFactor}
        />
      </View>

      {/* Section: Devices */}
      <View style={styles.card}>
        <Row
          icon="phone-portrait-outline"
          label="Manage Devices"
          detail="Coming soon"
          dim
          onPress={handleDevices}
        />
      </View>

      {/* Change Password Modal（維持簡潔、中性風格） */}
      <Modal visible={pwdOpen} transparent animationType="fade" onRequestClose={() => setPwdOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => (working ? null : setPwdOpen(false))}>
          <View />
        </Pressable>
        <View style={styles.sheet}>
          <Text style={styles.sheetTitle}>Change Password</Text>
          <Text style={styles.sheetHint}>Enter your current password and a new one.</Text>

          <Text style={styles.inputLabel}>Current password</Text>
          <TextInput
            value={currentPwd}
            onChangeText={setCurrentPwd}
            secureTextEntry
            placeholder="Enter current password"
            placeholderTextColor="#9CA3AF"
            style={styles.input}
            editable={!working}
          />

          <Text style={styles.inputLabel}>New password</Text>
          <TextInput
            value={newPwd}
            onChangeText={setNewPwd}
            secureTextEntry
            placeholder="At least 8 characters"
            placeholderTextColor="#9CA3AF"
            style={styles.input}
            editable={!working}
          />

          <Text style={styles.inputLabel}>Confirm new password</Text>
          <TextInput
            value={confirmPwd}
            onChangeText={setConfirmPwd}
            secureTextEntry
            placeholder="Re-enter new password"
            placeholderTextColor="#9CA3AF"
            style={styles.input}
            editable={!working}
          />

          <View style={styles.sheetRow}>
            <TouchableOpacity
              onPress={() => setPwdOpen(false)}
              disabled={working}
              style={[styles.btn, styles.btnGhost]}
            >
              <Text style={styles.btnGhostTxt}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={doChangePassword}
              disabled={working}
              style={styles.btn}
            >
              <Text style={styles.btnTxt}>{working ? 'Updating…' : 'Update password'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

/* ---------- Reusable Row（維持你在 Linked Accounts 的質感） ---------- */
function Row({ icon, label, detail, onPress, dim, danger }) {
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      style={[styles.row, dim && { opacity: 0.5 }]}
      onPress={onPress}
      disabled={dim}
    >
      <View style={styles.rowLeft}>
        <View style={styles.ic}>
          <Ionicons name={icon} size={18} color="#111" />
        </View>
        <Text
          style={[
            styles.rowLabel,
            danger && { color: '#c0392b', fontWeight: '700' },
          ]}
        >
          {label}
        </Text>
      </View>

      <View style={styles.rowRight}>
        {!!detail && <Text style={styles.rowDetail}>{detail}</Text>}
        {!dim && <Ionicons name="chevron-forward" size={18} color="#999" />}
      </View>
    </TouchableOpacity>
  );
}

/* ---------- Styles（沿用你現在的設計語言） ---------- */
const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff' },
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },
  title: { fontSize: 20, fontWeight: '700', marginTop: 6 },
  caption: { color: '#6B7280', marginTop: 4, marginBottom: 16 },

  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#eee',
    marginBottom: 14,
    overflow: 'hidden',
  },

  row: {
    minHeight: 56,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: '#eee',
  },
  rowLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  rowRight: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  rowLabel: { fontSize: 16, fontWeight: '600', color: '#111' },
  rowDetail: { fontSize: 13, color: '#6B7280' },

  ic: {
    width: 32,
    height: 32,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#eee',
    backgroundColor: '#F9FAFB',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Modal / sheet
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.45)' },
  sheet: {
    position: 'absolute',
    left: 12, right: 12, bottom: 12,
    borderRadius: 14,
    backgroundColor: '#fff',
    padding: 16,
    borderWidth: 1,
    borderColor: '#eee',
    gap: 8,
  },
  sheetTitle: { fontSize: 16, fontWeight: '700', color: '#111' },
  sheetHint: { color: '#6B7280', marginBottom: 6 },

  inputLabel: { fontSize: 12, color: '#6B7280', marginTop: 6, marginBottom: 4 },
  input: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: '#111',
    backgroundColor: '#fff',
  },

  sheetRow: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8, marginTop: 10 },
  btn: { backgroundColor: '#111827', paddingHorizontal: 14, paddingVertical: 12, borderRadius: 10 },
  btnTxt: { color: '#fff', fontWeight: '700' },
  btnGhost: { backgroundColor: '#F3F4F6' },
  btnGhostTxt: { color: '#111827', fontWeight: '700' },
});