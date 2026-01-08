import React, { useState } from 'react';
import { LoveEvent } from '@/types';
import { formatDate } from '@/utils/date';
import SwipeToDelete from './SwipeToDelete';

interface TimelineProps {
  events: LoveEvent[];
  onDelete: (id: string) => void;
}

export default function Timeline({ events, onDelete }: TimelineProps) {
  // Sort events by date descending
  const sortedEvents = [...events].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  return (
    <div>
      <div className="section-header text-[18px] font-bold text-[#555] mb-[5px] flex items-center gap-[10px] pl-[5px] relative">
        <span className="w-1 h-[18px] bg-[var(--primary-color)] rounded-[2px] block"></span>
        我们的回忆录
      </div>
      <div className="h-[15px]"></div>
      
      {/* Lightbox Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 cursor-pointer animate-in fade-in duration-200"
          onClick={() => setSelectedImage(null)}
        >
          <img 
            src={selectedImage} 
            alt="Full size" 
            className="max-w-full max-h-full rounded-lg shadow-2xl"
          />
        </div>
      )}
      
      <div className="timeline-list bg-white/40 rounded-[24px] p-[10px] backdrop-blur-[10px] border border-white/20">
        {sortedEvents.map((item, index) => {
          const itemDate = new Date(item.date);
          const itemDateZero = new Date(itemDate); 
          itemDateZero.setHours(0,0,0,0);
          
          const nowZero = new Date();
          nowZero.setHours(0,0,0,0);
          
          const diff = (nowZero.getTime() - itemDateZero.getTime()) / (1000 * 60 * 60 * 24);
          
          let timeClass = "border-l-[var(--primary-color)]"; // past default
          let diffText = "";
          let descText = "";
          
          if (diff > 0) {
            timeClass = "border-l-[var(--primary-color)]"; // past
            diffText = Math.floor(diff) + " 天";
            descText = "已过去";
          } else if (diff < 0) {
            timeClass = "border-l-[#a18cd1]"; // future
            diffText = Math.ceil(Math.abs(diff)) + " 天";
            descText = "还有";
          } else {
            timeClass = "border-l-[var(--primary-color)]";
            diffText = "Today";
            descText = "就是今天";
          }

          return (
            <div key={`${item.date}-${index}`} className="mb-[15px]">
                <SwipeToDelete 
                    onDelete={() => item.id && onDelete(item.id)} 
                    disabled={item.isFixed}
                    className="rounded-[16px]"
                >
                    <div 
                    className={`timeline-item bg-white/80 rounded-[16px] p-[15px_20px] transition-all duration-300 border border-white/40 shadow-[0_2px_10px_rgba(0,0,0,0.03)] hover:-translate-y-[3px] hover:shadow-[0_8px_25px_rgba(255,117,140,0.15)] ${timeClass} flex flex-col gap-3 backdrop-blur-sm`}
                    >
                    <div className="flex items-center justify-between w-full">
                        <div className="t-left">
                            <h4 className="m-0 text-[16px] text-[#333]">
                            {item.title} 
                            </h4>
                            <p className="m-[5px_0_0_0] text-[13px] text-[#888]">{formatDate(itemDate)}</p>
                        </div>
                        <div className="t-right text-right min-w-[80px]">
                            <div className="t-days text-[20px] font-bold text-[var(--primary-color)]">{diffText}</div>
                            <div className="t-desc text-[12px] text-[#999]">{descText}</div>
                        </div>
                    </div>
                    
                    {/* Image Gallery */}
                    {item.image_url && (
                        <div className="w-full mt-2">
                            <img 
                                src={item.image_url} 
                                alt="Event memory" 
                                className="w-full h-48 object-cover rounded-xl cursor-pointer hover:opacity-95 transition-all duration-300 border border-gray-100 hover:scale-105"
                                onClick={(e) => {
                                    e.stopPropagation(); // Prevent swipe when clicking image? No, preventing click propogation is fine.
                                    setSelectedImage(item.image_url!);
                                }}
                            />
                        </div>
                    )}
                    </div>
                </SwipeToDelete>
            </div>
          );
        })}
      </div>
    </div>
  );
}
