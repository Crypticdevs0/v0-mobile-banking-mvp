import { Request, Response, NextFunction } from "express"
import { v4 as uuid } from "uuid"

export interface RequestWithId extends Request {
  id: string
  startTime: number
}

export function requestLogger(req: RequestWithId, res: Response, next: NextFunction) {
  req.id = uuid()
  req.startTime = Date.now()

  res.on("finish", () => {
    const duration = Date.now() - req.startTime
    const level = res.statusCode >= 400 ? "error" : "info"

    console.log(JSON.stringify({
      level,
      timestamp: new Date().toISOString(),
      requestId: req.id,
      method: req.method,
      path: req.path,
      status: res.statusCode,
      duration: `${duration}ms`,
      userAgent: req.get("user-agent"),
    }))
  })

  next()
}

export function errorHandler(
  err: Error,
  req: RequestWithId,
  res: Response,
  next: NextFunction
) {
  const requestId = req.id || "unknown"
  const statusCode = (err as any).statusCode || 500
  const message = err.message || "Internal server error"

  console.error(JSON.stringify({
    level: "error",
    timestamp: new Date().toISOString(),
    requestId,
    method: req.method,
    path: req.path,
    status: statusCode,
    error: message,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  }))

  res.status(statusCode).json({
    error: message,
    requestId,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  })
}
