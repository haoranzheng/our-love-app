import React from 'react';
import CountUpAnimation from './CountUpAnimation';

interface MainCardProps {
  startDateStr: string;
  daysCount: number;
  todayDateStr: string;
}

export default function MainCard({ startDateStr, daysCount, todayDateStr }: MainCardProps) {
  return (
    <div className="main-card text-center bg-white/80 relative overflow-hidden rounded-[24px] px-5 py-10 shadow-[var(--card-shadow)] mb-5 border border-white/40 backdrop-blur-md transition-transform hover:scale-[1.02] duration-300">
      {/* Decorative top bar */}
      <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[var(--primary-color)] to-[var(--secondary-color)]"></div>
      
      <div className="text-sm text-[#999] mb-2.5 tracking-widest">起始日: {startDateStr}</div>
      <div className="text-base text-[#ff8fa3] font-semibold">我们已经相爱</div>
      <div className="text-[60px] font-[800] my-[15px] leading-[1.1] bg-gradient-to-br from-[var(--primary-color)] to-[var(--secondary-color)] bg-clip-text text-transparent">
        <CountUpAnimation target={daysCount} />
      </div>
      <div className="text-base text-[#ff8fa3] font-semibold">天啦</div>
      <div className="mt-5 text-xs text-[#aaa]">
        (今天: <span>{todayDateStr}</span>)
      </div>
    </div>
  );
}
