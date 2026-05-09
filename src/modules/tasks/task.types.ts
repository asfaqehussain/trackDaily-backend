export type TaskStatus = 'pending' | 'completed';

export interface CreateTaskBody {
  title: string;
  description?: string;
  dueDate?: string;
  time?: string;
  category?: string;
}

export interface UpdateTaskBody {
  title?: string;
  description?: string;
  dueDate?: string;
  status?: TaskStatus;
  time?: string;
  category?: string;
  updatedAt?: string; // Client sends this for conflict resolution
}

// Shape returned to the React Native client — matches task.types.ts
export interface TaskResponse {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  dueDate?: string;
  time?: string;
  category?: string;
  createdAt: string;
  updatedAt: string;
}
