// screens/LoginScreen.js
import React, { useState } from 'react'
import { View, Text, TextInput, Button, Alert, StyleSheet } from 'react-native'
import { supabase } from '../lib/supabaseClient'

export default function LoginScreen() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const showAuthError = (title, error) => {
    const raw = error?.message || 'Unknown error'
    console.log('[Auth Error]', error) // ← 方便你在 DevTools 看真正錯誤
    if (error?.status === 422 || /registered/i.test(raw)) {
      Alert.alert(title, 'This email is already registered. Please Sign In or use another email.')
      return
    }
    if (/password/i.test(raw) && /weak|short|min/i.test(raw)) {
      Alert.alert(title, 'Password is too weak. Try a longer password.')
      return
    }
    Alert.alert(title, raw)
  }

  async function signUp() {
    if (!email.trim() || !password) {
      Alert.alert('Sign Up Error', 'Please enter your email and password.')
      return
    }
    try {
      setLoading(true)
      const { data, error } = await supabase.auth.signUp({ email: email.trim(), password })
      if (error) {
        showAuthError('Sign Up Error', error)
      } else {
        console.log('[SignUp OK]', data)
        Alert.alert('Check your email', '驗證信已寄出！請前往收信完成註冊，完成後回來 Sign In。')
      }
    } catch (e) {
      Alert.alert('Sign Up Error', String(e))
    } finally {
      setLoading(false)
    }
  }

  async function signIn() {
    if (!email.trim() || !password) {
      Alert.alert('Sign In Error', 'Please enter your email and password.')
      return
    }
    try {
      setLoading(true)
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      })
      if (error) {
        showAuthError('Sign In Error', error)  // ← 密碼錯會進來這裡，一定 Alert
        return
      }
      console.log('[SignIn OK]', data)
      // 不手動導頁：讓 App.js 的 onAuthStateChange 自動切換到 RootTabs
    } catch (e) {
      Alert.alert('Sign In Error', String(e))
    } finally {
      setLoading(false)
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome</Text>

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
        <Button title={loading ? '...' : 'Sign In'} onPress={signIn} disabled={loading} />
      </View>

      <View style={{ height: 20 }} /> {/* 更大間距 */}

      <View style={styles.buttonWrap}>
        <Button title={loading ? '...' : 'Sign Up'} onPress={signUp} disabled={loading} />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  title: { fontSize: 22, marginBottom: 20, textAlign: 'center', fontWeight: '700' },
  input: { borderWidth: 1, borderColor: '#ddd', padding: 10, borderRadius: 8, marginBottom: 10 },
  buttonWrap: { alignSelf: 'stretch' },
})