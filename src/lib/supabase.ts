import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      merchants: {
        Row: {
          id: string
          name: string
          store_name: string
          email: string
          created_at: string
        }
      }
      orders: {
        Row: {
          id: string
          order_id: string
          merchant_id: string
          items: string
          status: 'pending' | 'preparing' | 'ready' | 'delivered'
          payment_method: string
          delivery_type: 'pickup' | 'delivery'
          is_premium: boolean
          created_at: string
        }
      }
    }
  }
}
