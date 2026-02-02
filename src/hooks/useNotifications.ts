import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export interface Notification {
  id: string
  merchant_id: string
  title: string
  message: string
  type: 'message' | 'offer' | 'update' | 'alert'
  is_read: boolean
  created_at: string
  admin_id?: string
}

export function useNotifications(merchantId: string | undefined) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [unreadCount, setUnreadCount] = useState(0)

  const fetchNotifications = useCallback(async () => {
    if (!merchantId) return

    try {
      setLoading(true)
      const { data, error: fetchError } = await supabase
        .from('notifications')
        .select('*')
        .eq('merchant_id', merchantId)
        .order('created_at', { ascending: false })
        .limit(50)

      if (fetchError) {
        console.error('Error fetching notifications:', fetchError)
        setError(fetchError.message)
      } else {
        setNotifications(data || [])
        const unread = (data || []).filter((n) => !n.is_read).length
        setUnreadCount(unread)
      }
    } catch (err) {
      console.error('Error in fetchNotifications:', err)
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [merchantId])

  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

  useEffect(() => {
    if (!merchantId) return

    // Subscribe to real-time notifications from admin
    const subscription = supabase
      .channel(`notifications:${merchantId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `merchant_id=eq.${merchantId}`,
        },
        (payload) => {
          const newNotification = payload.new as Notification
          setNotifications((prev) => [newNotification, ...prev])
          setUnreadCount((prev) => prev + 1)
          
          // Show browser notification if available
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(newNotification.title, {
              body: newNotification.message,
              icon: '/icon.png',
              tag: newNotification.id,
            })
          }
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [merchantId])

  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId)

      if (error) {
        console.error('Error marking notification as read:', error)
      } else {
        setNotifications((prev) =>
          prev.map((n) => (n.id === notificationId ? { ...n, is_read: true } : n))
        )
        setUnreadCount((prev) => Math.max(0, prev - 1))
      }
    } catch (err) {
      console.error('Error in markAsRead:', err)
    }
  }

  const markAllAsRead = async () => {
    try {
      const unreadIds = notifications.filter((n) => !n.is_read).map((n) => n.id)
      if (unreadIds.length === 0) return

      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .in('id', unreadIds)

      if (error) {
        console.error('Error marking all as read:', error)
      } else {
        setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })))
        setUnreadCount(0)
      }
    } catch (err) {
      console.error('Error in markAllAsRead:', err)
    }
  }

  const deleteNotification = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId)

      if (error) {
        console.error('Error deleting notification:', error)
      } else {
        setNotifications((prev) => {
          const filtered = prev.filter((n) => n.id !== notificationId)
          const unread = filtered.filter((n) => !n.is_read).length
          setUnreadCount(unread)
          return filtered
        })
      }
    } catch (err) {
      console.error('Error in deleteNotification:', err)
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'offer':
        return '🎁'
      case 'update':
        return '📢'
      case 'alert':
        return '⚠️'
      default:
        return '💬'
    }
  }

  return {
    notifications,
    loading,
    error,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    getNotificationIcon,
    refetch: fetchNotifications,
  }
}
