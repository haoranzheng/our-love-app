'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'

export default function OrderForm({ onOrderPlaced }: { onOrderPlaced?: () => void }) {
  const [dishName, setDishName] = useState('')
  const [note, setNote] = useState('')
  const [requester, setRequester] = useState('宝宝') // Default name
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
            requester: requester,
            status: 'pending'
          }
        ])

      if (error) throw error

      setDishName('')
      setNote('')
      if (onOrderPlaced) onOrderPlaced()
      alert('订单发送成功！等待投喂~ 😋')
    } catch (error) {
      console.error('Error placing order:', error)
      alert('下单失败，请重试 😭')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/30 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-white/50"
    >
      <h2 className="text-2xl font-bold text-pink-600 mb-6 flex items-center gap-2">
        <span>🍽️</span> 我饿了...
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-pink-700 mb-1">我是...</label>
          <select
            value={requester}
            onChange={(e) => setRequester(e.target.value)}
            className="w-full px-4 py-2 rounded-xl border-pink-200 focus:border-pink-500 focus:ring-pink-500 bg-white/50"
          >
            <option value="宝宝">宝宝 👧</option>
            <option value="哥哥">哥哥 👦</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-pink-700 mb-1">想吃什么？</label>
          <input
            type="text"
            value={dishName}
            onChange={(e) => setDishName(e.target.value)}
            placeholder="例如：红烧排骨 🍖"
            className="w-full px-4 py-2 rounded-xl border-pink-200 focus:border-pink-500 focus:ring-pink-500 bg-white/50 placeholder-pink-300"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-pink-700 mb-1">备注 / 忌口</label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="例如：不要香菜，多放辣！🌶️"
            className="w-full px-4 py-2 rounded-xl border-pink-200 focus:border-pink-500 focus:ring-pink-500 bg-white/50 placeholder-pink-300 h-24 resize-none"
          />
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-xl font-bold shadow-lg hover:shadow-pink-500/30 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
        >
          {isSubmitting ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              <span>🚀</span> 发送给主厨
            </>
          )}
        </motion.button>
      </form>
    </motion.div>
  )
}
