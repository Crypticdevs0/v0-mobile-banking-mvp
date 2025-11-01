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
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="max-w-md mx-auto px-4 py-6 border-b border-border">
        <div className="flex items-center gap-4 mb-4">
          <Link href="/dashboard">
            <ArrowLeft className="w-6 h-6 text-foreground cursor-pointer hover:opacity-70" />
          </Link>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Send className="w-6 h-6" /> Send Money
          </h1>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-8">
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
          {step === 0 && (
            <>
              <motion.div variants={itemVariants} className="card p-6">
                <h2 className="text-lg font-bold text-foreground mb-4">Enter Recipient</h2>
                <Input
                  placeholder="Account ID or Email"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                />
              </motion.div>

              <motion.div variants={itemVariants} className="card p-6">
                <h2 className="text-lg font-bold text-foreground mb-4">Amount</h2>
                <div className="relative">
                  <span className="absolute left-4 top-3 text-foreground-secondary">$</span>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </motion.div>

              <motion.div variants={itemVariants} className="card p-6">
                <h2 className="text-lg font-bold text-foreground mb-4">Description (Optional)</h2>
                <Input
                  placeholder="What's this for?"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </motion.div>

              {error && (
                <motion.div variants={itemVariants} className="p-4 bg-red-50 text-red-700 rounded-lg">
                  {error}
                </motion.div>
              )}

              <motion.div variants={itemVariants}>
                <Button onClick={() => setStep(1)} className="w-full bg-primary hover:bg-primary-dark h-12">
                  Continue
                </Button>
              </motion.div>
            </>
          )}

          {step === 1 && (
            <>
              <motion.div variants={itemVariants} className="card p-6">
                <h2 className="text-lg font-bold text-foreground mb-4">Confirm Transfer</h2>
                <div className="space-y-3 text-sm">
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
                <Button onClick={() => setStep(0)} variant="outline" className="flex-1">
                  Back
                </Button>
                <Button onClick={handleTransfer} disabled={loading} className="flex-1 bg-primary hover:bg-primary-dark">
                  {loading ? "Processing..." : "Send"}
                </Button>
              </motion.div>
            </>
          )}

          {step === 3 && (
            <motion.div variants={itemVariants} className="card p-6 text-center">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="mb-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <span className="text-3xl">✓</span>
                </div>
              </motion.div>
              <h2 className="text-lg font-bold text-foreground mb-2">Transfer Successful!</h2>
              <p className="text-foreground-secondary mb-4">Redirecting to dashboard...</p>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
