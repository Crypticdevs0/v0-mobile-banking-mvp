// Socket.io Event Service - Manages real-time communication
// Handles balance updates, transfer notifications, and user subscriptions

export class SocketService {
  constructor(io) {
    this.io = io
    this.userSockets = new Map() // Track userId -> socketIds
  }

  // Register a user connection
  registerUser(socketId, userId) {
    if (!this.userSockets.has(userId)) {
      this.userSockets.set(userId, [])
    }
    const sockets = this.userSockets.get(userId)
    if (!sockets.includes(socketId)) {
      sockets.push(socketId)
    }
    console.log(`[Socket] User ${userId} connected with socket ${socketId}`)
  }

  // Unregister a user connection
  unregisterUser(socketId, userId) {
    if (this.userSockets.has(userId)) {
      const sockets = this.userSockets.get(userId)
      const index = sockets.indexOf(socketId)
      if (index > -1) {
        sockets.splice(index, 1)
      }
      if (sockets.length === 0) {
        this.userSockets.delete(userId)
      }
    }
    console.log(`[Socket] User ${userId} disconnected`)
  }

  // Check if user is online
  isUserOnline(userId) {
    return this.userSockets.has(userId) && this.userSockets.get(userId).length > 0
  }

  // Emit balance update to a specific user
  emitBalanceUpdate(userId, balance, accountId) {
    this.io.to(`balance:${userId}`).emit("balance:updated", {
      userId,
      accountId,
      balance,
      timestamp: new Date(),
    })
    console.log(`[Socket] Balance updated for user ${userId}: ${balance}`)
  }

  // Emit transfer completion to sender
  emitTransferSent(userId, transfer) {
    this.io.to(`notifications:${userId}`).emit("transfer:sent", {
      ...transfer,
      type: "sent",
      timestamp: new Date(),
    })
    console.log(`[Socket] Transfer sent notification to user ${userId}`)
  }

  // Emit transfer received to recipient
  emitTransferReceived(userId, transfer) {
    this.io.to(`notifications:${userId}`).emit("transfer:received", {
      ...transfer,
      type: "received",
      timestamp: new Date(),
    })
    console.log(`[Socket] Transfer received notification to user ${userId}`)
  }

  // Emit account activity notification
  emitActivityNotification(userId, activity) {
    this.io.to(`notifications:${userId}`).emit("activity:new", {
      ...activity,
      timestamp: new Date(),
    })
  }

  // Broadcast to all connected clients (admin/announcements)
  broadcastToAll(event, data) {
    this.io.emit(event, {
      ...data,
      timestamp: new Date(),
    })
  }

  // Get number of connected users
  getConnectedUsersCount() {
    return this.userSockets.size
  }
}
