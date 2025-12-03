import crypto from "crypto"

const csrfTokens = new Map()

export function generateCSRFToken() {
  return crypto.randomBytes(32).toString("hex")
}

export function csrfProtection(req, res, next) {
  // Skip CSRF check for GET requests
  if (req.method === "GET") {
    return next()
  }

  // Skip CSRF check for test environment
  if (process.env.NODE_ENV === "test") {
    return next()
  }

  const token = req.headers["x-csrf-token"]
  const sessionId = req.headers["x-session-id"]

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

export function csrfTokenEndpoint(req, res) {
  const sessionId = crypto.randomBytes(16).toString("hex")
  const token = generateCSRFToken()

  csrfTokens.set(sessionId, token)

  res.json({
    token,
    sessionId,
  })
}
