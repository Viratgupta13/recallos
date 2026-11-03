import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../prisma.js';
import { signToken, requireAuth, type AuthedRequest } from '../auth.js';
import { toUser } from '../lib/serialize.js';

export const authRouter = Router();

authRouter.post('/login', async (req, res) => {
  const { email, password } = req.body ?? {};
  if (!email || !password) return res.status(400).json({ message: 'Email and password are required' });

  const user = await prisma.user.findUnique({ where: { email: String(email).toLowerCase() } });
  if (!user) return res.status(401).json({ message: 'Invalid email or password' });

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ message: 'Invalid email or password' });

  const token = signToken(user.id);
  res.json({ user: toUser(user), tokens: { accessToken: token } });
});

authRouter.post('/register', async (req, res) => {
  const { name, email, password, confirmPassword } = req.body ?? {};
  if (!name || !email || !password) return res.status(400).json({ message: 'Name, email and password are required' });
  if (confirmPassword !== undefined && password !== confirmPassword)
    return res.status(400).json({ message: 'Passwords do not match' });

  const existing = await prisma.user.findUnique({ where: { email: String(email).toLowerCase() } });
  if (existing) return res.status(409).json({ message: 'An account with this email already exists' });

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { name, email: String(email).toLowerCase(), passwordHash },
  });

  const token = signToken(user.id);
  res.status(201).json({ user: toUser(user), tokens: { accessToken: token } });
});

authRouter.post('/logout', (_req, res) => {
  // Stateless JWT: client discards the token. Endpoint exists for symmetry.
  res.status(204).end();
});

authRouter.get('/me', requireAuth, async (req: AuthedRequest, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.userId } });
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json(toUser(user));
});
