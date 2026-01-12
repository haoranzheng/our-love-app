'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/utils/supabase/client'
import { Loader2, X, Send, ShoppingBag, AlertCircle } from 'lucide-react'
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
  const [balance, setBalance] = useState<number | null>(null)
  const [loadingBalance, setLoadingBalance] = useState(false)
  const supabase = createClient()
  
  const totalPrice = cart.reduce((acc, i) => acc + i.count * i.price, 0)
  const isBalanceSufficient = balance !== null && balance >= totalPrice

  useEffect(() => {
    if (isOpen) {
      const fetchBalance = async () => {
        setLoadingBalance(true)
        const { data } = await supabase.from('love_points').select('current_balance').single()
        if (data) setBalance(data.current_balance)
        setLoadingBalance(false)
      }
      fetchBalance()
    }
  }, [isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      const { error } = await supabase.rpc('create_order_with_payment', {
        p_dish_name: `点单合集 (${cart.length}样)`,
        p_requester: '宝宝',
        p_note: note,
        p_items: cart,
        p_total_price: totalPrice,
        p_order_type: 'menu'
      })

      if (error) throw error

      setNote('')
      onSuccess()
      onClose()
      alert('订单发送成功！主厨马上就到！')
    } catch (error: any) {
      console.error('Error placing order:', error)
      alert(error.message || '下单失败，请重试 😭')
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

            {/* Balance Check */}
            <div className="mb-4">
              {loadingBalance ? (
                <div className="text-xs text-gray-400 flex items-center gap-1">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  正在校验余额...
                </div>
              ) : (
                <div className={`text-sm flex items-center gap-1 ${isBalanceSufficient ? 'text-green-600' : 'text-red-500'}`}>
                  {isBalanceSufficient ? (
                    '✅ 余额充足'
                  ) : (
                    <>
                      <AlertCircle className="w-4 h-4" />
                      余额不足 (现有 {balance} pts)，快去向主厨撒娇~
                    </>
                  )}
                </div>
              )}
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
                disabled={isSubmitting || !isBalanceSufficient}
                className={`w-full py-3 text-white rounded-xl font-bold shadow-lg transition-all flex items-center justify-center gap-2 
                  ${isSubmitting || !isBalanceSufficient 
                    ? 'bg-gray-300 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-pink-500 to-rose-500 hover:shadow-pink-500/30'}`}
              >
                {isSubmitting ? <Loader2 className="animate-spin w-5 h-5" /> : <Send className="w-5 h-5" />}
                {isBalanceSufficient ? '立即下单' : '爱意值不足'}
              </button>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
