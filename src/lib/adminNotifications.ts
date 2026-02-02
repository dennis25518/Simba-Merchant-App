import { supabase } from '../lib/supabase'

export interface SendNotificationPayload {
  merchantId: string
  title: string
  message: string
  type: 'message' | 'offer' | 'update' | 'alert'
  adminId?: string
}

/**
 * Admin utility to send notifications to merchants
 * This would typically be called from an admin dashboard
 */
export async function sendMerchantNotification(payload: SendNotificationPayload) {
  try {
    const { error } = await supabase.from('notifications').insert([
      {
        merchant_id: payload.merchantId,
        title: payload.title,
        message: payload.message,
        type: payload.type,
        is_read: false,
        admin_id: payload.adminId,
        created_at: new Date().toISOString(),
      },
    ])

    if (error) {
      console.error('Error sending notification:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (err) {
    console.error('Error in sendMerchantNotification:', err)
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' }
  }
}

/**
 * Send broadcast notification to all merchants
 */
export async function broadcastNotification(payload: Omit<SendNotificationPayload, 'merchantId'>) {
  try {
    // Get all merchant IDs first
    const { data: merchants, error: fetchError } = await supabase
      .from('merchants')
      .select('merchant_id')

    if (fetchError) {
      console.error('Error fetching merchants:', fetchError)
      return { success: false, error: fetchError.message }
    }

    if (!merchants || merchants.length === 0) {
      return { success: false, error: 'No merchants found' }
    }

    // Send notification to all merchants
    const notifications = merchants.map((merchant) => ({
      merchant_id: merchant.merchant_id,
      title: payload.title,
      message: payload.message,
      type: payload.type,
      is_read: false,
      admin_id: payload.adminId,
      created_at: new Date().toISOString(),
    }))

    const { error: insertError } = await supabase.from('notifications').insert(notifications)

    if (insertError) {
      console.error('Error broadcasting notification:', insertError)
      return { success: false, error: insertError.message }
    }

    return { success: true, merchantsNotified: merchants.length }
  } catch (err) {
    console.error('Error in broadcastNotification:', err)
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' }
  }
}

/**
 * Send offer notification to specific merchants
 */
export async function sendOfferToMerchants(merchantIds: string[], offer: { title: string; description: string; expiresAt?: string; adminId?: string }) {
  try {
    const notifications = merchantIds.map((merchantId) => ({
      merchant_id: merchantId,
      title: offer.title,
      message: offer.description,
      type: 'offer' as const,
      is_read: false,
      admin_id: offer.adminId,
      created_at: new Date().toISOString(),
    }))

    const { error } = await supabase.from('notifications').insert(notifications)

    if (error) {
      console.error('Error sending offers:', error)
      return { success: false, error: error.message }
    }

    return { success: true, merchantsNotified: merchantIds.length }
  } catch (err) {
    console.error('Error in sendOfferToMerchants:', err)
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' }
  }
}
