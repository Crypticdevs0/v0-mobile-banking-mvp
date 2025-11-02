"use client"

import { useEffect, useRef, useCallback } from "react"
import io, { type Socket } from "socket.io-client"

export function useSocket() {
  const socketRef = useRef<Socket | null>(null)

  const connect = useCallback(async () => {
    if (!socketRef.current) {
      // Try to obtain userId from server-side session
      let userId: string | null = null
      try {
        const res = await fetch('/api/auth/me', { credentials: 'include' })
        if (res.ok) {
          const data = await res.json()
          userId = data.user?.id || null
        }
      } catch (err) {
        console.error('Failed to fetch user for socket auth', err)
      }

      socketRef.current = io(process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001", {
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 5,
        auth: { userId },
      })

      socketRef.current.on("connect", () => {
        console.log("[Socket] Connected:", socketRef.current?.id)
        if (userId) {
          socketRef.current?.emit("user:login", userId)
          socketRef.current?.emit("subscribe:balance", userId)
          socketRef.current?.emit("subscribe:notifications", userId)
        }
      })

      socketRef.current.on("connect_error", (error) => {
        console.error("[Socket] Connection error:", error)
      })

      socketRef.current.on("disconnect", (reason) => {
        console.log("[Socket] Disconnected:", reason)
      })

      socketRef.current.on("error", (error) => {
        console.error("[Socket] Error event:", error)
      })
    }
  }, [])

  useEffect(() => {
    connect()

    return () => {
      // Keep connection alive on unmount
    }
  }, [connect])

  // Request balance update from server
  const requestBalanceUpdate = useCallback((userId: string, accountId: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit("request:balance", userId, accountId)
    }
  }, [])

  return {
    socket: socketRef.current,
    isConnected: socketRef.current?.connected ?? false,
    requestBalanceUpdate,
  }
}
