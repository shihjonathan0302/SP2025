// src/screens/settings/SettingsHome.js
import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, StyleSheet, SectionList, Pressable, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { supabase } from '../../lib/supabaseClient';

const AVATAR = 52;

export default function SettingsHome({ navigation }) {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const { data } = await supabase.auth.getUser();
        if (!alive) return;
        setUser(data?.user ?? null);

        const uid = data?.user?.id;
        if (uid) {
          const { data: p } = await supabase
            .from('profiles')
            .select('full_name, avatar_url')
            .eq('id', uid)
            .single();
          if (!alive) return;
          setProfile(p || null);
        }
      } finally {
        setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  const email = user?.email ?? '';
  const uid = user?.id ?? '';
  const fullName = profile?.full_name || email?.split('@')[0] || 'User';
  const avatarUrl = useMemo(() => {
    if (!profile?.avatar_url) return null;
    const { data } = supabase.storage.from('avatars').getPublicUrl(profile.avatar_url);
    return data?.publicUrl ? `${data.publicUrl}?t=${Date.now()}` : null;
  }, [profile?.avatar_url]);

  const sections = [
    {
      title: 'Browse',
      data: [
        { key: 'Accounts',        icon: 'person-circle-outline',   to: 'AccountsHome',    desc: 'Profile, linked accounts, password' },
        { key: 'Preferences',     icon: 'options-outline',         to: 'Preferences',     desc: 'Theme, language, time & units' },
        { key: 'Notifications',   icon: 'notifications-outline',   to: 'Notifications',   desc: 'Push, email, reminders' },
        { key: 'PrivacySharing',  icon: 'shield-checkmark-outline',to: 'PrivacySharing',  desc: 'Visibility & data sharing' },
        { key: 'DataSecurity',    icon: 'lock-closed-outline',     to: 'DataSecurity',    desc: 'Export, delete, sessions' },
        { key: 'Support',         icon: 'help-circle-outline',     to: 'Support',         desc: 'Help & feedback' },
      ],
    },
  ];

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header banner（保留） */}
      <View style={styles.header}>
        <View style={[styles.avatar, !avatarUrl && { backgroundColor: '#111' }]}>
          {avatarUrl ? (
            <Image source={{ uri: avatarUrl }} style={{ width: AVATAR, height: AVATAR, borderRadius: AVATAR/2 }} contentFit="cover" />
          ) : (
            <Text style={styles.avatarTxt}>{(fullName || 'U')[0].toUpperCase()}</Text>
          )}
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.name}>{fullName}</Text>
          {!!email && <Text style={styles.sub}>{`Signed in as ${email}`}</Text>}
          {!!uid && <Text style={styles.sub2}>{`ID: ${uid}`}</Text>}
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={styles.buildLabel}>Build</Text>
          <Text style={styles.buildVal}>{formatBuild()}</Text>
        </View>
      </View>

      {/* 第一層：分類卡片（清爽） */}
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.key}
        renderSectionHeader={({ section }) => (
          <View style={styles.sectionHeader}><Text style={styles.sectionTitle}>{section.title}</Text></View>
        )}
        renderItem={({ item }) => (
          <Pressable onPress={() => navigation.navigate(item.to)} style={({ pressed }) => [styles.card, pressed && { opacity: 0.8 }]}>
            <View style={styles.cardLeft}>
              <View style={styles.icWrap}>
                <Ionicons name={item.icon} size={20} color="#111" />
              </View>
              <View>
                <Text style={styles.cardTitle}>{item.key}</Text>
                {!!item.desc && <Text style={styles.cardDesc}>{item.desc}</Text>}
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
          </Pressable>
        )}
        stickySectionHeadersEnabled={false}
        contentContainerStyle={{ paddingBottom: 24 }}
      />
    </View>
  );
}

function formatBuild() {
  const d = new Date(); const p = (n)=>String(n).padStart(2,'0');
  return `${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())}`;
}

const styles = StyleSheet.create({
  center:{ flex:1, alignItems:'center', justifyContent:'center', backgroundColor:'#fff' },
  container:{ flex:1, backgroundColor:'#fff' },

  header:{
    flexDirection:'row', alignItems:'center',
    paddingHorizontal:16, paddingTop:16, paddingBottom:12,
    borderBottomWidth:1, borderBottomColor:'#eee', gap:12,
  },
  avatar:{ width:AVATAR, height:AVATAR, borderRadius:AVATAR/2, overflow:'hidden', alignItems:'center', justifyContent:'center' },
  avatarTxt:{ color:'#fff', fontWeight:'700', fontSize:18 },
  name:{ fontSize:18, fontWeight:'700', color:'#111' },
  sub:{ color:'#6B7280', marginTop:2 },
  sub2:{ color:'#9CA3AF', fontSize:12, marginTop:2 },
  buildLabel:{ fontSize:12, color:'#9CA3AF' },
  buildVal:{ fontSize:12, color:'#6B7280', textDecorationLine:'underline' },

  sectionHeader:{ paddingHorizontal:16, paddingTop:14, paddingBottom:6 },
  sectionTitle:{ fontSize:13, fontWeight:'600', color:'#888' },

  card:{
    marginHorizontal:16, marginVertical:6,
    paddingVertical:14, paddingHorizontal:12,
    borderRadius:12, borderWidth:1, borderColor:'#eee', backgroundColor:'#fff',
    flexDirection:'row', alignItems:'center', justifyContent:'space-between'
  },
  cardLeft:{ flexDirection:'row', alignItems:'center', gap:10 },
  icWrap:{ width:36, height:36, borderRadius:10, backgroundColor:'#F3F4F6',
    borderWidth:1, borderColor:'#eee', alignItems:'center', justifyContent:'center' },
  cardTitle:{ fontSize:16, fontWeight:'600', color:'#111' },
  cardDesc:{ fontSize:12, color:'#6B7280', marginTop:2 },
});