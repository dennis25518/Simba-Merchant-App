import { useEffect, useState, useCallback, useRef } from 'react'
import { Bell, LogOut, X, Trash2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useNotifications } from '../hooks/useNotifications'
import { useMerchantStatus } from '../hooks/useMerchantStatus'

interface HeaderProps {
  merchantName?: string
  merchantId?: string
  isOpen?: boolean
}

export function Header({ merchantName = 'Mais Suppliers', merchantId = 'MERCH001' }: HeaderProps) {
  const navigate = useNavigate()
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification, getNotificationIcon } =
    useNotifications(merchantId)
  const { status: merchantStatus } = useMerchantStatus(merchantId)
  const [showNotifications, setShowNotifications] = useState(false)
  const notificationRef = useRef<HTMLDivElement>(null)
  const [todayRevenue, setTodayRevenue] = useState(0)
  const [loading, setLoading] = useState(true)
  const [completedOrderIds, setCompletedOrderIds] = useState<Set<string>>(new Set())

  const isOrderFromToday = useCallback((createdAt: string): boolean => {
    const orderDate = new Date(createdAt)
    const today = new Date()
    
    return (
      orderDate.getFullYear() === today.getFullYear() &&
      orderDate.getMonth() === today.getMonth() &&
      orderDate.getDate() === today.getDate()
    )
  }, [])

  // Close notification dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false)
      }
    }

    if (showNotifications) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showNotifications])

  const fetchTodayRevenue = useCallback(async () => {
    try {
      setLoading(true)
      
      // Get today's date range
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)

      // Fetch fulfilled orders from today
      const { data: orders, error } = await supabase
        .from('orders')
        .select('id, total_amount')
        .eq('merchant_id', merchantId)
        .in('status', ['ready', 'delivered'])
        .gte('created_at', today.toISOString())
        .lt('created_at', tomorrow.toISOString())

      if (error) {
        console.error('Error fetching today revenue:', error)
        setTodayRevenue(0)
      } else {
        const total = (orders || []).reduce((sum, order) => sum + (order.total_amount || 0), 0)
        setTodayRevenue(total)
        
        // Track which orders we've already counted
        const orderIds = new Set((orders || []).map((o) => o.id))
        setCompletedOrderIds(orderIds)
      }
    } catch (err) {
      console.error('Error calculating today revenue:', err)
      setTodayRevenue(0)
    } finally {
      setLoading(false)
    }
  }, [merchantId])

  useEffect(() => {
    fetchTodayRevenue()
  }, [fetchTodayRevenue])

  useEffect(() => {
    if (!merchantId) return

    // Listen to order updates in real-time
    const subscription = supabase
      .channel(`orders:${merchantId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `merchant_id=eq.${merchantId}`,
        },
        (payload) => {
          const order = payload.new
          const oldOrder = payload.old
          
          // Check if this is a NEW completion (status changed TO ready/delivered)
          const wasNotCompleted = oldOrder?.status && 
            oldOrder.status !== 'ready' && 
            oldOrder.status !== 'delivered'
          const isNowCompleted = order?.status === 'ready' || order?.status === 'delivered'
          const isToday = isOrderFromToday(order?.created_at)
          const notAlreadyCounted = !completedOrderIds.has(order?.id)
          
          if (wasNotCompleted && isNowCompleted && isToday && notAlreadyCounted) {
            // Add this order's amount to revenue
            const amount = order?.total_amount || 0
            setTodayRevenue((prev) => prev + amount)
            setCompletedOrderIds((prev) => new Set([...prev, order.id]))
            console.log(`✓ Order ${order.order_id} completed! Added TZS ${amount}`)
          }
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [merchantId, completedOrderIds, isOrderFromToday])

  const formatCurrency = (amount: number): string => {
    if (amount < 10000) {
      return `TZS ${Math.floor(amount).toLocaleString()}`
    } else if (amount < 1000000) {
      return `TZS ${(amount / 1000).toFixed(0)}k`
    } else {
      return `TZS ${(amount / 1000000).toFixed(1)}M`
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/login', { replace: true })
  }

  const handleRevenueClick = () => {
    navigate('/payouts')
  }

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-8 flex justify-between items-center sticky top-0 z-10">
      <div className="flex items-center gap-4 flex-col">
        <div className="flex items-center gap-2">
          <h2 className="font-bold text-slate-800 text-2xl">Welcome back, {merchantName}</h2>
          <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold ${merchantStatus.is_visible ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            <span className={`w-2 h-2 rounded-full animate-pulse ${merchantStatus.is_visible ? 'bg-green-500' : 'bg-red-500'}`}></span>
            {merchantStatus.is_visible ? 'Online' : 'Offline'}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-6">
        <div className="relative" ref={notificationRef}>
          <button
            onClick={() => {
              setShowNotifications(!showNotifications)
              if (!showNotifications && unreadCount > 0) {
                markAllAsRead()
              }
            }}
            className="relative text-slate-500 hover:text-slate-700 transition"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute -top-2 -right-2 w-4 h-4 bg-red-500 rounded-full text-white text-[9px] font-bold flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 max-h-96 overflow-hidden flex flex-col">
              {/* Header */}
              <div className="bg-gradient-to-r from-red-600 to-red-700 px-6 py-4 flex items-center justify-between">
                <h3 className="text-white font-bold text-sm">Messages & Updates</h3>
                <button
                  onClick={() => setShowNotifications(false)}
                  className="text-white hover:bg-red-600 p-1 rounded-lg transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Notifications List */}
              <div className="overflow-y-auto flex-1">
                {notifications.length === 0 ? (
                  <div className="px-6 py-12 text-center">
                    <Bell className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                    <p className="text-slate-500 font-semibold text-sm">No new message</p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`px-6 py-4 hover:bg-slate-50 transition cursor-pointer group ${
                          !notification.is_read ? 'bg-blue-50' : ''
                        }`}
                        onClick={() => markAsRead(notification.id)}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-lg">{getNotificationIcon(notification.type)}</span>
                              <h4 className="font-bold text-slate-900 text-sm">{notification.title}</h4>
                              {!notification.is_read && (
                                <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                              )}
                            </div>
                            <p className="text-slate-600 text-xs leading-relaxed">{notification.message}</p>
                            <p className="text-[10px] text-slate-400 mt-2">
                              {new Date(notification.created_at).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </p>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              deleteNotification(notification.id)
                            }}
                            className="text-slate-300 hover:text-red-600 transition opacity-0 group-hover:opacity-100"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        <div className="h-8 w-px bg-slate-200"></div>
        <button
          onClick={handleRevenueClick}
          className="text-right hover:opacity-75 transition cursor-pointer group"
        >
          <p className="text-xs font-bold text-slate-900 group-hover:text-red-600 transition">Today's Revenue</p>
          <p className="text-sm font-extrabold text-red-600 group-hover:underline transition-all duration-300">
            {loading ? 'Loading...' : formatCurrency(todayRevenue)}
          </p>
        </button>
        <div className="h-8 w-px bg-slate-200"></div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-slate-500 hover:text-red-600 transition font-semibold text-sm"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>
    </header>
  )
}
