"use client"

import { useEffect, useState, useRef } from "react"
import { usePathname } from "next/navigation"
import { AnimatePresence, motion } from "framer-motion"

export default function RouteTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [isTransitioning, setIsTransitioning] = useState(false)
  const firstRef = useRef(true)

  useEffect(() => {
    // Ignore initial mount
    if (firstRef.current) {
      firstRef.current = false
      return
    }
    setIsTransitioning(true)
  }, [pathname])

  return (
    <>
      {/* Full screen overlay spinner during route change */}
      <AnimatePresence initial={false}>
        {isTransitioning && (
          <motion.div
            key="route-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: "easeInOut" }}
            className="fixed inset-0 flex items-center justify-center bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm z-[9999]"
          >
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              transition={{ duration: 0.35, ease: "easeInOut" }}
              className="flex flex-col items-center gap-4"
            >
              <div className="w-14 h-14 rounded-full border-4 border-blue-600 border-t-transparent animate-spin" />
              <span className="text-sm text-slate-700 dark:text-slate-200">Loading...</span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
          transition={{ duration: 0.25, ease: "easeOut" }}
          onAnimationComplete={() => {
            // hide overlay when the new page finished animating in
            if (isTransitioning) setIsTransitioning(false)
          }}
          className="min-h-screen"
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </>
  )
}
