// src/lib/supabaseClient.js
import { createClient } from '@supabase/supabase-js'

// 這些值來自 Dashboard → Project Settings → API
const SUPABASE_URL = 'https://baygppmzqzisddezwyrs.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJheWdwcG16cXppc2RkZXp3eXJzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUzMTE3NzgsImV4cCI6MjA3MDg4Nzc3OH0.ELF_kjAuuHDQWxLQV2XpxekR1MAdt_PqgDXDoI0pNK4'

// 建議：正式專案請改用環境變數，避免把 key 寫死在版控
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)