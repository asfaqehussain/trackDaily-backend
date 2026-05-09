import { updateTask, deleteTask } from '../tasks/task.service';
import { checkIn, deleteHabit } from '../habits/habit.service';
import { CreateTaskBody, UpdateTaskBody } from '../tasks/task.types';
import { CreateHabitBody } from '../habits/habit.types';
import { Task } from '../tasks/task.model';
import { Habit } from '../habits/habit.model';

interface TaskSyncItem {
  id?: string;
  action: 'upsert' | 'delete';
  payload?: UpdateTaskBody & CreateTaskBody;
}

interface HabitCheckInItem {
  habitId: string;
  date: string;
}

interface HabitSyncItem {
  id?: string;
  action: 'delete' | 'checkin' | 'upsert';
  payload?: HabitCheckInItem & Partial<CreateHabitBody>;
}

interface SyncPayload {
  tasks?: TaskSyncItem[];
  habits?: HabitSyncItem[];
}

interface SyncResult {
  tasks: { synced: number; failed: number; errors: string[] };
  habits: { synced: number; failed: number; errors: string[] };
}

export async function processBatchSync(userId: string, payload: SyncPayload): Promise<SyncResult> {
  const result: SyncResult = {
    tasks: { synced: 0, failed: 0, errors: [] },
    habits: { synced: 0, failed: 0, errors: [] },
  };

  // ── Task sync ────────────────────────────────────────────────────────────
  if (Array.isArray(payload.tasks)) {
    for (const item of payload.tasks) {
      try {
        if (item.action === 'delete' && item.id) {
          await deleteTask(userId, item.id);
        } else if (item.action === 'upsert' && item.payload) {
          if (item.id) {
            // Update existing — idempotent via updatedAt
            await updateTask(userId, item.id, item.payload);
          } else {
            // Create new task
            const task = await Task.create({
              title: item.payload.title,
              description: item.payload.description,
              dueDate: item.payload.dueDate ? new Date(item.payload.dueDate) : undefined,
              time: item.payload.time,
              category: item.payload.category,
              status: 'pending',
              userId,
            });
            void task; // created
          }
        }
        result.tasks.synced++;
      } catch (err) {
        result.tasks.failed++;
        result.tasks.errors.push((err as Error).message);
      }
    }
  }

  // ── Habit sync ───────────────────────────────────────────────────────────
  if (Array.isArray(payload.habits)) {
    for (const item of payload.habits) {
      try {
        if (item.action === 'delete' && item.id) {
          await deleteHabit(userId, item.id);
        } else if (item.action === 'checkin' && item.payload) {
          await checkIn(userId, item.payload.habitId, { date: item.payload.date });
        } else if (item.action === 'upsert' && item.payload) {
          if (!item.id) {
            await Habit.create({
              name: (item.payload as unknown as CreateHabitBody).name,
              userId,
              checkIns: [],
              streak: 0,
            });
          }
        }
        result.habits.synced++;
      } catch (err) {
        result.habits.failed++;
        result.habits.errors.push((err as Error).message);
      }
    }
  }

  return result;
}
