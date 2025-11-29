// Fineract API Service - Centralized integration with Fineract sandbox
// Handles all HTTP communication with Fineract API

const FINERACT_URL = process.env.FINERACT_URL || "https://sandbox.mifos.io"
const FINERACT_TENANT = process.env.FINERACT_TENANT || "default"
const FINERACT_USERNAME = process.env.FINERACT_USERNAME || "mifos"
const FINERACT_PASSWORD = process.env.FINERACT_PASSWORD || "password"
const FINERACT_PRODUCT_ID = process.env.FINERACT_PRODUCT_ID || "1"

// Helper function to create Basic Auth header
function getAuthHeader() {
  const credentials = Buffer.from(`${FINERACT_USERNAME}:${FINERACT_PASSWORD}`).toString("base64")
  return `Basic ${credentials}`
}

// Helper function to make Fineract API requests
async function makeFineractRequest(endpoint, method = "GET", body = null) {
  const url = `${FINERACT_URL}/fineract-provider/api/v1${endpoint}?tenantId=${FINERACT_TENANT}`

  const options = {
    method,
    headers: {
      Authorization: getAuthHeader(),
      "Content-Type": "application/json",
    },
  }

  if (body) {
    options.body = JSON.stringify(body)
  }

  try {
    const response = await fetch(url, options)
    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.defaultUserMessage || `Fineract API error: ${response.status}`)
    }

    return data
  } catch (error) {
    console.error(`Fineract request failed: ${endpoint}`, error)
    throw error
  }
}

// Client operations
export const fineractService = {
  // Create a new client in Fineract
  createClient: async (firstName, lastName, email, mobileNo = "1234567890") => {
    const payload = {
      firstname: firstName,
      lastname: lastName,
      email,
      mobileNo,
      dateFormat: "dd MMMM yyyy",
      locale: "en",
      active: true,
      activationDate: new Date().toISOString().split("T")[0],
    }

    const result = await makeFineractRequest("/clients", "POST", payload)
    return result
  },

  // Get client details
  getClient: async (clientId) => {
    const result = await makeFineractRequest(`/clients/${clientId}`)
    return result
  },

  // Create savings account for a client
  createSavingsAccount: async (clientId, productId = FINERACT_PRODUCT_ID) => {
    const payload = {
      clientId: Number(clientId),
      productId: Number(productId),
      dateFormat: "dd MMMM yyyy",
      locale: "en",
      submittedOnDate: new Date().toISOString().split("T")[0],
    }

    const result = await makeFineractRequest("/savingsaccounts", "POST", payload)
    return result
  },

  // Get account details including balance
  getAccount: async (accountId) => {
    const result = await makeFineractRequest(`/savingsaccounts/${accountId}`)
    return result
  },

  // Deposit funds to account
  depositToAccount: async (accountId, amount, transactionDate = new Date().toISOString().split("T")[0]) => {
    const payload = {
      transactionDate,
      transactionAmount: amount,
      dateFormat: "dd MMMM yyyy",
      locale: "en",
    }

    const result = await makeFineractRequest(
      `/savingsaccounts/${accountId}/transactions?command=deposit`,
      "POST",
      payload,
    )
    return result
  },

  // Withdraw funds from account
  withdrawFromAccount: async (accountId, amount, transactionDate = new Date().toISOString().split("T")[0]) => {
    const payload = {
      transactionDate,
      transactionAmount: amount,
      dateFormat: "dd MMMM yyyy",
      locale: "en",
    }

    const result = await makeFineractRequest(
      `/savingsaccounts/${accountId}/transactions?command=withdrawal`,
      "POST",
      payload,
    )
    return result
  },

  // Get account transactions
  getAccountTransactions: async (accountId) => {
    const result = await makeFineractRequest(`/savingsaccounts/${accountId}/transactions`)
    return result
  },

  // Get account balance
  getAccountBalance: async (accountId) => {
    try {
      const account = await makeFineractRequest(`/savingsaccounts/${accountId}`)
      return {
        accountId,
        balance: account.accountBalance || 0,
        accountNumber: account.accountNo || "N/A",
        currency: account.currency?.code || "USD",
      }
    } catch (error) {
      console.error("Error fetching balance:", error)
      throw error
    }
  },

  // Transfer funds between accounts (via withdrawal + deposit)
  transferFunds: async (fromAccountId, toAccountId, amount) => {
    try {
      // Withdraw from sender
      await makeFineractRequest(`/savingsaccounts/${fromAccountId}/transactions?command=withdrawal`, "POST", {
        transactionDate: new Date().toISOString().split("T")[0],
        transactionAmount: amount,
        dateFormat: "dd MMMM yyyy",
        locale: "en",
      })

      // Deposit to recipient
      const depositResult = await makeFineractRequest(
        `/savingsaccounts/${toAccountId}/transactions?command=deposit`,
        "POST",
        {
          transactionDate: new Date().toISOString().split("T")[0],
          transactionAmount: amount,
          dateFormat: "dd MMMM yyyy",
          locale: "en",
        },
      )

      return {
        success: true,
        fromAccountId,
        toAccountId,
        amount,
        transactionId: depositResult.resourceId,
      }
    } catch (error) {
      console.error("Transfer failed:", error)
      throw error
    }
  },

  login: async (username, password) => {
    if (!username || !password) {
      throw new Error("Username and password are required")
    }

    const result = await makeFineractRequest(
      `/authentication`,
      "POST",
      { username, password }
    )

    // Validate response structure
    if (!result.userId || !result.username) {
      throw new Error("Invalid Fineract response: missing required fields")
    }

    return result
  }
}
