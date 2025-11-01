"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { CreditCard, ArrowLeft, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"

export default function PaymentsPage() {
  const [billers, setBillers] = useState([
    { id: 1, name: "Electric Company", amount: 125.5, dueDate: "2024-02-15" },
    { id: 2, name: "Internet Provider", amount: 79.99, dueDate: "2024-02-10" },
  ])
  const [selectedBiller, setSelectedBiller] = useState<any>(null)
  const [showAddBiller, setShowAddBiller] = useState(false)

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
      <div className="max-w-md mx-auto px-4 py-6 border-b border-border">
        <div className="flex items-center gap-4">
          <Link href="/dashboard">
            <ArrowLeft className="w-6 h-6 text-foreground cursor-pointer hover:opacity-70" />
          </Link>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <CreditCard className="w-6 h-6" /> Bill Pay
          </h1>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-8">
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
          <Tabs defaultValue="scheduled" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
              <TabsTrigger value="billers">Billers</TabsTrigger>
            </TabsList>

            <TabsContent value="scheduled" className="space-y-4 mt-6">
              {billers.map((biller) => (
                <motion.div
                  key={biller.id}
                  variants={itemVariants}
                  className="card p-4 hover:shadow-md transition cursor-pointer"
                  onClick={() => setSelectedBiller(biller)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-bold text-foreground">{biller.name}</p>
                      <p className="text-sm text-foreground-secondary">
                        Due: {new Date(biller.dueDate).toLocaleDateString()}
                      </p>
                    </div>
                    <p className="font-bold text-foreground">${biller.amount.toFixed(2)}</p>
                  </div>
                </motion.div>
              ))}

              <motion.div variants={itemVariants}>
                <Button onClick={() => setShowAddBiller(true)} variant="outline" className="w-full">
                  <Plus className="w-4 h-4 mr-2" /> Add Biller
                </Button>
              </motion.div>
            </TabsContent>

            <TabsContent value="history" className="space-y-4 mt-6">
              <motion.div variants={itemVariants} className="card p-4">
                <p className="text-sm text-foreground-secondary">Electricity - Paid Jan 15</p>
                <p className="font-bold text-foreground">$125.50</p>
              </motion.div>
              <motion.div variants={itemVariants} className="card p-4">
                <p className="text-sm text-foreground-secondary">Internet - Paid Jan 10</p>
                <p className="font-bold text-foreground">$79.99</p>
              </motion.div>
            </TabsContent>

            <TabsContent value="billers" className="space-y-4 mt-6">
              <motion.div variants={itemVariants} className="text-center py-8 text-foreground-secondary">
                <p>No billers added. Add your first biller to get started.</p>
              </motion.div>
            </TabsContent>
          </Tabs>

          {selectedBiller && (
            <motion.div variants={itemVariants} className="card p-6 mt-6">
              <h3 className="font-bold text-foreground mb-4">Pay {selectedBiller.name}</h3>
              <Input type="number" defaultValue={selectedBiller.amount} placeholder="Amount" className="mb-4" />
              <Input type="date" className="mb-4" />
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setSelectedBiller(null)} className="flex-1">
                  Cancel
                </Button>
                <Button className="flex-1 bg-primary hover:bg-primary-dark">Schedule Payment</Button>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
