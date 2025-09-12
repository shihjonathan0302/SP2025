// src/lib/supabaseClient.js
import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SUPABASE_URL = 'https://baygppmzqzisddezwyrs.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJheWdwcG16cXppc2RkZXp3eXJzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUzMTE3NzgsImV4cCI6MjA3MDg4Nzc3OH0.ELF_kjAuuHDQWxLQV2XpxekR1MAdt_PqgDXDoI0pNK4'; // 你的 key

// 原生使用 AsyncStorage；Web 使用預設的 localStorage
const storage = Platform.OS === 'web'
  ? undefined
  : {
      getItem: (key) => AsyncStorage.getItem(key),
      setItem: (key, value) => AsyncStorage.setItem(key, value),
      removeItem: (key) => AsyncStorage.removeItem(key),
    };

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    flowType: 'pkce',
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage,
  },
});