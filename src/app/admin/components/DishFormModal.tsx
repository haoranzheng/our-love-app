'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Loader2, Upload, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Dish } from '@/components/Order/Menu/types'

interface DishFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  initialData?: Dish | null
}

const CATEGORIES = ['主食', '小吃', '特饮', '夜宵', '甜点']

export default function DishFormModal({ isOpen, onClose, onSuccess, initialData }: DishFormModalProps) {
  const [formData, setFormData] = useState<Partial<Dish>>(
    initialData || {
      name: '',
      description: '',
      price: 0,
      category: '主食',
      is_available: true,
      image_url: ''
    }
  )
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploading, setUploading] = useState(false)
  const supabase = createClient()

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return

    const file = e.target.files[0]
    setUploading(true)

    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random()}.${fileExt}`
      const filePath = `dish_images/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('dish_images')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('dish_images')
        .getPublicUrl(filePath)

      setFormData(prev => ({ ...prev, image_url: publicUrl }))
    } catch (error) {
      console.error('Error uploading image:', error)
      alert('图片上传失败')
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      if (initialData?.id) {
        // Update
        const { error } = await supabase
          .from('dishes')
          .update(formData)
          .eq('id', initialData.id)
        if (error) throw error
      } else {
        // Insert
        const { error } = await supabase
          .from('dishes')
          .insert([formData])
        if (error) throw error
      }

      onSuccess()
      onClose()
    } catch (error) {
      console.error('Error saving dish:', error)
      alert('保存失败')
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
            className="fixed inset-0 bg-black/40 z-[70] backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-4 md:inset-auto md:top-[10%] md:left-1/2 md:-translate-x-1/2 md:w-[500px] z-[70] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
          >
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-pink-50/50">
              <h2 className="text-lg font-bold text-gray-800">
                {initialData ? '编辑菜品' : '新增菜品'}
              </h2>
              <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
              {/* Image Upload */}
              <div className="flex justify-center">
                <div className="relative w-32 h-32 rounded-xl bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden hover:border-pink-300 transition-colors cursor-pointer group">
                  {formData.image_url ? (
                    <img src={formData.image_url} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <Upload className="w-8 h-8 text-gray-400 group-hover:text-pink-400" />
                  )}
                  {uploading && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <Loader2 className="w-6 h-6 text-white animate-spin" />
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">菜名</label>
                <input
                  type="text"
                  value={formData.name || ''}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-200 focus:border-pink-400 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">分类</label>
                <select
                  value={formData.category || '主食'}
                  onChange={e => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-200 focus:border-pink-400 outline-none bg-white"
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">价格 (爱意值)</label>
                <input
                  type="number"
                  value={formData.price || 0}
                  onChange={e => setFormData({ ...formData, price: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-200 focus:border-pink-400 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">描述</label>
                <textarea
                  value={formData.description || ''}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-200 focus:border-pink-400 outline-none h-20 resize-none"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_available"
                  checked={formData.is_available}
                  onChange={e => setFormData({ ...formData, is_available: e.target.checked })}
                  className="w-4 h-4 text-pink-500 border-gray-300 rounded focus:ring-pink-400"
                />
                <label htmlFor="is_available" className="text-sm text-gray-700">立即上架</label>
              </div>
            </form>

            <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-200 rounded-lg transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting || uploading}
                className="px-6 py-2 bg-pink-500 text-white font-medium rounded-lg hover:bg-pink-600 transition-colors disabled:opacity-70 flex items-center gap-2"
              >
                {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                保存
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
