// screens/SettingsScreen.js
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Alert, Platform, SectionList,
  Switch, TextInput, Pressable
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabaseClient';

// ==== Local keys (集中管理) ====
const K = {
  theme: 'settings.appearance.theme.v1',         // 'light' | 'dark' | 'system'(顯示用途)
  lang: 'settings.language.v1',                  // e.g. 'en' | 'zh'
  notif: 'settings.notifications.v1',            // { enabled:boolean, hour:number }
  ai: 'settings.promptFilter.v1',                // { minChars, maxBullets, tone, enforceSMART, bannedWords[] }
  analytics: 'settings.analytics.optin.v1',      // boolean
  dev: 'settings.dev.enabled.v1',                // boolean (隱藏選項)
};

const AI_DEFAULTS = {
  minChars: 10,
  maxBullets: 6,
  tone: 'coach',
  enforceSMART: true,
  bannedWords: ['cheat', 'hack'],
};

// 小工具
const get = async (key, fallback) => {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};
const set = async (key, value) => {
  await AsyncStorage.setItem(key, JSON.stringify(value));
};

export default function SettingsScreen({ navigation }) {
  // ===== User info =====
  const [email, setEmail] = useState('');
  const [providers, setProviders] = useState([]);
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const { data, error } = await supabase.auth.getUser();
        if (error) return;
        if (!alive) return;
        const user = data?.user;
        setEmail(user?.email ?? '');
        const provs = (user?.identities || []).map(i => i.provider || 'email');
        setProviders(provs.length ? Array.from(new Set(provs)) : ['email']);
      } catch (e) {
        // ignore
      }
    })();
    return () => { alive = false; };
  }, []);

  // ===== Local settings state（一次集中載入） =====
  const [theme, setTheme] = useState('light'); // 顯示用：'light' | 'dark' | 'system'
  const [lang, setLang] = useState('en');
  const [notif, setNotif] = useState({ enabled: true, hour: 9 });
  const [ai, setAI] = useState(AI_DEFAULTS);
  const [analyticsOptIn, setAnalyticsOptIn] = useState(false);
  const [devMode, setDevMode] = useState(false);

  useEffect(() => {
    (async () => {
      setTheme(await get(K.theme, 'light'));
      setLang(await get(K.lang, 'en'));
      setNotif(await get(K.notif, { enabled: true, hour: 9 }));
      setAI(await get(K.ai, AI_DEFAULTS));
      setAnalyticsOptIn(await get(K.analytics, false));
      setDevMode(await get(K.dev, false));
    })();
  }, []);

  // ===== Save helpers =====
  const saveTheme = useCallback(async (t) => { setTheme(t); await set(K.theme, t); }, []);
  const saveLang = useCallback(async (l) => { setLang(l); await set(K.lang, l); }, []);
  const saveNotif = useCallback(async (patch) => {
    const next = { ...notif, ...patch };
    setNotif(next); await set(K.notif, next);
  }, [notif]);
  const saveAI = useCallback(async (patch) => {
    const next = { ...ai, ...patch };
    setAI(next); await set(K.ai, next);
  }, [ai]);
  const saveAnalytics = useCallback(async (v) => { setAnalyticsOptIn(v); await set(K.analytics, v); }, []);
  const saveDevMode = useCallback(async (v) => { setDevMode(v); await set(K.dev, v); }, []);

  // ===== Sign out =====
  const doSignOut = async (origin = 'unknown') => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        if (Platform.OS === 'web') window.alert?.(`登出失敗：${error.message}`);
        else Alert.alert('登出失敗', error.message);
        return;
      }
      // App.js 的 onAuthStateChange 會處理導回 Login
    } catch (e) {
      if (Platform.OS === 'web') window.alert?.(`登出失敗：${String(e)}`);
      else Alert.alert('登出失敗', String(e));
    }
  };

  // ===== Export / Import / Clear =====
  const exportAll = async () => {
    const keys = await AsyncStorage.getAllKeys();
    const entries = await AsyncStorage.multiGet(keys);
    const obj = Object.fromEntries(entries.map(([k, v]) => [k, v]));
    const pretty = JSON.stringify(obj, null, 2);
    if (Platform.OS === 'web') window.alert?.(pretty);
    else Alert.alert('Export JSON', pretty);
  };
  const importAll = async () => {
    if (Platform.OS === 'web') {
      const txt = window.prompt?.('貼上設定 JSON');
      if (!txt) return;
      try {
        const obj = JSON.parse(txt);
        await Promise.all(Object.entries(obj).map(([k, v]) => AsyncStorage.setItem(k, String(v))));
        AlertMsg('Imported', 'Settings imported');
      } catch (e) {
        AlertMsg('Error', String(e));
      }
      return;
    }
    Alert.prompt?.('Import JSON', '貼上設定 JSON', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Import', onPress: async (txt) => {
        try {
          const obj = JSON.parse(txt);
          await Promise.all(Object.entries(obj).map(([k, v]) => AsyncStorage.setItem(k, String(v))));
          AlertMsg('Imported', 'Settings imported');
        } catch (e) { AlertMsg('Error', String(e)); }
      }},
    ], 'plain-text');
  };
  const clearCache = async () => {
    Alert.alert('Clear Cache', 'This will remove local data (settings, temp cache).', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Clear', style: 'destructive', onPress: async () => {
        await AsyncStorage.clear();
        AlertMsg('Cleared', 'Local cache cleared');
      }},
    ]);
  };
  const AlertMsg = (title, msg) => {
    if (Platform.OS === 'web') window.alert?.(`${title}\n\n${msg}`);
    else Alert.alert(title, msg);
  };

  // ===== Hidden Dev Mode (tap version 7 times) =====
  const taps = useRef(0);
  const handleVersionTap = async () => {
    taps.current += 1;
    if (taps.current >= 7) {
      taps.current = 0;
      await saveDevMode(true);
      AlertMsg('Developer mode', 'Enabled');
    }
  };

  // ===== Sections =====
  const sections = useMemo(() => ([
    {
      title: 'Account',
      data: [
        { type: 'static', key: 'email', label: 'Email', value: email || '-' },
        { type: 'static', key: 'providers', label: 'Providers', value: providers.join(', ') },
        { type: 'nav', key: 'ChangePassword', label: 'Change Password' }, // 你已有路由
      ],
    },
    {
      title: 'App',
      data: [
        { type: 'select3', key: 'theme', label: 'Appearance', value: theme, onChange: saveTheme, options: ['light','dark','system'] },
        { type: 'text', key: 'lang', label: 'Language', value: lang, onChange: saveLang, placeholder: 'en / zh / fr ...' },
        { type: 'switch', key: 'notifEnabled', label: 'Enable notifications', value: !!notif.enabled,
          onChange: (v)=> saveNotif({ enabled: v }) },
        { type: 'number', key: 'notifHour', label: 'Daily reminder hour', value: String(notif.hour ?? 9),
          onChange: (t)=> {
            const n = Math.max(0, Math.min(23, parseInt(t || '9', 10) || 9));
            saveNotif({ hour: n });
          }},
      ],
    },
    {
      title: 'AI Prompt Filter',
      data: [
        { type: 'number', key: 'pfMin', label: 'Minimum characters', value: String(ai.minChars),
          onChange: (t)=> saveAI({ minChars: Math.max(0, parseInt(t||'0',10)||0) }) },
        { type: 'number', key: 'pfMax', label: 'Max subgoals', value: String(ai.maxBullets),
          onChange: (t)=> saveAI({ maxBullets: Math.max(1, parseInt(t||'1',10)||1) }) },
        { type: 'text', key: 'pfTone', label: 'Tone', value: ai.tone, onChange: (t)=> saveAI({ tone: t }), placeholder: 'neutral / coach / concise / detailed' },
        { type: 'switch', key: 'pfSMART', label: 'Enforce SMART', value: !!ai.enforceSMART,
          onChange: (v)=> saveAI({ enforceSMART: v }) },
        { type: 'chips', key: 'pfBanned', label: 'Banned words', value: ai.bannedWords,
          onAdd: (w)=> {
            const word = (w||'').trim(); if (!word) return;
            const next = Array.from(new Set([...(ai.bannedWords||[]), word]));
            saveAI({ bannedWords: next });
          },
          onRemove: (w)=> {
            const next = (ai.bannedWords||[]).filter(x => x !== w);
            saveAI({ bannedWords: next });
          }},
      ],
    },
    {
      title: 'Privacy & Info',
      data: [
        { type: 'switch', key: 'analytics', label: 'Share anonymous diagnostics', value: !!analyticsOptIn, onChange: saveAnalytics },
        { type: 'button', key: 'export', label: 'Export Settings (JSON)', onPress: exportAll },
        { type: 'button', key: 'import', label: 'Import Settings (JSON)', onPress: importAll },
        { type: 'button-danger', key: 'clear', label: 'Clear Local Cache', onPress: clearCache },
        { type: 'nav', key: 'PrivacySettings', label: 'Privacy & Data' }, // 你已有路由：詳細條款/佈告欄可放那邊
        { type: 'nav', key: 'About', label: 'About' },                     // 你已有路由
        { type: 'danger', key: 'SignOut', label: 'Sign Out', onPress: () => {
            if (Platform.OS === 'web') {
              const ok = window.confirm?.('確定要登出嗎？');
              if (ok) doSignOut('web-confirm');
            } else {
              Alert.alert('確認登出', '確定要登出嗎？', [
                { text: '取消', style: 'cancel' },
                { text: '登出', style: 'destructive', onPress: () => doSignOut('native-alert') },
              ]);
            }
          } },
      ],
    },
    devMode ? {
      title: 'Developer',
      data: [
        { type: 'button', key: 'devDump', label: 'Dump current settings', onPress: async () => {
            const obj = {
              theme: await get(K.theme, ''),
              lang: await get(K.lang, ''),
              notif: await get(K.notif, null),
              ai: await get(K.ai, null),
              analytics: await get(K.analytics, null),
              dev: await get(K.dev, null),
            };
            AlertMsg('Dump', JSON.stringify(obj, null, 2));
          }},
        { type: 'button', key: 'devDisable', label: 'Disable Developer Mode', onPress: async ()=> { await saveDevMode(false); } },
      ],
    } : null,
  ].filter(Boolean)), [email, providers, theme, lang, notif, ai, analyticsOptIn, devMode, saveNotif, saveAI]);

  // ===== Renderers =====
  const renderItem = ({ item }) => {
    switch (item.type) {
      case 'static':
        return (
          <Row>
            <Label>{item.label}</Label>
            <Value>{item.value}</Value>
          </Row>
        );
      case 'nav':
        return (
          <TouchableOpacity style={styles.row} onPress={() => navigation.navigate(item.key)}>
            <Label>{item.label}</Label>
            <Value style={{ color:'#666' }}>›</Value>
          </TouchableOpacity>
        );
      case 'switch':
        return (
          <Row>
            <Label>{item.label}</Label>
            <Switch value={!!item.value} onValueChange={item.onChange} />
          </Row>
        );
      case 'text':
        return (
          <Row>
            <Label>{item.label}</Label>
            <TextInput
              style={styles.input}
              value={String(item.value ?? '')}
              onChangeText={item.onChange}
              placeholder={item.placeholder}
            />
          </Row>
        );
      case 'number':
        return (
          <Row>
            <Label>{item.label}</Label>
            <TextInput
              style={[styles.input, { minWidth: 90, textAlign: 'right' }]}
              value={String(item.value ?? '')}
              onChangeText={item.onChange}
              keyboardType="number-pad"
            />
          </Row>
        );
      case 'select3':
        return (
          <Row>
            <Label>{item.label}</Label>
            <View style={styles.segment}>
              {['light','dark','system'].map(opt => (
                <Pressable
                  key={opt}
                  onPress={() => item.onChange(opt)}
                  style={[styles.segmentBtn, item.value === opt && styles.segmentBtnActive]}>
                  <Text style={[styles.segmentTxt, item.value === opt && styles.segmentTxtActive]}>{opt}</Text>
                </Pressable>
              ))}
            </View>
          </Row>
        );
      case 'chips':
        return (
          <View style={styles.block}>
            <Label>{item.label}</Label>
            <ChipEditor
              values={item.value || []}
              onAdd={item.onAdd}
              onRemove={item.onRemove}
            />
          </View>
        );
      case 'button':
        return (
          <TouchableOpacity onPress={item.onPress} style={styles.btn}>
            <Text style={styles.btnText}>{item.label}</Text>
          </TouchableOpacity>
        );
      case 'button-danger':
        return (
          <TouchableOpacity onPress={item.onPress} style={[styles.btn, styles.btnDanger]}>
            <Text style={[styles.btnText, styles.btnDangerText]}>{item.label}</Text>
          </TouchableOpacity>
        );
      case 'danger':
        return (
          <TouchableOpacity onPress={item.onPress} style={styles.row}>
            <Text style={[styles.itemText, styles.dangerText]}>{item.label}</Text>
          </TouchableOpacity>
        );
      default:
        return null;
    }
  };

  const renderSectionHeader = ({ section }) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{section.title}</Text>
    </View>
  );

  // ===== Header (profile + version) =====
  const VersionRow = () => (
    <Pressable onPress={handleVersionTap} style={styles.version}>
      <Text style={styles.versionTxt}>Build</Text>
      <Text style={styles.versionVal}>{formatBuild()}</Text>
    </Pressable>
  );

  return (
    <View style={styles.container}>
      {/* Profile Header */}
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarTxt}>{(email || 'U')[0].toUpperCase()}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Settings</Text>
          <Text style={styles.headerSubtitle}>
            {email ? `Signed in as ${email}` : 'Signed in'}
          </Text>
          <Text style={styles.headerMinor}>
            Providers: {providers.join(', ')}
          </Text>
        </View>
        <VersionRow />
      </View>

      <SectionList
        sections={sections}
        keyExtractor={(item) => item.key}
        renderItem={renderItem}
        renderSectionHeader={renderSectionHeader}
        SectionSeparatorComponent={() => <View style={{ height: 8 }} />}
        stickySectionHeadersEnabled={false}
        contentContainerStyle={{ paddingBottom: 24 }}
      />
    </View>
  );
}

/* ---------- Small UI pieces (同檔內，避免新增檔案) ---------- */
function Row({ children }) {
  return <View style={styles.row}>{children}</View>;
}
function Label({ children, style }) {
  return <Text style={[styles.label, style]}>{children}</Text>;
}
function Value({ children, style }) {
  return <Text style={[styles.value, style]}>{children}</Text>;
}

function ChipEditor({ values, onAdd, onRemove }) {
  const [text, setText] = useState('');
  return (
    <View>
      <View style={{ flexDirection:'row', gap:8 }}>
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder="add word…"
          style={[styles.input, { flex:1 }]}
        />
        <Pressable
          onPress={()=> { const w = text.trim(); if (!w) return; onAdd(w); setText(''); }}
          style={styles.addBtn}
        >
          <Text style={{ color:'#fff' }}>Add</Text>
        </Pressable>
      </View>
      <View style={styles.chipsWrap}>
        {(values||[]).map(w => (
          <Pressable
            key={w}
            onLongPress={()=> onRemove(w)}
            style={styles.chip}
          >
            <Text>{w}</Text>
          </Pressable>
        ))}
      </View>
      <Text style={styles.hint}>長按標籤可刪除</Text>
    </View>
  );
}

/* ---------- Utils ---------- */
function formatBuild() {
  // 你也可以改成讀 app.json / Constants.nativeAppVersion
  const d = new Date();
  const s = `${d.getFullYear()}-${pad2(d.getMonth()+1)}-${pad2(d.getDate())}`;
  return s;
}
function pad2(n) { return String(n).padStart(2, '0'); }

/* ---------- Styles ---------- */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },

  header: {
    flexDirection:'row', alignItems:'center',
    paddingHorizontal: 16, paddingTop: 16, paddingBottom: 12,
    borderBottomWidth: 1, borderBottomColor: '#eee',
    gap: 12,
  },
  avatar: { width:44, height:44, borderRadius:22, backgroundColor:'#111', alignItems:'center', justifyContent:'center' },
  avatarTxt: { color:'#fff', fontWeight:'700', fontSize:18 },
  headerTitle: { fontSize: 20, fontWeight: '700' },
  headerSubtitle: { color: '#666', marginTop: 2 },
  headerMinor: { color: '#888', fontSize: 12, marginTop: 2 },

  version: { alignItems:'flex-end' },
  versionTxt: { fontSize: 12, color:'#888' },
  versionVal: { fontSize: 12, color:'#666', textDecorationLine:'underline' },

  sectionHeader: {
    paddingHorizontal: 16,
    paddingTop: 14, paddingBottom: 6,
    backgroundColor: '#fff',
  },
  sectionTitle: { fontSize: 13, fontWeight: '600', color: '#888' },

  row: {
    minHeight: 56,
    paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: '#eee',
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },

  label: { fontSize: 16, color: '#111' },
  value: { fontSize: 16, color: '#555' },

  input: { borderWidth:1, borderColor:'#ddd', borderRadius:8, padding:8, minWidth:100, textAlign:'right' },

  segment: { flexDirection:'row', backgroundColor:'#f3f4f6', borderRadius:999, padding:4 },
  segmentBtn: { paddingHorizontal:10, paddingVertical:6, borderRadius:999 },
  segmentBtnActive: { backgroundColor:'#111' },
  segmentTxt: { fontSize:12, color:'#111' },
  segmentTxtActive: { color:'#fff', fontWeight:'600' },

  block: { paddingHorizontal:16, paddingVertical:12, borderBottomWidth:1, borderBottomColor:'#eee' },
  addBtn:{ paddingHorizontal:12, paddingVertical:10, backgroundColor:'#111', borderRadius:8 },

  chipsWrap:{ flexDirection:'row', flexWrap:'wrap', gap:8, marginTop:8 },
  chip:{ paddingHorizontal:10, paddingVertical:6, backgroundColor:'#eee', borderRadius:999 },

  btn:{ padding:12, backgroundColor:'#111', borderRadius:10, marginTop:10, alignItems:'center', marginHorizontal:16 },
  btnText:{ color:'#fff', fontWeight:'600' },
  btnDanger:{ backgroundColor:'#fee2e2' },
  btnDangerText:{ color:'#b91c1c' },

  itemText: { fontSize: 16 },
  dangerText: { color: '#c0392b', fontWeight: 'bold' },
});