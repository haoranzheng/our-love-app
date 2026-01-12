'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'

export default function ConfettiEffect() {
    const [isActive, setIsActive] = useState(false)
    const supabase = createClient()

    useEffect(() => {
        let lastBalance: number | null = null;
        
        const fetchInitial = async () => {
            const { data } = await supabase.from('love_points').select('current_balance').single()
            if(data) lastBalance = data.current_balance
        }
        fetchInitial()

        const channel = supabase.channel('confetti_trigger')
            .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'love_points' }, (payload: any) => {
                const newBalance = payload.new.current_balance
                
                // Trigger only if balance increased
                if (lastBalance !== null && newBalance > lastBalance) {
                    setIsActive(true)
                    setTimeout(() => setIsActive(false), 5000)
                }
                lastBalance = newBalance
            })
            .subscribe()

        return () => { supabase.removeChannel(channel) }
    }, [])

    if (!isActive) return null

    return (
        <div className="fixed inset-0 pointer-events-none z-[100] flex justify-center items-start overflow-hidden">
           {/* Generate a bunch of falling elements */}
           {Array.from({ length: 50 }).map((_, i) => (
               <div key={i} className="animate-fall text-3xl" style={{
                   left: `${Math.random() * 100}vw`,
                   animationDuration: `${2 + Math.random() * 3}s`,
                   animationDelay: `${Math.random()}s`,
                   position: 'absolute'
               }}>
                  {['❤️', '💖', '💰', '✨', '🎁'][Math.floor(Math.random() * 5)]}
               </div>
           ))}
        </div>
    )
}
