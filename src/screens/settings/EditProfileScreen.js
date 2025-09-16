// src/screens/settings/EditProfileScreen.js
import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Modal,
} from 'react-native';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { supabase } from '../../lib/supabaseClient';

const AVATAR_SIZE = 160;
const BUCKET = 'avatars';

export default function EditProfileScreen() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');

  const [uid, setUid] = useState(null);
  const [avatarPath, setAvatarPath] = useState(null); // storage path
  const [avatarUrl, setAvatarUrl] = useState(null);   // public url

  // Actions bottom sheet
  const [sheetOpen, setSheetOpen] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const { data: auth } = await supabase.auth.getUser();
        const userId = auth?.user?.id ?? null;
        if (!alive) return;
        setUid(userId);
        if (!userId) { setLoading(false); return; }

        const { data, error } = await supabase
          .from('profiles')
          .select('full_name, username, bio, avatar_url')
          .eq('id', userId)
          .single();

        if (!error && data) {
          setFullName(data.full_name ?? '');
          setUsername(data.username ?? '');
          setBio(data.bio ?? '');
          if (data.avatar_url) {
            setAvatarPath(data.avatar_url);
            setAvatarUrl(publicUrl(data.avatar_url));
          }
        }
      } catch (e) {
        console.log('[profile load]', e);
      } finally {
        setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  const publicUrl = (path) =>
    supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;

  const avatarSource = useMemo(() => (avatarUrl ? { uri: avatarUrl } : null), [avatarUrl]);

  const filePath = (ext) => {
    const safe = ext === 'png' ? 'png' : 'jpg';
    const id = uid || 'anon';
    return `${id}/${Date.now()}.${safe}`;
  };

  /** 上傳：Web 用 blob；原生用 arrayBuffer */
  const uploadUri = async (uri) => {
    const ext = uri.toLowerCase().endsWith('.png') ? 'png' : 'jpg';
    const path = filePath(ext);

    if (Platform.OS === 'web') {
      const res = await fetch(uri);
      const blob = await res.blob();
      const { error } = await supabase.storage.from(BUCKET).upload(path, blob, {
        contentType: blob.type || (ext === 'png' ? 'image/png' : 'image/jpeg'),
        upsert: true,
      });
      if (error) throw error;
    } else {
      const res = await fetch(uri);
      const buf = await res.arrayBuffer();
      const bytes = new Uint8Array(buf);
      const { error } = await supabase.storage.from(BUCKET).upload(path, bytes, {
        contentType: ext === 'png' ? 'image/png' : 'image/jpeg',
        upsert: true,
      });
      if (error) throw error;
    }

    const { error: up2 } = await supabase
      .from('profiles')
      .update({ avatar_url: path, updated_at: new Date().toISOString() })
      .eq('id', uid);
    if (up2) throw up2;

    setAvatarPath(path);
    setAvatarUrl(publicUrl(path));
  };

  /** 點 EDIT → 打開面板 */
  const handleEditPress = () => setSheetOpen(true);

  /** 裁切現有照片（自動置中裁成 1:1，無額外 UI） */
  const onCropCurrent = async () => {
    try {
      setSheetOpen(false);
      if (!avatarUrl) {
        Alert.alert('No photo', 'You have no profile photo to crop yet.');
        return;
      }
      // 把 public URL 取回來做本地處理
      const res = await fetch(avatarUrl, { cache: 'no-store' });
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);

      // 先讀一下尺寸（用 manipulator 取得 meta 不太方便，這裡直接「居中裁成 512x512」）
      // 簡化：直接 resize 成 512 x 512（視覺上等同 1:1）
      const square = await ImageManipulator.manipulateAsync(
        blobUrl,
        [{ resize: { width: 512, height: 512 } }],
        { compress: 0.9, format: ImageManipulator.SaveFormat.JPEG }
      );
      await uploadUri(square.uri);
    } catch (e) {
      console.log('[crop current]', e);
      Alert.alert('Failed', String(e?.message || e));
    }
  };

  /** 選擇新照片（用系統裁切器 1:1） */
  const onChooseNew = async () => {
    try {
      setSheetOpen(false);
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'We need media permission to select a photo.');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });
      if (result.canceled) return;
      const asset = result.assets?.[0];
      if (!asset?.uri) return;

      // 再保險縮成 512x512
      const final = await ImageManipulator.manipulateAsync(
        asset.uri,
        [{ resize: { width: 512, height: 512 } }],
        { compress: 0.9, format: ImageManipulator.SaveFormat.JPEG }
      );
      await uploadUri(final.uri);
    } catch (e) {
      console.log('[pick new]', e);
      Alert.alert('Failed', String(e?.message || e));
    }
  };

  const handleSave = async () => {
    if (!uid) return;
    try {
      setSaving(true);
      const patch = {
        full_name: fullName.trim(),
        username: username.trim(),
        bio: bio.trim(),
        updated_at: new Date().toISOString(),
      };
      const { error } = await supabase.from('profiles').update(patch).eq('id', uid);
      if (error) throw error;
      Alert.alert('Saved', 'Profile updated.');
    } catch (e) {
      Alert.alert('Error', String(e?.message || e));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Avatar + EDIT overlay */}
        <Pressable onPress={handleEditPress} style={styles.avatarWrap}>
          {avatarSource ? (
            <Image source={avatarSource} style={styles.avatarImg} contentFit="cover" transition={200} />
          ) : (
            <View style={[styles.avatarImg, styles.avatarFallback]}>
              <Text style={styles.avatarFallbackText}>?</Text>
            </View>
          )}
          <View style={styles.editBar}>
            <Text style={styles.editText}>EDIT</Text>
          </View>
        </Pressable>

        <View style={{ height: 24 }} />

        <Field
          label="Full name"
          value={fullName}
          placeholder="Your full name"
          onChangeText={setFullName}
        />
        <Field
          label="Username"
          value={username}
          placeholder="your_handle"
          onChangeText={setUsername}
          autoCapitalize="none"
        />
        <Field
          label="Bio"
          value={bio}
          placeholder="Tell others about yourself…"
          onChangeText={setBio}
          multiline
        />

        <View style={{ height: 12 }} />
        <Pressable style={styles.primaryBtn} onPress={handleSave} disabled={saving}>
          <Text style={styles.primaryBtnText}>{saving ? 'Saving…' : 'Save changes'}</Text>
        </Pressable>
      </ScrollView>

      {/* Bottom sheet（簡易） */}
      <Modal transparent visible={sheetOpen} animationType="fade" onRequestClose={() => setSheetOpen(false)}>
        <Pressable style={styles.sheetBackdrop} onPress={() => setSheetOpen(false)}>
          <View />
        </Pressable>
        <View style={styles.sheet}>
          <Pressable style={styles.sheetBtn} onPress={onCropCurrent}>
            <Text style={styles.sheetBtnText}>Crop current photo</Text>
          </Pressable>
          <Pressable style={styles.sheetBtn} onPress={onChooseNew}>
            <Text style={styles.sheetBtnText}>Choose new photo</Text>
          </Pressable>
          <Pressable style={[styles.sheetBtn, styles.sheetCancel]} onPress={() => setSheetOpen(false)}>
            <Text style={[styles.sheetBtnText, { color: '#6B7280' }]}>Cancel</Text>
          </Pressable>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

/* ---------- Small field component ---------- */
function Field({ label, value, placeholder, onChangeText, multiline, autoCapitalize }) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#9CA3AF"
        style={[styles.input, multiline && { height: 100, textAlignVertical: 'top' }]}
        multiline={multiline}
        autoCapitalize={autoCapitalize}
      />
    </View>
  );
}

/* ---------- Styles ---------- */
const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  container: { padding: 20, paddingBottom: 40 },

  avatarWrap: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    overflow: 'hidden',
    alignSelf: 'center',
    position: 'relative',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  avatarImg: {
    width: '100%',
    height: '100%',
    borderRadius: AVATAR_SIZE / 2,
    backgroundColor: '#E5E7EB',
  },
  avatarFallback: { alignItems: 'center', justifyContent: 'center' },
  avatarFallbackText: { fontSize: 48, fontWeight: '700', color: '#6B7280' },

  editBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: AVATAR_SIZE * 0.28,
    backgroundColor: 'rgba(0,0,0,0.48)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editText: { color: '#fff', fontWeight: '700', letterSpacing: 1 },

  field: { marginBottom: 16 },
  fieldLabel: { marginBottom: 6, color: '#111827', fontWeight: '600' },
  input: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: '#111827',
    backgroundColor: '#fff',
  },

  primaryBtn: {
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#111827',
    alignItems: 'center',
  },
  primaryBtnText: { color: '#fff', fontWeight: '700' },

  sheetBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  sheet: {
    position: 'absolute',
    left: 0, right: 0, bottom: 0,
    padding: 12,
    backgroundColor: '#F9FAFB',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    gap: 8,
  },
  sheetBtn: {
    backgroundColor: '#fff',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  sheetBtnText: { fontWeight: '600', color: '#111827' },
  sheetCancel: { backgroundColor: '#F3F4F6', marginTop: 4 },
});
