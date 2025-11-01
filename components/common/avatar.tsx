"use client"

import { motion } from "framer-motion"

export default function Avatar({ name }: { name: string }) {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const colors = ["from-blue-400 to-blue-600", "from-green-400 to-green-600", "from-purple-400 to-purple-600"]
  const colorIndex = name.charCodeAt(0) % colors.length

  return (
    <motion.div
      whileHover={{ scale: 1.1 }}
      className={`w-10 h-10 rounded-full bg-gradient-to-br ${colors[colorIndex]} flex items-center justify-center text-white font-bold text-sm`}
    >
      {getInitials(name)}
    </motion.div>
  )
}
