import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../lib/supabaseClient';

export default function SettingsHome({ navigation }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState({ full_name: '', avatar_url: '' });

  useEffect(() => {
    let alive = true;
    (async () => {
      const { data } = await supabase.auth.getUser();
      if (!alive) return;
      setUser(data?.user ?? null);

      const uid = data?.user?.id;
      if (uid) {
        const { data: prof } = await supabase
          .from('profiles')
          .select('full_name, avatar_url')
          .eq('id', uid)
          .single();
        if (prof) setProfile(prof);
      }
    })();
    return () => { alive = false; };
  }, []);

  const email = user?.email ?? '';
  const uid = user?.id ?? '';
  const avatarUri = useMemo(() => {
    if (!profile?.avatar_url) return null;
    const { data } = supabase.storage.from('avatars').getPublicUrl(profile.avatar_url);
    return `${data.publicUrl}?t=${Date.now()}`;
  }, [profile?.avatar_url]);

  const go = (name) => navigation.navigate(name);

  const confirmSignOut = async () => {
    if (Platform.OS === 'web') {
      const ok = window.confirm('Are you sure you want to sign out?');
      if (!ok) return;
    }
    try {
      await supabase.auth.signOut();
    } catch (e) {
      const msg = String(e?.message || e);
      if (Platform.OS === 'web') window.alert?.(`Sign out failed: ${msg}`);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} bounces showsVerticalScrollIndicator={false}>
        {/* 頭貼橫幅（保留） */}
        <View style={styles.header}>
          <View style={styles.avatarWrap}>
            {avatarUri ? (
              <Image source={{ uri: avatarUri }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, styles.avatarFallback]}>
                <Ionicons name="person" size={22} color="#fff" />
              </View>
            )}
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{profile?.full_name || '—'}</Text>
            <Text style={styles.sub}>Signed in as {email}</Text>
            <Text style={styles.subSmall}>ID: {uid}</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={styles.buildTxt}>Build</Text>
            <Text style={styles.buildVal}>{formatBuild()}</Text>
          </View>
        </View>

        {/* 第一層分類入口（更 compact） */}
        <SectionCard icon="person-circle-outline"  title="Account"             onPress={() => go('AccountsHome')} />
        <SectionCard icon="options-outline"        title="Preferences"         onPress={() => go('PreferencesHome')} />
        <SectionCard icon="notifications-outline"  title="Notifications"       onPress={() => go('Notifications')} />
        <SectionCard icon="share-social-outline"   title="Privacy & Sharing"   onPress={() => go('PrivacySharing')} />
        <SectionCard icon="shield-checkmark-outline" title="Data & Security"   onPress={() => go('DataSecurity')} />
        <SectionCard icon="help-circle-outline"    title="Support"             onPress={() => go('Support')} />
        <SectionCard icon="document-text-outline"  title="Legal"               onPress={() => go('Legal')} />

        {/* Sign Out（白底紅字） */}
        <TouchableOpacity style={[styles.row, styles.rowSignOut]} onPress={confirmSignOut} activeOpacity={0.9}>
          <View style={styles.rowLeft}>
            <View style={[styles.ic, styles.icSignOut]}>
              <Ionicons name="log-out-outline" size={18} color="#B91C1C" />
            </View>
            <Text style={styles.signOutTxt}>Sign Out</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#B91C1C" />
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

function SectionCard({ icon, title, onPress }) {
  return (
    <TouchableOpacity style={styles.rowCompact} onPress={onPress} activeOpacity={0.9}>
      <View style={styles.rowLeft}>
        <View style={styles.icCompact}>
          <Ionicons name={icon} size={16} color="#111" />
        </View>
        <Text style={styles.rowTitle}>{title}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
    </TouchableOpacity>
  );
}

function formatBuild() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

/* styles */
const AVATAR = 44;
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  scroll: { padding: 12, paddingBottom: 32 },

  header: {
    flexDirection: 'row', alignItems: 'center', padding: 12,
    borderRadius: 12, borderWidth: 1, borderColor: '#eee', marginBottom: 10,
    backgroundColor: '#fff',
  },
  avatarWrap: { marginRight: 10 },
  avatar: { width: AVATAR, height: AVATAR, borderRadius: AVATAR/2, backgroundColor: '#E5E7EB' },
  avatarFallback: { alignItems: 'center', justifyContent: 'center', backgroundColor: '#111' },
  name: { fontSize: 18, fontWeight: '700', color: '#111' },
  sub: { color: '#6B7280', marginTop: 2 },
  subSmall: { color: '#9CA3AF', marginTop: 2, fontSize: 12 },

  buildTxt: { fontSize: 12, color: '#9CA3AF', textAlign: 'right' },
  buildVal: { fontSize: 12, color: '#6B7280', textDecorationLine: 'underline' },

  // 原本 row（保留）
  row: {
    minHeight: 60, paddingHorizontal: 12, paddingVertical: 10,
    borderWidth: 1, borderColor: '#eee', borderRadius: 12, backgroundColor: '#fff',
    marginBottom: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },

  // 更 compact 的卡片
  rowCompact: {
    minHeight: 50, paddingHorizontal: 12, paddingVertical: 8,
    borderWidth: 1, borderColor: '#eee', borderRadius: 12, backgroundColor: '#fff',
    marginBottom: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },

  rowLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },

  ic: {
    width: 36, height: 36, borderRadius: 10, borderWidth: 1, borderColor: '#eee',
    alignItems: 'center', justifyContent: 'center', backgroundColor: '#F9FAFB',
  },
  icCompact: {
    width: 30, height: 30, borderRadius: 8, borderWidth: 1, borderColor: '#eee',
    alignItems: 'center', justifyContent: 'center', backgroundColor: '#F9FAFB',
  },

  rowTitle: { fontSize: 16, fontWeight: '600', color: '#111' },

  // Sign out: 白底紅字＋淡紅框
  rowSignOut: { borderColor: '#FECACA', backgroundColor: '#fff' },
  icSignOut: { backgroundColor: '#FEF2F2', borderColor: '#FECACA' },
  signOutTxt: { fontSize: 16, fontWeight: '600', color: '#B91C1C' },
});