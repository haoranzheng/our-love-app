import React from 'react';
import { Milestone } from '@/utils/date';

interface ReminderCardProps {
  milestone: Milestone | null;
}

export default function ReminderCard({ milestone }: ReminderCardProps) {
  return (
    <div className="reminder-card bg-gradient-to-br from-[#ff9a9e] to-[#fecfef] rounded-[20px] p-[25px] text-white shadow-[0_10px_25px_rgba(255,154,158,0.5)] flex justify-between items-center">
      <div className="reminder-info">
        <h3 className="m-0 text-[18px] font-bold">{milestone ? milestone.title : 'Loading...'}</h3>
        <p className="m-[5px_0_0_0] text-[13px] opacity-95">
          {milestone ? milestone.date : '...'}
        </p>
      </div>
      <div className="reminder-days text-right">
        <span className="text-[32px] font-bold block leading-none">
          {milestone ? milestone.daysLeft : 0}
        </span>
        <small className="text-[12px] block opacity-90">天后</small>
      </div>
    </div>
  );
}
