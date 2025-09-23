// screens/SettingsScreen.js
import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Platform,
  SectionList,
  Pressable,
} from 'react-native';
import { Image } from 'expo-image';
import { supabase } from '../lib/supabaseClient';

const AVATAR_BUCKET = 'avatars';

export default function SettingsScreen({ navigation }) {
  // ===== User info (for header) =====
  const [email, setEmail] = useState('');
  const [userId, setUserId] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const { data, error } = await supabase.auth.getUser();
        if (error) return;
        if (!alive) return;

        const user = data?.user;
        setEmail(user?.email ?? '');
        setUserId(user?.id ?? '');

        // 讀取 profiles 取得 full_name 與 avatar_url
        if (user?.id) {
          const { data: p } = await supabase
            .from('profiles')
            .select('full_name, avatar_url')
            .eq('id', user.id)
            .single();

          const nameFallback = (user?.email || '').split('@')[0] || 'Your profile';
          setDisplayName(p?.full_name?.trim() || nameFallback);

          if (p?.avatar_url) {
            const url = publicUrl(p.avatar_url);
            setAvatarUrl(url ? `${url}?t=${Date.now()}` : null); // 簡單 cache-bust
          }
        }
      } catch {
        // ignore
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const publicUrl = (path) =>
    supabase.storage.from(AVATAR_BUCKET).getPublicUrl(path).data.publicUrl;

  // ===== Sign out =====
  const doSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      // App.js 的 onAuthStateChange 會自動導回 Login
    } catch (e) {
      const msg = String(e?.message || e);
      if (Platform.OS === 'web') window.alert?.(`登出失敗：${msg}`);
      else Alert.alert('登出失敗', msg);
    }
  };

  // ===== Secret dev toggle（保留，但不顯示任何敏感操作） =====
  const taps = useRef(0);
  const handleVersionTap = () => {
    taps.current += 1;
    if (taps.current >= 7) {
      taps.current = 0;
      if (Platform.OS === 'web') window.alert?.('Dev mode placeholder');
      else Alert.alert('Dev', 'Dev mode placeholder');
    }
  };

  // ===== Sections（純導覽，不在本頁編輯設定） =====
  const sections = [
    {
      title: 'Account',
      data: [
        { id: 'EditProfile', title: 'Edit Profile' },
        { id: 'LinkedAccounts', title: 'Linked Accounts' },
        { id: 'PasswordSecurity', title: 'Password and Security' },
        { id: 'Subscriptions', title: 'Subscriptions' }, // 先佔位
      ],
    },
    {
      title: 'Preferences',
      data: [{ id: 'Preferences', title: 'Preferences' }],
    },
    {
      title: 'Notifications',
      data: [{ id: 'Notifications', title: 'Notifications' }],
    },
    {
      title: 'Privacy & Sharing',
      data: [{ id: 'PrivacySharing', title: 'Privacy & Sharing' }],
    },
    {
      title: 'Data & Security',
      data: [{ id: 'DataSecurity', title: 'Data & Security' }],
    },
    {
      title: 'Support',
      data: [{ id: 'Support', title: 'Help / Contact' }],
    },
    {
      title: 'Legal',
      data: [{ id: 'Legal', title: 'Terms & Privacy' }],
    },
    {
      title: null,
      data: [{ id: 'SignOut', title: 'Sign Out', danger: true }],
    },
  ];

  const renderItem = ({ item }) => {
    if (item.id === 'SignOut') {
      return (
        <TouchableOpacity
          style={styles.row}
          onPress={() => {
            if (Platform.OS === 'web') {
              const ok = window.confirm?.('確定要登出嗎？');
              if (ok) doSignOut();
            } else {
              Alert.alert('確認登出', '確定要登出嗎？', [
                { text: '取消', style: 'cancel' },
                { text: '登出', style: 'destructive', onPress: doSignOut },
              ]);
            }
          }}
        >
          <Text style={[styles.itemText, styles.dangerText]}>{item.title}</Text>
        </TouchableOpacity>
      );
    }
    return (
      <TouchableOpacity
        style={styles.row}
        onPress={() => navigation.navigate(item.id)}
      >
        <Text style={styles.itemText}>{item.title}</Text>
        <Text style={styles.chevron}>›</Text>
      </TouchableOpacity>
    );
  };

  const renderSectionHeader = ({ section }) =>
    section.title ? (
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{section.title}</Text>
      </View>
    ) : null;

  // ===== Header =====
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
        {/* Avatar：有圖用圖，沒有用首字母 */}
        {avatarUrl ? (
          <Image source={{ uri: avatarUrl }} style={styles.avatar} contentFit="cover" transition={150} />
        ) : (
          <View style={[styles.avatar, styles.avatarFallback]}>
            <Text style={styles.avatarTxt}>
              {(displayName || email || 'U').slice(0, 1).toUpperCase()}
            </Text>
          </View>
        )}

        <View style={{ flex: 1 }}>
          {/* 標題換成使用者姓名（不顯示 username） */}
          <Text style={styles.headerTitle}>{displayName || 'Your profile'}</Text>
          <Text style={styles.headerSubtitle}>
            {email ? `Signed in as ${email}` : 'Signed in'}
          </Text>
          {/* 第三行改成 ID */}
          {!!userId && <Text style={styles.headerMinor}>ID: {userId}</Text>}
        </View>

        <VersionRow />
      </View>

      <SectionList
        sections={sections}
        keyExtractor={(it) => it.id}
        renderItem={renderItem}
        renderSectionHeader={renderSectionHeader}
        SectionSeparatorComponent={() => <View style={{ height: 8 }} />}
        stickySectionHeadersEnabled={false}
        contentContainerStyle={{ paddingBottom: 24 }}
      />
    </View>
  );
}

/* ---------- Utils ---------- */
function formatBuild() {
  const d = new Date();
  const s = `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
  return s;
}
function pad2(n) {
  return String(n).padStart(2, '0');
}

/* ---------- Styles ---------- */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    gap: 12,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    overflow: 'hidden',
    backgroundColor: '#111',
  },
  avatarFallback: { alignItems: 'center', justifyContent: 'center' },
  avatarTxt: { color: '#fff', fontWeight: '700', fontSize: 18 },

  headerTitle: { fontSize: 20, fontWeight: '700' },
  headerSubtitle: { color: '#666', marginTop: 2 },
  headerMinor: { color: '#888', fontSize: 12, marginTop: 2 },

  version: { alignItems: 'flex-end' },
  versionTxt: { fontSize: 12, color: '#888' },
  versionVal: { fontSize: 12, color: '#666', textDecorationLine: 'underline' },

  sectionHeader: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 6,
    backgroundColor: '#fff',
  },
  sectionTitle: { fontSize: 13, fontWeight: '600', color: '#888' },

  row: {
    minHeight: 56,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  itemText: { fontSize: 16, color: '#111' },
  chevron: { color: '#999', fontSize: 22, marginLeft: 8 },

  dangerText: { color: '#c0392b', fontWeight: 'bold' },
});