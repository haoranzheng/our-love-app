'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { motion, AnimatePresence } from 'framer-motion'
import { MealOrder } from '@/components/Order/types'
import MenuOrdering from '@/components/Order/Menu/MenuOrdering'
import ChefDashboard from '@/components/Order/ChefDashboard'
import MyOrderList from '@/components/Order/MyOrderList'
import LoveDashboard from '@/components/Order/LoveDashboard'
import SavingsStats from '@/components/Order/SavingsStats'
import { Utensils, Heart } from 'lucide-react'

export default function OrderPage() {
  const [role, setRole] = useState<'hungry' | 'chef'>('hungry')
  const [orders, setOrders] = useState<MealOrder[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('meal_orders')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      if (data) setOrders(data as MealOrder[])
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()

    const channel = supabase
      .channel('meal_orders_realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'meal_orders'
        },
        (payload) => {
          console.log('Realtime update:', payload)
          // Simple strategy: refetch to ensure consistency
          fetchOrders()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-orange-50 pb-20">
      {/* Header / Toggle */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-pink-100 shadow-sm">
        <div className="max-w-md mx-auto px-4 py-3 flex justify-between items-center">
          <h1 className="text-xl font-bold text-pink-600 flex items-center gap-2">
            <Heart className="fill-pink-500 text-pink-500 w-5 h-5" />
            恋爱小餐馆
          </h1>
          
          <div className="bg-gray-100 p-1 rounded-full flex relative">
            <motion.div
              layoutId="active-pill"
              className={`absolute inset-1 w-[calc(50%-4px)] rounded-full shadow-sm ${
                role === 'hungry' ? 'bg-white left-1' : 'bg-white left-[50%]'
              }`}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            />
            <button
              onClick={() => setRole('hungry')}
              className={`relative z-10 px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                role === 'hungry' ? 'text-pink-600' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              我饿了 😋
            </button>
            <button
              onClick={() => setRole('chef')}
              className={`relative z-10 px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                role === 'chef' ? 'text-orange-600' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              我是主厨 👨‍🍳
            </button>
          </div>
        </div>
      </div>

      <main className="max-w-md mx-auto px-4 py-6">
        <LoveDashboard />
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loader"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex justify-center py-20"
            >
              <Utensils className="w-8 h-8 text-pink-300 animate-bounce" />
            </motion.div>
          ) : role === 'hungry' ? (
            <motion.div
              key="hungry"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <MenuOrdering />
              <MyOrderList orders={orders} />
              <SavingsStats />
            </motion.div>
          ) : (
            <motion.div
              key="chef"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <ChefDashboard orders={orders} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Decorative background elements */}
      <div className="fixed top-20 left-10 text-4xl opacity-10 pointer-events-none -z-10 animate-pulse">🥗</div>
      <div className="fixed bottom-40 right-10 text-4xl opacity-10 pointer-events-none -z-10 animate-bounce delay-700">🍳</div>
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 text-9xl opacity-[0.03] pointer-events-none -z-10">🍱</div>
    </div>
  )
}
