// src/screens/settings/AccountsHome.js
import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function AccountsHome({ navigation }) {
  const items = [
    { key: 'Edit Profile',      icon: 'create-outline',   to: 'EditProfile',        desc: 'Name, photo, bio' },
    { key: 'Linked Accounts',   icon: 'link-outline',     to: 'LinkedAccounts',     desc: 'Google, email & more' },
    { key: 'Password & Security', icon: 'shield-outline', to: 'PasswordSecurity',   desc: 'Change password, sessions' },
    { key: 'Subscriptions',     icon: 'card-outline',     to: 'Subscriptions',      desc: 'Manage plan & billing' },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 24 }}>
      <Text style={styles.caption}>Account</Text>
      {items.map((it) => (
        <Pressable key={it.key} onPress={() => navigation.navigate(it.to)} style={({ pressed }) => [styles.row, pressed && { opacity: 0.85 }]}>
          <View style={styles.left}>
            <View style={styles.ic}><Ionicons name={it.icon} size={18} color="#111" /></View>
            <View>
              <Text style={styles.title}>{it.key}</Text>
              {!!it.desc && <Text style={styles.desc}>{it.desc}</Text>}
            </View>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
        </Pressable>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container:{ flex:1, backgroundColor:'#fff' },
  caption:{ paddingHorizontal:16, paddingTop:14, paddingBottom:6, fontSize:13, fontWeight:'600', color:'#888' },
  row:{
    marginHorizontal:16, marginVertical:6,
    paddingVertical:14, paddingHorizontal:12,
    borderRadius:12, borderWidth:1, borderColor:'#eee', backgroundColor:'#fff',
    flexDirection:'row', alignItems:'center', justifyContent:'space-between'
  },
  left:{ flexDirection:'row', alignItems:'center', gap:10 },
  ic:{ width:36, height:36, borderRadius:10, backgroundColor:'#F3F4F6',
       borderWidth:1, borderColor:'#eee', alignItems:'center', justifyContent:'center' },
  title:{ fontSize:16, fontWeight:'600', color:'#111' },
  desc:{ fontSize:12, color:'#6B7280', marginTop:2 },
});