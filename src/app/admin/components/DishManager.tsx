'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Dish } from '@/components/Order/Menu/types'
import { Plus, Edit2, Trash2, Loader2, Check, XCircle } from 'lucide-react'
import { motion } from 'framer-motion'
import DishFormModal from './DishFormModal'
import ConfirmModal from '@/components/ConfirmModal'

export default function DishManager() {
  const [dishes, setDishes] = useState<Dish[]>([])
  const [loading, setLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingDish, setEditingDish] = useState<Dish | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean, id: string | null }>({ isOpen: false, id: null })
  const supabase = createClient()

  const fetchDishes = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('dishes')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (data) setDishes(data)
    setLoading(false)
  }

  useEffect(() => {
    fetchDishes()
  }, [])

  const handleDelete = async () => {
    if (!deleteConfirm.id) return
    
    try {
      const { error } = await supabase
        .from('dishes')
        .delete()
        .eq('id', deleteConfirm.id)
      
      if (error) throw error
      fetchDishes()
    } catch (error) {
      alert('删除失败')
    } finally {
      setDeleteConfirm({ isOpen: false, id: null })
    }
  }

  const handleEdit = (dish: Dish) => {
    setEditingDish(dish)
    setIsFormOpen(true)
  }

  const handleAddNew = () => {
    setEditingDish(null)
    setIsFormOpen(true)
  }

  const toggleAvailability = async (dish: Dish) => {
    // Optimistic update
    const newStatus = !dish.is_available
    setDishes(prev => prev.map(d => d.id === dish.id ? { ...d, is_available: newStatus } : d))

    const { error } = await supabase
      .from('dishes')
      .update({ is_available: newStatus })
      .eq('id', dish.id)
    
    if (error) {
      alert('状态更新失败')
      fetchDishes() // Revert
    }
  }

  if (loading && dishes.length === 0) return <div className="flex justify-center p-10"><Loader2 className="animate-spin text-pink-400" /></div>

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-800">菜单管理</h2>
        <button
          onClick={handleAddNew}
          className="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 shadow-lg shadow-pink-200 transition-all"
        >
          <Plus className="w-4 h-4" />
          新菜品
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {dishes.map(dish => (
          <motion.div
            key={dish.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`bg-white rounded-xl p-4 border shadow-sm flex gap-4 ${!dish.is_available ? 'opacity-60 grayscale-[0.5]' : ''}`}
          >
            <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
              {dish.image_url ? (
                <img src={dish.image_url} alt={dish.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-2xl">🍱</div>
              )}
            </div>

            <div className="flex-1 min-w-0 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start">
                  <h3 className="font-bold text-gray-800 truncate pr-2">{dish.name}</h3>
                  <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full flex-shrink-0">{dish.category}</span>
                </div>
                <p className="text-pink-500 font-bold text-sm mt-1">❤️ {dish.price}</p>
              </div>

              <div className="flex justify-end gap-2 mt-2">
                <button
                  onClick={() => toggleAvailability(dish)}
                  className={`p-1.5 rounded-lg transition-colors ${
                    dish.is_available ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                  }`}
                  title={dish.is_available ? '下架' : '上架'}
                >
                  {dish.is_available ? <Check className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => handleEdit(dish)}
                  className="p-1.5 bg-blue-50 text-blue-500 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setDeleteConfirm({ isOpen: true, id: dish.id })}
                  className="p-1.5 bg-red-50 text-red-500 rounded-lg hover:bg-red-100 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <DishFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSuccess={fetchDishes}
        initialData={editingDish}
      />

      <ConfirmModal
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, id: null })}
        onConfirm={handleDelete}
        title="确认删除"
        content="删除后无法恢复，确定要移除这道菜吗？"
      />
    </div>
  )
}
