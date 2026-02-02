import { Eye, CheckCircle } from 'lucide-react'

export interface OrderCardProps {
  orderId: string
  items: string
  paymentMethod: 'PAID' | 'CASH ON DELIVERY'
  deliveryType: 'PICKUP' | 'DELIVERY'
  isPremium?: boolean
  onViewDetails?: () => void
  onAccept?: () => void
}

export function OrderCard({
  orderId,
  items,
  paymentMethod,
  deliveryType,
  isPremium = false,
  onViewDetails,
  onAccept,
}: OrderCardProps) {
  const getPaymentBgColor = (method: string) => {
    if (method === 'PAID') return 'bg-green-100 text-green-700'
    return 'bg-amber-100 text-amber-700'
  }

  return (
    <div className="order-card border border-slate-100 rounded-2xl p-5 flex items-center justify-between hover:bg-slate-50 transition">
      <div className="flex gap-6 items-center flex-1">
        <div className="bg-red-50 text-red-600 p-4 rounded-xl font-black text-xl min-w-fit">
          #{orderId}
        </div>
        <div className="flex-1">
          <p className="text-xs text-slate-500 truncate">{items}</p>
          <div className="flex gap-2 mt-2 flex-wrap">
            <span className={`${getPaymentBgColor(paymentMethod)} text-[10px] px-2 py-0.5 rounded-full font-bold`}>
              {paymentMethod}
            </span>
            <span className="bg-blue-100 text-blue-700 text-[10px] px-2 py-0.5 rounded-full font-bold">
              {deliveryType}
            </span>
            {isPremium && (
              <span className="bg-orange-100 text-orange-700 text-[10px] px-2 py-0.5 rounded-full font-bold">
                PREMIUM
              </span>
            )}
          </div>
        </div>
      </div>
      <div className="flex gap-3 ml-4">
        <button
          onClick={onViewDetails}
          className="px-6 py-2 bg-slate-100 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-200 transition flex items-center gap-2"
        >
          <Eye className="w-4 h-4" /> View Details
        </button>
        <button
          onClick={onAccept}
          className="px-6 py-2 bg-red-600 text-white rounded-xl font-bold text-sm hover:bg-red-700 shadow-lg shadow-red-200 transition flex items-center gap-2"
        >
          <CheckCircle className="w-4 h-4" /> Accept Order
        </button>
      </div>
    </div>
  )
}
