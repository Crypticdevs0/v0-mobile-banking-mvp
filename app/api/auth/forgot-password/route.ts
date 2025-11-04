import { NextResponse } from "next/server"
import logger from '@/lib/logger'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: Request) {
  try {
    const { email } = await req.json()
    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    const supabase = await createClient()

    // Determine redirect URL for password reset email. Use env or default to localhost.
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_VERCEL_URL || `http://localhost:3000`
    const redirectTo = `${baseUrl.replace(/\/$/, '')}/auth/reset-password`

    // Use Supabase to send a password reset email (handled by Supabase SMTP/email provider).
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo })

    if (error) {
      logger.warn('Forgot-password email send failed', error.message || error)
      // Don't reveal whether the email exists — return success message to avoid enumeration
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ success: true, data })
  } catch (err: any) {
    logger.error('Forgot-password route error', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
