"use client"

import type React from "react"
import { useEffect, useMemo, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import logger from '@/lib/logger'
import { useAuth } from "@/hooks/useAuth"
import { createClient as createSupabaseClient } from "@/lib/supabase/client"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { user } = useAuth()
  const [checking, setChecking] = useState(true)
  const [authed, setAuthed] = useState(false)

  // Create a single Supabase client instance for this layout
  const supabase = useMemo(() => {
    try {
      return createSupabaseClient()
    } catch (e) {
      console.error("Failed to create Supabase client", e)
      return null
    }
  }, [])

  const channelRef = useRef<any>(null)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const res = await fetch('/api/auth/me', { credentials: 'include' })
        if (!mounted) return
        if (!res.ok) {
          setAuthed(false)
          router.replace('/auth/login')
          return
        }
        setAuthed(true)
      } catch (err) {
        logger.error('Auth check failed', err)
        setAuthed(false)
        router.replace('/auth/login')
      } finally {
        if (mounted) setChecking(false)
      }
    })()

    return () => { mounted = false }
  }, [router])

  // Realtime subscriptions for the authenticated user
  useEffect(() => {
    if (!authed || !user?.id || !supabase) return

    // Clean up any existing channel before creating a new one
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current)
      channelRef.current = null
    }

    const uid = String(user.id)
    const channel = supabase
      .channel("dashboard-realtime")
      // Transactions where the user is the sender
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "transactions", filter: `sender_id=eq.${uid}` },
        (payload) => {
          console.info("Realtime: transaction sent", payload.new)
          window.dispatchEvent(new CustomEvent("transactions:insert", { detail: payload.new }))
        },
      )
      // Transactions where the user is the receiver
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "transactions", filter: `receiver_id=eq.${uid}` },
        (payload) => {
          console.info("Realtime: transaction received", payload.new)
          window.dispatchEvent(new CustomEvent("transactions:insert", { detail: payload.new }))
        },
      )
      // Notifications for the user
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${uid}` },
        (payload) => {
          console.info("Realtime: notification", payload.new)
          window.dispatchEvent(new CustomEvent("notifications:insert", { detail: payload.new }))
        },
      )
      .subscribe((status) => {
        console.log("Realtime channel status:", status)
      })

    channelRef.current = channel

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
        channelRef.current = null
      }
    }
  }, [authed, user?.id, supabase])

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
          <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4" />
          <h1 className="text-lg font-semibold text-foreground">Loading...</h1>
        </motion.div>
      </div>
    )
  }

  if (!authed) return null

  return <>{children}</>
}
