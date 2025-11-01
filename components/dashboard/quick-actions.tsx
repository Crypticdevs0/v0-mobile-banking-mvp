"use client"

import { motion } from "framer-motion"
import { Send, Plus, TrendingUp, History, Bell } from "lucide-react"

const actions = [
  { icon: Send, label: "Send", color: "from-blue-400 to-blue-600", action: "send" },
  { icon: Plus, label: "Add Funds", color: "from-green-400 to-green-600", action: "add" },
  { icon: TrendingUp, label: "Invest", color: "from-purple-400 to-purple-600", action: "invest" },
  { icon: History, label: "History", color: "from-pink-400 to-pink-600", action: "history" },
  { icon: Bell, label: "Requests", color: "from-orange-400 to-orange-600", action: "requests" },
]

export default function QuickActions({ onTransferClick }: { onTransferClick: () => void }) {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.3 },
    },
  }

  const item = {
    hidden: { opacity: 0, scale: 0.8 },
    show: { opacity: 1, scale: 1 },
  }

  const handleClick = (action: string) => {
    if (action === "send") {
      onTransferClick()
    }
  }

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="px-4 py-6 grid grid-cols-5 gap-3">
      {actions.map((action) => {
        const Icon = action.icon
        return (
          <motion.div key={action.action} variants={item}>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.92 }}
              onClick={() => handleClick(action.action)}
              className="flex flex-col items-center gap-2 relative w-full"
            >
              {/* Ripple effect on tap */}
              <motion.div
                initial={{ scale: 0, opacity: 0.8 }}
                whileTap={{ scale: 2, opacity: 0 }}
                transition={{ duration: 0.6 }}
                className="absolute inset-0 bg-white rounded-full"
              />

              <div
                className={`w-14 h-14 rounded-full bg-gradient-to-br ${action.color} flex items-center justify-center shadow-md hover:shadow-lg transition-shadow relative z-10`}
              >
                <Icon size={24} className="text-white" />
              </div>
              <p className="text-xs font-medium text-center text-foreground">{action.label}</p>
            </motion.button>
          </motion.div>
        )
      })}
    </motion.div>
  )
}
