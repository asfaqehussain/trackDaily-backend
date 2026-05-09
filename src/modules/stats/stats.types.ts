export type StatsPeriod = 'week' | 'month' | 'year';

export interface HabitBreakdown {
  id: string;
  name: string;
  consistency: number;
}

export interface StatsResponse {
  period: StatsPeriod;
  tasksDone: number;
  tasksDoneChange: string;
  bestStreak: number;
  habitConsistency: number;
  avgPerDay: number;
  dailyTasks: { date: string; count: number }[];
  habitBreakdown: HabitBreakdown[];
  totalHabits: number;
  pendingTasks: number;
}
