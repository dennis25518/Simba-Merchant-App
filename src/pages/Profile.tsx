import { useState, useEffect } from 'react'
import { Header } from '../components/Header'
import { Sidebar } from '../components/Sidebar'
import { useAuth } from '../hooks/useAuth'
import { useMerchant } from '../hooks/useMerchant'
import { Building2, UserCheck, LogOut, Check, AlertCircle } from 'lucide-react'
import { mockMerchant } from '../lib/mockData'
import { supabase } from '../lib/supabase'

export function Profile() {
  const { user } = useAuth()
  const { merchant: realMerchant, loading: merchantLoading } = useMerchant(user?.id)
  
  // Use real data if available, otherwise use mock data
  const merchant = realMerchant || mockMerchant

  const [formData, setFormData] = useState({
    merchant_name: '',
    merchant_email: '',
    merchant_phone: '',
    merchant_location: '',
  })

  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  // Sync form data when merchant data loads
  useEffect(() => {
    if (merchant) {
      setFormData({
        merchant_name: merchant.merchant_name || '',
        merchant_email: merchant.merchant_email || '',
        merchant_phone: merchant.merchant_phone || '',
        merchant_location: merchant.merchant_location || '',
      })
    }
  }, [merchant])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleUpdate = async () => {
    if (!user?.id) {
      setError('User not authenticated')
      return
    }

    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const { error: updateError } = await supabase
        .from('merchants')
        .update({
          merchant_name: formData.merchant_name,
          merchant_email: formData.merchant_email,
          merchant_phone: formData.merchant_phone,
          merchant_location: formData.merchant_location,
        })
        .eq('user_id', user.id)

      if (updateError) {
        console.error('Update error:', updateError)
        setError('Failed to update profile: ' + updateError.message)
      } else {
        setSuccess('Profile updated successfully!')
        setTimeout(() => setSuccess(''), 3000)
      }
    } catch (err) {
      console.error('Error updating profile:', err)
      setError('An error occurred while updating your profile')
    } finally {
      setLoading(false)
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((word) => word[0])
      .join('')
      .toUpperCase()
      .substring(0, 2) || 'S'
  }

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      window.location.href = '/login'
    } catch (err) {
      console.error('Logout error:', err)
    }
  }

  return (
    <div className="flex">
      <Sidebar merchantName={merchant?.merchant_name} merchantId={merchant?.merchant_id} />

      <main className="flex-1 flex flex-col min-h-screen">
        <Header merchantName={merchant?.merchant_name} merchantId={merchant?.merchant_id} />

        <div className="p-8 md:p-12">
          {/* Debug info - remove later */}
          {merchantLoading && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-2xl text-blue-600 text-sm font-semibold flex items-center gap-2">
              <AlertCircle className="w-5 h-5" /> Loading your profile...
            </div>
          )}

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
            <div className="flex items-center gap-5">
              <div className="w-20 h-20 bg-red-600 rounded-3xl shadow-lg shadow-red-200 flex items-center justify-center text-white text-2xl font-black">
                {getInitials(formData.merchant_name)}
              </div>
              <div>
                <h2 className="text-4xl font-black tracking-tight">{formData.merchant_name || 'Welcome'}</h2>
                <p className="text-slate-500 font-medium">Manage your business identity & security</p>
              </div>
            </div>
            <div className="flex gap-2">
              <span className="px-4 py-2 bg-green-100 text-green-700 rounded-full text-[10px] font-black uppercase tracking-widest">
                Verified Merchant
              </span>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-600 text-sm font-semibold flex items-center gap-2">
              <AlertCircle className="w-5 h-5" /> {error}
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-2xl text-green-600 text-sm font-semibold flex items-center gap-2">
              <Check className="w-5 h-5" /> {success}
            </div>
          )}

          <div className="grid grid-cols-1 gap-8">
            <section className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
              <div className="flex items-center gap-3 mb-8">
                <Building2 className="text-slate-400 w-5 h-5" />
                <h3 className="font-black uppercase text-xs tracking-[0.2em] text-slate-400">Identity Details</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">
                    Store Legal Name
                  </label>
                  <input
                    type="text"
                    name="merchant_name"
                    value={formData.merchant_name}
                    onChange={handleChange}
                    placeholder="Enter your store name"
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3.5 px-5 text-sm font-semibold outline-none focus:ring-2 focus:ring-red-100 focus:bg-white transition"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">
                    Merchant ID
                  </label>
                  <input
                    type="text"
                    value={merchant?.merchant_id || ''}
                    readOnly
                    className="w-full bg-slate-100 border border-slate-100 rounded-2xl py-3.5 px-5 text-sm font-bold text-slate-500 cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">
                    Business Location
                  </label>
                  <input
                    type="text"
                    name="merchant_location"
                    value={formData.merchant_location}
                    onChange={handleChange}
                    placeholder="Enter your location"
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3.5 px-5 text-sm font-semibold outline-none focus:ring-2 focus:ring-red-100 focus:bg-white transition"
                  />
                </div>
              </div>
            </section>

            <section className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
              <div className="flex items-center gap-3 mb-8">
                <UserCheck className="text-slate-400 w-5 h-5" />
                <h3 className="font-black uppercase text-xs tracking-[0.2em] text-slate-400">Contact Information</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="merchant_email"
                    value={formData.merchant_email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3.5 px-5 text-sm font-semibold outline-none focus:ring-2 focus:ring-red-100 focus:bg-white transition"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="merchant_phone"
                    value={formData.merchant_phone}
                    onChange={handleChange}
                    placeholder="Enter your phone"
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3.5 px-5 text-sm font-semibold outline-none focus:ring-2 focus:ring-red-100 focus:bg-white transition"
                  />
                </div>
              </div>
            </section>

            <section className="border border-red-100 bg-red-50 p-8 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="text-center md:text-left">
                <h3 className="font-black text-red-900 text-lg">Session Management</h3>
                <p className="text-red-700/60 text-xs font-medium">Log out of this terminal to prevent unauthorized access.</p>
              </div>
              <button
                onClick={handleLogout}
                className="w-full md:w-auto bg-white border border-red-200 text-red-600 px-10 py-4 rounded-2xl font-black text-sm shadow-sm hover:bg-red-600 hover:text-white transition-all flex items-center justify-center gap-3"
              >
                <LogOut className="w-5 h-5" /> Log Out
              </button>
            </section>
          </div>
        </div>

        <footer className="mt-12 pb-12 text-center">
          <button
            onClick={handleUpdate}
            disabled={loading}
            className="bg-slate-900 text-white px-12 py-4 rounded-2xl font-black text-sm shadow-xl hover:bg-black transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Saving Changes...' : 'Update All Profile Changes'}
          </button>
          <p className="mt-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Simba Merchant App v2.0.0</p>
        </footer>
      </main>
    </div>
  )
}
