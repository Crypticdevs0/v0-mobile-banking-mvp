import express from "express"
import fs from "fs"
import path from "path"

const router = express.Router()

// Simple in-memory rate limits (per-email). For production, use Redis or a persistent store.
const sendRateLimit: Map<string, { count: number; firstAt: number }> = new Map()
const MAX_SENDS = 5
const WINDOW_MS = 60 * 60 * 1000 // 1 hour

const OTP_FILE = path.join(process.cwd(), "backend", "otp_codes.json")

function ensureOtpFile() {
  if (!fs.existsSync(OTP_FILE)) {
    fs.writeFileSync(OTP_FILE, JSON.stringify([]))
  }
}

function readOtps() {
  ensureOtpFile()
  const raw = fs.readFileSync(OTP_FILE, "utf-8")
  return JSON.parse(raw)
}

function writeOtps(data: any[]) {
  fs.writeFileSync(OTP_FILE, JSON.stringify(data, null, 2))
}

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

router.post("/send-otp", async (req, res) => {
  try {
    const { email } = req.body
    if (!email) return res.status(400).json({ error: "Email required" })

    // Rate limiting per email
    const now = Date.now()
    const record = sendRateLimit.get(email) || { count: 0, firstAt: now }
    if (now - record.firstAt > WINDOW_MS) {
      record.count = 0
      record.firstAt = now
    }
    if (record.count >= MAX_SENDS) {
      return res.status(429).json({ error: "Too many OTP requests. Try again later." })
    }
    record.count += 1
    sendRateLimit.set(email, record)

    const otp = generateOTP()
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString() // 10 minutes

    const otps = readOtps()
    otps.push({ id: `otp_${Date.now()}_${Math.floor(Math.random()*10000)}`, email, code: otp, expires_at: expiresAt, attempts: 0, max_attempts: 5, created_at: new Date().toISOString() })
    writeOtps(otps)

    // NOTE: Integration with an email provider should be here. Do NOT log OTPs in production.

    res.json({ success: true, message: "OTP generated and stored" })
  } catch (err) {
    console.error("[OTP] send error:", err)
    res.status(500).json({ error: "Failed to send OTP" })
  }
})

router.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body
    if (!email || !otp) return res.status(400).json({ error: "Email and OTP required" })

    const otps = readOtps()
    const idx = otps.findIndex((o: any) => o.email === email && o.code === otp)
    const otpRecord = idx !== -1 ? otps[idx] : null

    if (!otpRecord) {
      return res.status(401).json({ error: "Invalid or expired OTP" })
    }

    if (new Date(otpRecord.expires_at) < new Date()) {
      // remove expired
      otps.splice(idx, 1)
      writeOtps(otps)
      return res.status(401).json({ error: "OTP expired" })
    }

    if (otpRecord.attempts >= (otpRecord.max_attempts || 5)) {
      return res.status(401).json({ error: "OTP max attempts exceeded" })
    }

    // Mark OTP as used (remove it)
    otps.splice(idx, 1)
    writeOtps(otps)

    // Generate account and routing numbers (demo values)
    const accountNumber = Math.floor(100000000 + Math.random() * 900000000).toString()
    const routingNumber = "021000021"

    res.json({
      success: true,
      accountNumber,
      routingNumber,
      message: "OTP verified successfully",
    })
  } catch (err) {
    console.error("[OTP] verify error:", err)
    res.status(500).json({ error: "Verification failed" })
  }
})

router.post("/resend-otp", async (req, res) => {
  try {
    const { email } = req.body
    if (!email) return res.status(400).json({ error: "Email required" })

    // Similar rate limiting logic
    const now = Date.now()
    const record = sendRateLimit.get(email) || { count: 0, firstAt: now }
    if (now - record.firstAt > WINDOW_MS) {
      record.count = 0
      record.firstAt = now
    }
    if (record.count >= MAX_SENDS) {
      return res.status(429).json({ error: "Too many OTP requests. Try again later." })
    }
    record.count += 1
    sendRateLimit.set(email, record)

    const otp = generateOTP()
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString()

    const otps = readOtps()
    // remove old
    const remaining = otps.filter((o: any) => o.email !== email)
    remaining.push({ id: `otp_${Date.now()}_${Math.floor(Math.random()*10000)}`, email, code: otp, expires_at: expiresAt, attempts: 0, max_attempts: 5, created_at: new Date().toISOString() })
    writeOtps(remaining)

    res.json({ success: true, message: "OTP resent" })
  } catch (err) {
    console.error("[OTP] resend error:", err)
    res.status(500).json({ error: "Failed to resend OTP" })
  }
})

export default router
