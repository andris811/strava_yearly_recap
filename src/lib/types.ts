export interface StravaActivity {
  id: number;
  name: string;
  type: string;
  sport_type: string;
  start_date: string;
  start_date_local: string;
  timezone: string;
  distance: number;
  moving_time: number;
  elapsed_time: number;
  total_elevation_gain: number;
  average_speed: number;
  max_speed: number;
  average_heartrate: number | null;
  max_heartrate: number | null;
  start_latlng: [number, number] | null;
  end_latlng: [number, number] | null;
  calories: number | null;
  average_cadence: number | null;
  average_watts: number | null;
  device_watts: boolean;
  kilojoules: number | null;
  split_standard: SplitData[] | null;
  splits_metric: SplitData[] | null;
  map: {
    id: string;
    polyline: string | null;
    summary_polyline: string | null;
  } | null;
}

export interface SplitData {
  split: number;
  meter_diff: number;
  elapsed_time: number;
  moving_time: number;
  pace_zone: number;
  distance: number;
  avg_heartrate: number | null;
  avg_speed: number;
}

export interface YearStats {
  year: number;
  totalDistance: number;
  totalMovingTime: number;
  totalElevation: number;
  activityCount: number;
  avgDistance: number;
  longestActivity: { distance: number; name: string; id: number } | null;
  fastestPace: { pace: number; name: string; id: number } | null;
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
}