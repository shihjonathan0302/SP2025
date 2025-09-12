// screens/LoginScreen.js
import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet } from 'react-native';
import * as AuthSession from 'expo-auth-session';
import { supabase } from '../lib/supabaseClient';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(false);

  // 自動判斷 redirect：Web 用 http://localhost:xxxx，原生用 sp2025://auth/callback
  const makeRedirect = () =>
    AuthSession.makeRedirectUri({
      scheme: 'sp2025', // 對應 app.json 的 "scheme"
    });

  const showAuthError = (title, error) => {
    const raw = error?.message || 'Unknown error';
    console.log('[Auth Error]', error);
    if (error?.status === 422 || /registered/i.test(raw)) {
      Alert.alert(title, 'This email is already registered. Please Sign In or use another email.');
      return;
    }
    if (/password/i.test(raw) && /weak|short|min/i.test(raw)) {
      Alert.alert(title, 'Password is too weak. Try a longer password.');
      return;
    }
    Alert.alert(title, raw);
  };

  // 註冊
  async function signUp() {
    if (!email.trim() || !password) {
      Alert.alert('Sign Up Error', 'Please enter your email and password.');
      return;
    }
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signUp({ email: email.trim(), password });
      if (error) {
        showAuthError('Sign Up Error', error);
      } else {
        console.log('[SignUp OK]', data);
        Alert.alert('Check your email', '驗證信已寄出！請前往收信完成註冊，完成後回來 Sign In。');
      }
    } catch (e) {
      Alert.alert('Sign Up Error', String(e));
    } finally {
      setLoading(false);
    }
  }

  // 登入
  async function signIn() {
    if (!email.trim() || !password) {
      Alert.alert('Sign In Error', 'Please enter your email and password.');
      return;
    }
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (error) {
        showAuthError('Sign In Error', error);
        return;
      }
      console.log('[SignIn OK]', data);
      // App.js 的 onAuthStateChange 會自動切換到 RootTabs
    } catch (e) {
      Alert.alert('Sign In Error', String(e));
    } finally {
      setLoading(false);
    }
  }

  // Google 登入
  async function signInWithGoogle() {
    try {
      setOauthLoading(true);
      const redirectTo = makeRedirect();
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo },
      });
      if (error) throw error;
      console.log('[Google OAuth started]', data?.url || '');
    } catch (e) {
      Alert.alert('Google Sign-in error', String(e?.message || e));
    } finally {
      setOauthLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome</Text>

      {/* Email / Password */}
      <TextInput
        placeholder="Email"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
      />
      <TextInput
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        style={styles.input}
      />

      <View style={styles.buttonWrap}>
        <Button title={loading ? '...' : 'Sign In'} onPress={signIn} disabled={loading || oauthLoading} />
      </View>

      <View style={{ height: 20 }} />
      <View style={styles.buttonWrap}>
        <Button title={loading ? '...' : 'Sign Up'} onPress={signUp} disabled={loading || oauthLoading} />
      </View>

      {/* Divider */}
      <View style={{ height: 28 }} />
      <Text style={{ textAlign: 'center', color: '#888' }}>or</Text>
      <View style={{ height: 12 }} />

      {/* Google */}
      <View style={styles.buttonWrap}>
        <Button
          title={oauthLoading ? '...' : 'Continue with Google'}
          onPress={signInWithGoogle}
          disabled={loading || oauthLoading}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 22, marginBottom: 20, textAlign: 'center', fontWeight: '700' },
  input: { borderWidth: 1, borderColor: '#ddd', padding: 10, borderRadius: 8, marginBottom: 10 },
  buttonWrap: { alignSelf: 'stretch' },
});