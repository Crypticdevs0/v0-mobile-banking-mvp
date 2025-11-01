"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Download, ArrowLeft, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"

export default function DepositsPage() {
  const router = useRouter()
  const [amount, setAmount] = useState("")
  const [method, setMethod] = useState("bank-transfer")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleDeposit = async () => {
    if (!amount) return
    setLoading(true)
    try {
      const token = localStorage.getItem("authToken")
      const response = await fetch("/api/deposits", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ amount: Number.parseFloat(amount), method }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error)
      setSuccess(true)
      setTimeout(() => router.push("/dashboard"), 2000)
    } catch (err: any) {
      console.error(err)
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

  if (success) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">✓</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Deposit Processed!</h1>
          <p className="text-foreground-secondary">Your funds will arrive shortly.</p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-lg mx-auto px-4 py-6 border-b border-border">
        <div className="flex items-center gap-4">
          <Link href="/dashboard">
            <ArrowLeft className="w-6 h-6 text-foreground cursor-pointer hover:opacity-70" />
          </Link>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Download className="w-6 h-6" /> Add Funds
          </h1>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-8">
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
          <Tabs value={method} onValueChange={setMethod} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="bank-transfer">Bank Transfer</TabsTrigger>
              <TabsTrigger value="card">Debit Card</TabsTrigger>
              <TabsTrigger value="mobile-check">Mobile Check</TabsTrigger>
            </TabsList>

            <TabsContent value="bank-transfer" className="space-y-4 mt-6">
              <motion.div variants={itemVariants} className="card p-6">
                <h2 className="font-bold text-foreground mb-4">Bank Account Details</h2>
                <div className="space-y-3 text-sm mb-6 bg-slate-50 p-4 rounded-lg">
                  <p>
                    <strong>Bank Name:</strong> Premier America Credit Union
                  </p>
                  <p>
                    <strong>Routing #:</strong> 021000021
                  </p>
                  <p>
                    <strong>Account #:</strong> {localStorage.getItem("accountNumber") || "●●●●●●●●●●"}
                  </p>
                </div>
                <p className="text-xs text-foreground-secondary">Use these details to transfer funds from your bank.</p>
              </motion.div>

              <motion.div variants={itemVariants} className="card p-6">
                <h2 className="font-bold text-foreground mb-4">Transfer Amount</h2>
                <div className="relative mb-4">
                  <span className="absolute left-4 top-3 text-foreground-secondary">$</span>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="pl-8"
                  />
                </div>
                <p className="text-xs text-foreground-secondary">Transfers usually take 1-3 business days</p>
              </motion.div>
            </TabsContent>

            <TabsContent value="card" className="space-y-4 mt-6">
              <motion.div variants={itemVariants} className="card p-6 space-y-4">
                <h2 className="font-bold text-foreground">Debit Card Details</h2>
                <Input placeholder="Card Number" />
                <div className="grid grid-cols-2 gap-4">
                  <Input placeholder="MM/YY" />
                  <Input placeholder="CVV" />
                </div>
                <div className="relative">
                  <span className="absolute left-4 top-3 text-foreground-secondary">$</span>
                  <Input
                    type="number"
                    placeholder="Amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </motion.div>
            </TabsContent>

            <TabsContent value="mobile-check" className="space-y-4 mt-6">
              <motion.div variants={itemVariants} className="card p-6">
                <h2 className="font-bold text-foreground mb-4">Mobile Check Deposit</h2>
                <label className="flex flex-col items-center justify-center border-2 border-dashed border-border rounded-xl p-8 cursor-pointer hover:border-primary transition">
                  <Upload className="w-8 h-8 text-foreground-secondary mb-2" />
                  <span className="text-sm text-foreground">Upload check image</span>
                  <input type="file" accept="image/*" className="hidden" />
                </label>
                <div className="relative mt-6">
                  <span className="absolute left-4 top-3 text-foreground-secondary">$</span>
                  <Input
                    type="number"
                    placeholder="Check Amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </motion.div>
            </TabsContent>
          </Tabs>

          <motion.div variants={itemVariants}>
            <Button
              onClick={handleDeposit}
              disabled={loading || !amount}
              className="w-full bg-primary hover:bg-primary-dark h-12"
            >
              {loading ? "Processing..." : `Add $${amount || "0.00"}`}
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}
