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

    const body = await req.json()
    const email = String(body?.email || '')
    const password = String(body?.password || '')

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
    }

    const supabase = await createClient()

    const { data, error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      logger.warn('Login failed', error.message || error)
      return NextResponse.json({ error: error.message || 'Login failed' }, { status: 401 })
    }

    // On success, supabase server client will handle setting auth cookies
    return NextResponse.json({ user: data.user ?? null })
  } catch (err: any) {
    logger.error('Login route error', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
