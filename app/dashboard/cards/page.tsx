"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { CreditCard, ArrowLeft, Eye, EyeOff, Copy } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function CardsPage() {
  const [showCardNumber, setShowCardNumber] = useState(false)
  const [copied, setCopied] = useState(false)

  const virtualCard = {
    number: "4532 1234 5678 9010",
    expiry: "12/26",
    cvv: "123",
    name: "JOHN DOE",
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
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
      <div className="max-w-lg mx-auto px-4 py-6 border-b border-border">
        <div className="flex items-center gap-4">
          <Link href="/dashboard">
            <ArrowLeft className="w-6 h-6 text-foreground cursor-pointer hover:opacity-70" />
          </Link>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <CreditCard className="w-6 h-6" /> Virtual Card
          </h1>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-8">
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
          {/* Card Display */}
          <motion.div
            variants={itemVariants}
            className="relative h-56 bg-gradient-to-br from-blue-600 to-teal-500 rounded-2xl p-6 text-white shadow-2xl overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full -ml-16 -mb-16" />

            <div className="relative z-10 h-full flex flex-col justify-between">
              <div>
                <p className="text-sm opacity-75">Premier America</p>
                <CreditCard className="w-8 h-8 mt-2" />
              </div>

              <div>
                <div className="flex items-center gap-2 mb-4">
                  <button
                    onClick={() => setShowCardNumber(!showCardNumber)}
                    className="text-white hover:opacity-75 transition"
                  >
                    {showCardNumber ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                  </button>
                  <p className="text-lg font-mono tracking-wider">
                    {showCardNumber ? virtualCard.number : "●●●● ●●●● ●●●● ●●●●"}
                  </p>
                </div>

                <div className="flex justify-between text-sm">
                  <div>
                    <p className="opacity-75 text-xs">Cardholder</p>
                    <p className="font-semibold">{virtualCard.name}</p>
                  </div>
                  <div>
                    <p className="opacity-75 text-xs">Expires</p>
                    <p className="font-semibold">{virtualCard.expiry}</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Card Details */}
          {showCardNumber && (
            <motion.div variants={itemVariants} className="card p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-foreground-secondary">Card Number</p>
                  <p className="font-mono font-bold text-foreground">{virtualCard.number}</p>
                </div>
                <button
                  onClick={() => copyToClipboard(virtualCard.number.replace(/\s/g, ""))}
                  className="text-primary hover:opacity-70"
                >
                  <Copy className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-foreground-secondary">Expiry</p>
                  <p className="font-mono font-bold text-foreground">{virtualCard.expiry}</p>
                </div>
                <div>
                  <p className="text-xs text-foreground-secondary">CVV</p>
                  <p className="font-mono font-bold text-foreground">{virtualCard.cvv}</p>
                </div>
              </div>

              {copied && <p className="text-sm text-green-600">Copied to clipboard!</p>}
            </motion.div>
          )}

          {/* Card Actions */}
          <motion.div variants={itemVariants} className="flex gap-3">
            <Button variant="outline" className="flex-1 bg-transparent">
              Freeze Card
            </Button>
            <Button className="flex-1 bg-primary hover:bg-primary-dark">Settings</Button>
          </motion.div>

          {/* Card Information */}
          <motion.div variants={itemVariants} className="card p-6">
            <h3 className="font-bold text-foreground mb-4">About Virtual Card</h3>
            <ul className="space-y-2 text-sm text-foreground-secondary">
              <li>✓ Accepted everywhere Visa is accepted</li>
              <li>✓ Unique number for each purchase</li>
              <li>✓ Cashback on eligible purchases</li>
              <li>✓ Real-time transaction notifications</li>
            </ul>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}
