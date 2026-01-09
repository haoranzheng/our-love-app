'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/utils/supabase/client'
import { Loader2, X, Send, ShoppingBag } from 'lucide-react'
import { CartItem } from './types'

interface CheckoutModalProps {
  isOpen: boolean
  onClose: () => void
  cart: CartItem[]
  onSuccess: () => void
}

export default function CheckoutModal({ isOpen, onClose, cart, onSuccess }: CheckoutModalProps) {
  const [note, setNote] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const supabase = createClient()
  
  const totalPrice = cart.reduce((acc, i) => acc + i.count * i.price, 0)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      const { error } = await supabase.from('meal_orders').insert({
        dish_name: `点单合集 (${cart.length}样)`, 
        requester: '宝宝', // TODO: Fetch real user name or from context
        status: 'pending',
        note: note,
        items: cart,
        total_price: totalPrice,
        order_type: 'menu'
      })

      if (error) throw error

      setNote('')
      onSuccess()
      onClose()
      alert('订单发送成功！主厨马上就到！')
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
            className="fixed inset-x-4 top-[15%] z-50 bg-white rounded-2xl p-6 shadow-2xl border-2 border-pink-100 max-w-sm mx-auto"
          >
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-xl font-bold text-pink-600 mb-4 flex items-center gap-2">
              <ShoppingBag className="w-5 h-5" />
              确认订单
            </h2>

            <div className="bg-gray-50 rounded-xl p-4 mb-4 max-h-40 overflow-y-auto scrollbar-hide border border-gray-100">
              {cart.map(item => (
                <div key={item.id} className="flex justify-between items-center mb-2 last:mb-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-700">{item.name}</span>
                    <span className="text-xs text-gray-400">x{item.count}</span>
                  </div>
                  <span className="text-sm text-pink-500 font-bold">❤️ {item.price * item.count}</span>
                </div>
              ))}
              <div className="border-t border-gray-200 mt-2 pt-2 flex justify-between font-bold">
                <span className="text-gray-600">总计</span>
                <span className="text-pink-600">❤️ {totalPrice}</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">给主厨的备注</label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="例如：多放辣，不要香菜..."
                  className="w-full px-4 py-2 rounded-xl border-pink-200 focus:border-pink-500 focus:ring-pink-500 bg-pink-50/50 h-20 resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-xl font-bold shadow-lg hover:shadow-pink-500/30 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {isSubmitting ? <Loader2 className="animate-spin w-5 h-5" /> : <Send className="w-5 h-5" />}
                立即下单
              </button>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
