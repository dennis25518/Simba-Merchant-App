import { useState } from 'react'
import { Search, X, Download } from 'lucide-react'
import { Header } from '../components/Header'
import { Sidebar } from '../components/Sidebar'
import { useAuth } from '../hooks/useAuth'
import { useMerchant } from '../hooks/useMerchant'
import { useOrders } from '../hooks/useOrders'
import type { Order } from '../hooks/useOrders'
import { mockMerchant, mockOrders } from '../lib/mockData'

export function History() {
  const { user } = useAuth()
  const { merchant: realMerchant } = useMerchant(user?.id)
  const { orders: realOrders } = useOrders(realMerchant?.merchant_id)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'preparing' | 'ready'>('all')
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [mockOrdersState] = useState<Order[]>(mockOrders as Order[])

  // Use real data if available, otherwise use mock data
  const merchant = realMerchant || mockMerchant
  const orders = realOrders.length > 0 ? realOrders : mockOrdersState

  const filteredOrders = orders.filter((order) => {
    const itemsStr = order.items && order.items.length > 0
      ? order.items.map((item) => `${item.product_name} ${item.product_id}`).join(' ')
      : ''
    const matchesSearch =
      order.order_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      itemsStr.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter
    return matchesSearch && matchesStatus
  }).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      delivered: 'bg-green-100 text-green-700',
      cancelled: 'bg-slate-100 text-slate-500',
      pending: 'bg-yellow-100 text-yellow-700',
      preparing: 'bg-blue-100 text-blue-700',
      ready: 'bg-purple-100 text-purple-700',
    }
    return colors[status] || 'bg-slate-100 text-slate-500'
  }

  const generatePDF = () => {
    // Create a new window for printing
    const printWindow = window.open('', '', 'height=600,width=800')
    if (!printWindow) return

    const orderRows = filteredOrders
      .map(
        (order) =>
          `<tr>
            <td style="border: 1px solid #ddd; padding: 8px;">#${order.order_id}</td>
            <td style="border: 1px solid #ddd; padding: 8px;">${new Date(order.created_at).toLocaleDateString()}</td>
            <td style="border: 1px solid #ddd; padding: 8px;">${
            order.items && order.items.length > 0
              ? order.items.map((item) => `${item.product_name} × ${item.quantity}`).join(', ')
              : 'No items'
          }</td>
            <td style="border: 1px solid #ddd; padding: 8px;">${order.total_amount.toLocaleString()} TZS</td>
            <td style="border: 1px solid #ddd; padding: 8px; text-transform: uppercase;">${order.status}</td>
          </tr>`
      )
      .join('')

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Order History - ${merchant?.merchant_name}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 20px;
            }
            h1 {
              color: #0F172A;
              text-align: center;
            }
            .info {
              margin-bottom: 20px;
              font-size: 12px;
              color: #666;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 20px;
            }
            th {
              background-color: #F3F4F6;
              color: #1F2937;
              padding: 10px;
              text-align: left;
              border: 1px solid #ddd;
              font-weight: bold;
            }
            td {
              padding: 8px;
            }
            .footer {
              margin-top: 30px;
              font-size: 11px;
              color: #999;
              text-align: center;
            }
          </style>
        </head>
        <body>
          <h1>Order History Report</h1>
          <div class="info">
            <p><strong>Merchant:</strong> ${merchant?.merchant_name}</p>
            <p><strong>Generated:</strong> ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}</p>
            <p><strong>Total Orders:</strong> ${filteredOrders.length}</p>
            <p><strong>Filter Status:</strong> ${statusFilter === 'all' ? 'All' : statusFilter.toUpperCase()}</p>
          </div>
          <table>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Date</th>
                <th>Items</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${orderRows}
            </tbody>
          </table>
          <div class="footer">
            <p>This is an official record of your order history.</p>
          </div>
        </body>
      </html>
    `

    printWindow.document.write(htmlContent)
    printWindow.document.close()
    printWindow.print()
  }

  return (
    <div className="flex">
      <Sidebar merchantName={merchant?.merchant_name} merchantId={merchant?.merchant_id} />

      <main className="flex-1">
        <Header merchantName={merchant?.merchant_name} merchantId={merchant?.merchant_id} />

        <div className="max-w-6xl mx-auto p-4 md:p-6 lg:p-12">
          <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6 mb-8 md:mb-10">
            <div>
              <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">Order Archive</h2>
              <p className="text-slate-500 font-medium text-sm md:text-base">Review and audit all past merchant transactions.</p>
            </div>

            <div className="flex flex-col md:flex-row items-center gap-3 w-full md:w-auto">
              <div className="flex gap-3 flex-1 md:flex-initial">
                <div className="relative flex-1 min-w-[280px]">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search Order ID, Items..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-2xl py-3 pl-12 pr-4 text-sm outline-none focus:ring-2 focus:ring-red-100 transition-all"
                  />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as 'all' | 'pending' | 'preparing' | 'ready')}
                  className="bg-white border border-slate-200 px-4 py-3 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-red-100 transition-all cursor-pointer"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="preparing">Preparing</option>
                  <option value="ready">Ready</option>
                </select>
              </div>
              <button
                onClick={generatePDF}
                className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-2xl font-bold hover:bg-red-700 transition shadow-md hover:shadow-lg whitespace-nowrap"
              >
                <Download className="w-4 h-4" />
                Export PDF
              </button>
            </div>
          </header>

          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">
                      Order ID
                    </th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">
                      Timestamp
                    </th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">
                      Items
                    </th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-8 py-6">
                        <span className="font-bold text-red-600">#{order.order_id}</span>
                      </td>
                      <td className="px-8 py-6 text-sm font-medium text-slate-600">
                        {new Date(order.created_at).toLocaleDateString()}, {new Date(order.created_at).toLocaleTimeString()}
                      </td>
                      <td className="px-8 py-6">
                        <p className="text-sm font-bold text-slate-900 leading-tight">
                          {order.items && order.items.length > 0
                            ? order.items.map((item) => `${item.product_name} × ${item.quantity}`).join(', ')
                            : 'No items'}
                        </p>
                      </td>
                      <td className="px-8 py-6">
                        <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${getStatusBadge(order.status)} uppercase`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="px-4 py-2 bg-red-600 text-white text-[10px] font-bold rounded-lg hover:bg-red-700 transition"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredOrders.length === 0 && (
              <div className="text-center py-12">
                <p className="text-slate-500 font-medium">No orders found</p>
              </div>
            )}
          </div>
        </div>
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
                <div className="bg-slate-50 p-4 rounded-2xl">
                  <p className="text-xs font-bold text-slate-500 uppercase mb-2">Order Time</p>
                  <p className="text-sm font-bold text-slate-900">
                    {new Date(selectedOrder.created_at).toLocaleTimeString()}
                  </p>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl">
                  <p className="text-xs font-bold text-slate-500 uppercase mb-2">Order ID</p>
                  <p className="text-sm font-bold text-slate-900">#{selectedOrder.order_id}</p>
                </div>
              </div>

              {/* Close Button */}
              <div className="pt-4 border-t border-slate-200">
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="w-full px-4 py-3 bg-slate-100 text-slate-700 rounded-2xl font-bold hover:bg-slate-200 transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
