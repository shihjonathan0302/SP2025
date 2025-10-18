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
  const [bio, setBio] = useState('');
  const [uid, setUid] = useState(null);

  const [avatarUrl, setAvatarUrl] = useState(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const [cropVisible, setCropVisible] = useState(false);
  const [imageToCrop, setImageToCrop] = useState(null);

  /* ---------------- Load profile ---------------- */
  useEffect(() => {
    (async () => {
      try {
        const { data: auth } = await supabase.auth.getUser();
        const userId = auth?.user?.id ?? null;
        setUid(userId);
        if (!userId) {
          setLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from('profiles')
          .select('full_name, bio, avatar_url')
          .eq('id', userId)
          .single();

        if (!error && data) {
          setFullName(data.full_name ?? '');
          setBio(data.bio ?? '');
          if (data.avatar_url) {
            const url = supabase.storage.from(BUCKET).getPublicUrl(data.avatar_url).data.publicUrl;
            setAvatarUrl(`${url}?t=${Date.now()}`);
          }
        }
      } catch (e) {
        console.log('[profile load]', e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const publicUrl = (path) =>
    supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;

  const avatarSource = useMemo(() => (avatarUrl ? { uri: avatarUrl } : null), [avatarUrl]);

  const filePath = (ext) => {
    const safe = ext === 'png' ? 'png' : 'jpg';
    const id = uid || 'anon';
    return `${id}/${Date.now()}.${safe}`;
  };

  /* ---------------- Upload helper ---------------- */
  const uploadUri = async (uri) => {
    const lower = (uri || '').toLowerCase();
    const ext = lower.includes('.png') ? 'png' : 'jpg';
    const path = filePath(ext);

    try {
      const res = await fetch(uri);
      const buf = await res.arrayBuffer();
      const bytes = new Uint8Array(buf);

      const { error } = await supabase.storage
        .from(BUCKET)
        .upload(path, bytes, {
          contentType: ext === 'png' ? 'image/png' : 'image/jpeg',
          upsert: true,
        });
      if (error) throw error;

      await supabase
        .from('profiles')
        .update({ avatar_url: path, updated_at: new Date().toISOString() })
        .eq('id', uid);

      const url = publicUrl(path);
      setAvatarUrl(`${url}?t=${Date.now()}`);
    } catch (e) {
      Alert.alert('Upload failed', String(e?.message || e));
    }
  };

  /* ---------------- Open system cropper ---------------- */
  const pickAndCrop = async (fromCamera = false) => {
    try {
      setSheetOpen(false);
      await new Promise(r => setTimeout(r, 600)); // 🔹 延遲 0.6 秒確保 modal 關完

      const { status } = fromCamera
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please allow photo/camera access.');
        return;
      }

      const pickerFn = fromCamera
        ? ImagePicker.launchCameraAsync
        : ImagePicker.launchImageLibraryAsync;

      console.log('[pickAndCrop] Opening picker...');

      const result = await pickerFn({
        mediaTypes: ['images'],
        allowsEditing: Platform.OS !== 'web',
        aspect: [1, 1],
        quality: 1,
        presentationStyle:
          ImagePicker.UIImagePickerPresentationStyle.FULL_SCREEN, // ✅ 防被 modal 遮蓋
      });

      if (result.canceled) {
        console.log('[pickAndCrop] User cancelled');
        return;
      }

      const asset = result.assets?.[0];
      if (!asset?.uri) {
        Alert.alert('Error', 'No image selected');
        return;
      }

      console.log('[pickAndCrop] Selected:', asset.uri);

      const final = await ImageManipulator.manipulateAsync(
        asset.uri,
        [{ resize: { width: 512, height: 512 } }],
        { compress: 0.9, format: ImageManipulator.SaveFormat.JPEG }
      );

      await uploadUri(final.uri);
    } catch (e) {
      console.log('[pick/crop error]', e);
      Alert.alert('Error', e?.message || String(e));
    }
  };

  const onCropCurrent = async () => {
    try {
      setSheetOpen(false);
      console.log('[onCropCurrent] Closing sheet...');
      await new Promise((r) => setTimeout(r, 500));
  
      if (!avatarUrl) {
        Alert.alert('No photo', 'You have no profile photo to crop yet.');
        return;
      }
  
      console.log('[onCropCurrent] Opening JS cropper modal...');
  
      const response = await fetch(avatarUrl, { cache: 'no-store' });
      const arrayBuffer = await response.arrayBuffer();
      const base64 = `data:image/jpeg;base64,${Buffer.from(arrayBuffer).toString('base64')}`;
  
      setImageToCrop(base64);
      setCropVisible(true);
    } catch (e) {
      console.log('[onCropCurrent error]', e);
      Alert.alert('Crop failed', e?.message || String(e));
    }
  };

  /* ---------------- Save profile ---------------- */
  const handleSave = async () => {
    if (!uid) return;
    try {
      setSaving(true);
      const patch = {
        full_name: fullName.trim(),
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

  /* ---------------- UI ---------------- */
  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container}>
        <Pressable onPress={() => setSheetOpen(true)} style={styles.avatarWrap}>
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
        <Field label="Full name" value={fullName} onChangeText={setFullName} placeholder="Your full name" />
        <Field label="Bio" value={bio} onChangeText={setBio} placeholder="Tell others about yourself…" multiline />

        <Pressable style={styles.primaryBtn} onPress={handleSave} disabled={saving}>
          <Text style={styles.primaryBtnText}>{saving ? 'Saving…' : 'Save changes'}</Text>
        </Pressable>
      </ScrollView>

      {/* Bottom sheet */}
      <Modal transparent visible={sheetOpen} animationType="fade" onRequestClose={() => setSheetOpen(false)}>
        <Pressable style={styles.sheetBackdrop} onPress={() => setSheetOpen(false)} />
        <View style={styles.sheet}>
          <Pressable style={styles.sheetBtn} onPress={() => pickAndCrop(true)}>
            <Text style={styles.sheetBtnText}>Take a photo</Text>
          </Pressable>
          <Pressable style={styles.sheetBtn} onPress={onCropCurrent}>
            <Text style={styles.sheetBtnText}>Crop current photo</Text>
          </Pressable>
          <Pressable style={styles.sheetBtn} onPress={() => pickAndCrop(false)}>
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

/* ---------- Field component ---------- */
function Field({ label, value, placeholder, onChangeText, multiline }) {
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
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  avatarImg: { width: '100%', height: '100%', borderRadius: AVATAR_SIZE / 2 },
  avatarFallback: { alignItems: 'center', justifyContent: 'center' },
  avatarFallbackText: { fontSize: 48, color: '#6B7280', fontWeight: '700' },
  editBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: AVATAR_SIZE * 0.22,
    backgroundColor: 'rgba(0,0,0,0.48)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  editText: { color: '#fff', fontWeight: '700' },
  field: { marginBottom: 16 },
  fieldLabel: { marginBottom: 6, fontWeight: '600', color: '#111827' },
  input: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: '#111827',
  },
  primaryBtn: { paddingVertical: 14, borderRadius: 12, backgroundColor: '#111827', alignItems: 'center' },
  primaryBtnText: { color: '#fff', fontWeight: '700' },
  sheetBackdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.35)' },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    gap: 8,
  },
  sheetBtn: { backgroundColor: '#fff', paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  sheetBtnText: { fontWeight: '600', color: '#111827' },
  sheetCancel: { backgroundColor: '#F3F4F6', marginTop: 4 },
});