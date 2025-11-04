import { NextResponse } from "next/server"
import logger from '@/lib/logger'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()

    const { data: userData, error: userError } = await supabase.auth.getUser()
    if (userError) {
      logger.warn('Auth getUser error', userError.message || userError)
      return NextResponse.json({ user: null }, { status: 401 })
    }

    const user = userData?.user ?? null
    if (!user) return NextResponse.json({ user: null }, { status: 401 })

    // Try to fetch a profile row if the table exists
    try {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profileError) {
        // If the profiles table doesn't exist or other error, just ignore and return user
        logger.info('Profile fetch skipped or failed', profileError.message || profileError)
        return NextResponse.json({ user: { ...user, profile: null } })
      }

      return NextResponse.json({ user: { ...user, profile } })
    } catch (err) {
      // Fallback: return user without profile
      return NextResponse.json({ user })
    }
  } catch (err: any) {
    logger.error('Auth me route error', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
