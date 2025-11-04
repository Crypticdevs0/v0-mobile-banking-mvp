"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { createClient } from "@/lib/supabase/client"

function parseHashParams(hash: string) {
  const out: Record<string, string> = {}
  const trimmed = hash.startsWith("#") ? hash.slice(1) : hash
  for (const part of trimmed.split("&")) {
    const [k, v] = part.split("=")
    if (!k) continue
    out[decodeURIComponent(k)] = decodeURIComponent(v ?? "")
  }
  return out
}

export default function ResetPasswordPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = useMemo(() => createClient(), [])

  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [loading, setLoading] = useState(false)
  const [ready, setReady] = useState(false)
  const [message, setMessage] = useState<string>("")
  const [error, setError] = useState<string>("")

  useEffect(() => {
    let cancelled = false
    async function establishSession() {
      try {
        // 1) Try hash tokens (access_token, refresh_token)
        if (typeof window !== "undefined" && window.location.hash) {
          const params = parseHashParams(window.location.hash)
          const access_token = params["access_token"]
          const refresh_token = params["refresh_token"]
          if (access_token && refresh_token) {
            const { error } = await supabase.auth.setSession({ access_token, refresh_token })
            if (error) throw error
            // Clean the URL hash
            if (!cancelled) {
              const cleanUrl = window.location.pathname + window.location.search
              window.history.replaceState({}, "", cleanUrl)
            }
            if (!cancelled) setReady(true)
            return
          }
        }

        // 2) Try code param (exchangeCodeForSession)
        const code = searchParams?.get("code")
        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code)
          if (error) throw error
          if (!cancelled) setReady(true)
          return
        }

        // 3) Check existing session
        const { data } = await supabase.auth.getSession()
        if (data.session) {
          if (!cancelled) setReady(true)
          return
        }

        if (!cancelled) {
          setError("Invalid or expired reset link. Please request a new one.")
        }
      } catch (e: any) {
        if (!cancelled) setError(e?.message || "Unable to verify reset link. Try requesting a new one.")
      }
    }

    establishSession()
    return () => {
      cancelled = true
    }
  }, [searchParams, supabase])

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setMessage("")

    if (!password || password.length < 8) {
      setError("Password must be at least 8 characters.")
      return
    }
    if (password !== confirm) {
      setError("Passwords do not match.")
      return
    }

    setLoading(true)
    try {
      const { error } = await supabase.auth.updateUser({ password })
      if (error) throw error
      setMessage("Password updated. You can now sign in.")
      setTimeout(() => router.push("/auth/login"), 1500)
    } catch (e: any) {
      setError(e?.message || "Failed to update password.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-blue-50 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white rounded-2xl p-8 shadow">
        <h1 className="text-2xl font-bold text-slate-900 mb-4">Set a new password</h1>
        <p className="text-sm text-slate-600 mb-6">Enter your new password below to complete the reset.</p>

        {!ready && !error && (
          <p className="text-sm text-slate-700">Validating your reset link…</p>
        )}

        {error && (
          <div className="mb-4 p-3 rounded-md border border-red-200 bg-red-50 text-red-700 text-sm">{error}</div>
        )}

        {ready && !error && (
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">New password</label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">Confirm new password</label>
              <Input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full bg-blue-600 text-white" disabled={loading}>
              {loading ? "Updating…" : "Update Password"}
            </Button>
          </form>
        )}

        {message && <p className="mt-4 text-sm text-slate-700">{message}</p>}
      </div>
    </div>
  )
}
