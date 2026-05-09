import mongoose from 'mongoose';
import { connectDB } from './config/db';
import { User } from './modules/auth/auth.model';
import { Task } from './modules/tasks/task.model';
import { Habit } from './modules/habits/habit.model';

async function seed() {
  await connectDB();

  const email = 'asfaqeh@yopmail.com';
  const user = await User.findOne({ email });

  if (!user) {
    console.error(`[Seed] User ${email} not found. Please sign up first!`);
    process.exit(1);
  }

  const userId = user._id;

  // Clear existing data for this user to start fresh
  await Task.deleteMany({ userId });
  await Habit.deleteMany({ userId });

  const now = new Date();
  const dates: string[] = [];
  for (let i = 0; i < 10; i++) {
    const d = new Date();
    d.setDate(now.getDate() - i);
    dates.push(d.toISOString().split('T')[0]);
  }

  console.log(`[Seed] Generating data for user: ${email} (${userId})`);

  // ── Seed Habits ──────────────────────────────────────────────────────────
  const habits = [
    { name: 'Drink 2L Water', icon: 'water', color: '#3498db', progress: 0.9 },
    { name: 'Morning Meditation', icon: 'leaf', color: '#2ecc71', progress: 0.6 },
    { name: 'Reading', icon: 'book', color: '#9b59b6', progress: 0.4 },
  ];

  for (const h of habits) {
    const checkIns = dates.filter(() => Math.random() < h.progress);

    // Sort checkins for streak calculation
    checkIns.sort((a, b) => (a > b ? -1 : 1));

    await Habit.create({
      name: h.name,
      icon: h.icon,
      color: h.color,
      userId,
      checkIns,
      streak: checkIns.length > 0 ? Math.floor(Math.random() * 5) + 1 : 0,
      repeatType: 'daily',
    });
  }

  // ── Seed Tasks ───────────────────────────────────────────────────────────
  const taskTitles = [
    'Update Portfolio', 'Buy Groceries', 'Gym Session',
    'Call Mom', 'Fix Bug #123', 'Project Planning',
    'Laundry', 'Pay Rent', 'Team Meeting', 'Doctor Appointment'
  ];

  for (let i = 0; i < 10; i++) {
    const taskDate = new Date();
    taskDate.setDate(now.getDate() - i);

    await Task.create({
      title: taskTitles[i],
      status: Math.random() > 0.3 ? 'completed' : 'pending',
      dueDate: taskDate,
      userId,
      category: i % 2 === 0 ? 'Work' : 'Personal',
    });
  }

  console.log('[Seed] ✅ Successfully seeded 10 days of history!');
  mongoose.connection.close();
}

seed().catch(err => {
  console.error('[Seed] ❌ Error:', err);
  process.exit(1);
});
