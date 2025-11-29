import { Request, Response, NextFunction } from "express"
import crypto from "crypto"

const csrfTokens = new Map<string, string>()

export function generateCSRFToken(): string {
  return crypto.randomBytes(32).toString("hex")
}

export function csrfProtection(req: Request, res: Response, next: NextFunction) {
  // Skip CSRF check for GET requests
  if (req.method === "GET") {
    return next()
  }

  // Skip CSRF check for test environment
  if (process.env.NODE_ENV === "test") {
    return next()
  }

  const token = req.headers["x-csrf-token"] as string
  const sessionId = req.headers["x-session-id"] as string

  if (!token || !sessionId) {
    return res.status(403).json({ error: "CSRF token missing" })
  }

  const storedToken = csrfTokens.get(sessionId)
  if (!storedToken || storedToken !== token) {
    return res.status(403).json({ error: "Invalid CSRF token" })
  }

  // Token is valid, remove it (one-time use)
  csrfTokens.delete(sessionId)
  next()
}

export function csrfTokenEndpoint(req: Request, res: Response) {
  const sessionId = crypto.randomBytes(16).toString("hex")
  const token = generateCSRFToken()

  csrfTokens.set(sessionId, token)

  res.json({
    token,
    sessionId,
  })
}
