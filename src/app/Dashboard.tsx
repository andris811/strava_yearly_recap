 'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { StatCard } from '@/components/StatCard';
import { Charts } from '@/components/Charts';
import { Heatmap } from '@/components/Heatmap';
import { ActivityList } from '@/components/ActivityList';
import { HistorySection } from '@/components/HistorySection';
import { ActivityDetail } from '@/components/ActivityDetail';
import { ThemeToggle } from '@/components/ThemeToggle';
import { filterActivitiesByYear, calculateYearStats } from '@/lib/strava';
import { StravaActivity } from '@/lib/types';

function formatTime(hours: number): string {
  const h = Math.floor(hours);
  const minutes = Math.round((hours - h) * 60);
  if (h > 0) {
    return `${h}h ${minutes}m`;
  }
  return `${minutes}m`;
}

function formatPace(pace: number | null): string {
  if (pace === null) return '-';
  const minutes = Math.floor(pace);
  const seconds = Math.round((pace - minutes) * 60);
  return `${minutes}:${seconds.toString().padStart(2, '0')} /km`;
}

export default function Dashboard() {
  const [activities, setActivities] = useState<StravaActivity[]>([]);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [availableYears, setAvailableYears] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedActivity, setSelectedActivity] = useState<StravaActivity | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const response = await fetch('/api/activities');
        const data = await response.json();
        
        if (!response.ok) {
          if (data.needsAuth) {
            window.location.href = '/connect';
            return;
          }
          throw new Error(data.error || 'Failed to fetch activities');
        }
        
        setActivities(data.activities);
        setAvailableYears(data.years);
        if (data.years.length > 0 && !data.years.includes(selectedYear)) {
          setSelectedYear(data.years[0]);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load activities');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const filteredActivities = filterActivitiesByYear(activities, selectedYear);
  const stats = calculateYearStats(filteredActivities, activities);

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-zinc-600 dark:text-zinc-400">Loading your Strava data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-black flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <div className="text-4xl mb-4">!</div>
          <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">Error</h1>
          <p className="text-zinc-600 dark:text-zinc-400 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <header className="bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="relative w-12 h-12 sm:w-14 sm:h-14 flex-shrink-0">
                <Image
                  src="/strava_year_recap_logo.PNG"
                  alt="Strava Year Recap"
                  fill
                  sizes="(max-width: 640px) 48px, 56px"
                  className="object-contain rounded-lg"
                />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-zinc-100">
                  Strava Year in Review
                </h1>
                <a 
                  href="https://strava.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-xs text-orange-500 hover:text-orange-600"
                >
                  Powered by Strava
                </a>
              </div>
            </div>
            
            <div className="flex items-center gap-2 sm:gap-4">
              {availableYears.length > 0 && (
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                  className="px-2 sm:px-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-medium text-sm sm:text-base"
                >
                  {availableYears.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              )}
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <StatCard
            title="Total Distance"
            value={`${stats.totalDistance.toFixed(1)} km`}
            subtitle={`${stats.activityCount} activities`}
          />
          <StatCard
            title="Moving Time"
            value={formatTime(stats.totalMovingTime)}
            subtitle={`${stats.avgDistance.toFixed(1)} km avg`}
          />
          <StatCard
            title="Elevation Gain"
            value={`${stats.totalElevation.toFixed(0)} m`}
            subtitle={`${stats.totalDistance > 0 ? (stats.totalElevation / stats.totalDistance).toFixed(0) : 0} m/km`}
          />
          <StatCard
            title="Activities"
            value={stats.activityCount.toString()}
            subtitle={`${stats.currentStreak} day streak`}
          />
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <StatCard
            title="Avg Distance"
            value={`${stats.avgDistance.toFixed(1)} km`}
          />
          <StatCard
            title="Longest Activity"
            value={`${stats.longestActivity?.distance.toFixed(1) || 0} km`}
            subtitle={stats.longestActivity ? `${stats.longestActivity.name} (${stats.longestActivity.date})` : undefined}
          />
          <StatCard
            title="Fastest Pace"
            value={formatPace(stats.fastestPace?.pace || null)}
            subtitle={stats.fastestPace ? `${stats.fastestPace.name} (${stats.fastestPace.date})` : undefined}
          />
          {stats.totalCalories > 0 ? (
            <StatCard
              title="Calories Burned"
              value={stats.totalCalories.toLocaleString()}
              subtitle={`${stats.activitiesWithHr} with HR data`}
            />
          ) : (
            <StatCard
              title="Current Streak"
              value={`${stats.currentStreak} days`}
              subtitle={`Longest: ${stats.longestStreak} days`}
            />
          )}
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {stats.avgHeartrate && stats.avgHeartrate > 0 && (
            <StatCard
              title="Avg Heart Rate"
              value={`${Math.round(stats.avgHeartrate)} bpm`}
              subtitle={stats.maxHeartrate ? `Max: ${Math.round(stats.maxHeartrate)} bpm` : undefined}
            />
          )}
          {stats.totalCalories > 0 ? (
            <StatCard
              title="Current Streak"
              value={`${stats.currentStreak} days`}
              subtitle={`Longest: ${stats.longestStreak} days`}
            />
          ) : (
            <StatCard
              title="Weekend Total"
              value={`${stats.weekendStats.distance.toFixed(1)} km`}
              subtitle={`${stats.weekendStats.count} activities`}
            />
          )}
          {stats.totalCalories <= 0 && (
            <StatCard
              title="Most Active Type"
              value={Object.entries(stats.activityTypes).sort((a, b) => b[1] - a[1])[0]?.[0] || '-'}
              subtitle={`${Object.values(stats.activityTypes).reduce((a, b) => a + b, 0)} total`}
            />
          )}
        </div>

        <Charts
          monthlyDistance={stats.monthlyDistance}
          monthlyActivities={stats.monthlyActivities}
          activityTypes={stats.activityTypes}
          weekdayStats={stats.weekdayStats}
          yearlyComparison={stats.yearlyComparison}
        />

        <Heatmap dailyActivity={stats.dailyActivity} year={selectedYear} />

        <HistorySection activities={activities} onSelectActivity={setSelectedActivity} />
        
        <ActivityList activities={filteredActivities} onSelectActivity={setSelectedActivity} />
      </main>

      {selectedActivity && (
        <ActivityDetail
          activity={selectedActivity}
          onClose={() => setSelectedActivity(null)}
        />
      )}
    </div>
  );
}