"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { ArrowUpRight, ArrowDownLeft } from "lucide-react"
import Loader from "@/components/common/loader"
import logger from '@/lib/logger'

interface Transaction {
  id: string
  type: "sent" | "received"
  amount: number
  from?: string
  to?: string
  description: string
  timestamp: Date | string
}

export default function TransactionsList() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await fetch("/api/transactions", { credentials: 'include' })
        const data = await response.json()
        setTransactions(data.transactions || [])
      } catch (error) {
        logger.error("Failed to fetch transactions:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchTransactions()
  }, [])

  if (loading) {
    return <Loader count={3} />
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="px-4 pb-6">
      <h3 className="text-lg font-bold mb-4">Recent Transactions</h3>
      <div className="space-y-3">
        {transactions.length === 0 ? (
          <div className="text-center py-8 text-foreground-secondary">
            <p>No transactions yet</p>
          </div>
        ) : (
          transactions.map((tx, idx) => (
            <motion.div
              key={tx.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              whileHover={{ x: 5 }}
              className="card p-4 flex items-center justify-between cursor-pointer hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-3">
                <motion.div
                  whileHover={{ scale: 1.2, rotate: 10 }}
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    tx.type === "sent" ? "bg-red-100" : "bg-green-100"
                  }`}
                >
                  {tx.type === "sent" ? (
                    <ArrowUpRight size={20} className="text-red-600" />
                  ) : (
                    <ArrowDownLeft size={20} className="text-green-600" />
                  )}
                </motion.div>
                <div>
                  <p className="font-semibold text-foreground">{tx.description}</p>
                  <p className="text-xs text-foreground-secondary">
                    {tx.type === "sent" ? `to ${tx.to}` : `from ${tx.from}`}
                  </p>
                </div>
              </div>
              <p className={`font-bold ${tx.type === "sent" ? "text-red-600" : "text-green-600"}`}>
                {tx.type === "sent" ? "-" : "+"}${tx.amount.toFixed(2)}
              </p>
            </motion.div>
          ))
        )}
      </div>
    </motion.div>
  )
}
