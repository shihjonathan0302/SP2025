import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { supabase } from '../../lib/supabaseClient';

export default function AccountEmailPasswordScreen() {
  const [email, setEmail] = useState('');
  const [pwd, setPwd] = useState('');
  const [loading, setLoading] = useState(false);

  const updateEmail = async () => {
    if (!email.trim()) return Alert.alert('Update Email', '請輸入 Email');
    try {
      setLoading(true);
      const { error } = await supabase.auth.updateUser({ email: email.trim() });
      if (error) throw error;
      Alert.alert('Email', '已寄出確認信，請到信箱完成流程。');
    } catch (e) {
      Alert.alert('Email Error', String(e?.message || e));
    } finally {
      setLoading(false);
    }
  };

  const updatePassword = async () => {
    if (!pwd) return Alert.alert('Update Password', '請輸入新密碼');
    try {
      setLoading(true);
      const { error } = await supabase.auth.updateUser({ password: pwd });
      if (error) throw error;
      Alert.alert('Password', '已更新密碼。');
      setPwd('');
    } catch (e) {
      Alert.alert('Password Error', String(e?.message || e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Email</Text>
      <TextInput
        placeholder="New email"
        autoCapitalize="none"
        keyboardType="email-address"
        style={styles.input}
        value={email}
        onChangeText={setEmail}
      />
      <Button title={loading ? '...' : 'Update Email'} onPress={updateEmail} disabled={loading} />

      <View style={{ height: 24 }} />

      <Text style={styles.title}>Password</Text>
      <TextInput placeholder="New password" secureTextEntry style={styles.input} value={pwd} onChangeText={setPwd} />
      <Button title={loading ? '...' : 'Update Password'} onPress={updatePassword} disabled={loading} />

      <View style={{ height: 24 }} />
      <Text style={{ color: '#888' }}>Edit Profile / Delete Account 之後再加。</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },
  title: { fontWeight: '700', marginBottom: 6 },
  input: { borderWidth: 1, borderColor: '#ddd', padding: 10, borderRadius: 8, marginBottom: 10 },
});