import { useState } from 'react'
import { Header } from '../components/Header'
import { Sidebar } from '../components/Sidebar'
import { useAuth } from '../hooks/useAuth'
import { useMerchant } from '../hooks/useMerchant'
import { useInventory, updateInventoryItem, createInventoryItem } from '../hooks/useInventory'
import type { InventoryItem } from '../hooks/useInventory'
import { mockMerchant, mockInventory } from '../lib/mockData'
import { Plus, Edit2, Save, X } from 'lucide-react'

export function Inventory() {
  const { user } = useAuth()
  const { merchant: realMerchant } = useMerchant(user?.id)
  const { inventory: realInventory } = useInventory(realMerchant?.merchant_id)

  // Use real data if available, otherwise use mock data
  const merchant = realMerchant || mockMerchant
  const initialInventory = realInventory.length > 0 ? realInventory : (mockInventory as InventoryItem[])

  const [inventory, setInventory] = useState<InventoryItem[]>(initialInventory)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValues, setEditValues] = useState<Partial<InventoryItem>>({})
  const [showAddForm, setShowAddForm] = useState(false)
  const [newProductName, setNewProductName] = useState('')

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good':
        return { bg: 'bg-green-50', border: 'border-green-200', badge: 'bg-green-100 text-green-700', label: '✓ Good Stock' }
      case 'warning':
        return { bg: 'bg-yellow-50', border: 'border-yellow-200', badge: 'bg-yellow-100 text-yellow-700', label: '⚠ Low Stock' }
      case 'danger':
        return { bg: 'bg-red-50', border: 'border-red-200', badge: 'bg-red-100 text-red-700', label: '● Critical' }
      default:
        return { bg: 'bg-slate-50', border: 'border-slate-200', badge: 'bg-slate-100 text-slate-700', label: 'Unknown' }
    }
  }

  const getStockPercentage = (item: InventoryItem) => {
    return (item.current_stock / item.maximum_stock) * 100
  }

  const handleEditStart = (item: InventoryItem) => {
    setEditingId(item.id)
    setEditValues({ ...item })
  }

  const handleEditChange = (field: keyof InventoryItem, value: string | number) => {
    setEditValues({ ...editValues, [field]: value })
  }

  const handleSave = async (item: InventoryItem) => {
    const updatedItem = { ...item, ...editValues }
    const result = await updateInventoryItem(updatedItem)

    if (result.success) {
      setInventory(inventory.map((inv) => (inv.id === item.id ? updatedItem : inv)))
      setEditingId(null)
      setEditValues({})
    } else {
      alert('Error updating inventory: ' + result.error)
    }
  }

  const handleAddProduct = async () => {
    if (!newProductName.trim()) {
      alert('Please enter a product name')
      return
    }

    const result = await createInventoryItem(merchant.merchant_id, newProductName)

    if (result.success) {
      const newItem: InventoryItem = {
        id: `inv_${Date.now()}`,
        merchant_id: merchant.merchant_id,
        product_id: `PROD${Date.now()}`,
        product_name: newProductName,
        current_stock: 0,
        minimum_stock: 10,
        maximum_stock: 100,
        status: 'danger',
        last_updated: new Date().toISOString(),
      }
      setInventory([...inventory, newItem])
      setNewProductName('')
      setShowAddForm(false)
    } else {
      alert('Error adding product: ' + result.error)
    }
  }

  const stats = {
    totalProducts: inventory.length,
    goodStock: inventory.filter((i) => i.status === 'good').length,
    warningStock: inventory.filter((i) => i.status === 'warning').length,
    dangerStock: inventory.filter((i) => i.status === 'danger').length,
  }

  return (
    <div className="flex">
      <Sidebar merchantName={merchant?.merchant_name} merchantId={merchant?.merchant_id} />

      <main className="flex-1">
        <Header merchantName={merchant?.merchant_name} merchantId={merchant?.merchant_id} />

        <div className="max-w-6xl mx-auto p-4 md:p-6 lg:p-12">
          <header className="mb-8 md:mb-10">
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">Inventory Management</h2>
            <p className="text-slate-500 font-medium text-sm md:text-base">Track your product stock levels and plan refills to avoid running out of stock.</p>
          </header>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6 mb-8 md:mb-10">
            <div className="bg-white p-4 md:p-6 rounded-2xl border border-slate-100 shadow-sm">
              <p className="text-xs font-bold text-slate-500 uppercase">Total Products</p>
              <h3 className="text-2xl font-black text-slate-900 mt-1">{stats.totalProducts}</h3>
            </div>
            <div className="bg-white p-4 md:p-6 rounded-2xl border border-green-200 shadow-sm">
              <p className="text-xs font-bold text-green-600 uppercase">✓ Good Stock</p>
              <h3 className="text-2xl font-black text-green-700 mt-1">{stats.goodStock}</h3>
            </div>
            <div className="bg-white p-4 md:p-6 rounded-2xl border border-yellow-200 shadow-sm">
              <p className="text-xs font-bold text-yellow-600 uppercase">⚠ Low Stock</p>
              <h3 className="text-2xl font-black text-yellow-700 mt-1">{stats.warningStock}</h3>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-red-200 shadow-sm">
              <p className="text-xs font-bold text-red-600 uppercase">● Critical</p>
              <h3 className="text-2xl font-black text-red-700 mt-1">{stats.dangerStock}</h3>
            </div>
          </div>

          {/* Add Product Button */}
          <div className="mb-6 flex justify-between items-center">
            <h3 className="text-lg font-bold text-slate-900">Product Inventory</h3>
            {!showAddForm && (
              <button
                onClick={() => setShowAddForm(true)}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition"
              >
                <Plus className="w-4 h-4" />
                Add Product
              </button>
            )}
          </div>

          {/* Add Product Form */}
          {showAddForm && (
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm mb-6">
              <div className="flex gap-3 items-end">
                <div className="flex-1">
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Product Name</label>
                  <input
                    type="text"
                    value={newProductName}
                    onChange={(e) => setNewProductName(e.target.value)}
                    placeholder="e.g., Cooking Oil (5L)"
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-red-100"
                  />
                </div>
                <button
                  onClick={handleAddProduct}
                  className="px-4 py-2 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition"
                >
                  Add
                </button>
                <button
                  onClick={() => {
                    setShowAddForm(false)
                    setNewProductName('')
                  }}
                  className="px-4 py-2 bg-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-300 transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Inventory Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {inventory.map((item) => {
              const colors = getStatusColor(item.status)
              const percentage = getStockPercentage(item)
              const isEditing = editingId === item.id

              return (
                <div key={item.id} className={`rounded-2xl border p-6 transition ${colors.bg} ${colors.border} border-2`}>
                  {!isEditing ? (
                    <>
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h4 className="font-bold text-slate-900">{item.product_name}</h4>
                          <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-bold ${colors.badge}`}>
                            {colors.label}
                          </span>
                        </div>
                        <button
                          onClick={() => handleEditStart(item)}
                          className="p-2 hover:bg-slate-200 rounded-lg transition"
                        >
                          <Edit2 className="w-4 h-4 text-slate-600" />
                        </button>
                      </div>

                      {/* Stock Progress Bar */}
                      <div className="mb-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-bold text-slate-700">{item.current_stock} units</span>
                          <span className="text-xs text-slate-600">{Math.round(percentage)}% full</span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                          <div
                            className={`h-full transition-all ${
                              item.status === 'good' ? 'bg-green-500' : item.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${Math.min(percentage, 100)}%` }}
                          />
                        </div>
                      </div>

                      {/* Stock Info */}
                      <div className="space-y-2 text-sm text-slate-700">
                        <div className="flex justify-between">
                          <span className="font-medium">Min Stock:</span>
                          <span>{item.minimum_stock} units</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium">Max Stock:</span>
                          <span>{item.maximum_stock} units</span>
                        </div>
                        <div className="flex justify-between text-xs text-slate-500">
                          <span>Updated:</span>
                          <span>{new Date(item.last_updated).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Current Stock</label>
                          <input
                            type="number"
                            value={editValues.current_stock || 0}
                            onChange={(e) => handleEditChange('current_stock', parseInt(e.target.value))}
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-red-100"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Minimum Stock</label>
                          <input
                            type="number"
                            value={editValues.minimum_stock || 0}
                            onChange={(e) => handleEditChange('minimum_stock', parseInt(e.target.value))}
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-red-100"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Maximum Stock</label>
                          <input
                            type="number"
                            value={editValues.maximum_stock || 0}
                            onChange={(e) => handleEditChange('maximum_stock', parseInt(e.target.value))}
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-red-100"
                          />
                        </div>
                      </div>
                      <div className="flex gap-2 mt-4">
                        <button
                          onClick={() => handleSave(item)}
                          className="flex-1 px-3 py-2 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 transition flex items-center justify-center gap-2"
                        >
                          <Save className="w-4 h-4" />
                          Save
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="flex-1 px-3 py-2 bg-slate-200 text-slate-700 rounded-lg font-bold hover:bg-slate-300 transition flex items-center justify-center gap-2"
                        >
                          <X className="w-4 h-4" />
                          Cancel
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )
            })}
          </div>

          {inventory.length === 0 && (
            <div className="text-center py-12 bg-white rounded-3xl border border-slate-100">
              <p className="text-slate-500 font-medium">No products yet. Add your first product to start tracking inventory.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
