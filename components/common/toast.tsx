"use client"

import { motion, AnimatePresence } from "framer-motion"
import { AlertCircle, CheckCircle, Info, X } from "lucide-react"
import { useEffect } from "react"

export default function Toast({
  message,
  type = "info",
  onClose,
}: {
  message: string
  type?: "success" | "error" | "info"
  onClose: () => void
}) {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000)
    return () => clearTimeout(timer)
  }, [onClose])

  const icons = {
    success: <CheckCircle className="text-success" size={20} />,
    error: <AlertCircle className="text-error" size={20} />,
    info: <Info className="text-info" size={20} />,
  }

  const bgColors = {
    success: "bg-success/10 border-success/20",
    error: "bg-error/10 border-error/20",
    info: "bg-info/10 border-info/20",
  }

  const textColors = {
    success: "text-success",
    error: "text-error",
    info: "text-info",
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className={`fixed top-4 left-4 right-4 max-w-md mx-auto z-50 rounded-lg border ${bgColors[type]} p-4 flex items-center gap-3 backdrop-blur-sm`}
      >
        {icons[type]}
        <p className={`flex-1 text-sm font-medium ${textColors[type]}`}>{message}</p>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={onClose}
          className="p-1 hover:bg-white/10 rounded"
        >
          <X size={16} className={textColors[type]} />
        </motion.button>
      </motion.div>
    </AnimatePresence>
  )
}
