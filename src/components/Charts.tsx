'use client';

import { useTheme } from './ThemeProvider';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line,
} from 'recharts';

interface MonthlyData {
  month: string;
  distance: number;
  activities: number;
}

interface TypeData {
  name: string;
  value: number;
}

interface WeekdayData {
  day: string;
  distance: number;
  count: number;
}

interface YearComparisonData {
  year: number;
  distance: number;
  activities: number;
}

const COLORS = ['#fc4c02', '#00a0dc', '#84c225', '#8c8c8c', '#ff6b6b', '#4ecdc4', '#45b7d1'];

interface ChartsProps {
  monthlyDistance: Record<number, number>;
  monthlyActivities: Record<number, number>;
  activityTypes: Record<string, number>;
  weekdayStats?: Record<number, { count: number; distance: number }>;
  yearlyComparison?: Record<number, { distance: number; activities: number; time: number }>;
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-zinc-800 p-3 rounded-lg shadow-lg border border-zinc-200 dark:border-zinc-700">
        <p className="font-medium text-zinc-900 dark:text-zinc-100">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} style={{ color: entry.color }} className="text-sm">
            {entry.name}: {entry.name === 'distance' ? entry.value.toFixed(1) : entry.value}
            {entry.name === 'distance' ? ' km' : ''}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export function Charts({ 
  monthlyDistance, 
  monthlyActivities, 
  activityTypes,
  weekdayStats,
  yearlyComparison,
}: ChartsProps) {
  const { theme } = useTheme();
  const gridStroke = theme === 'dark' ? '#333' : '#e5e5e5';
  const monthlyData: MonthlyData[] = MONTHS.map((name, index) => ({
    month: name,
    distance: monthlyDistance[index + 1] || 0,
    activities: monthlyActivities[index + 1] || 0,
  }));

  const typeData: TypeData[] = Object.entries(activityTypes).map(([name, value]) => ({
    name,
    value,
  }));

  const weekdayData: WeekdayData[] = DAYS.map((name, index) => ({
    day: name,
    distance: weekdayStats?.[index]?.distance || 0,
    count: weekdayStats?.[index]?.count || 0,
  }));

  const comparisonData: YearComparisonData[] = yearlyComparison 
    ? Object.entries(yearlyComparison)
        .sort(([a], [b]) => Number(a) - Number(b))
        .map(([year, data]) => ({
          year: Number(year),
          distance: data.distance,
          activities: data.activities,
        }))
    : [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white dark:bg-zinc-900 rounded-xl p-6 shadow-sm border border-zinc-200 dark:border-zinc-800">
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
          Monthly Distance (km)
        </h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
            <XAxis dataKey="month" fontSize={12} />
            <YAxis fontSize={12} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="distance" name="distance" fill="#fc4c02" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-xl p-6 shadow-sm border border-zinc-200 dark:border-zinc-800">
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
          Activities per Month
        </h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
            <XAxis dataKey="month" fontSize={12} />
            <YAxis fontSize={12} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="activities" name="activities" fill="#00a0dc" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {weekdayStats && (
        <div className="bg-white dark:bg-zinc-900 rounded-xl p-6 shadow-sm border border-zinc-200 dark:border-zinc-800">
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
            Weekday vs Weekend
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={weekdayData}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
              <XAxis dataKey="day" fontSize={12} />
              <YAxis fontSize={12} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="distance" name="distance" fill="#84c225" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {yearlyComparison && Object.keys(yearlyComparison).length > 1 && (
        <div className="bg-white dark:bg-zinc-900 rounded-xl p-6 shadow-sm border border-zinc-200 dark:border-zinc-800">
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
            Year over Year
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={comparisonData}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
              <XAxis dataKey="year" fontSize={12} />
              <YAxis fontSize={12} yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" fontSize={12} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line yAxisId="left" type="monotone" dataKey="distance" name="distance" stroke="#fc4c02" strokeWidth={2} />
              <Line yAxisId="right" type="monotone" dataKey="activities" name="activities" stroke="#00a0dc" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="bg-white dark:bg-zinc-900 rounded-xl p-6 shadow-sm border border-zinc-200 dark:border-zinc-800 lg:col-span-2">
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
          Activity Type Distribution
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={typeData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={2}
              dataKey="value"
              labelLine={false}
              label={({ name, percent, value }) => {
                if (percent! < 0.05) return null;
                return `${name} (${(percent! * 100).toFixed(0)}%)`;
              }}
            >
              {typeData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e5e5e5',
                borderRadius: '8px',
              }}
            />
            <Legend 
              layout="horizontal"
              verticalAlign="bottom"
              align="center"
              formatter={(value) => {
                const item = typeData.find(t => t.name === value);
                const percent = item ? (item.value / typeData.reduce((a, b) => a + b.value, 0)) * 100 : 0;
                if (percent < 5) {
                  return <span title={`${value}: ${item?.value} activities`}>{value}</span>;
                }
                return value;
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}