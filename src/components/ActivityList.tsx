'use client';

import { useState, useMemo } from 'react';
import { StravaActivity } from '@/lib/types';

interface ActivityListProps {
  activities: StravaActivity[];
  onSelectActivity: (activity: StravaActivity) => void;
}

function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
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

export function ActivityList({ activities, onSelectActivity }: ActivityListProps) {
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'distance'>('date');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const activityTypes = useMemo(() => {
    const types = new Set(activities.map((a) => a.type));
    return ['all', ...Array.from(types).sort()];
  }, [activities]);

  const filteredActivities = useMemo(() => {
    let filtered = [...activities];
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter((a) => a.name.toLowerCase().includes(term));
    }
    
    if (typeFilter !== 'all') {
      filtered = filtered.filter((a) => a.type === typeFilter);
    }
    
    if (dateFrom) {
      const from = new Date(dateFrom);
      filtered = filtered.filter((a) => new Date(a.start_date_local) >= from);
    }
    
    if (dateTo) {
      const to = new Date(dateTo);
      to.setDate(to.getDate() + 1);
      filtered = filtered.filter((a) => new Date(a.start_date_local) < to);
    }
    
    filtered.sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(b.start_date_local).getTime() - new Date(a.start_date_local).getTime();
      }
      return b.distance - a.distance;
    });
    
    return filtered;
  }, [activities, searchTerm, typeFilter, sortBy, dateFrom, dateTo]);

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-xl p-6 shadow-sm border border-zinc-200 dark:border-zinc-800">
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            Activities ({filteredActivities.length})
          </h3>
          
          <div className="flex gap-4">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-sm"
            >
              {activityTypes.map((type) => (
                <option key={type} value={type}>
                  {type === 'all' ? 'All Types' : type}
                </option>
              ))}
            </select>
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'date' | 'distance')}
              className="px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-sm"
            >
              <option value="date">Sort by Date</option>
              <option value="distance">Sort by Distance</option>
            </select>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="Search activities..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-sm placeholder-zinc-400"
          />
          <div className="flex gap-3">
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-sm"
              placeholder="From"
            />
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-sm"
              placeholder="To"
            />
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-zinc-200 dark:border-zinc-700">
              <th className="text-left py-3 px-2 text-xs font-medium text-zinc-500 uppercase">Type</th>
              <th className="text-left py-3 px-2 text-xs font-medium text-zinc-500 uppercase">Name</th>
              <th className="text-left py-3 px-2 text-xs font-medium text-zinc-500 uppercase">Date</th>
              <th className="text-right py-3 px-2 text-xs font-medium text-zinc-500 uppercase">Distance</th>
              <th className="text-right py-3 px-2 text-xs font-medium text-zinc-500 uppercase">Time</th>
              <th className="text-right py-3 px-2 text-xs font-medium text-zinc-500 uppercase">Elev</th>
            </tr>
          </thead>
          <tbody>
            {filteredActivities.slice(0, 50).map((activity) => (
              <tr
                key={activity.id}
                onClick={() => onSelectActivity(activity)}
                className="border-b border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 cursor-pointer"
              >
                <td className="py-3 px-2 text-lg">
                  {ACTIVITY_ICONS[activity.type] || ACTIVITY_ICONS.Default}
                </td>
                <td className="py-3 px-2 text-sm font-medium text-zinc-900 dark:text-zinc-100 max-w-[200px] truncate">
                  {activity.name}
                </td>
                <td className="py-3 px-2 text-sm text-zinc-600 dark:text-zinc-400">
                  {formatDate(activity.start_date_local)}
                </td>
                <td className="py-3 px-2 text-sm text-zinc-900 dark:text-zinc-100 text-right">
                  {(activity.distance / 1000).toFixed(2)} km
                </td>
                <td className="py-3 px-2 text-sm text-zinc-900 dark:text-zinc-100 text-right">
                  {formatTime(activity.moving_time)}
                </td>
                <td className="py-3 px-2 text-sm text-zinc-900 dark:text-zinc-100 text-right">
                  {activity.total_elevation_gain?.toFixed(0) || 0} m
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {filteredActivities.length > 50 && (
        <p className="text-center text-sm text-zinc-500 mt-4">
          Showing 50 of {filteredActivities.length} activities
        </p>
      )}
    </div>
  );
}