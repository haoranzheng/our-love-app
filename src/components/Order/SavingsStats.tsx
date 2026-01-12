'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Sparkles } from 'lucide-react'

export default function SavingsStats() {
    const [spent, setSpent] = useState<number>(0)
    const supabase = createClient()

    useEffect(() => {
        const fetch = async () => {
            const { data } = await supabase.from('love_points').select('total_spent').single()
            if(data) setSpent(data.total_spent)
        }
        fetch()
        
        const channel = supabase.channel('stats_update')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'love_points' }, (payload: any) => {
                if(payload.new) setSpent(payload.new.total_spent)
            })
            .subscribe()
            
        return () => { supabase.removeChannel(channel) }
    }, [])

    if (spent === 0) return null

    return (
        <div className="mt-8 mb-4 text-center px-4">
            <p className="text-xs text-gray-400 flex items-center justify-center gap-1 flex-wrap">
                <Sparkles className="w-3 h-3 text-pink-300" />
                自 2025年10月8日 以来，主厨已为你节省了价值 <span className="text-pink-500 font-bold">{spent}</span> 点的餐费
            </p>
        </div>
    )
}
