import { Task, ITask } from './task.model';
import { CreateTaskBody, UpdateTaskBody, TaskResponse } from './task.types';

function formatTask(task: ITask): TaskResponse {
  return {
    id: task._id.toString(),
    title: task.title,
    description: task.description,
    status: task.status as 'pending' | 'completed',
    dueDate: task.dueDate ? task.dueDate.toISOString() : undefined,
    time: task.time,
    category: task.category,
    createdAt: task.createdAt.toISOString(),
    updatedAt: task.updatedAt.toISOString(),
  };
}

export async function getTasks(userId: string): Promise<TaskResponse[]> {
  const tasks = await Task.find({ userId }).sort({ updatedAt: -1 });
  return tasks.map(formatTask);
}

export async function createTask(userId: string, body: CreateTaskBody): Promise<TaskResponse> {
  const task = await Task.create({
    title: body.title,
    description: body.description,
    dueDate: body.dueDate ? new Date(body.dueDate) : undefined,
    time: body.time,
    category: body.category,
    status: 'pending',
    userId,
  });
  return formatTask(task);
}

export async function updateTask(
  userId: string,
  taskId: string,
  body: UpdateTaskBody
): Promise<TaskResponse | null> {
  const task = await Task.findOne({ _id: taskId, userId });

  if (!task) return null;

  // Idempotency: if client sends updatedAt, only update if incoming is newer
  if (body.updatedAt) {
    const incomingTime = new Date(body.updatedAt).getTime();
    const storedTime = task.updatedAt.getTime();
    if (incomingTime < storedTime) {
      // Server has a newer version — return current state without updating
      return formatTask(task);
    }
  }

  // Apply updates
  if (body.title !== undefined) task.title = body.title;
  if (body.description !== undefined) task.description = body.description;
  if (body.status !== undefined) task.status = body.status;
  if (body.dueDate !== undefined) task.dueDate = body.dueDate ? new Date(body.dueDate) : undefined;
  if (body.time !== undefined) task.time = body.time;
  if (body.category !== undefined) task.category = body.category;

  await task.save();
  return formatTask(task);
}

export async function deleteTask(userId: string, taskId: string): Promise<boolean> {
  const result = await Task.deleteOne({ _id: taskId, userId });
  return result.deletedCount > 0;
}
