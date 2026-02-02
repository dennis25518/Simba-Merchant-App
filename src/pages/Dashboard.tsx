import { useState } from 'react'
import { Header } from '../components/Header'
import { Sidebar } from '../components/Sidebar'
import { useAuth } from '../hooks/useAuth'
import { useMerchant } from '../hooks/useMerchant'
import { useOrders, updateOrderStatus } from '../hooks/useOrders'
import type { Order } from '../hooks/useOrders'
import { mockMerchant, mockOrders } from '../lib/mockData'
import { X, Phone } from 'lucide-react'

export function Dashboard() {
  const { user } = useAuth()
  const { merchant: realMerchant } = useMerchant(user?.id)
  const { orders: realOrders } = useOrders(realMerchant?.merchant_id)
  const [activeTab, setActiveTab] = useState<'new' | 'preparing' | 'ready'>('new')
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [accepting, setAccepting] = useState(false)
  const [mockOrdersState, setMockOrdersState] = useState<Order[]>(mockOrders as Order[])

  // Use real data if available, otherwise use mock data for demo
  const merchant = realMerchant || mockMerchant
  const allOrders: Order[] = realOrders.length > 0 ? realOrders : mockOrdersState

  const incomingOrders = allOrders.filter((o) => o.status === 'pending')
  const preparingOrders = allOrders.filter((o) => o.status === 'preparing')
  const readyOrders = allOrders.filter((o) => o.status === 'ready')

  const getDisplayedOrders = () => {
    switch (activeTab) {
      case 'new':
        return incomingOrders
      case 'preparing':
        return preparingOrders
      case 'ready':
        return readyOrders
      default:
        return incomingOrders
    }
  }

  const handleAcceptOrder = async (orderId: string) => {
    setAccepting(true)
    try {
      // Update mock data state immediately
      setMockOrdersState((prevOrders) =>
        prevOrders.map((order) =>
          order.id === orderId ? { ...order, status: 'preparing' as const } : order
        )
      )
      // Update selected order if it's open in modal
      if (selectedOrder?.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: 'preparing' })
      }
      // Update in Supabase
      const result = await updateOrderStatus(orderId, 'preparing')
      if (result.success) {
        console.log('Order accepted:', orderId)
      } else {
        console.error('Error accepting order:', result.error)
      }
    } finally {
      setAccepting(false)
    }
  }

  const handleCompleteOrder = async (orderId: string) => {
    try {
      // Update mock data state immediately
      setMockOrdersState((prevOrders) =>
        prevOrders.map((order) =>
          order.id === orderId ? { ...order, status: 'ready' as const } : order
        )
      )
      // Update selected order if it's open in modal
      if (selectedOrder?.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: 'ready' })
      }
      // Update in Supabase
      const result = await updateOrderStatus(orderId, 'ready')
      if (result.success) {
        console.log('Order completed:', orderId)
      } else {
        console.error('Error completing order:', result.error)
      }
    } catch (err) {
      console.error('Error:', err)
    }
  }

  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order)
  }

  const callDispatch = (order: Order) => {
    // Signal to the driver app system about the ready order
    console.log(`Dispatch signal sent for order #${order.order_id}`)
    console.log(`Amount: ${order.total_amount} TZS`)
    
    // In a real system, this would send a notification/signal to the driver app
    // Example: You could send a WebSocket message, HTTP POST request, or trigger a real-time event
    // For now, we'll show a success notification
    alert(`✓ Dispatch signal sent for Order #${order.order_id}\n\nDriver will be notified to pick up this delivery.`)
  }

  const displayedOrders = getDisplayedOrders()

  return (
    <div className="flex">
      <Sidebar merchantName={merchant?.merchant_name} merchantId={merchant?.merchant_id} />

      <main className="flex-1 flex flex-col min-h-screen">
        <Header merchantName={merchant?.merchant_name} merchantId={merchant?.merchant_id} />

        <div className="p-4 md:p-8 grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6">
          <div className="bg-white p-4 md:p-6 rounded-2xl border border-slate-100 shadow-sm">
            <p className="text-xs font-bold text-slate-500 uppercase">Incoming</p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">{incomingOrders.length}</h3>
          </div>
          <div className="bg-white p-4 md:p-6 rounded-2xl border border-slate-100 shadow-sm">
            <p className="text-xs font-bold text-slate-500 uppercase">Preparing</p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">{preparingOrders.length}</h3>
          </div>
          <div className="bg-white p-4 md:p-6 rounded-2xl border border-slate-100 shadow-sm">
            <p className="text-xs font-bold text-slate-500 uppercase">Ready</p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">{readyOrders.length}</h3>
          </div>
          <div className="bg-white p-4 md:p-6 rounded-2xl border border-slate-100 shadow-sm">
            <p className="text-xs font-bold text-slate-500 uppercase">Total Today</p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">{allOrders.length}</h3>
          </div>
        </div>

        <div className="px-4 md:px-8 flex-1">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm h-full overflow-hidden flex flex-col">
            <div className="flex items-center gap-8 px-8 border-b border-slate-100">
              <button
                onClick={() => setActiveTab('new')}
                className={`py-4 text-sm font-bold transition ${
                  activeTab === 'new' ? 'tab-active' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                New Orders ({incomingOrders.length})
              </button>
              <button
                onClick={() => setActiveTab('preparing')}
                className={`py-4 text-sm font-bold transition ${
                  activeTab === 'preparing' ? 'tab-active' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                Preparing ({preparingOrders.length})
              </button>
              <button
                onClick={() => setActiveTab('ready')}
                className={`py-4 text-sm font-bold transition ${
                  activeTab === 'ready' ? 'tab-active' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                Ready ({readyOrders.length})
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 flex-1">
              {displayedOrders.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-slate-500 font-medium">No orders in this category</p>
                </div>
              ) : (
                displayedOrders.slice(0, 4).map((order) => (
                  <div
                    key={order.id}
                    className="border border-slate-200 rounded-2xl p-4 hover:border-slate-300 transition hover:shadow-md"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 cursor-pointer" onClick={() => handleViewDetails(order)}>
                        <h4 className="font-bold text-slate-900">Order #{order.order_id}</h4>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold ${
                          order.status === 'pending'
                            ? 'bg-amber-100 text-amber-700'
                            : order.status === 'preparing'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-green-100 text-green-700'
                        }`}
                      >
                        {order.status.toUpperCase()}
                      </span>
                    </div>
                    <div className="text-sm text-slate-600 mb-3 cursor-pointer" onClick={() => handleViewDetails(order)}>
                      {order.items.map((item, idx) => (
                        <div key={idx}>
                          {item.product_name} × {item.quantity}
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">{order.total_amount.toLocaleString()} TZS</span>
                      <div className="flex gap-2">
                        {order.status === 'pending' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleAcceptOrder(order.id)
                            }}
                            disabled={accepting}
                            className="px-6 py-2 bg-red-600 text-white text-sm font-bold rounded-xl hover:bg-red-700 disabled:opacity-50 transition shadow-md hover:shadow-lg"
                          >
                            {accepting ? 'Accepting...' : 'Accept Order'}
                          </button>
                        )}
                        {order.status === 'preparing' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleCompleteOrder(order.id)
                            }}
                            className="px-6 py-2 bg-yellow-500 text-white text-sm font-bold rounded-xl hover:bg-yellow-600 transition shadow-md hover:shadow-lg"
                          >
                            Completed
                          </button>
                        )}
                        {order.status === 'ready' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              callDispatch(order)
                            }}
                            className="px-6 py-2 bg-green-600 text-white text-sm font-bold rounded-xl hover:bg-green-700 transition shadow-md hover:shadow-lg flex items-center gap-2"
                          >
                            <Phone className="w-4 h-4" />
                            Call Dispatch
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="h-8"></div>
      </main>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-slate-100 p-6 flex items-center justify-between">
              <h2 className="text-2xl font-black">Order #{selectedOrder.order_id}</h2>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-2 hover:bg-slate-100 rounded-full transition"
              >
                <X className="w-6 h-6 text-slate-500" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Order Status */}
              <div className="bg-slate-50 p-4 rounded-2xl">
                <p className="text-xs font-bold text-slate-500 uppercase mb-2">Status</p>
                <div className="flex items-center gap-2">
                  <span
                    className={`px-4 py-2 rounded-full font-bold text-sm ${
                      selectedOrder.status === 'pending'
                        ? 'bg-amber-100 text-amber-700'
                        : selectedOrder.status === 'preparing'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-green-100 text-green-700'
                    }`}
                  >
                    {selectedOrder.status.toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Order Items */}
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase mb-3">Items Ordered</p>
                <div className="bg-slate-50 rounded-2xl p-4 space-y-3">
                  {selectedOrder.items && selectedOrder.items.length > 0 ? (
                    selectedOrder.items.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between border-b border-slate-200 pb-3 last:border-0">
                        <div>
                          <p className="font-medium text-slate-900">{item.product_name}</p>
                          <p className="text-xs text-slate-600">ID: {item.product_id}</p>
                        </div>
                        <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-bold text-sm">
                          ×{item.quantity}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-slate-600">No items</p>
                  )}
                </div>
              </div>

              {/* Order Details Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 p-4 rounded-2xl">
                  <p className="text-xs font-bold text-slate-500 uppercase mb-2">Total Amount</p>
                  <p className="text-sm font-bold text-slate-900">
                    {selectedOrder.total_amount.toLocaleString()} TZS
                  </p>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl">
                  <p className="text-xs font-bold text-slate-500 uppercase mb-2">Order Date</p>
                  <p className="text-sm font-bold text-slate-900">
                    {new Date(selectedOrder.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-slate-200">
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="flex-1 px-4 py-3 bg-slate-100 text-slate-700 rounded-2xl font-bold hover:bg-slate-200 transition"
                >
                  Close
                </button>
                {selectedOrder.status === 'pending' && (
                  <button
                    onClick={() => {
                      handleAcceptOrder(selectedOrder.id)
                      setSelectedOrder(null)
                    }}
                    disabled={accepting}
                    className="flex-1 px-4 py-3 bg-red-600 text-white rounded-2xl font-bold hover:bg-red-700 disabled:opacity-50 transition"
                  >
                    {accepting ? 'Accepting...' : 'Accept Order'}
                  </button>
                )}
                {selectedOrder.status === 'preparing' && (
                  <button
                    onClick={() => {
                      updateOrderStatus(selectedOrder.id, 'ready')
                      setSelectedOrder(null)
                    }}
                    className="flex-1 px-4 py-3 bg-green-600 text-white rounded-2xl font-bold hover:bg-green-700 transition"
                  >
                    Mark Ready
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
