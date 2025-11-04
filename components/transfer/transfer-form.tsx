"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { AlertCircle, CheckCircle2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface Recipient {
  id: string
  name: string
  email: string
  avatar: string
  account_number?: string
}

export default function TransferForm({ onSuccess, userId }: { onSuccess: (amount: number) => void; userId: string }) {
  const supabase = createClient()
  const [step, setStep] = useState<"recipient" | "amount" | "confirm" | "success">("recipient")
  const [recipients, setRecipients] = useState<Recipient[]>([])
  const [selectedRecipient, setSelectedRecipient] = useState<Recipient | null>(null)
  const [amount, setAmount] = useState("")
  const [description, setDescription] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchRecipients = async () => {
      try {
        const { data, error } = await supabase
          .from("users")
          .select("id, email, first_name, last_name")
          .neq("id", userId)
          .limit(10)

        if (error) throw error

        const transformedRecipients: Recipient[] =
          data?.map((user) => ({
            id: user.id,
            name: `${user.first_name || ""} ${user.last_name || ""}`.trim() || user.email,
            email: user.email,
            avatar: (user.first_name?.[0] || user.email[0]).toUpperCase(),
          })) || []

        setRecipients(transformedRecipients)
      } catch (err) {
        console.error("Failed to fetch recipients:", err)
      }
    }

    if (userId) {
      fetchRecipients()
    }
  }, [userId, supabase])

  const handleRecipientSelect = (recipient: Recipient) => {
    setSelectedRecipient(recipient)
    setStep("amount")
  }

  const handleAmountSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!amount || Number.parseFloat(amount) <= 0) {
      setError("Enter a valid amount")
      return
    }
    setError("")
    setStep("confirm")
  }

  const handleTransfer = async () => {
    try {
      setLoading(true)
      setError("")

      // Get sender's account
      const { data: senderAccount, error: senderError } = await supabase
        .from("accounts")
        .select("*")
        .eq("user_id", userId)
        .single()

      if (senderError || !senderAccount) {
        throw new Error("Sender account not found")
      }

      // Check sufficient balance
      if (senderAccount.balance < Number.parseFloat(amount)) {
        throw new Error("Insufficient balance")
      }

      // Get recipient's account
      const { data: recipientAccount, error: recipientError } = await supabase
        .from("accounts")
        .select("*")
        .eq("user_id", selectedRecipient?.id)
        .single()

      if (recipientError || !recipientAccount) {
        throw new Error("Recipient account not found")
      }

      // Deduct from sender
      const { error: deductError } = await supabase
        .from("accounts")
        .update({ balance: senderAccount.balance - Number.parseFloat(amount) })
        .eq("id", senderAccount.id)

      if (deductError) throw deductError

      // Add to recipient
      const { error: addError } = await supabase
        .from("accounts")
        .update({ balance: recipientAccount.balance + Number.parseFloat(amount) })
        .eq("id", recipientAccount.id)

      if (addError) throw addError

      // Create transaction record
      const { error: txError } = await supabase.from("transactions").insert({
        from_user_id: userId,
        to_user_id: selectedRecipient?.id,
        from_account: senderAccount.account_number,
        to_account: recipientAccount.account_number,
        amount: Number.parseFloat(amount),
        description: description || "Transfer",
        status: "completed",
      })

      if (txError) throw txError

      setStep("success")
      setTimeout(() => {
        onSuccess(Number.parseFloat(amount))
        setStep("recipient")
        setSelectedRecipient(null)
        setAmount("")
        setDescription("")
      }, 2000)
    } catch (err: any) {
      setError(err.message || "Transfer failed. Please try again.")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Recipient Selection */}
      {step === "recipient" && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="space-y-2 sm:space-y-3"
        >
          {recipients.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p className="text-sm">No recipients available</p>
            </div>
          ) : (
            recipients.map((recipient) => (
              <motion.button
                key={recipient.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleRecipientSelect(recipient)}
                className="w-full card p-3 sm:p-4 flex items-center gap-3 sm:gap-4 text-left hover:shadow-md transition-shadow"
              >
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-primary to-accent-teal flex items-center justify-center text-white font-bold text-sm sm:text-base">
                  {recipient.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground text-sm sm:text-base truncate">{recipient.name}</p>
                  <p className="text-xs sm:text-sm text-muted-foreground truncate">{recipient.email}</p>
                </div>
              </motion.button>
            ))
          )}
        </motion.div>
      )}

      {/* Amount Entry */}
      {step === "amount" && (
        <motion.form
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          onSubmit={handleAmountSubmit}
          className="space-y-3 sm:space-y-4"
        >
          <div>
            <p className="text-xs sm:text-sm text-muted-foreground mb-2">To: {selectedRecipient?.name}</p>
            <label className="block text-xs sm:text-sm font-medium mb-2">Amount</label>
            <div className="relative">
              <span className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-xl sm:text-2xl font-bold text-foreground">
                $
              </span>
              <input
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full pl-8 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-3 text-xl sm:text-2xl font-bold border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                autoFocus
              />
            </div>
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-medium mb-2">Description (Optional)</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add a note"
              className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-2 p-2 sm:p-3 bg-error/10 text-error rounded-lg"
            >
              <AlertCircle size={14} className="sm:w-4 sm:h-4" />
              <p className="text-xs sm:text-sm">{error}</p>
            </motion.div>
          )}

          <div className="flex gap-2 sm:gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={() => setStep("recipient")}
              className="btn-secondary flex-1 text-sm sm:text-base h-10 sm:h-11"
            >
              Back
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="btn-primary flex-1 text-sm sm:text-base h-10 sm:h-11"
            >
              Next
            </motion.button>
          </div>
        </motion.form>
      )}

      {/* Confirmation */}
      {step === "confirm" && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="space-y-4 sm:space-y-6"
        >
          <div className="text-center py-4 sm:py-6">
            <h3 className="text-lg sm:text-xl font-bold mb-2">Confirm Transfer</h3>
            <div className="text-3xl sm:text-4xl font-bold text-primary my-3 sm:my-4">${amount}</div>
            <p className="text-sm sm:text-base text-muted-foreground">to {selectedRecipient?.name}</p>
          </div>

          <div className="card p-3 sm:p-4 space-y-2 sm:space-y-3">
            <div className="flex justify-between text-sm sm:text-base">
              <span className="text-muted-foreground">Amount:</span>
              <span className="font-semibold">${amount}</span>
            </div>
            <div className="border-t border-border my-2 sm:my-3" />
            <div className="flex justify-between text-sm sm:text-base">
              <span className="text-muted-foreground">Fee:</span>
              <span className="font-semibold">Free</span>
            </div>
            <div className="border-t border-border my-2 sm:my-3" />
            <div className="flex justify-between text-base sm:text-lg">
              <span className="font-bold">Total:</span>
              <span className="font-bold text-primary">${amount}</span>
            </div>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-2 p-2 sm:p-3 bg-error/10 text-error rounded-lg"
            >
              <AlertCircle size={14} className="sm:w-4 sm:h-4" />
              <p className="text-xs sm:text-sm">{error}</p>
            </motion.div>
          )}

          <div className="flex gap-2 sm:gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={() => setStep("amount")}
              className="btn-secondary flex-1 text-sm sm:text-base h-10 sm:h-11"
              disabled={loading}
            >
              Back
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleTransfer}
              disabled={loading}
              className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base h-10 sm:h-11"
            >
              {loading ? "Processing..." : "Confirm Transfer"}
            </motion.button>
          </div>
        </motion.div>
      )}

      {step === "success" && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-8 sm:py-12 space-y-3 sm:space-y-4"
        >
          <motion.div
            animate={{ scale: [0.8, 1.1, 1], rotate: 360 }}
            transition={{ duration: 0.6 }}
            className="flex justify-center"
          >
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-success/20 flex items-center justify-center">
              <CheckCircle2 size={24} className="sm:w-8 sm:h-8 text-success" />
            </div>
          </motion.div>
          <h3 className="text-xl sm:text-2xl font-bold text-foreground">Transfer Complete</h3>
          <p className="text-sm sm:text-base text-muted-foreground">
            Your transfer of ${amount} has been sent successfully!
          </p>
        </motion.div>
      )}
    </div>
  )
}
