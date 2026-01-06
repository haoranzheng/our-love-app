export const START_DATE_STR = "2025-10-08";

export function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = (date.getMonth() + 1).toString().padStart(2, '0');
  const d = date.getDate().toString().padStart(2, '0');
  return `${y}.${m}.${d}`;
}

export function calculateDaysDifference(date1: Date, date2: Date): number {
  // Reset hours to midnight for accurate day calculation
  const d1 = new Date(date1);
  d1.setHours(0, 0, 0, 0);
  const d2 = new Date(date2);
  d2.setHours(0, 0, 0, 0);
  
  const diffTime = d1.getTime() - d2.getTime();
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}

export interface Milestone {
  title: string;
  date: string;
  daysLeft: number;
}

export function getNextMilestone(currentDays: number, startDate: Date): Milestone {
  const targets = [520, 1314, 2000, 5200];
  
  let nextHundred = Math.ceil(currentDays / 100) * 100;
  if (nextHundred === currentDays) nextHundred += 100;
  
  let yearCount = Math.ceil(currentDays / 365);
  let nextYearDay = yearCount * 365;
  if (nextYearDay === currentDays) nextYearDay += 365;
  
  let candidates = [
      { day: nextHundred, title: `相恋 ${nextHundred} 天` },
      { day: nextYearDay, title: `相恋 ${yearCount} 周年` }
  ];
  
  targets.forEach(t => { 
      if (t > currentDays) { 
          candidates.push({ day: t, title: `相恋 ${t} 天` }); 
      } 
  });
  
  candidates.sort((a, b) => a.day - b.day);
  const best = candidates[0];
  const daysLeft = best.day - currentDays;
  
  // Calculate target date
  // Note: startDate is already a Date object, but we need to ensure we add days correctly
  const targetDate = new Date(startDate.getTime() + (best.day - 1) * 24 * 60 * 60 * 1000);
  
  return {
      title: best.title,
      date: formatDate(targetDate),
      daysLeft: daysLeft
  };
}
