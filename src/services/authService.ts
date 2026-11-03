import type { User, LoginRequest, RegisterRequest, AuthTokens } from '@/types';
import { mockUser } from '@/data/mockData';

const USE_MOCK = !import.meta.env.VITE_API_BASE_URL;

const delay = (ms = 600) => new Promise(resolve => setTimeout(resolve, ms));

// ─── Auth Service ─────────────────────────────────────────────────────────────

export const authService = {
  async login(data: LoginRequest): Promise<{ user: User; token: string }> {
    if (USE_MOCK) {
      await delay(800);
      if (data.email === 'aryan@example.com' && data.password === 'password123') {
        const token = 'mock-jwt-token-' + Date.now();
        return { user: mockUser, token };
      }
      throw new Error('Invalid email or password');
    }
    const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Login failed');
    }
    const json = await res.json() as { user: User; tokens: AuthTokens };
    return { user: json.user, token: json.tokens.accessToken };
  },

  async register(data: RegisterRequest): Promise<{ user: User; token: string }> {
    if (USE_MOCK) {
      await delay(1000);
      const newUser: User = {
        ...mockUser,
        id: 'user-' + Date.now(),
        name: data.name,
        email: data.email,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      const token = 'mock-jwt-token-' + Date.now();
      return { user: newUser, token };
    }
    const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Registration failed');
    }
    const json = await res.json() as { user: User; tokens: AuthTokens };
    return { user: json.user, token: json.tokens.accessToken };
  },

  async logout(): Promise<void> {
    if (USE_MOCK) {
      await delay(200);
      return;
    }
    const token = localStorage.getItem('recall_access_token');
    await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/logout`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  async getMe(): Promise<User> {
    if (USE_MOCK) {
      await delay(300);
      return mockUser;
    }
    const token = localStorage.getItem('recall_access_token');
    const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('Failed to fetch user');
    return res.json() as Promise<User>;
  },
};
