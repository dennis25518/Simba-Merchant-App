import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export interface InventoryItem {
  id: string
  merchant_id: string
  product_id: string
  product_name: string
  current_stock: number
  minimum_stock: number
  maximum_stock: number
  status: 'good' | 'warning' | 'danger'
  last_updated: string
}

export function useInventory(merchantId?: string) {
  const [inventory, setInventory] = useState<InventoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!merchantId) {
      setLoading(false)
      return
    }

    fetchInventory(merchantId)
  }, [merchantId])

  const fetchInventory = async (id: string) => {
    try {
      setLoading(true)
      setError(null)

      const { data, error: err } = await supabase
        .from('merchant_inventory')
        .select('*')
        .eq('merchant_id', id)
        .order('product_name', { ascending: true })

      if (err) throw err

      setInventory(data || [])
    } catch (err) {
      console.error('Error fetching inventory:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch inventory')
    } finally {
      setLoading(false)
    }
  }

  return { inventory, loading, error }
}

export async function updateInventoryItem(item: InventoryItem) {
  try {
    // Calculate status based on stock level
    let status: 'good' | 'warning' | 'danger' = 'good'
    const stockPercentage = (item.current_stock / item.maximum_stock) * 100

    if (stockPercentage <= 25) {
      status = 'danger'
    } else if (stockPercentage <= 50) {
      status = 'warning'
    } else {
      status = 'good'
    }

    const { error } = await supabase
      .from('merchant_inventory')
      .upsert(
        {
          id: item.id,
          merchant_id: item.merchant_id,
          product_id: item.product_id,
          product_name: item.product_name,
          current_stock: item.current_stock,
          minimum_stock: item.minimum_stock,
          maximum_stock: item.maximum_stock,
          status: status,
          last_updated: new Date().toISOString(),
        },
        { onConflict: 'id' }
      )

    if (error) throw error

    // Silently track this activity for admin monitoring
    await trackInventoryChange(item.merchant_id, item.product_name, status)

    return { success: true }
  } catch (err) {
    console.error('Error updating inventory:', err)
    return { success: false, error: err instanceof Error ? err.message : 'Failed to update' }
  }
}

async function trackInventoryChange(
  merchantId: string,
  productName: string,
  status: 'good' | 'warning' | 'danger'
) {
  try {
    // Silently send inventory update to admin tracking table
    await supabase.from('merchant_performance_log').insert({
      merchant_id: merchantId,
      event_type: 'inventory_update',
      event_details: `${productName} - Status: ${status}`,
      timestamp: new Date().toISOString(),
    })
  } catch (err) {
    console.error('Silent tracking error (non-critical):', err)
  }
}

export async function createInventoryItem(merchantId: string, productName: string) {
  try {
    const newItem: InventoryItem = {
      id: `inv_${Date.now()}`,
      merchant_id: merchantId,
      product_id: `PROD${Date.now()}`,
      product_name: productName,
      current_stock: 0,
      minimum_stock: 10,
      maximum_stock: 100,
      status: 'danger',
      last_updated: new Date().toISOString(),
    }

    const result = await updateInventoryItem(newItem)
    return result
  } catch (err) {
    console.error('Error creating inventory item:', err)
    return { success: false, error: err instanceof Error ? err.message : 'Failed to create' }
  }
}
