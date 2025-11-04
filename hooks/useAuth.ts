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
    const token = localStorage.getItem("authToken")
    const userStr = localStorage.getItem("user")

    if (token && userStr) {
      try {
        const userData = JSON.parse(userStr)
        setUser(userData)
      } catch (error) {
        console.error("Failed to parse user data:", error)
        localStorage.removeItem("authToken")
        localStorage.removeItem("user")
      }
    }

    setLoading(false)
  }, [])

  const logout = () => {
    localStorage.removeItem("authToken")
    localStorage.removeItem("user")
    setUser(null)
  }

  return { user, loading, logout }
}
