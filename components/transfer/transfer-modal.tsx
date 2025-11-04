"use client"
import { motion, AnimatePresence } from "framer-motion"
import { X } from "lucide-react"
import TransferForm from "./transfer-form"

export default function TransferModal({
  isOpen,
  onClose,
  onTransferSuccess,
  userId,
}: {
  isOpen: boolean
  onClose: () => void
  onTransferSuccess: (amount: number) => void
  userId: string
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            transition={{ type: "spring", damping: 25 }}
            className="fixed bottom-0 left-0 right-0 z-50 max-w-lg mx-auto"
          >
            <div className="card rounded-t-3xl border-b-0 p-4 sm:p-6 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h2 className="text-xl sm:text-2xl font-bold">Send Money</h2>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onClose}
                  className="p-2 hover:bg-muted rounded-lg"
                >
                  <X size={20} className="sm:w-6 sm:h-6" />
                </motion.button>
              </div>

              <TransferForm
                userId={userId}
                onSuccess={(amount) => {
                  onTransferSuccess(amount)
                  onClose()
                }}
              />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
