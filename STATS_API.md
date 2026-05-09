# Stats API Documentation

## Endpoint

`GET /stats`

Retrieves aggregated user statistics for tasks and habits, suitable for the Insights/Stats screen.

---

## Request

### Headers
| Header | Type | Required | Description |
|--------|------|----------|-------------|
| `Authorization` | `Bearer <token>` | Yes | JWT token from login |

### Query Parameters
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `period` | `week` \| `month` \| `year` | `week` | Time range for aggregation |

### Example Requests

```bash
# This week (default)
curl "http://localhost:3000/stats" \
  -H "Authorization: Bearer <token>"

# This month
curl "http://localhost:3000/stats?period=month" \
  -H "Authorization: Bearer <token>"

# This year
curl "http://localhost:3000/stats?period=year" \
  -H "Authorization: Bearer <token>"
```

---

## Response

### Success (200)

```typescript
interface StatsResponse {
  success: boolean;
  data: {
    period: 'week' | 'month' | 'year';
    tasksDone: number;              // Completed tasks in period
    tasksDoneChange: string;        // e.g., "+18%", "-30%", "+100%"
    bestStreak: number;             // Longest streak across all habits
    habitConsistency: number;       // Global avg % (0-100)
    avgPerDay: number;              // Avg tasks completed per day
    dailyTasks: {                   // For bar/line chart
      date: string;                 // "YYYY-MM-DD"
      count: number;
    }[];
    habitBreakdown: {               // "Habits this week" list
      id: string;
      name: string;
      consistency: number;          // Per-habit % (0-100)
    }[];
    totalHabits: number;            // Total habits count
    pendingTasks: number;           // Total non-completed tasks
  };
  message: string;
}
```

### Error (400 / 401)

```json
{
  "success": false,
  "message": "Invalid or expired token"
}
```

---

## React Native Integration

### TypeScript Types

```typescript
export type StatsPeriod = 'week' | 'month' | 'year';

export interface DailyTask {
  date: string;
  count: number;
}

export interface HabitBreakdown {
  id: string;
  name: string;
  consistency: number;
}

export interface StatsData {
  period: StatsPeriod;
  tasksDone: number;
  tasksDoneChange: string;
  bestStreak: number;
  habitConsistency: number;
  avgPerDay: number;
  dailyTasks: DailyTask[];
  habitBreakdown: HabitBreakdown[];
  totalHabits: number;
  pendingTasks: number;
}
```

### API Call Example

```typescript
import { StatsData, StatsPeriod } from './types';

export async function fetchStats(
  token: string,
  period: StatsPeriod = 'week'
): Promise<StatsData> {
  const res = await fetch(
    `http://localhost:3000/stats?period=${period}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  if (!res.ok) throw new Error('Failed to fetch stats');
  const json = await res.json();
  return json.data;
}
```

### Usage in Stats Screen

```typescript
const [stats, setStats] = useState<StatsData | null>(null);
const [period, setPeriod] = useState<StatsPeriod>('week');

useEffect(() => {
  fetchStats(token, period).then(setStats);
}, [period]);

// UI Mapping:
// - Tasks completed: stats.tasksDone
// - Change badge: stats.tasksDoneChange (render as-is: "+18%")
// - Best streak: stats.bestStreak
// - Avg per day: stats.avgPerDay (show as "4.2h" or similar)
// - Habit consistency: stats.habitConsistency (global %)
// - Chart data: stats.dailyTasks (map to x: date, y: count)
// - Habits list: stats.habitBreakdown (map to progress bars)
// - Profile badges: stats.totalHabits, stats.pendingTasks
```

---

## Notes

- `tasksDoneChange` is a formatted string. Do not parse it as a number — render directly.
- `dailyTasks` length depends on period: 7 (week), 30 (month), 365 (year).
- `habitBreakdown` consistency is calculated per-habit against the fixed period length.
- All percentages are capped at 100.
- Dates use local server time. Client should format `date` strings for display.
