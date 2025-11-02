"use client"

import type React from "react"

import { useState } from "react"
import { motion } from "framer-motion"
import { AlertCircle, CheckCircle2 } from "lucide-react"

const recipients = [
  { id: 2, name: "Bob Johnson", email: "bob@bank.com", avatar: "B", accountId: 2 },
  { id: 3, name: "Charlie Davis", email: "charlie@bank.com", avatar: "C", accountId: 3 },
  { id: 4, name: "Diana Wilson", email: "diana@bank.com", avatar: "D", accountId: 4 },
]

export default function TransferForm({ onSuccess }: { onSuccess: (amount: number) => void }) {
  const [step, setStep] = useState<"recipient" | "amount" | "confirm" | "success">("recipient")
  const [selectedRecipient, setSelectedRecipient] = useState<(typeof recipients)[0] | null>(null)
  const [amount, setAmount] = useState("")
  const [description, setDescription] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleRecipientSelect = (recipient: (typeof recipients)[0]) => {
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

      // Obtain CSRF token
      const csrfRes = await fetch('/api/csrf-token', { credentials: 'include' })
      if (!csrfRes.ok) throw new Error('Failed to obtain CSRF token')
      const csrfData = await csrfRes.json()

      const response = await fetch("/api/transfers", {
        method: "POST",
        credentials: 'include',
        headers: {
          "Content-Type": "application/json",
          "x-csrf-token": csrfData.csrfToken,
        },
        body: JSON.stringify({
          recipientAccountId: selectedRecipient?.accountId,
          amount: Number.parseFloat(amount),
          description,
        }),
      })

      if (!response.ok) throw new Error("Transfer failed")

      setStep("success")
      setTimeout(() => {
        onSuccess(Number.parseFloat(amount))
        setStep("recipient")
        setSelectedRecipient(null)
        setAmount("")
        setDescription("")
      }, 2000)
    } catch (err) {
      setError("Transfer failed. Please try again.")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Recipient Selection */}
      {step === "recipient" && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="space-y-3"
        >
          {recipients.map((recipient) => (
            <motion.button
              key={recipient.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleRecipientSelect(recipient)}
              className="w-full card p-4 flex items-center gap-4 text-left hover:shadow-md transition-shadow"
            >
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent-teal flex items-center justify-center text-white font-bold">
                {recipient.avatar}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-foreground">{recipient.name}</p>
                <p className="text-sm text-foreground-secondary">{recipient.email}</p>
              </div>
            </motion.button>
          ))}
        </motion.div>
      )}

      {/* Amount Entry */}
      {step === "amount" && (
        <motion.form
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          onSubmit={handleAmountSubmit}
          className="space-y-4"
        >
          <div>
            <p className="text-sm text-foreground-secondary mb-2">To: {selectedRecipient?.name}</p>
            <label className="block text-sm font-medium mb-2">Amount</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-foreground">$</span>
              <input
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full pl-10 pr-4 py-3 text-2xl font-bold border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                autoFocus
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Description (Optional)</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add a note"
              className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-2 p-3 bg-error/10 text-error rounded-lg"
            >
              <AlertCircle size={16} />
              <p className="text-sm">{error}</p>
            </motion.div>
          )}

          <div className="flex gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={() => setStep("recipient")}
              className="btn-secondary flex-1"
            >
              Back
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="btn-primary flex-1"
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
          className="space-y-6"
        >
          <div className="text-center py-6">
            <h3 className="text-xl font-bold mb-2">Confirm Transfer</h3>
            <div className="text-4xl font-bold text-primary my-4">${amount}</div>
            <p className="text-foreground-secondary">to {selectedRecipient?.name}</p>
          </div>

          <div className="card p-4 space-y-3">
            <div className="flex justify-between">
              <span className="text-foreground-secondary">Amount:</span>
              <span className="font-semibold">${amount}</span>
            </div>
            <div className="border-t border-border my-3" />
            <div className="flex justify-between">
              <span className="text-foreground-secondary">Fee:</span>
              <span className="font-semibold">Free</span>
            </div>
            <div className="border-t border-border my-3" />
            <div className="flex justify-between text-lg">
              <span className="font-bold">Total:</span>
              <span className="font-bold text-primary">${amount}</span>
            </div>
          </div>

          <div className="flex gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={() => setStep("amount")}
              className="btn-secondary flex-1"
              disabled={loading}
            >
              Back
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleTransfer}
              disabled={loading}
              className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
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
          className="text-center py-12 space-y-4"
        >
          <motion.div
            animate={{ scale: [0.8, 1.1, 1], rotate: 360 }}
            transition={{ duration: 0.6 }}
            className="flex justify-center"
          >
            <div className="w-16 h-16 rounded-full bg-success/20 flex items-center justify-center">
              <CheckCircle2 size={32} className="text-success" />
            </div>
          </motion.div>
          <h3 className="text-2xl font-bold text-foreground">Transfer Complete</h3>
          <p className="text-foreground-secondary">Your transfer of ${amount} has been sent successfully!</p>
        </motion.div>
      )}
    </div>
  )
}
