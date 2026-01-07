"use client";

import React, { useEffect, useState, useCallback } from "react";
import BubbleEffect from "@/components/BubbleEffect";
import MainCard from "@/components/MainCard";
import ReminderCard from "@/components/ReminderCard";
import EventForm from "@/components/EventForm";
import Timeline from "@/components/Timeline";
import Toast from "@/components/Toast";
import InstallGuide from "@/components/InstallGuide";
import {
  START_DATE_STR,
  formatDate,
  calculateDaysDifference,
  getNextMilestone,
  Milestone,
} from "@/utils/date";
import { LoveEvent } from "@/types";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [events, setEvents] = useState<LoveEvent[]>([]);
  const [todayStr, setTodayStr] = useState("");
  const [daysCount, setDaysCount] = useState(0);
  const [milestone, setMilestone] = useState<Milestone | null>(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  
  const supabase = createClient();
  const router = useRouter();

  // Fetch events from Supabase
  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('love_events')
        .select('*')
        .order('event_date', { ascending: false });

      if (error) {
        console.error('Error fetching events:', error);
        return;
      }

      if (data) {
        // Map Supabase data to our LoveEvent type
        const mappedEvents: LoveEvent[] = data.map((item: any) => ({
          id: item.id,
          title: item.title,
          date: item.event_date,
          image_url: item.image_url,
          isFixed: false
        }));
        
        const fixedEvent: LoveEvent = { 
          date: START_DATE_STR, 
          title: "❤️ 故事开始：我们在一起啦", 
          isFixed: true 
        };
        
        setEvents([fixedEvent, ...mappedEvents]);
      }
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    setMounted(true);
    
    // Check Auth
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
        return;
      }
      fetchEvents();
    };

    checkAuth();
    
    // Initialize Date
    const now = new Date();
    setTodayStr(formatDate(now));
    
    const startDate = new Date(START_DATE_STR);
    const count = calculateDaysDifference(now, startDate);
    const realCount = count + 1;
    setDaysCount(realCount);
    setMilestone(getNextMilestone(realCount, startDate));

  }, [fetchEvents, router, supabase.auth]);

  const handleAddEvent = async (date: string, title: string, file: File | null) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    let imageUrl = null;

    if (file) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${user.id}/${fileName}`;

        const { error: uploadError } = await supabase.storage
            .from('love_images')
            .upload(filePath, file);

        if (uploadError) {
            setToast({ message: '图片上传失败: ' + uploadError.message, type: 'error' });
            return;
        }

        const { data: { publicUrl } } = supabase.storage
            .from('love_images')
            .getPublicUrl(filePath);
            
        imageUrl = publicUrl;
    }

    const { error } = await supabase
      .from('love_events')
      .insert([
        { 
          title, 
          event_date: date,
          user_id: user.id,
          image_url: imageUrl
        }
      ]);

    if (error) {
      setToast({ message: '添加失败: ' + error.message, type: 'error' });
    } else {
      setToast({ message: '添加成功！', type: 'success' });
      fetchEvents(); // Reload list
    }
  };

  const handleDeleteEvent = async (id: string) => {
    const { error } = await supabase
      .from('love_events')
      .delete()
      .eq('id', id);

    if (error) {
      setToast({ message: '删除失败: ' + error.message, type: 'error' });
    } else {
      setToast({ message: '删除成功', type: 'success' });
      setEvents(prev => prev.filter(e => e.id !== id));
    }
  };
  
  const handleLogout = async () => {
      await supabase.auth.signOut();
      router.push('/login');
  }

  if (!mounted) {
    return <div className="min-h-screen bg-[#fff8fa]"></div>;
  }

  return (
    <main className="min-h-screen p-5 pb-24 md:pb-5 box-border">
      <BubbleEffect />
      
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      
      <div className="absolute top-4 right-4 z-20">
          <button 
            onClick={handleLogout}
            className="text-xs text-gray-400 hover:text-[#ff758c] transition-colors bg-white/50 px-3 py-1 rounded-full backdrop-blur-sm"
          >
              退出登录
          </button>
      </div>
      
      <div className="container mx-auto max-w-[1100px] relative z-10 grid gap-[25px] grid-cols-1 md:grid-cols-[360px_1fr] md:items-start">
        <div className="left-panel md:sticky md:top-5">
          <MainCard 
            startDateStr={START_DATE_STR.replace(/-/g, '.')} 
            daysCount={daysCount}
            todayDateStr={todayStr}
          />
          <ReminderCard milestone={milestone} />
        </div>
        
        <div className="right-panel flex flex-col gap-[20px]">
          <InstallGuide />
          <EventForm onAdd={handleAddEvent} />
          {loading ? (
              <div className="text-center text-gray-400 py-10">加载回忆中...</div>
          ) : (
              <Timeline events={events} onDelete={handleDeleteEvent} />
          )}
        </div>
      </div>
    </main>
  );
}
