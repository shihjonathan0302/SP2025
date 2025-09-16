import { supabase } from './supabaseClient';

/** 用「相對路徑」產生可用的頭像網址 */
export async function buildAvatarUrl(path, { useSigned = false, expireSec = 300 } = {}) {
  if (!path) return null;

  if (useSigned) {
    const { data, error } = await supabase
      .storage.from('avatars')
      .createSignedUrl(path, expireSec);
    if (error) {
      console.log('[avatar signed url error]', error);
      return null;
    }
    return data?.signedUrl || null;
  }

  const { data } = supabase.storage.from('avatars').getPublicUrl(path);
  return data?.publicUrl || null;
}