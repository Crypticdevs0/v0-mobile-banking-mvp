"use client"

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import { AnimatePresence, motion } from "framer-motion"

export default function RouteTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [isTransitioning, setIsTransitioning] = useState(false)

  useEffect(() => {
    setIsTransitioning(true)
    const id = window.setTimeout(() => setIsTransitioning(false), 500)
    return () => window.clearTimeout(id)
  }, [pathname])

  return (
    <>
      {/* Top progress bar during route change */}
      <AnimatePresence initial={false}>
        {isTransitioning && (
          <motion.div
            key="route-progress"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="fixed left-0 top-0 h-0.5 w-full bg-blue-600 origin-left z-[100]"
          />
        )}
      </AnimatePresence>

      {/* Page fade/slide transition */}
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={pathname}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="min-h-screen"
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </>
  )
}
