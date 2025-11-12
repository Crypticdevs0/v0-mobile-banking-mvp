import express from "express"
const router = express.Router()

if (process.env.NODE_ENV !== "test") {
  import("./otpAuth.ts").then(otpRouter => {
    router.use("/otp", otpRouter.default)
  })
}

export default router
