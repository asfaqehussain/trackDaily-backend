import { StatsPeriod, StatsResponse } from './stats.types';
import { Task } from '../tasks/task.model';
import { Habit } from '../habits/habit.model';
import { computeStreak } from '../habits/habit.service';

function getPeriodRange(period: StatsPeriod): { start: Date; end: Date; prevStart: Date; prevEnd: Date } {
  const now = new Date();
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
  let start: Date;
  let prevStart: Date;
  let prevEnd: Date;

  switch (period) {
    case 'week':
      start = new Date(end);
      start.setDate(start.getDate() - 6);
      start.setHours(0, 0, 0, 0);
      prevEnd = new Date(start);
      prevEnd.setSeconds(prevEnd.getSeconds() - 1);
      prevStart = new Date(prevEnd);
      prevStart.setDate(prevStart.getDate() - 6);
      prevStart.setHours(0, 0, 0, 0);
      break;
    case 'month':
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      prevEnd = new Date(start);
      prevEnd.setSeconds(prevEnd.getSeconds() - 1);
      prevStart = new Date(prevEnd.getFullYear(), prevEnd.getMonth(), 1);
      break;
    case 'year':
      start = new Date(now.getFullYear(), 0, 1);
      prevEnd = new Date(start);
      prevEnd.setSeconds(prevEnd.getSeconds() - 1);
      prevStart = new Date(prevEnd.getFullYear() - 1, 0, 1);
      break;
  }

  return { start, end, prevStart, prevEnd };
}

function getDaysInPeriod(period: StatsPeriod): number {
  switch (period) {
    case 'week': return 7;
    case 'month': return 30;
    case 'year': return 365;
  }
}

function formatDate(date: Date): string {
  return date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0') + '-' + String(date.getDate()).padStart(2, '0');
}

export async function getStats(userId: string, period: StatsPeriod): Promise<StatsResponse> {
  const { start, end, prevStart, prevEnd } = getPeriodRange(period);

  const [tasksCurrent, tasksPrev, habits, pendingTasksCount] = await Promise.all([
    Task.find({ userId, status: 'completed', updatedAt: { $gte: start, $lte: end } }),
    Task.find({ userId, status: 'completed', updatedAt: { $gte: prevStart, $lte: prevEnd } }),
    Habit.find({ userId }),
    Task.countDocuments({ userId, status: 'pending' }),
  ]);

  const tasksDone = tasksCurrent.length;
  const tasksDonePrev = tasksPrev.length;
  const tasksDoneChange = tasksDonePrev === 0
    ? (tasksDone > 0 ? '+100%' : '+0%')
    : `${tasksDone > tasksDonePrev ? '+' : ''}${Math.round(((tasksDone - tasksDonePrev) / tasksDonePrev) * 100)}%`;

  let bestStreak = 0;
  let totalCheckIns = 0;
  let expectedCheckIns = 0;
  const habitBreakdown: { id: string; name: string; consistency: number }[] = [];

  for (const habit of habits) {
    if (computeStreak(habit.checkIns) > bestStreak) bestStreak = computeStreak(habit.checkIns);
    
    const created = new Date(habit.createdAt);
    const daysSinceCreation = Math.max(1, Math.floor((end.getTime() - created.getTime()) / 86_400_000));
    const cappedDays = Math.min(daysSinceCreation, getDaysInPeriod(period));
    
    // Count check-ins within the current period
    const periodCheckIns = habit.checkIns.filter((d) => {
      const checkDate = new Date(d + 'T00:00:00');
      return checkDate >= start && checkDate <= end;
    }).length;

    const expectedDays = getDaysInPeriod(period);
    const consistency = Math.round((periodCheckIns / expectedDays) * 100);
    
    habitBreakdown.push({
      id: habit._id.toString(),
      name: habit.name,
      consistency,
    });

    totalCheckIns += periodCheckIns;
    expectedCheckIns += cappedDays;
  }

  const habitConsistency = expectedCheckIns === 0 ? 0 : Math.min(100, Math.round((totalCheckIns / expectedCheckIns) * 100));

  const days = getDaysInPeriod(period);
  const avgPerDay = parseFloat((tasksDone / days).toFixed(1));

  const dailyTasks: { date: string; count: number }[] = [];
  const current = new Date(start);
  while (current <= end) {
    const dateStr = formatDate(current);
    const count = tasksCurrent.filter((t) => formatDate(new Date(t.updatedAt)) === dateStr).length;
    dailyTasks.push({ date: dateStr, count });
    current.setDate(current.getDate() + 1);
  }

  return {
    period,
    tasksDone,
    tasksDoneChange,
    bestStreak,
    habitConsistency,
    avgPerDay,
    dailyTasks,
    habitBreakdown,
    totalHabits: habits.length,
    pendingTasks: pendingTasksCount,
  };
}
