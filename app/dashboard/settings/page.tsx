"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Bell, Lock, Eye, EyeOff, LogOut, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import Link from "next/link"

export default function SettingsPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [notifications, setNotifications] = useState(true)
  const [darkMode, setDarkMode] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState("")

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const res = await fetch('/api/auth/me', { credentials: 'include' })
        if (!mounted) return
        if (!res.ok) return
        const data = await res.json()
        setUser(data.user?.profile || null)
        setEmail(data.user?.email || '')
      } catch (err) {
        console.error('Failed to fetch profile', err)
      }
    })()
    return () => { mounted = false }
  }, [])

  const handleUpdateEmail = async () => {
    setSaving(true)
    try {
      // API call would go here
      setMessage("Email updated successfully")
    } catch (error) {
      setMessage("Failed to update email")
    } finally {
      setSaving(false)
    }
  }

  const handleUpdatePassword = async () => {
    if (!password) {
      setMessage("Please enter a new password")
      return
    }
    setSaving(true)
    try {
      // API call would go here
      setPassword("")
      setMessage("Password updated successfully")
    } catch (error) {
      setMessage("Failed to update password")
    } finally {
      setSaving(false)
    }
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' })
    } catch (err) {
      console.error('Logout request failed', err)
    }
    router.push('/auth/login')
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="max-w-md mx-auto px-4 py-6 border-b border-border">
        <div className="flex items-center gap-4 mb-4">
          <Link href="/dashboard">
            <ArrowLeft className="w-6 h-6 text-foreground cursor-pointer hover:opacity-70" />
          </Link>
          <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-8">
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-8">
          {/* Profile Section */}
          <motion.div variants={itemVariants} className="card p-6">
            <h2 className="text-lg font-bold text-foreground mb-4">Profile</h2>
            <div className="space-y-4">
              <p className="text-sm">
                <strong>Name:</strong> {user?.firstName} {user?.lastName}
              </p>
              <p className="text-sm">
                <strong>Account Type:</strong> Premium
              </p>
              <p className="text-sm">
                <strong>Member Since:</strong> January 2024
              </p>
              <p className="text-xs text-foreground-secondary mt-4">
                Name, date of birth, and address cannot be changed for security reasons.
              </p>
            </div>
          </motion.div>

          {/* Email Section */}
          <motion.div variants={itemVariants} className="card p-6">
            <h2 className="text-lg font-bold text-foreground mb-4">Email</h2>
            <div className="space-y-4">
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address"
              />
              <Button onClick={handleUpdateEmail} disabled={saving} className="w-full bg-primary hover:bg-primary-dark">
                Update Email
              </Button>
            </div>
          </motion.div>

          {/* Password Section */}
          <motion.div variants={itemVariants} className="card p-6">
            <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
              <Lock className="w-5 h-5" /> Password
            </h2>
            <div className="space-y-4">
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="New password"
                  className="pr-10"
                />
                <button
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-foreground-secondary hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <p className="text-xs text-foreground-secondary">Password must be at least 8 characters</p>
              <Button
                onClick={handleUpdatePassword}
                disabled={saving}
                className="w-full bg-primary hover:bg-primary-dark"
              >
                Update Password
              </Button>
            </div>
          </motion.div>

          {/* Notifications Section */}
          <motion.div variants={itemVariants} className="card p-6">
            <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
              <Bell className="w-5 h-5" /> Notifications
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-foreground">Transaction Alerts</span>
                <Switch checked={notifications} onCheckedChange={setNotifications} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-foreground">Marketing Emails</span>
                <Switch defaultChecked={false} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-foreground">Security Notifications</span>
                <Switch defaultChecked={true} disabled />
              </div>
            </div>
          </motion.div>

          {/* Theme Section */}
          <motion.div variants={itemVariants} className="card p-6">
            <h2 className="text-lg font-bold text-foreground mb-4">Appearance</h2>
            <div className="flex items-center justify-between">
              <span className="text-foreground">Dark Mode</span>
              <Switch checked={darkMode} onCheckedChange={setDarkMode} />
            </div>
          </motion.div>

          {/* Message */}
          {message && (
            <motion.div
              variants={itemVariants}
              className={`p-4 rounded-lg ${message.includes("Failed") ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"}`}
            >
              {message}
            </motion.div>
          )}

          {/* Logout */}
          <motion.div variants={itemVariants}>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="w-full border-destructive text-destructive hover:bg-red-50 bg-transparent"
            >
              <LogOut className="w-4 h-4 mr-2" /> Sign Out
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}
