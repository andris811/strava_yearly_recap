'use client';

import { StravaActivity } from '@/lib/types';

function formatPace(paceMinPerKm: number | null): string {
  if (paceMinPerKm === null) return '-';
  const minutes = Math.floor(paceMinPerKm);
  const seconds = Math.round((paceMinPerKm - minutes) * 60);
  return `${minutes}:${seconds.toString().padStart(2, '0')} /km`;
}

function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
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

interface ActivityDetailProps {
  activity: StravaActivity | null;
  onClose: () => void;
}

export function ActivityDetail({ activity, onClose }: ActivityDetailProps) {
  if (!activity) return null;

  const paceMinPerKm = activity.moving_time > 0 && activity.distance > 0
    ? (activity.moving_time / 60) / (activity.distance / 1000)
    : null;

  const splits = activity.splits_metric || [];

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-zinc-900 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
        >
          ✕
        </button>

        <div className="flex items-center gap-3 mb-6">
          <span className="text-2xl">{ACTIVITY_ICONS[activity.type] || ACTIVITY_ICONS.Default}</span>
          <div>
            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">{activity.name}</h2>
            <p className="text-sm text-zinc-500">{formatDate(activity.start_date_local)}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-zinc-50 dark:bg-zinc-800 p-3 rounded-lg">
            <p className="text-xs text-zinc-500 uppercase">Distance</p>
            <p className="text-lg font-semibold">{(activity.distance / 1000).toFixed(2)} km</p>
          </div>
          <div className="bg-zinc-50 dark:bg-zinc-800 p-3 rounded-lg">
            <p className="text-xs text-zinc-500 uppercase">Moving Time</p>
            <p className="text-lg font-semibold">{formatTime(activity.moving_time)}</p>
          </div>
          <div className="bg-zinc-50 dark:bg-zinc-800 p-3 rounded-lg">
            <p className="text-xs text-zinc-500 uppercase">Pace</p>
            <p className="text-lg font-semibold">{formatPace(paceMinPerKm)}</p>
          </div>
          <div className="bg-zinc-50 dark:bg-zinc-800 p-3 rounded-lg">
            <p className="text-xs text-zinc-500 uppercase">Elevation</p>
            <p className="text-lg font-semibold">{activity.total_elevation_gain.toFixed(0)} m</p>
          </div>
          {activity.average_heartrate && (
            <div className="bg-zinc-50 dark:bg-zinc-800 p-3 rounded-lg">
              <p className="text-xs text-zinc-500 uppercase">Avg HR</p>
              <p className="text-lg font-semibold">{Math.round(activity.average_heartrate)} bpm</p>
            </div>
          )}
          {activity.average_cadence && (
            <div className="bg-zinc-50 dark:bg-zinc-800 p-3 rounded-lg">
              <p className="text-xs text-zinc-500 uppercase">Cadence</p>
              <p className="text-lg font-semibold">{Math.round(activity.average_cadence)} rpm</p>
            </div>
          )}
        </div>

        {splits.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-3 text-zinc-900 dark:text-zinc-100">Splits (per km)</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-200 dark:border-zinc-700">
                    <th className="text-left py-2 px-2">Split</th>
                    <th className="text-right py-2 px-2">Distance</th>
                    <th className="text-right py-2 px-2">Time</th>
                    <th className="text-right py-2 px-2">Pace</th>
                    {splits.some(s => s.avg_heartrate) && (
                      <th className="text-right py-2 px-2">HR</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {splits.map((split) => {
                    const splitPace = split.moving_time > 0 && split.distance > 0
                      ? (split.moving_time / 60) / (split.distance / 1000)
                      : null;
                    return (
                      <tr key={split.split} className="border-b border-zinc-100 dark:border-zinc-800">
                        <td className="py-2 px-2">{split.split}</td>
                        <td className="py-2 px-2 text-right">{(split.distance / 1000).toFixed(2)} km</td>
                        <td className="py-2 px-2 text-right">{formatTime(split.moving_time)}</td>
                        <td className="py-2 px-2 text-right">{formatPace(splitPace)}</td>
                        {splits.some(s => s.avg_heartrate) && (
                          <td className="py-2 px-2 text-right">
                            {split.avg_heartrate ? Math.round(split.avg_heartrate) : '-'}
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
