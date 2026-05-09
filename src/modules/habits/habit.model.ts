import mongoose, { Document, Schema } from 'mongoose';

export interface IHabit extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  checkIns: string[];         // ISO date strings e.g. ["2026-05-05", "2026-05-04"]
  streak: number;
  icon?: string;
  color?: string;
  repeatType?: 'daily' | 'weekdays' | 'custom';
  repeatDays?: number[];
  userId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const habitSchema = new Schema<IHabit>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    checkIns: {
      type: [String],
      default: [],
    },
    streak: {
      type: Number,
      default: 0,
    },
    icon: {
      type: String,
    },
    color: {
      type: String,
    },
    repeatType: {
      type: String,
      enum: ['daily', 'weekdays', 'custom'],
    },
    repeatDays: {
      type: [Number],
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for fetching user habits sorted by updatedAt
habitSchema.index({ userId: 1, updatedAt: -1 });

export const Habit = mongoose.model<IHabit>('Habit', habitSchema);
