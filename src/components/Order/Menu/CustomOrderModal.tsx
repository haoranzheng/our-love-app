'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/utils/supabase/client'
import { Loader2, X, Send } from 'lucide-react'

interface CustomOrderModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export default function CustomOrderModal({ isOpen, onClose, onSuccess }: CustomOrderModalProps) {
  const [dishName, setDishName] = useState('')
  const [note, setNote] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!dishName.trim()) return

    setIsSubmitting(true)
    try {
      const { error } = await supabase
        .from('meal_orders')
        .insert([
          {
            dish_name: dishName,
            note: note,
            requester: '宝宝', // TODO: Fetch real user name
            status: 'pending',
            order_type: 'custom',
            total_price: 0 // Priceless love
          }
        ])

      if (error) throw error

      setDishName('')
      setNote('')
      onSuccess()
      onClose()
      alert('自定义订单发送成功！等待投喂~ 😋')
    } catch (error) {
      console.error('Error placing order:', error)
      alert('下单失败，请重试 😭')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 z-50 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed inset-x-4 top-[20%] z-50 bg-white rounded-2xl p-6 shadow-2xl border-2 border-pink-100 max-w-sm mx-auto"
          >
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-xl font-bold text-pink-600 mb-1">想吃点特别的？</h2>
            <p className="text-xs text-gray-500 mb-6">主厨时刻准备着为您效劳 👨‍🍳</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">菜名</label>
                <input
                  type="text"
                  value={dishName}
                  onChange={(e) => setDishName(e.target.value)}
                  placeholder="例如：想吃楼下的烤冷面..."
                  className="w-full px-4 py-2 rounded-xl border-pink-200 focus:border-pink-500 focus:ring-pink-500 bg-pink-50/50"
                  required
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">备注</label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="写下你的特殊要求..."
                  className="w-full px-4 py-2 rounded-xl border-pink-200 focus:border-pink-500 focus:ring-pink-500 bg-pink-50/50 h-24 resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-xl font-bold shadow-lg hover:shadow-pink-500/30 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {isSubmitting ? <Loader2 className="animate-spin w-5 h-5" /> : <Send className="w-5 h-5" />}
                发送给主厨
              </button>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
