'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { MealOrder } from './types'
import { createClient } from '@/utils/supabase/client'
import { Loader2, CheckCircle2, ChefHat, Clock } from 'lucide-react'
import { useState } from 'react'

interface ChefDashboardProps {
  orders: MealOrder[]
}

export default function ChefDashboard({ orders }: ChefDashboardProps) {
  const supabase = createClient()
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  const updateStatus = async (id: string, newStatus: MealOrder['status']) => {
    setUpdatingId(id)
    try {
      const { error } = await supabase
        .from('meal_orders')
        .update({ status: newStatus })
        .eq('id', id)

      if (error) throw error
    } catch (error) {
      console.error('Error updating status:', error)
      alert('状态更新失败')
    } finally {
      setUpdatingId(null)
    }
  }

  // Filter out delivered orders from the main view to keep it clean, or show them in a separate section?
  // For now, show active orders (pending/cooking) at top, delivered at bottom or hidden.
  // Requirement: "Todo list showing all 'pending' orders". And "Start Cooking" / "Done".
  
  const activeOrders = orders.filter(o => o.status !== 'delivered' && o.status !== 'cancelled').sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  const completedOrders = orders.filter(o => o.status === 'delivered').sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

  return (
    <div className="space-y-6">
      <div className="bg-white/30 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-white/50">
        <h2 className="text-2xl font-bold text-pink-600 mb-6 flex items-center gap-2">
          <span>👨‍🍳</span> 待办订单 ({activeOrders.length})
        </h2>

        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {activeOrders.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center text-gray-500 py-8"
              >
                <p>暂时没有订单，休息一下吧~ ☕</p>
              </motion.div>
            ) : (
              activeOrders.map((order) => (
                <motion.div
                  key={order.id}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className={`p-4 rounded-xl border-2 transition-colors ${
                    order.status === 'cooking' 
                      ? 'bg-orange-50/80 border-orange-200' 
                      : 'bg-white/60 border-pink-100'
                  }`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-lg font-bold text-gray-800">{order.dish_name}</h3>
                      <p className="text-sm text-gray-500">
                        点单人: <span className="font-medium text-pink-500">{order.requester}</span>
                        <span className="mx-2">•</span>
                        {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <div className="text-2xl">
                      {order.status === 'cooking' ? '🔥' : '⏳'}
                    </div>
                  </div>

                  {order.note && (
                    <div className="bg-white/50 p-2 rounded-lg text-sm text-gray-600 mb-4 border border-white/50">
                      📝 {order.note}
                    </div>
                  )}

                  <div className="flex gap-3 mt-2">
                    {order.status === 'pending' && (
                      <button
                        onClick={() => updateStatus(order.id, 'cooking')}
                        disabled={updatingId === order.id}
                        className="flex-1 py-2 px-4 bg-orange-400 hover:bg-orange-500 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
                      >
                        {updatingId === order.id ? <Loader2 className="animate-spin w-4 h-4" /> : <ChefHat className="w-4 h-4" />}
                        开始制作
                      </button>
                    )}
                    
                    <button
                      onClick={() => updateStatus(order.id, 'delivered')}
                      disabled={updatingId === order.id}
                      className="flex-1 py-2 px-4 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
                    >
                      {updatingId === order.id ? <Loader2 className="animate-spin w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                      完成投喂
                    </button>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </div>

      {completedOrders.length > 0 && (
        <div className="opacity-70">
          <h3 className="text-lg font-bold text-gray-600 mb-4 px-2">最近完成</h3>
          <div className="space-y-2">
            {completedOrders.slice(0, 5).map(order => (
              <div key={order.id} className="bg-white/20 p-3 rounded-xl border border-white/30 flex justify-between items-center">
                <span className="text-gray-700 line-through decoration-pink-500/50">{order.dish_name}</span>
                <span className="text-xs text-gray-500">已送达 ✅</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
