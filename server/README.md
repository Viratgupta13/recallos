# RecallOS API (backend)

Node.js + Express + Prisma (SQLite) backend for RecallOS. Implements the 28
endpoints the frontend's service layer expects, with real auth, spaced-repetition
scheduling (SM-2), and a deterministic keyword-based recall grader. No LLM yet —
topic extraction, question generation and AI grading are a later milestone.

## Run

```bash
cd server
npm install
npm run setup   # prisma generate + db push + seed the demo dataset
npm run dev     # starts http://localhost:4000 (watch mode)
```

Then run the frontend (in the project root) with `.env.local` pointing at the API:

```
VITE_API_BASE_URL=http://localhost:4000
```

Demo login: `aryan@example.com` / `password123`.

Delete the root `.env.local` to make the frontend fall back to in-browser mock data.

## Scripts

- `npm run dev` — start the API in watch mode (tsx)
- `npm run start` — start the API once
- `npm run setup` — generate client, push schema, seed
- `npm run seed` — reseed the demo dataset (wipes and reinserts)

## Environment (`server/.env`)

- `DATABASE_URL` — SQLite file URL (default `file:./dev.db`)
- `JWT_SECRET` — token signing secret (change in production)
- `PORT` — API port (default 4000)
- `CORS_ORIGIN` — comma-separated allowed origins (frontend dev URLs)

## What's implemented

- **Auth** — register/login (bcrypt + JWT), `/auth/me`, logout. 7-day tokens.
- **Materials** — CRUD + `extract-topics` (links existing topics; no LLM).
- **Topics / Questions** — read + `?topicId=` filter, scoped to the user.
- **Revision** — `today` (due topics by risk), `history`, create `session`,
  `session/:id/questions`.
- **Recall** — `POST /recall/attempt` grades the answer (keyword/stem overlap
  against the question's concepts), stores the attempt, and advances the topic's
  memory state via SM-2; keeps the session's running average and completion.
- **Memory / Forgetting radar** — per-topic memory strength + risk ranking.
- **Analytics** — knowledge health, due count, average recall, streak, category
  performance, 8-day recall trend, strong/weak areas — all computed from the DB.
- **Placement / Interview** — seeded question banks.

## Architecture

```
server/
  prisma/schema.prisma   # SQLite schema (string arrays stored as JSON)
  prisma/seed.ts         # demo dataset (user, materials, topics, questions, memory)
  src/index.ts           # Express app + route mounting
  src/auth.ts            # JWT sign + requireAuth middleware
  src/lib/grade.ts       # deterministic recall grader
  src/lib/scheduler.ts   # SM-2 spaced repetition + forgetting-risk model
  src/lib/serialize.ts   # DB rows -> frontend API shapes
  src/routes/*.ts        # one router per domain
```
