"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import Header from "@/components/dashboard/header"
import BalanceCard from "@/components/dashboard/balance-card"
import QuickActions from "@/components/dashboard/quick-actions"
import TransactionsList from "@/components/dashboard/transactions-list"
import BottomNav from "@/components/dashboard/bottom-nav"
import TransferModal from "@/components/transfer/transfer-modal"
import Toast from "@/components/common/toast"
import { useSocket } from "@/hooks/useSocket"
import { createClient } from "@/lib/supabase/client"

export default function DashboardPage() {
  const router = useRouter()
  const supabase = createClient()
  const { socket, isConnected } = useSocket()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [balance, setBalance] = useState<number>(0)
  const [showTransferModal, setShowTransferModal] = useState(false)
  const [toastMessage, setToastMessage] = useState("")
  const [toastType, setToastType] = useState<"success" | "error" | "info">("info")

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser()

      if (!authUser) {
        router.push("/auth/login")
        return
      }

      // Get user profile from Supabase
      const { data: profile } = await supabase.from("users").select("*").eq("id", authUser.id).single()

      if (profile) {
        setUser({
          id: authUser.id,
          email: authUser.email,
          name: `${profile.first_name} ${profile.last_name}`,
          firstName: profile.first_name,
          lastName: profile.last_name,
        })
      } else {
        setUser({
          id: authUser.id,
          email: authUser.email,
          name: authUser.email?.split("@")[0] || "User",
        })
      }

      setLoading(false)
    }

    checkAuth()
  }, [router, supabase])

  useEffect(() => {
    const fetchBalance = async () => {
      if (!user) return

      try {
        const { data: account } = await supabase.from("accounts").select("balance").eq("user_id", user.id).single()

        if (account) {
          setBalance(account.balance || 0)
        } else {
          // Create default account if doesn't exist
          const accountNumber =
            localStorage.getItem("accountNumber") || `${Math.floor(100000000 + Math.random() * 900000000)}`

          await supabase.from("accounts").insert({
            user_id: user.id,
            balance: 1000.0,
            currency: "USD",
            account_number: accountNumber,
          })

          setBalance(1000.0)
        }
      } catch (error) {
        console.error("Failed to fetch balance:", error)
      }
    }

    if (user) {
      fetchBalance()
    }
  }, [user, supabase])

  useEffect(() => {
    if (!user) return

    const channel = supabase
      .channel("account-changes")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "accounts",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          setBalance(payload.new.balance)
          setToastMessage("Balance updated!")
          setToastType("success")
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user, supabase])

  // Socket.io events for additional real-time features
  useEffect(() => {
    if (socket && user) {
      socket.emit("user:login", user.id)

      socket.on("transfer:completed", () => {
        setToastMessage("Transfer successful!")
        setToastType("success")
      })

      socket.on("transfer:received", (data) => {
        setToastMessage(`Received $${data.amount} from ${data.from}`)
        setToastType("success")
      })
    }

    return () => {
      if (socket) {
        socket.off("transfer:completed")
        socket.off("transfer:received")
      }
    }
  }, [socket, user])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
          <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4" />
          <h1 className="text-base sm:text-lg font-semibold text-foreground">Loading your account...</h1>
        </motion.div>
      </div>
    )
  }

  if (!user) return null

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen pb-24 bg-background">
      <div className="max-w-lg mx-auto">
        <Header user={user} />
        <BalanceCard balance={balance} />
        <QuickActions onTransferClick={() => setShowTransferModal(true)} />
        <TransactionsList userId={user.id} />
      </div>

      <BottomNav />
      <TransferModal
        isOpen={showTransferModal}
        onClose={() => setShowTransferModal(false)}
        onTransferSuccess={() => {
          setToastMessage("Transfer successful!")
          setToastType("success")
        }}
        userId={user.id}
      />
      {toastMessage && <Toast message={toastMessage} type={toastType} onClose={() => setToastMessage("")} />}
    </motion.div>
  )
}
