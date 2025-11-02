"use client"

import { motion } from "framer-motion"
import { Bell, Settings, LogOut } from "lucide-react"
import { useRouter } from "next/navigation"
import Avatar from "@/components/common/avatar"

interface User {
  name?: string
  email?: string
  id?: string | number
}

export default function Header({ user }: { user: User }) {
  const router = useRouter()

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' })
    } catch (err) {
      console.error('Logout request failed', err)
    }
    router.push('/auth/login')
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  }

  const item = {
    hidden: { opacity: 0, y: -10 },
    show: { opacity: 1, y: 0 },
  }

  return (
    <motion.header
      variants={container}
      initial="hidden"
      animate="show"
      className="px-4 pt-6 pb-4 flex items-center justify-between"
    >
      <motion.div variants={item} className="flex items-center gap-3">
        <Avatar name={user.name || "User"} />
        <div>
          <p className="text-xs text-foreground-secondary">Premier America Credit Union</p>
          <h1 className="text-lg font-bold text-foreground">{user.name || "User"}</h1>
        </div>
      </motion.div>

      <motion.div variants={item} className="flex items-center gap-2">
        <motion.button
          whileHover={{ scale: 1.1, rotate: 10 }}
          whileTap={{ scale: 0.95 }}
          className="p-2 hover:bg-surface-hover rounded-lg transition-colors"
        >
          <Bell size={20} className="text-foreground" />
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.1, rotate: -10 }}
          whileTap={{ scale: 0.95 }}
          className="p-2 hover:bg-surface-hover rounded-lg transition-colors"
        >
          <Settings size={20} className="text-foreground" />
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleLogout}
          className="p-2 hover:bg-surface-hover rounded-lg transition-colors"
          title="Logout"
        >
          <LogOut size={20} className="text-foreground" />
        </motion.button>
      </motion.div>
    </motion.header>
  )
}
