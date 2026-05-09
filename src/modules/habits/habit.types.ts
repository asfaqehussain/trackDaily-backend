export interface CreateHabitBody {
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  repeatType?: 'daily' | 'weekdays' | 'custom';
  repeatDays?: number[];
}

export interface UpdateHabitBody {
  name?: string;
  description?: string;
  icon?: string;
  color?: string;
  repeatType?: 'daily' | 'weekdays' | 'custom';
  repeatDays?: number[];
  updatedAt?: string; // For conflict resolution
}

export interface CheckInBody {
  date: string; // ISO date "YYYY-MM-DD"
}

// Shape returned to the React Native client — matches habit.types.ts
export interface HabitResponse {
  id: string;
  name: string;
  description?: string;
  checkIns: string[];      // ISO date strings
  streak: number;
  icon?: string;
  color?: string;
  repeatType?: 'daily' | 'weekdays' | 'custom';
  repeatDays?: number[];
  createdAt: string;
  updatedAt: string;
}
