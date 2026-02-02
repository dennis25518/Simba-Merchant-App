import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export interface Merchant {
  id?: string
  user_id?: string
  merchant_id: string
  merchant_name: string
  merchant_email: string
  merchant_phone?: string
  merchant_location?: string
  created_at?: string
}

export function useMerchant(userId: string | undefined) {
  const [merchant, setMerchant] = useState<Merchant | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!userId) {
      setLoading(false)
      return
    }

    const fetchMerchant = async () => {
      try {
        setLoading(true)
        const { data, error } = await supabase
          .from('merchants')
          .select('*')
          .eq('user_id', userId)
          .single()

        if (error) {
          console.error('Fetch merchant error:', error)
          throw error
        }
        setMerchant(data as Merchant)
        setError(null)
      } catch (err) {
        console.error('Error fetching merchant:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch merchant')
        setMerchant(null)
      } finally {
        setLoading(false)
      }
    }

    fetchMerchant()
  }, [userId])

  return { merchant, loading, error }
}
