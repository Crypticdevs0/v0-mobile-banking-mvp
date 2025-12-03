"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { CreditCard, ArrowLeft, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"

export default function PaymentsPage() {
  const [billers, setBillers] = useState<any[]>([])
  const [selectedBiller, setSelectedBiller] = useState<any>(null)
  const [showAddBiller, setShowAddBiller] = useState(false)
  const [newBillerName, setNewBillerName] = useState("")
  const [newBillerAccountNumber, setNewBillerAccountNumber] = useState("")
  const [paymentAmount, setPaymentAmount] = useState("")
  const [paymentDate, setPaymentDate] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [message, setMessage] = useState("")

  useEffect(() => {
    const fetchBillers = async () => {
      try {
        const token = localStorage.getItem("authToken")
        const response = await fetch("/api/billers", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        const data = await response.json()
        if (!response.ok) throw new Error(data.error)
        setBillers(data.billers)
      } catch (err: any) {
        setError(err.message)
      }
    }

    fetchBillers()
  }, [])

  const handleSchedulePayment = async () => {
    if (!selectedBiller || !paymentAmount || !paymentDate) {
      setError("Please fill all fields")
      return
    }

    setLoading(true)
    try {
      const token = localStorage.getItem("authToken")
      const response = await fetch("/api/payments", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          billerId: selectedBiller.id,
          amount: Number.parseFloat(paymentAmount),
          paymentDate,
        }),
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.error)

      setMessage("Payment scheduled successfully")
      setSelectedBiller(null)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleAddBiller = async () => {
    if (!newBillerName || !newBillerAccountNumber) {
      setError("Please fill all fields")
      return
    }

    setLoading(true)
    try {
      const token = localStorage.getItem("authToken")
      const response = await fetch("/api/billers", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          billerName: newBillerName,
          accountNumber: newBillerAccountNumber,
        }),
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.error)

      setBillers([...billers, data.biller])
      setShowAddBiller(false)
      setMessage("Biller added successfully")
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
        <div className="flex items-center gap-3 sm:gap-4">
          <Link href="/dashboard">
            <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6 text-foreground cursor-pointer hover:opacity-70" />
          </Link>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground flex items-center gap-2">
            <CreditCard className="w-5 h-5 sm:w-6 sm:h-6" /> Bill Pay
          </h1>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-3 sm:px-4 py-4 sm:py-8">
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
          <Tabs defaultValue="scheduled" className="w-full">
            <TabsList className="grid w-full grid-cols-3 h-auto">
              <TabsTrigger value="scheduled" className="text-xs sm:text-sm py-2">Scheduled</TabsTrigger>
              <TabsTrigger value="history" className="text-xs sm:text-sm py-2">History</TabsTrigger>
              <TabsTrigger value="billers" className="text-xs sm:text-sm py-2">Billers</TabsTrigger>
            </TabsList>

            <TabsContent value="scheduled" className="space-y-3 sm:space-y-4 mt-4 sm:mt-6">
              {billers.length > 0 ? (
                billers.map((biller) => (
                  <motion.div
                    key={biller.id}
                    variants={itemVariants}
                    className="card p-3 sm:p-4 hover:shadow-md transition cursor-pointer"
                    onClick={() => setSelectedBiller(biller)}
                  >
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-foreground text-sm sm:text-base truncate">{biller.name}</p>
                        <p className="text-xs sm:text-sm text-foreground-secondary truncate">
                          A/C: {biller.accountNumber}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <motion.div variants={itemVariants} className="text-center py-6 sm:py-8 text-foreground-secondary">
                  <p className="text-sm sm:text-base">No scheduled payments.</p>
                </motion.div>
              )}
            </TabsContent>

            <TabsContent value="history" className="space-y-4 mt-4 sm:mt-6">
              <motion.div variants={itemVariants} className="text-center py-6 sm:py-8 text-foreground-secondary">
                <p className="text-sm sm:text-base">No payment history.</p>
              </motion.div>
            </TabsContent>

            <TabsContent value="billers" className="space-y-3 sm:space-y-4 mt-4 sm:mt-6">
              {billers.map((biller) => (
                <motion.div key={biller.id} variants={itemVariants} className="card p-3 sm:p-4">
                  <p className="font-bold text-foreground text-sm sm:text-base truncate">{biller.name}</p>
                  <p className="text-xs sm:text-sm text-foreground-secondary truncate">{biller.accountNumber}</p>
                </motion.div>
              ))}
              <motion.div variants={itemVariants}>
                <Button onClick={() => setShowAddBiller(true)} variant="outline" className="w-full text-xs sm:text-sm">
                  <Plus className="w-4 h-4 mr-2" /> Add Biller
                </Button>
              </motion.div>
            </TabsContent>
          </Tabs>

          {selectedBiller && (
            <motion.div variants={itemVariants} className="card p-4 sm:p-6 mt-4 sm:mt-6">
              <h3 className="font-bold text-foreground mb-3 sm:mb-4 text-sm sm:text-base">Pay {selectedBiller.name}</h3>
              <Input
                type="number"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                placeholder="Amount"
                className="mb-3 sm:mb-4 text-sm"
              />
              <Input
                type="date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                className="mb-3 sm:mb-4 text-sm"
              />
              <div className="flex gap-2 sm:gap-3">
                <Button variant="outline" onClick={() => setSelectedBiller(null)} className="flex-1 text-xs sm:text-sm">
                  Cancel
                </Button>
                <Button onClick={handleSchedulePayment} disabled={loading} className="flex-1 bg-primary hover:bg-primary-dark text-xs sm:text-sm">
                  {loading ? "Scheduling..." : "Schedule Payment"}
                </Button>
              </div>
            </motion.div>
          )}

          {showAddBiller && (
            <motion.div variants={itemVariants} className="card p-4 sm:p-6 mt-4 sm:mt-6">
              <h3 className="font-bold text-foreground mb-3 sm:mb-4 text-sm sm:text-base">Add New Biller</h3>
              <Input
                value={newBillerName}
                onChange={(e) => setNewBillerName(e.target.value)}
                placeholder="Biller Name"
                className="mb-3 sm:mb-4 text-sm"
              />
              <Input
                value={newBillerAccountNumber}
                onChange={(e) => setNewBillerAccountNumber(e.target.value)}
                placeholder="Account Number"
                className="mb-3 sm:mb-4 text-sm"
              />
              <div className="flex gap-2 sm:gap-3">
                <Button variant="outline" onClick={() => setShowAddBiller(false)} className="flex-1 text-xs sm:text-sm">
                  Cancel
                </Button>
                <Button onClick={handleAddBiller} disabled={loading} className="flex-1 bg-primary hover:bg-primary-dark text-xs sm:text-sm">
                  {loading ? "Adding..." : "Add Biller"}
                </Button>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
