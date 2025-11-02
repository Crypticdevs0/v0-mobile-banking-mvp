"use client"

import { useEffect } from "react"
import logger from '@/lib/logger'
import { createClient } from '@/lib/supabase/client'

export default function SupabaseRealtimeSubscriber({ userId }: { userId: string }) {
  useEffect(() => {
    if (!userId) return
    const supabase = createClient()

    const txChannel = supabase
      .channel(`transactions:user_${userId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'transactions', filter: `user_id=eq.${userId}` }, (payload) => {
        logger.info('Realtime transaction payload:', payload)
      })
      .subscribe()

    const notifChannel = supabase
      .channel(`notifications:user_${userId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications', filter: `user_id=eq.${userId}` }, (payload) => {
        logger.info('Realtime notification payload:', payload)
      })
      .subscribe()

    return () => {
      try {
        supabase.removeChannel(txChannel)
        supabase.removeChannel(notifChannel)
      } catch (e) {
        logger.warn('Failed to remove supabase realtime channels', e)
      }
    }
  }, [userId])

  return null
}
