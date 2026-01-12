'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { LayoutDashboard, UtensilsCrossed, ShoppingBag, Gift } from 'lucide-react'
import DishManager from './components/DishManager'
import OrderManager from './components/OrderManager'
import LoveManager from './components/LoveManager'

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<'dishes' | 'orders' | 'rewards'>('dishes')

  return (
    <div className="min-h-screen bg-[#f8f9fa] pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <LayoutDashboard className="w-5 h-5 text-pink-500" />
            主厨工作台
          </h1>
          <div className="text-sm text-gray-500">v1.1.0</div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6 flex flex-col md:flex-row gap-6">
        {/* Sidebar Navigation */}
        <div className="w-full md:w-64 flex-shrink-0">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden sticky top-24">
            <nav className="flex md:flex-col">
              <button
                onClick={() => setActiveTab('dishes')}
                className={`flex-1 md:w-full p-4 flex items-center gap-3 text-sm font-medium transition-colors border-b md:border-b-0 md:border-l-4 ${
                  activeTab === 'dishes'
                    ? 'bg-pink-50 text-pink-600 border-pink-500'
                    : 'text-gray-600 hover:bg-gray-50 border-transparent'
                }`}
              >
                <UtensilsCrossed className="w-5 h-5" />
                菜品管理
              </button>
              
              <button
                onClick={() => setActiveTab('orders')}
                className={`flex-1 md:w-full p-4 flex items-center gap-3 text-sm font-medium transition-colors border-b md:border-b-0 md:border-l-4 ${
                  activeTab === 'orders'
                    ? 'bg-pink-50 text-pink-600 border-pink-500'
                    : 'text-gray-600 hover:bg-gray-50 border-transparent'
                }`}
              >
                <ShoppingBag className="w-5 h-5" />
                订单管理
              </button>

              <button
                onClick={() => setActiveTab('rewards')}
                className={`flex-1 md:w-full p-4 flex items-center gap-3 text-sm font-medium transition-colors border-b md:border-b-0 md:border-l-4 ${
                  activeTab === 'rewards'
                    ? 'bg-pink-50 text-pink-600 border-pink-500'
                    : 'text-gray-600 hover:bg-gray-50 border-transparent'
                }`}
              >
                <Gift className="w-5 h-5" />
                爱意激励
              </button>
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'dishes' && <DishManager />}
            {activeTab === 'orders' && <OrderManager />}
            {activeTab === 'rewards' && <LoveManager />}
          </motion.div>
        </div>
      </div>
    </div>
  )
}
