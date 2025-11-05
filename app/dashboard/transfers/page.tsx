"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Send, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"

export default function TransfersPage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [recipient, setRecipient] = useState("")
  const [amount, setAmount] = useState("")
  const [description, setDescription] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleTransfer = async () => {
    if (!recipient || !amount) {
      setError("Please fill all fields")
      return
    }

    setLoading(true)
    try {
      const token = localStorage.getItem("authToken")
      const response = await fetch("/api/transfers", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ recipientAccountId: recipient, amount: Number.parseFloat(amount), description }),
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.error)

      setStep(3)
      setTimeout(() => router.push("/dashboard"), 3000)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  }

  return (
    <div className="min-h-screen bg-background pb-20 sm:pb-24">
      <div className="max-w-lg mx-auto px-3 sm:px-4 py-4 sm:py-6 border-b border-border">
        <div className="flex items-center gap-3 sm:gap-4 mb-0">
          <Link href="/dashboard">
            <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6 text-foreground cursor-pointer hover:opacity-70" />
          </Link>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground flex items-center gap-2">
            <Send className="w-5 h-5 sm:w-6 sm:h-6" /> Send Money
          </h1>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-3 sm:px-4 py-4 sm:py-8">
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-4 sm:space-y-6">
          {step === 0 && (
            <>
              <motion.div variants={itemVariants} className="card p-4 sm:p-6">
                <h2 className="text-base sm:text-lg font-bold text-foreground mb-3 sm:mb-4">Enter Recipient</h2>
                <Input
                  placeholder="Account ID or Email"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  className="h-10 sm:h-11 text-sm sm:text-base"
                />
              </motion.div>

              <motion.div variants={itemVariants} className="card p-4 sm:p-6">
                <h2 className="text-base sm:text-lg font-bold text-foreground mb-3 sm:mb-4">Amount</h2>
                <div className="relative">
                  <span className="absolute left-3 sm:left-4 top-2.5 sm:top-3 text-foreground-secondary text-sm sm:text-base">
                    $
                  </span>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="pl-7 sm:pl-8 h-10 sm:h-11 text-sm sm:text-base"
                  />
                </div>
              </motion.div>

              <motion.div variants={itemVariants} className="card p-4 sm:p-6">
                <h2 className="text-base sm:text-lg font-bold text-foreground mb-3 sm:mb-4">Description (Optional)</h2>
                <Input
                  placeholder="What's this for?"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="h-10 sm:h-11 text-sm sm:text-base"
                />
              </motion.div>

              {error && (
                <motion.div
                  variants={itemVariants}
                  className="p-3 sm:p-4 bg-red-50 text-red-700 rounded-lg text-xs sm:text-sm"
                >
                  {error}
                </motion.div>
              )}

              <motion.div variants={itemVariants}>
                <Button
                  onClick={() => setStep(1)}
                  className="w-full bg-primary hover:bg-primary-dark h-11 sm:h-12 text-sm sm:text-base"
                >
                  Continue
                </Button>
              </motion.div>
            </>
          )}

          {step === 1 && (
            <>
              <motion.div variants={itemVariants} className="card p-4 sm:p-6">
                <h2 className="text-base sm:text-lg font-bold text-foreground mb-3 sm:mb-4">Confirm Transfer</h2>
                <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm">
                  <p>
                    <strong>Recipient:</strong> {recipient}
                  </p>
                  <p>
                    <strong>Amount:</strong> ${amount}
                  </p>
                  {description && (
                    <p>
                      <strong>Description:</strong> {description}
                    </p>
                  )}
                </div>
              </motion.div>

              <motion.div variants={itemVariants} className="flex gap-3">
                <Button
                  onClick={() => setStep(0)}
                  variant="outline"
                  className="flex-1 h-11 sm:h-12 text-sm sm:text-base"
                >
                  Back
                </Button>
                <Button
                  onClick={handleTransfer}
                  disabled={loading}
                  className="flex-1 bg-primary hover:bg-primary-dark h-11 sm:h-12 text-sm sm:text-base"
                >
                  {loading ? "Processing..." : "Send"}
                </Button>
              </motion.div>
            </>
          )}

          {step === 3 && (
            <motion.div variants={itemVariants} className="card p-6 sm:p-8 text-center">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="mb-4">
                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <span className="text-2xl sm:text-3xl">✓</span>
                </div>
              </motion.div>
              <h2 className="text-base sm:text-lg font-bold text-foreground mb-2">Transfer Successful!</h2>
              <p className="text-xs sm:text-sm text-foreground-secondary mb-4">Redirecting to dashboard...</p>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
