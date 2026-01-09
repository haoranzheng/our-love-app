'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MealOrder } from './types'
import { createClient } from '@/utils/supabase/client'
import { Trash2, Loader2, AlertCircle } from 'lucide-react'
import ConfirmModal from '@/components/ConfirmModal'

export default function MyOrderList({ orders }: { orders: MealOrder[] }) {
  const [cancellingId, setCancellingId] = useState<string | null>(null)
  const [confirmModalState, setConfirmModalState] = useState<{ isOpen: boolean, orderId: string | null }>({ isOpen: false, orderId: null })
  const supabase = createClient()

  const onRequestCancel = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setConfirmModalState({ isOpen: true, orderId: id })
  }

  const handleConfirmCancel = async () => {
    const id = confirmModalState.orderId
    if (!id) return

    setCancellingId(id)
    try {
      const { error } = await supabase
        .from('meal_orders')
        .update({ status: 'cancelled' })
        .eq('id', id)

      if (error) throw error
      // Toast logic can be added here or rely on global state
    } catch (error) {
      console.error('Error cancelling order:', error)
      alert('取消失败，请重试')
    } finally {
      setCancellingId(null)
      setConfirmModalState({ isOpen: false, orderId: null })
    }
  }

  // Show active orders (exclude cancelled and delivered for main view, or keep delivered?)
  // Requirement: "In 'My Order' list... add cancel button"
  const activeOrders = orders.filter(o => o.status !== 'cancelled' && o.status !== 'delivered')
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

  if (activeOrders.length === 0) return null

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="mt-8 pb-20"
      >
        <h3 className="text-lg font-bold text-pink-700 mb-4 px-2">我的点单进度</h3>
        <div className="space-y-3">
          <AnimatePresence>
            {activeOrders.map((order) => (
              <motion.div
                key={order.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white/40 backdrop-blur-sm p-4 rounded-xl border border-white/60 flex justify-between items-center group"
              >
                <div>
                  <div className="font-bold text-gray-800">{order.dish_name}</div>
                  <div className="text-xs text-gray-500 mt-1 flex items-center gap-2">
                    <span>{new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    {order.note && <span className="text-pink-400">📝 {order.note}</span>}
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {order.status === 'pending' && (
                    <>
                      <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium border border-gray-200">
                        待处理
                      </span>
                      <button
                        onClick={(e) => onRequestCancel(order.id, e)}
                        disabled={cancellingId === order.id}
                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                        title="取消订单"
                      >
                        {cancellingId === order.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    </>
                  )}
                  
                  {order.status === 'cooking' && (
                    <motion.span
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                      className="px-3 py-1 bg-orange-100 text-orange-600 rounded-full text-xs font-medium border border-orange-200 flex items-center gap-1"
                    >
                      🔥 主厨挥铲中...
                    </motion.span>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </motion.div>

      <ConfirmModal 
        isOpen={confirmModalState.isOpen}
        onClose={() => setConfirmModalState({ isOpen: false, orderId: null })}
        onConfirm={handleConfirmCancel}
        title="小主请三思"
        content="主厨可能已经在热锅了，确定要撤回订单吗？🥺"
        isLoading={!!cancellingId}
      />
    </>
  )
}
