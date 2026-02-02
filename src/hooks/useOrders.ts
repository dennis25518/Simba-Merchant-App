import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export interface OrderItem {
  product_id: string
  product_name: string
  quantity: number
}

export interface Order {
  id: string
  order_id: string
  merchant_id: string
  customer_name: string
  customer_phone: string
  status: 'pending' | 'preparing' | 'ready' | 'delivered' | 'cancelled'
  total_amount: number
  created_at: string
  updated_at?: string
  items: OrderItem[]
}

export function useOrders(merchantId: string | undefined, status?: string) {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!merchantId) {
      setLoading(false)
      return
    }

    const fetchOrders = async () => {
      try {
        setLoading(true)
        let query = supabase
          .from('orders')
          .select('*')
          .eq('merchant_id', merchantId)
          .order('created_at', { ascending: false })

        if (status) {
          query = query.eq('status', status)
        }

        const { data: ordersData, error } = await query

        if (error) {
          console.error('Fetch orders error:', error)
          throw error
        }

        if (!ordersData || ordersData.length === 0) {
          setOrders([])
          setError(null)
          return
        }

        // Fetch order items for all orders
        const orderIds = ordersData.map((o) => o.id)
        const { data: itemsData, error: itemsError } = await supabase
          .from('order_items')
          .select('*')
          .in('order_id', orderIds)

        if (itemsError) {
          console.error('Fetch order items error:', itemsError)
          throw itemsError
        }

        // Create lookup map for order items
        const itemsMap = new Map<string, any[]>()
        itemsData?.forEach((item) => {
          if (!itemsMap.has(item.order_id)) {
            itemsMap.set(item.order_id, [])
          }
          itemsMap.get(item.order_id)!.push(item)
        })

        // Combine orders with their items
        const combinedOrders: Order[] = ordersData.map((order) => ({
          id: order.id,
          order_id: order.order_id,
          merchant_id: order.merchant_id,
          customer_name: order.customer_name || 'Customer',
          customer_phone: order.customer_phone || '',
          status: order.status,
          total_amount: order.total_amount || 0,
          created_at: order.created_at,
          updated_at: order.updated_at,
          items: (itemsMap.get(order.id) || []).map((item) => ({
            product_id: item.product_id,
            product_name: item.product_name || `Product ${item.product_id}`,
            quantity: item.quantity || 0,
          })),
        }))

        setOrders(combinedOrders)
        setError(null)
      } catch (err) {
        console.error('Error fetching orders:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch orders')
        setOrders([])
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()

    // Subscribe to real-time updates
    const subscription = supabase
      .channel(`orders-${merchantId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
          filter: `merchant_id=eq.${merchantId}`,
        },
        () => {
          fetchOrders()
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [merchantId, status])

  return { orders, loading, error }
}

// Utility function to update order status
export async function updateOrderStatus(orderId: string, newStatus: 'pending' | 'preparing' | 'ready' | 'delivered' | 'cancelled') {
  try {
    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', orderId)

    if (error) {
      console.error('Update order error:', error)
      throw error
    }
    return { success: true }
  } catch (err) {
    console.error('Error updating order:', err)
    return { success: false, error: err instanceof Error ? err.message : 'Failed to update order' }
  }
}
