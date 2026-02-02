import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ShoppingBag, ClipboardList, Package, BarChart3, Settings, LayoutDashboard, ChevronLeft, ChevronRight } from 'lucide-react'

interface SidebarProps {
  merchantName?: string
  merchantId?: string
}

export function Sidebar({ merchantName = 'Simba Mart', merchantId = '#88219' }: SidebarProps) {
  const location = useLocation()
  const [isCollapsed, setIsCollapsed] = useState(false)

  const isActive = (path: string) => location.pathname === path

  return (
    <aside className={`h-screen bg-white border-r border-slate-200 sticky top-0 hidden lg:flex flex-col transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-64'}`}>
      <div className="p-6 flex items-center justify-between">
        {!isCollapsed && <h1 className="text-xl font-extrabold text-red-600 flex items-center gap-2">
          <LayoutDashboard className="w-5 h-5" /> SIMBA
        </h1>}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1 hover:bg-slate-100 rounded-lg transition"
          title={isCollapsed ? 'Expand' : 'Collapse'}
        >
          {isCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </button>
      </div>

      <nav className="flex-1 px-4 space-y-1">
        <Link
          to="/dashboard"
          className={`flex items-center gap-3 px-4 py-3 rounded-lg font-semibold transition ${
            isActive('/dashboard') ? 'sidebar-active' : 'text-slate-600 hover:bg-slate-50'
          }`}
          title="Live Orders"
        >
          <ShoppingBag className="w-5 h-5 flex-shrink-0" />
          {!isCollapsed && <span>Live Orders</span>}
        </Link>
        <Link
          to="/history"
          className={`flex items-center gap-3 px-4 py-3 rounded-lg font-semibold transition ${
            isActive('/history') ? 'sidebar-active' : 'text-slate-600 hover:bg-slate-50'
          }`}
          title="Order History"
        >
          <ClipboardList className="w-5 h-5 flex-shrink-0" />
          {!isCollapsed && <span>Order History</span>}
        </Link>
        <Link
          to="/inventory"
          className={`flex items-center gap-3 px-4 py-3 rounded-lg font-semibold transition ${
            isActive('/inventory') ? 'sidebar-active' : 'text-slate-600 hover:bg-slate-50'
          }`}
          title="Inventory"
        >
          <Package className="w-5 h-5 flex-shrink-0" />
          {!isCollapsed && <span>Inventory</span>}
        </Link>
        <Link
          to="/payouts"
          className={`flex items-center gap-3 px-4 py-3 rounded-lg font-semibold transition ${
            isActive('/payouts') ? 'sidebar-active' : 'text-slate-600 hover:bg-slate-50'
          }`}
          title="Payouts & Insights"
        >
          <BarChart3 className="w-5 h-5 flex-shrink-0" />
          {!isCollapsed && <span>Payouts & Insights</span>}
        </Link>
        <Link
          to="/settings"
          className={`flex items-center gap-3 px-4 py-3 rounded-lg font-semibold transition ${
            isActive('/settings') ? 'sidebar-active' : 'text-slate-600 hover:bg-slate-50'
          }`}
          title="Store Settings"
        >
          <Settings className="w-5 h-5 flex-shrink-0" />
          {!isCollapsed && <span>Store Settings</span>}
        </Link>
      </nav>

      <div className="p-4 border-t border-slate-100">
        <Link
          to="/profile"
          className="bg-slate-50 p-3 rounded-xl flex items-center gap-3 hover:bg-slate-100 transition cursor-pointer"
          title={merchantName}
        >
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600 font-bold flex-shrink-0">
            {merchantName.substring(0, 2).toUpperCase()}
          </div>
          {!isCollapsed && <div>
            <p className="text-xs font-bold text-slate-900">{merchantName}</p>
            <p className="text-[10px] text-slate-500">ID: {merchantId}</p>
          </div>}
        </Link>
      </div>
    </aside>
  )
}
