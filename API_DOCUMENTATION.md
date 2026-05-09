# Smart Task & Habit Tracker API Documentation

Base URL: `http://localhost:3000`

---

## Table of Contents
1. [Health Check](#health-check)
2. [Authentication](#authentication)
3. [Tasks](#tasks)
4. [Habits](#habits)
5. [Sync](#sync)
6. [Stats / Insights](#stats--insights)

---

## Health Check

### GET `/health`

Check if server is running. No auth required.

#### Request
```bash
curl http://localhost:3000/health
```

#### Response (200)
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2026-05-06T16:58:00.000Z"
}
```

#### TypeScript Type
```typescript
interface HealthResponse {
  success: boolean;
  message: string;
  timestamp: string;
}
```

---

## Authentication

### POST `/auth/signup`

Register a new user account.

#### Request Body
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | `string` | Yes | Display name |
| `email` | `string` | Yes | Valid email |
| `password` | `string` | Yes | Min 6 characters |

#### Request
```bash
curl -X POST http://localhost:3000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John",
    "email": "john@example.com",
    "password": "secret123"
  }'
```

#### Response (201)
```json
{
  "success": true,
  "data": {
    "token": "eyJhbG...",
    "user": {
      "id": "69fa...",
      "email": "john@example.com",
      "name": "John",
      "isVerified": false
    }
  },
  "message": "Account created. Please verify your email."
}
```

#### TypeScript Types
```typescript
interface SignupBody {
  name: string;
  email: string;
  password: string;
}

interface AuthUser {
  id: string;
  email: string;
  name: string;
  isVerified: boolean;
}

interface AuthResponse {
  token: string;
  user: AuthUser;
}
```

---

### POST `/auth/login`

Login and receive JWT token.

#### Request Body
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `email` | `string` | Yes | Registered email |
| `password` | `string` | Yes | Account password |

#### Request
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "secret123"
  }'
```

#### Response (200)
```json
{
  "success": true,
  "data": {
    "token": "eyJhbG...",
    "user": {
      "id": "69fa...",
      "email": "john@example.com",
      "name": "John",
      "isVerified": true
    }
  },
  "message": "Login successful"
}
```

---

### GET `/auth/verify-email`

Verify email address via link token.

#### Query Parameters
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `token` | `string` | Yes | Email verification token |

#### Request
```bash
curl "http://localhost:3000/auth/verify-email?token=abc123..."
```

#### Response (200)
```json
{
  "success": true,
  "message": "Email verified successfully. You can now log in."
}
```

---

### POST `/auth/verify-email`

Resend verification email (triggered from RN app).

#### Request Body
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `email` | `string` | Yes | Email to resend to |

#### Request
```bash
curl -X POST http://localhost:3000/auth/verify-email \
  -H "Content-Type: application/json" \
  -d '{"email": "john@example.com"}'
```

#### Response (200)
```json
{
  "success": true,
  "message": "If that email exists and is unverified, a new link has been sent."
}
```

---

## Tasks

**Auth required for all endpoints.** Include header: `Authorization: Bearer <token>`

### GET `/tasks`

Get all tasks for current user.

#### Request
```bash
curl http://localhost:3000/tasks \
  -H "Authorization: Bearer <token>"
```

#### Response (200)
```json
{
  "success": true,
  "data": [
    {
      "id": "69fa...",
      "title": "Buy groceries",
      "description": "Milk, eggs, bread",
      "status": "pending",
      "dueDate": "2026-05-10T00:00:00.000Z",
      "time": "10:00",
      "category": "errands",
      "createdAt": "2026-05-06T07:21:54.250Z",
      "updatedAt": "2026-05-06T07:21:54.250Z"
    }
  ],
  "message": "OK"
}
```

#### TypeScript Type
```typescript
type TaskStatus = 'pending' | 'completed';

interface TaskResponse {
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
```

---

### POST `/tasks`

Create a new task.

#### Request Body
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | `string` | Yes | Task title |
| `description` | `string` | No | Optional description |
| `dueDate` | `string` | No | ISO date or YYYY-MM-DD |
| `time` | `string` | No | HH:MM format |
| `category` | `string` | No | Category tag |

#### Request
```bash
curl -X POST http://localhost:3000/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "title": "Buy groceries",
    "description": "Milk, eggs, bread",
    "dueDate": "2026-05-10",
    "category": "errands"
  }'
```

#### Response (201)
```json
{
  "success": true,
  "data": { /* TaskResponse object */ },
  "message": "Task created"
}
```

---

### PATCH `/tasks/:id`

Update an existing task. Only sends changed fields.

#### Request Body
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | `string` | No | Updated title |
| `description` | `string` | No | Updated description |
| `dueDate` | `string` | No | Updated due date |
| `status` | `string` | No | `pending` or `completed` |
| `time` | `string` | No | Updated time |
| `category` | `string` | No | Updated category |
| `updatedAt` | `string` | No | Client timestamp for conflict resolution |

#### Request
```bash
curl -X PATCH http://localhost:3000/tasks/<task_id> \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "status": "completed",
    "updatedAt": "2026-05-06T16:00:00.000Z"
  }'
```

#### Response (200)
```json
{
  "success": true,
  "data": { /* Updated TaskResponse */ },
  "message": "Task updated"
}
```

---

### DELETE `/tasks/:id`

Delete a task.

#### Request
```bash
curl -X DELETE http://localhost:3000/tasks/<task_id> \
  -H "Authorization: Bearer <token>"
```

#### Response (200)
```json
{
  "success": true,
  "message": "Task deleted"
}
```

---

## Habits

**Auth required for all endpoints.** Include header: `Authorization: Bearer <token>`

### GET `/habits`

Get all habits for current user.

#### Request
```bash
curl http://localhost:3000/habits \
  -H "Authorization: Bearer <token>"
```

#### Response (200)
```json
{
  "success": true,
  "data": [
    {
      "id": "69fa...",
      "name": "Morning run",
      "description": "5k run",
      "checkIns": ["2026-05-06", "2026-05-05"],
      "streak": 2,
      "icon": "🏃",
      "color": "#4CAF50",
      "repeatType": "daily",
      "repeatDays": [],
      "createdAt": "2026-05-06T11:10:13.178Z",
      "updatedAt": "2026-05-06T11:11:20.605Z"
    }
  ],
  "message": "OK"
}
```

#### TypeScript Types
```typescript
interface HabitResponse {
  id: string;
  name: string;
  description?: string;
  checkIns: string[];
  streak: number;
  icon?: string;
  color?: string;
  repeatType?: 'daily' | 'weekdays' | 'custom';
  repeatDays?: number[];
  createdAt: string;
  updatedAt: string;
}
```

---

### POST `/habits`

Create a new habit.

#### Request Body
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | `string` | Yes | Habit name |
| `description` | `string` | No | Description |
| `icon` | `string` | No | Emoji/icon identifier |
| `color` | `string` | No | Hex color code |
| `repeatType` | `string` | No | `daily`, `weekdays`, or `custom` |
| `repeatDays` | `number[]` | No | Days of week for custom (0=Sun, 6=Sat) |

#### Request
```bash
curl -X POST http://localhost:3000/habits \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "name": "Morning run",
    "icon": "",
    "color": "#4CAF50",
    "repeatType": "daily"
  }'
```

#### Response (201)
```json
{
  "success": true,
  "data": { /* HabitResponse */ },
  "message": "Habit created"
}
```

---

### PATCH `/habits/:id`

Update habit details.

#### Request Body
Same fields as `POST /habits`, all optional. Plus `updatedAt` for conflict resolution.

#### Request
```bash
curl -X PATCH http://localhost:3000/habits/<habit_id> \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "name": "Evening run",
    "updatedAt": "2026-05-06T16:00:00.000Z"
  }'
```

#### Response (200)
```json
{
  "success": true,
  "data": { /* Updated HabitResponse */ },
  "message": "Habit updated"
}
```

---

### DELETE `/habits/:id`

Delete a habit.

#### Request
```bash
curl -X DELETE http://localhost:3000/habits/<habit_id> \
  -H "Authorization: Bearer <token>"
```

#### Response (200)
```json
{
  "success": true,
  "message": "Habit deleted"
}
```

---

### POST `/habits/:id/checkin`

Record a check-in for a specific date. Idempotent (safe to retry).

#### Request Body
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `date` | `string` | Yes | YYYY-MM-DD format |

#### Request
```bash
curl -X POST http://localhost:3000/habits/<habit_id>/checkin \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"date": "2026-05-06"}'
```

#### Response (200)
```json
{
  "success": true,
  "data": {
    /* HabitResponse with updated checkIns and streak */
  },
  "message": "Check-in recorded"
}
```

---

## Sync

### POST `/sync`

Batch sync offline operations from mobile client.

#### Auth
Requires `Authorization: Bearer <token>`

#### Request Body Structure
```typescript
interface SyncRequest {
  tasks: {
    toCreate: CreateTaskBody[];
    toUpdate: { id: string; data: UpdateTaskBody }[];
  };
  habits: {
    toCreate: CreateHabitBody[];
    toUpdate: { id: string; data: UpdateHabitBody }[];
  };
}
```

#### Request
```bash
curl -X POST http://localhost:3000/sync \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "tasks": {
      "toCreate": [],
      "toUpdate": []
    },
    "habits": {
      "toCreate": [],
      "toUpdate": []
    }
  }'
```

#### Response (200)
```json
{
  "success": true,
  "data": {
    "tasks": { "synced": 5, "conflicts": 0 },
    "habits": { "synced": 2, "conflicts": 0 }
  },
  "message": "Sync complete — tasks: 5 synced, habits: 2 synced"
}
```

---

## Stats / Insights

### GET `/stats`

Get aggregated user statistics for the Insights screen.

#### Auth
Requires `Authorization: Bearer <token>`

#### Query Parameters
| Param | Type | Default | Options |
|-------|------|---------|---------|
| `period` | `string` | `week` | `week`, `month`, `year` |

#### Request
```bash
# This week
curl "http://localhost:3000/stats" \
  -H "Authorization: Bearer <token>"

# This month
curl "http://localhost:3000/stats?period=month" \
  -H "Authorization: Bearer <token>"

# This year
curl "http://localhost:3000/stats?period=year" \
  -H "Authorization: Bearer <token>"
```

#### Response (200)
```json
{
  "success": true,
  "data": {
    "period": "week",
    "tasksDone": 23,
    "tasksDoneChange": "+18%",
    "bestStreak": 38,
    "habitConsistency": 78,
    "avgPerDay": 4.2,
    "dailyTasks": [
      { "date": "2026-04-30", "count": 3 },
      { "date": "2026-05-01", "count": 4 },
      { "date": "2026-05-02", "count": 2 },
      { "date": "2026-05-03", "count": 5 },
      { "date": "2026-05-04", "count": 3 },
      { "date": "2026-05-05", "count": 4 },
      { "date": "2026-05-06", "count": 2 }
    ],
    "habitBreakdown": [
      { "id": "69fa...", "name": "Read 20 minutes", "consistency": 86 },
      { "id": "69fb...", "name": "Drink 8 glasses water", "consistency": 71 },
      { "id": "69fc...", "name": "Morning workout", "consistency": 92 },
      { "id": "69fd...", "name": "Meditate", "consistency": 100 }
    ],
    "totalHabits": 4,
    "pendingTasks": 12
  },
  "message": "OK"
}
```

#### TypeScript Types
```typescript
type StatsPeriod = 'week' | 'month' | 'year';

interface DailyTask {
  date: string;
  count: number;
}

interface HabitBreakdown {
  id: string;
  name: string;
  consistency: number;
}

interface StatsData {
  period: StatsPeriod;
  tasksDone: number;
  tasksDoneChange: string;
  bestStreak: number;
  habitConsistency: number;
  avgPerDay: number;
  dailyTasks: DailyTask[];
  habitBreakdown: HabitBreakdown[];
  totalHabits: number;
  pendingTasks: number;
}
```

#### React Native Usage Example
```typescript
// api/stats.ts
export async function fetchStats(token: string, period: StatsPeriod = 'week') {
  const res = await fetch(`http://localhost:3000/stats?period=${period}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to fetch stats');
  const json = await res.json();
  return json.data as StatsData;
}

// StatsScreen.tsx
const [stats, setStats] = useState<StatsData | null>(null);
const [period, setPeriod] = useState<StatsPeriod>('week');

useEffect(() => {
  fetchStats(token, period).then(setStats);
}, [period]);

// UI Mapping:
// - tasksDoneChange: render directly (string like "+18%")
// - habitConsistency: global percentage (0-100)
// - dailyTasks: map to chart x/y coordinates
// - habitBreakdown: render progress bars list
// - totalHabits / pendingTasks: profile summary badges
```

---

## Error Responses

All endpoints may return these error formats:

### 400 Bad Request
```json
{
  "success": false,
  "message": "Validation error message"
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Invalid or expired token"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Internal server error"
}
```

---

## Implementation Notes

1. **Auth Header**: All routes except `/health` and `/auth/*` require `Authorization: Bearer <token>`.
2. **Task Status**: Use `'pending'` or `'completed'` exactly as strings.
3. **Habit Streak**: Computed live on server. Client should not calculate locally.
4. **Stats Percentages**: `tasksDoneChange` is a formatted string (`+18%`), do not parse as number. `habitConsistency` is capped at `100`.
5. **Date Formats**: API returns ISO strings. Client should parse and display in user's locale.
6. **Sync Endpoint**: Designed for offline-first mobile apps. Send all queued operations in one request.
7. **Conflict Resolution**: `updatedAt` field in PATCH requests enables last-write-wins resolution.
