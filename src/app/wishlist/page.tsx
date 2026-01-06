"use client";

import React, { useState, useEffect, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";
import BubbleEffect from "@/components/BubbleEffect";
import Toast from "@/components/Toast";
import { useRouter } from "next/navigation";

interface WishItem {
  id: string;
  content: string;
  is_completed: boolean;
}

export default function WishlistPage() {
  const [wishes, setWishes] = useState<WishItem[]>([]);
  const [newWish, setNewWish] = useState("");
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  
  const supabase = createClient();
  const router = useRouter();

  const fetchWishes = useCallback(async () => {
    setLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
        router.push('/login');
        return;
    }

    const { data, error } = await supabase
      .from("wishlist")
      .select("*")
      .order("created_at", { ascending: true }); // Keep chronological order usually

    if (error) {
      console.error("Error fetching wishes:", error);
    } else {
      setWishes(data || []);
    }
    setLoading(false);
  }, [supabase, router]);

  useEffect(() => {
    fetchWishes();
  }, [fetchWishes]);

  const handleAddWish = async () => {
    if (!newWish.trim()) return;
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from("wishlist").insert([
      {
        content: newWish,
        user_id: user.id,
      },
    ]);

    if (error) {
      setToast({ message: "添加失败: " + error.message, type: "error" });
    } else {
      setNewWish("");
      setToast({ message: "添加愿望成功！", type: "success" });
      fetchWishes();
    }
  };

  const toggleWish = async (id: string, currentStatus: boolean) => {
    // Optimistic update
    setWishes(prev => prev.map(w => w.id === id ? { ...w, is_completed: !currentStatus } : w));

    const { error } = await supabase
      .from("wishlist")
      .update({ is_completed: !currentStatus })
      .eq("id", id);

    if (error) {
      setToast({ message: "更新状态失败", type: "error" });
      // Revert
      setWishes(prev => prev.map(w => w.id === id ? { ...w, is_completed: currentStatus } : w));
    } else {
        if (!currentStatus) {
            setToast({ message: "太棒了！又完成了一个愿望！🎉", type: "success" });
        }
    }
  };

  const handleDeleteWish = async (id: string) => {
      if(!confirm("确定要删除这个愿望吗？")) return;
      
      const { error } = await supabase.from("wishlist").delete().eq("id", id);
      
      if(error) {
          setToast({ message: "删除失败", type: "error" });
      } else {
          setWishes(prev => prev.filter(w => w.id !== id));
      }
  }

  const completedCount = wishes.filter((w) => w.is_completed).length;

  return (
    <div className="min-h-screen bg-[#fff8fa] p-5 pb-24 md:pb-5">
      <BubbleEffect />
      
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="max-w-md mx-auto">
        <header className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-[#ff758c] mb-2">共同愿望清单</h1>
          <p className="text-gray-500 text-sm">我们要一起完成的 100 件事</p>
          
          <div className="mt-4 bg-white/50 rounded-full h-4 overflow-hidden shadow-inner border border-white/50">
            <div 
                className="h-full bg-gradient-to-r from-[#ff9a9e] to-[#fecfef] transition-all duration-500"
                style={{ width: `${wishes.length > 0 ? (completedCount / wishes.length) * 100 : 0}%` }}
            ></div>
          </div>
          <div className="text-right text-xs text-[#ff758c] mt-1 font-bold">
            已完成 {completedCount} / {wishes.length}
          </div>
        </header>

        <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg p-4 border border-white/50 mb-6">
          <div className="flex gap-2">
            <input
              type="text"
              value={newWish}
              onChange={(e) => setNewWish(e.target.value)}
              placeholder="写下我们想做的事..."
              className="flex-1 px-4 py-3 rounded-xl border border-pink-100 bg-white/80 focus:border-[#ff758c] focus:outline-none transition-colors"
            />
            <button
              onClick={handleAddWish}
              className="bg-[#ff758c] text-white px-4 py-2 rounded-xl font-bold shadow-md active:scale-95 transition-transform"
            >
              添加
            </button>
          </div>
        </div>

        <div className="space-y-3">
          {loading ? (
             <div className="text-center text-gray-400 py-10">加载愿望中...</div>
          ) : (
            wishes.map((wish) => (
                <div
                key={wish.id}
                className={`group flex items-center p-4 bg-white/90 backdrop-blur-sm rounded-xl shadow-sm border border-white/50 transition-all ${
                    wish.is_completed ? "opacity-60" : "hover:-translate-y-1 hover:shadow-md"
                }`}
                >
                <div 
                    onClick={() => toggleWish(wish.id, wish.is_completed)}
                    className={`w-6 h-6 rounded-full border-2 mr-3 flex items-center justify-center cursor-pointer transition-colors ${
                    wish.is_completed
                        ? "bg-[#ff758c] border-[#ff758c]"
                        : "border-gray-300 bg-white"
                    }`}
                >
                    {wish.is_completed && (
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                    </svg>
                    )}
                </div>
                
                <span className={`flex-1 text-gray-700 ${wish.is_completed ? "line-through text-gray-400" : ""}`}>
                    {wish.content}
                </span>

                <button 
                    onClick={() => handleDeleteWish(wish.id)}
                    className="text-gray-300 hover:text-red-400 p-2 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                </button>
                </div>
            ))
          )}
          
          {!loading && wishes.length === 0 && (
              <div className="text-center text-gray-400 py-10 text-sm">
                  还没有愿望哦，快来添加第一个愿望吧！✨
              </div>
          )}
        </div>
      </div>
    </div>
  );
}
