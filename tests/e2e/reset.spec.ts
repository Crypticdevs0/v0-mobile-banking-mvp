import { test, expect } from '@playwright/test'
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set for e2e tests')
}

const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

function randomEmail() {
  return `test+${crypto.randomBytes(6).toString('hex')}@example.com`
}

test.describe('Password reset flow', () => {
  test('full reset -> login -> dashboard', async ({ page }) => {
    const email = randomEmail()
    const originalPassword = 'OrigPass1'
    const newPassword = 'NewPass1'

    // Create user via admin API
    const create = await admin.auth.admin.createUser({ email, password: originalPassword })
    expect(create.error).toBeNull()

    // Sign in to get session tokens
    const signIn = await admin.auth.signInWithPassword({ email, password: originalPassword })
    expect(signIn.error).toBeNull()
    const access_token = signIn.data.session?.access_token
    const refresh_token = signIn.data.session?.refresh_token
    expect(access_token).toBeTruthy()

    // Navigate to reset page with tokens in hash
    const url = `${APP_URL}/auth/reset-password#access_token=${encodeURIComponent(access_token!)}&refresh_token=${encodeURIComponent(refresh_token!)}`
    await page.goto(url)

    // Wait for form to appear
    await expect(page.locator('text=New password')).toBeVisible()

    await page.fill('input[type="password"]', newPassword)
    // second input
    const inputs = page.locator('input[type="password"]')
    await inputs.nth(1).fill(newPassword)

    await page.click('button:has-text("Update Password")')

    // After success, should redirect to /auth/login
    await page.waitForURL('**/auth/login', { timeout: 10000 })

    // Now login with new password
    await page.goto(`${APP_URL}/auth/login`)
    await page.fill('input[type="email"]', email)
    await page.fill('input[type="password"]', newPassword)

    // Obtain CSRF token
    const csrfRes = await page.request.get(`${APP_URL}/api/csrf-token`)
    const csrfData = await csrfRes.json()

    // Post login via fetch to server route
    const loginRes = await page.request.post(`${APP_URL}/api/auth/login`, {
      headers: { 'Content-Type': 'application/json', 'x-csrf-token': csrfData.csrfToken },
      data: { email, password: newPassword },
    })
    expect(loginRes.ok()).toBeTruthy()

    // Visit dashboard and ensure user content loads (calls /api/auth/me)
    await page.goto(`${APP_URL}/dashboard`)
    await expect(page.locator('text=Dashboard')).toBeVisible({ timeout: 10000 })
  })

  test('expired/invalid token shows error', async ({ page }) => {
    const url = `${APP_URL}/auth/reset-password#access_token=invalid&refresh_token=invalid`
    await page.goto(url)
    await expect(page.locator('text=Invalid or expired reset link')).toBeVisible({ timeout: 5000 })
  })
})
