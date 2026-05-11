'use client';

import { StravaActivity } from '@/lib/types';

function formatPace(paceMinPerKm: number | null): string {
  if (paceMinPerKm === null) return '-';
  const minutes = Math.floor(paceMinPerKm);
  const seconds = Math.round((paceMinPerKm - minutes) * 60);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

const ACTIVITY_ICONS: Record<string, string> = {
  Run: '🏃',
  Ride: '🚴',
  Walk: '🚶',
  Swim: '🏊',
  Hike: '🥾',
  Workout: '💪',
  Rowing: '🚣',
  Ski: '⛷️',
  Snowboard: '🏂',
  Default: '🏃',
};

interface HistorySectionProps {
  activities: StravaActivity[];
  onSelectActivity: (activity: StravaActivity) => void;
}

export function HistorySection({ activities, onSelectActivity }: HistorySectionProps) {
  const recentActivities = [...activities]
    .sort((a, b) => new Date(b.start_date_local).getTime() - new Date(a.start_date_local).getTime())
    .slice(0, 5);

  if (recentActivities.length === 0) return null;

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-xl p-6 shadow-sm border border-zinc-200 dark:border-zinc-800">
      <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4">Recent Workouts</h3>
      <div className="space-y-3">
        {recentActivities.map((activity) => {
          const paceMinPerKm = activity.moving_time > 0 && activity.distance > 0
            ? (activity.moving_time / 60) / (activity.distance / 1000)
            : null;

          return (
            <button
              key={activity.id}
              onClick={() => onSelectActivity(activity)}
              className="w-full text-left p-3 rounded-lg border border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors flex items-center gap-4 cursor-pointer"
            >
              <span className="text-xl">{ACTIVITY_ICONS[activity.type] || ACTIVITY_ICONS.Default}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">{activity.name}</p>
                <p className="text-xs text-zinc-500">{formatDate(activity.start_date_local)}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                  {(activity.distance / 1000).toFixed(1)} km
                </p>
                <p className="text-xs text-zinc-500">
                  {formatPace(paceMinPerKm)} /km
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
