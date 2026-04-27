'use client';

import { useState } from 'react';

interface StatCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon?: React.ReactNode;
}

export function StatCard({ title, value, subtitle, icon }: StatCardProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const needsTooltip = subtitle && subtitle.length > 30;

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-xl p-6 shadow-sm border border-zinc-200 dark:border-zinc-800 relative">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">{title}</p>
        {icon && <div className="text-zinc-400">{icon}</div>}
      </div>
      <p className="mt-2 text-3xl font-bold text-zinc-900 dark:text-zinc-100">{value}</p>
      {subtitle && (
        <p 
          className={`mt-1 text-sm text-zinc-500 dark:text-zinc-400 ${needsTooltip ? 'cursor-pointer truncate' : ''}`}
          onMouseEnter={() => needsTooltip && setShowTooltip(true)}
          onMouseLeave={() => needsTooltip && setShowTooltip(false)}
        >
          {subtitle}
        </p>
      )}
      {needsTooltip && showTooltip && (
        <div className="absolute z-10 left-0 right-0 -bottom-10 bg-zinc-800 text-white text-xs p-2 rounded shadow-lg">
          {subtitle}
        </div>
      )}
    </div>
  );
}