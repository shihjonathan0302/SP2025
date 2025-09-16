// src/screens/settings/EditProfileScreen.js
import React, { useEffect, useState } from 'react';
import {
  View, Text, TextInput, StyleSheet, Image, Button, Alert, Platform, TouchableOpacity, ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../../lib/supabaseClient';

const BUCKET = 'avatars';

export default function EditProfileScreen() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // auth / profile
  const [userId, setUserId] = useState(null);
  const [email, setEmail] = useState('');

  // profiles fields
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');

  // profile picture (storage 相對路徑 + 預覽 URL)
  const [photoPath, setPhotoPath] = useState(null);
  const [photoUrl, setPhotoUrl] = useState(null); // 可直接 <Image source={{uri:}}>

  // ---------- 讀取資料 ----------
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);

        const { data: { user }, error: uerr } = await supabase.auth.getUser();
        if (uerr) throw uerr;
        if (!user?.id) throw new Error('Not signed in');
        setUserId(user.id);
        setEmail(user.email || '');

        // 讀 profiles；沒有就先建立一筆空白
        const { data: prof, error: perr, status } = await supabase
          .from('profiles')
          .select('id, full_name, username, bio, avatar_url')
          .eq('id', user.id)
          .maybeSingle();

        if (perr && status !== 406) throw perr;

        if (!prof) {
          // 建立空白 row（避免後面 update 找不到）
          const { error: ierr } = await supabase
            .from('profiles')
            .insert({ id: user.id, full_name: '', username: '', bio: '', avatar_url: null });
          if (ierr) throw ierr;
          setFullName('');
          setUsername('');
          setBio('');
          setPhotoPath(null);
          setPhotoUrl(null);
        } else {
          setFullName(prof.full_name || '');
          setUsername(prof.username || '');
          setBio(prof.bio || '');
          setPhotoPath(prof.avatar_url || null);
          if (prof.avatar_url) {
            const url = buildPublicUrl(prof.avatar_url);
            setPhotoUrl(url);
          }
        }
      } catch (e) {
        console.log('[profile load error]', e);
        Alert.alert('Load error', String(e?.message || e));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // ---------- 產生 public URL ----------
  function buildPublicUrl(path) {
    if (!path) return null;
    const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
    // 加 time 防快取
    return data?.publicUrl ? `${data.publicUrl}?t=${Date.now()}` : null;
  }

  // ---------- 換大頭貼（Web & 原生皆可） ----------
  const changeProfilePicture = async () => {
    try {
      // Web：改用原生 <input type="file">，最穩
      if (Platform.OS === 'web') {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = async () => {
          const file = input.files?.[0];
          if (!file) return;

          const ext = (file.name.split('.').pop() || 'jpg').toLowerCase();
          const path = `${userId}/${Date.now()}.${ext}`;

          setSaving(true);
          const { error: upErr } = await supabase
            .storage
            .from(BUCKET)
            .upload(path, file, { upsert: true, contentType: file.type || `image/${ext}` });
          if (upErr) throw upErr;

          const { error: dbErr } = await supabase
            .from('profiles')
            .update({ avatar_url: path, updated_at: new Date().toISOString() })
            .eq('id', userId);
          if (dbErr) throw dbErr;

          setPhotoPath(path);
          setPhotoUrl(buildPublicUrl(path));
          Alert.alert('Profile Picture', 'Updated.');
          setSaving(false);
        };
        input.click();
        return;
      }

      // 原生：用 expo-image-picker（相簿）
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (perm.status !== 'granted') {
        Alert.alert('Permission required', 'Please allow photo library access.');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaType.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.9,
      });
      if (result.canceled) return;

      const asset = result.assets?.[0];
      if (!asset?.uri) return;

      const resp = await fetch(asset.uri);
      const blob = await resp.blob();
      const guessExt = (blob.type || '').includes('png')
        ? 'png'
        : (blob.type || '').includes('webp')
        ? 'webp'
        : 'jpg';
      const path = `${userId}/${Date.now()}.${guessExt}`;

      setSaving(true);
      const { error: upErr } = await supabase
        .storage
        .from(BUCKET)
        .upload(path, blob, { upsert: true, contentType: blob.type || `image/${guessExt}` });
      if (upErr) throw upErr;

      const { error: dbErr } = await supabase
        .from('profiles')
        .update({ avatar_url: path, updated_at: new Date().toISOString() })
        .eq('id', userId);
      if (dbErr) throw dbErr;

      setPhotoPath(path);
      setPhotoUrl(buildPublicUrl(path));
      Alert.alert('Profile Picture', 'Updated.');
    } catch (e) {
      console.log('[changeProfilePicture error]', e);
      Alert.alert('Upload error', String(e?.message || e));
    } finally {
      setSaving(false);
    }
  };

  // ---------- 儲存 profile 欄位 ----------
  const saveProfile = async () => {
    try {
      if (!userId) return;
      if (!username.trim()) {
        Alert.alert('Validation', 'Username is required.');
        return;
      }
      setSaving(true);
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: fullName.trim(),
          username: username.trim(),
          bio: bio.trim(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);
      if (error) throw error;
      Alert.alert('Saved', 'Profile updated.');
    } catch (e) {
      console.log('[saveProfile error]', e);
      const msg = String(e?.message || e);
      if (/duplicate key|unique/i.test(msg)) {
        Alert.alert('Save error', 'Username already taken.');
      } else {
        Alert.alert('Save error', msg);
      }
    } finally {
      setSaving(false);
    }
  };

  // ---------- UI ----------
  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator />
      </View>
    );
  }

  const initial = (username || email || 'U').trim().charAt(0).toUpperCase();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Edit Profile</Text>

      {/* Profile Picture */}
      <TouchableOpacity onPress={changeProfilePicture} activeOpacity={0.8}>
        {photoUrl ? (
          <Image source={{ uri: photoUrl }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, styles.avatarPlaceholder]}>
            <Text style={styles.avatarTxt}>{initial}</Text>
          </View>
        )}
      </TouchableOpacity>
      <View style={{ height: 8 }} />
      <Button title={saving ? 'Updating…' : 'Change Profile Picture'} onPress={changeProfilePicture} disabled={saving} />

      {/* Full name */}
      <Text style={styles.label}>Full name</Text>
      <TextInput
        style={styles.input}
        placeholder="Your name"
        placeholderTextColor="#9ca3af"
        value={fullName}
        onChangeText={setFullName}
      />

      {/* Username */}
      <Text style={styles.label}>Username</Text>
      <TextInput
        style={styles.input}
        placeholder="unique_id"
        placeholderTextColor="#9ca3af"
        autoCapitalize="none"
        autoCorrect={false}
        value={username}
        onChangeText={setUsername}
      />

      {/* Bio */}
      <Text style={styles.label}>Bio</Text>
      <TextInput
        style={[styles.input, { height: 96 }]}
        placeholder="A short bio…"
        placeholderTextColor="#9ca3af"
        multiline
        value={bio}
        onChangeText={setBio}
      />

      <Button title={saving ? 'Saving…' : 'Save'} onPress={saveProfile} disabled={saving} />
      <Text style={styles.hint}>Stored at: {BUCKET}/{photoPath || '(none)'}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },
  center: { alignItems: 'center', justifyContent: 'center' },

  title: { fontSize: 20, fontWeight: '700', textAlign: 'center', marginBottom: 16 },

  avatar: { width: 120, height: 120, borderRadius: 60, alignSelf: 'center' },
  avatarPlaceholder: { backgroundColor: '#e5e7eb', alignItems: 'center', justifyContent: 'center' },
  avatarTxt: { color: '#111', fontWeight: '700', fontSize: 36 },

  label: { fontSize: 12, color: '#6b7280', marginTop: 14, marginBottom: 6 },
  input: { borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 10, padding: 12, color: '#111' },

  hint: { marginTop: 12, color: '#9ca3af', fontSize: 12 },
});