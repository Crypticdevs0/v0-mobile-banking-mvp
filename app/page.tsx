"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Header from "@/components/dashboard/header"
import BalanceCard from "@/components/dashboard/balance-card"
import QuickActions from "@/components/dashboard/quick-actions"
import TransactionsList from "@/components/dashboard/transactions-list"
import BottomNav from "@/components/dashboard/bottom-nav"
import TransferModal from "@/components/transfer/transfer-modal"
import Toast from "@/components/common/toast"
import { useSocket } from "@/hooks/useSocket"
import { useAuth } from "@/hooks/useAuth"
import { motion } from "framer-motion"

export default function Dashboard() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const { socket, isConnected, requestBalanceUpdate } = useSocket()
  const [balance, setBalance] = useState<number>(0)
  const [showTransferModal, setShowTransferModal] = useState(false)
  const [toastMessage, setToastMessage] = useState("")
  const [toastType, setToastType] = useState<"success" | "error" | "info">("info")

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/login")
    }
  }, [user, loading, router])

  useEffect(() => {
    // Fetch initial balance
    const fetchBalance = async () => {
      try {
        const token = localStorage.getItem("authToken")
        const response = await fetch("/api/accounts/balance", {
          headers: { Authorization: `Bearer ${token}` },
        })
        const data = await response.json()
        setBalance(data.balance)
      } catch (error) {
        console.error("Failed to fetch balance:", error)
      }
    }

    if (user) {
      fetchBalance()
    }

    // Listen for real-time balance updates via Socket.io
    if (socket) {
      socket.on("balance:updated", (data) => {
        setBalance(data.balance)
      })

      socket.on("transfer:completed", (transfer) => {
        setToastMessage(`Transfer successful: $${transfer.amount}`)
        setToastType("success")
      })

      socket.on("transfer:received", (transfer) => {
        setToastMessage(`Received $${transfer.amount} from ${transfer.from}`)
        setToastType("success")
      })

      socket.on("transfer:sent", (transfer) => {
        setToastMessage(`Transfer of $${transfer.amount} sent successfully`)
        setToastType("success")
      })

      socket.on("error:balance", (error) => {
        console.error("Balance error:", error)
        setToastMessage("Failed to update balance")
        setToastType("error")
      })
    }

    return () => {
      if (socket) {
        socket.off("balance:updated")
        socket.off("transfer:completed")
        socket.off("transfer:received")
        socket.off("transfer:sent")
        socket.off("error:balance")
      }
    }
  }, [socket, user])

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
          <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4" />
          <h1 className="text-lg font-semibold text-foreground">Loading...</h1>
        </motion.div>
      </div>
    )
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen pb-24 bg-background">
      <div className="max-w-lg mx-auto">
        <Header user={user} />
        <BalanceCard balance={balance} />
        <QuickActions onTransferClick={() => setShowTransferModal(true)} />
        <TransactionsList />
      </div>

      <BottomNav />
      <TransferModal
        isOpen={showTransferModal}
        onClose={() => setShowTransferModal(false)}
        onTransferSuccess={(amount) => {
          setToastMessage("Transfer successful!")
          setToastType("success")
        }}
      />
      {toastMessage && <Toast message={toastMessage} type={toastType} onClose={() => setToastMessage("")} />}
    </motion.div>
  )
}
