import { getEnv } from "@/lib/env";

export function getSupabaseEnv() {
  const { public: pub } = getEnv();
  if (!pub.NEXT_PUBLIC_SUPABASE_URL || !pub.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    throw new Error("Missing Supabase env. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.");
  }
  return { url: pub.NEXT_PUBLIC_SUPABASE_URL, anonKey: pub.NEXT_PUBLIC_SUPABASE_ANON_KEY };
}

