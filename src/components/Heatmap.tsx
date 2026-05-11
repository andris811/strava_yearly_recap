'use client';

import { useMemo } from 'react';

interface HeatmapProps {
  dailyActivity: Record<string, number>;
  dailyCount: Record<string, number>;
  year: number;
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function getColorLevel(value: number, maxValue: number): string {
  if (value === 0) return 'bg-zinc-100 dark:bg-zinc-800';
  const ratio = value / maxValue;
  if (ratio <= 0.25) return 'bg-orange-200 dark:bg-orange-900';
  if (ratio <= 0.5) return 'bg-orange-300 dark:bg-orange-800';
  if (ratio <= 0.75) return 'bg-orange-400 dark:bg-orange-700';
  return 'bg-orange-500 dark:bg-orange-600';
}

export function Heatmap({ dailyActivity, dailyCount, year }: HeatmapProps) {
  const { weeks, maxValue, monthPositions } = useMemo(() => {
    const maxVal = Math.max(...Object.values(dailyActivity), 1);
    
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31);
    
    let startDay = startDate.getDay();
    startDay = startDay === 0 ? 6 : startDay - 1;
    
    const startWeek = new Date(year, 0, 1 - startDay);
    
    const weeks: { date: string; dayIndex: number; value: number; count: number; inYear: boolean }[][] = [];
    let currentDate = new Date(startWeek);
    
    while (currentDate <= endDate || weeks.length < 53) {
      const week: { date: string; dayIndex: number; value: number; count: number; inYear: boolean }[] = [];
      
      for (let i = 0; i < 7; i++) {
        const dateStr = currentDate.toISOString().split('T')[0];
        const activityYear = currentDate.getFullYear();
        const inYear = activityYear === year;
        const value = inYear ? (dailyActivity[dateStr] || 0) : 0;
        const count = inYear ? (dailyCount[dateStr] || 0) : 0;
        
        week.push({
          date: dateStr,
          dayIndex: i,
          value,
          count,
          inYear,
        });
        
        currentDate.setDate(currentDate.getDate() + 1);
      }
      
      weeks.push(week);
      
      if (currentDate > endDate && currentDate.getDay() === 1) break;
    }

    const monthPositions: { month: string; offset: number; width: number }[] = [];
    let lastMonth = -1;
    let currentMonthStartWeek = 0;
    
    weeks.forEach((week, weekIndex) => {
      const firstDayOfWeek = week[0];
      if (firstDayOfWeek.inYear) {
        const month = new Date(firstDayOfWeek.date).getMonth();
        if (month !== lastMonth) {
          if (lastMonth !== -1) {
            const width = weekIndex - currentMonthStartWeek;
            monthPositions.push({
              month: MONTHS[lastMonth],
              offset: currentMonthStartWeek,
              width,
            });
          }
          lastMonth = month;
          currentMonthStartWeek = weekIndex;
        }
      }
    });
    
    if (lastMonth !== -1) {
      const width = weeks.length - currentMonthStartWeek;
      monthPositions.push({
        month: MONTHS[lastMonth],
        offset: currentMonthStartWeek,
        width,
      });
    }
    
    return { weeks, maxValue: maxVal, monthPositions };
  }, [dailyActivity, dailyCount, year]);

  const cellSize = 12;
  const cellGap = 3;
  const dayLabelWidth = 28;

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-xl p-4 md:p-6 shadow-sm border border-zinc-200 dark:border-zinc-800">
      <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
        Activity Heatmap - {year}
      </h3>
      
      <div className="overflow-x-auto">
        <div 
          className="relative"
          style={{ 
            width: '100%',
            minWidth: `${dayLabelWidth + weeks.length * (cellSize + cellGap)}px`
          }}
        >
          <div 
            className="flex mb-1"
            style={{ marginLeft: `${dayLabelWidth}px` }}
          >
            {monthPositions.map((mp, idx) => (
              <div
                key={idx}
                className="text-xs text-zinc-500 text-center"
                style={{
                  marginLeft: idx === 0 ? mp.offset * (cellSize + cellGap) : 0,
                  width: mp.width * (cellSize + cellGap) - (idx === 0 ? 0 : (cellSize + cellGap)),
                  minWidth: '30px',
                }}
              >
                {mp.month}
              </div>
            ))}
          </div>
          
          <div className="flex">
            <div className="flex flex-col gap-[2px] mr-1" style={{ width: dayLabelWidth }}>
              {DAYS.map((day, i) => (
                <div 
                  key={day} 
                  className="text-xs text-zinc-500 flex items-center justify-end pr-1"
                  style={{ height: cellSize }}
                >
                  {i % 2 === 1 ? day : ''}
                </div>
              ))}
            </div>
            
            <div className="flex gap-[2px]">
              {weeks.map((week, weekIndex) => (
                <div key={weekIndex} className="flex flex-col gap-[2px]">
                  {week.map((day) => (
                    <div
                      key={day.date}
                      className={`rounded-sm ${day.inYear ? getColorLevel(day.value, maxValue) : 'bg-transparent'} ${
                        day.inYear ? 'cursor-pointer hover:ring-1 hover:ring-zinc-400' : ''
                      }`}
                      style={{
                        width: cellSize,
                        height: cellSize,
                      }}
                      title={day.inYear ? `${new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} — ${day.count} activity${day.count === 1 ? '' : 'ies'}` : ''}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
          
          <div className="flex items-center gap-2 mt-4">
            <span className="text-xs text-zinc-500">Less</span>
            <div className="flex gap-1">
              <div className="w-3 h-3 rounded-sm bg-zinc-100 dark:bg-zinc-800"></div>
              <div className="w-3 h-3 rounded-sm bg-orange-200 dark:bg-orange-900"></div>
              <div className="w-3 h-3 rounded-sm bg-orange-300 dark:bg-orange-800"></div>
              <div className="w-3 h-3 rounded-sm bg-orange-400 dark:bg-orange-700"></div>
              <div className="w-3 h-3 rounded-sm bg-orange-500 dark:bg-orange-600"></div>
            </div>
            <span className="text-xs text-zinc-500">More</span>
          </div>
        </div>
      </div>
    </div>
  );
}