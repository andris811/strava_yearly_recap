import { StravaActivity } from './types';

export function filterActivitiesByYear(
  activities: StravaActivity[],
  year: number
): StravaActivity[] {
  return activities.filter((activity) => {
    const activityYear = new Date(activity.start_date_local).getFullYear();
    return activityYear === year;
  });
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function calculateStreaks(dailyActivity: Record<string, number>): { longest: number; current: number } {
  const dates = Object.keys(dailyActivity).sort();
  if (dates.length === 0) return { longest: 0, current: 0 };

  let longestStreak = 0;
  let currentStreak = 0;
  let tempStreak = 0;
  let prevDate: Date | null = null;

  for (const dateStr of dates) {
    const date = new Date(dateStr);
    if (prevDate) {
      const diffDays = Math.round((date.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays === 1) {
        tempStreak++;
      } else {
        longestStreak = Math.max(longestStreak, tempStreak);
        tempStreak = 1;
      }
    } else {
      tempStreak = 1;
    }
    prevDate = date;
  }
  longestStreak = Math.max(longestStreak, tempStreak);

  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const todayStr = today.toISOString().split('T')[0];
  const yesterdayStr = yesterday.toISOString().split('T')[0];
  
  if (dailyActivity[todayStr]) {
    currentStreak = 1;
    let checkDate = yesterday;
    while (dailyActivity[checkDate.toISOString().split('T')[0]]) {
      currentStreak++;
      checkDate.setDate(checkDate.getDate() - 1);
    }
  }

  return { longest: longestStreak, current: currentStreak };
}

export function calculateYearStats(
  activities: StravaActivity[],
  allActivities: StravaActivity[] = []
): {
  totalDistance: number;
  totalMovingTime: number;
  totalElevation: number;
  activityCount: number;
  avgDistance: number;
  longestActivity: { distance: number; name: string; id: number; date: string } | null;
  fastestPace: { pace: number; name: string; id: number; date: string } | null;
  activityTypes: Record<string, number>;
  monthlyDistance: Record<number, number>;
  monthlyActivities: Record<number, number>;
  dailyActivity: Record<string, number>;
  totalCalories: number;
  avgHeartrate: number | null;
  maxHeartrate: number | null;
  activitiesWithHr: number;
  weekdayStats: Record<number, { count: number; distance: number }>;
  weekendStats: { count: number; distance: number };
  longestStreak: number;
  currentStreak: number;
  yearlyComparison: Record<number, { distance: number; activities: number; time: number }>;
} {
  let totalDistance = 0;
  let totalMovingTime = 0;
  let totalElevation = 0;
  let totalCalories = 0;
  let longestActivityDistance = 0;
  let longestActivity: { distance: number; name: string; id: number; date: string } | null = null;
  let fastestPace: { pace: number; name: string; id: number; date: string } | null = null;
  let heartrateSum = 0;
  let maxHeartrate: number | null = null;
  let activitiesWithHr = 0;

  const activityTypes: Record<string, number> = {};
  const monthlyDistance: Record<number, number> = {};
  const monthlyActivities: Record<number, number> = {};
  const dailyActivity: Record<string, number> = {};
  const weekdayStats: Record<number, { count: number; distance: number }> = {
    0: { count: 0, distance: 0 }, 
    1: { count: 0, distance: 0 },
    2: { count: 0, distance: 0 },
    3: { count: 0, distance: 0 },
    4: { count: 0, distance: 0 },
    5: { count: 0, distance: 0 },
    6: { count: 0, distance: 0 },
  };

  for (const activity of activities) {
    const distanceKm = activity.distance / 1000;
    const movingTimeHours = activity.moving_time / 3600;
    const date = new Date(activity.start_date_local);
    const month = date.getMonth() + 1;
    const dateKey = activity.start_date.split('T')[0];
    const dayOfWeek = date.getDay();
    
    const calories = activity.calories ?? (activity as any).estimated_calories ?? 0;

    totalDistance += distanceKm;
    totalMovingTime += movingTimeHours;
    totalElevation += activity.total_elevation_gain || 0;
    totalCalories += calories;

    if (distanceKm > longestActivityDistance) {
      longestActivityDistance = distanceKm;
      longestActivity = { 
        distance: distanceKm, 
        name: activity.name, 
        id: activity.id,
        date: formatDate(activity.start_date_local)
      };
    }

    if (activity.type === 'Run' && activity.moving_time > 0) {
      const paceMinPerKm = (activity.moving_time / 60) / distanceKm;
      if (fastestPace === null || paceMinPerKm < fastestPace.pace) {
        fastestPace = { 
          pace: paceMinPerKm, 
          name: activity.name, 
          id: activity.id,
          date: formatDate(activity.start_date_local)
        };
      }
    }

    if (activity.average_heartrate) {
      heartrateSum += activity.average_heartrate;
      activitiesWithHr++;
      if (maxHeartrate === null || activity.max_heartrate! > maxHeartrate) {
        maxHeartrate = activity.max_heartrate;
      }
    }

    activityTypes[activity.type] = (activityTypes[activity.type] || 0) + 1;
    monthlyDistance[month] = (monthlyDistance[month] || 0) + distanceKm;
    monthlyActivities[month] = (monthlyActivities[month] || 0) + 1;
    dailyActivity[dateKey] = (dailyActivity[dateKey] || 0) + distanceKm;
    
    const adjustedDay = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    weekdayStats[adjustedDay].count++;
    weekdayStats[adjustedDay].distance += distanceKm;
  }

  const { longest: longestStreak, current: currentStreak } = calculateStreaks(dailyActivity);

  const weekendCount = weekdayStats[5].count + weekdayStats[6].count;
  const weekendDistance = weekdayStats[5].distance + weekdayStats[6].distance;

  const yearlyComparison: Record<number, { distance: number; activities: number; time: number }> = {};
  const years = new Set<number>();
  for (const act of allActivities) {
    years.add(new Date(act.start_date_local).getFullYear());
  }
  for (const year of years) {
    const yearActs = allActivities.filter(a => new Date(a.start_date_local).getFullYear() === year);
    yearlyComparison[year] = {
      distance: yearActs.reduce((sum, a) => sum + a.distance / 1000, 0),
      activities: yearActs.length,
      time: yearActs.reduce((sum, a) => sum + a.moving_time / 3600, 0),
    };
  }

  return {
    totalDistance,
    totalMovingTime,
    totalElevation,
    activityCount: activities.length,
    avgDistance: activities.length > 0 ? totalDistance / activities.length : 0,
    longestActivity,
    fastestPace,
    activityTypes,
    monthlyDistance,
    monthlyActivities,
    dailyActivity,
    totalCalories,
    avgHeartrate: activitiesWithHr > 0 ? heartrateSum / activitiesWithHr : null,
    maxHeartrate,
    activitiesWithHr,
    weekdayStats,
    weekendStats: { count: weekendCount, distance: weekendDistance },
    longestStreak,
    currentStreak,
    yearlyComparison,
  };
}

export function getAvailableYears(activities: StravaActivity[]): number[] {
  const years = new Set<number>();
  for (const activity of activities) {
    years.add(new Date(activity.start_date_local).getFullYear());
  }
  return Array.from(years).sort((a, b) => b - a);
}