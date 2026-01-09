'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/utils/supabase/client'
import { Dish, CartItem } from './types'
import DishCard from './DishCard'
import CartBar from './CartBar'
import CustomOrderModal from './CustomOrderModal'
import CheckoutModal from './CheckoutModal'
import { Loader2, Sparkles } from 'lucide-react'

// Dummy categories if DB is empty, but we inserted data in SQL
const CATEGORIES = ['全部', '主食', '小吃', '特饮', '夜宵']

export default function MenuOrdering() {
  const [dishes, setDishes] = useState<Dish[]>([])
  const [activeCategory, setActiveCategory] = useState('全部')
  const [cart, setCart] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false)
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false)
  const supabase = createClient()
  const cartRef = useRef<HTMLDivElement>(null) // To track cart position for animation (simplified)

  useEffect(() => {
    const fetchDishes = async () => {
      const { data, error } = await supabase.from('dishes').select('*').eq('is_available', true)
      if (data) setDishes(data)
      setLoading(false)
    }
    fetchDishes()
  }, [])

  const handleAddToCart = (item: Dish, startRect: DOMRect) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id)
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, count: i.count + 1 } : i)
      }
      return [...prev, { ...item, count: 1 }]
    })

    // Animation Logic (Simplified: just a visual feedback for now)
    // Implementing full parabola needs complex DOM manipulation or fixed overlay
    // For now, let's assume the cart bar handles the "bounce" animation on receiving
  }

  const handleCheckout = async () => {
    setIsCheckoutModalOpen(true)
  }

  const filteredDishes = activeCategory === '全部' 
    ? dishes 
    : dishes.filter(d => d.category === activeCategory)

  // Extract unique categories from actual data if available
  const availableCategories = ['全部', ...Array.from(new Set(dishes.map(d => d.category)))]

  if (loading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin text-pink-400" /></div>

  return (
    <div className="flex h-[calc(100vh-140px)] overflow-hidden rounded-xl border border-pink-100 bg-white/30 backdrop-blur-sm relative">
      {/* Sidebar Categories */}
      <div className="w-24 bg-gray-50/50 overflow-y-auto border-r border-pink-50 scrollbar-hide flex flex-col">
        {/* Custom Order Button */}
        <button
          onClick={() => setIsCustomModalOpen(true)}
          className="w-full py-4 px-2 text-xs font-bold text-pink-600 bg-pink-50 border-b border-pink-100 hover:bg-pink-100 transition-colors flex flex-col items-center gap-1"
        >
          <Sparkles className="w-5 h-5" />
          <span>自定义</span>
        </button>

        {availableCategories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`w-full py-4 text-xs font-medium transition-colors relative ${
              activeCategory === cat ? 'bg-white text-pink-600 font-bold' : 'text-gray-500 hover:bg-gray-100'
            }`}
          >
            {cat}
            {activeCategory === cat && (
              <motion.div 
                layoutId="activeCat"
                className="absolute left-0 top-0 bottom-0 w-1 bg-pink-500"
              />
            )}
          </button>
        ))}
      </div>

      {/* Main List */}
      <div className="flex-1 overflow-y-auto p-4 scrollbar-hide pb-24">
        <h2 className="text-sm font-bold text-gray-500 mb-4 sticky top-0 bg-white/80 backdrop-blur-sm p-2 z-10 rounded-lg">
          {activeCategory}
        </h2>
        
        {filteredDishes.length === 0 ? (
          <div className="text-center text-gray-400 py-10 text-sm">这里空空如也 🍃</div>
        ) : (
          filteredDishes.map(dish => (
            <DishCard key={dish.id} dish={dish} onAdd={(rect) => handleAddToCart(dish, rect)} />
          ))
        )}
      </div>

      <CartBar 
        items={cart} 
        onCheckout={handleCheckout} 
        onClear={() => {
            if(confirm('清空购物车？')) setCart([])
        }} 
      />

      <CustomOrderModal 
        isOpen={isCustomModalOpen} 
        onClose={() => setIsCustomModalOpen(false)}
        onSuccess={() => {
            // Optional: trigger refresh or global state update
        }}
      />

      <CheckoutModal
        isOpen={isCheckoutModalOpen}
        onClose={() => setIsCheckoutModalOpen(false)}
        cart={cart}
        onSuccess={() => setCart([])}
      />
    </div>
  )
}
