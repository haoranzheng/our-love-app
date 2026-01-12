'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Loader2, Heart, Gift } from 'lucide-react'
import CountUpAnimation from '@/components/CountUpAnimation'

export default function LoveManager() {
  const [balance, setBalance] = useState<number>(0)
  const [loading, setLoading] = useState(true)
  const [amount, setAmount] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const supabase = createClient()

  const fetchBalance = async () => {
    const { data } = await supabase.from('love_points').select('current_balance').single()
    if (data) setBalance(data.current_balance)
    setLoading(false)
  }

  useEffect(() => {
    fetchBalance()
    
    const channel = supabase.channel('love_manager')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'love_points' }, (payload: any) => {
         if (payload.new) setBalance(payload.new.current_balance)
      })
      .subscribe()
      
    return () => { supabase.removeChannel(channel) }
  }, [])

  const handleRecharge = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!amount) return
    setIsSubmitting(true)

    const val = parseInt(amount)
    try {
      // Optimistic update? No, let's wait for safety.
      
      const { data: current } = await supabase.from('love_points').select('*').single()
      if (!current) throw new Error('No record')
      
      const { error: updateError } = await supabase
        .from('love_points')
        .update({ 
            current_balance: current.current_balance + val,
            total_earned: current.total_earned + val,
            updated_at: new Date().toISOString()
        })
        .eq('id', current.id)

      if (updateError) throw updateError
      
      setAmount('')
      alert(`成功发放 ${val} 点爱意值！`)
    } catch (error) {
      alert('充值失败')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin text-pink-400" /></div>

  return (
    <div className="bg-white rounded-xl p-6 border shadow-sm">
      <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2 mb-6">
        <Gift className="text-pink-500" />
        爱意激励
      </h3>

      <div className="flex flex-col md:flex-row gap-8 items-center">
        {/* Balance Display */}
        <div className="bg-gradient-to-br from-pink-500 to-rose-600 text-white p-6 rounded-2xl shadow-lg shadow-pink-200 w-full md:w-64 text-center">
          <div className="text-pink-100 text-sm mb-1 font-medium">当前资金池</div>
          <div className="text-4xl font-bold mb-2">
            <CountUpAnimation target={balance} />
          </div>
          <div className="text-xs bg-white/20 rounded-full px-2 py-1 inline-block">
            实时监控中
          </div>
        </div>

        {/* Recharge Form */}
        <form onSubmit={handleRecharge} className="flex-1 w-full space-y-4">
           <div>
             <label className="block text-sm font-medium text-gray-700 mb-2">发放奖励金额</label>
             <div className="relative">
               <Heart className="absolute left-3 top-3 w-5 h-5 text-pink-400" />
               <input 
                 type="number" 
                 value={amount}
                 onChange={e => setAmount(e.target.value)}
                 className="w-full pl-10 pr-4 py-3 rounded-xl border-gray-200 focus:border-pink-500 focus:ring-pink-500"
                 placeholder="输入爱意值..."
                 min="1"
               />
             </div>
           </div>
           
           <button
             type="submit"
             disabled={isSubmitting || !amount}
             className="w-full bg-pink-500 hover:bg-pink-600 text-white font-bold py-3 rounded-xl transition-all shadow-md shadow-pink-200 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
           >
             {isSubmitting ? <Loader2 className="animate-spin" /> : <Gift className="w-5 h-5" />}
             立即发放
           </button>
           <p className="text-xs text-gray-400 text-center">
             * 发放后，对方屏幕将出现全屏特效
           </p>
        </form>
      </div>
    </div>
  )
}
