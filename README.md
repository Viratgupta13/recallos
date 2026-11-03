# RecallOS

A placement-focused spaced-repetition learning app. It tracks how well you remember
each topic, flags what you are about to forget, and quizzes you with active-recall
questions — backed by a real API with an SM-2 spaced-repetition scheduler.

> Status: in progress. The React frontend and a real Node/Express + SQLite backend run
> end-to-end. Topic extraction, question generation, answer grading and the forgetting-risk
> model are deterministic (no LLM yet) — a classical NLP/ML layer is the planned next milestone.

## Features

- **Auth** — register / login with bcrypt password hashing and JWT-protected routes.
- **Learning inbox** — add study notes by typing, pasting, or **importing a PDF** (text
  extracted in the browser).
- **Topic & question generation** — notes are turned into topics, each with recall
  questions and key concepts (deterministic keyword/phrase extraction).
- **Revision engine** — a daily plan of the topics that are actually due, by forgetting risk.
- **Answer evaluation** — typed answers are scored by concept coverage, with
  "remembered" vs "missing" concepts.
- **Memory & scheduler** — an SM-2 scheduler updates each topic's memory strength and
  next-review date after every attempt.
- **Forgetting radar** — per-topic risk (low / medium / high) from memory strength and how
  overdue the review is.
- **Dashboard & analytics** — knowledge health, due count, average recall, streak, recall
  trend and strong / weak areas.

## Tech stack

**Frontend:** React 19, TypeScript, Vite, Tailwind CSS, React Router, Zustand,
React Hook Form + Zod, Recharts, pdf.js.

**Backend:** Node.js, Express, TypeScript, Prisma ORM, SQLite, JWT, bcrypt. The SM-2
scheduler and the keyword recall grader are hand-written (no LLM).

**Planned:** classical NLP/ML layer (TF-IDF topic extraction, CS-subject mapping,
cosine-similarity grading, logistic-regression risk), Postgres, and deployment.

## Run it locally

Requires Node.js 18+.

**1. Backend** (from `server/`):

```bash
cd server
cp .env.example .env
npm install
npm run setup   # generate Prisma client, create the DB, seed demo data
npm run dev     # http://localhost:4000
```

**2. Frontend** (from the project root, in another terminal):

```bash
npm install
echo "VITE_API_BASE_URL=http://localhost:4000" > .env.local
npm run dev     # http://localhost:5173
```

Demo login: `aryan@example.com` / `password123`.

> Remove `.env.local` (or leave `VITE_API_BASE_URL` empty) to run the frontend on built-in
> mock data, without the backend.

## Project structure

```
src/        React app (pages, components, services, stores, types)
server/     Express + Prisma API
  src/routes/     one router per domain (auth, materials, revision, recall, ...)
  src/lib/        grader, SM-2 scheduler, topic/question generator
  prisma/         schema + seed
```

---

© 2026 Virat Gupta. **All rights reserved.** Code is public for viewing only; reuse needs written permission.
