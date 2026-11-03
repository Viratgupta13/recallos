import type { AnalyticsOverview } from '@/types';
import { mockAnalytics } from '@/data/mockData';
import { api } from './api';

const USE_MOCK = !import.meta.env.VITE_API_BASE_URL;
const delay = (ms = 500) => new Promise(resolve => setTimeout(resolve, ms));

export const analyticsService = {
  async getOverview(): Promise<AnalyticsOverview> {
    if (USE_MOCK) { await delay(); return mockAnalytics; }
    return api.get<AnalyticsOverview>('/analytics/overview');
  },
};
