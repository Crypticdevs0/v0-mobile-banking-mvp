import { createBrowserClient } from "@supabase/ssr"

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn("[Supabase] Missing environment variables. Client will not function properly.")
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}
