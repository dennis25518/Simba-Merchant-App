import { useState, useEffect, useCallback } from 'react'

export interface DailyPerformance {
  date: string
  day: string
  earnings: number
}

export interface PerformanceMetrics {
  daily: DailyPerformance[]
  weeklyTotal: number
  monthlyTotal: number
  dailyAverage: number
}

export function usePerformanceMetrics(merchantId: string, timeRange: 'weekly' | 'monthly' = 'weekly') {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    daily: [],
    weeklyTotal: 0,
    monthlyTotal: 0,
    dailyAverage: 0,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchPerformanceData = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      // For now, use mock data with realistic values
      // In production, fetch from orders table and aggregate by date
      const mockMetrics = generateMockPerformanceData(timeRange)
      setMetrics(mockMetrics)

      // TODO: Replace with actual Supabase query when orders table is properly set up
      // const { data, error: fetchError } = await supabase
      //   .from('orders')
      //   .select('total_amount, created_at')
      //   .eq('merchant_id', merchantId)
      //   .gte('created_at', getDateRange(timeRange).start)
      //   .lte('created_at', getDateRange(timeRange).end)
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMsg)
    } finally {
      setLoading(false)
    }
  }, [timeRange])

  useEffect(() => {
    if (!merchantId) return
    fetchPerformanceData()
  }, [merchantId, fetchPerformanceData])

  return { metrics, loading, error }
}

function generateMockPerformanceData(timeRange: 'weekly' | 'monthly'): PerformanceMetrics {
  const days = timeRange === 'weekly' ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] : 
    Array.from({ length: 30 }, (_, i) => (i + 1).toString())

  const daily: DailyPerformance[] = days.map((day, idx) => {
    const baseEarnings = Math.random() * 500000 + 100000 // 100k - 600k TZS
    const variance = Math.sin(idx * 0.5) * 200000 // Create some pattern variation
    const earnings = Math.round(Math.max(baseEarnings + variance, 50000))

    return {
      date: day,
      day: day,
      earnings: earnings,
    }
  })

  const weeklyTotal = daily.slice(0, 7).reduce((sum, d) => sum + d.earnings, 0)
  const monthlyTotal = daily.reduce((sum, d) => sum + d.earnings, 0)
  const dailyAverage = Math.round(daily.reduce((sum, d) => sum + d.earnings, 0) / daily.length)

  return {
    daily,
    weeklyTotal: timeRange === 'weekly' ? weeklyTotal : 0,
    monthlyTotal: timeRange === 'monthly' ? monthlyTotal : 0,
    dailyAverage,
  }
}

