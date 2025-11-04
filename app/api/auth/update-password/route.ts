import { NextResponse } from 'next/server'
import logger from '@/lib/logger'
import { createClient } from '@/lib/supabase/server'

function validatePassword(password: unknown) {
  if (typeof password !== 'string') return 'Password is required.'
  if (password.length < 8) return 'Password must be at least 8 characters.'
  // require at least one lowercase, one uppercase, one digit
  if (!/[a-z]/.test(password) || !/[A-Z]/.test(password) || !/\d/.test(password)) {
    return 'Password must include uppercase, lowercase letters and a number.'
  }
  return null
}

function friendlyMessageFromSupabase(err: any) {
  const msg = String(err?.message || err || '')
  if (!msg) return 'An unknown error occurred.'
  if (/password/i.test(msg) && /length|at least/i.test(msg)) return 'Password does not meet length requirements.'
  if (/invalid session|session expired|not authenticated/i.test(msg)) return 'Session expired. Please request a new reset link.'
  // fallback
  return msg
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const password = body?.password

    const validationError = validatePassword(password)
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 })
    }

    const supabase = await createClient()
    const { error, data } = await supabase.auth.updateUser({ password })

    if (error) {
      const friendly = friendlyMessageFromSupabase(error)
      logger.warn('Update password failed', error.message || error)
      return NextResponse.json({ error: friendly }, { status: 400 })
    }

    return NextResponse.json({ success: true, data })
  } catch (err: any) {
    logger.error('Update-password route error', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
