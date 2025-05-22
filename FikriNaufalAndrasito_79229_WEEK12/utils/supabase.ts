import "react-native-url-polyfill/auto";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL ||
    "https://vyormmcoomcklyoqtzec.supabase.co",
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ||
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ5b3JtbWNvb21ja2x5b3F0emVjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcyMjUyMDcsImV4cCI6MjA2MjgwMTIwN30.q1GM-16kFlGE_Plj4srai5KUvYGcRg-1IZUbxjtMLMk",
  {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  }
);
