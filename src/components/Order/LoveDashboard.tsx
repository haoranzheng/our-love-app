'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { LovePoints } from './types'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, Coins, TrendingUp } from 'lucide-react'
import CountUpAnimation from '../CountUpAnimation' // Assuming we have or can use a simple counter, or implement one inline

export default function LoveDashboard() {
  const [points, setPoints] = useState<LovePoints | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const fetchPoints = async () => {
    const { data, error } = await supabase
      .from('love_points')
      .select('*')
      .single()
    
    if (data) setPoints(data)
    setLoading(false)
  }

  useEffect(() => {
    fetchPoints()

    const channel = supabase
      .channel('love_points_dashboard')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'love_points'
        },
        (payload) => {
          if (payload.new) {
            setPoints(payload.new as LovePoints)
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  if (loading) return null

  if (!points) return null

  return (
    <div className="w-full max-w-md mx-auto mb-6 px-4">
      <div className="bg-gradient-to-r from-pink-400 to-rose-400 rounded-2xl p-4 text-white shadow-lg shadow-pink-200 relative overflow-hidden">
        {/* Background Patterns */}
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <Heart className="w-24 h-24 rotate-12" />
        </div>
        <div className="absolute -bottom-4 -left-4 p-4 opacity-10">
          <Coins className="w-20 h-20 -rotate-12" />
        </div>

        <div className="relative z-10 flex justify-between items-center">
          {/* Current Balance */}
          <div className="flex-1">
            <div className="flex items-center gap-2 text-pink-100 text-sm font-medium mb-1">
              <Coins className="w-4 h-4" />
              当前爱意值
            </div>
            <div className="text-3xl font-bold flex items-baseline gap-1">
              <CountUpAnimation target={points.current_balance} />
              <span className="text-sm font-normal opacity-80">pts</span>
            </div>
          </div>

          {/* Divider */}
          <div className="w-px h-12 bg-white/20 mx-4"></div>

          {/* Total Spent */}
          <div className="flex-1 text-right">
            <div className="flex items-center justify-end gap-2 text-pink-100 text-sm font-medium mb-1">
              已为爱消费
              <TrendingUp className="w-4 h-4" />
            </div>
            <div className="text-2xl font-bold flex items-baseline justify-end gap-1">
              <CountUpAnimation target={points.total_spent} />
              <span className="text-sm font-normal opacity-80">pts</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
