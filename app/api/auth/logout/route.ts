import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import logger from '@/lib/logger'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: Request) {
  try {
    const headerToken = req.headers.get('x-csrf-token')
    const cookie = cookies().get('csrf-token')
    const cookieToken = cookie?.value

    if (!headerToken || !cookieToken || headerToken !== cookieToken) {
      return NextResponse.json({ error: 'Invalid CSRF token' }, { status: 403 })
    }

    const supabase = await createClient()
    const { error } = await supabase.auth.signOut()

    if (error) {
      logger.warn('Sign out failed', error.message || error)
      // Attempt to delete csrf cookie regardless
      try { cookies().delete('csrf-token') } catch {}
      return NextResponse.json({ error: error.message || 'Sign out failed' }, { status: 500 })
    }

    // Remove CSRF cookie after signing out
    try {
      cookies().delete('csrf-token')
    } catch {}

    return NextResponse.json({ success: true })
  } catch (err: any) {
    logger.error('Logout route error', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
