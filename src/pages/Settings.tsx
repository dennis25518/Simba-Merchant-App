import { useState, useEffect } from 'react'
import { Header } from '../components/Header'
import { Sidebar } from '../components/Sidebar'
import { useAuth } from '../hooks/useAuth'
import { useMerchant } from '../hooks/useMerchant'
import { useMerchantStatus } from '../hooks/useMerchantStatus'
import { Eye, Timer, Volume2, Printer, AlertTriangle, Check, AlertCircle } from 'lucide-react'
import { mockMerchant } from '../lib/mockData'

export function Settings() {
  const { user } = useAuth()
  const { merchant: realMerchant } = useMerchant(user?.id)
  const { status, isSaving, toggleVisibility, updatePrepTime, updateChime, updateAutoprint } =
    useMerchantStatus(realMerchant?.merchant_id || mockMerchant.merchant_id)
  
  // Use real data if available, otherwise use mock data
  const merchant = realMerchant || mockMerchant
  const [prepTime, setPrepTime] = useState(status.prep_time.toString())
  const [autoPrint, setAutoPrint] = useState(status.auto_print_receipt)
  const [chimeEnabled, setChimeEnabled] = useState(status.order_chime_enabled)
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    setPrepTime(status.prep_time.toString())
    setAutoPrint(status.auto_print_receipt)
    setChimeEnabled(status.order_chime_enabled)
  }, [status])

  const handleVisibilityToggle = async () => {
    const result = await toggleVisibility()
    if (result.success) {
      setSaveMessage({ type: 'success', text: `Store is now ${!status.is_visible ? 'Online' : 'Offline'}` })
      setTimeout(() => setSaveMessage(null), 3000)
    } else {
      setSaveMessage({ type: 'error', text: result.error || 'Failed to update visibility' })
    }
  }

  const handleSaveAll = async () => {
    try {
      const prepTimeNum = parseInt(prepTime)
      
      const updates = [
        updatePrepTime(prepTimeNum),
        updateChime(chimeEnabled),
        updateAutoprint(autoPrint),
      ]

      await Promise.all(updates)
      setSaveMessage({ type: 'success', text: 'Settings saved successfully!' })
      setTimeout(() => setSaveMessage(null), 3000)
    } catch {
      setSaveMessage({ type: 'error', text: 'Failed to save settings' })
    }
  }

  const handleTerminateSession = async () => {
    if (window.confirm('Are you sure? This will immediately stop all incoming orders and log you out.')) {
      await toggleVisibility()
      // Logout would be handled here
    }
  }

  return (
    <div className="flex">
      <Sidebar merchantName={merchant?.merchant_name} merchantId={merchant?.merchant_id} />

      <main className="flex-1">
        <Header merchantName={merchant?.merchant_name} merchantId={merchant?.merchant_id} />

        <div className="max-w-4xl mx-auto p-4 md:p-6 lg:p-12">
          <header className="mb-8 md:mb-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
            <div>
              <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">Operations Control</h2>
              <p className="text-slate-500 font-medium text-sm md:text-base">Configure your kitchen throughput and store visibility.</p>
            </div>
            <button
              onClick={handleSaveAll}
              disabled={isSaving}
              className="bg-slate-900 text-white px-4 md:px-6 py-2 md:py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-black transition shadow-lg shadow-slate-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 w-full md:w-auto"
            >
              {isSaving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  Save Changes
                </>
              )}
            </button>
          </header>

          {/* Save Message Alert */}
          {saveMessage && (
            <div
              className={`mb-6 p-4 rounded-2xl border flex items-center gap-3 ${
                saveMessage.type === 'success'
                  ? 'bg-green-50 border-green-200 text-green-700'
                  : 'bg-red-50 border-red-200 text-red-700'
              }`}
            >
              {saveMessage.type === 'success' ? (
                <Check className="w-5 h-5 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
              )}
              <p className="text-sm font-bold">{saveMessage.text}</p>
            </div>
          )}

          <div className="space-y-6">
            <section className="bg-white p-8 rounded-3xl border border-slate-100 flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-5">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${status.is_visible ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                  <Eye className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="font-black text-lg">Marketplace Visibility</h3>
                  <p className="text-xs text-slate-500 font-medium italic">
                    Store is currently <span className="font-bold">{status.is_visible ? '🟢 Online' : '🔴 Offline'}</span>
                  </p>
                </div>
              </div>
              <button
                onClick={handleVisibilityToggle}
                disabled={isSaving}
                className={`relative inline-flex items-center px-6 py-3 rounded-xl font-bold text-sm transition disabled:opacity-50 ${
                  status.is_visible
                    ? 'bg-green-100 text-green-700 hover:bg-green-200'
                    : 'bg-red-100 text-red-700 hover:bg-red-200'
                }`}
              >
                {status.is_visible ? 'Go Offline' : 'Go Online'}
              </button>
            </section>

            <section className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
              <div className="flex items-center gap-5 mb-8">
                <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center text-red-600">
                  <Timer className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="font-black text-lg">Default Preparation Time</h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Average time needed before a rider can pick up an order.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {['15', '30', '45', '60'].map((time) => (
                  <button
                    key={time}
                    onClick={() => setPrepTime(time)}
                    className={`p-6 rounded-2xl border-2 font-black transition ${
                      prepTime === time
                        ? 'border-red-600 bg-red-50 text-red-600 shadow-sm shadow-red-100'
                        : 'border-slate-100 text-slate-400 hover:border-red-200'
                    }`}
                  >
                    {time} MIN
                  </button>
                ))}
              </div>
            </section>

            <section className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
              <h3 className="font-black text-xs uppercase tracking-[0.2em] text-slate-400 mb-6">Device Alerts</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                  <div className="flex items-center gap-3">
                    <Volume2 className="w-4 h-4 text-slate-400" />
                    <span className="text-sm font-bold text-slate-700">Order Chime Notifications</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={chimeEnabled}
                      onChange={(e) => setChimeEnabled(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                  </label>
                </div>
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                  <div className="flex items-center gap-3">
                    <Printer className="w-4 h-4 text-slate-400" />
                    <span className="text-sm font-bold text-slate-700">Auto-Print Receipt on Accept</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={autoPrint}
                      onChange={(e) => setAutoPrint(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                  </label>
                </div>
              </div>
            </section>

            <section className="p-8 border-2 border-dashed border-red-100 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-6 bg-red-50/30">
              <div>
                <h3 className="font-black text-red-600 text-sm uppercase tracking-widest flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" /> Emergency Shutdown
                </h3>
                <p className="text-xs text-slate-400 font-medium">Immediately stop all incoming orders and go offline.</p>
              </div>
              <button
                onClick={handleTerminateSession}
                className="px-8 py-3 bg-red-100 text-red-600 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-red-600 hover:text-white transition"
              >
                Go Offline Now
              </button>
            </section>
          </div>
        </div>
      </main>
    </div>
  )
}
