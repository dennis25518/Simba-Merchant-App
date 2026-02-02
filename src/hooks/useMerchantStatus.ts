import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export interface MerchantStatus {
  is_visible: boolean
  prep_time: number
  auto_print_receipt: boolean
  order_chime_enabled: boolean
  updated_at: string
}

export function useMerchantStatus(merchantId: string | undefined) {
  const [status, setStatus] = useState<MerchantStatus>({
    is_visible: true,
    prep_time: 30,
    auto_print_receipt: false,
    order_chime_enabled: true,
    updated_at: new Date().toISOString(),
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  const fetchStatus = useCallback(async () => {
    if (!merchantId) return

    try {
      setLoading(true)
      const { data, error: fetchError } = await supabase
        .from('merchant_status')
        .select('*')
        .eq('merchant_id', merchantId)
        .single()

      if (fetchError && fetchError.code !== 'PGRST116') {
        // PGRST116 means no rows found, which is OK for first time
        console.error('Error fetching merchant status:', fetchError)
        setError(fetchError.message)
        return
      }

      if (data) {
        setStatus(data)
      } else {
        // Create default status for new merchant
        await createDefaultStatus(merchantId)
      }
    } catch (err) {
      console.error('Error in fetchStatus:', err)
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [merchantId])

  const createDefaultStatus = async (mId: string) => {
    try {
      const defaultStatus: MerchantStatus = {
        is_visible: true,
        prep_time: 30,
        auto_print_receipt: false,
        order_chime_enabled: true,
        updated_at: new Date().toISOString(),
      }

      const { error: insertError } = await supabase.from('merchant_status').insert([
        {
          merchant_id: mId,
          ...defaultStatus,
        },
      ])

      if (insertError) {
        console.error('Error creating default status:', insertError)
      } else {
        setStatus(defaultStatus)
      }
    } catch (err) {
      console.error('Error in createDefaultStatus:', err)
    }
  }

  useEffect(() => {
    fetchStatus()
  }, [fetchStatus])

  useEffect(() => {
    if (!merchantId) return

    // Subscribe to real-time updates on merchant_status table
    const subscription = supabase
      .channel(`merchant_status:${merchantId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'merchant_status',
          filter: `merchant_id=eq.${merchantId}`,
        },
        (payload) => {
          if (payload.new) {
            setStatus(payload.new as MerchantStatus)
          }
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [merchantId])

  const updateStatus = async (updates: Partial<MerchantStatus>) => {
    if (!merchantId) return { success: false, error: 'No merchant ID' }

    try {
      setIsSaving(true)
      setError(null)

      const updatedStatus = {
        ...status,
        ...updates,
        updated_at: new Date().toISOString(),
      }

      const { error: updateError } = await supabase
        .from('merchant_status')
        .update(updatedStatus)
        .eq('merchant_id', merchantId)

      if (updateError) {
        console.error('Error updating merchant status:', updateError)
        setError(updateError.message)
        return { success: false, error: updateError.message }
      }

      setStatus(updatedStatus)

      // Log visibility change for admin tracking
      if (updates.is_visible !== undefined) {
        await supabase.from('merchant_activity_log').insert([
          {
            merchant_id: merchantId,
            action: updates.is_visible ? 'STORE_ONLINE' : 'STORE_OFFLINE',
            details: updates.is_visible ? 'Store went online' : 'Store went offline',
            timestamp: new Date().toISOString(),
          },
        ])
      }

      return { success: true }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error'
      console.error('Error in updateStatus:', err)
      setError(errorMsg)
      return { success: false, error: errorMsg }
    } finally {
      setIsSaving(false)
    }
  }

  const toggleVisibility = async () => {
    return updateStatus({ is_visible: !status.is_visible })
  }

  const updatePrepTime = async (minutes: number) => {
    return updateStatus({ prep_time: minutes })
  }

  const updateAutoprint = async (enabled: boolean) => {
    return updateStatus({ auto_print_receipt: enabled })
  }

  const updateChime = async (enabled: boolean) => {
    return updateStatus({ order_chime_enabled: enabled })
  }

  return {
    status,
    loading,
    error,
    isSaving,
    updateStatus,
    toggleVisibility,
    updatePrepTime,
    updateAutoprint,
    updateChime,
    refetch: fetchStatus,
  }
}
