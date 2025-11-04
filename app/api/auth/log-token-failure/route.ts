import { NextResponse } from 'next/server'
import logger from '@/lib/logger'
import { incrementTokenFailure } from '@/lib/auth-metrics'

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}))
    const reason = body?.reason || req.headers.get('x-error') || 'unknown'
    incrementTokenFailure(reason)
    logger.warn('Token exchange failed', { reason })
    return NextResponse.json({ success: true })
  } catch (err: any) {
    logger.error('Log token failure error', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
