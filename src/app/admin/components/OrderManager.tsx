'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { MealOrder } from '@/components/Order/types'
import { 
  Loader2, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  ChefHat, 
  Filter, 
  ShoppingBag, 
  MessageSquare,
  User,
  ChevronDown,
  ChevronUp
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

// Simple relative time formatter
function formatTimeAgo(dateString: string) {
  const date = new Date(dateString)
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diffInSeconds < 60) return '刚刚'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}分钟前`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}小时前`
  return `${Math.floor(diffInSeconds / 86400)}天前`
}

// Status badge component
function StatusBadge({ status }: { status: MealOrder['status'] }) {
  const config = {
    pending: { color: 'bg-yellow-100 text-yellow-700', icon: Clock, label: '待接单' },
    cooking: { color: 'bg-orange-100 text-orange-700', icon: ChefHat, label: '制作中' },
    delivered: { color: 'bg-green-100 text-green-700', icon: CheckCircle2, label: '已送达' },
    cancelled: { color: 'bg-gray-100 text-gray-500', icon: XCircle, label: '已取消' },
  }
  
  const { color, icon: Icon, label } = config[status] || config.pending

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${color}`}>
      <Icon className="w-3.5 h-3.5" />
      {label}
    </span>
  )
}

function OrderItemDetail({ items }: { items: any[] }) {
  const [isExpanded, setIsExpanded] = useState(false)

  if (!items || items.length === 0) return null

  return (
    <div className="mt-2">
      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className="text-xs font-medium text-pink-600 flex items-center gap-1 hover:bg-pink-50 px-2 py-1 rounded-lg transition-colors"
      >
        {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        共 {items.reduce((acc, i) => acc + i.count, 0)} 件菜品明细
      </button>
      
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-gray-50 rounded-lg p-3 mt-2 space-y-2 text-sm text-gray-700 border border-gray-100">
              {items.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center border-b border-gray-100 last:border-0 pb-1 last:pb-0">
                  <span className="font-medium">{item.name}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-gray-500 text-xs">x{item.count}</span>
                    <span className="text-pink-500 font-bold text-xs">❤️ {item.price * item.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function OrderManager() {
  const [orders, setOrders] = useState<MealOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'cooking' | 'completed'>('all')
  const supabase = createClient()

  const fetchOrders = async () => {
    // Only show loading on initial fetch
    if (orders.length === 0) setLoading(true)
    
    const { data, error } = await supabase
      .from('meal_orders')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (data) setOrders(data)
    setLoading(false)
  }

  useEffect(() => {
    fetchOrders()
    
    // Realtime subscription
    const channel = supabase
      .channel('admin_orders')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'meal_orders' 
      }, () => {
        fetchOrders()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const updateStatus = async (id: string, status: MealOrder['status']) => {
    // Optimistic update
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o))

    const { error } = await supabase
      .from('meal_orders')
      .update({ status })
      .eq('id', id)
    
    if (error) {
      alert('状态更新失败')
      fetchOrders() // Revert on error
    }
  }

  const filteredOrders = orders.filter(order => {
    if (filter === 'all') return true
    if (filter === 'completed') return order.status === 'delivered' || order.status === 'cancelled'
    return order.status === filter
  })

  // Group orders by status for stats
  const stats = {
    pending: orders.filter(o => o.status === 'pending').length,
    cooking: orders.filter(o => o.status === 'cooking').length,
    all: orders.length
  }

  if (loading && orders.length === 0) {
    return (
      <div className="flex justify-center p-10">
        <Loader2 className="animate-spin text-pink-400 w-8 h-8" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          订单管理
          {stats.pending > 0 && (
            <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full animate-pulse">
              {stats.pending} 待处理
            </span>
          )}
        </h2>
        
        <div className="flex bg-white rounded-lg p-1 border shadow-sm text-sm">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-md transition-colors ${filter === 'all' ? 'bg-gray-100 font-medium text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
          >
            全部
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-1 ${filter === 'pending' ? 'bg-yellow-50 font-medium text-yellow-700' : 'text-gray-500 hover:text-gray-700'}`}
          >
            待接单
            {stats.pending > 0 && <span className="bg-yellow-500 text-white text-[10px] px-1.5 rounded-full">{stats.pending}</span>}
          </button>
          <button
            onClick={() => setFilter('cooking')}
            className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-1 ${filter === 'cooking' ? 'bg-orange-50 font-medium text-orange-700' : 'text-gray-500 hover:text-gray-700'}`}
          >
            制作中
            {stats.cooking > 0 && <span className="bg-orange-500 text-white text-[10px] px-1.5 rounded-full">{stats.cooking}</span>}
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-3 py-1.5 rounded-md transition-colors ${filter === 'completed' ? 'bg-green-50 font-medium text-green-700' : 'text-gray-500 hover:text-gray-700'}`}
          >
            已完成
          </button>
        </div>
      </div>

      {filteredOrders.length === 0 ? (
        <div className="bg-white rounded-xl p-10 text-center text-gray-400 border border-gray-100 border-dashed">
          <ShoppingBag className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>暂无相关订单</p>
        </div>
      ) : (
        <div className="grid gap-4">
          <AnimatePresence initial={false}>
            {filteredOrders.map(order => (
              <motion.div
                key={order.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={`bg-white rounded-xl p-5 border shadow-sm relative overflow-hidden ${
                  order.status === 'pending' ? 'border-l-4 border-l-yellow-400' : 
                  order.status === 'cooking' ? 'border-l-4 border-l-orange-400' : ''
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                        {order.items && order.items.length > 0 ? '点单合集' : order.dish_name}
                        {order.order_type === 'custom' && (
                          <span className="text-xs bg-purple-100 text-purple-600 px-2 py-0.5 rounded-full border border-purple-200">
                            定制
                          </span>
                        )}
                      </h3>
                      <StatusBadge status={order.status} />
                    </div>
                    
                    {order.items && order.items.length > 0 && (
                      <OrderItemDetail items={order.items} />
                    )}
                    
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mt-1">
                      <span className="flex items-center gap-1.5">
                        <User className="w-4 h-4" />
                        {order.requester}
                      </span>
                      <span className="flex items-center gap-1.5" title={new Date(order.created_at).toLocaleString()}>
                        <Clock className="w-4 h-4" />
                        {formatTimeAgo(order.created_at)}
                      </span>
                    </div>

                    {order.note && (
                      <div className="bg-gray-50 p-3 rounded-lg text-sm text-gray-700 flex items-start gap-2 mt-2">
                        <MessageSquare className="w-4 h-4 mt-0.5 text-gray-400 flex-shrink-0" />
                        {order.note}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 md:justify-end pt-2 md:pt-0 border-t md:border-t-0 border-gray-100">
                    {order.status === 'pending' && (
                      <>
                        <button
                          onClick={() => updateStatus(order.id, 'cancelled')}
                          className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          取消
                        </button>
                        <button
                          onClick={() => updateStatus(order.id, 'cooking')}
                          className="px-4 py-2 text-sm font-medium text-white bg-pink-500 hover:bg-pink-600 rounded-lg shadow-md shadow-pink-200 transition-colors flex items-center gap-2"
                        >
                          <ChefHat className="w-4 h-4" />
                          接单制作
                        </button>
                      </>
                    )}

                    {order.status === 'cooking' && (
                      <>
                        <button
                          onClick={() => updateStatus(order.id, 'pending')}
                          className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          返回
                        </button>
                        <button
                          onClick={() => updateStatus(order.id, 'delivered')}
                          className="px-4 py-2 text-sm font-medium text-white bg-green-500 hover:bg-green-600 rounded-lg shadow-md shadow-green-200 transition-colors flex items-center gap-2"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          完成出餐
                        </button>
                      </>
                    )}

                    {(order.status === 'delivered' || order.status === 'cancelled') && (
                      <span className="text-sm text-gray-400 italic px-2">
                        订单已结束
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}
