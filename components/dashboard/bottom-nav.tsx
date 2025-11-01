"use client"

import { motion } from "framer-motion"
import { Home, Wallet, Send, Settings } from "lucide-react"

const navItems = [
  { icon: Home, label: "Home", href: "/" },
  { icon: Wallet, label: "Accounts", href: "/accounts" },
  { icon: Send, label: "Transfer", href: "/transfer" },
  { icon: Settings, label: "Settings", href: "/settings" },
]

export default function BottomNav() {
  return (
    <motion.nav
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      className="fixed bottom-0 left-0 right-0 card rounded-t-2xl border-t bg-background/95 backdrop-blur-sm max-w-lg mx-auto"
    >
      <div className="flex items-center justify-around px-4 py-4">
        {navItems.slice(0, 4).map((item) => {
          const Icon = item.icon
          return (
            <motion.div
              key={item.label}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="flex flex-col items-center gap-1"
            >
              <div className="p-2 rounded-lg hover:bg-surface-hover transition-colors">
                <Icon size={24} className="text-foreground" />
              </div>
              <span className="text-xs text-foreground-secondary">{item.label}</span>
            </motion.div>
          )
        })}
      </div>
    </motion.nav>
  )
}
