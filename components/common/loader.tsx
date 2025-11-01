"use client"

import { motion } from "framer-motion"

export default function Loader({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-3 px-4 py-6">
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY, delay: i * 0.1 }}
          className="card p-4 h-20 shimmer"
        />
      ))}
    </div>
  )
}
