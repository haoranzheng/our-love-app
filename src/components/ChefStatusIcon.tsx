'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { motion, AnimatePresence } from 'framer-motion'
import { ChefHat, CookingPot } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function ChefStatusIcon() {
  const [isCooking, setIsCooking] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    // Check initial status
    const checkStatus = async () => {
      const { data, error } = await supabase
        .from('meal_orders')
        .select('status')
        .eq('status', 'cooking')
        .limit(1)
      
      if (!error && data && data.length > 0) {
        setIsCooking(true)
      } else {
        setIsCooking(false)
      }
    }

    checkStatus()

    // Realtime subscription
    const channel = supabase
      .channel('chef_status_icon_realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'meal_orders'
        },
        () => {
          // Re-check status on any change (including cancellations)
          checkStatus()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative z-50"
    >
      <button
        onClick={() => router.push('/order')}
        className={`relative p-2 rounded-full backdrop-blur-md shadow-lg border transition-all ${
          isCooking 
            ? 'bg-orange-100/80 border-orange-200 text-orange-600 shadow-orange-200' 
            : 'bg-white/50 border-white/60 text-pink-400 hover:bg-white/80'
        }`}
      >
        <AnimatePresence mode="wait">
          {isCooking ? (
            <motion.div
              key="cooking"
              initial={{ scale: 0 }}
              animate={{ 
                scale: 1,
                rotate: [0, -5, 5, -5, 0]
              }}
              transition={{
                rotate: {
                  repeat: Infinity,
                  duration: 0.5,
                  repeatType: "reverse"
                }
              }}
              className="relative"
            >
              <CookingPot className="w-6 h-6" />
              
              {/* Steam Animation */}
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 pointer-events-none">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="absolute bottom-0 left-1/2 w-1.5 h-3 bg-orange-300/50 rounded-full blur-[1px]"
                    initial={{ y: 0, opacity: 0, x: (i - 1) * 4 }}
                    animate={{
                      y: -15 - i * 3,
                      opacity: [0, 0.8, 0],
                      scaleY: [1, 1.5, 2]
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      delay: i * 0.4,
                      ease: "easeOut"
                    }}
                  />
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="idle"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
            >
              <ChefHat className="w-6 h-6" />
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Badge */}
        {isCooking && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white animate-pulse"
          />
        )}
      </button>
    </motion.div>
  )
}
