import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { authRouter } from './routes/auth.js';
import { materialsRouter } from './routes/materials.js';
import { topicsRouter } from './routes/topics.js';
import { questionsRouter } from './routes/questions.js';
import { revisionRouter } from './routes/revision.js';
import { recallRouter } from './routes/recall.js';
import { memoryRouter } from './routes/memory.js';
import { analyticsRouter } from './routes/analytics.js';
import { forgettingRouter } from './routes/forgetting.js';
import { placementRouter, interviewRouter } from './routes/placement.js';

const app = express();
const PORT = Number(process.env.PORT) || 4000;
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:5173';

app.use(cors({ origin: CORS_ORIGIN.split(',').map((s) => s.trim()) }));
app.use(express.json({ limit: '1mb' }));

app.get('/health', (_req, res) => res.json({ ok: true, service: 'recallos-api' }));

app.use('/auth', authRouter);
app.use('/materials', materialsRouter);
app.use('/topics', topicsRouter);
app.use('/questions', questionsRouter);
app.use('/revision', revisionRouter);
app.use('/recall', recallRouter);
app.use('/memory', memoryRouter);
app.use('/analytics', analyticsRouter);
app.use('/forgetting-radar', forgettingRouter);
app.use('/placement', placementRouter);
app.use('/interview', interviewRouter);

// 404 + error handlers.
app.use((_req, res) => res.status(404).json({ message: 'Not found' }));
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({ message: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`RecallOS API listening on http://localhost:${PORT}`);
});
