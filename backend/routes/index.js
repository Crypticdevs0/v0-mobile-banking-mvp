import express from "express"
import otpRouter from "./otpAuth.js"

const router = express.Router()

// Mount OTP routes
router.use("/otp", otpRouter)

export default router
