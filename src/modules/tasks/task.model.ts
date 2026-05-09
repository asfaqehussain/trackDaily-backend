import mongoose, { Document, Schema } from 'mongoose';

export interface ITask extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  status: 'pending' | 'completed';
  dueDate?: Date;
  time?: string;
  category?: string;
  userId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const taskSchema = new Schema<ITask>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ['pending', 'completed'],
      default: 'pending',
    },
    dueDate: {
      type: Date,
    },
    time: {
      type: String, // "HH:MM" display format — stored as string
    },
    category: {
      type: String,
      trim: true,
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

// Compound index for fetching user tasks sorted by updatedAt
taskSchema.index({ userId: 1, updatedAt: -1 });

export const Task = mongoose.model<ITask>('Task', taskSchema);
