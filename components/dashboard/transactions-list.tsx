"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { ArrowUpRight, ArrowDownLeft } from "lucide-react"
import Loader from "@/components/common/loader"
import { createClient } from "@/lib/supabase/client"

interface Transaction {
  id: string
  type: "sent" | "received"
  amount: number
  from?: string
  to?: string
  description: string
  timestamp: Date | string
  created_at?: string
}

export default function TransactionsList({ userId }: { userId: string }) {
  const supabase = createClient()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const { data, error } = await supabase
          .from("transactions")
          .select("*")
          .or(`from_user_id.eq.${userId},to_user_id.eq.${userId}`)
          .order("created_at", { ascending: false })
          .limit(10)

        if (error) throw error

        // Transform data to match component interface
        const transformedTransactions =
          data?.map((tx) => ({
            id: tx.id,
            type: tx.from_user_id === userId ? "sent" : "received",
            amount: tx.amount,
            from: tx.from_account,
            to: tx.to_account,
            description: tx.description || (tx.from_user_id === userId ? "Transfer sent" : "Transfer received"),
            timestamp: tx.created_at,
          })) || []

        setTransactions(transformedTransactions)
      } catch (error) {
        console.error("Failed to fetch transactions:", error)
      } finally {
        setLoading(false)
      }
    }

    if (userId) {
      fetchTransactions()
    }
  }, [userId, supabase])

  useEffect(() => {
    if (!userId) return

    const channel = supabase
      .channel("transaction-changes")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "transactions",
          filter: `from_user_id=eq.${userId}`,
        },
        (payload) => {
          const newTx = {
            id: payload.new.id,
            type: "sent" as const,
            amount: payload.new.amount,
            from: payload.new.from_account,
            to: payload.new.to_account,
            description: payload.new.description || "Transfer sent",
            timestamp: payload.new.created_at,
          }
          setTransactions((prev) => [newTx, ...prev])
        },
      )
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "transactions",
          filter: `to_user_id=eq.${userId}`,
        },
        (payload) => {
          const newTx = {
            id: payload.new.id,
            type: "received" as const,
            amount: payload.new.amount,
            from: payload.new.from_account,
            to: payload.new.to_account,
            description: payload.new.description || "Transfer received",
            timestamp: payload.new.created_at,
          }
          setTransactions((prev) => [newTx, ...prev])
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId, supabase])

  if (loading) {
    return <Loader count={3} />
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="px-4 pb-6">
      <h3 className="text-base sm:text-lg font-bold mb-3 sm:mb-4 text-foreground">Recent Transactions</h3>
      <div className="space-y-2 sm:space-y-3">
        {transactions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p className="text-sm sm:text-base">No transactions yet</p>
          </div>
        ) : (
          transactions.map((tx, idx) => (
            <motion.div
              key={tx.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              whileHover={{ x: 5 }}
              className="card p-3 sm:p-4 flex items-center justify-between cursor-pointer hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-2 sm:gap-3">
                <motion.div
                  whileHover={{ scale: 1.2, rotate: 10 }}
                  className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center ${
                    tx.type === "sent" ? "bg-red-100" : "bg-green-100"
                  }`}
                >
                  {tx.type === "sent" ? (
                    <ArrowUpRight size={16} className="sm:w-5 sm:h-5 text-red-600" />
                  ) : (
                    <ArrowDownLeft size={16} className="sm:w-5 sm:h-5 text-green-600" />
                  )}
                </motion.div>
                <div>
                  <p className="font-semibold text-foreground text-xs sm:text-sm">{tx.description}</p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">
                    {tx.type === "sent" ? `to ${tx.to}` : `from ${tx.from}`}
                  </p>
                </div>
              </div>
              <p className={`font-bold text-sm sm:text-base ${tx.type === "sent" ? "text-red-600" : "text-green-600"}`}>
                {tx.type === "sent" ? "-" : "+"}${tx.amount.toFixed(2)}
              </p>
            </motion.div>
          ))
        )}
      </div>
    </motion.div>
  )
}
