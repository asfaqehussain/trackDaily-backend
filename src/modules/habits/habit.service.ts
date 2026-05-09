import { Habit, IHabit } from './habit.model';
import { CreateHabitBody, UpdateHabitBody, CheckInBody, HabitResponse } from './habit.types';

function formatHabit(habit: IHabit): HabitResponse {
  return {
    id: habit._id.toString(),
    name: habit.name,
    description: habit.description,
    checkIns: habit.checkIns,
    streak: computeStreak(habit.checkIns),
    icon: habit.icon,
    color: habit.color,
    repeatType: habit.repeatType,
    repeatDays: habit.repeatDays,
    createdAt: habit.createdAt.toISOString(),
    updatedAt: habit.updatedAt.toISOString(),
  };
}

/**
 * Compute streak from a sorted list of unique ISO date strings.
 * Algorithm:
 *  - Sort descending
 *  - Walk backwards checking consecutive days
 *  - Streak resets if a gap is found
 */
export function computeStreak(checkIns: string[]): number {
  if (checkIns.length === 0) return 0;

  // Sort dates descending
  const sorted = [...checkIns].sort((a, b) => (a > b ? -1 : 1));

  const now = new Date();
  const todayStr = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0') + '-' + String(now.getDate()).padStart(2, '0');
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.getFullYear() + '-' + String(yesterday.getMonth() + 1).padStart(2, '0') + '-' + String(yesterday.getDate()).padStart(2, '0');

  // Streak is only active if the most recent check-in was today or yesterday
  if (sorted[0] !== todayStr && sorted[0] !== yesterdayStr) {
    return 0; // Streak is broken
  }

  let streak = 1;
  for (let i = 1; i < sorted.length; i++) {
    const prev = new Date(sorted[i - 1]);
    const curr = new Date(sorted[i]);
    const diffDays = Math.round((prev.getTime() - curr.getTime()) / 86_400_000);

    if (diffDays === 1) {
      streak++;
    } else {
      break; // Gap found — streak ends here
    }
  }

  return streak;
}

export async function getHabits(userId: string): Promise<HabitResponse[]> {
  const habits = await Habit.find({ userId }).sort({ updatedAt: -1 });
  return habits.map(formatHabit);
}

export async function createHabit(userId: string, body: CreateHabitBody): Promise<HabitResponse> {
  const habit = await Habit.create({
    name: body.name,
    description: body.description,
    icon: body.icon,
    color: body.color,
    repeatType: body.repeatType,
    repeatDays: body.repeatDays,
    checkIns: [],
    streak: 0,
    userId,
  });
  return formatHabit(habit);
}

export async function updateHabit(
  userId: string,
  habitId: string,
  body: UpdateHabitBody
): Promise<HabitResponse | null> {
  const habit = await Habit.findOne({ _id: habitId, userId });
  if (!habit) return null;

  // Idempotency: skip if server version is newer
  if (body.updatedAt) {
    const incomingTime = new Date(body.updatedAt).getTime();
    const storedTime = habit.updatedAt.getTime();
    if (incomingTime < storedTime) {
      return formatHabit(habit);
    }
  }

  if (body.name !== undefined) habit.name = body.name;
  if (body.description !== undefined) habit.description = body.description;
  if (body.icon !== undefined) habit.icon = body.icon;
  if (body.color !== undefined) habit.color = body.color;
  if (body.repeatType !== undefined) habit.repeatType = body.repeatType;
  if (body.repeatDays !== undefined) habit.repeatDays = body.repeatDays;

  await habit.save();
  return formatHabit(habit);
}

export async function deleteHabit(userId: string, habitId: string): Promise<boolean> {
  const result = await Habit.deleteOne({ _id: habitId, userId });
  return result.deletedCount > 0;
}

/**
 * Check-in a habit for a given date.
 * IDEMPOTENT: If the date is already in checkIns[], returns the current habit unchanged.
 * Streak is recomputed from the full checkIns[] array.
 */
export async function checkIn(userId: string, habitId: string, body: CheckInBody): Promise<HabitResponse | null> {
  const habit = await Habit.findOne({ _id: habitId, userId });
  if (!habit) return null;

  const { date } = body;

  // Idempotency: date already checked in → return current state, no change
  if (habit.checkIns.includes(date)) {
    return formatHabit(habit);
  }

  // Add the date and keep array sorted descending
  habit.checkIns.push(date);
  habit.checkIns.sort((a, b) => (a > b ? -1 : 1));

  // Recompute streak from the full history
  habit.streak = computeStreak(habit.checkIns);

  await habit.save();
  return formatHabit(habit);
}
