import { useState } from 'react'
import { Header } from '../components/Header'
import { Sidebar } from '../components/Sidebar'
import { useAuth } from '../hooks/useAuth'
import { useMerchant } from '../hooks/useMerchant'
import { usePaymentRequest } from '../hooks/usePaymentRequest'
import { usePerformanceMetrics } from '../hooks/usePerformanceMetrics'
import { ArrowUpRight, TrendingUp, ShoppingBag, Wallet, X, AlertCircle, CheckCircle, Phone } from 'lucide-react'
import { mockMerchant } from '../lib/mockData'

export function Payouts() {
  const { user } = useAuth()
  const { merchant: realMerchant } = useMerchant(user?.id)
  const { createPaymentRequest } = usePaymentRequest()
  
  // Use real data if available, otherwise use mock data
  const merchant = realMerchant || mockMerchant
  
  const [timeRange, setTimeRange] = useState<'weekly' | 'monthly'>('weekly')
  const [showWithdrawModal, setShowWithdrawModal] = useState(false)
  const [mpesaPhone, setMpesaPhone] = useState('')
  const [withdrawalLoading, setWithdrawalLoading] = useState(false)
  const [withdrawalMessage, setWithdrawalMessage] = useState('')
  const [mpesaError, setMpesaError] = useState('')

  const { metrics } = usePerformanceMetrics(merchant?.merchant_id, timeRange)

  const handleWithdrawal = async () => {
    setMpesaError('')
    setWithdrawalMessage('')

    // Validate phone number
    if (!mpesaPhone.trim()) {
      setMpesaError('Please enter an M-Pesa phone number')
      return
    }

    // Basic phone number validation for Tanzania (starts with +255, 0, or 255)
    const phoneRegex = /^(\+255|0255|255)([0-9]{9})$/
    if (!phoneRegex.test(mpesaPhone.replace(/\s/g, ''))) {
      setMpesaError('Please enter a valid M-Pesa phone number (e.g., +255123456789 or 0123456789)')
      return
    }

    setWithdrawalLoading(true)

    // Create payment request that goes to admin for verification
    const result = await createPaymentRequest(
      merchant.merchant_id,
      merchant.merchant_name,
      185400, // TZS available for payout - in production, this should be dynamic
      mpesaPhone
    )

    if (result.success) {
      setWithdrawalMessage(
        '✓ Withdrawal request submitted! Admin will verify and process your payment within 2-24 hours.'
      )
      setTimeout(() => {
        setShowWithdrawModal(false)
        setMpesaPhone('')
        setWithdrawalMessage('')
      }, 3000)
    } else {
      setMpesaError(result.error || 'Failed to create withdrawal request')
    }

    setWithdrawalLoading(false)
  }

  return (
    <div className="flex">
      <Sidebar merchantName={merchant?.merchant_name} merchantId={merchant?.merchant_id} />

      <main className="flex-1">
        <Header merchantName={merchant?.merchant_name} merchantId={merchant?.merchant_id} />

        <div className="max-w-6xl mx-auto p-4 md:p-6 lg:p-12">
          <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6 mb-8 md:mb-10">
            <div>
              <h2 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900">Financial Insights</h2>
              <p className="text-slate-500 font-medium text-sm md:text-base">Track your revenue and manage settlement requests.</p>
            </div>
            <div className="flex items-center gap-3 bg-white p-2 rounded-2xl border border-slate-200">
              <button
                onClick={() => setTimeRange('weekly')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                  timeRange === 'weekly' ? 'bg-red-600 text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Weekly
              </button>
              <button
                onClick={() => setTimeRange('monthly')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                  timeRange === 'monthly' ? 'bg-red-600 text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Monthly
              </button>
            </div>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-8 rounded-3xl border border-slate-100 border-l-4 border-l-green-500 relative overflow-hidden shadow-sm">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Available for Payout</p>
              <h3 className="text-3xl font-black text-slate-900 mb-6">TZS 185,400</h3>
              <button
                onClick={() => setShowWithdrawModal(true)}
                className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-sm hover:bg-black transition-all flex items-center justify-center gap-2 shadow-lg"
              >
                <ArrowUpRight className="w-4 h-4" /> Withdraw to M-Pesa
              </button>
              <Wallet className="absolute -right-4 -top-4 w-24 h-24 text-slate-50/50 -rotate-12" />
            </div>

            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Sales (Feb)</p>
              <h3 className="text-3xl font-black text-slate-900">TZS 2,450,000</h3>
              <div className="mt-4 flex items-center gap-2 text-green-600">
                <TrendingUp className="w-4 h-4" />
                <span className="text-xs font-bold">+12.5% from January</span>
              </div>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Orders Completed</p>
              <h3 className="text-3xl font-black text-slate-900">142</h3>
              <div className="mt-4 flex items-center gap-2 text-slate-500">
                <ShoppingBag className="w-4 h-4" />
                <span className="text-xs font-bold">Avg. TZS 17,250 / order</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
              <div className="flex justify-between items-center mb-10">
                <div>
                  <h4 className="text-sm font-black uppercase tracking-widest text-slate-900">Daily Performance</h4>
                  <p className="text-xs text-slate-500 mt-1">Revenue earned per day</p>
                </div>
                <span className="text-sm font-bold text-slate-600">
                  Total: <span className="text-red-600">TZS {timeRange === 'weekly' ? metrics.weeklyTotal.toLocaleString() : metrics.monthlyTotal.toLocaleString()}</span>
                </span>
              </div>

              {/* Earnings Chart */}
              <div className="mb-6">
                <div className="h-80 flex items-end justify-between gap-3 px-2 pb-6">
                  {metrics.daily.map((dayData, idx) => {
                    const maxEarnings = Math.max(...metrics.daily.map((d) => d.earnings))
                    const percentage = (dayData.earnings / maxEarnings) * 100
                    const isHighest = dayData.earnings === maxEarnings

                    return (
                      <div key={idx} className="flex-1 flex flex-col items-center gap-2 group">
                        {/* Earnings Label on Hover */}
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity text-[9px] font-bold text-slate-500 h-4">
                          TZS {(dayData.earnings / 1000).toFixed(0)}k
                        </div>

                        {/* Bar */}
                        <div
                          className={`w-full rounded-t-lg transition-all ${
                            isHighest ? 'bg-red-600 shadow-lg shadow-red-100' : 'bg-slate-100 hover:bg-red-200'
                          }`}
                          style={{
                            height: `${Math.max(percentage, 5)}%`,
                            minHeight: '20px',
                          }}
                        />

                        {/* Day Label */}
                        <span className={`text-[11px] font-bold ${isHighest ? 'text-slate-900' : 'text-slate-400'}`}>
                          {dayData.day}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-100">
                <div>
                  <p className="text-[10px] text-slate-500 font-bold uppercase">Daily Average</p>
                  <p className="text-lg font-black text-slate-900">TZS {(metrics.dailyAverage / 1000).toFixed(0)}k</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 font-bold uppercase">{timeRange === 'weekly' ? 'Weekly' : 'Monthly'} Total</p>
                  <p className="text-lg font-black text-red-600">
                    TZS {(timeRange === 'weekly' ? metrics.weeklyTotal : metrics.monthlyTotal) / 1000000 > 1
                      ? ((timeRange === 'weekly' ? metrics.weeklyTotal : metrics.monthlyTotal) / 1000000).toFixed(1) + 'M'
                      : ((timeRange === 'weekly' ? metrics.weeklyTotal : metrics.monthlyTotal) / 1000).toFixed(0) + 'k'}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 font-bold uppercase">Days Tracked</p>
                  <p className="text-lg font-black text-slate-900">{metrics.daily.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
              <h4 className="text-sm font-black uppercase tracking-widest text-slate-900 mb-6">Recent Payouts</h4>
              <div className="space-y-4">
                {[
                  { amount: 'TZS 185,400', date: 'Today', status: 'PENDING' },
                  { amount: 'TZS 156,200', date: 'Feb 1', status: 'SUCCESS' },
                  { amount: 'TZS 198,500', date: 'Jan 31', status: 'SUCCESS' },
                ].map((payout, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                    <div>
                      <p className="font-bold text-slate-900">{payout.amount}</p>
                      <p className="text-[10px] text-slate-500">{payout.date}</p>
                    </div>
                    <span
                      className={`text-[9px] font-black ${
                        payout.status === 'SUCCESS' ? 'text-green-600 bg-green-50' : 'text-yellow-600 bg-yellow-50'
                      } px-2 py-1 rounded`}
                    >
                      {payout.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* M-Pesa Withdrawal Modal */}
          {showWithdrawModal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl">
                {/* Header */}
                <div className="bg-gradient-to-r from-red-600 to-red-700 p-6 flex items-center justify-between rounded-t-3xl">
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-white" />
                    <h3 className="text-white font-black">M-Pesa Withdrawal</h3>
                  </div>
                  <button onClick={() => setShowWithdrawModal(false)} className="text-white hover:bg-red-600 p-1 rounded-lg">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Content */}
                <div className="p-6">
                  {withdrawalMessage ? (
                    <div className="text-center">
                      <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-3" />
                      <p className="text-sm font-bold text-slate-900 mb-4">{withdrawalMessage}</p>
                      <button
                        onClick={() => {
                          setShowWithdrawModal(false)
                          setMpesaPhone('')
                          setWithdrawalMessage('')
                        }}
                        className="w-full bg-green-600 text-white py-3 rounded-xl font-bold hover:bg-green-700 transition"
                      >
                        Done
                      </button>
                    </div>
                  ) : (
                    <>
                      {/* Amount Display */}
                      <div className="mb-6 p-4 bg-slate-50 rounded-2xl border border-slate-200">
                        <p className="text-xs text-slate-500 font-bold mb-1">WITHDRAWAL AMOUNT</p>
                        <h4 className="text-2xl font-black text-slate-900">TZS 185,400</h4>
                      </div>

                      {/* Info Box */}
                      <div className="mb-6 p-4 bg-blue-50 rounded-2xl border border-blue-200 flex gap-3">
                        <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs font-bold text-blue-900">Admin Verification Required</p>
                          <p className="text-[12px] text-blue-700 mt-1">
                            Your withdrawal request will be verified by our admin team and processed within 2-24 hours.
                          </p>
                        </div>
                      </div>

                      {/* Phone Input */}
                      <div className="mb-6">
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">M-Pesa Phone Number</label>
                        <input
                          type="tel"
                          value={mpesaPhone}
                          onChange={(e) => {
                            setMpesaPhone(e.target.value)
                            setMpesaError('')
                          }}
                          placeholder="+255123456789 or 0123456789"
                          className={`w-full px-4 py-3 border-2 rounded-xl outline-none transition ${
                            mpesaError ? 'border-red-500 focus:ring-2 focus:ring-red-100' : 'border-slate-200 focus:ring-2 focus:ring-red-100'
                          }`}
                        />
                        {mpesaError && <p className="text-xs text-red-600 font-bold mt-1">{mpesaError}</p>}
                      </div>

                      {/* Buttons */}
                      <div className="flex gap-3">
                        <button
                          onClick={() => {
                            setShowWithdrawModal(false)
                            setMpesaPhone('')
                            setMpesaError('')
                          }}
                          disabled={withdrawalLoading}
                          className="flex-1 px-4 py-3 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition disabled:opacity-50"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleWithdrawal}
                          disabled={withdrawalLoading}
                          className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                          {withdrawalLoading ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              Processing...
                            </>
                          ) : (
                            <>
                              <ArrowUpRight className="w-4 h-4" />
                              Request Withdrawal
                            </>
                          )}
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
