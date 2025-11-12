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

import { createServerClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"

export async function getServerSideProps({ req }) {
  const cookieStore = cookies()
  const supabase = createServerClient(cookieStore)
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    return {
      redirect: {
        destination: "/auth/login",
        permanent: false,
      },
    }
  }

  const { data: user } = await supabase.from("users").select("*").eq("id", session.user.id).single()
  const { data: account } = await supabase.from("accounts").select("balance").eq("user_id", session.user.id).single()

  return {
    props: {
      user,
      balance: account?.balance || 0,
    },
  }
}

export default function DashboardPage({ user, balance: initialBalance }) {
  const router = useRouter()
  const supabase = createClient()
  const { socket, isConnected } = useSocket()
  const [balance, setBalance] = useState<number>(initialBalance)
  const [showTransferModal, setShowTransferModal] = useState(false)
  const [toastMessage, setToastMessage] = useState("")
  const [toastType, setToastType] = useState<"success" | "error" | "info">("info")

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
