# Smart Task & Habit Tracker API

Production-ready REST API backend for tracking tasks, habits, and productivity statistics. Built with Express, TypeScript, and MongoDB.

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express 4
- **Language:** TypeScript
- **Database:** MongoDB (Mongoose ODM)
- **Auth:** JWT (bcryptjs + jsonwebtoken)
- **Email:** Nodemailer (Gmail SMTP)
- **Validation:** express-validator

## Prerequisites

- Node.js >= 18
- MongoDB instance (local or Atlas)

## Getting Started

```bash
# 1. Clone the repo
git clone <repo-url>
cd smart-task-habit-tracker-api

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret

# 4. Start development server
npm run dev
```

Server starts at `http://localhost:3000`.

## Environment Variables

| Variable        | Required | Default                | Description                     |
|-----------------|----------|------------------------|----------------------------------|
| `PORT`          | No       | `3000`                 | Server port                     |
| `MONGO_URI`     | Yes      | —                      | MongoDB connection string       |
| `JWT_SECRET`    | Yes      | —                      | Secret key for signing tokens   |
| `JWT_EXPIRES_IN`| No       | `7d`                   | Token expiration duration       |
| `EMAIL_USER`    | No       | —                      | Gmail address for SMTP          |
| `EMAIL_PASS`    | No       | —                      | Gmail app password              |
| `CLIENT_URL`    | No       | `http://localhost:3000` | Base URL for email links        |

## Scripts

| Command           | Description                         |
|-------------------|-------------------------------------|
| `npm run dev`     | Start dev server with hot reload    |
| `npm run build`   | Compile TypeScript to `dist/`       |
| `npm start`       | Run compiled production build       |
| `npm run lint`    | Lint source files with ESLint       |

## API Endpoints

| Prefix    | Module        | Auth Required | Description               |
|-----------|---------------|---------------|---------------------------|
| `/auth`   | Authentication| No (mostly)   | Register, login, verify   |
| `/tasks`  | Tasks         | Yes           | CRUD for tasks            |
| `/habits` | Habits        | Yes           | CRUD for habits           |
| `/sync`   | Sync          | Yes           | Offline data sync         |
| `/stats`  | Stats         | Yes           | Productivity statistics   |
| `/health` | Health Check  | No            | Server health             |

## Project Structure

```
src/
├── app.ts                     # Express app setup & route mounting
├── server.ts                  # Entry point — DB connect + listen
├── seed.ts                    # Database seeder
├── config/
│   ├── db.ts                  # MongoDB connection
│   └── env.ts                 # Environment variable loader
├── middlewares/
│   ├── auth.middleware.ts      # JWT authentication guard
│   └── error.middleware.ts     # Error handling & 404
├── modules/
│   ├── auth/                  # Authentication module
│   ├── tasks/                 # Task CRUD module
│   ├── habits/                # Habit tracking module
│   ├── sync/                  # Offline sync module
│   └── stats/                 # Statistics module
├── services/
│   ├── email.service.ts       # Email sender (Nodemailer)
│   └── token.service.ts       # JWT helpers
└── utils/
    └── response.ts            # Standardized API response helper
```

## License

ISC
