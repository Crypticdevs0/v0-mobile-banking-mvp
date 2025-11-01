"use client"

import { motion } from "framer-motion"
import { Eye, EyeOff } from "lucide-react"
import { useState, useEffect } from "react"

export default function BalanceCard({ balance }: { balance: number }) {
  const [showBalance, setShowBalance] = useState(true)
  const [displayBalance, setDisplayBalance] = useState(balance)
  const [hasIncreased, setHasIncreased] = useState(false)

  useEffect(() => {
    const diff = balance - displayBalance
    if (diff > 0) {
      setHasIncreased(true)
      setTimeout(() => setHasIncreased(false), 1000)
    }

    if (diff !== 0) {
      const steps = 20
      const stepValue = diff / steps
      let current = 0

      const interval = setInterval(() => {
        current++
        setDisplayBalance((prev) => Math.round((prev + stepValue) * 100) / 100)
        if (current >= steps) {
          setDisplayBalance(balance)
          clearInterval(interval)
        }
      }, 30)

      return () => clearInterval(interval)
    }
  }, [balance])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="px-4 py-6"
    >
      <div className="gradient-primary rounded-2xl p-8 text-white shadow-lg relative overflow-hidden">
        {/* Animated background gradient */}
        <motion.div
          animate={{
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 4, repeat: Number.POSITIVE_INFINITY }}
          className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent"
        />

        <div className="relative z-10">
          <p className="text-sm font-medium opacity-80 mb-2">Total Balance</p>
          <div className="flex items-center justify-between mb-8">
            <motion.h2
              animate={hasIncreased ? { scale: [1, 1.1, 1], y: [0, -5, 0] } : {}}
              className="text-4xl font-bold"
            >
              {showBalance ? `$${displayBalance.toFixed(2)}` : "•••••"}
            </motion.h2>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowBalance(!showBalance)}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              {showBalance ? <Eye size={20} /> : <EyeOff size={20} />}
            </motion.button>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="opacity-70">Account</p>
              <p className="font-mono font-semibold">****1234</p>
            </div>
            <div className="text-right">
              <p className="opacity-70">Card Type</p>
              <p className="font-semibold">Premium</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
