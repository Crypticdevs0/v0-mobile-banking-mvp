import { createClient as createBrowserSupabaseClient } from "@supabase/supabase-js"
import { createClient as createServerSupabaseClient } from "./server"
import { createClient as createBrowserSupabaseClient } from "./client"

// Browser client for client components
export function getBrowserSupabaseClient() {
  return createBrowserSupabaseClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
}

// Server client for server components
export const getServerSupabaseClient = createServerSupabaseClient

// Utility functions for Supabase operations
export const supabaseOperations = {
  // User operations
  async createUserProfile(
    userId: string,
    email: string,
    firstName: string,
    lastName: string,
    fineractClientId: string,
  ) {
    const supabase = await createServerSupabaseClient()
    const { data, error } = await supabase.from("users").insert({
      id: userId,
      email,
      first_name: firstName,
      last_name: lastName,
      fineract_client_id: fineractClientId,
    })

    if (error) throw new Error(`Failed to create user profile: ${error.message}`)
    return data
  },

  async getUserProfile(userId: string) {
    const supabase = await createServerSupabaseClient()
    const { data, error } = await supabase.from("users").select("*").eq("id", userId).single()

    if (error) throw new Error(`Failed to fetch user profile: ${error.message}`)
    return data
  },

  async getUserProfileByEmail(email: string) {
    const supabase = await createServerSupabaseClient()
    const { data, error } = await supabase.from("users").select("*").eq("email", email).single()

    if (error) {
      // Return null if not found to allow calling code to handle missing user
      if (error.code === "PGRST116" || error.message?.includes("No rows found")) return null
      throw new Error(`Failed to fetch user profile by email: ${error.message}`)
    }

    return data
  },

  // Account operations
  async createAccount(userId: string, fineractAccountId: string, balance: number, accountNumber: string) {
    const supabase = await createServerSupabaseClient()
    const { data, error } = await supabase.from("accounts").insert({
      user_id: userId,
      fineract_account_id: fineractAccountId,
      balance,
      account_number: accountNumber,
    })

    if (error) throw new Error(`Failed to create account: ${error.message}`)
    return data
  },

  async updateAccountBalance(accountId: string, balance: number) {
    const supabase = await createServerSupabaseClient()
    const { data, error } = await supabase
      .from("accounts")
      .update({ balance, updated_at: new Date().toISOString() })
      .eq("id", accountId)

    if (error) throw new Error(`Failed to update balance: ${error.message}`)
    return data
  },

  async getAccountByUserId(userId: string) {
    const supabase = await createServerSupabaseClient()
    const { data, error } = await supabase.from("accounts").select("*").eq("user_id", userId).single()

    if (error) throw new Error(`Failed to fetch account: ${error.message}`)
    return data
  },

  // Transaction operations
  async logTransaction(
    senderId: string,
    receiverId: string,
    amount: number,
    description: string,
    fineractTransactionId: string,
  ) {
    const supabase = await createServerSupabaseClient()
    const { data, error } = await supabase.from("transactions").insert({
      sender_id: senderId,
      receiver_id: receiverId,
      amount,
      description,
      fineract_transaction_id: fineractTransactionId,
      status: "completed",
    })

    if (error) throw new Error(`Failed to log transaction: ${error.message}`)
    return data
  },

  async getUserTransactions(userId: string, limit = 20) {
    const supabase = await createServerSupabaseClient()
    const { data, error } = await supabase
      .from("transactions")
      .select("*")
      .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
      .order("created_at", { ascending: false })
      .limit(limit)

    if (error) throw new Error(`Failed to fetch transactions: ${error.message}`)
    return data
  },

  // Notification operations
  async createNotification(
    userId: string,
    title: string,
    message: string,
    notificationType: "info" | "success" | "warning" | "error" = "info",
  ) {
    const supabase = await createServerSupabaseClient()
    const { data, error } = await supabase.from("notifications").insert({
      user_id: userId,
      title,
      message,
      notification_type: notificationType,
    })

    if (error) throw new Error(`Failed to create notification: ${error.message}`)
    return data
  },

  async getUserNotifications(userId: string) {
    const supabase = await createServerSupabaseClient()
    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    if (error) throw new Error(`Failed to fetch notifications: ${error.message}`)
    return data
  },

  async markNotificationRead(notificationId: string) {
    const supabase = await createServerSupabaseClient()
    const { data, error } = await supabase.from("notifications").update({ read: true }).eq("id", notificationId)

    if (error) throw new Error(`Failed to update notification: ${error.message}`)
    return data
  },
}
