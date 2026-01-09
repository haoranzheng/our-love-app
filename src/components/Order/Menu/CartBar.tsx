'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { ShoppingBag, X } from 'lucide-react'
import { CartItem } from './types'

interface CartBarProps {
  items: CartItem[]
  onCheckout: () => void
  onClear: () => void
}

export default function CartBar({ items, onCheckout, onClear }: CartBarProps) {
  const totalCount = items.reduce((acc, item) => acc + item.count, 0)
  const totalPrice = items.reduce((acc, item) => acc + item.count * item.price, 0)

  return (
    <div className="fixed bottom-24 left-4 right-4 z-50 pointer-events-none">
      <motion.div
        initial={{ y: 100 }}
        animate={{ y: totalCount > 0 ? 0 : 100 }}
        className="bg-gray-900/90 backdrop-blur-md text-white rounded-full p-2 pl-6 pr-2 shadow-2xl flex items-center justify-between border border-gray-700 pointer-events-auto"
      >
        <div className="flex items-center gap-4" onClick={onClear}>
          <div className="relative">
            <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center">
              <ShoppingBag className="w-5 h-5 text-pink-300" />
            </div>
            <AnimatePresence>
              {totalCount > 0 && (
                <motion.div
                  key={totalCount}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-[10px] font-bold border-2 border-gray-900"
                >
                  {totalCount}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          <div>
            <div className="text-lg font-bold flex items-center">
              <span className="text-pink-400 text-sm mr-1">❤️</span>
              {totalPrice}
            </div>
            <div className="text-xs text-gray-400">已选 {totalCount} 份美味</div>
          </div>
        </div>

        <button
          onClick={onCheckout}
          className="bg-gradient-to-r from-pink-500 to-rose-600 px-6 py-2.5 rounded-full font-bold text-sm shadow-lg shadow-pink-900/50"
        >
          去结算
        </button>
      </motion.div>
    </div>
  )
}
