"use client"

import { motion } from "framer-motion"
import { Bell, Settings, LogOut } from "lucide-react"
import { useRouter } from "next/navigation"
import Avatar from "@/components/common/avatar"
import { createClient } from "@/lib/supabase/client"

interface User {
  name?: string
  email?: string
  id?: string | number
}

export default function Header({ user }: { user: User }) {
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    localStorage.removeItem("authToken")
    localStorage.removeItem("user")
    localStorage.removeItem("userId")
    localStorage.removeItem("userEmail")
    localStorage.removeItem("accountNumber")
    localStorage.removeItem("routingNumber")
    router.push("/auth/login")
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
      className="px-4 pt-4 sm:pt-6 pb-3 sm:pb-4 flex items-center justify-between"
    >
      <motion.div variants={item} className="flex items-center gap-2 sm:gap-3">
        <Avatar name={user.name || "User"} />
        <div>
          <p className="text-xs text-muted-foreground">Premier America Credit Union</p>
          <h1 className="text-sm sm:text-lg font-bold text-foreground">{user.name || "User"}</h1>
        </div>
      </motion.div>

      <motion.div variants={item} className="flex items-center gap-1 sm:gap-2">
        <motion.button
          whileHover={{ scale: 1.1, rotate: 10 }}
          whileTap={{ scale: 0.95 }}
          className="p-2 hover:bg-muted rounded-lg transition-colors"
        >
          <Bell size={18} className="sm:w-5 sm:h-5 text-foreground" />
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.1, rotate: -10 }}
          whileTap={{ scale: 0.95 }}
          className="p-2 hover:bg-muted rounded-lg transition-colors"
        >
          <Settings size={18} className="sm:w-5 sm:h-5 text-foreground" />
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleLogout}
          className="p-2 hover:bg-muted rounded-lg transition-colors"
          title="Logout"
        >
          <LogOut size={18} className="sm:w-5 sm:h-5 text-foreground" />
        </motion.button>
      </motion.div>
    </motion.header>
  )
}
