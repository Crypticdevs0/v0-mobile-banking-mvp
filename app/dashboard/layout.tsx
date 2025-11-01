"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [checking, setChecking] = useState(true)
  const [authed, setAuthed] = useState(false)

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null
    const ok = !!token
    setAuthed(ok)
    setChecking(false)
    if (!ok) {
      router.replace("/auth/login")
    }
  }, [router])

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
