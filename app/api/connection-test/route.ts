import { NextResponse } from "next/server"
import { createClient as createSupabaseClient } from "@supabase/supabase-js"

async function fetchWithTimeout(url: string, options: RequestInit = {}, timeoutMs = 5000) {
  const controller = new AbortController()
  const id = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const res = await fetch(url, { ...options, signal: controller.signal, cache: "no-store" })
    return res
  } finally {
    clearTimeout(id)
  }
}

export async function GET(req: Request) {
  const secret = process.env.CONNECTION_TEST_SECRET
  if (!secret) {
    return NextResponse.json({ error: 'Connection test disabled' }, { status: 403 })
  }

  const headers = new Headers(req.headers as any)
  const provided = headers.get('x-connection-test-secret')
  if (provided !== secret) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.SUPABASE_ANON_KEY
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY

  const checks: Record<string, boolean | null> = {
    supabaseAuthHealth: null,
    supabaseStorageHealth: null,
    supabaseFunctionsHealth: null,
    anonClientUsable: null,
    serviceRoleAdminUsable: null,
  }

  const errors: Record<string, string | null> = {
    supabaseAuthHealth: null,
    supabaseStorageHealth: null,
    supabaseFunctionsHealth: null,
    anonClientUsable: null,
    serviceRoleAdminUsable: null,
  }

  // Auth health
  try {
    if (!url) throw new Error("SUPABASE_URL is not set")
    const res = await fetchWithTimeout(`${url}/auth/v1/health`, { method: "GET" })
    checks.supabaseAuthHealth = res.ok
    if (!res.ok) errors.supabaseAuthHealth = `Auth health returned status ${res.status}`
  } catch (e: any) {
    checks.supabaseAuthHealth = false
    errors.supabaseAuthHealth = e?.message || "Unknown error"
  }

  // Storage health
  try {
    if (!url) throw new Error("SUPABASE_URL is not set")
    const res = await fetchWithTimeout(`${url}/storage/v1/health`, { method: "GET" })
    checks.supabaseStorageHealth = res.ok
    if (!res.ok) errors.supabaseStorageHealth = `Storage health returned status ${res.status}`
  } catch (e: any) {
    checks.supabaseStorageHealth = false
    errors.supabaseStorageHealth = e?.message || "Unknown error"
  }

  // Functions health (may be 404 if edge functions not enabled)
  try {
    if (!url) throw new Error("SUPABASE_URL is not set")
    const res = await fetchWithTimeout(`${url}/functions/v1/_internal/health`, { method: "GET" })
    // Treat 404 as not available rather than a hard error
    if (res.status === 404) {
      checks.supabaseFunctionsHealth = null
    } else {
      checks.supabaseFunctionsHealth = res.ok
      if (!res.ok) errors.supabaseFunctionsHealth = `Functions health returned status ${res.status}`
    }
  } catch (e: any) {
    checks.supabaseFunctionsHealth = false
    errors.supabaseFunctionsHealth = e?.message || "Unknown error"
  }

  // Anon client basic call (no session expected)
  try {
    if (!url || !anon) throw new Error("Anon credentials are not set")
    const anonClient = createSupabaseClient(url, anon)
    const { data, error } = await anonClient.auth.getSession()
    if (error) throw error
    // If the call succeeded, client is usable; we don't require a session
    checks.anonClientUsable = true
  } catch (e: any) {
    checks.anonClientUsable = false
    errors.anonClientUsable = e?.message || "Unknown error"
  }

  // Service role admin test: list users (safe, single page)
  try {
    if (!url || !service) throw new Error("Service role key is not set")
    const adminClient = createSupabaseClient(url, service)
    const { data, error } = await adminClient.auth.admin.listUsers({ page: 1, perPage: 1 })
    if (error) throw error
    checks.serviceRoleAdminUsable = Array.isArray(data?.users)
    if (!checks.serviceRoleAdminUsable) {
      errors.serviceRoleAdminUsable = "Admin listUsers did not return users array"
    }
  } catch (e: any) {
    checks.serviceRoleAdminUsable = false
    errors.serviceRoleAdminUsable = e?.message || "Unknown error"
  }

  const anyHardError = Object.entries(checks).some(([k, v]) => v === false)

  return NextResponse.json({
    status: anyHardError ? "error" : "ok",
    env: {
      supabaseUrlPresent: Boolean(url),
      supabaseAnonPresent: Boolean(anon),
      supabaseServiceRolePresent: Boolean(service),
      nodeEnv: process.env.NODE_ENV || null,
    },
    checks,
    errors,
    timestamp: new Date().toISOString(),
  })
}
