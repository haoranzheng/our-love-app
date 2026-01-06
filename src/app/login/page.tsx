'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import BubbleEffect from "@/components/BubbleEffect"
import Toast from "@/components/Toast"

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  // Use toast state instead of simple error string
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  
  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setToast(null)
    
    if (!email || !password) {
        setToast({ message: '请填写邮箱和密码', type: 'error' })
        setLoading(false)
        return
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setToast({ message: error.message, type: 'error' })
      setLoading(false)
    } else {
      router.refresh()
      router.push('/')
    }
  }

  const handleSignUp = async (e: React.MouseEvent) => {
    // Prevent form submission if button is inside form (though it is outside in JSX, good to be safe)
    e.preventDefault()
    
    setLoading(true)
    setToast(null)
    
    if (!email || !password) {
        setToast({ message: '注册需要填写邮箱和密码哦', type: 'error' })
        setLoading(false)
        return
    }
    
    // Explicitly using signUp with email and password
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        // Redirect to home after email confirmation (if enabled)
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      }
    })

    if (error) {
      setToast({ message: error.message, type: 'error' })
    } else {
      // Check if session is established immediately (Email confirmation disabled)
      if (data.session) {
          setToast({ message: '注册成功！正在登录...', type: 'success' })
          router.refresh()
          router.push('/')
      } else {
          setToast({ message: '注册成功！请检查邮箱完成验证，或者直接登录试试。', type: 'success' })
      }
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <BubbleEffect />
      
      {toast && (
        <Toast 
            message={toast.message} 
            type={toast.type} 
            onClose={() => setToast(null)} 
        />
      )}
      
      <div className="bg-white/90 backdrop-blur-md p-8 rounded-2xl shadow-[0_10px_30px_rgba(255,117,140,0.15)] w-full max-w-md border border-white/50 relative z-10">
        <h1 className="text-2xl font-bold text-center mb-6 text-[#ff758c]">
          开启我们的恋爱日历
        </h1>
        
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              邮箱
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 rounded-xl border border-pink-200 focus:border-[#ff758c] focus:ring-1 focus:ring-[#ff758c] outline-none transition-all bg-white/50"
              placeholder="输入你的邮箱"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              密码
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 rounded-xl border border-pink-200 focus:border-[#ff758c] focus:ring-1 focus:ring-[#ff758c] outline-none transition-all bg-white/50"
              placeholder="设置一个密码"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#ff758c] hover:bg-[#ff6b84] text-white font-bold py-3 rounded-xl transition-all shadow-md active:scale-95 disabled:opacity-50"
          >
            {loading ? '处理中...' : '登录'}
          </button>
        </form>
        
        <div className="mt-4 text-center">
            <button 
                type="button" // Explicitly set type to button to prevent form submission
                onClick={handleSignUp}
                disabled={loading}
                className="text-sm text-[#ff7eb3] hover:text-[#ff6b84] transition-colors"
            >
                没有账号？点此注册
            </button>
        </div>
        
        <p className="mt-6 text-xs text-center text-gray-400">
          为了同步数据，请你和你的另一半使用<br/>
          <span className="font-bold text-[#ff758c]">同一个账号</span>登录哦 ❤️
        </p>
      </div>
    </div>
  )
}
