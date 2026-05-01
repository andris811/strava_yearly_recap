'use client';

import { useState, useEffect } from 'react';
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
  const secs = Math.floor(seconds % 60);
  if (hours > 0) return `${hours}h ${minutes.toString().padStart(2, '0')}m ${secs.toString().padStart(2, '0')}s`;
  if (minutes > 0) return `${minutes}m ${secs.toString().padStart(2, '0')}s`;
  return `${secs}s`;
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

interface DetailedActivity extends StravaActivity {
  calories: number | null;
  laps?: any[];
  segment_efforts?: any[];
}

interface ZoneData {
  type: string;
  distribution_buckets?: Array<{ min: number; max: number; time: number }>;
}

export function ActivityDetail({ activity, onClose }: ActivityDetailProps) {
  const [detailedActivity, setDetailedActivity] = useState<DetailedActivity | null>(null);
  const [zones, setZones] = useState<ZoneData[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!activity) return;
    
    setLoading(true);
    
    Promise.all([
      fetch(`/api/activities/${activity.id}`).then(r => r.json()),
      fetch(`/api/activities/${activity.id}/zones`).then(r => r.json()),
    ]).then(([activityData, zonesData]) => {
      if (activityData.activity) setDetailedActivity(activityData.activity);
      if (zonesData.zones) setZones(zonesData.zones);
      setLoading(false);
    }).catch(err => {
      console.error('Error fetching activity details:', err);
      setLoading(false);
    });
  }, [activity?.id]);

  if (!activity) return null;

  const displayActivity = detailedActivity || activity;
  
  const paceMinPerKm = displayActivity.moving_time > 0 && displayActivity.distance > 0
    ? (displayActivity.moving_time / 60) / (displayActivity.distance / 1000)
    : null;

  const splits = displayActivity.splits_metric || [];
  
  // Find fastest split
  const fastestSplit = splits.length > 0 
    ? splits.reduce((fastest, split) => {
        const pace = split.moving_time > 0 && split.distance > 0
          ? (split.moving_time / 60) / (split.distance / 1000)
          : Infinity;
        const fastestPace = fastest.moving_time > 0 && fastest.distance > 0
          ? (fastest.moving_time / 60) / (fastest.distance / 1000)
          : Infinity;
        return pace < fastestPace ? split : fastest;
      }, splits[0])
    : null;

  const hrZones = zones.find(z => z.type === 'heartrate');
  const powerZones = zones.find(z => z.type === 'power');

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

        {loading && (
          <div className="text-center py-8">
            <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="mt-2 text-sm text-zinc-500">Loading details...</p>
          </div>
        )}

        {!loading && (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
              <div className="bg-zinc-50 dark:bg-zinc-800 p-3 rounded-lg">
                <p className="text-xs text-zinc-500 uppercase">Distance</p>
                <p className="text-lg font-semibold">{(displayActivity.distance / 1000).toFixed(2)} km</p>
              </div>
              <div className="bg-zinc-50 dark:bg-zinc-800 p-3 rounded-lg">
                <p className="text-xs text-zinc-500 uppercase">Moving Time</p>
                <p className="text-lg font-semibold">{formatTime(displayActivity.moving_time)}</p>
              </div>
              <div className="bg-zinc-50 dark:bg-zinc-800 p-3 rounded-lg">
                <p className="text-xs text-zinc-500 uppercase">Avg Pace</p>
                <p className="text-lg font-semibold">{formatPace(paceMinPerKm)}</p>
              </div>
              <div className="bg-zinc-50 dark:bg-zinc-800 p-3 rounded-lg">
                <p className="text-xs text-zinc-500 uppercase">Elevation</p>
                <p className="text-lg font-semibold">{displayActivity.total_elevation_gain.toFixed(0)} m</p>
              </div>
              {displayActivity.calories && (
                <div className="bg-zinc-50 dark:bg-zinc-800 p-3 rounded-lg">
                  <p className="text-xs text-zinc-500 uppercase">Calories</p>
                  <p className="text-lg font-semibold">{Math.round(displayActivity.calories)} kcal</p>
                </div>
              )}
              {displayActivity.average_heartrate && (
                <div className="bg-zinc-50 dark:bg-zinc-800 p-3 rounded-lg">
                  <p className="text-xs text-zinc-500 uppercase">Avg HR</p>
                  <p className="text-lg font-semibold">{Math.round(displayActivity.average_heartrate)} bpm</p>
                </div>
              )}
              {displayActivity.average_cadence && (
                <div className="bg-zinc-50 dark:bg-zinc-800 p-3 rounded-lg">
                  <p className="text-xs text-zinc-500 uppercase">Cadence</p>
                  <p className="text-lg font-semibold">{Math.round(displayActivity.average_cadence)} rpm</p>
                </div>
              )}
              {displayActivity.average_watts && (
                <div className="bg-zinc-50 dark:bg-zinc-800 p-3 rounded-lg">
                  <p className="text-xs text-zinc-500 uppercase">Avg Power</p>
                  <p className="text-lg font-semibold">{Math.round(displayActivity.average_watts)} W</p>
                </div>
              )}
            </div>

            {displayActivity.map && displayActivity.map.summary_polyline && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3 text-zinc-900 dark:text-zinc-100">Route Map</h3>
                <div className="rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-700">
                  <iframe
                    src={`https://www.strava.com/activities/${displayActivity.id}/embed`}
                    width="100%"
                    height="400"
                    frameBorder="0"
                    scrolling="no"
                    title="Activity Map"
                    className="w-full"
                  ></iframe>
                </div>
                {displayActivity.map.id && (
                  <p className="text-xs text-zinc-500 mt-2">
                    Map ID: {displayActivity.map.id}
                  </p>
                )}
              </div>
            )}

            {fastestSplit && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3 text-zinc-900 dark:text-zinc-100">Fastest Split</h3>
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-zinc-500">Split #{fastestSplit.split}</p>
                      <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                        {formatPace(fastestSplit.moving_time > 0 && fastestSplit.distance > 0
                          ? (fastestSplit.moving_time / 60) / (fastestSplit.distance / 1000)
                          : null)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-zinc-500">Time</p>
                      <p className="text-lg font-semibold">{formatTime(fastestSplit.moving_time)}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {hrZones && hrZones.distribution_buckets && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3 text-zinc-900 dark:text-zinc-100">Heart Rate Zones</h3>
                <div className="space-y-2">
                  {hrZones.distribution_buckets.map((bucket, idx) => {
                    const totalTime = hrZones.distribution_buckets!.reduce((sum, b) => sum + b.time, 0);
                    const percentage = totalTime > 0 ? (bucket.time / totalTime) * 100 : 0;
                    return (
                      <div key={idx} className="flex items-center gap-3">
                        <div className="w-20 text-xs text-zinc-500">
                          {bucket.min}-{bucket.max}
                        </div>
                        <div className="flex-1 bg-zinc-100 dark:bg-zinc-800 rounded-full h-6 overflow-hidden">
                          <div 
                            className="bg-red-500 h-full rounded-full" 
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                        <div className="w-16 text-xs text-right text-zinc-500">
                          {Math.round(bucket.time / 60)}m
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {powerZones && powerZones.distribution_buckets && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3 text-zinc-900 dark:text-zinc-100">Power Zones</h3>
                <div className="space-y-2">
                  {powerZones.distribution_buckets.map((bucket, idx) => {
                    const totalTime = powerZones.distribution_buckets!.reduce((sum, b) => sum + b.time, 0);
                    const percentage = totalTime > 0 ? (bucket.time / totalTime) * 100 : 0;
                    return (
                      <div key={idx} className="flex items-center gap-3">
                        <div className="w-20 text-xs text-zinc-500">
                          {bucket.min}-{bucket.max}
                        </div>
                        <div className="flex-1 bg-zinc-100 dark:bg-zinc-800 rounded-full h-6 overflow-hidden">
                          <div 
                            className="bg-blue-500 h-full rounded-full" 
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                        <div className="w-16 text-xs text-right text-zinc-500">
                          {Math.round(bucket.time / 60)}m
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

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
                        const isFastest = fastestSplit && split.split === fastestSplit.split;
                        return (
                          <tr 
                            key={split.split} 
                            className={`border-b border-zinc-100 dark:border-zinc-800 ${isFastest ? 'bg-green-50 dark:bg-green-900/20' : ''}`}
                          >
                            <td className="py-2 px-2">
                              {split.split}
                              {isFastest && <span className="ml-1 text-green-600">★</span>}
                            </td>
                            <td className="py-2 px-2 text-right">{(split.distance / 1000).toFixed(2)} km</td>
                            <td className="py-2 px-2 text-right">{formatTime(split.moving_time)}</td>
                            <td className="py-2 px-2 text-right font-semibold">{formatPace(splitPace)}</td>
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
          </>
        )}
      </div>
    </div>
  );
}
