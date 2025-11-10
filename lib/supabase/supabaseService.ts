// Supabase-free implementation of server-side operations.
// When running in Node (backend), this module persists data to a JSON file inside the project root.
// When running in the browser, it falls back to using localStorage (compatible with the client stub).

import fs from "fs"
import path from "path"

const DATA_FILE = path.join(process.cwd(), "supabase_data.json")

function ensureDataFile() {
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(
      DATA_FILE,
      JSON.stringify({ users: [], accounts: [], transactions: [], notifications: [] }, null, 2),
    )
  }
}

function readData() {
  ensureDataFile()
  const raw = fs.readFileSync(DATA_FILE, "utf-8")
  return JSON.parse(raw)
}

function writeData(data: any) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2))
}

function generateId(prefix = "id") {
  return `${prefix}_${Date.now()}_${Math.floor(Math.random() * 10000)}`
}

// Helper: server-side implementations
const serverOps = {
  async createUserProfile(userId: string, email: string, firstName: string, lastName: string, fineractClientId: string) {
    const data = readData()
    const user = { id: userId, email, first_name: firstName, last_name: lastName, fineract_client_id: fineractClientId }
    data.users.push(user)
    writeData(data)
    return user
  },

  async getUserProfile(userId: string) {
    const data = readData()
    const user = data.users.find((u: any) => u.id === userId)
    if (!user) throw new Error("User not found")
    return user
  },

  async createAccount(userId: string, fineractAccountId: string, balance: number, accountNumber: string) {
    const data = readData()
    const account = { id: generateId("acct"), user_id: userId, fineract_account_id: fineractAccountId, balance, account_number: accountNumber }
    data.accounts.push(account)
    writeData(data)
    return account
  },

  async updateAccountBalance(accountId: string, balance: number) {
    const data = readData()
    const acct = data.accounts.find((a: any) => a.id === accountId)
    if (!acct) throw new Error("Account not found")
    acct.balance = balance
    acct.updated_at = new Date().toISOString()
    writeData(data)
    return acct
  },

  async getAccountByUserId(userId: string) {
    const data = readData()
    const acct = data.accounts.find((a: any) => a.user_id === userId)
    if (!acct) throw new Error("Account not found")
    return acct
  },

  async logTransaction(senderId: string, receiverId: string, amount: number, description: string, fineractTransactionId: string) {
    const data = readData()
    const tx = {
      id: generateId("tx"),
      sender_id: senderId,
      receiver_id: receiverId,
      amount,
      description,
      fineract_transaction_id: fineractTransactionId,
      status: "completed",
      created_at: new Date().toISOString(),
    }
    data.transactions.push(tx)
    writeData(data)
    return tx
  },

  async getUserTransactions(userId: string, limit = 20) {
    const data = readData()
    const tx = data.transactions.filter((t: any) => t.sender_id === userId || t.receiver_id === userId)
    tx.sort((a: any, b: any) => (a.created_at < b.created_at ? 1 : -1))
    return tx.slice(0, limit)
  },

  async createNotification(userId: string, title: string, message: string, notificationType: string = "info") {
    const data = readData()
    const n = { id: generateId("notif"), user_id: userId, title, message, notification_type: notificationType, read: false, created_at: new Date().toISOString() }
    data.notifications.push(n)
    writeData(data)
    return n
  },

  async getUserNotifications(userId: string) {
    const data = readData()
    const notifs = data.notifications.filter((n: any) => n.user_id === userId)
    notifs.sort((a: any, b: any) => (a.created_at < b.created_at ? 1 : -1))
    return notifs
  },

  async markNotificationRead(notificationId: string) {
    const data = readData()
    const n = data.notifications.find((x: any) => x.id === notificationId)
    if (!n) throw new Error("Notification not found")
    n.read = true
    writeData(data)
    return n
  },
}

// When imported in the browser (client-side), rely on localStorage-based functions to mirror the earlier client stub.
const clientOps = {
  async createUserProfile(userId: string, email: string, firstName: string, lastName: string, fineractClientId: string) {
    try {
      const raw = localStorage.getItem("db_users")
      const users = raw ? JSON.parse(raw) : []
      const user = { id: userId, email, first_name: firstName, last_name: lastName, fineract_client_id: fineractClientId }
      users.push(user)
      localStorage.setItem("db_users", JSON.stringify(users))
      return user
    } catch (e) {
      throw e
    }
  },
  async getUserProfile(userId: string) {
    const raw = localStorage.getItem("db_users")
    const users = raw ? JSON.parse(raw) : []
    const user = users.find((u: any) => u.id === userId)
    if (!user) throw new Error("User not found")
    return user
  },
  async createAccount(userId: string, fineractAccountId: string, balance: number, accountNumber: string) {
    const raw = localStorage.getItem("db_accounts")
    const accounts = raw ? JSON.parse(raw) : []
    const acct = { id: generateId("acct"), user_id: userId, fineract_account_id: fineractAccountId, balance, account_number: accountNumber }
    accounts.push(acct)
    localStorage.setItem("db_accounts", JSON.stringify(accounts))
    return acct
  },
  async updateAccountBalance(accountId: string, balance: number) {
    const raw = localStorage.getItem("db_accounts")
    const accounts = raw ? JSON.parse(raw) : []
    const acct = accounts.find((a: any) => a.id === accountId)
    if (!acct) throw new Error("Account not found")
    acct.balance = balance
    acct.updated_at = new Date().toISOString()
    localStorage.setItem("db_accounts", JSON.stringify(accounts))
    return acct
  },
  async getAccountByUserId(userId: string) {
    const raw = localStorage.getItem("db_accounts")
    const accounts = raw ? JSON.parse(raw) : []
    const acct = accounts.find((a: any) => a.user_id === userId)
    if (!acct) throw new Error("Account not found")
    return acct
  },
  async logTransaction(senderId: string, receiverId: string, amount: number, description: string, fineractTransactionId: string) {
    const raw = localStorage.getItem("db_transactions")
    const transactions = raw ? JSON.parse(raw) : []
    const tx = { id: generateId("tx"), sender_id: senderId, receiver_id: receiverId, amount, description, fineract_transaction_id: fineractTransactionId, status: "completed", created_at: new Date().toISOString() }
    transactions.push(tx)
    localStorage.setItem("db_transactions", JSON.stringify(transactions))
    return tx
  },
  async getUserTransactions(userId: string, limit = 20) {
    const raw = localStorage.getItem("db_transactions")
    const transactions = raw ? JSON.parse(raw) : []
    const tx = transactions.filter((t: any) => t.sender_id === userId || t.receiver_id === userId)
    tx.sort((a: any, b: any) => (a.created_at < b.created_at ? 1 : -1))
    return tx.slice(0, limit)
  },
  async createNotification(userId: string, title: string, message: string, notificationType: string = "info") {
    const raw = localStorage.getItem("db_notifications")
    const notifications = raw ? JSON.parse(raw) : []
    const n = { id: generateId("notif"), user_id: userId, title, message, notification_type: notificationType, read: false, created_at: new Date().toISOString() }
    notifications.push(n)
    localStorage.setItem("db_notifications", JSON.stringify(notifications))
    return n
  },
  async getUserNotifications(userId: string) {
    const raw = localStorage.getItem("db_notifications")
    const notifications = raw ? JSON.parse(raw) : []
    const notifs = notifications.filter((n: any) => n.user_id === userId)
    notifs.sort((a: any, b: any) => (a.created_at < b.created_at ? 1 : -1))
    return notifs
  },
  async markNotificationRead(notificationId: string) {
    const raw = localStorage.getItem("db_notifications")
    const notifications = raw ? JSON.parse(raw) : []
    const n = notifications.find((x: any) => x.id === notificationId)
    if (!n) throw new Error("Notification not found")
    n.read = true
    localStorage.setItem("db_notifications", JSON.stringify(notifications))
    return n
  },
}

export const supabaseOperations = typeof window === "undefined" ? serverOps : (clientOps as any)

export function getBrowserSupabaseClient() {
  // Not used anymore; return null to indicate no external Supabase client
  return null as any
}

export const getServerSupabaseClient = async () => {
  throw new Error("Supabase server client is disabled. This project has been converted to use local storage/file-backed operations.")
}
