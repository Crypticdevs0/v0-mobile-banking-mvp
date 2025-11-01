import { NextResponse } from "next/server"

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.SUPABASE_ANON_KEY

  let supabaseAuthHealth: boolean | null = null
  let status: "ok" | "error" = "ok"
  let error: string | null = null

  try {
    if (url) {
      const res = await fetch(`${url}/auth/v1/health`, { method: "GET", cache: "no-store" })
      supabaseAuthHealth = res.ok
      if (!res.ok) {
        status = "error"
        error = `Auth health returned status ${res.status}`
      }
    } else {
      supabaseAuthHealth = false
      status = "error"
      error = "SUPABASE_URL is not set"
    }
  } catch (e: any) {
    supabaseAuthHealth = false
    status = "error"
    error = e?.message || "Unknown error"
  }

  return NextResponse.json({
    status,
    env: {
      supabaseUrlPresent: Boolean(url),
      supabaseAnonPresent: Boolean(anon),
      nodeEnv: process.env.NODE_ENV || null,
    },
    checks: {
      supabaseAuthHealth,
    },
    error,
    timestamp: new Date().toISOString(),
  })
}
