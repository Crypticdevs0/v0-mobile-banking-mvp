"use client"

import { useEffect, useRef, useCallback } from "react"
import io, { type Socket } from "socket.io-client"
import logger from '@/lib/logger'

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
        logger.error('Failed to fetch user for socket auth', err)
      }

      const url = process.env.NEXT_PUBLIC_SOCKET_URL && process.env.NEXT_PUBLIC_SOCKET_URL.trim().length > 0 ? process.env.NEXT_PUBLIC_SOCKET_URL : undefined
      const socketPath = process.env.NEXT_PUBLIC_SOCKET_PATH || "/socket.io"

      socketRef.current = io(url, {
        path: socketPath,
        transports: ["websocket"],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 5,
        auth: { userId },
      })

      socketRef.current.on("connect", () => {
        logger.info("[Socket] Connected:", socketRef.current?.id)
        if (userId) {
          socketRef.current?.emit("user:login", userId)
          socketRef.current?.emit("subscribe:balance", userId)
          socketRef.current?.emit("subscribe:notifications", userId)
        }
      })

      socketRef.current.on("connect_error", (error) => {
        logger.error("[Socket] Connection error:", error)
      })

      socketRef.current.on("disconnect", (reason) => {
        logger.info("[Socket] Disconnected:", reason)
      })

      socketRef.current.on("error", (error) => {
        logger.error("[Socket] Error event:", error)
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
