import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

const PrefsContext = createContext();

export function PrefsProvider({ children }) {
  const [prefs, setPrefs] = useState({ theme: 'system' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from('user_prefs')
        .select('*')
        .single();
      if (!error && data) setPrefs(data);
      setLoading(false);
    })();
  }, []);

  const updatePrefs = async (updates) => {
    const newPrefs = { ...prefs, ...updates };
    setPrefs(newPrefs);

    const { error } = await supabase
      .from('user_prefs')
      .upsert(newPrefs, { onConflict: ['user_id'] });
    if (error) console.warn('[updatePrefs error]', error.message);
  };

  return (
    <PrefsContext.Provider value={{ prefs, updatePrefs, loading }}>
      {children}
    </PrefsContext.Provider>
  );
}

export function usePrefs() {
  return useContext(PrefsContext);
}