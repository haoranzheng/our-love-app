'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, Loader2 } from 'lucide-react'

interface ConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  content: string
  isLoading?: boolean
}

export default function ConfirmModal({ isOpen, onClose, onConfirm, title, content, isLoading }: ConfirmModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 z-[60] backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed inset-x-4 top-[35%] z-[60] bg-white/90 backdrop-blur-xl rounded-2xl p-6 shadow-2xl border border-white/50 max-w-sm mx-auto text-center"
          >
            <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-6 h-6 text-pink-500" />
            </div>

            <h3 className="text-lg font-bold text-gray-800 mb-2">{title}</h3>
            <p className="text-sm text-gray-500 mb-6 leading-relaxed">
              {content}
            </p>

            <div className="flex gap-3">
              <button
                onClick={onClose}
                disabled={isLoading}
                className="flex-1 py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl font-medium transition-colors disabled:opacity-70"
              >
                再想想
              </button>
              <button
                onClick={onConfirm}
                disabled={isLoading}
                className="flex-1 py-2.5 px-4 bg-red-500 hover:bg-red-600 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-70 shadow-lg shadow-red-200"
              >
                {isLoading ? <Loader2 className="animate-spin w-4 h-4" /> : '确定撤回'}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
