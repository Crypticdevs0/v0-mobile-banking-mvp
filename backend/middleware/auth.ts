import jwt from "jsonwebtoken"
import jwt from "jsonwebtoken"
import dotenv from "dotenv"

dotenv.config()

export function verifyToken(req: any, res: any, next: any) {
  const authHeader = req.headers.authorization || ''
  const token = authHeader.split(' ')[1]

  if (!token) {
    return res.status(401).json({ error: 'No token provided' })
  }

  const secret = process.env.JWT_SECRET
  if (!secret) {
    console.error('JWT_SECRET is not configured')
    return res.status(500).json({ error: 'Server misconfiguration' })
  }

  try {
    const decoded = jwt.verify(token, secret)
    req.user = decoded
    next()
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' })
  }
}
