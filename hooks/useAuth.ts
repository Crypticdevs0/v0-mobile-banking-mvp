"use client"

import { useEffect, useState } from "react"

interface User {
  id: string | number
  name?: string
  email?: string
  accountId?: string | number
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const res = await fetch('/api/auth/me', { credentials: 'include' })
        if (!mounted) return
        if (!res.ok) {
          setUser(null)
          setLoading(false)
          return
        }
        const data = await res.json()
        if (data.user) {
          const u = data.user
          const profile = u.profile || {}
          const name = u.name || (profile.first_name ? `${profile.first_name} ${profile.last_name}` : undefined)
          setUser({
            id: u.id,
            name,
            email: u.email || profile.email,
            accountId: u.accountId || u.accountId,
          })
        } else {
          setUser(null)
        }
      } catch (err) {
        console.error('Failed to fetch current user', err)
        setUser(null)
      } finally {
        if (mounted) setLoading(false)
      }
    })()

    return () => {
      mounted = false
    }
  }, [])

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' })
    } catch (err) {
      console.error('Logout request failed', err)
    }
    setUser(null)
  }

  return { user, loading, logout }
}
