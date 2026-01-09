'use client'

import { motion } from 'framer-motion'
import { Plus } from 'lucide-react'
import { Dish } from './types'

interface DishCardProps {
  dish: Dish
  onAdd: (rect: DOMRect) => void
}

export default function DishCard({ dish, onAdd }: DishCardProps) {
  const handleAdd = (e: React.MouseEvent) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    onAdd(rect)
  }

  return (
    <div className="flex gap-3 mb-6 p-2 bg-white/40 backdrop-blur-sm rounded-xl border border-white/60 shadow-sm">
      <div className="w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
        {dish.image_url ? (
          <img src={dish.image_url} alt={dish.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-2xl">🍱</div>
        )}
      </div>
      
      <div className="flex-1 flex flex-col justify-between py-1">
        <div>
          <h3 className="font-bold text-gray-800">{dish.name}</h3>
          <p className="text-xs text-gray-500 line-clamp-2 mt-1">{dish.description}</p>
        </div>
        
        <div className="flex justify-between items-end">
          <div className="text-pink-600 font-bold text-lg">
            <span className="text-xs mr-0.5">❤️</span>
            {dish.price}
          </div>
          
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={handleAdd}
            className="w-7 h-7 bg-pink-500 rounded-full flex items-center justify-center text-white shadow-md shadow-pink-200"
          >
            <Plus className="w-4 h-4" />
          </motion.button>
        </div>
      </div>
    </div>
  )
}
