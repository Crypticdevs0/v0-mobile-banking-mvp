"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp"
import { Button } from "@/components/ui/button"
import { Mail, Clock, CheckCircle } from "lucide-react"

export default function OTPVerificationPage() {
  const router = useRouter()
  const [otp, setOtp] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [timeLeft, setTimeLeft] = useState(300)
  const [verified, setVerified] = useState(false)
  const [userEmail, setUserEmail] = useState("")

  useEffect(() => {
    const email = localStorage.getItem("userEmail") || ""
    setUserEmail(email)

    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0))
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const handleVerify = async () => {
    if (otp.length !== 6) {
      setError("Please enter a 6-digit code")
      return
    }

    setLoading(true)
    try {
      const response = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ otp, email: userEmail }),
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.error || "Verification failed")

      setVerified(true)
      localStorage.setItem("accountNumber", data.accountNumber)
      localStorage.setItem("routingNumber", data.routingNumber)

      setTimeout(() => {
        router.push("/dashboard")
      }, 2000)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    try {
      await fetch("/api/auth/resend-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: userEmail }),
      })
      setTimeLeft(300)
      setError("")
    } catch (err) {
      setError("Failed to resend OTP")
    }
  }

  if (verified) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-50 flex items-center justify-center px-4">
        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="mb-6"
          >
            <CheckCircle className="w-20 h-20 text-green-600 mx-auto" />
          </motion.div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Account Verified!</h1>
          <p className="text-slate-600 mb-8">Your Premier America account is ready to use.</p>
          <motion.div animate={{ opacity: [1, 0.5, 1] }} transition={{ repeat: Number.POSITIVE_INFINITY, duration: 2 }}>
            <p className="text-sm text-slate-600">Redirecting to your dashboard...</p>
          </motion.div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-teal-50 flex items-center justify-center px-4 py-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 text-center">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="mb-6">
            <Mail className="w-16 h-16 text-blue-600 mx-auto" />
          </motion.div>

          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2">Verify Your Email</h1>
          <p className="text-slate-600 mb-8">We sent a 6-digit code to</p>
          <p className="font-semibold text-slate-900 mb-8 break-all">{userEmail}</p>

          <div className="mb-8">
            <label className="block text-sm font-medium text-slate-900 mb-4">Enter verification code</label>
            <div className="flex justify-center">
              <InputOTP value={otp} onChange={setOtp} maxLength={6}>
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
            </div>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg"
            >
              <p className="text-sm text-red-700">{error}</p>
            </motion.div>
          )}

          <Button
            onClick={handleVerify}
            disabled={loading || otp.length !== 6}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white mb-4 h-12"
          >
            {loading ? "Verifying..." : "Verify Code"}
          </Button>

          <div className="flex items-center justify-between text-sm text-slate-600 mb-4">
            <span>Didn't receive code?</span>
            {timeLeft > 0 ? (
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" /> {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, "0")}
              </span>
            ) : (
              <button onClick={handleResend} className="text-blue-600 hover:underline font-semibold">
                Resend
              </button>
            )}
          </div>
        </div>

        <p className="text-center text-sm text-slate-600 mt-6">
          By verifying, you confirm you're the account owner and accept our terms.
        </p>
      </motion.div>
    </div>
  )
}
