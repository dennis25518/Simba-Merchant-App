import { useState } from 'react'
import { supabase } from '../lib/supabase'

export interface PaymentRequest {
  id: string
  merchant_id: string
  merchant_name: string
  amount: number
  status: 'pending' | 'approved' | 'rejected' | 'completed'
  mpesa_phone: string
  request_date: string
  approved_date?: string
  completion_date?: string
  admin_notes?: string
}

export function usePaymentRequest() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const createPaymentRequest = async (
    merchantId: string,
    merchantName: string,
    amount: number,
    mpesaPhone: string
  ): Promise<{ success: boolean; error?: string; requestId?: string }> => {
    setLoading(true)
    setError(null)

    try {
      const { data, error: insertError } = await supabase
        .from('payment_requests')
        .insert([
          {
            merchant_id: merchantId,
            merchant_name: merchantName,
            amount: amount,
            status: 'pending',
            mpesa_phone: mpesaPhone,
            request_date: new Date().toISOString(),
          },
        ])
        .select()

      if (insertError) {
        setError(insertError.message)
        return { success: false, error: insertError.message }
      }

      // Log this action for admin monitoring
      await supabase.from('payment_logs').insert([
        {
          merchant_id: merchantId,
          action: 'WITHDRAWAL_REQUESTED',
          amount: amount,
          details: `M-Pesa withdrawal to ${mpesaPhone}`,
          timestamp: new Date().toISOString(),
        },
      ])

      return { success: true, requestId: data?.[0]?.id }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMsg)
      return { success: false, error: errorMsg }
    } finally {
      setLoading(false)
    }
  }

  const getPaymentRequests = async (merchantId: string): Promise<PaymentRequest[]> => {
    try {
      const { data, error: fetchError } = await supabase
        .from('payment_requests')
        .select('*')
        .eq('merchant_id', merchantId)
        .order('request_date', { ascending: false })

      if (fetchError) {
        setError(fetchError.message)
        return []
      }

      return data || []
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMsg)
      return []
    }
  }

  const subscribeToPaymentStatus = (
    // For future real-time updates implementation
  ): (() => void) => {
    // Real-time subscription placeholder for future implementation
    return () => {
      // Unsubscribe logic
    }
  }

  return {
    loading,
    error,
    createPaymentRequest,
    getPaymentRequests,
    subscribeToPaymentStatus,
  }
}
